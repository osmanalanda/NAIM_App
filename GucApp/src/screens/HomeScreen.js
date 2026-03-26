// NAIM Iteration 1 — Single screen with app title and description — 5kg
// NAIM Iteration 4 — Simple button with alert/action — 10kg
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { colors, typography, spacing, radius } from '../theme/colors';
import MotivationCard from '../components/MotivationCard';
import StatsBadge from '../components/StatsBadge';

export default function HomeScreen() {
  const [totalKg, setTotalKg] = useState(27);  // 5+5+7+10 = 27kg lifted so far
  const [quoteIndex, setQuoteIndex] = useState(0);

  // NAIM Iteration 4 — Simple button with alert/action
  const handleStartSession = () => {
    Alert.alert(
      '🏋️ NAIM Seansı Başlıyor!',
      'Kronometren başladı. 15 dakikan var.\n\nHangi özelliği build edeceksin?',
      [
        { text: 'Warm-Up (5-10 kg)', onPress: () => handleFeatureSelect('Warm-Up') },
        { text: 'Working Set (10-15 kg)', onPress: () => handleFeatureSelect('Working Set') },
        { text: 'Iptal', style: 'cancel' },
      ]
    );
  };

  const handleFeatureSelect = (level) => {
    Alert.alert(
      '⏱️ 15 Dakika Başladı!',
      `${level} seçtin. Şimdi build et, test et, commit et!\n\nBaşarılar! 💪`,
      [{ text: 'NAIM Gibi! 🏆', style: 'default' }]
    );
  };

  const handleNewQuote = () => {
    setQuoteIndex((prev) => prev + 1);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header — Iteration 1: App title & description */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.appIcon}>🏋️</Text>
            <View>
              <Text style={styles.appTitle}>GücApp</Text>
              <Text style={styles.appSubtitle}>NAIM Agentic Iterative Mobile</Text>
            </View>
          </View>
          <Text style={styles.appDescription}>
            Her iterasyon bir kaldırış. Her özellik ağırlık.{'\n'}
            Küçük başla, büyük kaldır. Cep Herkülü gibi.
          </Text>
        </View>

        {/* Stats — Iteration 3: Static text content display */}
        <View style={styles.statsRow}>
          <StatsBadge label="Toplam" value={totalKg} unit="kg" />
          <StatsBadge label="İterasyon" value={4} unit="/" />
          <StatsBadge label="Süre" value={60} unit="dk" />
        </View>

        {/* Weight Class Badge */}
        <View style={styles.classContainer}>
          <Text style={styles.classLabel}>⚡ Sınıf</Text>
          <Text style={styles.className}>Lightweight</Text>
          <Text style={styles.classRange}>0–30 kg • Getting started</Text>
        </View>

        {/* Motivation Card — Iteration 3 */}
        <Text style={styles.sectionTitle}>Günün Motivasyonu</Text>
        <MotivationCard quoteIndex={quoteIndex} />

        <TouchableOpacity style={styles.quoteButton} onPress={handleNewQuote} activeOpacity={0.8}>
          <Text style={styles.quoteButtonText}>Yeni Söz 🔄</Text>
        </TouchableOpacity>

        {/* NAIM Loop Info — Iteration 3 */}
        <Text style={styles.sectionTitle}>NAIM Döngüsü</Text>
        <View style={styles.loopCard}>
          {[
            { step: '1', icon: '💭', label: 'Düşün', desc: 'Hangi özellik? (2 dk)' },
            { step: '2', icon: '🎨', label: 'Tasarla', desc: 'Stitch ile UI' },
            { step: '3', icon: '💻', label: 'Kodla', desc: 'Claude Code ile build' },
            { step: '4', icon: '🧪', label: 'Test Et', desc: 'Çalışıyor mu?' },
            { step: '5', icon: '📝', label: 'Logla', desc: 'MOBILE.md güncelle' },
            { step: '6', icon: '🚀', label: 'Commit', desc: 'Push to GitHub' },
          ].map((item) => (
            <View key={item.step} style={styles.loopStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumText}>{item.step}</Text>
              </View>
              <Text style={styles.stepIcon}>{item.icon}</Text>
              <View style={styles.stepInfo}>
                <Text style={styles.stepLabel}>{item.label}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* CTA Button — Iteration 4: Simple button with alert/action */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={handleStartSession}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>🏋️ Seans Başlat</Text>
          <Text style={styles.ctaSubtext}>15 dakikan başlıyor...</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Powered by Claude Code CLI • AIgile Mobile</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  // Header
  header: {
    backgroundColor: colors.primary,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  appIcon: {
    fontSize: 42,
    marginRight: spacing.md,
  },
  appTitle: {
    fontSize: typography.fontSizes.xxxl,
    fontWeight: typography.fontWeights.extrabold,
    color: colors.text.inverse,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  appDescription: {
    fontSize: typography.fontSizes.md,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 22,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  // Weight Class
  classContainer: {
    backgroundColor: colors.secondary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  classLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  className: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extrabold,
    color: colors.accent,
    marginVertical: 2,
  },
  classRange: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.muted,
  },
  // Sections
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md,
  },
  // Quote button
  quoteButton: {
    alignSelf: 'center',
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  quoteButtonText: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
    fontSize: typography.fontSizes.sm,
  },
  // Loop Card
  loopCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loopStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumText: {
    color: '#fff',
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.bold,
  },
  stepIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
    width: 28,
    textAlign: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  stepDesc: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  // CTA Button
  ctaButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.md,
    marginTop: spacing.xl,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaText: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.extrabold,
    color: '#fff',
  },
  ctaSubtext: {
    fontSize: typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: typography.fontSizes.xs,
    color: colors.text.muted,
  },
});
