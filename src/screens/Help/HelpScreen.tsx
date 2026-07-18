import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useThemeColors, ThemeColors } from '../../theme/colors';

type HelpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Help'>;

export default function HelpScreen() {
  const navigation = useNavigation<HelpScreenNavigationProp>();
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Yellow Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
              <Image source={require('../../assets/back.png')} style={styles.backIconImg} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Help</Text>
            <View style={styles.backBtn} />
          </View>
        </View>

        {/* White Content Section */}
        <View style={styles.contentSection}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            <Text style={styles.description}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent pellentesque congue lorem, vel tincidunt tortor.
            </Text>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('Support')}
            >
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>Help with the order</Text>
                <Text style={styles.menuItemSubtitle}>Support</Text>
              </View>
              <Image source={require('../../assets/next.png')} style={styles.chevronImg} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => navigation.navigate('HelpCenter')}
            >
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>Help center</Text>
                <Text style={styles.menuItemSubtitle}>General Information</Text>
              </View>
              <Image source={require('../../assets/next.png')} style={styles.chevronImg} />
            </TouchableOpacity>

            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7D055', 
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary, 
  },
  headerSection: {
    backgroundColor: '#F7D055',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30, 
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIconImg: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  contentSection: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 25,
  },
  description: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 40,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  chevronImg: {
    width: 14,
    height: 14,
    resizeMode: 'contain',
    tintColor: colors.primary,
  }
});
