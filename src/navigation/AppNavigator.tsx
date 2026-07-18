import React from 'react';
import { View, Text, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LaunchScreen from '../screens/Launch/LaunchScreen';
import WelcomeScreen from '../screens/Welcome/WelcomeScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import SetPasswordScreen from '../screens/Auth/SetPasswordScreen';
import FingerprintScreen from '../screens/Auth/FingerprintScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import RestaurantDetailsScreen from '../screens/RestaurantDetails/RestaurantDetailsScreen';
import CartScreen from '../screens/Cart/CartScreen';
import ProfileMenuScreen from '../screens/ProfileMenu/Profile/ProfileMenuScreen';
import MyProfileScreen from '../screens/ProfileMenu/MyProfile/MyProfileScreen';
import DeliveryAddressScreen from '../screens/ProfileMenu/DeliveryAddress/DeliveryAddressScreen';
import AddNewAddressScreen from '../screens/ProfileMenu/DeliveryAddress/AddNewAddressScreen';
import PaymentMethodsScreen from '../screens/ProfileMenu/PaymentMethod/PaymentMethodsScreen';
import AddCardScreen from '../screens/ProfileMenu/PaymentMethod/AddCardScreen';

import SettingsScreen from '../screens/ProfileMenu/Settings/SettingsScreen';
import NotificationSettingScreen from '../screens/ProfileMenu/Settings/NotificationSettingScreen';
import PasswordSettingScreen from '../screens/ProfileMenu/Settings/PasswordSettingScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import FilterScreen from '../screens/Search/FilterScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import PaymentScreen from '../screens/Checkout/PaymentScreen';
import OrderConfirmedScreen from '../screens/Checkout/OrderConfirmedScreen';
import DeliveryTimeScreen from '../screens/Checkout/DeliveryTimeScreen';
import MyOrdersScreen from '../screens/ProfileMenu/MyOrders/MyOrdersScreen';
import CancelOrderScreen from '../screens/ProfileMenu/MyOrders/CancelOrderScreen';
import CancelSuccessScreen from '../screens/ProfileMenu/MyOrders/CancelSuccessScreen';
import LeaveReviewScreen from '../screens/ProfileMenu/MyOrders/LeaveReviewScreen';
import FoodMenuScreen from '../screens/FoodMenu/FoodMenuScreen';
import FoodDetailsScreen from '../screens/FoodMenu/FoodDetailsScreen';
import BestSellerScreen from '../screens/Home/BestSellerScreen';
import RecommendationsScreen from '../screens/Home/RecommendationsScreen';
import FavoritesScreen from '../screens/Home/FavoritesScreen'; // trigger TS reload
import HelpScreen from '../screens/Help/HelpScreen';
import SupportScreen from '../screens/Help/SupportScreen';
import HelpCenterScreen from '../screens/Help/HelpCenterScreen'; // Forced reload
import { useCart } from '../context/CartContext';
import { useThemeColors } from '../theme/colors';
import Icons from '../constants/icons';
import { RootStackParamList } from '../types';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator<RootStackParamList>();
const HomeStackNav = createNativeStackNavigator();

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNav.Screen name="BestSeller" component={BestSellerScreen} />
      <HomeStackNav.Screen name="Recommendations" component={RecommendationsScreen} />
      <HomeStackNav.Screen name="FoodDetails" component={FoodDetailsScreen} />
      <HomeStackNav.Screen name="Filter" component={FilterScreen} />
    </HomeStackNav.Navigator>
  );
}

// Dummy placeholder components for tabs that don't exist yet
const DummyScreen = () => <View style={{flex: 1, backgroundColor: '#fff'}} />;

function MainTabs() {
  const { totalItems } = useCart();
  const colors = useThemeColors();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Hide labels as per mockup
        tabBarActiveTintColor: '#FFFFFF', // White icon when active
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)', // Translucent white when inactive
        tabBarStyle: {
          backgroundColor: colors.primary, // Orange background
          borderTopWidth: 0,
          borderTopLeftRadius: 25, // Mockup has rounded top corners
          borderTopRightRadius: 25,
          position: 'absolute', // To allow rounded corners to show nicely over content
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 65,
          paddingBottom: 10,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeStack} 
        options={{ tabBarIcon: ({ color }) => <Image source={Icons.home} style={{ width: 20, height: 20, tintColor: color }} /> }}
      />
      <Tab.Screen 
        name="FoodMenu" 
        component={FoodMenuScreen} 
        options={{ tabBarIcon: ({ color }) => <Image source={Icons.spoons} style={{ width: 20, height: 20, tintColor: color }} /> }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen} 
        options={{ tabBarIcon: ({ color }) => <Image source={Icons.favorite} style={{ width: 20, height: 20, tintColor: color }} /> }}
      />
      <Tab.Screen 
        name="Orders"
        component={MyOrdersScreen}
        options={{ tabBarIcon: ({ color }) => <Image source={Icons.list} style={{ width: 20, height: 20, tintColor: color }} /> }}
      />
      <Tab.Screen 
        name="Help" 
        component={HelpScreen} 
        options={{ tabBarIcon: ({ color }) => <Image source={Icons.support} style={{ width: 20, height: 20, tintColor: color }} /> }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const colors = useThemeColors();

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Launch" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Launch" component={LaunchScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
        <Stack.Screen name="Fingerprint" component={FingerprintScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ProfileMenu" component={ProfileMenuScreen} />
        <Stack.Screen name="MyProfile" component={MyProfileScreen} />
        <Stack.Screen name="DeliveryAddress" component={DeliveryAddressScreen} />
        <Stack.Screen name="AddNewAddress" component={AddNewAddressScreen} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
        <Stack.Screen name="AddCard" component={AddCardScreen} />

        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="NotificationSetting" component={NotificationSettingScreen} />
        <Stack.Screen name="PasswordSetting" component={PasswordSettingScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
        <Stack.Screen name="DeliveryTime" component={DeliveryTimeScreen} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen name="CancelOrder" component={CancelOrderScreen} />
        <Stack.Screen name="CancelSuccess" component={CancelSuccessScreen} />
        <Stack.Screen name="LeaveReview" component={LeaveReviewScreen} />
        <Stack.Screen name="FoodMenu" component={FoodMenuScreen} />
        <Stack.Screen name="FoodDetails" component={FoodDetailsScreen} />
        <Stack.Screen name="BestSeller" component={BestSellerScreen} />
        <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        <Stack.Screen 
          name="RestaurantDetails" 
          component={RestaurantDetailsScreen} 
          options={{ 
            headerShown: true, 
            title: '',
            headerBackVisible: false,
            headerTintColor: colors.text,
            headerShadowVisible: false,
            headerStyle: { backgroundColor: colors.background }
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
