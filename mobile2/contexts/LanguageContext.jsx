import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const T = {
    en: {
        dashboard: 'Dashboard', market: 'Market', settings: 'Settings', profile: 'Profile',
        goodMorning: 'Good Morning', goodAfternoon: 'Good Afternoon', goodEvening: 'Good Evening',
        selectCrop: 'Select Crop', location: 'Location', locationPlaceholder: 'e.g. Punjab, India',
        runAnalysis: 'Run Analysis', analyzing: 'Analyzing...',
        weatherForecast: 'Weather Forecast', live: 'Live',
        pricePrediction: 'Price Prediction', spoilageRisk: 'Spoilage Risk',
        bestMandi: 'Best Mandi', priceTrend: 'Price Trend',
        temperature: 'Temperature', humidity: 'Humidity', rainfall: 'Rainfall',
        marketPrices: 'Market Prices', lastUpdated: 'Last Updated',
        liveMarketData: 'Live Data Active', searchCrop: 'Search crop or mandi…',
        topGainer: 'Top Gainer', topLoser: 'Top Loser', activeMandis: 'Active Mandis', totalVolume: 'Total Volume',
        commodityPrices: 'Commodity Prices', sixMonthTrend: '6-Month Price Trend',
        topMandisByVol: 'Top Mandis by Volume', marketNewsAlerts: 'Market News & Alerts',
        notifications: 'Notifications', language: 'Language',
        emailAlerts: 'Email Alerts', smsAlerts: 'SMS Alerts',
        priceDropAlerts: 'Price Drop Alerts', weeklyReport: 'Weekly Report',
        saveSettings: 'Save Settings', name: 'Name', email: 'Email', phone: 'Phone',
        signOut: 'Sign Out', login: 'Login', register: 'Register', password: 'Password',
        welcomeBack: 'Welcome Back', createAccount: 'Create Account', signIn: 'Sign In', signUp: 'Sign Up',
        days14: 'in 14 days', low: 'Low', medium: 'Medium', high: 'High',
        viewAll: 'View All', noResults: 'No results found',
    },
    hi: {
        dashboard: 'डैशबोर्ड', market: 'बाज़ार', settings: 'सेटिंग', profile: 'प्रोफ़ाइल',
        goodMorning: 'शुभ प्रभात', goodAfternoon: 'शुभ दोपहर', goodEvening: 'शुभ संध्या',
        selectCrop: 'फसल चुनें', location: 'स्थान', locationPlaceholder: 'जैसे पंजाब, भारत',
        runAnalysis: 'विश्लेषण करें', analyzing: 'विश्लेषण हो रहा है...',
        weatherForecast: 'मौसम पूर्वानुमान', live: 'लाइव',
        pricePrediction: 'मूल्य भविष्यवाणी', spoilageRisk: 'खराब होने का जोखिम',
        bestMandi: 'सर्वश्रेष्ठ मंडी', priceTrend: 'मूल्य रुझान',
        temperature: 'तापमान', humidity: 'आर्द्रता', rainfall: 'वर्षा',
        marketPrices: 'बाज़ार भाव', lastUpdated: 'अंतिम अपडेट',
        liveMarketData: 'लाइव डेटा सक्रिय', searchCrop: 'फसल या मंडी खोजें…',
        topGainer: 'सबसे अधिक बढ़त', topLoser: 'सबसे अधिक गिरावट',
        activeMandis: 'सक्रिय मंडियां', totalVolume: 'कुल मात्रा',
        commodityPrices: 'वस्तु कीमतें', sixMonthTrend: '6 माह मूल्य रुझान',
        topMandisByVol: 'शीर्ष मंडियां', marketNewsAlerts: 'बाज़ार समाचार',
        notifications: 'सूचनाएं', language: 'भाषा',
        emailAlerts: 'ईमेल अलर्ट', smsAlerts: 'SMS अलर्ट',
        priceDropAlerts: 'मूल्य गिरावट अलर्ट', weeklyReport: 'साप्ताहिक रिपोर्ट',
        saveSettings: 'सेटिंग्स सहेजें', name: 'नाम', email: 'ईमेल', phone: 'फोन',
        signOut: 'साइन आउट', login: 'लॉगिन', register: 'पंजीकरण', password: 'पासवर्ड',
        welcomeBack: 'वापस स्वागत है', createAccount: 'खाता बनाएं', signIn: 'साइन इन', signUp: 'साइन अप',
        days14: '14 दिनों में', low: 'कम', medium: 'मध्यम', high: 'उच्च',
        viewAll: 'सभी देखें', noResults: 'कोई परिणाम नहीं',
    },
    pa: {
        dashboard: 'ਡੈਸ਼ਬੋਰਡ', market: 'ਬਾਜ਼ਾਰ', settings: 'ਸੈਟਿੰਗਾਂ', profile: 'ਪ੍ਰੋਫਾਈਲ',
        goodMorning: 'ਸ਼ੁਭ ਸਵੇਰ', goodAfternoon: 'ਸ਼ੁਭ ਦੁਪਹਿਰ', goodEvening: 'ਸ਼ੁਭ ਸੰਝ',
        selectCrop: 'ਫ਼ਸਲ ਚੁਣੋ', location: 'ਟਿਕਾਣਾ', locationPlaceholder: 'ਜਿਵੇਂ ਪੰਜਾਬ',
        runAnalysis: 'ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ', analyzing: 'ਵਿਸ਼ਲੇਸ਼ਣ...',
        weatherForecast: 'ਮੌਸਮ ਪੂਰਵਅਨੁਮਾਨ', live: 'ਲਾਈਵ',
        pricePrediction: 'ਕੀਮਤ ਭਵਿੱਖਬਾਣੀ', spoilageRisk: 'ਖਰਾਬ ਜੋਖਮ',
        bestMandi: 'ਸਭ ਤੋਂ ਵਧੀਆ ਮੰਡੀ', priceTrend: 'ਕੀਮਤ ਰੁਝਾਨ',
        temperature: 'ਤਾਪਮਾਨ', humidity: 'ਨਮੀ', rainfall: 'ਬਾਰਸ਼',
        marketPrices: 'ਬਾਜ਼ਾਰ ਭਾਅ', lastUpdated: 'ਆਖਰੀ ਅੱਪਡੇਟ',
        liveMarketData: 'ਲਾਈਵ ਡੇਟਾ', searchCrop: 'ਫ਼ਸਲ ਖੋਜੋ...',
        topGainer: 'ਸਭ ਤੋਂ ਵੱਧ ਵਾਧਾ', topLoser: 'ਸਭ ਤੋਂ ਵੱਧ ਗਿਰਾਵਟ',
        activeMandis: 'ਸਰਗਰਮ ਮੰਡੀਆਂ', totalVolume: 'ਕੁੱਲ ਮਾਤਰਾ',
        commodityPrices: 'ਵਸਤੂ ਕੀਮਤਾਂ', sixMonthTrend: '6 ਮਹੀਨੇ ਰੁਝਾਨ',
        topMandisByVol: 'ਸਿਖਰ ਮੰਡੀਆਂ', marketNewsAlerts: 'ਬਾਜ਼ਾਰ ਖ਼ਬਰਾਂ',
        notifications: 'ਸੂਚਨਾਵਾਂ', language: 'ਭਾਸ਼ਾ',
        emailAlerts: 'ਈਮੇਲ ਅਲਰਟ', smsAlerts: 'SMS ਅਲਰਟ',
        priceDropAlerts: 'ਕੀਮਤ ਗਿਰਾਵਟ ਅਲਰਟ', weeklyReport: 'ਹਫਤਾਵਾਰੀ ਰਿਪੋਰਟ',
        saveSettings: 'ਸੇਵ ਕਰੋ', name: 'ਨਾਮ', email: 'ਈਮੇਲ', phone: 'ਫੋਨ',
        signOut: 'ਸਾਈਨ ਆਊਟ', login: 'ਲੌਗਿਨ', register: 'ਰਜਿਸਟਰ', password: 'ਪਾਸਵਰਡ',
        welcomeBack: 'ਵਾਪਸ ਸੁਆਗਤ', createAccount: 'ਖਾਤਾ ਬਣਾਓ', signIn: 'ਸਾਈਨ ਇਨ', signUp: 'ਸਾਈਨ ਅੱਪ',
        days14: '14 ਦਿਨਾਂ ਵਿੱਚ', low: 'ਘੱਟ', medium: 'ਮੱਧਮ', high: 'ਉੱਚ',
        viewAll: 'ਸਭ ਦੇਖੋ', noResults: 'ਕੋਈ ਨਤੀਜੇ ਨਹੀਂ',
    },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
    const [lang, setLangState] = useState('en');
    useEffect(() => {
        AsyncStorage.getItem('cropsense_lang').then(s => { if (s && T[s]) setLangState(s); });
    }, []);
    const setLanguage = async (l) => { setLangState(l); await AsyncStorage.setItem('cropsense_lang', l); };
    const t = (key) => T[lang]?.[key] ?? T.en[key] ?? key;
    return <LanguageContext.Provider value={{ lang, setLanguage, t }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
