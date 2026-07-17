import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { UserProvider } from './src/context/UserContext';

function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
