import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { UserProvider } from './src/context/UserContext';
import { ThemeProvider } from './src/context/ThemeContext';

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <UserProvider>
          <CartProvider>
            <AppNavigator />
          </CartProvider>
        </UserProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
