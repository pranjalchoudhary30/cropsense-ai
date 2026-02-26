import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function RootLayout() {
    return (
        <LanguageProvider>
            <StatusBar style="dark" backgroundColor="#f0fdf4" />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="register" />
                <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
            </Stack>
        </LanguageProvider>
    );
}
