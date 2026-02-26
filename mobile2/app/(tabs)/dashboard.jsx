import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { COLORS, SHADOWS } from '../../constants/colors';
import { useLanguage } from '../../contexts/LanguageContext';
import { predictPrice, getWeather, getSpoilageRisk, recommendMarket } from '../../services/api';

const SCREEN_W = Dimensions.get('window').width;
const CROPS = ['Wheat', 'Rice', 'Corn', 'Soybean', 'Cotton', 'Mustard', 'Sugarcane', 'Barley'];
const RISK_COLOR = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' };

export default function DashboardScreen() {
    const { t } = useLanguage();
    const [crop, setCrop] = useState('Wheat');
    const [location, setLocation] = useState('Punjab, India');
    const [loading, setLoading] = useState(false);
    const [showCropPicker, setShowCropPicker] = useState(false);
    const [priceData, setPriceData] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [spoilageData, setSpoilageData] = useState(null);
    const [marketData, setMarketData] = useState(null);

    const hour = new Date().getHours();
    const greeting = hour < 12 ? t('goodMorning') : hour < 17 ? t('goodAfternoon') : t('goodEvening');

    const handleAnalyze = async () => {
        if (!location.trim()) { Alert.alert('CropSense', 'Please enter a location'); return; }
        setLoading(true);
        try {
            const [p, w, s, m] = await Promise.allSettled([
                predictPrice(crop, location), getWeather(location),
                getSpoilageRisk(crop, location), recommendMarket(crop, location),
            ]);
            if (p.status === 'fulfilled') setPriceData(p.value.data);
            if (w.status === 'fulfilled') setWeatherData(w.value.data);
            if (s.status === 'fulfilled') setSpoilageData(s.value.data);
            if (m.status === 'fulfilled') setMarketData(m.value.data);
            if (p.status === 'rejected') Alert.alert('Note', 'Could not connect to server. Make sure backend is running and IP is correct in services/api.js');
        } catch (e) {
            Alert.alert('Error', 'Analysis failed.');
        } finally {
            setLoading(false);
        }
    };

    const basePrice = priceData?.predicted_price ?? 2400;
    const priceDelta = priceData?.price_change_percent ?? 0;
    const priceUp = priceDelta >= 0;
    const chartData = [0, 1, 2, 3, 4, 5, 6].map(i => Math.round(basePrice * (1 + priceDelta / 100 * (i / 6))));

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8faf8' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#f0fdf4', '#f8faf8']} style={styles.header}>
                    <View style={styles.headerRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialIcons name="eco" size={22} color={COLORS.primary} />
                            <Text style={styles.appName}>CropSense AI</Text>
                        </View>
                        <View style={styles.livePill}><View style={styles.liveDot} /><Text style={styles.livePillText}>{t('liveMarketData')}</Text></View>
                    </View>
                    <Text style={styles.greeting}>{greeting} 👋</Text>
                    <Text style={styles.greetingSub}>AI-powered crop market intelligence</Text>
                </LinearGradient>

                <View style={styles.content}>
                    {/* Controls */}
                    <View style={[styles.card, SHADOWS.md]}>
                        <Text style={styles.label}>{t('selectCrop')}</Text>
                        <TouchableOpacity style={styles.picker} onPress={() => setShowCropPicker(s => !s)}>
                            <MaterialIcons name="grass" size={20} color={COLORS.primary} />
                            <Text style={{ flex: 1, fontSize: 15, color: COLORS.textMain, marginLeft: 10 }}>{crop}</Text>
                            <MaterialIcons name="expand-more" size={20} color={COLORS.textSub} />
                        </TouchableOpacity>
                        {showCropPicker && (
                            <View style={styles.dropdown}>
                                {CROPS.map(c => (
                                    <TouchableOpacity key={c} style={[styles.dropItem, c === crop && { backgroundColor: COLORS.primaryBg }]} onPress={() => { setCrop(c); setShowCropPicker(false); }}>
                                        <Text style={[{ fontSize: 14, color: COLORS.textMain }, c === crop && { color: COLORS.primary, fontWeight: '700' }]}>{c}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                        <Text style={[styles.label, { marginTop: 14 }]}>{t('location')}</Text>
                        <View style={styles.picker}>
                            <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
                            <TextInput style={{ flex: 1, fontSize: 15, color: COLORS.textMain, marginLeft: 10 }} value={location} onChangeText={setLocation} placeholder={t('locationPlaceholder')} placeholderTextColor={COLORS.textSub} />
                        </View>
                        <TouchableOpacity onPress={handleAnalyze} disabled={loading} style={{ marginTop: 16 }}>
                            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.analyzeBtn}>
                                {loading ? <><ActivityIndicator color="#fff" size="small" /><Text style={styles.analyzeBtnText}>{t('analyzing')}</Text></> : <><MaterialIcons name="psychology" size={22} color="#fff" /><Text style={styles.analyzeBtnText}>{t('runAnalysis')}</Text></>}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    {priceData && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {[
                                { icon: 'trending-up', label: t('priceTrend'), value: `${priceUp ? '+' : ''}${priceDelta?.toFixed(1)}%`, color: priceUp ? COLORS.success : COLORS.danger },
                                { icon: 'thermostat', label: t('temperature'), value: weatherData ? `${weatherData.temperature}°C` : '28°C', color: COLORS.warning },
                                { icon: 'water-drop', label: t('humidity'), value: weatherData ? `${weatherData.humidity}%` : '65%', color: COLORS.accent },
                                { icon: 'store', label: t('bestMandi'), value: marketData ? marketData.best_mandi?.split(',')[0]?.split(' ').slice(0, 2).join(' ') : 'Khanna', color: COLORS.primary },
                            ].map(s => (
                                <View key={s.label} style={[styles.statCard, SHADOWS.sm]}>
                                    <View style={[styles.statIcon, { backgroundColor: s.color + '20' }]}><MaterialIcons name={s.icon} size={20} color={s.color} /></View>
                                    <Text style={styles.statLabel}>{s.label}</Text>
                                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Price Chart */}
                    {priceData && (
                        <View style={[styles.card, SHADOWS.sm]}>
                            <Text style={styles.cardTitle}>📈 {t('pricePrediction')}</Text>
                            <Text style={styles.priceVal}>₹{priceData.predicted_price?.toFixed(0)}<Text style={{ fontSize: 13, fontWeight: '400', color: COLORS.textSub }}>/qt</Text></Text>
                            <Text style={[styles.priceDelta, { color: priceUp ? COLORS.success : COLORS.danger }]}>{priceUp ? '▲' : '▼'} {Math.abs(priceDelta).toFixed(1)}% {t('days14')}</Text>
                            <LineChart
                                data={{ labels: ['T', '+2', '+4', '+6', '+8', '+10', '+14'], datasets: [{ data: chartData }] }}
                                width={SCREEN_W - 72} height={150}
                                chartConfig={{ backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff', color: () => COLORS.primary, labelColor: () => COLORS.textSub, strokeWidth: 2, decimalPlaces: 0, propsForDots: { r: '3', strokeWidth: '2', stroke: COLORS.primary } }}
                                bezier style={{ borderRadius: 12, marginTop: 8 }} withInnerLines={false}
                            />
                            {priceData.insights && <Text style={styles.insight}>{priceData.insights}</Text>}
                        </View>
                    )}

                    {/* Spoilage */}
                    {spoilageData && (
                        <View style={[styles.card, SHADOWS.sm]}>
                            <Text style={styles.cardTitle}>⚠️ {t('spoilageRisk')}</Text>
                            <View style={[styles.riskBadge, { backgroundColor: RISK_COLOR[spoilageData.risk_level] + '20' }]}>
                                <Text style={[{ fontSize: 14, fontWeight: '800' }, { color: RISK_COLOR[spoilageData.risk_level] }]}>{t(spoilageData.risk_level?.toLowerCase())} Risk</Text>
                            </View>
                            {spoilageData.recommendation && <Text style={styles.insight}>{spoilageData.recommendation}</Text>}
                        </View>
                    )}

                    {/* Best Mandi */}
                    {marketData && (
                        <View style={[styles.card, SHADOWS.sm]}>
                            <Text style={styles.cardTitle}>🏬 {t('bestMandi')}</Text>
                            <Text style={{ fontSize: 16, fontWeight: '800', color: COLORS.primary, marginTop: 8 }}>{marketData.best_mandi}</Text>
                            {marketData.reason && <Text style={styles.insight}>{marketData.reason}</Text>}
                        </View>
                    )}

                    {!priceData && !loading && (
                        <View style={styles.empty}>
                            <MaterialIcons name="agriculture" size={64} color={COLORS.border} />
                            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textSub }}>Select a crop & location</Text>
                            <Text style={{ fontSize: 13, color: COLORS.textSub, textAlign: 'center', paddingHorizontal: 24, lineHeight: 20 }}>Tap <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Run Analysis</Text> for AI-powered insights</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, paddingTop: 10 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    appName: { fontSize: 18, fontWeight: '800', color: COLORS.textMain },
    livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#dcfce7', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
    liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.success },
    livePillText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
    greeting: { fontSize: 26, fontWeight: '900', color: COLORS.textMain },
    greetingSub: { fontSize: 13, color: COLORS.textSub, marginTop: 4 },
    content: { padding: 16, gap: 14 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16 },
    cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textMain, marginBottom: 8 },
    label: { fontSize: 11, fontWeight: '700', color: COLORS.textSub, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 },
    picker: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#f8faf8' },
    dropdown: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, marginTop: 4, backgroundColor: '#fff', overflow: 'hidden' },
    dropItem: { paddingHorizontal: 16, paddingVertical: 12 },
    analyzeBtn: { borderRadius: 14, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    analyzeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    statCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, width: (SCREEN_W - 52) / 2, alignItems: 'flex-start' },
    statIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
    statLabel: { fontSize: 11, color: COLORS.textSub, marginBottom: 2 },
    statValue: { fontSize: 15, fontWeight: '800' },
    priceVal: { fontSize: 30, fontWeight: '900', color: COLORS.textMain },
    priceDelta: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
    insight: { fontSize: 13, color: COLORS.textSub, marginTop: 10, lineHeight: 20, fontStyle: 'italic' },
    riskBadge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 4 },
    empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
});
