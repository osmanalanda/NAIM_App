// NAIM Iteration 3 — Static text content display — 7kg (ek bileşen)
// NAIM Iteration 5 — Dark mode support — 10kg
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export default function StatsBadge({ label, value, unit }) {
  const { colors, typography, spacing, radius } = useTheme();
  const s = makeStyles(colors, typography, spacing, radius);

  return (
    <View style={s.badge}>
      <Text style={s.value}>{value}</Text>
      <Text style={s.unit}>{unit}</Text>
      <Text style={s.label}>{label}</Text>
    </View>
  );
}

function makeStyles(colors, typography, spacing, radius) {
  return StyleSheet.create({
    badge: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 90,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    value: {
      fontSize: typography.fontSizes.xxl,
      fontWeight: typography.fontWeights.extrabold,
      color: colors.primary,
    },
    unit: {
      fontSize: typography.fontSizes.sm,
      color: colors.text.secondary,
      fontWeight: typography.fontWeights.medium,
      marginTop: -2,
    },
    label: {
      fontSize: typography.fontSizes.xs,
      color: colors.text.muted,
      marginTop: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
}
