// NAIM Iteration 2 — Basic color scheme / theme — 5kg
// NAIM Iteration 5 — Dark mode support added — 10kg

export const lightColors = {
  primary: '#C0392B',      // Güç kırmızısı (Naim'in bayrağı)
  primaryDark: '#922B21',
  primaryLight: '#E74C3C',
  secondary: '#2C3E50',    // Derin lacivert
  accent: '#F39C12',       // Altın sarısı (şampiyonluk)
  background: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceRaised: '#F0F3F6',
  text: {
    primary: '#2C3E50',
    secondary: '#7F8C8D',
    inverse: '#FFFFFF',
    muted: '#BDC3C7',
  },
  border: '#E8ECEF',
  success: '#27AE60',
  warning: '#F39C12',
  error: '#E74C3C',
};

export const darkColors = {
  primary: '#E74C3C',
  primaryDark: '#C0392B',
  primaryLight: '#FF6B5B',
  secondary: '#1A252F',
  accent: '#F39C12',
  background: '#0D1117',
  surface: '#161B22',
  surfaceRaised: '#1C2128',
  text: {
    primary: '#E6EDF3',
    secondary: '#8B949E',
    inverse: '#FFFFFF',
    muted: '#484F58',
  },
  border: '#21262D',
  success: '#3FB950',
  warning: '#D29922',
  error: '#F85149',
};

// Default export for backwards compatibility
export const colors = lightColors;

export const typography = {
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    xxxl: 34,
  },
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 18,
  full: 999,
};
