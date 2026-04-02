// Warranty & Free Trial Tracker — Items List Screen
import React, { useState, useMemo } from 'react';
import {
  View, Text, SectionList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { CATEGORIES } from './AddScreen';

function daysUntil(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + 'T00:00:00');
  if (isNaN(exp.getTime())) return null;
  return Math.round((exp - now) / (1000 * 60 * 60 * 24));
}

function groupByStatus(items) {
  const expired = [];
  const soon    = [];
  const active  = [];

  items.forEach((item) => {
    const d = daysUntil(item.expiryDate);
    if (d === null || d > 30) active.push(item);
    else if (d < 0)           expired.push(item);
    else                      soon.push(item);
  });

  const byExp = (a, b) => a.expiryDate.localeCompare(b.expiryDate);
  expired.sort(byExp);
  soon.sort(byExp);
  active.sort(byExp);

  const sections = [];
  if (expired.length) sections.push({ title: 'Expired',       data: expired, status: 'expired' });
  if (soon.length)    sections.push({ title: 'Expiring Soon',  data: soon,    status: 'soon'    });
  if (active.length)  sections.push({ title: 'Active',         data: active,  status: 'active'  });
  return sections;
}

const STATUS_COLORS = { expired: '#F85149', soon: '#D29922', active: '#3FB950' };

export default function ListScreen({ items, onDelete }) {
  const [filterCat, setFilterCat] = useState(null);

  const filtered = useMemo(
    () => filterCat ? items.filter((e) => e.category.id === filterCat) : items,
    [items, filterCat]
  );
  const sections = useMemo(() => groupByStatus(filtered), [filtered]);

  const activeCount   = items.filter((i) => { const d = daysUntil(i.expiryDate); return d === null || d >= 0; }).length;
  const expiringCount = items.filter((i) => { const d = daysUntil(i.expiryDate); return d !== null && d >= 0 && d <= 30; }).length;

  if (items.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
        <View style={s.empty}>
          <Text style={s.emptyEmoji}>🛡️</Text>
          <Text style={s.emptyTitle}>No items yet</Text>
          <Text style={s.emptySub}>Add your first warranty or trial</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      {/* Header */}
      <View style={s.header}>
        <View>
          <Text style={s.headerLabel}>Active items</Text>
          <Text style={s.headerCount}>{activeCount}</Text>
        </View>
        {expiringCount > 0 && (
          <View style={s.expiringBadge}>
            <Text style={s.expiringBadgeText}>⚠️  {expiringCount} expiring soon</Text>
          </View>
        )}
      </View>

      {/* Category filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}
        contentContainerStyle={s.chipRow}>
        <TouchableOpacity
          style={[s.chip, !filterCat && s.chipActive]}
          onPress={() => setFilterCat(null)}
        >
          <Text style={[s.chipText, !filterCat && s.chipTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((c) => {
          const hasItem = items.some((e) => e.category.id === c.id);
          if (!hasItem) return null;
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
          <View style={s.sectionHeader}>
            <View style={[s.sectionDot, { backgroundColor: STATUS_COLORS[section.status] }]} />
            <Text style={[s.sectionLabel, { color: STATUS_COLORS[section.status] }]}>
              {section.title}
            </Text>
            <Text style={s.sectionCount}>{section.data.length}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const d = daysUntil(item.expiryDate);
          const dayColor = d === null ? '#8B949E'
            : d < 0   ? '#F85149'
            : d <= 30  ? '#D29922'
            : '#3FB950';
          const dayLabel = d === null ? '—'
            : d < 0   ? `${Math.abs(d)}d ago`
            : d === 0 ? 'Today!'
            : `${d}d left`;

          return (
            <View style={s.row}>
              <View style={[s.emojiBox, { backgroundColor: item.category.color + '22' }]}>
                <Text style={s.emoji}>{item.category.emoji}</Text>
              </View>
              <View style={s.rowInfo}>
                <Text style={s.rowName} numberOfLines={1}>{item.name}</Text>
                <Text style={s.rowMeta}>
                  {item.category.label}{item.note ? ` · ${item.note}` : ''}
                </Text>
              </View>
              <View style={s.rowRight}>
                <Text style={[s.dayLabel, { color: dayColor }]}>{dayLabel}</Text>
                {item.cost > 0 && (
                  <Text style={s.costLabel}>
                    ${item.cost.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => onDelete(item.id)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} style={s.deleteBtn}>
                <Text style={s.deleteTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 20,
    borderBottomWidth: 1, borderBottomColor: '#21262D',
  },
  headerLabel:  { fontSize: 12, color: '#8B949E', textTransform: 'uppercase', letterSpacing: 1 },
  headerCount:  { fontSize: 36, fontWeight: '800', color: '#E6EDF3', letterSpacing: -1, marginTop: 4 },
  expiringBadge: {
    backgroundColor: '#D2992218', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 10, borderWidth: 1, borderColor: '#D2992240',
  },
  expiringBadgeText: { fontSize: 13, color: '#D29922', fontWeight: '600' },

  chipScroll: { maxHeight: 52 },
  chipRow:    { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
    backgroundColor: '#161B22', borderWidth: 1, borderColor: '#21262D',
  },
  chipActive:     { borderColor: '#F39C12', backgroundColor: '#F39C1222' },
  chipEmoji:      { fontSize: 13 },
  chipText:       { fontSize: 13, color: '#8B949E' },
  chipTextActive: { color: '#F39C12', fontWeight: '700' },

  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8, gap: 8,
  },
  sectionDot:   { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, flex: 1 },
  sectionCount: { fontSize: 13, color: '#484F58' },

  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#161B22',
  },
  emojiBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emoji:    { fontSize: 22 },
  rowInfo:  { flex: 1 },
  rowName:  { fontSize: 15, fontWeight: '600', color: '#E6EDF3' },
  rowMeta:  { fontSize: 12, color: '#8B949E', marginTop: 2 },
  rowRight: { alignItems: 'flex-end', marginRight: 12 },
  dayLabel: { fontSize: 14, fontWeight: '700' },
  costLabel:{ fontSize: 12, color: '#484F58', marginTop: 2 },
  deleteBtn:{ padding: 4 },
  deleteTxt:{ fontSize: 14, color: '#484F58' },

  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#E6EDF3' },
  emptySub:   { fontSize: 14, color: '#8B949E', marginTop: 4 },
});
