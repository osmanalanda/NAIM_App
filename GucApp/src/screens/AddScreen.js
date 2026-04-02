// KASA — İterasyon 1: Hızlı Ekleme Ekranı — 15kg
// 3 özellik: rakam pad, kategori seçici, kaydetme
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';

const CATEGORIES = [
  { id: 'yemek',    label: 'Yemek',    emoji: '🍔', color: '#E74C3C' },
  { id: 'ulasim',   label: 'Ulaşım',   emoji: '🚌', color: '#3498DB' },
  { id: 'market',   label: 'Market',   emoji: '🛒', color: '#27AE60' },
  { id: 'eglence',  label: 'Eğlence',  emoji: '🎬', color: '#9B59B6' },
  { id: 'saglik',   label: 'Sağlık',   emoji: '💊', color: '#E67E22' },
  { id: 'diger',    label: 'Diğer',    emoji: '📦', color: '#7F8C8D' },
];

const PAD = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

export default function AddScreen({ onSave }) {
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState(null);

  const handlePad = (key) => {
    if (key === '⌫') {
      setAmount((prev) => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
      return;
    }
    if (key === '.' && amount.includes('.')) return;
    if (amount === '0' && key !== '.') {
      setAmount(key);
    } else {
      // max 2 decimal places
      const parts = (amount + key).split('.');
      if (parts[1] && parts[1].length > 2) return;
      setAmount(amount + key);
    }
  };

  const handleSave = () => {
    const num = parseFloat(amount);
    if (!num || num <= 0) { Alert.alert('Tutar gir', 'Sıfırdan büyük bir tutar gerekli.'); return; }
    if (!category)         { Alert.alert('Kategori seç', 'Hangi kategoriye kaydetmek istiyorsun?'); return; }
    const cat = CATEGORIES.find((c) => c.id === category);
    onSave({ amount: num, category: cat, date: new Date().toISOString(), id: Date.now().toString() });
    setAmount('0');
    setCategory(null);
  };

  const cat = CATEGORIES.find((c) => c.id === category);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Amount display */}
      <View style={s.amountBox}>
        <Text style={s.currency}>₺</Text>
        <Text style={s.amount} adjustsFontSizeToFit numberOfLines={1}>
          {parseFloat(amount).toLocaleString('tr-TR', { minimumFractionDigits: amount.includes('.') ? (amount.split('.')[1]?.length || 0) : 0 })}
        </Text>
      </View>

      {/* Category grid */}
      <View style={s.catGrid}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[s.catBtn, category === c.id && { borderColor: c.color, borderWidth: 2, backgroundColor: c.color + '22' }]}
            onPress={() => setCategory(c.id)}
            activeOpacity={0.7}
          >
            <Text style={s.catEmoji}>{c.emoji}</Text>
            <Text style={[s.catLabel, category === c.id && { color: c.color, fontWeight: '700' }]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Number pad */}
      <View style={s.pad}>
        {PAD.map((key) => (
          <TouchableOpacity
            key={key}
            style={[s.padBtn, key === '⌫' && s.padBtnDel]}
            onPress={() => handlePad(key)}
            activeOpacity={0.6}
          >
            <Text style={[s.padText, key === '⌫' && s.padTextDel]}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[s.saveBtn, cat && { backgroundColor: cat.color }]}
        onPress={handleSave}
        activeOpacity={0.85}
      >
        <Text style={s.saveBtnText}>
          {cat ? `${cat.emoji} ${cat.label}'e Kaydet` : 'Kategori Seç →'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    paddingHorizontal: 24,
  },
  currency: { fontSize: 32, color: '#8B949E', marginBottom: 6, marginRight: 4 },
  amount:   { fontSize: 72, fontWeight: '800', color: '#E6EDF3', letterSpacing: -2, flex: 1, textAlign: 'center' },

  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  catBtn: {
    width: '30%',
    flexGrow: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#161B22',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#21262D',
  },
  catEmoji: { fontSize: 22 },
  catLabel: { fontSize: 12, color: '#8B949E', marginTop: 2 },

  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  padBtn: {
    width: '30%',
    flexGrow: 1,
    paddingVertical: 18,
    borderRadius: 12,
    backgroundColor: '#161B22',
    alignItems: 'center',
  },
  padBtnDel: { backgroundColor: '#1C2128' },
  padText:    { fontSize: 24, fontWeight: '600', color: '#E6EDF3' },
  padTextDel: { fontSize: 20, color: '#E74C3C' },

  saveBtn: {
    marginHorizontal: 16,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#21262D',
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: { fontSize: 18, fontWeight: '700', color: '#fff' },
});
