import { useColorScheme } from 'react-native';

export interface ThemeColors {
  background: string;       // Default background (e.g. white or dark gray)
  primaryBackground: string; // The yellow/orange background for launch/auth screens
  text: string;             // Default text
  textMuted: string;        // Muted/gray text
  primary: string;          // Main brand color (Deep Orange)
  secondary: string;        // Secondary brand color (Yellow)
  surface: string;          // Cards, modal backgrounds
  border: string;           // Dividers, borders
  inputBackground: string;  // Background for text inputs
  inputText: string;        // Text color for inputs
  error: string;            // Error messages
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  primaryBackground: '#F7C653', // Yellow from Launch/Auth screens
  text: '#333333',
  textMuted: '#666666',
  primary: '#E85D22',
  secondary: '#FFD166',
  surface: '#FAFAFA',
  border: '#EEEEEE',
  inputBackground: '#F5F5F5',
  inputText: '#333333',
  error: '#FF0000',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  primaryBackground: '#1A1A1A', // Dark variant for Launch/Auth screens
  text: '#FFFFFF',
  textMuted: '#AAAAAA',
  primary: '#E85D22',
  secondary: '#FFD166',
  surface: '#1E1E1E',
  border: '#333333',
  inputBackground: '#2A2A2A',
  inputText: '#FFFFFF',
  error: '#FF5A5F',
};

export const useThemeColors = (): ThemeColors => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark' ? darkColors : lightColors;
};
