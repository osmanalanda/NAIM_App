// Warranty & Free Trial Tracker — Alerts & Stats Screen
import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';

function daysUntil(expiryDate) {
  if (!expiryDate) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate + 'T00:00:00');
  if (isNaN(exp.getTime())) return null;
  return Math.round((exp - now) / (1000 * 60 * 60 * 24));
}

export default function StatsScreen({ items, alerts, onSetAlert }) {
  const stats = useMemo(() => {
    const catCounts = {};
    let totalActive = 0;
    let totalExpired = 0;
    let expiringThisMonth = 0;
    let expiringThisWeek = 0;

    items.forEach((item) => {
      const d = daysUntil(item.expiryDate);
      const id = item.category.id;

      if (!catCounts[id]) catCounts[id] = { cat: item.category, count: 0, expiring: 0 };
      catCounts[id].count += 1;

      if (d !== null && d < 0) {
        totalExpired += 1;
      } else {
        totalActive += 1;
        if (d !== null) {
          if (d <= 30) { expiringThisMonth += 1; catCounts[id].expiring += 1; }
          if (d <= 7)  expiringThisWeek += 1;
        }
      }
    });

    const sorted   = Object.values(catCounts).sort((a, b) => b.count - a.count);
    const maxCount = sorted[0]?.count || 1;

    return { sorted, maxCount, totalActive, totalExpired, expiringThisMonth, expiringThisWeek };
  }, [items]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>

        {/* Overview */}
        <View style={s.overview}>
          <View style={s.overviewItem}>
            <Text style={s.overviewValue}>{stats.totalActive}</Text>
            <Text style={s.overviewLabel}>Active</Text>
          </View>
          <View style={s.divider} />
          <View style={s.overviewItem}>
            <Text style={[s.overviewValue, stats.expiringThisMonth > 0 && { color: '#D29922' }]}>
              {stats.expiringThisMonth}
            </Text>
            <Text style={s.overviewLabel}>Expiring ≤30d</Text>
          </View>
          <View style={s.divider} />
          <View style={s.overviewItem}>
            <Text style={[s.overviewValue, stats.totalExpired > 0 && { color: '#F85149' }]}>
              {stats.totalExpired}
            </Text>
            <Text style={s.overviewLabel}>Expired</Text>
          </View>
        </View>

        {/* This-week urgent card */}
        {stats.expiringThisWeek > 0 && (
          <View style={s.urgentCard}>
            <Text style={s.urgentTitle}>⏰  This Week</Text>
            <Text style={s.urgentBody}>
              {stats.expiringThisWeek} item{stats.expiringThisWeek !== 1 ? 's' : ''} expiring in the next 7 days
            </Text>
          </View>
        )}

        {/* Category breakdown */}
        <Text style={[s.sectionTitle, { marginHorizontal: 20, marginTop: 24 }]}>
          Category Breakdown
        </Text>
        <Text style={s.sectionSub}>Tap a category to set an expiry alert threshold</Text>

        {stats.sorted.length === 0 ? (
          <Text style={s.empty}>No items tracked yet</Text>
        ) : (
          stats.sorted.map(({ cat, count, expiring }) => {
            const alertDays = alerts[cat.id];
            const barPct   = Math.min((count / stats.maxCount) * 100, 100);
            const barColor = expiring > 0 ? '#D29922' : cat.color;

            return (
              <TouchableOpacity
                key={cat.id}
                style={s.catRow}
                onPress={() => onSetAlert(cat)}
                activeOpacity={0.7}
              >
                <View style={s.catHeader}>
                  <View style={s.catLeft}>
                    <Text style={s.catEmoji}>{cat.emoji}</Text>
                    <Text style={s.catName}>{cat.label}</Text>
                    {expiring > 0 && (
                      <Text style={s.expiringTag}>{expiring} EXPIRING</Text>
                    )}
                  </View>
                  <View style={s.catRight}>
                    <Text style={[s.catCount, { color: barColor }]}>
                      {count} item{count !== 1 ? 's' : ''}
                    </Text>
                    {alertDays ? (
                      <Text style={s.alertLabel}>🔔 alert at {alertDays}d</Text>
                    ) : (
                      <Text style={s.setAlertLabel}>set alert +</Text>
                    )}
                  </View>
                </View>

                {/* Item count bar */}
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: `${barPct}%`, backgroundColor: barColor }]} />
                </View>

                {alertDays && expiring > 0 && (
                  <Text style={s.alertProgress}>
                    {expiring} of {count} within alert window
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0D1117' },

  overview: {
    flexDirection: 'row',
    paddingVertical: 24, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: '#21262D',
  },
  overviewItem:  { flex: 1, alignItems: 'center' },
  overviewValue: { fontSize: 32, fontWeight: '800', color: '#E6EDF3', letterSpacing: -1 },
  overviewLabel: { fontSize: 12, color: '#8B949E', marginTop: 4 },
  divider:       { width: 1, backgroundColor: '#21262D', marginVertical: 4 },

  urgentCard: {
    margin: 16, padding: 16,
    backgroundColor: '#D2992218',
    borderRadius: 16, borderWidth: 1, borderColor: '#D2992240',
  },
  urgentTitle: { fontSize: 14, fontWeight: '700', color: '#D29922', marginBottom: 6 },
  urgentBody:  { fontSize: 15, color: '#E6EDF3' },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionSub:   { fontSize: 11, color: '#484F58', marginHorizontal: 20, marginTop: 2, marginBottom: 8 },

  catRow: {
    marginHorizontal: 16, marginBottom: 16, padding: 14,
    backgroundColor: '#161B22', borderRadius: 14,
    borderWidth: 1, borderColor: '#21262D',
  },
  catHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catLeft:      { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catEmoji:     { fontSize: 20 },
  catName:      { fontSize: 15, fontWeight: '600', color: '#E6EDF3' },
  expiringTag:  { fontSize: 9, fontWeight: '700', color: '#D29922', backgroundColor: '#D2992222', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  catRight:     { alignItems: 'flex-end' },
  catCount:     { fontSize: 17, fontWeight: '700' },
  alertLabel:   { fontSize: 11, color: '#8B949E', marginTop: 1 },
  setAlertLabel:{ fontSize: 11, color: '#3FB95066', marginTop: 1 },

  barTrack: { height: 8, backgroundColor: '#21262D', borderRadius: 4, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 4 },

  alertProgress: { fontSize: 11, color: '#D29922', marginTop: 6 },

  empty: { textAlign: 'center', color: '#484F58', marginTop: 40, fontSize: 14 },
});
