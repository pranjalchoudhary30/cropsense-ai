import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SHADOWS } from '../../constants/colors';
import { useLanguage } from '../../contexts/LanguageContext';

const SCREEN_W = Dimensions.get('window').width;
const PRICES = [
    { name: 'Wheat', mandi: 'Khanna Mandi, Punjab', price: 2480, change: +2.4, color: '#f59e0b', icon: 'grain' },
    { name: 'Rice (Paddy)', mandi: 'Kurnool, AP', price: 2150, change: -0.8, color: '#10b981', icon: 'spa' },
    { name: 'Corn (Maize)', mandi: 'Davangere, Karnataka', price: 1890, change: +4.1, color: '#f97316', icon: 'eco' },
    { name: 'Soybean', mandi: 'Indore, MP', price: 4420, change: +1.2, color: '#8b5cf6', icon: 'grass' },
    { name: 'Cotton', mandi: 'Rajkot, Gujarat', price: 6900, change: -1.5, color: '#06b6d4', icon: 'filter-vintage' },
    { name: 'Mustard', mandi: 'Alwar, Rajasthan', price: 5350, change: +3.7, color: '#eab308', icon: 'local-florist' },
];
const CHART = { Wheat: [2250, 2310, 2290, 2380, 2420, 2480], Rice: [2060, 2100, 2080, 2130, 2170, 2150], Soybean: [4100, 4250, 4180, 4320, 4390, 4420] };
const MANDIS = [
    { rank: 1, name: 'Khanna Mandi', loc: 'Punjab · 48,200 Qtl', change: '+3.2%', up: true },
    { rank: 2, name: 'Azadpur Mandi', loc: 'Delhi · 39,400 Qtl', change: '+1.8%', up: true },
    { rank: 3, name: 'Vashi (APMC)', loc: 'Maharashtra · 28,600 Qtl', change: '-0.4%', up: false },
    { rank: 4, name: 'Kurnool Market', loc: 'Andhra Pradesh · 22,100 Qtl', change: '+5.1%', up: true },
];
const NEWS = [
    { icon: 'trending-up', color: COLORS.success, tag: 'Price Alert', title: 'Wheat prices rise 4% on strong export demand', time: '15 min ago' },
    { icon: 'cloud', color: COLORS.accent, tag: 'Weather', title: 'IMD warns of below-normal rainfall in northwest India', time: '1h ago' },
    { icon: 'policy', color: COLORS.purple, tag: 'Policy', title: 'Govt revises MSP for Kharif crops — up ₹300/Qtl', time: '3h ago' },
];

