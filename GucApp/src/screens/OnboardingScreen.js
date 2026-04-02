/**
 * NAIM Diet Planner — Onboarding Wizard
 * Copyright (C) 2024  NAIM Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// NAIM Iteration 1 — 5-step onboarding wizard — 20kg

import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Animated, Platform, KeyboardAvoidingView,
  Dimensions,
} from 'react-native';
import { C, FONT, RADIUS, SPACE, glassCard } from '../theme/colors';
import { DIET_OPTIONS, ACTIVITY_OPTIONS, GOAL_OPTIONS } from '../engine/dietEngine';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Step definitions ────────────────────────────────────────────
const STEPS = [
  { id: 'welcome',  title: 'Welcome to NAIM Diet',  subtitle: 'Your private, offline diet planner' },
  { id: 'body',     title: 'Your Body',              subtitle: 'Used only to calculate your calorie needs' },
  { id: 'activity', title: 'Activity Level',         subtitle: 'How active is your daily life?' },
  { id: 'goal',     title: 'Your Goal',              subtitle: 'What are you working towards?' },
  { id: 'diet',     title: 'Dietary Preference',     subtitle: 'We\'ll tailor every meal to you' },
];

const TOTAL = STEPS.length;

// ─── Small reusable pieces ────────────────────────────────────────

function StepDots({ current }) {
  return (
    <View style={styles.dots}>
      {STEPS.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < current && styles.dotDone,
            i === current && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

function GlassInput({ label, value, onChangeText, keyboardType = 'default', suffix, placeholder }) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder || ''}
          placeholderTextColor={C.textFaint}
          selectionColor={C.mint}
        />
        {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function OptionCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.optCard, selected && styles.optCardActive]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={styles.optEmoji}>{item.emoji}</Text>
      <View style={styles.optText}>
        <Text style={[styles.optLabel, selected && styles.optLabelActive]}>{item.label}</Text>
        <Text style={styles.optDesc}>{item.desc}</Text>
      </View>
      <View style={[styles.optDot, selected && styles.optDotActive]} />
    </TouchableOpacity>
  );
}

// ─── Steps ───────────────────────────────────────────────────────

function WelcomeStep({ data, setData }) {
  return (
    <View style={styles.stepContent}>
      <Text style={styles.heroEmoji}>🥗</Text>
      <Text style={styles.heroTitle}>NAIM Diet</Text>
      <Text style={styles.heroSub}>
        A personalized, self-evolving diet planner.{'\n'}
        Everything runs <Text style={{ color: C.mint, fontWeight: '700' }}>100% on your device</Text> —
        no servers, no cloud, no tracking.
      </Text>

      <View style={styles.featureList}>
        {[
          ['🔒', 'Absolute Privacy', 'Your data never leaves your phone'],
          ['🧠', 'Smart Generation', 'Precise calories & macros per meal'],
          ['🔄', 'Self-Evolving', 'Learns from your feedback each week'],
          ['🌱', 'Free Software', 'Licensed under GNU GPL v3'],
        ].map(([emoji, title, desc]) => (
          <View key={title} style={styles.featureRow}>
            <Text style={styles.featureEmoji}>{emoji}</Text>
            <View>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <GlassInput
        label="Your Name (optional)"
        value={data.name || ''}
        onChangeText={(v) => setData({ ...data, name: v })}
        placeholder="e.g. Alex"
      />
    </View>
  );
}

function BodyStep({ data, setData }) {
  return (
    <View style={styles.stepContent}>
      <View style={styles.genderRow}>
        {[
          { id: 'male',   label: 'Male',   emoji: '♂️' },
          { id: 'female', label: 'Female', emoji: '♀️' },
        ].map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.genderCard, data.gender === g.id && styles.genderCardActive]}
            onPress={() => setData({ ...data, gender: g.id })}
            activeOpacity={0.8}
          >
            <Text style={styles.genderEmoji}>{g.emoji}</Text>
            <Text style={[styles.genderLabel, data.gender === g.id && styles.genderLabelActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <GlassInput
        label="Age"
        value={data.age || ''}
        onChangeText={(v) => setData({ ...data, age: v.replace(/[^0-9]/g, '') })}
        keyboardType="numeric"
        suffix="years"
        placeholder="25"
      />
      <GlassInput
        label="Height"
        value={data.heightCm || ''}
        onChangeText={(v) => setData({ ...data, heightCm: v.replace(/[^0-9]/g, '') })}
        keyboardType="numeric"
        suffix="cm"
        placeholder="170"
      />
      <GlassInput
        label="Weight"
        value={data.weightKg || ''}
        onChangeText={(v) => setData({ ...data, weightKg: v.replace(/[^0-9.]/g, '') })}
        keyboardType="decimal-pad"
        suffix="kg"
        placeholder="70"
      />
    </View>
  );
}

function ActivityStep({ data, setData }) {
  return (
    <View style={styles.stepContent}>
      {ACTIVITY_OPTIONS.map((item) => (
        <OptionCard
          key={item.id}
          item={item}
          selected={data.activity === item.id}
          onPress={() => setData({ ...data, activity: item.id })}
        />
      ))}
    </View>
  );
}

function GoalStep({ data, setData }) {
  return (
    <View style={styles.stepContent}>
      {GOAL_OPTIONS.map((item) => (
        <OptionCard
          key={item.id}
          item={item}
          selected={data.goal === item.id}
          onPress={() => setData({ ...data, goal: item.id })}
        />
      ))}
    </View>
  );
}

function DietStep({ data, setData }) {
  return (
    <View style={styles.stepContent}>
      {DIET_OPTIONS.map((item) => (
        <OptionCard
          key={item.id}
          item={item}
          selected={data.diet === item.id}
          onPress={() => setData({ ...data, diet: item.id })}
        />
      ))}
    </View>
  );
}

// ─── Validation ───────────────────────────────────────────────────

function canProceed(stepId, data) {
  switch (stepId) {
    case 'welcome':  return true;
    case 'body':
      return data.gender &&
        data.age && parseInt(data.age) > 0 &&
        data.heightCm && parseInt(data.heightCm) > 0 &&
        data.weightKg && parseFloat(data.weightKg) > 0;
    case 'activity': return !!data.activity;
    case 'goal':     return !!data.goal;
    case 'diet':     return !!data.diet;
    default: return true;
  }
}

// ─── Main Screen ─────────────────────────────────────────────────

export default function OnboardingScreen({ onComplete }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState({
    name: '', gender: '', age: '', heightCm: '', weightKg: '',
    activity: '', goal: '', diet: '',
  });
  const slideAnim = useRef(new Animated.Value(0)).current;

  const step = STEPS[stepIdx];
  const ready = canProceed(step.id, data);

  function animateNext(direction) {
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -30 : 30,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function next() {
    if (!ready) return;
    if (stepIdx === TOTAL - 1) {
      // Build final profile
      const profile = {
        name:      data.name.trim() || 'You',
        gender:    data.gender,
        age:       parseInt(data.age),
        heightCm:  parseInt(data.heightCm),
        weightKg:  parseFloat(data.weightKg),
        activity:  data.activity,
        goal:      data.goal,
        diet:      data.diet,
        createdAt: Date.now(),
      };
      onComplete(profile);
    } else {
      animateNext('next');
      setStepIdx((i) => i + 1);
    }
  }

  function back() {
    if (stepIdx === 0) return;
    animateNext('back');
    setStepIdx((i) => i - 1);
  }

  function renderStep() {
    switch (step.id) {
      case 'welcome':  return <WelcomeStep  data={data} setData={setData} />;
      case 'body':     return <BodyStep     data={data} setData={setData} />;
      case 'activity': return <ActivityStep data={data} setData={setData} />;
      case 'goal':     return <GoalStep     data={data} setData={setData} />;
      case 'diet':     return <DietStep     data={data} setData={setData} />;
      default: return null;
    }
  }

  const isLast = stepIdx === TOTAL - 1;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <StepDots current={stepIdx} />
        <Text style={styles.stepCount}>{stepIdx + 1} / {TOTAL}</Text>
      </View>

      {/* Titles */}
      <View style={styles.titles}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            {renderStep()}
          </Animated.View>
        </ScrollView>

        {/* Navigation */}
        <View style={styles.navBar}>
          {stepIdx > 0 ? (
            <TouchableOpacity style={styles.btnBack} onPress={back} activeOpacity={0.75}>
              <Text style={styles.btnBackText}>← Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          <TouchableOpacity
            style={[styles.btnNext, !ready && styles.btnNextDisabled]}
            onPress={next}
            activeOpacity={0.85}
            disabled={!ready}
          >
            <Text style={styles.btnNextText}>
              {isLast ? '🚀  Generate My Plan' : 'Continue →'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'android' ? 44 : 56,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACE.lg, marginBottom: SPACE.md,
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: C.bgCardHi,
    borderWidth: 1, borderColor: C.border,
  },
  dotDone:   { backgroundColor: C.mint, borderColor: C.mint, opacity: 0.5 },
  dotActive: { backgroundColor: C.mint, borderColor: C.mint, width: 24 },
  stepCount: { fontSize: FONT.sm, color: C.textFaint, fontWeight: '600' },

  // Titles
  titles: { paddingHorizontal: SPACE.lg, marginBottom: SPACE.lg },
  stepTitle: {
    fontSize: FONT.xxl, fontWeight: '800', color: C.text,
    letterSpacing: -0.5, marginBottom: 6,
  },
  stepSubtitle: { fontSize: FONT.md, color: C.textSub },

  // Scroll
  scrollContent: { paddingHorizontal: SPACE.lg, paddingBottom: 120 },
  stepContent:   { gap: SPACE.md },

  // Welcome hero
  heroEmoji: { fontSize: 72, textAlign: 'center', marginBottom: SPACE.sm },
  heroTitle: {
    fontSize: FONT.hero, fontWeight: '900', color: C.text,
    textAlign: 'center', letterSpacing: -1, marginBottom: SPACE.sm,
  },
  heroSub: {
    fontSize: FONT.md, color: C.textSub, textAlign: 'center',
    lineHeight: 24, marginBottom: SPACE.lg,
  },
  featureList: { gap: 12 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 14, ...glassCard, padding: 14 },
  featureEmoji:{ fontSize: 28 },
  featureTitle:{ fontSize: FONT.md, fontWeight: '700', color: C.text, marginBottom: 2 },
  featureDesc: { fontSize: FONT.sm, color: C.textFaint },

  // Input
  inputGroup:  { gap: 8 },
  inputLabel:  { fontSize: FONT.sm, fontWeight: '600', color: C.textSub, letterSpacing: 0.5 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    ...glassCard, paddingHorizontal: 16,
  },
  input: {
    flex: 1, fontSize: FONT.xl, fontWeight: '700', color: C.text,
    paddingVertical: 16,
  },
  inputSuffix: { fontSize: FONT.md, color: C.textFaint, marginLeft: 8 },

  // Gender
  genderRow: { flexDirection: 'row', gap: SPACE.sm },
  genderCard: {
    flex: 1, alignItems: 'center', paddingVertical: SPACE.lg,
    ...glassCard, gap: 8,
  },
  genderCardActive: {
    backgroundColor: C.mintDim, borderColor: C.mint,
  },
  genderEmoji: { fontSize: 36 },
  genderLabel: { fontSize: FONT.md, fontWeight: '700', color: C.textSub },
  genderLabelActive: { color: C.mint },

  // Option cards
  optCard: {
    flexDirection: 'row', alignItems: 'center',
    ...glassCard, padding: 16, gap: 14,
  },
  optCardActive: { backgroundColor: C.mintDim, borderColor: C.mint },
  optEmoji:  { fontSize: 30, width: 40, textAlign: 'center' },
  optText:   { flex: 1 },
  optLabel:  { fontSize: FONT.md, fontWeight: '700', color: C.text, marginBottom: 2 },
  optLabelActive: { color: C.mint },
  optDesc:   { fontSize: FONT.sm, color: C.textFaint },
  optDot: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: C.border,
  },
  optDotActive: {
    borderColor: C.mint,
    backgroundColor: C.mint,
  },

  // Nav bar
  navBar: {
    flexDirection: 'row', gap: SPACE.sm,
    paddingHorizontal: SPACE.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: SPACE.md,
    borderTopWidth: 1, borderTopColor: C.border,
    backgroundColor: C.bg,
  },
  btnBack: {
    flex: 1, paddingVertical: 18, borderRadius: RADIUS.lg,
    backgroundColor: C.bgCard, borderWidth: 1, borderColor: C.border,
    alignItems: 'center',
  },
  btnBackText: { fontSize: FONT.md, fontWeight: '600', color: C.textSub },

  btnNext: {
    flex: 2, paddingVertical: 18, borderRadius: RADIUS.lg,
    backgroundColor: C.mint, alignItems: 'center',
    shadowColor: C.mint, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.40, shadowRadius: 14, elevation: 8,
  },
  btnNextDisabled: {
    backgroundColor: C.bgCardHi, shadowOpacity: 0,
  },
  btnNextText: {
    fontSize: FONT.md, fontWeight: '800', color: C.textInv,
  },
});
