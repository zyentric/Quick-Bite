import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { UserProvider, useUser } from './src/context/UserContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { ToastProvider, useToast } from './src/context/ToastContext';
import { wsService } from './src/services/WebSocketService';

function SocketBridge() {
  const { userProfile, userId, role, isAuthenticated } = useUser();
  const { showToast } = useToast();

  useEffect(() => {
    wsService.setToastHandler(showToast);
  }, [showToast]);

  useEffect(() => {
    const activeId = userId || userProfile?.id || userProfile?._id;
    if (isAuthenticated && activeId) {
      const activeRole = (userProfile?.role as string) || role || 'customer';
      wsService.connect(activeId, activeRole);
    } else {
      wsService.disconnect();
    }
  }, [isAuthenticated, userId, userProfile, role]);

  return null;
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ToastProvider>
          <UserProvider>
            <SocketBridge />
            <CartProvider>
              <FavoritesProvider>
                <AppNavigator />
              </FavoritesProvider>
            </CartProvider>
          </UserProvider>
        </ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