export default function MarketScreen() {
    const { t } = useLanguage();
    const [search, setSearch] = useState('');
    const [chart, setChart] = useState('Wheat');
    const filtered = PRICES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.mandi.toLowerCase().includes(search.toLowerCase()));
    const vals = CHART[chart] ?? CHART.Wheat;
    const pct = (((vals[5] - vals[0]) / vals[0]) * 100).toFixed(1);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8faf8' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#f0fdf4', '#f8faf8']} style={styles.header}>
                    <View style={styles.headerRow}>
                        <View>
                            <Text style={styles.pageTitle}>🏬 {t('marketPrices')}</Text>
                            <Text style={styles.pageSub}>{t('lastUpdated')}: Today, 11:02 PM IST</Text>
                        </View>
                        <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.livePillText}>LIVE</Text></View>
                    </View>
                </LinearGradient>
                <View style={styles.content}>
                    {/* Stat chips */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {[
                            { icon: 'trending-up', label: t('topGainer'), value: 'Maize +4.1%', color: COLORS.success },
                            { icon: 'trending-down', label: t('topLoser'), value: 'Cotton -1.5%', color: COLORS.danger },
                            { icon: 'storefront', label: t('activeMandis'), value: '2,847', color: COLORS.primary },
                            { icon: 'swap-horiz', label: t('totalVolume'), value: '2.1L Qtl', color: COLORS.purple },
                        ].map(c => (
                            <View key={c.label} style={[styles.chip, SHADOWS.sm]}>
                                <MaterialIcons name={c.icon} size={18} color={c.color} />
                                <Text style={styles.chipLabel}>{c.label}</Text>
                                <Text style={[styles.chipValue, { color: c.color }]}>{c.value}</Text>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Price Table */}
                    <View style={[styles.card, SHADOWS.sm]}>
                        <Text style={styles.cardTitle}>📊 {t('commodityPrices')}</Text>
                        <View style={styles.searchRow}>
                            <MaterialIcons name="search" size={18} color={COLORS.textSub} />
                            <TextInput style={styles.searchInput} placeholder={t('searchCrop')} placeholderTextColor={COLORS.textSub} value={search} onChangeText={setSearch} />
                        </View>
                        {filtered.map(c => (
                            <View key={c.name} style={styles.cropRow}>
                                <View style={[styles.cropIcon, { backgroundColor: c.color + '20' }]}><MaterialIcons name={c.icon} size={20} color={c.color} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.cropName}>{c.name}</Text>
                                    <Text style={styles.cropMandi} numberOfLines={1}>{c.mandi}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.cropPrice}>₹{c.price.toLocaleString('en-IN')}</Text>
                                    <Text style={[styles.cropChange, { color: c.change >= 0 ? COLORS.success : COLORS.danger }]}>{c.change >= 0 ? '▲' : '▼'} {Math.abs(c.change)}%</Text>
                                </View>
                            </View>
                        ))}
                        {filtered.length === 0 && <Text style={{ fontSize: 13, color: COLORS.textSub, textAlign: 'center', paddingVertical: 16 }}>{t('noResults')}</Text>}
                    </View>

                    {/* Chart */}
                    <View style={[styles.card, SHADOWS.sm]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                            <View>
                                <Text style={styles.cardTitle}>📈 {t('sixMonthTrend')}</Text>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: parseFloat(pct) >= 0 ? COLORS.success : COLORS.danger, marginTop: 2 }}>{parseFloat(pct) >= 0 ? '▲' : '▼'} {Math.abs(pct)}% in 6 months</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 4 }}>
                                {Object.keys(CHART).map(k => (
                                    <TouchableOpacity key={k} onPress={() => setChart(k)} style={[styles.chartTab, chart === k && { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]}>
                                        <Text style={[{ fontSize: 11, fontWeight: '700', color: COLORS.textSub }, chart === k && { color: '#fff' }]}>{k}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                        <LineChart
                            data={{ labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], datasets: [{ data: vals }] }}
                            width={SCREEN_W - 72} height={140}
                            chartConfig={{ backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', color: () => COLORS.primary, labelColor: () => COLORS.textSub, strokeWidth: 2, decimalPlaces: 0, propsForDots: { r: '3', strokeWidth: '2', stroke: COLORS.primary } }}
                            bezier style={{ borderRadius: 12, marginTop: 10 }} withInnerLines={false}
                        />
                    </View>

                    {/* Top Mandis */}
                    <View style={[styles.card, SHADOWS.sm]}>
                        <Text style={styles.cardTitle}>🏆 {t('topMandisByVol')}</Text>
                        {MANDIS.map(m => (
                            <View key={m.rank} style={styles.mandiRow}>
                                <View style={[styles.rankBadge, m.rank === 1 && { backgroundColor: '#fef9c3' }]}><Text style={[{ fontSize: 12, fontWeight: '800', color: COLORS.textSub }, m.rank === 1 && { color: '#a16207' }]}>{m.rank}</Text></View>
                                <View style={{ flex: 1 }}><Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.textMain }}>{m.name}</Text><Text style={{ fontSize: 11, color: COLORS.textSub, marginTop: 1 }}>{m.loc}</Text></View>
                                <Text style={{ fontSize: 12, fontWeight: '700', color: m.up ? COLORS.success : COLORS.danger }}>{m.change}</Text>
                            </View>
                        ))}
                    </View>

                    {/* News */}
                    <View style={[styles.card, SHADOWS.sm]}>
                        <Text style={styles.cardTitle}>📰 {t('marketNewsAlerts')}</Text>
                        {NEWS.map((n, i) => (
                            <View key={i} style={styles.newsItem}>
                                <View style={[styles.newsIcon, { backgroundColor: n.color + '20' }]}><MaterialIcons name={n.icon} size={18} color={n.color} /></View>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                                        <Text style={{ fontSize: 10, fontWeight: '700', color: COLORS.textSub, backgroundColor: COLORS.border, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>{n.tag}</Text>
                                        <Text style={{ fontSize: 10, color: COLORS.textSub }}>{n.time}</Text>
                                    </View>
                                    <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textMain, lineHeight: 18 }}>{n.title}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, paddingTop: 10 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    pageTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textMain },
    pageSub: { fontSize: 12, color: COLORS.textSub, marginTop: 4 },
    livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
    livePillText: { fontSize: 10, fontWeight: '800', color: COLORS.primaryDark },
    content: { padding: 16, gap: 14 },
    chip: { backgroundColor: '#fff', borderRadius: 14, padding: 12, marginRight: 10, minWidth: 110, alignItems: 'center', gap: 4 },
    chipLabel: { fontSize: 10, color: COLORS.textSub, fontWeight: '600' },
    chipValue: { fontSize: 13, fontWeight: '800' },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16 },
    cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textMain, marginBottom: 10 },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10, backgroundColor: '#f8faf8' },
    searchInput: { flex: 1, fontSize: 13, color: COLORS.textMain },
    cropRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
    cropIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    cropName: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
    cropMandi: { fontSize: 11, color: COLORS.textSub, marginTop: 1 },
    cropPrice: { fontSize: 15, fontWeight: '800', color: COLORS.textMain },
    cropChange: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    chartTab: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#f8faf8', borderWidth: 1, borderColor: COLORS.border },
    mandiRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
    rankBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
    newsItem: { flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
    newsIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
});
