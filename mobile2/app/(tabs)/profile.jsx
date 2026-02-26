import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SHADOWS } from '../../constants/colors';
import { useLanguage } from '../../contexts/LanguageContext';

const STATS = [
    { icon: 'analytics', label: 'Analyses Run', value: '24' },
    { icon: 'trending-up', label: 'Best Prediction', value: '94%' },
    { icon: 'store', label: 'Mandis Tracked', value: '8' },
    { icon: 'stars', label: 'Accuracy Score', value: 'A+' },
];

export default function ProfileScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const [name, setName] = useState('Pranjal Singh');
    const [email, setEmail] = useState('pranjal@cropsense.ai');
    const [phone, setPhone] = useState('+91 98765 43210');
    const [editing, setEditing] = useState(false);
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8faf8' }}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <LinearGradient colors={['#10b981', '#047857']} style={styles.hero}>
                    <View style={styles.avatarRing}>
                        <LinearGradient colors={['#fff', '#f0fdf4']} style={styles.avatar}>
                            <Text style={styles.avatarText}>{initials}</Text>
                        </LinearGradient>
                    </View>
                    <Text style={styles.heroName}>{name}</Text>
                    <Text style={styles.heroEmail}>{email}</Text>
                    <View style={styles.badge}><MaterialIcons name="verified" size={14} color="#fff" /><Text style={styles.badgeText}>Verified Farmer</Text></View>
                </LinearGradient>
                <View style={styles.content}>
                    <View style={styles.statsGrid}>
                        {STATS.map(s => (
                            <View key={s.label} style={[styles.statCard, SHADOWS.sm]}>
                                <MaterialIcons name={s.icon} size={22} color={COLORS.primary} />
                                <Text style={styles.statValue}>{s.value}</Text>
                                <Text style={styles.statLabel}>{s.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View style={[styles.card, SHADOWS.sm]}>
                        <View style={styles.cardHead}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><MaterialIcons name="person" size={18} color={COLORS.primary} /><Text style={styles.cardTitle}>Account Info</Text></View>
                            <TouchableOpacity onPress={() => editing ? (setEditing(false), Alert.alert('CropSense', 'Profile updated! ✅')) : setEditing(true)} style={[styles.editBtn, editing && { backgroundColor: COLORS.primaryBg, borderColor: COLORS.primary }]}>
                                <MaterialIcons name={editing ? 'check' : 'edit'} size={16} color={editing ? COLORS.primary : COLORS.textSub} />
                                <Text style={[{ fontSize: 13, fontWeight: '600', color: COLORS.textSub }, editing && { color: COLORS.primary }]}>{editing ? 'Save' : 'Edit'}</Text>
                            </TouchableOpacity>
                        </View>
                        {[{ icon: 'person', label: t('name'), value: name, set: setName }, { icon: 'email', label: t('email'), value: email, set: setEmail }, { icon: 'phone', label: t('phone'), value: phone, set: setPhone }].map(({ icon, label, value, set }) => (
                            <View key={label} style={styles.fieldRow}>
                                <View style={styles.fieldIcon}><MaterialIcons name={icon} size={16} color={COLORS.primary} /></View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.fieldLabel}>{label}</Text>
                                    {editing ? <TextInput style={styles.fieldInput} value={value} onChangeText={set} /> : <Text style={styles.fieldValue}>{value}</Text>}
                                </View>
                            </View>
                        ))}
                    </View>

                    <LinearGradient colors={['#10b981', '#047857']} style={[styles.planCard, SHADOWS.md]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <View><Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', textTransform: 'uppercase' }}>Current Plan</Text><Text style={{ fontSize: 20, fontWeight: '900', color: '#fff', marginTop: 2 }}>🌟 Pro Farmer</Text></View>
                            <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}><Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>ACTIVE</Text></View>
                        </View>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 8 }}>Unlimited AI analyses · All 6 languages · Priority support</Text>
                    </LinearGradient>

                    <TouchableOpacity onPress={() => Alert.alert('Sign Out', 'Are you sure?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign Out', style: 'destructive', onPress: () => router.replace('/') }])} style={[styles.signOut, SHADOWS.sm]}>
                        <MaterialIcons name="logout" size={20} color={COLORS.danger} />
                        <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.danger }}>{t('signOut')}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    hero: { paddingTop: 40, paddingBottom: 32, alignItems: 'center', gap: 8 },
    avatarRing: { width: 88, height: 88, borderRadius: 44, padding: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginBottom: 4 },
    avatar: { flex: 1, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
    avatarText: { fontSize: 28, fontWeight: '900', color: COLORS.primary },
    heroName: { fontSize: 22, fontWeight: '900', color: '#fff' },
    heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
    badge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 4 },
    badgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
    content: { padding: 16, gap: 14 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    statCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', width: '47%', gap: 4 },
    statValue: { fontSize: 22, fontWeight: '900', color: COLORS.textMain },
    statLabel: { fontSize: 11, color: COLORS.textSub, textAlign: 'center' },
    card: { backgroundColor: '#fff', borderRadius: 20, padding: 16 },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textMain },
    editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
    fieldRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
    fieldIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    fieldLabel: { fontSize: 11, color: COLORS.textSub, marginBottom: 3 },
    fieldValue: { fontSize: 15, fontWeight: '600', color: COLORS.textMain },
    fieldInput: { fontSize: 15, color: COLORS.textMain, borderBottomWidth: 1.5, borderBottomColor: COLORS.primary, paddingBottom: 2 },
    planCard: { borderRadius: 20, padding: 20, gap: 8 },
    signOut: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16 },
});
