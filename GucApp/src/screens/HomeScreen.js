// NAIM Iteration 1  — Single screen with app title and description — 5kg
// NAIM Iteration 4  — Simple button with alert/action — 10kg
// NAIM Iteration 5  — Dark mode toggle — 10kg
// NAIM Iteration 6  — Live session countdown timer — 15kg
// NAIM Iteration 7  — Lift log with text input — 15kg
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import MotivationCard from '../components/MotivationCard';
import StatsBadge from '../components/StatsBadge';

// ─── Weight class helper ───────────────────────────────────────────────────
function getWeightClass(kg) {
  if (kg <= 30)  return { name: 'Lightweight',      range: '0–30 kg',    emoji: '🥉', color: '#7F8C8D' };
  if (kg <= 75)  return { name: 'Middleweight',     range: '31–75 kg',   emoji: '🥈', color: '#95A5A6' };
  if (kg <= 150) return { name: 'Heavyweight',      range: '76–150 kg',  emoji: '🥇', color: '#F39C12' };
  if (kg <= 250) return { name: 'Super Heavyweight', range: '151–250 kg', emoji: '🏆', color: '#E67E22' };
  return         { name: 'World Record',            range: '250+ kg',    emoji: '🌍', color: '#C0392B' };
}

// ─── Timer helpers ─────────────────────────────────────────────────────────
const SESSION_SECS = 15 * 60; // 15 minutes

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function timerColor(secs, colors) {
  const pct = secs / SESSION_SECS;
  if (pct > 0.5) return colors.success;
  if (pct > 0.25) return colors.warning;
  return colors.error;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { colors, typography, spacing, radius, isDark, toggleTheme } = useTheme();
  const s = makeStyles(colors, typography, spacing, radius);

  // ── Iteration 1 / 4 state ──
  const [totalKg, setTotalKg]       = useState(67);   // 5+5+7+10+10+15+15 = 67kg
  const [quoteIndex, setQuoteIndex] = useState(0);

  // ── Iteration 6: Timer state ──
  const [timerSecs, setTimerSecs]     = useState(SESSION_SECS);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone]     = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  const startTimer = () => {
    if (timerActive || timerSecs === 0) return;
    setTimerActive(true);
    setTimerDone(false);
    intervalRef.current = setInterval(() => {
      setTimerSecs((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setTimerActive(false);
          setTimerDone(true);
          Alert.alert(
            '⏰ Süre Doldu!',
            'NAIM seansı tamamlandı!\nLogla ve commit et! 🏆',
            [{ text: 'NAIM Gibi! 💪', style: 'default' }]
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setTimerActive(false);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimerActive(false);
    setTimerDone(false);
    setTimerSecs(SESSION_SECS);
  };

  // ── Iteration 7: Lift Log state ──
  const [lifts, setLifts]         = useState([]);
  const [liftName, setLiftName]   = useState('');
  const [liftWeight, setLiftWeight] = useState('10');

  const addLift = () => {
    const name = liftName.trim();
    if (!name) return;
    const kg = Math.max(1, parseInt(liftWeight, 10) || 10);
    const entry = {
      id: Date.now().toString(),
      name,
      kg,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    setLifts((prev) => [entry, ...prev]);
    setTotalKg((prev) => prev + kg);
    setLiftName('');
    setLiftWeight('10');
  };

  const removeLift = (id, kg) => {
    setLifts((prev) => prev.filter((l) => l.id !== id));
    setTotalKg((prev) => Math.max(0, prev - kg));
  };

  // ── Iteration 4: Session flow ──
  const handleStartSession = () => {
    Alert.alert(
      '🏋️ NAIM Seansı Başlıyor!',
      'Kronometren başladı. 15 dakikan var.\n\nHangi seviyeyi seçiyorsun?',
      [
        { text: 'Warm-Up (5-10 kg)',    onPress: () => handleFeatureSelect('Warm-Up') },
        { text: 'Working Set (10-15 kg)', onPress: () => handleFeatureSelect('Working Set') },
        { text: 'İptal', style: 'cancel' },
      ]
    );
  };

  const handleFeatureSelect = (level) => {
    resetTimer();
    startTimer();
    Alert.alert(
      '⏱️ 15 Dakika Başladı!',
      `${level} seçtin — timer çalışıyor!\nBuild et, test et, commit et! 💪`,
      [{ text: 'NAIM Gibi! 🏆', style: 'default' }]
    );
  };

  // ── Computed values ──
  const weightClass = getWeightClass(totalKg);
  const timerColorVal = timerColor(timerSecs, colors);
  const progress = timerSecs / SESSION_SECS; // 1.0 → 0.0

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.primaryDark }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={[s.scroll, { backgroundColor: colors.background }]}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ─── Header — Iteration 1 + dark mode toggle (Iteration 5) ─── */}
          <View style={[s.header, { backgroundColor: colors.primary }]}>
            <View style={s.headerTop}>
              <View style={s.headerLeft}>
                <Text style={s.appIcon}>🏋️</Text>
                <View>
                  <Text style={s.appTitle}>GücApp</Text>
                  <Text style={[s.appSubtitle, { color: 'rgba(255,255,255,0.6)' }]}>
                    NAIM Agentic Iterative Mobile
                  </Text>
                </View>
              </View>
              {/* ── Iteration 5: Dark Mode Toggle ── */}
              <TouchableOpacity
                style={s.themeToggle}
                onPress={toggleTheme}
                activeOpacity={0.75}
              >
                <Text style={s.themeToggleText}>{isDark ? '☀️' : '🌙'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={s.appDescription}>
              Her iterasyon bir kaldırış. Her özellik ağırlık.{'\n'}
              Küçük başla, büyük kaldır. Cep Herkülü gibi.
            </Text>
          </View>

          {/* ─── Stats — Iteration 3 ─── */}
          <View style={[s.statsRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <StatsBadge label="Toplam" value={totalKg} unit="kg" />
            <StatsBadge label="İterasyon" value={7} unit="/" />
            <StatsBadge label="Süre" value={105} unit="dk" />
          </View>

          {/* ─── Weight Class Badge ─── */}
          <View style={[s.classContainer, { backgroundColor: colors.secondary }]}>
            <Text style={[s.classLabel, { color: colors.text.muted }]}>⚡ Sınıf</Text>
            <Text style={[s.className, { color: weightClass.color }]}>
              {weightClass.emoji} {weightClass.name}
            </Text>
            <Text style={[s.classRange, { color: colors.text.muted }]}>
              {weightClass.range} — {totalKg} kg toplam
            </Text>
          </View>

          {/* ─── Iteration 6: Session Timer ─── */}
          <Text style={[s.sectionTitle, { color: colors.text.primary }]}>⏱️ Seans Kronometresi</Text>
          <View style={[s.timerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Timer display */}
            <Text style={[s.timerDisplay, { color: timerColorVal }]}>
              {formatTime(timerSecs)}
            </Text>
            {/* Progress bar */}
            <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  s.progressFill,
                  { width: `${Math.round(progress * 100)}%`, backgroundColor: timerColorVal },
                ]}
              />
            </View>
            {/* Timer label */}
            <Text style={[s.timerLabel, { color: colors.text.secondary }]}>
              {timerDone
                ? '✅ Seans tamamlandı!'
                : timerActive
                ? '⚡ Seans devam ediyor...'
                : timerSecs === SESSION_SECS
                ? '15:00 — hazır'
                : '⏸️ Duraklatıldı'}
            </Text>
            {/* Controls */}
            <View style={s.timerControls}>
              {!timerActive ? (
                <TouchableOpacity
                  style={[s.timerBtn, s.timerBtnPrimary, { backgroundColor: colors.success }]}
                  onPress={startTimer}
                  disabled={timerDone || timerSecs === 0}
                  activeOpacity={0.8}
                >
                  <Text style={s.timerBtnText}>▶ Başlat</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[s.timerBtn, s.timerBtnPrimary, { backgroundColor: colors.warning }]}
                  onPress={pauseTimer}
                  activeOpacity={0.8}
                >
                  <Text style={s.timerBtnText}>⏸ Durdur</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[s.timerBtn, { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border }]}
                onPress={resetTimer}
                activeOpacity={0.8}
              >
                <Text style={[s.timerBtnText, { color: colors.text.secondary }]}>↺ Sıfırla</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── Motivation Card — Iteration 3 ─── */}
          <Text style={[s.sectionTitle, { color: colors.text.primary }]}>Günün Motivasyonu</Text>
          <MotivationCard quoteIndex={quoteIndex} />
          <TouchableOpacity
            style={[s.quoteButton, { borderColor: colors.primary }]}
            onPress={() => setQuoteIndex((p) => p + 1)}
            activeOpacity={0.8}
          >
            <Text style={[s.quoteButtonText, { color: colors.primary }]}>Yeni Söz 🔄</Text>
          </TouchableOpacity>

          {/* ─── Iteration 7: Lift Log ─── */}
          <Text style={[s.sectionTitle, { color: colors.text.primary }]}>📋 Kaldırış Logu</Text>
          <View style={[s.logCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Input row */}
            <View style={s.inputRow}>
              <TextInput
                style={[
                  s.liftInput,
                  {
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.border,
                    color: colors.text.primary,
                  },
                ]}
                placeholder="Özellik adı..."
                placeholderTextColor={colors.text.muted}
                value={liftName}
                onChangeText={setLiftName}
                returnKeyType="done"
                onSubmitEditing={addLift}
              />
              <TextInput
                style={[
                  s.weightInput,
                  {
                    backgroundColor: colors.surfaceRaised,
                    borderColor: colors.border,
                    color: colors.text.primary,
                  },
                ]}
                placeholder="kg"
                placeholderTextColor={colors.text.muted}
                value={liftWeight}
                onChangeText={setLiftWeight}
                keyboardType="numeric"
                maxLength={3}
              />
              <TouchableOpacity
                style={[s.addBtn, { backgroundColor: colors.primary }]}
                onPress={addLift}
                activeOpacity={0.8}
              >
                <Text style={s.addBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Lift list */}
            {lifts.length === 0 ? (
              <Text style={[s.emptyLog, { color: colors.text.muted }]}>
                Henüz kaldırış yok. İlk lifti ekle! 💪
              </Text>
            ) : (
              lifts.map((item) => (
                <View
                  key={item.id}
                  style={[s.liftRow, { borderBottomColor: colors.border }]}
                >
                  <View style={[s.liftKgBadge, { backgroundColor: colors.primaryDark }]}>
                    <Text style={s.liftKgText}>{item.kg}kg</Text>
                  </View>
                  <View style={s.liftInfo}>
                    <Text style={[s.liftName, { color: colors.text.primary }]}>{item.name}</Text>
                    <Text style={[s.liftTime, { color: colors.text.muted }]}>{item.time}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeLift(item.id, item.kg)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={[s.deleteBtn, { color: colors.text.muted }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

          {/* ─── NAIM Loop — Iteration 3 ─── */}
          <Text style={[s.sectionTitle, { color: colors.text.primary }]}>NAIM Döngüsü</Text>
          <View style={[s.loopCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {[
              { step: '1', icon: '💭', label: 'Düşün',   desc: 'Hangi özellik? (2 dk)' },
              { step: '2', icon: '🎨', label: 'Tasarla', desc: 'Stitch ile UI' },
              { step: '3', icon: '💻', label: 'Kodla',   desc: 'Claude Code ile build' },
              { step: '4', icon: '🧪', label: 'Test Et', desc: 'Çalışıyor mu?' },
              { step: '5', icon: '📝', label: 'Logla',   desc: 'MOBILE.md güncelle' },
              { step: '6', icon: '🚀', label: 'Commit',  desc: 'Push to GitHub' },
            ].map((item) => (
              <View key={item.step} style={[s.loopStep, { borderBottomColor: colors.border }]}>
                <View style={[s.stepNumber, { backgroundColor: colors.primary }]}>
                  <Text style={s.stepNumText}>{item.step}</Text>
                </View>
                <Text style={s.stepIcon}>{item.icon}</Text>
                <View style={s.stepInfo}>
                  <Text style={[s.stepLabel, { color: colors.text.primary }]}>{item.label}</Text>
                  <Text style={[s.stepDesc, { color: colors.text.secondary }]}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ─── CTA — Iteration 4 ─── */}
          <TouchableOpacity
            style={[s.ctaButton, { backgroundColor: colors.primary, shadowColor: colors.primaryDark }]}
            onPress={handleStartSession}
            activeOpacity={0.85}
          >
            <Text style={s.ctaText}>🏋️ Seans Başlat</Text>
            <Text style={s.ctaSubtext}>15 dakikan başlıyor...</Text>
          </TouchableOpacity>

          <View style={[s.footer, { borderTopColor: colors.border }]}>
            <Text style={[s.footerText, { color: colors.text.muted }]}>
              Powered by Claude Code CLI • AIgile Mobile
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────
function makeStyles(colors, typography, spacing, radius) {
  return StyleSheet.create({
    safe: { flex: 1 },
    scroll: { flex: 1 },
    content: { paddingBottom: spacing.xxl },

    // Header
    header: {
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    appIcon:        { fontSize: 42, marginRight: spacing.md },
    appTitle:       { fontSize: typography.fontSizes.xxxl, fontWeight: typography.fontWeights.extrabold, color: '#fff', letterSpacing: -0.5 },
    appSubtitle:    { fontSize: typography.fontSizes.xs, letterSpacing: 0.3, textTransform: 'uppercase' },
    appDescription: { fontSize: typography.fontSizes.md, color: 'rgba(255,255,255,0.85)', lineHeight: 22 },

    // Dark mode toggle (Iteration 5)
    themeToggle: {
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    themeToggleText: { fontSize: 20 },

    // Stats
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.lg,
      borderBottomWidth: 1,
    },

    // Weight class
    classContainer: {
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      borderRadius: radius.md,
      padding: spacing.md,
      alignItems: 'center',
    },
    classLabel: { fontSize: typography.fontSizes.xs, textTransform: 'uppercase', letterSpacing: 1 },
    className:  { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.extrabold, marginVertical: 2 },
    classRange: { fontSize: typography.fontSizes.sm },

    // Section title
    sectionTitle: {
      fontSize: typography.fontSizes.lg,
      fontWeight: typography.fontWeights.bold,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      marginHorizontal: spacing.md,
    },

    // Timer card (Iteration 6)
    timerCard: {
      marginHorizontal: spacing.md,
      borderRadius: radius.lg,
      padding: spacing.lg,
      borderWidth: 1,
      alignItems: 'center',
    },
    timerDisplay: {
      fontSize: 64,
      fontWeight: typography.fontWeights.extrabold,
      letterSpacing: -2,
      fontVariant: ['tabular-nums'],
    },
    progressTrack: {
      width: '100%',
      height: 6,
      borderRadius: radius.full,
      marginTop: spacing.sm,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      borderRadius: radius.full,
    },
    timerLabel: {
      fontSize: typography.fontSizes.sm,
      marginTop: spacing.sm,
    },
    timerControls: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    timerBtn: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      alignItems: 'center',
    },
    timerBtnPrimary: {},
    timerBtnText: {
      fontSize: typography.fontSizes.md,
      fontWeight: typography.fontWeights.semibold,
      color: '#fff',
    },

    // Quote button
    quoteButton: {
      alignSelf: 'center',
      marginTop: spacing.sm,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderRadius: radius.full,
      borderWidth: 1.5,
    },
    quoteButtonText: { fontWeight: typography.fontWeights.semibold, fontSize: typography.fontSizes.sm },

    // Lift Log (Iteration 7)
    logCard: {
      marginHorizontal: spacing.md,
      borderRadius: radius.lg,
      borderWidth: 1,
      padding: spacing.md,
      overflow: 'hidden',
    },
    inputRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    liftInput: {
      flex: 1,
      height: 44,
      borderRadius: radius.md,
      borderWidth: 1,
      paddingHorizontal: spacing.md,
      fontSize: typography.fontSizes.md,
    },
    weightInput: {
      width: 56,
      height: 44,
      borderRadius: radius.md,
      borderWidth: 1,
      paddingHorizontal: spacing.sm,
      fontSize: typography.fontSizes.md,
      textAlign: 'center',
    },
    addBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBtnText: {
      fontSize: 24,
      color: '#fff',
      fontWeight: typography.fontWeights.bold,
      lineHeight: 28,
    },
    emptyLog: {
      textAlign: 'center',
      paddingVertical: spacing.md,
      fontSize: typography.fontSizes.sm,
    },
    liftRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
    },
    liftKgBadge: {
      borderRadius: radius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      marginRight: spacing.sm,
    },
    liftKgText: {
      color: '#fff',
      fontSize: typography.fontSizes.xs,
      fontWeight: typography.fontWeights.bold,
    },
    liftInfo: { flex: 1 },
    liftName: { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.medium },
    liftTime: { fontSize: typography.fontSizes.xs, marginTop: 1 },
    deleteBtn: { fontSize: 16, paddingHorizontal: spacing.xs },

    // NAIM Loop
    loopCard: {
      marginHorizontal: spacing.md,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
    },
    loopStep: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
    },
    stepNumber: {
      width: 28,
      height: 28,
      borderRadius: radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.sm,
    },
    stepNumText: { color: '#fff', fontSize: typography.fontSizes.sm, fontWeight: typography.fontWeights.bold },
    stepIcon:   { fontSize: 20, marginRight: spacing.sm, width: 28, textAlign: 'center' },
    stepInfo:   { flex: 1 },
    stepLabel:  { fontSize: typography.fontSizes.md, fontWeight: typography.fontWeights.semibold },
    stepDesc:   { fontSize: typography.fontSizes.sm },

    // CTA
    ctaButton: {
      marginHorizontal: spacing.md,
      marginTop: spacing.xl,
      borderRadius: radius.lg,
      paddingVertical: spacing.lg,
      alignItems: 'center',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      elevation: 8,
    },
    ctaText:    { fontSize: typography.fontSizes.xl, fontWeight: typography.fontWeights.extrabold, color: '#fff' },
    ctaSubtext: { fontSize: typography.fontSizes.sm, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

    // Footer
    footer: {
      alignItems: 'center',
      marginTop: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: 1,
    },
    footerText: { fontSize: typography.fontSizes.xs },
  });
}

const styles = makeStyles;
