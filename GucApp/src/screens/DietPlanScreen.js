/**
 * NAIM Diet Planner — 7-Day Diet Plan Screen
 * Copyright (C) 2024  NAIM Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// NAIM Iteration 1 — Diet plan viewer + NAIM loop rating — 30kg

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Animated, Platform, Modal, Dimensions,
} from 'react-native';
import { C, FONT, RADIUS, SPACE, glassCard } from '../theme/colors';
import { MEAL_EMOJIS, MEAL_LABELS, evolvePlan, generateWeekPlan } from '../engine/dietEngine';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Macro bar ───────────────────────────────────────────────────

function MacroBar({ label, value, max, color }) {
  const pct = Math.min(1, value / Math.max(1, max));
  return (
    <View style={mb.wrap}>
      <View style={mb.row}>
        <Text style={mb.label}>{label}</Text>
        <Text style={[mb.value, { color }]}>{value}g</Text>
      </View>
      <View style={mb.track}>
        <View style={[mb.fill, { width: `${Math.round(pct * 100)}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  wrap:  { gap: 4 },
  row:   { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: FONT.xs, color: C.textFaint, fontWeight: '600' },
  value: { fontSize: FONT.xs, fontWeight: '700' },
  track: { height: 4, backgroundColor: C.bgCardHi, borderRadius: 2, overflow: 'hidden' },
  fill:  { height: 4, borderRadius: 2 },
});

// ─── Meal card ────────────────────────────────────────────────────

function MealCard({ mealType, meal, rating, onRate }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  function toggle() {
    const to = expanded ? 0 : 1;
    Animated.spring(rotateAnim, { toValue: to, useNativeDriver: true, damping: 15 }).start();
    setExpanded(!expanded);
  }

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  const accentColor = mealType === 'breakfast' ? C.amber
    : mealType === 'lunch' ? C.sky : C.purple;

  return (
    <View style={[mc.card, { borderLeftColor: accentColor, borderLeftWidth: 3 }]}>
      {/* Header row */}
      <TouchableOpacity style={mc.header} onPress={toggle} activeOpacity={0.8}>
        <View style={[mc.typeBadge, { backgroundColor: accentColor + '22' }]}>
          <Text style={mc.typeEmoji}>{MEAL_EMOJIS[mealType]}</Text>
          <Text style={[mc.typeLabel, { color: accentColor }]}>{MEAL_LABELS[mealType]}</Text>
        </View>
        <Animated.Text style={[mc.chevron, { transform: [{ rotate }] }]}>⌄</Animated.Text>
      </TouchableOpacity>

      {/* Meal name & calories */}
      <View style={mc.nameRow}>
        <Text style={mc.mealEmoji}>{meal.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={mc.mealName}>{meal.name}</Text>
          <Text style={[mc.calories, { color: accentColor }]}>
            {meal.calories} kcal
          </Text>
        </View>
      </View>

      {/* Expandable details */}
      {expanded && (
        <View style={mc.details}>
          {/* Macros */}
          <View style={mc.macrosRow}>
            {[
              { label: 'Protein', val: meal.protein, color: C.mint },
              { label: 'Carbs',   val: meal.carbs,   color: C.amber },
              { label: 'Fat',     val: meal.fat,      color: C.coral },
            ].map(({ label, val, color }) => (
              <View key={label} style={[mc.macroBox, { borderColor: color + '44' }]}>
                <Text style={[mc.macroVal, { color }]}>{val}g</Text>
                <Text style={mc.macroLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Serving */}
          <View style={mc.servingBox}>
            <Text style={mc.servingTitle}>📏  Serving</Text>
            <Text style={mc.servingText}>{meal.serving}</Text>
            <Text style={mc.servingMeasure}>{meal.measurement}</Text>
          </View>

          {/* Prep */}
          <View style={mc.prepRow}>
            <Text style={mc.prepLabel}>⏱  Prep time:</Text>
            <Text style={mc.prepVal}>{meal.prep}</Text>
          </View>

          {/* Portion note */}
          {meal.portionNote && meal.portionNote !== 'Standard portion' && (
            <View style={mc.portionNote}>
              <Text style={mc.portionNoteText}>⚠️  {meal.portionNote}</Text>
            </View>
          )}

          {/* Rating */}
          <View style={mc.ratingRow}>
            <Text style={mc.ratingLabel}>Rate this meal:</Text>
            <View style={mc.stars}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity key={s} onPress={() => onRate(meal.id, s)} activeOpacity={0.7}>
                  <Text style={[mc.star, s <= (rating || 0) && mc.starActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const mc = StyleSheet.create({
  card: {
    ...glassCard,
    overflow: 'hidden',
    borderLeftWidth: 3,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full,
  },
  typeEmoji:  { fontSize: 14 },
  typeLabel:  { fontSize: FONT.xs, fontWeight: '700', letterSpacing: 0.5 },
  chevron:    { fontSize: 22, color: C.textFaint, fontWeight: '300' },

  nameRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingBottom: 14,
  },
  mealEmoji: { fontSize: 36 },
  mealName:  { fontSize: FONT.md, fontWeight: '700', color: C.text, marginBottom: 3, lineHeight: 20 },
  calories:  { fontSize: FONT.sm, fontWeight: '800', letterSpacing: 0.3 },

  details: { paddingHorizontal: 16, paddingBottom: 16, gap: SPACE.sm },

  macrosRow: { flexDirection: 'row', gap: 8 },
  macroBox: {
    flex: 1, alignItems: 'center', paddingVertical: 10,
    backgroundColor: C.bgCard, borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  macroVal:   { fontSize: FONT.lg, fontWeight: '800', marginBottom: 2 },
  macroLabel: { fontSize: FONT.xs, color: C.textFaint, fontWeight: '600' },

  servingBox: {
    backgroundColor: C.bgCard, borderRadius: RADIUS.sm,
    padding: 12, gap: 4, borderWidth: 1, borderColor: C.border,
  },
  servingTitle:   { fontSize: FONT.sm, fontWeight: '700', color: C.textSub, marginBottom: 4 },
  servingText:    { fontSize: FONT.sm, color: C.text, lineHeight: 18 },
  servingMeasure: { fontSize: FONT.xs, color: C.textFaint, fontStyle: 'italic' },

  prepRow:  { flexDirection: 'row', gap: 8, alignItems: 'center' },
  prepLabel:{ fontSize: FONT.sm, color: C.textFaint },
  prepVal:  { fontSize: FONT.sm, color: C.text, fontWeight: '600' },

  portionNote: {
    backgroundColor: C.amberDim, borderRadius: RADIUS.sm,
    padding: 10, borderWidth: 1, borderColor: C.amber + '44',
  },
  portionNoteText: { fontSize: FONT.sm, color: C.amber },

  ratingRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 },
  ratingLabel:{ fontSize: FONT.sm, color: C.textFaint },
  stars:      { flexDirection: 'row', gap: 6 },
  star:       { fontSize: 24, color: C.bgCardHi },
  starActive: { color: C.amber },
});

// ─── Day selector ─────────────────────────────────────────────────

function DaySelector({ days, selectedDay, onSelect }) {
  return (
    <ScrollView
      horizontal showsHorizontalScrollIndicator={false}
      contentContainerStyle={ds.container}
    >
      {days.map((day) => {
        const active = day.dayIndex === selectedDay;
        return (
          <TouchableOpacity
            key={day.dayIndex}
            style={[ds.pill, active && ds.pillActive]}
            onPress={() => onSelect(day.dayIndex)}
            activeOpacity={0.8}
          >
            <Text style={[ds.dayAbbr, active && ds.dayAbbrActive]}>
              {day.dayName.slice(0, 3)}
            </Text>
            <Text style={[ds.dayNum, active && ds.dayNumActive]}>
              {day.dayIndex + 1}
            </Text>
            {active && <View style={ds.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const ds = StyleSheet.create({
  container: { paddingHorizontal: SPACE.lg, gap: 10, paddingVertical: 4 },
  pill: {
    alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: RADIUS.lg, ...glassCard, minWidth: 58,
  },
  pillActive: {
    backgroundColor: C.mintDim, borderColor: C.mint,
    shadowColor: C.mint, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  dayAbbr:       { fontSize: FONT.xs, color: C.textFaint, fontWeight: '600', letterSpacing: 0.5 },
  dayAbbrActive: { color: C.mint },
  dayNum:        { fontSize: FONT.xl, fontWeight: '800', color: C.textSub },
  dayNumActive:  { color: C.mint },
  activeDot:     { width: 5, height: 5, borderRadius: 2.5, backgroundColor: C.mint, marginTop: 3 },
});

// ─── Evolve modal ─────────────────────────────────────────────────

function EvolveModal({ visible, ratings, plan, onConfirm, onClose }) {
  const ratedCount = Object.keys(ratings).length;
  const totalMeals = 21;
  const avgRating = ratedCount > 0
    ? (Object.values(ratings).reduce((a, b) => a + b, 0) / ratedCount).toFixed(1)
    : '—';
  const poorMeals = Object.values(ratings).filter((r) => r <= 2).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={em.overlay}>
        <View style={em.backdrop} />
        <View style={em.sheet}>
          <View style={em.handle} />
          <Text style={em.title}>🔄  Evolve to Iteration {(plan?.version || 1) + 1}</Text>
          <Text style={em.sub}>
            NAIM will regenerate your plan using your ratings.
            Meals you disliked will be replaced.
          </Text>

          <View style={em.statsRow}>
            <View style={em.stat}>
              <Text style={[em.statVal, { color: C.mint }]}>{ratedCount}/{totalMeals}</Text>
              <Text style={em.statLabel}>Rated</Text>
            </View>
            <View style={em.stat}>
              <Text style={[em.statVal, { color: C.amber }]}>{avgRating}</Text>
              <Text style={em.statLabel}>Avg rating</Text>
            </View>
            <View style={em.stat}>
              <Text style={[em.statVal, { color: C.coral }]}>{poorMeals}</Text>
              <Text style={em.statLabel}>To replace</Text>
            </View>
          </View>

          {ratedCount < 7 && (
            <View style={em.hint}>
              <Text style={em.hintText}>
                💡  Rate at least 7 meals for better evolution, or proceed now.
              </Text>
            </View>
          )}

          <View style={em.btns}>
            <TouchableOpacity style={em.btnCancel} onPress={onClose} activeOpacity={0.8}>
              <Text style={em.btnCancelText}>Not yet</Text>
            </TouchableOpacity>
            <TouchableOpacity style={em.btnConfirm} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={em.btnConfirmText}>🚀  Evolve Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const em = StyleSheet.create({
  overlay:  { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(4,4,17,0.80)' },
  sheet: {
    backgroundColor: '#0F0F28', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: SPACE.lg, paddingBottom: Platform.OS === 'ios' ? 46 : 28,
    borderTopWidth: 1, borderColor: C.border,
  },
  handle: {
    width: 44, height: 5, borderRadius: 3, backgroundColor: C.border,
    alignSelf: 'center', marginBottom: SPACE.lg,
  },
  title:  { fontSize: FONT.xl, fontWeight: '800', color: C.text, marginBottom: 8 },
  sub:    { fontSize: FONT.sm, color: C.textSub, lineHeight: 20, marginBottom: SPACE.lg },

  statsRow: { flexDirection: 'row', gap: SPACE.sm, marginBottom: SPACE.md },
  stat: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    ...glassCard,
  },
  statVal:   { fontSize: FONT.xl, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: FONT.xs, color: C.textFaint },

  hint: {
    backgroundColor: C.amberDim, borderRadius: RADIUS.md, padding: 12,
    borderWidth: 1, borderColor: C.amber + '33', marginBottom: SPACE.md,
  },
  hintText: { fontSize: FONT.sm, color: C.amber, lineHeight: 18 },

  btns:         { flexDirection: 'row', gap: SPACE.sm },
  btnCancel:    {
    flex: 1, paddingVertical: 16, borderRadius: RADIUS.lg,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  btnCancelText:  { fontSize: FONT.md, fontWeight: '600', color: C.textSub },
  btnConfirm:   {
    flex: 2, paddingVertical: 16, borderRadius: RADIUS.lg,
    backgroundColor: C.purple, alignItems: 'center',
    shadowColor: C.purple, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5, shadowRadius: 14, elevation: 8,
  },
  btnConfirmText: { fontSize: FONT.md, fontWeight: '800', color: '#fff' },
});

// ─── Main screen ─────────────────────────────────────────────────

export default function DietPlanScreen({ plan, profile, ratings, onRate, onEvolve }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [showEvolve, setShowEvolve] = useState(false);

  const day = plan?.days?.[selectedDay];
  const nutrition = plan?.nutrition;

  function handleEvolveConfirm() {
    setShowEvolve(false);
    onEvolve();
  }

  if (!plan || !day) return null;

  const dayRatings = {
    [day.meals.breakfast.id]: ratings[day.meals.breakfast.id],
    [day.meals.lunch.id]:     ratings[day.meals.lunch.id],
    [day.meals.dinner.id]:    ratings[day.meals.dinner.id],
  };
  const dayRated = Object.values(dayRatings).filter(Boolean).length;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero summary card ── */}
        <View style={styles.heroCard}>
          {/* Iteration badge */}
          <View style={styles.iterBadge}>
            <Text style={styles.iterText}>Iteration {plan.version}</Text>
          </View>

          <View style={styles.heroRow}>
            <View>
              <Text style={styles.heroGreet}>
                {profile?.name ? `Hi, ${profile.name} 👋` : 'Your Plan 👋'}
              </Text>
              <Text style={styles.heroTarget}>
                <Text style={{ color: C.mint, fontWeight: '900' }}>
                  {nutrition?.dailyTarget}
                </Text>
                {' kcal/day'}
              </Text>
            </View>
            <View style={styles.heroStats}>
              <Text style={styles.heroStatVal}>{nutrition?.macros?.proteinG}g</Text>
              <Text style={styles.heroStatLabel}>protein</Text>
            </View>
          </View>

          {/* Macro bars */}
          <View style={styles.macroBars}>
            <MacroBar
              label="Protein"
              value={nutrition?.macros?.proteinG}
              max={nutrition?.macros?.proteinG * 1.2}
              color={C.mint}
            />
            <MacroBar
              label="Carbs"
              value={nutrition?.macros?.carbG}
              max={nutrition?.macros?.carbG * 1.2}
              color={C.amber}
            />
            <MacroBar
              label="Fat"
              value={nutrition?.macros?.fatG}
              max={nutrition?.macros?.fatG * 1.2}
              color={C.coral}
            />
          </View>
        </View>

        {/* ── Day selector ── */}
        <Text style={styles.sectionLabel}>SELECT DAY</Text>
        <DaySelector
          days={plan.days}
          selectedDay={selectedDay}
          onSelect={setSelectedDay}
        />

        {/* ── Day summary ── */}
        <View style={styles.daySummaryRow}>
          <Text style={styles.dayName}>{day.dayName}</Text>
          <View style={styles.dayCals}>
            <Text style={styles.dayCalsNum}>{day.totals.calories}</Text>
            <Text style={styles.dayCalsLabel}> kcal</Text>
          </View>
          {dayRated === 3 && (
            <View style={styles.dayRatedBadge}>
              <Text style={styles.dayRatedText}>✓ Rated</Text>
            </View>
          )}
        </View>

        {/* ── Meal cards ── */}
        <View style={styles.mealsContainer}>
          {(['breakfast', 'lunch', 'dinner']).map((mealType) => (
            <MealCard
              key={mealType}
              mealType={mealType}
              meal={day.meals[mealType]}
              rating={ratings[day.meals[mealType]?.id]}
              onRate={onRate}
            />
          ))}
        </View>

        {/* ── Evolve CTA ── */}
        <View style={styles.evolveSection}>
          <Text style={styles.evolveHint}>
            Rate meals across all 7 days, then evolve your plan for next week.
          </Text>
          <TouchableOpacity
            style={styles.evolveBtn}
            onPress={() => setShowEvolve(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.evolveBtnText}>
              🔄  Evolve to Iteration {plan.version + 1}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <EvolveModal
        visible={showEvolve}
        ratings={ratings}
        plan={plan}
        onConfirm={handleEvolveConfirm}
        onClose={() => setShowEvolve(false)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  // Hero card
  heroCard: {
    margin: SPACE.lg,
    marginBottom: SPACE.md,
    ...glassCard,
    padding: SPACE.lg,
    gap: SPACE.md,
    shadowColor: C.mint,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  iterBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.purpleDim,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: C.purple + '44',
  },
  iterText:    { fontSize: FONT.xs, fontWeight: '700', color: C.purple, letterSpacing: 0.5 },
  heroRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  heroGreet:   { fontSize: FONT.md, color: C.textSub, marginBottom: 4 },
  heroTarget:  { fontSize: FONT.hero, fontWeight: '900', color: C.text, letterSpacing: -1 },
  heroStats:   { alignItems: 'flex-end' },
  heroStatVal: { fontSize: FONT.xxl, fontWeight: '800', color: C.mint },
  heroStatLabel:{ fontSize: FONT.xs, color: C.textFaint },
  macroBars:   { gap: 10 },

  // Section label
  sectionLabel: {
    fontSize: FONT.xs, fontWeight: '700', color: C.textFaint,
    letterSpacing: 1.5, paddingHorizontal: SPACE.lg, marginBottom: 10,
  },

  // Day row
  daySummaryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACE.lg, paddingVertical: SPACE.sm, gap: SPACE.sm,
  },
  dayName: { flex: 1, fontSize: FONT.lg, fontWeight: '800', color: C.text },
  dayCals: { flexDirection: 'row', alignItems: 'baseline' },
  dayCalsNum: { fontSize: FONT.xl, fontWeight: '800', color: C.mint },
  dayCalsLabel:{ fontSize: FONT.sm, color: C.textFaint },
  dayRatedBadge: {
    backgroundColor: C.mintDim, borderRadius: RADIUS.full,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: C.mint + '44',
  },
  dayRatedText: { fontSize: FONT.xs, fontWeight: '700', color: C.mint },

  // Meal list
  mealsContainer: { paddingHorizontal: SPACE.lg, gap: SPACE.sm },

  // Evolve section
  evolveSection: {
    margin: SPACE.lg,
    marginTop: SPACE.lg,
    gap: SPACE.md,
    ...glassCard,
    padding: SPACE.lg,
    borderColor: C.purple + '44',
  },
  evolveHint: { fontSize: FONT.sm, color: C.textSub, lineHeight: 20, textAlign: 'center' },
  evolveBtn: {
    backgroundColor: C.purpleDim, borderRadius: RADIUS.lg,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: C.purple,
    shadowColor: C.purple, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
  },
  evolveBtnText: { fontSize: FONT.md, fontWeight: '800', color: C.purple },
});
