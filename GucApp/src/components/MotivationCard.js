// NAIM Iteration 3 — Static text content display — 7kg
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '../theme/colors';

const quotes = [
  { text: '"Küçük başla, büyük düşün, hızlı hareket et."', author: 'Naim Süleymanoğlu' },
  { text: '"Her şampiyonluk, küçük bir kaldırışla başlar."', author: 'NAIM Felsefesi' },
  { text: '"Bırakmak yok. 15 dakikan var, kullan."', author: 'NAIM Coach' },
];

export default function MotivationCard({ quoteIndex = 0 }) {
  const quote = quotes[quoteIndex % quotes.length];

  return (
    <View style={styles.card}>
      <Text style={styles.quoteIcon}>"</Text>
      <Text style={styles.quoteText}>{quote.text}</Text>
      <Text style={styles.author}>— {quote.author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  quoteIcon: {
    fontSize: 48,
    color: colors.accent,
    lineHeight: 40,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeights.extrabold,
  },
  quoteText: {
    fontSize: typography.fontSizes.lg,
    color: colors.text.inverse,
    lineHeight: 26,
    marginBottom: spacing.sm,
    fontStyle: 'italic',
  },
  author: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
    textAlign: 'right',
    fontWeight: typography.fontWeights.medium,
  },
});
