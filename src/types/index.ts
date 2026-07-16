export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  description: string;
  image?: string;
  rating?: number; // added for food menu cards
  category?: string;
  customizations?: {
    title: string;
    options: { id: string; name: string; price: number }[];
  }[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export type RootStackParamList = {
  Launch: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  SetPassword: undefined;
  Fingerprint: undefined;
  MainTabs: undefined;
  ProfileMenu: undefined;
  MyProfile: undefined;
  DeliveryAddress: undefined;
  AddNewAddress: undefined;
  PaymentMethods: undefined;
  AddCard: undefined;
  ContactUs: undefined;
  HelpFAQ: undefined;
  Settings: undefined;
  NotificationSetting: undefined;
  PasswordSetting: undefined;
  Notifications: undefined;
  Cart: undefined;
  Checkout: undefined;
  Payment: undefined;
  OrderConfirmed: undefined;
  DeliveryTime: undefined;
  Filter: undefined;
  MyOrders: undefined;
  CancelOrder: undefined;
  CancelSuccess: undefined;
  LeaveReview: undefined;
  RestaurantDetails: { restaurant: Restaurant };
  FoodMenu: undefined;
  FoodDetails: { item: MenuItem };
  BestSeller: undefined;
  Recommendations: undefined;
  Favorites: undefined;
  Help: undefined;
  Support: undefined;
  HelpCenter: undefined;
};
