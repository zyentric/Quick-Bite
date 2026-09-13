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
import TermsAndConditionsScreen from '../screens/ProfileMenu/Settings/TermsAndConditionsScreen';
import PrivacyPolicyScreen from '../screens/ProfileMenu/Settings/PrivacyPolicyScreen';
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
import OrderDetailsScreen from '../screens/ProfileMenu/MyOrders/OrderDetailsScreen';
import FoodMenuScreen from '../screens/FoodMenu/FoodMenuScreen';
import FoodDetailsScreen from '../screens/FoodMenu/FoodDetailsScreen';
import BestSellerScreen from '../screens/Home/BestSellerScreen';
import RecommendationsScreen from '../screens/Home/RecommendationsScreen';
import FavoritesScreen from '../screens/Home/FavoritesScreen'; // trigger TS reload
import HelpScreen from '../screens/Help/HelpScreen';
import SupportScreen from '../screens/Help/SupportScreen';
import HelpCenterScreen from '../screens/Help/HelpCenterScreen'; // Forced reload
import ShopkeeperDashboardScreen from '../screens/Shopkeeper/ShopkeeperDashboardScreen';
import DeliveryDashboardScreen from '../screens/Home/DeliveryDashboardScreen';
import DeliveryOrderDetailsScreen from '../screens/Home/DeliveryOrderDetailsScreen';
import ShopkeeperOrderDetailsScreen from '../screens/Shopkeeper/ShopkeeperOrderDetailsScreen';
import ChatScreen from '../screens/Chat/ChatScreen';
import { useCart } from '../context/CartContext';
import { useThemeColors } from '../theme/colors';
import Icons from '../constants/icons';
import CustomBottomTabBar from '../components/navigation/CustomBottomTabBar';
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
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomBottomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="FoodMenu" component={FoodMenuScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={MyOrdersScreen} />
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
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="OrderConfirmed" component={OrderConfirmedScreen} />
        <Stack.Screen name="DeliveryTime" component={DeliveryTimeScreen} />
        <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
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
        
        {/* Shopkeeper Screens */}
        <Stack.Screen name="ShopkeeperDashboard" component={ShopkeeperDashboardScreen} />
        <Stack.Screen name="ShopkeeperOrderDetails" component={ShopkeeperOrderDetailsScreen} />

        {/* Delivery Man Screens */}
        <Stack.Screen name="DeliveryDashboard" component={DeliveryDashboardScreen} />
        <Stack.Screen name="DeliveryOrderDetails" component={DeliveryOrderDetailsScreen} />

        {/* In-App Live Order Chat */}
        <Stack.Screen name="Chat" component={ChatScreen} />

        {/* Global Filter Screen */}
        <Stack.Screen name="Filter" component={FilterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
