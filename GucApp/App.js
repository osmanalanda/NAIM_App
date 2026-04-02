// KASA — Anlık Farkındalık Koçu
// İterasyon 11–13: Stats tab, bütçe limitleri, kategori filtresi, notlar
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Platform,
  Modal, TextInput, KeyboardAvoidingView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddScreen  from './src/screens/AddScreen';
import ListScreen from './src/screens/ListScreen';
import StatsScreen from './src/screens/StatsScreen';

const STORAGE_KEY  = '@kasa_expenses';
const BUDGETS_KEY  = '@kasa_budgets';

const TABS = [
  { id: 'add',   icon: '＋',  label: 'Ekle'   },
  { id: 'list',  icon: '📋', label: 'Liste'  },
  { id: 'stats', icon: '📊', label: 'Analiz' },
];

export default function App() {
  const [tab, setTab]           = useState('add');
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets]   = useState({});

  // Budget modal state
  const [budgetModal, setBudgetModal] = useState(null); // { cat }
  const [budgetInput, setBudgetInput] = useState('');

  // Load from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((r) => { if (r) setExpenses(JSON.parse(r)); }).catch(() => {});
    AsyncStorage.getItem(BUDGETS_KEY).then((r) => { if (r) setBudgets(JSON.parse(r)); }).catch(() => {});
  }, []);

  // Persist expenses
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses)).catch(() => {});
  }, [expenses]);

  // Persist budgets
  useEffect(() => {
    AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets)).catch(() => {});
  }, [budgets]);

  const handleSave = useCallback((entry) => {
    setExpenses((p) => [entry, ...p]);
    setTab('list');
  }, []);

  const handleDelete = useCallback((id) => {
    setExpenses((p) => p.filter((e) => e.id !== id));
  }, []);

  const openBudgetModal = useCallback((cat) => {
    setBudgetInput(budgets[cat.id] ? String(budgets[cat.id]) : '');
    setBudgetModal(cat);
  }, [budgets]);

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val <= 0) {
      // Remove budget
      setBudgets((p) => { const n = { ...p }; delete n[budgetModal.id]; return n; });
    } else {
      setBudgets((p) => ({ ...p, [budgetModal.id]: val }));
    }
    setBudgetModal(null);
  };

  // Title subtitle
  const now = new Date();
  const monthTotal = expenses
    .filter((e) => new Date(e.date) >= new Date(now.getFullYear(), now.getMonth(), 1))
    .reduce((s, e) => s + e.amount, 0);

  return (
    <View style={s.root}>
      {/* Title bar */}
      <View style={s.titleBar}>
        <Text style={s.titleText}>💰 Kasa</Text>
        <Text style={s.titleSub}>
          {expenses.length > 0
            ? `₺${monthTotal.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} bu ay`
            : 'harcama koçun'}
        </Text>
      </View>

      {/* Screens */}
      <View style={s.screen}>
        {tab === 'add'   && <AddScreen   onSave={handleSave} expenses={expenses} budgets={budgets} />}
        {tab === 'list'  && <ListScreen  expenses={expenses} onDelete={handleDelete} />}
        {tab === 'stats' && <StatsScreen expenses={expenses} budgets={budgets} onSetBudget={openBudgetModal} />}
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <TouchableOpacity key={t.id} style={s.tab} onPress={() => setTab(t.id)} activeOpacity={0.7}>
              <Text style={[s.tabIcon, active && s.tabIconActive]}>{t.icon}</Text>
              <Text style={[s.tabLabel, active && s.tabLabelActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Budget limit modal */}
      <Modal visible={!!budgetModal} transparent animationType="slide" onRequestClose={() => setBudgetModal(null)}>
        <KeyboardAvoidingView
          style={s.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity style={s.modalBg} activeOpacity={1} onPress={() => setBudgetModal(null)} />
          <View style={s.modalSheet}>
            <View style={s.modalHandle} />
            <Text style={s.modalTitle}>
              {budgetModal?.emoji}  {budgetModal?.label} Limiti
            </Text>
            <Text style={s.modalSub}>Aylık bütçe limiti (₺). Boş bırakırsan limit kaldırılır.</Text>
            <View style={s.modalInputRow}>
              <Text style={s.modalCurrency}>₺</Text>
              <TextInput
                style={s.modalInput}
                value={budgetInput}
                onChangeText={setBudgetInput}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#484F58"
                autoFocus
                selectTextOnFocus
              />
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalBtnCancel} onPress={() => setBudgetModal(null)}>
                <Text style={s.modalBtnCancelText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtnSave, budgetModal && { backgroundColor: budgetModal.color }]}
                onPress={saveBudget}
              >
                <Text style={s.modalBtnSaveText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#0D1117' },
  screen: { flex: 1 },

  titleBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 52,
    paddingBottom: 12,
    backgroundColor: '#0D1117',
    borderBottomWidth: 1, borderBottomColor: '#21262D',
  },
  titleText: { fontSize: 22, fontWeight: '800', color: '#E6EDF3' },
  titleSub:  { fontSize: 13, color: '#8B949E' },

  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1, borderTopColor: '#21262D',
    backgroundColor: '#0D1117',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
  },
  tab:          { flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 4 },
  tabIcon:      { fontSize: 22, color: '#484F58' },
  tabIconActive:{ color: '#F39C12' },
  tabLabel:     { fontSize: 11, color: '#484F58', marginTop: 2 },
  tabLabelActive:{ color: '#F39C12', fontWeight: '600' },

  // Budget modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBg:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    backgroundColor: '#161B22',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopWidth: 1, borderColor: '#21262D',
  },
  modalHandle:    { width: 40, height: 4, backgroundColor: '#484F58', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle:     { fontSize: 20, fontWeight: '700', color: '#E6EDF3', marginBottom: 6 },
  modalSub:       { fontSize: 13, color: '#8B949E', marginBottom: 20 },
  modalInputRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1117', borderRadius: 12, paddingHorizontal: 16, marginBottom: 20 },
  modalCurrency:  { fontSize: 24, color: '#8B949E', marginRight: 8 },
  modalInput:     { flex: 1, fontSize: 28, fontWeight: '700', color: '#E6EDF3', paddingVertical: 14 },
  modalBtns:      { flexDirection: 'row', gap: 12 },
  modalBtnCancel: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#21262D', alignItems: 'center' },
  modalBtnCancelText: { fontSize: 16, fontWeight: '600', color: '#8B949E' },
  modalBtnSave:   { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  modalBtnSaveText:   { fontSize: 16, fontWeight: '700', color: '#fff' },
});
