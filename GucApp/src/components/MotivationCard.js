// NAIM Iteration 3 — Static text content display — 7kg
// NAIM Iteration 5 — Dark mode support — 10kg
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

const quotes = [
  { text: '"Küçük başla, büyük düşün, hızlı hareket et."', author: 'Naim Süleymanoğlu' },
  { text: '"Her şampiyonluk, küçük bir kaldırışla başlar."', author: 'NAIM Felsefesi' },
  { text: '"Bırakmak yok. 15 dakikan var, kullan."', author: 'NAIM Coach' },
  { text: '"Commit early, commit often. Her satır bir adım."', author: 'GücApp Ruhu' },
  { text: '"Mükemmel uygulamayı bekleme — çalışan uygulamayı gönder."', author: 'Agile Manifesto' },
  { text: '"Code is like lifting: consistency beats intensity."', author: 'NAIM Wisdom' },
];

export default function MotivationCard({ quoteIndex = 0 }) {
  const { colors, typography, spacing, radius } = useTheme();
  const s = makeStyles(colors, typography, spacing, radius);
  const quote = quotes[quoteIndex % quotes.length];

  return (
    <View style={s.card}>
      <Text style={s.quoteIcon}>"</Text>
      <Text style={s.quoteText}>{quote.text}</Text>
      <Text style={s.author}>— {quote.author}</Text>
    </View>
  );
}

function makeStyles(colors, typography, spacing, radius) {
  return StyleSheet.create({
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
      color: 'rgba(255,255,255,0.65)',
      textAlign: 'right',
      fontWeight: typography.fontWeights.medium,
    },
  });
}
