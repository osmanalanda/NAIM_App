// KASA — İterasyon 2: Harcama Listesi — 15kg
// KASA — İterasyon 13: Kategori filtresi + not gösterimi — 15kg
import React, { useState, useMemo } from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { CATEGORIES } from './AddScreen';

function groupByDay(expenses) {
  const map = {};
  expenses.forEach((e) => {
    const day = e.date.split('T')[0];
    if (!map[day]) map[day] = [];
    map[day].push(e);
  });
  return Object.entries(map)
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, data]) => ({
      date, data,
      total: data.reduce((s, e) => s + e.amount, 0),
    }));
}

function formatDay(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Bugün';
  if (d.toDateString() === yesterday.toDateString()) return 'Dün';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
}

export default function ListScreen({ expenses, onDelete }) {
  const [filterCat, setFilterCat] = useState(null);

  const filtered = useMemo(
    () => filterCat ? expenses.filter((e) => e.category.id === filterCat) : expenses,
    [expenses, filterCat]
  );
  const sections  = useMemo(() => groupByDay(filtered), [filtered]);
  const monthTotal = expenses.reduce((s, e) => s + e.amount, 0);
  const filterTotal = filtered.reduce((s, e) => s + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>💸</Text>
          <Text style={s.emptyTitle}>Henüz kayıt yok</Text>
          <Text style={s.emptySub}>Ekle tabından başla</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Monthly total header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerLabel}>
            {filterCat ? CATEGORIES.find((c) => c.id === filterCat)?.label : 'Bu ay toplam'}
          </Text>
          <Text style={s.headerAmount}>
            ₺{(filterCat ? filterTotal : monthTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
        {filterCat && (
          <Text style={s.headerCount}>{filtered.length} kayıt</Text>
        )}
      </View>

      {/* Category filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}
        contentContainerStyle={s.chipRow}>
        <TouchableOpacity
          style={[s.chip, !filterCat && s.chipActive]}
          onPress={() => setFilterCat(null)}
        >
          <Text style={[s.chipText, !filterCat && s.chipTextActive]}>Tümü</Text>
        </TouchableOpacity>
        {CATEGORIES.map((c) => {
          const hasExpense = expenses.some((e) => e.category.id === c.id);
          if (!hasExpense) return null;
          const active = filterCat === c.id;
          return (
            <TouchableOpacity
              key={c.id}
              style={[s.chip, active && { borderColor: c.color, backgroundColor: c.color + '22' }]}
              onPress={() => setFilterCat(active ? null : c.id)}
            >
              <Text style={s.chipEmoji}>{c.emoji}</Text>
              <Text style={[s.chipText, active && { color: c.color, fontWeight: '700' }]}>
                {c.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderSectionHeader={({ section }) => (
          <View style={s.dayHeader}>
            <Text style={s.dayLabel}>{formatDay(section.date)}</Text>
            <Text style={s.dayTotal}>
              ₺{section.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={s.row}>
            <View style={[s.emojiBox, { backgroundColor: item.category.color + '22' }]}>
              <Text style={s.emoji}>{item.category.emoji}</Text>
            </View>
            <View style={s.rowInfo}>
              <View style={s.rowTop}>
                <Text style={s.rowCat}>{item.category.label}</Text>
                {item.note ? <Text style={s.noteIcon}>📝</Text> : null}
              </View>
              {item.note ? (
                <Text style={s.rowNote} numberOfLines={1}>{item.note}</Text>
              ) : (
                <Text style={s.rowTime}>
                  {new Date(item.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              )}
            </View>
            <Text style={[s.rowAmount, { color: item.category.color }]}>
              ₺{item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Text>
            <TouchableOpacity onPress={() => onDelete(item.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={s.deleteBtn}>
              <Text style={s.deleteTxt}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 20, paddingVertical: 20,
    borderBottomWidth: 1, borderBottomColor: '#21262D',
  },
  headerLabel:  { fontSize: 12, color: '#8B949E', textTransform: 'uppercase', letterSpacing: 1 },
  headerAmount: { fontSize: 36, fontWeight: '800', color: '#E6EDF3', letterSpacing: -1, marginTop: 4 },
  headerCount:  { fontSize: 13, color: '#8B949E', marginBottom: 6 },

  chipScroll: { maxHeight: 52 },
  chipRow:    { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#161B22', borderWidth: 1, borderColor: '#21262D',
  },
  chipActive:    { borderColor: '#F39C12', backgroundColor: '#F39C1222' },
  chipEmoji:     { fontSize: 13 },
  chipText:      { fontSize: 13, color: '#8B949E' },
  chipTextActive:{ color: '#F39C12', fontWeight: '700' },

  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8,
  },
  dayLabel: { fontSize: 13, fontWeight: '600', color: '#8B949E', textTransform: 'uppercase', letterSpacing: 0.5 },
  dayTotal: { fontSize: 13, color: '#8B949E' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#161B22',
  },
  emojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji:    { fontSize: 22 },
  rowInfo:  { flex: 1 },
  rowTop:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowCat:   { fontSize: 16, fontWeight: '600', color: '#E6EDF3' },
  noteIcon: { fontSize: 12 },
  rowNote:  { fontSize: 12, color: '#8B949E', marginTop: 2, fontStyle: 'italic' },
  rowTime:  { fontSize: 12, color: '#484F58', marginTop: 2 },
  rowAmount:{ fontSize: 17, fontWeight: '700', marginRight: 12 },
  deleteBtn:{ padding: 4 },
  deleteTxt:{ fontSize: 14, color: '#484F58' },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#E6EDF3' },
  emptySub:   { fontSize: 14, color: '#8B949E', marginTop: 4 },
});
