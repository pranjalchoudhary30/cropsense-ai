import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SHADOWS } from '../constants/colors';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginScreen() {
    const { t } = useLanguage();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) { Alert.alert('CropSense', 'Please enter email and password'); return; }
        setLoading(true);
        try {
            // For demo: skip actual API call and go to dashboard directly
            // In production: await loginUser(email, password);
            setTimeout(() => { setLoading(false); router.replace('/(tabs)/dashboard'); }, 1000);
        } catch (e) {
            setLoading(false);
            Alert.alert('Login Failed', 'Invalid credentials');
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <LinearGradient colors={['#f0fdf4', '#dcfce7']} style={styles.hero}>
                    <View style={styles.logoBox}><MaterialIcons name="eco" size={36} color={COLORS.primary} /></View>
                    <Text style={styles.logoTitle}>CropSense AI</Text>
                    <Text style={styles.logoSub}>Smart farming, smarter decisions</Text>
                </LinearGradient>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{t('welcomeBack')} 👋</Text>
                    <Text style={styles.cardSub}>Sign in to your account</Text>
                    <View style={styles.inputGroup}>
                        <MaterialIcons name="email" size={20} color={COLORS.textSub} style={styles.inputIcon} />
                        <TextInput style={styles.input} placeholder={t('email')} placeholderTextColor={COLORS.textSub} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                    </View>
                    <View style={styles.inputGroup}>
                        <MaterialIcons name="lock" size={20} color={COLORS.textSub} style={styles.inputIcon} />
                        <TextInput style={[styles.input, { flex: 1 }]} placeholder={t('password')} placeholderTextColor={COLORS.textSub} value={password} onChangeText={setPassword} secureTextEntry={!showPass} />
                        <TouchableOpacity onPress={() => setShowPass(s => !s)}><MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={20} color={COLORS.textSub} /></TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
                        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.btn}>
                            {loading ? <ActivityIndicator color="#fff" /> : <><MaterialIcons name="login" size={20} color="#fff" /><Text style={styles.btnText}>{t('signIn')}</Text></>}
                        </LinearGradient>
                    </TouchableOpacity>
                    <View style={styles.row}>
                        <Text style={styles.linkText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => router.push('/register')}><Text style={[styles.linkText, { color: COLORS.primary, fontWeight: '700' }]}>{t('signUp')}</Text></TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    scroll: { flexGrow: 1, backgroundColor: '#f8faf8' },
    hero: { alignItems: 'center', paddingTop: 80, paddingBottom: 48, paddingHorizontal: 24 },
    logoBox: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(16,185,129,0.12)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, ...SHADOWS.md },
    logoTitle: { fontSize: 28, fontWeight: '900', color: COLORS.textMain },
    logoSub: { fontSize: 14, color: COLORS.textSub, marginTop: 6 },
    card: { marginHorizontal: 20, marginTop: -20, backgroundColor: '#fff', borderRadius: 24, padding: 24, ...SHADOWS.md },
    cardTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textMain },
    cardSub: { fontSize: 13, color: COLORS.textSub, marginTop: 4, marginBottom: 24 },
    inputGroup: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14, backgroundColor: '#f8faf8' },
    inputIcon: { marginRight: 10 },
    input: { flex: 1, fontSize: 15, color: COLORS.textMain },
    btn: { borderRadius: 14, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
    btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    row: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    linkText: { fontSize: 14, color: COLORS.textSub },
});
