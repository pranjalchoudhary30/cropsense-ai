import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TabsLayout() {
    const { t } = useLanguage();
    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSub,
            tabBarStyle: { backgroundColor: '#fff', borderTopColor: COLORS.border, height: 60, paddingBottom: 8, paddingTop: 6 },
            tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}>
            <Tabs.Screen name="dashboard" options={{ title: t('dashboard'), tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" size={size} color={color} /> }} />
            <Tabs.Screen name="market" options={{ title: t('market'), tabBarIcon: ({ color, size }) => <MaterialIcons name="store" size={size} color={color} /> }} />
            <Tabs.Screen name="settings" options={{ title: t('settings'), tabBarIcon: ({ color, size }) => <MaterialIcons name="settings" size={size} color={color} /> }} />
            <Tabs.Screen name="profile" options={{ title: t('profile'), tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} /> }} />
        </Tabs>
    );
}
