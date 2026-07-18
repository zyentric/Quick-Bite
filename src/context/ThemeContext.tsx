import React, { createContext, useContext, useState, useEffect } from 'react';
import storage from '../utils/storage';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextData {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextData>({
  themePreference: 'system',
  setThemePreference: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemeState] = useState<ThemePreference>('system');

  useEffect(() => {
    const loadTheme = async () => {
      const stored = await storage.getItem('@theme_pref');
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeState(stored as ThemePreference);
      }
    };
    loadTheme();
  }, []);

  const setThemePreference = async (pref: ThemePreference) => {
    setThemeState(pref);
    await storage.setItem('@theme_pref', pref);
  };

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
