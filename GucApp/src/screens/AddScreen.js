// Warranty & Free Trial Tracker — Add Item Screen
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';

export const CATEGORIES = [
  { id: 'electronics',   label: 'Electronics',   emoji: '📱', color: '#3498DB' },
  { id: 'software',      label: 'Software',      emoji: '💻', color: '#9B59B6' },
  { id: 'subscriptions', label: 'Subscriptions', emoji: '🔄', color: '#E74C3C' },
  { id: 'appliances',    label: 'Appliances',    emoji: '🏠', color: '#27AE60' },
  { id: 'services',      label: 'Services',      emoji: '🔧', color: '#E67E22' },
  { id: 'other',         label: 'Other',         emoji: '📦', color: '#7F8C8D' },
];

function daysUntil(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + 'T00:00:00');
  if (isNaN(exp.getTime())) return null;
  return Math.round((exp - now) / (1000 * 60 * 60 * 24));
}

export default function AddScreen({ onSave, items = [], alerts = {} }) {
  const [name, setName]           = useState('');
  const [cost, setCost]           = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [category, setCategory]   = useState(null);
  const [note, setNote]           = useState('');

  // Auto-insert dashes: YYYY-MM-DD
  const handleDateChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    let formatted = cleaned;
    if (cleaned.length > 4) formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
    if (cleaned.length > 6) formatted = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
    setExpiryDate(formatted.slice(0, 10));
  };

  const days = daysUntil(expiryDate);
  const isValidDate = expiryDate.length === 10 && days !== null;
  const canSave = name.trim().length > 0 && category !== null && isValidDate;

  // Alert awareness: how many items in this category are expiring within alert threshold
  const getAlertInfo = (catId) => {
    const threshold = alerts[catId];
    if (!threshold) return null;
    const expiring = items.filter((item) => {
      if (item.category.id !== catId) return false;
      const d = daysUntil(item.expiryDate);
      return d !== null && d >= 0 && d <= threshold;
    });
    return { threshold, count: expiring.length };
  };

  const cat = CATEGORIES.find((c) => c.id === category);
  const alertInfo = category ? getAlertInfo(category) : null;

  const expiryColor = !isValidDate ? '#8B949E'
    : days < 0  ? '#F85149'
    : days <= 30 ? '#D29922'
    : '#3FB950';

  const handleSave = () => {
    if (!canSave) return;
    const catObj = CATEGORIES.find((c) => c.id === category);
    onSave({
      id: Date.now().toString(),
      name: name.trim(),
      cost: cost ? parseFloat(cost) || 0 : 0,
      category: catObj,
      expiryDate,
      purchaseDate: new Date().toISOString().split('T')[0],
      note: note.trim(),
    });
    setName('');
    setCost('');
    setExpiryDate('');
    setCategory(null);
    setNote('');
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>

          {/* Item name */}
          <View style={s.inputRow}>
            <Text style={s.inputIcon}>🏷️</Text>
            <TextInput
              style={s.inputField}
              placeholder="Item name (e.g. iPhone 15, Netflix...)"
              placeholderTextColor="#484F58"
              value={name}
              onChangeText={setName}
              maxLength={60}
            />
          </View>

          {/* Expiry date + Cost */}
          <View style={s.rowTwo}>
            <View style={[s.inputRowSmall, { flex: 1.4 }]}>
              <Text style={s.inputIcon}>📅</Text>
              <TextInput
                style={[s.inputField, { color: expiryColor }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#484F58"
                value={expiryDate}
                onChangeText={handleDateChange}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={[s.inputRowSmall, { flex: 1 }]}>
              <Text style={s.inputIcon}>$</Text>
              <TextInput
                style={s.inputField}
                placeholder="Cost (opt.)"
                placeholderTextColor="#484F58"
                value={cost}
                onChangeText={setCost}
                keyboardType="decimal-pad"
                maxLength={10}
              />
            </View>
          </View>

          {/* Expiry preview banner */}
          {isValidDate && (
            <View style={[s.expiryBanner, {
              backgroundColor: days < 0 ? '#F8514918' : days <= 30 ? '#D2992218' : '#3FB95018',
            }]}>
              <Text style={[s.expiryBannerText, { color: expiryColor }]}>
                {days < 0
                  ? `⚠️  Expired ${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} ago`
                  : days === 0
                  ? '⚠️  Expires today!'
                  : `✓  ${days} day${days !== 1 ? 's' : ''} until expiry`}
              </Text>
            </View>
          )}

          {/* Alert banner for selected category */}
          {alertInfo && alertInfo.count > 0 && (
            <View style={s.alertBanner}>
              <Text style={s.alertBannerText}>
                🔔  {alertInfo.count} item{alertInfo.count !== 1 ? 's' : ''} in this category expiring within {alertInfo.threshold} days
              </Text>
            </View>
          )}

          {/* Category grid */}
          <View style={s.catGrid}>
            {CATEGORIES.map((c) => {
              const ai = getAlertInfo(c.id);
              const hasExpiring = ai && ai.count > 0;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    s.catBtn,
                    category === c.id && { borderColor: c.color, borderWidth: 2, backgroundColor: c.color + '22' },
                  ]}
                  onPress={() => setCategory(c.id)}
                  activeOpacity={0.7}
                >
                  <Text style={s.catEmoji}>{c.emoji}</Text>
                  <Text style={[s.catLabel, category === c.id && { color: c.color, fontWeight: '700' }]}>
                    {c.label}
                  </Text>
                  {hasExpiring && <Text style={s.alertDot}>🔴</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Note input */}
          <View style={s.noteRow}>
            <Text style={s.noteIcon}>📝</Text>
            <TextInput
              style={s.noteInput}
              placeholder="Add note... (optional)"
              placeholderTextColor="#484F58"
              value={note}
              onChangeText={setNote}
              maxLength={80}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[s.saveBtn, { backgroundColor: canSave ? (cat?.color ?? '#F39C12') : '#21262D' }]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={s.saveBtnText}>
              {!name.trim()   ? '🏷️  Enter item name'
                : !category  ? '📁  Select a category'
                : !isValidDate ? '📅  Enter expiry date'
                : `${cat.emoji}  Save Item`}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },

  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginTop: 16, marginBottom: 8,
    backgroundColor: '#161B22', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, borderColor: '#21262D',
  },
  rowTwo: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 8, gap: 8,
  },
  inputRowSmall: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161B22', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 4,
    borderWidth: 1, borderColor: '#21262D',
  },
  inputIcon:  { fontSize: 18, marginRight: 8 },
  inputField: { flex: 1, color: '#E6EDF3', fontSize: 15, paddingVertical: 12 },

  expiryBanner: {
    marginHorizontal: 16, borderRadius: 10, padding: 10, marginBottom: 4,
  },
  expiryBannerText: { fontSize: 13, fontWeight: '600' },

  alertBanner: {
    marginHorizontal: 16, borderRadius: 10, padding: 10, marginBottom: 4,
    backgroundColor: '#F39C1218',
  },
  alertBannerText: { fontSize: 12, color: '#F39C12' },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginTop: 8, marginBottom: 8 },
  catBtn: {
    width: '30%', flexGrow: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#161B22', alignItems: 'center', borderWidth: 1, borderColor: '#21262D',
  },
  catEmoji: { fontSize: 22 },
  catLabel: { fontSize: 12, color: '#8B949E', marginTop: 2 },
  alertDot: { fontSize: 8, marginTop: 2 },

  noteRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 12,
    backgroundColor: '#161B22', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: '#21262D',
  },
  noteIcon:  { fontSize: 16, marginRight: 8 },
  noteInput: { flex: 1, color: '#E6EDF3', fontSize: 14, paddingVertical: 8 },

  saveBtn:     { marginHorizontal: 16, paddingVertical: 16, borderRadius: 16, alignItems: 'center' },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
