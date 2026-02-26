import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../../constants/colors';
import { useLanguage } from '../../contexts/LanguageContext';

const LANGS = [{ code: 'en', native: 'English' }, { code: 'hi', native: 'हिंदी' }, { code: 'pa', native: 'ਪੰਜਾਬੀ' }];

export default function SettingsScreen() {
    const { t, lang, setLanguage } = useLanguage();
    const [notifs, setNotifs] = useState({ email: true, sms: false, price: true, weekly: true });
    const toggle = k => setNotifs(s => ({ ...s, [k]: !s[k] }));

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8faf8' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#f0fdf4', '#f8faf8']} style={styles.header}>
                    <Text style={styles.pageTitle}>⚙️ {t('settings')}</Text>
                </LinearGradient>
                <View style={styles.content}>
                    {/* Notifications */}
                    <View style={[styles.card, SHADOWS.sm]}>
                        <View style={styles.cardHead}><MaterialIcons name="notifications" size={18} color={COLORS.primary} /><Text style={styles.cardTitle}>{t('notifications')}</Text></View>
                        {[
                            { k: 'email', icon: 'email', label: t('emailAlerts'), sub: 'Price & market updates via email' },
                            { k: 'sms', icon: 'sms', label: t('smsAlerts'), sub: 'Critical alerts to your phone' },
                            { k: 'price', icon: 'trending-down', label: t('priceDropAlerts'), sub: 'Notify when crop prices fall' },
                            { k: 'weekly', icon: 'summarize', label: t('weeklyReport'), sub: 'Summary every Monday morning' },
                        ].map(({ k, icon, label, sub }, i) => (
                            <View key={k}>
                                {i > 0 && <View style={styles.divider} />}
                                <View style={styles.toggleRow}>
                                    <View style={styles.toggleIcon}><MaterialIcons name={icon} size={16} color={COLORS.primary} /></View>
                                    <View style={{ flex: 1 }}><Text style={styles.toggleLabel}>{label}</Text><Text style={styles.toggleSub}>{sub}</Text></View>
                                    <Switch value={notifs[k]} onValueChange={() => toggle(k)} trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }} thumbColor={notifs[k] ? COLORS.primary : '#f3f4f6'} />
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Language */}
                    <View style={[styles.card, SHADOWS.sm]}>
                        <View style={styles.cardHead}><MaterialIcons name="language" size={18} color={COLORS.purple} /><Text style={styles.cardTitle}>{t('language')}</Text></View>
                        <View style={styles.langGrid}>
                            {LANGS.map(l => (
                                <TouchableOpacity key={l.code} onPress={() => setLanguage(l.code)} style={[styles.langBtn, lang === l.code && styles.langBtnActive]}>
                                    <Text style={[styles.langNative, lang === l.code && { color: COLORS.primary }]}>{l.native}</Text>
                                    {lang === l.code && <MaterialIcons name="check-circle" size={14} color={COLORS.primary} style={{ position: 'absolute', top: 6, right: 6 }} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => Alert.alert('CropSense', 'Settings saved! ✅')} activeOpacity={0.85}>
                        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveBtn}>
                            <MaterialIcons name="save" size={20} color="#fff" />
                            <Text style={styles.saveBtnText}>{t('saveSettings')}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: { padding: 20, paddingTop: 10 },
    pageTitle: { fontSize: 24, fontWeight: '900', color: COLORS.textMain },
    content: { padding: 16, gap: 14 },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16 },
    cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textMain },
    toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
    toggleIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center' },
    toggleLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textMain },
    toggleSub: { fontSize: 11, color: COLORS.textSub, marginTop: 1 },
    divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 4 },
    langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    langBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: '#f8faf8', minWidth: '30%', position: 'relative' },
    langBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBg },
    langNative: { fontSize: 14, fontWeight: '700', color: COLORS.textMain },
    saveBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
