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
  rating?: number;
  category?: string;
  customizations?: {
    title: string;
    options: { id: string; name: string; price: number }[];
  }[];
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface DeliveryAddress {
  id?: string;
  _id?: string;
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
  address?: string;
  isDefault?: boolean;
}

export interface OrderItemDish {
  id?: string;
  _id?: string;
  name?: string;
  price?: number;
  originalPrice?: number;
  image?: string;
  description?: string;
  category?: string;
  rating?: number;
}

export interface RawOrderItem {
  menuItem?: OrderItemDish;
  quantity: number;
  price?: number;
  name?: string;
}

export interface DeliveryPartnerProfile {
  id?: string;
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
  avatar?: string;
  vehicleType?: 'Motorcycle' | 'Scooter' | 'Electric Bike' | 'Bicycle' | string;
  vehicleNumber?: string;
  rating?: number | string;
  currentLocation?: {
    latitude?: number;
    longitude?: number;
    address?: string;
    updatedAt?: string | Date;
  };
}

export interface ShopkeeperProfile {
  id?: string;
  _id?: string;
  name?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
}

export interface CustomerOrderSummary {
  id: string;
  _id?: string;
  orderNumber?: string;
  name?: string;
  itemsSummary?: string;
  rawItems?: RawOrderItem[];
  items?: RawOrderItem[];
  date?: string;
  createdAt?: string;
  itemsCount?: number;
  price?: number;
  totalAmount?: number;
  image?: string;
  status:
    | 'PendingPayment'
    | 'Placed'
    | 'Accepted'
    | 'Preparing'
    | 'ReadyForPickup'
    | 'OutForDelivery'
    | 'Delivered'
    | 'Cancelled'
    | string;
  deliveryAddress?: DeliveryAddress;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed' | string;
  deliveryPin?: string;
  deliveryMan?: DeliveryPartnerProfile;
  shopkeeper?: ShopkeeperProfile;
}

export interface FilterOptions {
  category?: string;
  sortBy?: 'popular' | 'rating' | 'price_asc' | 'price_desc' | 'fast_delivery';
  dietary?: 'all' | 'veg' | 'non_veg' | 'vegan';
  minRating?: number;
  maxPrice?: number;
  subCategories?: string[];
  freeDeliveryOnly?: boolean;
  offersOnly?: boolean;
}

export type RootStackParamList = {
  Launch: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  SetPassword: undefined;
  Fingerprint: undefined;
  MainTabs: { screen: 'Home' | 'FoodMenu' | 'Favorites' | 'Orders' | 'Help'; params?: Record<string, unknown> } | undefined;
  ProfileMenu: undefined;
  MyProfile: undefined;
  DeliveryAddress: undefined;
  AddNewAddress: { addressToEdit?: DeliveryAddress; editIndex?: number } | undefined;
  PaymentMethods: undefined;
  AddCard: undefined;
  ContactUs: undefined;
  HelpFAQ: undefined;
  Settings: undefined;
  NotificationSetting: undefined;
  PasswordSetting: undefined;
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
  Notifications: undefined;
  Cart: undefined;
  Checkout: { selectedAddress?: DeliveryAddress } | undefined;
  Payment: {
    selectedAddress?: DeliveryAddress;
    deliveryFee?: number;
    taxAndFees?: number;
    finalTotal?: number;
    estimatedDeliveryTime?: number;
  } | undefined;
  OrderConfirmed: { orderId?: string; destLat?: number; destLng?: number; addressLabel?: string; initialPin?: string };
  DeliveryTime: { orderId?: string; destLat?: number; destLng?: number; addressLabel?: string; initialPin?: string };
  Filter: {
    initialCategory?: string;
    initialFilters?: Partial<FilterOptions>;
    onApply?: (filters: FilterOptions) => void;
  } | undefined;
  MyOrders: undefined;
  OrderDetails: { orderId: string; initialOrder?: CustomerOrderSummary };
  CancelOrder: { orderId: string };
  CancelSuccess: undefined;
  LeaveReview: { orderId?: string; orderName?: string; orderImage?: string };
  RestaurantDetails: { restaurant: Restaurant };
  FoodMenu: {
    category?: string;
    sort?: 'popular' | 'price_asc' | 'price_desc';
    maxPrice?: number;
    minRating?: number;
    dietary?: string;
    subCategory?: string;
  } | undefined;
  FoodDetails: { item: MenuItem };
  BestSeller: undefined;
  Recommendations: undefined;
  Favorites: undefined;
  Help: undefined;
  Support: undefined;
  HelpCenter: undefined;

  // Shopkeeper Specific
  ShopkeeperDashboard: undefined;
  ShopkeeperOrderDetails: { orderId: string };

  // Delivery Man Specific
  DeliveryDashboard: undefined;
  DeliveryOrderDetails: { orderId: string; initialOrder?: any };

  // In-App Chat
  Chat: {
    orderId: string;
    orderNumber?: string;
    recipientId?: string;
    recipientName: string;
    recipientRole: 'customer' | 'shopkeeper' | 'delivery_man';
  };
};
