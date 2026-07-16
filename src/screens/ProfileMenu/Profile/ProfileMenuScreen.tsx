import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Dimensions, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useThemeColors, ThemeColors } from '../../../theme/colors';

const { width } = Dimensions.get('window');

type ProfileMenuNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileMenu'>;

const menuItems = [
  { id: '1', title: 'My Orders', icon: '🛍️', screen: 'Orders' }, // We can route to existing/dummy screens later
  { id: '2', title: 'My Profile', icon: '👤', screen: 'ProfileMenu' },
  { id: '3', title: 'Delivery Address', icon: '📍', screen: 'ProfileMenu' },
  { id: '4', title: 'Payment Methods', icon: '💳', screen: 'ProfileMenu' },
  { id: '5', title: 'Contact Us', icon: '📞', screen: 'ProfileMenu' },
  { id: '6', title: 'Help & FAQs', icon: '💬', screen: 'ProfileMenu' },
  { id: '7', title: 'Settings', icon: '⚙️', screen: 'ProfileMenu' },
];

export default function ProfileMenuScreen() {
  const navigation = useNavigation<ProfileMenuNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = () => {
    setLogoutModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* The main container has a light peach background.
          The left side has the back button. */}
      
      <View style={styles.leftColumn}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>{'<'}</Text>
        </TouchableOpacity>
      </View>

      {/* The large curved orange container */}
      <View style={styles.rightCurvedContainer}>
        
        {/* User Info Header */}
        <View style={styles.userInfoSection}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2574&auto=format&fit=crop' }} 
            style={styles.avatar} 
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>John Smith</Text>
            <Text style={styles.userEmail}>Loremipsum@email.com</Text>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.menuScrollContent}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem} 
              activeOpacity={0.7}
              onPress={() => {
                if (item.screen === 'Orders') {
                  navigation.navigate('MyOrders');
                } else if (item.screen === 'ProfileMenu' && item.title === 'My Profile') {
                  navigation.navigate('MyProfile');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Delivery Address') {
                  navigation.navigate('DeliveryAddress');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Payment Methods') {
                  navigation.navigate('PaymentMethods');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Contact Us') {
                  navigation.navigate('ContactUs');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Help & FAQs') {
                  navigation.navigate('HelpFAQ');
                } else if (item.screen === 'ProfileMenu' && item.title === 'Settings') {
                  navigation.navigate('Settings');
                } else {
                  console.log('Navigate to', item.screen);
                }
              }}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <View style={styles.separator} />
              </View>
            </TouchableOpacity>
          ))}

          {/* Log Out */}
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={handleLogout}>
            <View style={styles.iconContainer}>
              <Text style={styles.menuIcon}>🚪</Text>
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Log Out</Text>
              <View style={styles.separator} />
            </View>
          </TouchableOpacity>
        </ScrollView>
        
        {/* Bottom Home Icon Decorator */}
        <View style={styles.bottomHomeIcon}>
          <Text style={styles.homeIconText}>🏠</Text>
        </View>
      </View>

      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Are you sure you want{'\n'}to log out?</Text>
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnConfirm} onPress={confirmLogout}>
                <Text style={styles.modalBtnConfirmText}>Yes, logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDD7C4', // Light peach/orange background from mockup
    flexDirection: 'row', // Align left column and right container side-by-side
  },
  leftColumn: {
    width: width * 0.15, // 15% width for the back button area
    paddingTop: 40,
    alignItems: 'center',
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary, // Orange arrow
    fontWeight: 'bold',
  },
  rightCurvedContainer: {
    flex: 1, // Takes up the remaining 85% width
    backgroundColor: colors.primary, // Solid orange background
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    overflow: 'hidden',
    paddingTop: 60, // Padding from top
    paddingBottom: 20,
  },
  userInfoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
  },
  menuScrollContent: {
    paddingHorizontal: 30,
    paddingBottom: 60, // Space for the bottom decorator
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15, // Spacing between items
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuTextContainer: {
    flex: 1,
    justifyContent: 'center',
    height: 40, // Match icon height for perfect alignment
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Thin white line
    width: '100%',
  },
  bottomHomeIcon: {
    position: 'absolute',
    bottom: -20, // Slightly hidden off-screen bottom
    left: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent circle
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeIconText: {
    fontSize: 24,
    color: '#fff',
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    padding: 30,
    borderRadius: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 30,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: colors.inputBackground, // Light peach/yellow
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalBtnConfirm: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 25,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalBtnConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
