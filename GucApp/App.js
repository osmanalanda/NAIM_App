// KASA — Sürtünmesiz Harcama Takibi
// İterasyon 3: Tab navigasyon + AsyncStorage kalıcılığı — 15kg
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddScreen from './src/screens/AddScreen';
import ListScreen from './src/screens/ListScreen';

const STORAGE_KEY = '@kasa_expenses';

export default function App() {
  const [tab, setTab] = useState('add');
  const [expenses, setExpenses] = useState([]);

  // Load from storage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => { if (raw) setExpenses(JSON.parse(raw)); })
      .catch(() => {});
  }, []);

  // Persist whenever expenses change
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)).catch(() => {});
  }, [expenses]);

  const handleSave = useCallback((entry) => {
    setExpenses((prev) => [entry, ...prev]);
    setTab('list');
  }, []);

  const handleDelete = useCallback((id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return (
    <View style={s.root}>
      {/* Top title bar */}
      <View style={s.titleBar}>
        <Text style={s.titleText}>💰 Kasa</Text>
        <Text style={s.titleSub}>
          {expenses.length > 0
            ? `${expenses.length} kayıt`
            : 'hızlı harcama takibi'}
        </Text>
      </View>

      {/* Screen content */}
      <View style={s.screen}>
        {tab === 'add'
          ? <AddScreen onSave={handleSave} />
          : <ListScreen expenses={expenses} onDelete={handleDelete} />}
      </View>

      {/* Bottom tab bar */}
      <View style={s.tabBar}>
        <TouchableOpacity
          style={[s.tab, tab === 'add' && s.tabActive]}
          onPress={() => setTab('add')}
          activeOpacity={0.7}
        >
          <Text style={[s.tabIcon, tab === 'add' && s.tabIconActive]}>＋</Text>
          <Text style={[s.tabLabel, tab === 'add' && s.tabLabelActive]}>Ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.tab, tab === 'list' && s.tabActive]}
          onPress={() => setTab('list')}
          activeOpacity={0.7}
        >
          <Text style={[s.tabIcon, tab === 'list' && s.tabIconActive]}>📋</Text>
          <Text style={[s.tabLabel, tab === 'list' && s.tabLabelActive]}>Liste</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0D1117' },
  screen: { flex: 1 },

  titleBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 52,
    paddingBottom: 12,
    backgroundColor: '#0D1117',
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  titleText: { fontSize: 22, fontWeight: '800', color: '#E6EDF3' },
  titleSub:  { fontSize: 13, color: '#8B949E' },

  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#21262D',
    backgroundColor: '#0D1117',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  tabActive: {},
  tabIcon:        { fontSize: 24, color: '#484F58' },
  tabIconActive:  { color: '#F39C12' },
  tabLabel:       { fontSize: 11, color: '#484F58', marginTop: 2 },
  tabLabelActive: { color: '#F39C12', fontWeight: '600' },
});
