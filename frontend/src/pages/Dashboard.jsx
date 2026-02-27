import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { predictPrice, getWeather, recommendMarket, getSpoilageRisk } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import Squares from '../components/Squares';

/* ─── tiny helpers ──────────────────────────────────────────── */
const fmt = (n) => n != null ? Number(n).toLocaleString('en-IN') : '—';

const NOTIFICATIONS = [
    { id: 1, icon: 'trending_up', color: 'text-green-600 bg-green-50', title: 'Price Alert', body: 'Wheat price up 8% in Khanna Mandi — great time to sell!', time: '2m ago', unread: true },
    { id: 2, icon: 'water_drop', color: 'text-blue-500 bg-blue-50', title: 'Weather Warning', body: 'Heavy rain expected in Punjab in the next 48 hours.', time: '1h ago', unread: true },
    { id: 3, icon: 'check_circle', color: 'text-primary bg-primary/10', title: 'Analysis Complete', body: 'Your latest crop analysis report is ready to view.', time: '3h ago', unread: false },
];

function RingGauge({ pct = 0, color = '#10b981', size = 72 }) {
    const r = 28, circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width={size} height={size} viewBox="0 0 72 72">
            <circle cx="36" cy="36" r={r} fill="none" stroke="currentColor"
                className="text-border-light dark:text-border-dark" strokeWidth="8" />
            <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: 'stroke-dasharray 1s ease' }} />
            <text x="36" y="40" textAnchor="middle" fontSize="13"
                fill={color} fontWeight="700">{pct}%</text>
        </svg>
    );
}

const CROPS = [
    'Wheat (Triticum aestivum)', 'Rice (Paddy)', 'Corn (Maize)',
    'Soybean', 'Cotton', 'Sugarcane', 'Mustard', 'Barley',
];

const WEATHER_ICONS = {
    sunny: 'sunny', clear: 'sunny', cloud: 'partly_cloudy_day',
    rain: 'rainy', storm: 'thunderstorm', fog: 'foggy',
    default: 'partly_cloudy_day',
};

function weatherIcon(desc = '') {
    const d = desc.toLowerCase();
    if (d.includes('rain') || d.includes('shower')) return WEATHER_ICONS.rain;
    if (d.includes('storm')) return WEATHER_ICONS.storm;
    if (d.includes('cloud')) return WEATHER_ICONS.cloud;
    if (d.includes('fog') || d.includes('mist')) return WEATHER_ICONS.fog;
    if (d.includes('sunny') || d.includes('clear')) return WEATHER_ICONS.sunny;
    return WEATHER_ICONS.default;
}

/* ─── Custom recharts tooltip ───────────────────────────────── */
const PriceTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-xl px-4 py-3 shadow-xl text-sm">
            <p className="text-text-sub mb-1">{label}</p>
            <p className="font-bold text-primary text-base">₹{fmt(payload[0].value)}/qt</p>
        </div>
    );
};

/* ─── Typewriter for AI insights ────────────────────────────── */
function Typewriter({ text = '', speed = 18 }) {
    const [displayed, setDisplayed] = useState('');
    useEffect(() => {
        setDisplayed('');
        let i = 0;
        const id = setInterval(() => {
            setDisplayed(text.slice(0, ++i));
            if (i >= text.length) clearInterval(id);
        }, speed);
        return () => clearInterval(id);
    }, [text, speed]);
    return <span>{displayed}<span className="animate-pulse">|</span></span>;
}

