/**
 * NAIM Diet Planner — Profile & Iteration History Screen
 * Copyright (C) 2024  NAIM Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// NAIM Iteration 1 — Profile view + iteration log + reset — 15kg

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Modal, Platform,
} from 'react-native';
import { C, FONT, RADIUS, SPACE, glassCard } from '../theme/colors';
import { DIET_OPTIONS, ACTIVITY_OPTIONS, GOAL_OPTIONS, calculateNutrition } from '../engine/dietEngine';

// ─── Helpers ─────────────────────────────────────────────────────

function label(list, id) {
  return list.find((x) => x.id === id)?.label ?? id;
}

function emoji(list, id) {
  return list.find((x) => x.id === id)?.emoji ?? '•';
}

function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Stat chip ────────────────────────────────────────────────────

function StatChip({ emoji: e, label: l, value, color = C.mint }) {
  return (
    <View style={[sc.chip, { borderColor: color + '33' }]}>
      <Text style={sc.chipEmoji}>{e}</Text>
      <Text style={[sc.chipVal, { color }]}>{value}</Text>
      <Text style={sc.chipLabel}>{l}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  chip: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    ...glassCard, gap: 4, minWidth: 80,
  },
  chipEmoji: { fontSize: 22 },
  chipVal:   { fontSize: FONT.lg, fontWeight: '800' },
  chipLabel: { fontSize: FONT.xs, color: C.textFaint, fontWeight: '600' },
});

// ─── Iteration log row ────────────────────────────────────────────

function IterRow({ iter, isCurrent }) {
  const avgRating = iter.ratingsCount > 0
    ? (iter.ratingsSum / iter.ratingsCount).toFixed(1)
    : null;

  return (
    <View style={[ir.row, isCurrent && ir.rowActive]}>
      <View style={[ir.badge, isCurrent && ir.badgeActive]}>
        <Text style={[ir.badgeText, isCurrent && ir.badgeTextActive]}>
          #{iter.version}
        </Text>
      </View>
      <View style={ir.info}>
        <Text style={ir.date}>{formatDate(iter.generatedAt)}</Text>
        {avgRating && (
          <Text style={ir.rating}>{'★'.repeat(Math.round(avgRating))} {avgRating} avg</Text>
        )}
        {iter.poorMealsReplaced > 0 && (
          <Text style={ir.replaced}>{iter.poorMealsReplaced} meals evolved</Text>
        )}
      </View>
      {isCurrent && (
        <View style={ir.currentBadge}>
          <Text style={ir.currentText}>Current</Text>
        </View>
      )}
    </View>
  );
}

const ir = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    ...glassCard, padding: 14,
  },
  rowActive: { borderColor: C.purple + '55', backgroundColor: C.purpleDim },
  badge: {
    width: 40, height: 40, borderRadius: RADIUS.sm,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeActive: { backgroundColor: C.purple + '33', borderColor: C.purple },
  badgeText:   { fontSize: FONT.sm, fontWeight: '800', color: C.textSub },
  badgeTextActive: { color: C.purple },
  info:        { flex: 1, gap: 2 },
  date:        { fontSize: FONT.sm, fontWeight: '600', color: C.text },
  rating:      { fontSize: FONT.xs, color: C.amber },
  replaced:    { fontSize: FONT.xs, color: C.purple },
  currentBadge:{
    backgroundColor: C.purpleDim, borderRadius: RADIUS.full,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: C.purple + '44',
  },
  currentText: { fontSize: FONT.xs, fontWeight: '700', color: C.purple },
});

// ─── Confirm reset modal ──────────────────────────────────────────

function ConfirmModal({ visible, onConfirm, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={cm.overlay}>
        <View style={cm.card}>
          <Text style={cm.emoji}>⚠️</Text>
          <Text style={cm.title}>Reset Everything?</Text>
          <Text style={cm.body}>
            This will delete your profile, meal plan, and all iteration history.
            This action cannot be undone.
          </Text>
          <View style={cm.btns}>
            <TouchableOpacity style={cm.btnCancel} onPress={onClose} activeOpacity={0.8}>
              <Text style={cm.btnCancelText}>Keep my data</Text>
            </TouchableOpacity>
            <TouchableOpacity style={cm.btnConfirm} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={cm.btnConfirmText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const cm = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(4,4,17,0.88)',
  },
  card: {
    margin: SPACE.lg, ...glassCard, padding: SPACE.xl,
    alignItems: 'center', gap: SPACE.sm,
    borderColor: C.error + '55',
  },
  emoji:  { fontSize: 48, marginBottom: 8 },
  title:  { fontSize: FONT.xl, fontWeight: '800', color: C.text, textAlign: 'center' },
  body:   { fontSize: FONT.sm, color: C.textSub, textAlign: 'center', lineHeight: 20 },
  btns:   { flexDirection: 'row', gap: SPACE.sm, marginTop: SPACE.sm, width: '100%' },
  btnCancel: {
    flex: 1, paddingVertical: 14, borderRadius: RADIUS.lg,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  btnCancelText:  { fontSize: FONT.md, fontWeight: '700', color: C.textSub },
  btnConfirm:     {
    flex: 1, paddingVertical: 14, borderRadius: RADIUS.lg,
    backgroundColor: C.error + 'CC', alignItems: 'center',
  },
  btnConfirmText: { fontSize: FONT.md, fontWeight: '700', color: '#fff' },
});

// ─── Main screen ─────────────────────────────────────────────────

export default function ProfileScreen({ profile, plan, history, onReset }) {
  const [showReset, setShowReset] = useState(false);

  const nutrition = profile ? calculateNutrition(profile) : null;

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.name ? profile.name[0].toUpperCase() : '?'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{profile?.name || 'Your Profile'}</Text>
              <Text style={styles.profileSub}>
                {profile ? `${profile.gender === 'male' ? 'Male' : 'Female'} · ${profile.age} yrs · ${profile.weightKg} kg · ${profile.heightCm} cm` : '—'}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Daily targets ── */}
        {nutrition && (
          <>
            <Text style={styles.sectionLabel}>DAILY TARGETS</Text>
            <View style={styles.chipsRow}>
              <StatChip emoji="🔥" label="calories" value={nutrition.dailyTarget} color={C.coral} />
              <StatChip emoji="🥩" label="protein"  value={`${nutrition.macros.proteinG}g`} color={C.mint} />
              <StatChip emoji="🌾" label="carbs"    value={`${nutrition.macros.carbG}g`} color={C.amber} />
              <StatChip emoji="🫒" label="fat"      value={`${nutrition.macros.fatG}g`} color={C.sky} />
            </View>
          </>
        )}

        {/* ── Preferences ── */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.prefCard}>
          {[
            ['Activity',   emoji(ACTIVITY_OPTIONS, profile?.activity), label(ACTIVITY_OPTIONS, profile?.activity)],
            ['Goal',       emoji(GOAL_OPTIONS,     profile?.goal),     label(GOAL_OPTIONS,     profile?.goal)],
            ['Diet',       emoji(DIET_OPTIONS,     profile?.diet),     label(DIET_OPTIONS,     profile?.diet)],
          ].map(([key, e, val]) => (
            <View key={key} style={styles.prefRow}>
              <Text style={styles.prefKey}>{key}</Text>
              <View style={styles.prefVal}>
                <Text style={styles.prefEmoji}>{e}</Text>
                <Text style={styles.prefText}>{val}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── NAIM iteration history ── */}
        <Text style={styles.sectionLabel}>NAIM ITERATION LOG</Text>
        <View style={styles.logCard}>
          {history && history.length > 0 ? (
            history.slice().reverse().map((iter, i) => (
              <IterRow
                key={iter.version}
                iter={iter}
                isCurrent={i === 0}
              />
            ))
          ) : (
            <Text style={styles.emptyLog}>
              No iterations yet. Complete a week and hit Evolve to start the loop.
            </Text>
          )}
        </View>

        {/* ── Privacy notice ── */}
        <View style={styles.privacyCard}>
          <Text style={styles.privacyTitle}>🔒  Absolute Privacy</Text>
          <Text style={styles.privacyText}>
            NAIM Diet runs entirely on your device. No account, no cloud sync,
            no analytics, no ads. Your data is stored only in your phone's local storage
            via AsyncStorage and never transmitted anywhere.{'\n\n'}
            <Text style={{ color: C.purple }}>GNU General Public License v3.0</Text>
            {' — free software, forever.'}
          </Text>
        </View>

        {/* ── Reset button ── */}
        <TouchableOpacity
          style={styles.resetBtn}
          onPress={() => setShowReset(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.resetBtnText}>↺  Reset & Start Over</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      <ConfirmModal
        visible={showReset}
        onConfirm={() => { setShowReset(false); onReset(); }}
        onClose={() => setShowReset(false)}
      />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 40 },

  sectionLabel: {
    fontSize: FONT.xs, fontWeight: '700', color: C.textFaint,
    letterSpacing: 1.5, paddingHorizontal: SPACE.lg,
    marginTop: SPACE.lg, marginBottom: SPACE.sm,
  },

  // Profile card
  profileCard: {
    margin: SPACE.lg, marginBottom: SPACE.sm, ...glassCard, padding: SPACE.lg,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: C.mintDim, borderWidth: 2, borderColor: C.mint,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText:    { fontSize: FONT.xxl, fontWeight: '900', color: C.mint },
  profileName:   { fontSize: FONT.xl, fontWeight: '800', color: C.text, marginBottom: 4 },
  profileSub:    { fontSize: FONT.sm, color: C.textFaint, lineHeight: 18 },

  // Chips
  chipsRow: { flexDirection: 'row', paddingHorizontal: SPACE.lg, gap: SPACE.sm },

  // Preferences
  prefCard: { marginHorizontal: SPACE.lg, ...glassCard, overflow: 'hidden' },
  prefRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACE.md, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  prefKey:   { fontSize: FONT.sm, color: C.textFaint, fontWeight: '600' },
  prefVal:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  prefEmoji: { fontSize: 18 },
  prefText:  { fontSize: FONT.sm, fontWeight: '700', color: C.text },

  // Iteration log
  logCard: { marginHorizontal: SPACE.lg, gap: SPACE.sm },
  emptyLog: {
    fontSize: FONT.sm, color: C.textFaint, textAlign: 'center',
    paddingVertical: SPACE.lg, ...glassCard, padding: SPACE.lg,
  },

  // Privacy
  privacyCard: {
    marginHorizontal: SPACE.lg, marginTop: SPACE.lg,
    ...glassCard, padding: SPACE.lg,
    borderColor: C.purple + '33',
    gap: SPACE.sm,
  },
  privacyTitle: { fontSize: FONT.md, fontWeight: '800', color: C.text },
  privacyText:  { fontSize: FONT.sm, color: C.textSub, lineHeight: 20 },

  // Reset
  resetBtn: {
    marginHorizontal: SPACE.lg, marginTop: SPACE.lg,
    paddingVertical: 16, borderRadius: RADIUS.lg,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.error + '44',
    alignItems: 'center',
  },
  resetBtnText: { fontSize: FONT.md, fontWeight: '700', color: C.error },
});
