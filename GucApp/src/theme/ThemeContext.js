// NAIM Iteration 5 — Dark Mode Toggle — ThemeContext — 10kg
import React, { createContext, useContext, useState } from 'react';
import { lightColors, darkColors, typography, spacing, radius } from './colors';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const theme = {
    isDark,
    toggleTheme: () => setIsDark((d) => !d),
    colors: isDark ? darkColors : lightColors,
    typography,
    spacing,
    radius,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
