/**
 * NAIM Diet Planner — Root Application
 * Copyright (C) 2024  NAIM Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * All user data is stored exclusively via AsyncStorage on the local device.
 * No data is ever transmitted to any server or third party.
 */

// NAIM Iteration 1 — Root navigator + NAIM loop state — 20kg

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

import { C, FONT, SPACE, RADIUS } from './src/theme/colors';
import { generateWeekPlan, evolvePlan } from './src/engine/dietEngine';
import OnboardingScreen from './src/screens/OnboardingScreen';
import DietPlanScreen   from './src/screens/DietPlanScreen';
import ProfileScreen    from './src/screens/ProfileScreen';

// ─── AsyncStorage keys ───────────────────────────────────────────
const KEY_PROFILE   = '@naim_profile';
const KEY_PLAN      = '@naim_plan';
const KEY_RATINGS   = '@naim_ratings';
const KEY_HISTORY   = '@naim_history';
const KEY_DISLIKES  = '@naim_dislikes';

// ─── Tab bar ─────────────────────────────────────────────────────
const TABS = [
  { id: 'plan',    emoji: '🥗', label: 'My Plan'  },
  { id: 'profile', emoji: '👤', label: 'Profile'  },
];

function TabBar({ active, onChange }) {
  return (
    <View style={tb.bar}>
      {TABS.map((t) => {
        const isActive = active === t.id;
        return (
          <TouchableOpacity
            key={t.id}
            style={tb.tab}
            onPress={() => onChange(t.id)}
            activeOpacity={0.75}
          >
            <Text style={[tb.emoji, isActive && tb.emojiActive]}>{t.emoji}</Text>
            <Text style={[tb.label, isActive && tb.labelActive]}>{t.label}</Text>
            {isActive && <View style={tb.activeLine} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tb = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: C.border,
    backgroundColor: C.bg,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  tab:         { flex: 1, alignItems: 'center', paddingTop: 12, paddingBottom: 4, position: 'relative' },
  emoji:       { fontSize: 22, color: C.textFaint },
  emojiActive: { color: C.mint },
  label:       { fontSize: FONT.xs, color: C.textFaint, marginTop: 3, fontWeight: '600' },
  labelActive: { color: C.mint },
  activeLine:  {
    position: 'absolute', top: 0, left: '25%', right: '25%',
    height: 2, backgroundColor: C.mint, borderRadius: 2,
  },
});

// ─── Title bar ────────────────────────────────────────────────────
function TitleBar({ tab, plan }) {
  return (
    <View style={tbar.bar}>
      <View>
        <Text style={tbar.title}>
          {tab === 'plan' ? '🥗  NAIM Diet' : '👤  Profile'}
        </Text>
      </View>
      {tab === 'plan' && plan && (
        <View style={tbar.badge}>
          <Text style={tbar.badgeText}>Iter. {plan.version}</Text>
        </View>
      )}
    </View>
  );
}

const tbar = StyleSheet.create({
  bar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg,
    paddingTop: Platform.OS === 'android' ? 44 : 56,
    paddingBottom: 14,
    backgroundColor: C.bg,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  title: { fontSize: FONT.xl, fontWeight: '900', color: C.text, letterSpacing: -0.3 },
  badge: {
    backgroundColor: C.purpleDim, borderRadius: RADIUS.full,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: C.purple + '55',
  },
  badgeText: { fontSize: FONT.xs, fontWeight: '700', color: C.purple, letterSpacing: 0.5 },
});

// ─── Loading screen ───────────────────────────────────────────────
function LoadingScreen() {
  return (
    <View style={ls.root}>
      <Text style={ls.logo}>🥗</Text>
      <Text style={ls.title}>NAIM Diet</Text>
      <ActivityIndicator color={C.mint} style={{ marginTop: 20 }} />
    </View>
  );
}

const ls = StyleSheet.create({
  root:  { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center', gap: 8 },
  logo:  { fontSize: 72 },
  title: { fontSize: FONT.xxl, fontWeight: '900', color: C.text, letterSpacing: -1 },
});

// ─── Root App ─────────────────────────────────────────────────────
export default function App() {
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('plan');

  // Persisted state
  const [profile,  setProfile]  = useState(null);
  const [plan,     setPlan]     = useState(null);
  const [ratings,  setRatings]  = useState({});
  const [history,  setHistory]  = useState([]);
  const [dislikes, setDislikes] = useState([]);

  // ── Hydrate from storage ────────────────────────────────────────
  useEffect(() => {
    async function hydrate() {
      try {
        const [p, pl, r, h, d] = await Promise.all([
          AsyncStorage.getItem(KEY_PROFILE),
          AsyncStorage.getItem(KEY_PLAN),
          AsyncStorage.getItem(KEY_RATINGS),
          AsyncStorage.getItem(KEY_HISTORY),
          AsyncStorage.getItem(KEY_DISLIKES),
        ]);
        if (p)  setProfile(JSON.parse(p));
        if (pl) setPlan(JSON.parse(pl));
        if (r)  setRatings(JSON.parse(r));
        if (h)  setHistory(JSON.parse(h));
        if (d)  setDislikes(JSON.parse(d));
      } catch (_) {
        // Storage read failed — start fresh silently
      } finally {
        setLoading(false);
      }
    }
    hydrate();
  }, []);

  // ── Persist helpers ──────────────────────────────────────────────
  async function persist(key, value) {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  }

  // ── Onboarding complete ──────────────────────────────────────────
  const handleOnboardingComplete = useCallback(async (newProfile) => {
    const iteration = 1;
    const newPlan = generateWeekPlan(newProfile, iteration, []);
    const newHistory = [{
      version:           iteration,
      generatedAt:       newPlan.generatedAt,
      ratingsCount:      0,
      ratingsSum:        0,
      poorMealsReplaced: 0,
    }];

    setProfile(newProfile);
    setPlan(newPlan);
    setRatings({});
    setHistory(newHistory);
    setDislikes([]);

    await Promise.all([
      persist(KEY_PROFILE,  newProfile),
      persist(KEY_PLAN,     newPlan),
      persist(KEY_RATINGS,  {}),
      persist(KEY_HISTORY,  newHistory),
      persist(KEY_DISLIKES, []),
    ]);
  }, []);

  // ── Rate a meal ──────────────────────────────────────────────────
  const handleRate = useCallback(async (mealId, score) => {
    setRatings((prev) => {
      const next = { ...prev, [mealId]: score };
      persist(KEY_RATINGS, next);
      return next;
    });
  }, []);

  // ── Evolve plan (NAIM loop) ──────────────────────────────────────
  const handleEvolve = useCallback(async () => {
    if (!profile || !plan) return;

    // Compute evolved dislikes
    const newDislikes = evolvePlan(dislikes, ratings);
    const nextVersion = plan.version + 1;
    const newPlan     = generateWeekPlan(profile, nextVersion, newDislikes);

    // Log this iteration
    const ratingVals = Object.values(ratings);
    const iterRecord = {
      version:           plan.version,
      generatedAt:       plan.generatedAt,
      ratingsCount:      ratingVals.length,
      ratingsSum:        ratingVals.reduce((a, b) => a + b, 0),
      poorMealsReplaced: ratingVals.filter((r) => r <= 2).length,
    };

    const newHistory = [...history.filter((h) => h.version !== plan.version), iterRecord];

    // Add new iteration entry
    const nextHistoryEntry = {
      version:           nextVersion,
      generatedAt:       newPlan.generatedAt,
      ratingsCount:      0,
      ratingsSum:        0,
      poorMealsReplaced: 0,
    };
    const fullHistory = [...newHistory, nextHistoryEntry];

    setPlan(newPlan);
    setDislikes(newDislikes);
    setHistory(fullHistory);
    setRatings({});

    await Promise.all([
      persist(KEY_PLAN,     newPlan),
      persist(KEY_DISLIKES, newDislikes),
      persist(KEY_HISTORY,  fullHistory),
      persist(KEY_RATINGS,  {}),
    ]);
  }, [profile, plan, dislikes, ratings, history]);

  // ── Reset ────────────────────────────────────────────────────────
  const handleReset = useCallback(async () => {
    setProfile(null);
    setPlan(null);
    setRatings({});
    setHistory([]);
    setDislikes([]);
    try {
      await AsyncStorage.multiRemove([
        KEY_PROFILE, KEY_PLAN, KEY_RATINGS, KEY_HISTORY, KEY_DISLIKES,
      ]);
    } catch (_) {}
  }, []);

  // ── Render ───────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;

  if (!profile) {
    return (
      <View style={styles.root}>
        <StatusBar style="light" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <TitleBar tab={tab} plan={plan} />

      <View style={styles.screen}>
        {tab === 'plan' && (
          <DietPlanScreen
            plan={plan}
            profile={profile}
            ratings={ratings}
            onRate={handleRate}
            onEvolve={handleEvolve}
          />
        )}
        {tab === 'profile' && (
          <ProfileScreen
            profile={profile}
            plan={plan}
            history={history}
            onReset={handleReset}
          />
        )}
      </View>

      <TabBar active={tab} onChange={setTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  screen: { flex: 1 },
});
