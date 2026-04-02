// KASA — İterasyon 11: İstatistik + Görsel Bar Chart — 20kg
// 3 özellik: kategori bar chart, haftalık karşılaştırma, günlük ortalama
import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekBounds(weeksAgo = 0) {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7) - weeksAgo * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: monday, end: sunday };
}

export default function StatsScreen({ expenses, budgets, onSetBudget }) {
  const stats = useMemo(() => {
    const thisWeek = getWeekBounds(0);
    const lastWeek = getWeekBounds(1);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Month totals per category
    const catTotals = {};
    const thisWeekTotal = { sum: 0 };
    const lastWeekTotal = { sum: 0 };
    const dayTotals = {};

    expenses.forEach((e) => {
      const d = new Date(e.date);
      if (d >= monthStart) {
        const id = e.category.id;
        catTotals[id] = (catTotals[id] || { cat: e.category, sum: 0 });
        catTotals[id].sum += e.amount;
      }
      if (d >= thisWeek.start && d <= thisWeek.end) thisWeekTotal.sum += e.amount;
      if (d >= lastWeek.start && d <= lastWeek.end) lastWeekTotal.sum += e.amount;

      const dayKey = e.date.split('T')[0];
      dayTotals[dayKey] = (dayTotals[dayKey] || 0) + e.amount;
    });

    const sorted = Object.values(catTotals).sort((a, b) => b.sum - a.sum);
    const maxCat = sorted[0]?.sum || 1;
    const daysWithSpend = Object.keys(dayTotals).length || 1;
    const totalMonth = Object.values(catTotals).reduce((s, c) => s + c.sum, 0);
    const dailyAvg = totalMonth / Math.max(daysWithSpend, 1);
    const weekDiff = thisWeekTotal.sum - lastWeekTotal.sum;

    return { sorted, maxCat, totalMonth, dailyAvg, thisWeek: thisWeekTotal.sum, lastWeek: lastWeekTotal.sum, weekDiff };
  }, [expenses]);

  const monthName = new Date().toLocaleDateString('tr-TR', { month: 'long' });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>

        {/* Month overview */}
        <View style={s.overview}>
          <View style={s.overviewItem}>
            <Text style={s.overviewValue}>
              ₺{stats.totalMonth.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={s.overviewLabel}>{monthName} toplam</Text>
          </View>
          <View style={s.divider} />
          <View style={s.overviewItem}>
            <Text style={s.overviewValue}>
              ₺{stats.dailyAvg.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
            </Text>
            <Text style={s.overviewLabel}>günlük ortalama</Text>
          </View>
        </View>

        {/* Weekly comparison */}
        <View style={s.weekCard}>
          <Text style={s.sectionTitle}>Haftalık Karşılaştırma</Text>
          <View style={s.weekRow}>
            <View style={s.weekCol}>
              <Text style={s.weekLabel}>Bu hafta</Text>
              <Text style={s.weekAmount}>
                ₺{stats.thisWeek.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </Text>
            </View>
            <View style={s.weekCenter}>
              <Text style={[
                s.weekDiff,
                { color: stats.weekDiff > 0 ? '#F85149' : '#3FB950' }
              ]}>
                {stats.weekDiff > 0 ? '▲' : '▼'}{' '}
                ₺{Math.abs(stats.weekDiff).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </Text>
              <Text style={s.weekDiffLabel}>
                {stats.weekDiff > 0 ? 'fazla' : 'az'}
              </Text>
            </View>
            <View style={[s.weekCol, { alignItems: 'flex-end' }]}>
              <Text style={s.weekLabel}>Geçen hafta</Text>
              <Text style={[s.weekAmount, { color: '#8B949E' }]}>
                ₺{stats.lastWeek.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
              </Text>
            </View>
          </View>
        </View>

        {/* Category bar chart */}
        <Text style={[s.sectionTitle, { marginHorizontal: 20, marginTop: 24 }]}>
          Kategori Dağılımı
        </Text>
        <Text style={s.sectionSub}>Limiti değiştirmek için kategoriye dokun</Text>

        {stats.sorted.length === 0 ? (
          <Text style={s.empty}>Henüz bu ay harcama yok</Text>
        ) : (
          stats.sorted.map(({ cat, sum }) => {
            const budget = budgets[cat.id];
            const barPct = Math.min((sum / stats.maxCat) * 100, 100);
            const budgetPct = budget ? Math.min((sum / budget) * 100, 100) : null;
            const overBudget = budget && sum > budget;
            const barColor = overBudget ? '#F85149' : budgetPct > 80 ? '#D29922' : cat.color;

            return (
              <TouchableOpacity
                key={cat.id}
                style={s.catRow}
                onPress={() => onSetBudget(cat)}
                activeOpacity={0.7}
              >
                <View style={s.catHeader}>
                  <View style={s.catLeft}>
                    <Text style={s.catEmoji}>{cat.emoji}</Text>
                    <Text style={s.catName}>{cat.label}</Text>
                    {overBudget && <Text style={s.overTag}>AŞILDI</Text>}
                  </View>
                  <View style={s.catRight}>
                    <Text style={[s.catAmount, { color: barColor }]}>
                      ₺{sum.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                    </Text>
                    {budget ? (
                      <Text style={s.budgetLabel}>
                        / ₺{budget.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} limit
                      </Text>
                    ) : (
                      <Text style={s.setLimitLabel}>limit ekle +</Text>
                    )}
                  </View>
                </View>

                {/* Spend bar */}
                <View style={s.barTrack}>
                  <View style={[s.barFill, { width: `${barPct}%`, backgroundColor: barColor }]} />
                </View>

                {/* Budget progress (separate line) */}
                {budget && (
                  <View style={s.budgetTrack}>
                    <View style={[
                      s.budgetFill,
                      { width: `${budgetPct}%`, backgroundColor: barColor + '55' }
                    ]} />
                    <Text style={[s.budgetPct, { color: barColor }]}>
                      %{Math.round(budgetPct)}
                    </Text>
                  </View>
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
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#21262D',
  },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewValue: { fontSize: 32, fontWeight: '800', color: '#E6EDF3', letterSpacing: -1 },
  overviewLabel: { fontSize: 12, color: '#8B949E', marginTop: 4 },
  divider: { width: 1, backgroundColor: '#21262D', marginVertical: 4 },

  weekCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#161B22',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#21262D',
  },
  weekRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  weekCol: { flex: 1 },
  weekLabel: { fontSize: 11, color: '#8B949E', textTransform: 'uppercase', letterSpacing: 0.5 },
  weekAmount: { fontSize: 22, fontWeight: '700', color: '#E6EDF3', marginTop: 4 },
  weekCenter: { alignItems: 'center', paddingHorizontal: 8 },
  weekDiff: { fontSize: 18, fontWeight: '700' },
  weekDiffLabel: { fontSize: 11, color: '#8B949E', marginTop: 2 },

  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#E6EDF3', textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionSub:   { fontSize: 11, color: '#484F58', marginHorizontal: 20, marginTop: 2, marginBottom: 8 },

  catRow: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: '#161B22',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#21262D',
  },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  catLeft:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catEmoji:  { fontSize: 20 },
  catName:   { fontSize: 15, fontWeight: '600', color: '#E6EDF3' },
  overTag:   { fontSize: 9, fontWeight: '700', color: '#F85149', backgroundColor: '#F8514922', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  catRight:  { alignItems: 'flex-end' },
  catAmount: { fontSize: 17, fontWeight: '700' },
  budgetLabel:   { fontSize: 11, color: '#484F58', marginTop: 1 },
  setLimitLabel: { fontSize: 11, color: '#3FB95066', marginTop: 1 },

  barTrack: { height: 8, backgroundColor: '#21262D', borderRadius: 4, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 4 },

  budgetTrack: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  budgetFill:  { flex: 1, height: 4, borderRadius: 2 },
  budgetPct:   { fontSize: 11, fontWeight: '700', minWidth: 36, textAlign: 'right' },

  empty: { textAlign: 'center', color: '#484F58', marginTop: 40, fontSize: 14 },
});