/* ═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const [crop, setCrop] = useState(CROPS[0]);
    const [location, setLocation] = useState('Punjab, India');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasData, setHasData] = useState(false);

    const [weatherData, setWeatherData] = useState(null);
    const [predictionData, setPredictionData] = useState(null);
    const [recommendationData, setRecommendationData] = useState(null);
    const [spoilageData, setSpoilageData] = useState(null);

    const [greeting, setGreeting] = useState('');
    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? t('goodMorning') : h < 17 ? t('goodAfternoon') : t('goodEvening'));
    }, [t]);

    /* ── Build chart data from prediction ── */
    const chartData = React.useMemo(() => {
        if (!predictionData?.predicted_prices) {
            return [
                { day: 'Today', price: 2350 }, { day: '+2d', price: 2390 },
                { day: '+4d', price: 2420 }, { day: '+6d', price: 2450 },
                { day: '+8d', price: 2410 }, { day: '+10d', price: 2480 },
                { day: '+14d', price: 2530 },
            ];
        }
        return predictionData.predicted_prices.map((p, i) => ({
            day: i === 0 ? 'Today' : `+${i * 2}d`,
            price: Math.round(p),
        }));
    }, [predictionData]);



    /* ── Analyse handler ── */
    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const weatherResult = await getWeather(location).catch(() => null);
            const temp = weatherResult?.temperature ?? 30;
            const humidity = weatherResult?.humidity ?? 65;

            const [prediction, recommendation, spoilage] = await Promise.all([
                predictPrice(crop, location),
                recommendMarket(crop, location),
                getSpoilageRisk({
                    temperature: temp,
                    humidity: humidity,
                    storage_type: 'warehouse',
                    transit_days: 3,
                    crop,
                }),
            ]);
            setWeatherData(weatherResult);
            setPredictionData(prediction);
            setRecommendationData(recommendation);
            setSpoilageData(spoilage);
            setHasData(true);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch insights. Please check your connection and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const spoilagePct = spoilageData ? Math.round((spoilageData.spoilage_probability ?? 0) * 100) : 0;
    const spoilageColor = spoilageData?.risk_color ?? (spoilagePct > 60 ? '#ef4444' : spoilagePct > 30 ? '#f59e0b' : '#10b981');
    const priceDelta = predictionData?.pct_change != null
        ? (predictionData.pct_change >= 0 ? '+' : '') + predictionData.pct_change
        : (() => {
            const latest = chartData[chartData.length - 1]?.price;
            const first = chartData[0]?.price;
            if (!latest || !first) return '+0.0';
            const d = (((latest - first) / first) * 100).toFixed(1);
            return (parseFloat(d) >= 0 ? '+' : '') + d;
        })();
    const priceUp = parseFloat(priceDelta) >= 0;
    const latestPrice = chartData[chartData.length - 1]?.price ?? predictionData?.current_price ?? 2970;
    return (
        <div className="bg-background-light text-text-main font-display min-h-screen flex flex-col relative">

            {/* ── Squares animated grid background ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Squares
                    speed={0.3}
                    squareSize={44}
                    direction="diagonal"
                    borderColor="#d1fae5"
                    hoverFillColor="#f0fdf4"
                />
            </div>

            {/* ── HEADER ───────────────────────────────────────────── */}
            <header className="sticky top-0 z-50 bg-surface-light/90 backdrop-blur-md border-b border-border-light shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                            <span className="material-symbols-outlined text-xl">eco</span>
                        </div>
                        <span className="text-lg font-bold tracking-tight">CropSense AI</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-1">
                        {[
                            [t('dashboard'), 'dashboard', '/dashboard'],
                            [t('market'), 'store', '/market'],
                            [t('insights'), 'auto_awesome', '#'],
                        ].map(([label, icon, href]) => (
                            href.startsWith('/') ? (
                                <Link key={label} to={href}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${href === '/dashboard' ? 'text-primary bg-primary/10' : 'text-text-sub hover:text-primary hover:bg-primary/5'}`}>
                                    <span className="material-symbols-outlined text-base">{icon}</span>
                                    {label}
                                </Link>
                            ) : (
                                <a key={label} href={href}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-sub hover:text-primary hover:bg-primary/5 transition-all">
                                    <span className="material-symbols-outlined text-base">{icon}</span>
                                    {label}
                                </a>
                            )
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        {/* notification */}
                        <div className="relative" ref={notifRef}>
                            <button
                                onClick={() => setNotifOpen(o => !o)}
                                className="relative size-9 rounded-full hover:bg-border-light transition-colors flex items-center justify-center text-text-sub">
                                <span className="material-symbols-outlined text-xl">notifications</span>
                                <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full ring-2 ring-surface-light" />
                            </button>
                            {notifOpen && (
                                <div className="absolute right-0 mt-2 w-80 bg-surface-light border border-border-light rounded-2xl shadow-2xl z-50 overflow-hidden">
                                    <div className="px-4 py-3 border-b border-border-light flex items-center justify-between">
                                        <p className="font-bold text-sm text-text-main">Notifications</p>
                                        <span className="text-[10px] bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">2 new</span>
                                    </div>
                                    <div className="divide-y divide-border-light max-h-72 overflow-y-auto">
                                        {NOTIFICATIONS.map(n => (
                                            <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-primary/5 transition-colors cursor-pointer ${n.unread ? 'bg-primary/[0.03]' : ''}`}>
                                                <div className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${n.color}`}>
                                                    <span className="material-symbols-outlined text-base">{n.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-sm font-semibold text-text-main truncate">{n.title}</p>
                                                        <span className="text-[10px] text-text-sub whitespace-nowrap">{n.time}</span>
                                                    </div>
                                                    <p className="text-xs text-text-sub mt-0.5 leading-relaxed">{n.body}</p>
                                                </div>
                                                {n.unread && <div className="size-1.5 rounded-full bg-primary flex-shrink-0 mt-2" />}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2.5 border-t border-border-light">
                                        <button className="text-xs font-semibold text-primary hover:underline">Mark all as read</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* avatar + dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen((o) => !o)}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border-light hover:border-primary/40 hover:bg-primary/5 transition-all">
                                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0] || 'User'}</span>
                                <span className="material-symbols-outlined text-text-sub text-base">expand_more</span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-surface-light border border-border-light rounded-xl shadow-2xl py-2 z-50">
                                    <div className="px-4 py-3 border-b border-border-light">
                                        <p className="font-semibold text-sm text-text-main truncate">{user?.name}</p>
                                        <p className="text-xs text-text-sub truncate mt-0.5">{user?.email}</p>
                                    </div>
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-sub hover:text-primary hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-base">account_circle</span> Profile
                                    </Link>
                                    <Link to="/settings" onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-sub hover:text-primary hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-base">settings</span> Settings
                                    </Link>
                                    <div className="border-t border-border-light mt-1 pt-1">
                                        <button onClick={() => { logout(); navigate('/login'); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                            <span className="material-symbols-outlined text-base">logout</span> Sign out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

                {/* ── WELCOME BANNER ──────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-text-main">
                            {greeting}, <span className="text-primary">{user?.name?.split(' ')[0] || 'Farmer'}</span> 👋
                        </h2>
                        <p className="text-text-sub text-sm mt-1">{t('aiSubtitle')}</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium">
                        <span className="relative flex size-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2 bg-green-500" />
                        </span>
                        {t('liveMarketData')}
                    </div>
                </div>

                {/* ── ERROR BANNER ────────────────────────────────────── */}
                {error && (
                    <div className="flex items-center gap-3 bg-red-50 text-red-700 border border-red-100 p-4 rounded-xl">
                        <span className="material-symbols-outlined text-xl flex-shrink-0">error</span>
                        <p className="text-sm">{error}</p>
                        <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                )}

                {/* ── CONTROLS ────────────────────────────────────────── */}
                <section className="bg-surface-light rounded-2xl border border-border-light shadow-sm p-5">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        {/* Crop selector */}
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">{t('selectCrop')}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-primary pointer-events-none">
                                    <span className="material-symbols-outlined text-xl">grass</span>
                                </span>
                                <select value={crop} onChange={e => setCrop(e.target.value)}
                                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-border-light bg-background-light text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none transition-all">
                                    {CROPS.map(c => <option key={c}>{c}</option>)}
                                </select>
                                <span className="absolute inset-y-0 right-3 flex items-center text-text-sub pointer-events-none">
                                    <span className="material-symbols-outlined text-xl">expand_more</span>
                                </span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">{t('location')}</label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-primary pointer-events-none">
                                    <span className="material-symbols-outlined text-xl">location_on</span>
                                </span>
                                <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                                    placeholder={t('locationPlaceholder')}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-border-light bg-background-light text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-text-sub/60" />
                            </div>
                        </div>


                        {/* Predict button — inline with inputs, MagicUI animated gradient */}
                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading}
                            className="group relative flex-shrink-0 w-full md:w-auto flex items-center justify-center gap-2 rounded-xl px-6 py-3 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {/* Animated gradient border */}
                            <span
                                className="animate-gradient absolute inset-0 block h-full w-full rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/60 via-[#9c40ff]/60 to-[#ffaa40]/60 bg-[length:300%_100%] p-[1.5px]"
                                style={{
                                    WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    WebkitMaskComposite: "destination-out",
                                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                                    maskComposite: "subtract",
                                }}
                            />
                            {isLoading ? (
                                <>
                                    <div className="size-5 border-2 border-[#9c40ff]/40 border-t-[#ffaa40] rounded-full animate-spin" />
                                    <span
                                        style={{ "--bg-size": "300%", "--color-from": "#ffaa40", "--color-to": "#9c40ff" }}
                                        className="animate-gradient font-bold bg-gradient-to-r from-[var(--color-from)] via-[var(--color-to)] to-[var(--color-from)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent"
                                    >
                                        {t('analyzing')}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined animate-gradient bg-gradient-to-r from-[#ffaa40] via-[#9c40ff] to-[#ffaa40] bg-[length:300%_100%] bg-clip-text text-transparent">psychology</span>
                                    <span
                                        style={{ "--bg-size": "300%", "--color-from": "#ffaa40", "--color-to": "#9c40ff" }}
                                        className="animate-gradient font-bold bg-gradient-to-r from-[var(--color-from)] via-[var(--color-to)] to-[var(--color-from)] bg-[length:var(--bg-size)_100%] bg-clip-text text-transparent"
                                    >
                                        {t('runAnalysis')}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </section>

                {/* ── QUICK STATS BAR ─────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: 'trending_up', label: t('priceTrend'), value: `${priceUp ? '+' : ''}${priceDelta}%`, color: priceUp ? 'text-green-600' : 'text-red-500', bg: priceUp ? 'bg-green-50' : 'bg-red-50' },
                        { icon: 'thermostat', label: t('temperature'), value: weatherData ? `${weatherData.temperature}°C` : '28°C', color: 'text-orange-500', bg: 'bg-orange-50' },
                        { icon: 'humidity_percentage', label: t('humidity'), value: weatherData ? `${weatherData.humidity}%` : '65%', color: 'text-blue-500', bg: 'bg-blue-50' },
                        { icon: 'store', label: t('bestMandi'), value: recommendationData ? recommendationData.best_mandi.split(',')[0].split(' ').slice(0, 2).join(' ') : 'Khanna Mandi', color: 'text-primary', bg: 'bg-primary/5' },
                    ].map(({ icon, label, value, color, bg }) => (
                        <div key={label} className="shine-card bg-surface-light border border-border-light rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`size-10 rounded-xl ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
                                <span className="material-symbols-outlined text-xl">{icon}</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-text-sub">{label}</p>
                                <p className={`font-bold text-base truncate ${color}`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── MAIN GRID ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT COLUMN: Weather + Spoilage */}
                    <div className="lg:col-span-4 flex flex-col gap-6">

                        {/* Weather card */}
                        <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
                                <h3 className="font-bold text-base flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">partly_cloudy_day</span>
                                    {t('weatherForecast')}
                                </h3>
                                <span className="text-xs font-semibold px-2.5 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-green-500 animate-pulse inline-block" />{t('live')}
                                </span>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <p className="text-5xl font-black text-text-main tracking-tight">
                                            {weatherData ? `${weatherData.temperature}°` : '28°'}
                                            <span className="text-2xl font-medium text-text-sub">C</span>
                                        </p>
                                        <p className="text-text-sub text-sm mt-1">
                                            {weatherData?.description || 'Mostly Sunny'}
                                        </p>
                                    </div>
                                    <div className="size-16 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-50 border border-orange-100 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-4xl text-orange-400">
                                            {weatherIcon(weatherData?.description)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: 'humidity_percentage', label: t('humidity'), val: weatherData ? `${weatherData.humidity}%` : '65%', color: 'text-blue-500 bg-blue-50 border-blue-100' },
                                        { icon: 'water_drop', label: t('rainfall'), val: weatherData?.rainfall_forecast ?? '12mm', color: 'text-cyan-500 bg-cyan-50 border-cyan-100' },
                                        { icon: 'air', label: t('wind'), val: weatherData?.wind_speed ? `${weatherData.wind_speed} km/h` : '14 km/h', color: 'text-slate-500 bg-slate-50 border-slate-200' },
                                        { icon: 'wb_sunny', label: t('uvIndex'), val: '5 Moderate', color: 'text-yellow-600 bg-yellow-50 border-yellow-100' },
                                    ].map(({ icon, label, val, color }) => (
                                        <div key={label} className={`flex items-center gap-2.5 p-3 rounded-xl border ${color}`}>
                                            <span className="material-symbols-outlined text-lg">{icon}</span>
                                            <div>
                                                <p className="text-[10px] opacity-70 font-medium">{label}</p>
                                                <p className="font-bold text-sm">{val}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Spoilage Risk card */}
                        <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
                                <span className="material-symbols-outlined text-orange-500">warning_amber</span>
                                <h3 className="font-bold text-base">{t('spoilageRisk')}</h3>
                            </div>
                            <div className="p-5 flex items-center gap-6">
                                <RingGauge pct={spoilagePct} color={spoilageColor} size={80} />
                                <div className="flex-1">
                                    <p className={`font-bold text-lg`} style={{ color: spoilageColor }}>
                                        {spoilageData ? spoilageData.risk_level : 'Low'} {t('risk')}
                                    </p>
                                    <p className="text-text-sub text-xs mt-1 leading-relaxed">
                                        {spoilageData?.suggestion || 'Conditions are stable. Monitor storage temperature regularly.'}
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-1.5">
                                        {['Temp: 30°C', 'Humidity: 75%', '2 days transit'].map(tag => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 bg-background-light border border-border-light rounded-full text-text-sub">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CENTER + RIGHT: Price Chart + Mandi + AI */}
                    <div className="lg:col-span-8 flex flex-col gap-6">

                        {/* Price Prediction chart */}
                        <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-base flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">show_chart</span>
                                        Price Prediction
                                    </h3>
                                    <p className="text-xs text-text-sub mt-0.5">14-day AI forecast for {crop.split(' ')[0]}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-text-main">
                                        ₹{fmt(latestPrice)}
                                        <span className="text-sm font-normal text-text-sub ml-1">/qt</span>
                                    </p>
                                    <p className={`text-sm font-semibold flex items-center justify-end gap-0.5 ${priceUp ? 'text-green-600' : 'text-red-500'}`}>
                                        <span className="material-symbols-outlined text-base">{priceUp ? 'arrow_upward' : 'arrow_downward'}</span>
                                        {priceUp ? '+' : ''}{priceDelta}% {t('over14d')}
                                    </p>
                                </div>
                            </div>
                            <div className="p-5">
                                <ResponsiveContainer width="100%" height={200}>
                                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                                        <defs>
                                            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#526353' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#526353' }} axisLine={false} tickLine={false}
                                            domain={['auto', 'auto']} tickFormatter={v => `₹${v}`} width={55} />
                                        <Tooltip content={<PriceTooltip />} />
                                        <Area type="monotone" dataKey="price" stroke="#10b981" strokeWidth={2.5}
                                            fill="url(#priceGrad)" dot={false} activeDot={{ r: 5, fill: '#10b981' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Best Mandi */}
                        <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none">
                                <span className="material-symbols-outlined" style={{ fontSize: 120 }}>storefront</span>
                            </div>

                            <div className="px-5 py-4 border-b border-border-light bg-gradient-to-r from-primary/5 to-accent/5 flex items-start justify-between">
                                <div>
                                    <h3 className="font-bold text-lg flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">store</span>
                                        Best Mandi Opportunity
                                    </h3>
                                    <p className="text-text-sub text-xs mt-0.5">Optimal market based on distance, price & demand</p>
                                </div>
                                <div className="flex-shrink-0 flex items-center gap-1.5 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-bold text-green-700">
                                    <span className="material-symbols-outlined text-sm">verified</span>
                                    {recommendationData?.confidence ? `${Math.round(recommendationData.confidence * 100)}%` : '94%'} {t('confidence')}
                                </div>
                            </div>

                            <div className="p-5 flex flex-col sm:flex-row gap-5">
                                {/* Map image */}
                                <div className="w-full sm:w-44 aspect-square rounded-xl overflow-hidden relative flex-shrink-0 border border-border-light">
                                    <img alt="Mandi location map"
                                        className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuk5gs7HN3JaGIqMEn7oIbLu4JGVSqaNqxJ2mF3-ivQvoHCrp65hrwlUOa1LH0KWBN31zHpGq4YWgoUbLpw6hGSoSTwVSuWG4ZV4gyVEtiBVGQ984AK_DEKlaqoZ61QspKyByAx1XPbGWeGbhbrrQX1akKr832_sPTAO75EmtxOiR4wy4Qrw8mUHKqGEWkpNvNj09_h80c6Hf0dYWH0GZE8thTUeNBPOVBrIOPZB2m58a1FD5rtK2YkZUPkxX9SebYGnxbCHULic0" />
                                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                        {recommendationData?.distance_km != null ? `${recommendationData.distance_km}km Away` : '—'}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between min-w-0">
                                    <div>
                                        <h4 className="text-xl font-black text-text-main truncate">
                                            {recommendationData ? recommendationData.best_mandi.split(',')[0] : 'Khanna Main Mandi'}
                                        </h4>
                                        <p className="text-text-sub text-sm mt-0.5 truncate">
                                            {recommendationData ? recommendationData.best_mandi : 'GT Road, Khanna, Punjab'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 my-4">
                                        <div className="bg-background-light p-3 rounded-xl border border-border-light">
                                            <p className="text-[10px] text-text-sub font-medium uppercase tracking-wide">{t('predictedPrice')}</p>
                                            <p className="text-xl font-black text-primary mt-0.5">
                                                ₹{fmt(recommendationData?.predicted_price ?? '2,450')}
                                                <span className="text-xs font-normal text-text-sub">/qt</span>
                                            </p>
                                        </div>
                                        <div className="bg-background-light p-3 rounded-xl border border-border-light">
                                            <p className="text-[10px] text-text-sub font-medium uppercase tracking-wide">{t('expProfit')}</p>
                                            <p className="text-xl font-black text-green-600 mt-0.5">
                                                ₹{fmt(recommendationData?.expected_profit_per_qt ?? recommendationData?.net_price ?? '—')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Confidence bar */}
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-text-sub mb-1">
                                            <span>{t('aiConfidence')}</span>
                                            <span className="font-semibold text-primary">
                                                {recommendationData?.confidence ? `${Math.round(recommendationData.confidence * 100)}%` : '94%'}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-border-light rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                                                style={{ width: recommendationData?.confidence ? `${Math.round(recommendationData.confidence * 100)}%` : '94%' }} />
                                        </div>
                                    </div>

                                    {/* Navigate: opens Google Maps */}
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((recommendationData?.best_mandi ?? 'Mandi') + ' India')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 text-sm group"
                                    >
                                        <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">navigation</span>
                                        {t('navigateToMandi')}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
                                <div className="size-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                    <span className="material-symbols-outlined text-base">auto_awesome</span>
                                </div>
                                <h3 className="font-bold text-base">{t('aiInsights')}</h3>
                                <span className="ml-auto text-[10px] px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded-full font-semibold">{t('gptPowered')}</span>
                            </div>
                            <div className="p-5">
                                <div className="flex gap-4">
                                    <div className="size-9 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0 mt-0.5">
                                        <span className="material-symbols-outlined">smart_toy</span>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <p className="text-text-sub text-sm leading-relaxed">
                                            {hasData
                                                ? <Typewriter text={recommendationData?.explanation || t('defaultInsight')} />
                                                : t('defaultInsight')
                                            }
                                        </p>

                                        {spoilageData && (
                                            <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${spoilagePct > 60 ? 'bg-red-50 border-red-100 text-red-800' : spoilagePct > 30 ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                                                <span className="material-symbols-outlined text-xl flex-shrink-0">{spoilagePct > 60 ? 'error' : spoilagePct > 30 ? 'warning' : 'check_circle'}</span>
                                                <div>
                                                    <p className="font-bold text-sm">Spoilage Risk: {spoilageData.risk_level} ({spoilagePct}%)</p>
                                                    <p className="text-xs mt-0.5 opacity-80">{spoilageData.suggestion}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-2">
                                            {[t('demandSpike'), t('weatherRisk'), t('historicalHigh'), t('priceWindow'), t('marketTrend')].map(tag => (
                                                <span key={tag} className="px-2.5 py-1 bg-background-light border border-border-light text-text-sub text-xs rounded-full font-medium hover:border-primary hover:text-primary transition-colors cursor-default">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── FOOTER NOTE ─────────────────────────────────────── */}
                <p className="text-center text-xs text-text-sub pb-4">
                    Data refreshed in real-time · CropSense AI © {new Date().getFullYear()} · All insights are AI-generated recommendations
                </p>
            </main>
        </div >
    );
}
