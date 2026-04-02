// KASA — İterasyon 1: Hızlı Ekleme Ekranı — 15kg
// KASA — İterasyon 12: Bütçe geri bildirimi + Not alanı — 20kg
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, TextInput, ScrollView,
} from 'react-native';

export const CATEGORIES = [
  { id: 'yemek',   label: 'Yemek',   emoji: '🍔', color: '#E74C3C' },
  { id: 'ulasim',  label: 'Ulaşım',  emoji: '🚌', color: '#3498DB' },
  { id: 'market',  label: 'Market',  emoji: '🛒', color: '#27AE60' },
  { id: 'eglence', label: 'Eğlence', emoji: '🎬', color: '#9B59B6' },
  { id: 'saglik',  label: 'Sağlık',  emoji: '💊', color: '#E67E22' },
  { id: 'diger',   label: 'Diğer',   emoji: '📦', color: '#7F8C8D' },
];

const PAD = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

export default function AddScreen({ onSave, expenses = [], budgets = {} }) {
  const [amount, setAmount]     = useState('0');
  const [category, setCategory] = useState(null);
  const [note, setNote]         = useState('');

  const handlePad = (key) => {
    if (key === '⌫') { setAmount((p) => p.length <= 1 ? '0' : p.slice(0, -1)); return; }
    if (key === '.' && amount.includes('.')) return;
    if (amount === '0' && key !== '.') { setAmount(key); return; }
    const parts = (amount + key).split('.');
    if (parts[1] && parts[1].length > 2) return;
    setAmount(amount + key);
  };

  const handleSave = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) return;
    if (!category) return;
    const cat = CATEGORIES.find((c) => c.id === category);
    onSave({ amount: num, category: cat, date: new Date().toISOString(), id: Date.now().toString(), note: note.trim() });
    setAmount('0');
    setCategory(null);
    setNote('');
  };

  // Budget awareness: how much spent this month in selected category
  const getBudgetInfo = (catId) => {
    const budget = budgets[catId];
    if (!budget) return null;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const spent = expenses
      .filter((e) => e.category.id === catId && new Date(e.date) >= monthStart)
      .reduce((s, e) => s + e.amount, 0);
    const pct = (spent / budget) * 100;
    return { spent, budget, pct };
  };

  const cat = CATEGORIES.find((c) => c.id === category);
  const budgetInfo = category ? getBudgetInfo(category) : null;

  // Color feedback for save button / amount
  const amountNum = parseFloat(amount) || 0;
  const wouldExceed = budgetInfo && (budgetInfo.spent + amountNum) > budgetInfo.budget;
  const accentColor = wouldExceed ? '#F85149' : cat?.color ?? '#F39C12';

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>

        {/* Amount display */}
        <View style={s.amountBox}>
          <Text style={s.currency}>₺</Text>
          <Text style={[s.amount, { color: wouldExceed ? '#F85149' : '#E6EDF3' }]}
            adjustsFontSizeToFit numberOfLines={1}>
            {parseFloat(amount).toLocaleString('tr-TR', {
              minimumFractionDigits: amount.includes('.') ? (amount.split('.')[1]?.length || 0) : 0
            })}
          </Text>
        </View>

        {/* Budget awareness banner */}
        {budgetInfo && (
          <View style={[s.budgetBanner, { backgroundColor: wouldExceed ? '#F8514918' : '#21262D' }]}>
            <View style={s.budgetBarTrack}>
              <View style={[s.budgetBarFill, {
                width: `${Math.min(budgetInfo.pct, 100)}%`,
                backgroundColor: wouldExceed ? '#F85149' : budgetInfo.pct > 80 ? '#D29922' : '#3FB950',
              }]} />
            </View>
            <Text style={s.budgetBannerText}>
              {wouldExceed
                ? `⚠️  Limit aşılıyor! (₺${budgetInfo.spent.toFixed(0)} / ₺${budgetInfo.budget})`
                : `✓  ₺${budgetInfo.spent.toFixed(0)} / ₺${budgetInfo.budget} — %${Math.round(budgetInfo.pct)} kullanıldı`}
            </Text>
          </View>
        )}

        {/* Category grid */}
        <View style={s.catGrid}>
          {CATEGORIES.map((c) => {
            const bi = getBudgetInfo(c.id);
            const overBudget = bi && bi.pct >= 100;
            const nearLimit = bi && bi.pct >= 80 && bi.pct < 100;
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
                {overBudget  && <Text style={s.budgetDot}>🔴</Text>}
                {nearLimit   && <Text style={s.budgetDot}>🟡</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note input */}
        <View style={s.noteRow}>
          <Text style={s.noteIcon}>📝</Text>
          <TextInput
            style={s.noteInput}
            placeholder="Not ekle... (isteğe bağlı)"
            placeholderTextColor="#484F58"
            value={note}
            onChangeText={setNote}
            maxLength={80}
          />
        </View>

        {/* Number pad */}
        <View style={s.pad}>
          {PAD.map((key) => (
            <TouchableOpacity key={key} style={[s.padBtn, key === '⌫' && s.padBtnDel]}
              onPress={() => handlePad(key)} activeOpacity={0.6}>
              <Text style={[s.padText, key === '⌫' && s.padTextDel]}>{key}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Save button */}
        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: amountNum > 0 && cat ? accentColor : '#21262D' }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={s.saveBtnText}>
            {amountNum > 0 && cat
              ? wouldExceed
                ? `⚠️  Yine de Kaydet`
                : `${cat.emoji}  Kaydet`
              : cat ? 'Tutar gir' : 'Kategori Seç →'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },

  amountBox: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    paddingTop: 16, paddingBottom: 8, paddingHorizontal: 24,
  },
  currency: { fontSize: 28, color: '#8B949E', marginBottom: 8, marginRight: 4 },
  amount:   { fontSize: 64, fontWeight: '800', letterSpacing: -2, flex: 1, textAlign: 'center' },

  budgetBanner: {
    marginHorizontal: 16, borderRadius: 10, padding: 10, marginBottom: 4,
  },
  budgetBarTrack: { height: 4, backgroundColor: '#21262D', borderRadius: 2, marginBottom: 6, overflow: 'hidden' },
  budgetBarFill:  { height: '100%', borderRadius: 2 },
  budgetBannerText: { fontSize: 12, color: '#8B949E' },

  catGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  catBtn: {
    width: '30%', flexGrow: 1, paddingVertical: 10, borderRadius: 12,
    backgroundColor: '#161B22', alignItems: 'center', borderWidth: 1, borderColor: '#21262D',
  },
  catEmoji:  { fontSize: 22 },
  catLabel:  { fontSize: 12, color: '#8B949E', marginTop: 2 },
  budgetDot: { fontSize: 8, marginTop: 2 },

  noteRow: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: '#161B22', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 4,
    borderWidth: 1, borderColor: '#21262D',
  },
  noteIcon:  { fontSize: 16, marginRight: 8 },
  noteInput: { flex: 1, color: '#E6EDF3', fontSize: 14, paddingVertical: 8 },

  pad: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  padBtn:    { width: '30%', flexGrow: 1, paddingVertical: 16, borderRadius: 12, backgroundColor: '#161B22', alignItems: 'center' },
  padBtnDel: { backgroundColor: '#1C2128' },
  padText:    { fontSize: 22, fontWeight: '600', color: '#E6EDF3' },
  padTextDel: { fontSize: 18, color: '#E74C3C' },

  saveBtn:     { marginHorizontal: 16, paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 8 },
  saveBtnText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
