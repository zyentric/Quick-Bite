// Central icon registry for all PNG assets in src/assets
// Usage: import Icons from '../constants/icons'; 
//   then: <Image source={Icons.home} style={{ width: 24, height: 24 }} />

const Icons = {
  // Navigation / Tab Bar
  home: require('../assets/home.png'),
  spoons: require('../assets/spoons.png'),       // Food Menu tab
  favorite: require('../assets/favorite.png'),
  list: require('../assets/list.png'),            // Orders tab
  support: require('../assets/support.png'),      // Help tab

  // Header / Topbar
  cart: require('../assets/cart.png'),
  notification: require('../assets/notification.png'),
  notificationOutlined: require('../assets/notificationoutlined.png'),
  user: require('../assets/user.png'),
  settings: require('../assets/settings.png'),

  // Food Categories
  snacks: require('../assets/snacks.png'),
  meal: require('../assets/spoons.png'),
  vegan: require('../assets/vegan.png'),
  dessert: require('../assets/dessert.png'),
  drinks: require('../assets/drinks.png'),

  // Profile Menu Items
  order: require('../assets/order.png'),
  myProfile: require('../assets/myprofile.png'),
  location: require('../assets/location.png'),
  card: require('../assets/card.png'),
  contacts: require('../assets/contacts.png'),
  message: require('../assets/message.png'),
  logout: require('../assets/logout.png'),

  // Role Avatars / Illustrations
  deliverymen: require('../assets/deliverymen.png'),

  // UI Elements
  back: require('../assets/back.png'),
  next: require('../assets/next.png'),
  star: require('../assets/star.png'),

  // Social Auth
  google: require('../assets/google.png'),
  facebook: require('../assets/facebook.png'),
  fingerprint: require('../assets/fingerprint.png'),
};

export default Icons;
