// KASA — İterasyon 2: Harcama Listesi + Toplam — 15kg
// 3 özellik: grup-by-gün liste, günlük toplam, sil
import React from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';

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
      date,
      data,
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
  const sections = groupByDay(expenses);
  const monthTotal = expenses.reduce((s, e) => s + e.amount, 0);

  if (expenses.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>💸</Text>
          <Text style={s.emptyTitle}>Henüz kayıt yok</Text>
          <Text style={s.emptySub}>Sol alttaki + ile ekle</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Monthly total header */}
      <View style={s.header}>
        <Text style={s.headerLabel}>Bu ay toplam</Text>
        <Text style={s.headerAmount}>
          ₺{monthTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </Text>
      </View>

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
              <Text style={s.rowCat}>{item.category.label}</Text>
              <Text style={s.rowTime}>
                {new Date(item.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <Text style={[s.rowAmount, { color: item.category.color }]}>
              ₺{item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Text>
            <TouchableOpacity
              onPress={() => onDelete(item.id)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={s.deleteBtn}
            >
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  headerLabel:  { fontSize: 12, color: '#8B949E', textTransform: 'uppercase', letterSpacing: 1 },
  headerAmount: { fontSize: 40, fontWeight: '800', color: '#E6EDF3', letterSpacing: -1, marginTop: 4 },

  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  dayLabel: { fontSize: 13, fontWeight: '600', color: '#8B949E', textTransform: 'uppercase', letterSpacing: 0.5 },
  dayTotal: { fontSize: 13, color: '#8B949E' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#161B22',
  },
  emojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji:    { fontSize: 22 },
  rowInfo:  { flex: 1 },
  rowCat:   { fontSize: 16, fontWeight: '600', color: '#E6EDF3' },
  rowTime:  { fontSize: 12, color: '#8B949E', marginTop: 2 },
  rowAmount:{ fontSize: 17, fontWeight: '700', marginRight: 12 },
  deleteBtn:{ padding: 4 },
  deleteTxt:{ fontSize: 14, color: '#484F58' },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#E6EDF3' },
  emptySub:   { fontSize: 14, color: '#8B949E', marginTop: 4 },
});
