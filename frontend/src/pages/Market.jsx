import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar
} from 'recharts';

/* ── mock data ── */
const MANDI_PRICES = [
    { name: 'Wheat', mandi: 'Khanna Mandi, Punjab', price: 2480, change: +2.4, unit: 'Qtl', icon: 'grain', color: '#f59e0b' },
    { name: 'Rice (Paddy)', mandi: 'Kurnool, AP', price: 2150, change: -0.8, unit: 'Qtl', icon: 'rice_bowl', color: '#10b981' },
    { name: 'Corn (Maize)', mandi: 'Davangere, Karnataka', price: 1890, change: +4.1, unit: 'Qtl', icon: 'eco', color: '#f97316' },
    { name: 'Soybean', mandi: 'Indore, MP', price: 4420, change: +1.2, unit: 'Qtl', icon: 'grass', color: '#8b5cf6' },
    { name: 'Cotton', mandi: 'Rajkot, Gujarat', price: 6900, change: -1.5, unit: 'Qtl', icon: 'filter_vintage', color: '#06b6d4' },
    { name: 'Mustard', mandi: 'Alwar, Rajasthan', price: 5350, change: +3.7, unit: 'Qtl', icon: 'local_florist', color: '#eab308' },
    { name: 'Sugarcane', mandi: 'Muzaffarnagar, UP', price: 350, change: 0, unit: 'Qtl', icon: 'water_drop', color: '#ef4444' },
    { name: 'Barley', mandi: 'Jaipur, Rajasthan', price: 1820, change: +1.8, unit: 'Qtl', icon: 'spa', color: '#84cc16' },
];

const PRICE_CHART_DATA = {
    Wheat: [
        { d: 'Jan', p: 2250 }, { d: 'Feb', p: 2310 }, { d: 'Mar', p: 2290 },
        { d: 'Apr', p: 2380 }, { d: 'May', p: 2420 }, { d: 'Jun', p: 2480 },
    ],
    Rice: [
        { d: 'Jan', p: 2060 }, { d: 'Feb', p: 2100 }, { d: 'Mar', p: 2080 },
        { d: 'Apr', p: 2130 }, { d: 'May', p: 2170 }, { d: 'Jun', p: 2150 },
    ],
    Soybean: [
        { d: 'Jan', p: 4100 }, { d: 'Feb', p: 4250 }, { d: 'Mar', p: 4180 },
        { d: 'Apr', p: 4320 }, { d: 'May', p: 4390 }, { d: 'Jun', p: 4420 },
    ],
};

const TOP_MANDIS = [
    { rank: 1, name: 'Khanna Mandi', state: 'Punjab', volume: '48,200 Qtl', change: '+3.2%', positive: true },
    { rank: 2, name: 'Azadpur Mandi', state: 'Delhi', volume: '39,400 Qtl', change: '+1.8%', positive: true },
    { rank: 3, name: 'Vashi (APMC)', state: 'Maharashtra', volume: '28,600 Qtl', change: '-0.4%', positive: false },
    { rank: 4, name: 'Kurnool Market', state: 'Andhra Pradesh', volume: '22,100 Qtl', change: '+5.1%', positive: true },
    { rank: 5, name: 'Unjha APMC', state: 'Gujarat', volume: '18,900 Qtl', change: '+2.3%', positive: true },
];

const MARKET_NEWS = [
    { icon: 'trending_up', color: 'text-green-600 bg-green-50', tag: 'Price Alert', title: 'Wheat prices rise 4% on strong export demand', time: '15 min ago' },
    { icon: 'cloud', color: 'text-blue-500 bg-blue-50', tag: 'Weather', title: 'IMD warns of below-normal rainfall in northwest India', time: '1h ago' },
    { icon: 'policy', color: 'text-purple-600 bg-purple-50', tag: 'Policy', title: 'Govt revises MSP for Kharif crops — up ₹300/Qtl', time: '3h ago' },
    { icon: 'store', color: 'text-orange-500 bg-orange-50', tag: 'Mandi Update', title: 'Soybean trading volumes surge 20% in Indore', time: '4h ago' },
];

const NOTIFICATIONS = [
    { id: 1, icon: 'trending_up', color: 'text-green-600 bg-green-50', title: 'Price Alert', body: 'Wheat price up 8% in Khanna Mandi — great time to sell!', time: '2m ago', unread: true },
    { id: 2, icon: 'water_drop', color: 'text-blue-500 bg-blue-50', title: 'Weather Warning', body: 'Heavy rain expected in Punjab in the next 48 hours.', time: '1h ago', unread: true },
    { id: 3, icon: 'check_circle', color: 'text-primary bg-primary/10', title: 'Analysis Complete', body: 'Your latest crop analysis report is ready to view.', time: '3h ago', unread: false },
];

const fmt = (n) => n != null ? Number(n).toLocaleString('en-IN') : '—';

const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface-light border border-border-light rounded-xl px-4 py-2 shadow-xl text-sm">
            <p className="text-text-sub text-xs mb-0.5">{label}</p>
            <p className="font-bold text-primary">₹{fmt(payload[0].value)}</p>
        </div>
    );
};

export default function Market() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [selectedChart, setSelectedChart] = useState('Wheat');
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const filtered = MANDI_PRICES.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mandi.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const chartData = PRICE_CHART_DATA[selectedChart] ?? PRICE_CHART_DATA.Wheat;
    const currentChartPrice = chartData[chartData.length - 1]?.p;
    const firstChartPrice = chartData[0]?.p;
    const chartPct = firstChartPrice ? (((currentChartPrice - firstChartPrice) / firstChartPrice) * 100).toFixed(1) : '0.0';
    const chartUp = parseFloat(chartPct) >= 0;

    return (
        <div className="bg-background-light text-text-main font-display min-h-screen flex flex-col">

            {/* ── HEADER ── */}
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
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${href === '/market' ? 'text-primary bg-primary/10' : 'text-text-sub hover:text-primary hover:bg-primary/5'}`}>
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
                        {/* Notification Bell */}
                        <div className="relative" ref={notifRef}>
                            <button onClick={() => setNotifOpen(o => !o)}
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

                        {/* Avatar dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => { setDropdownOpen(o => !o); setNotifOpen(false); }}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border-light hover:border-primary/40 hover:bg-primary/5 transition-all">
                                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">
                                    {initials}
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
                                        <span className="material-symbols-outlined text-base">account_circle</span> {t('profile')}
                                    </Link>
                                    <Link to="/settings" onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-sub hover:text-primary hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-base">settings</span> {t('settings')}
                                    </Link>
                                    <div className="border-t border-border-light mt-1 pt-1">
                                        <button onClick={() => { logout(); navigate('/login'); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                                            <span className="material-symbols-outlined text-base">logout</span> {t('signOut')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── MAIN ── */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">

                {/* Page title + live badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-2xl">store</span>
                            {t('marketPrices')}
                        </h1>
                        <p className="text-sm text-text-sub mt-1">{t('lastUpdated')}: Today, 11:02 PM IST</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 text-green-700 text-sm font-medium">
                        <span className="relative flex size-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                            <span className="relative inline-flex rounded-full size-2 bg-green-500" />
                        </span>
                        {t('liveMarketData')}
                    </div>
                </div>

                {/* ── STATS ROW ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                        { icon: 'trending_up', label: t('topGainer'), value: 'Maize +4.1%', color: 'text-green-600', bg: 'bg-green-50' },
                        { icon: 'trending_down', label: t('topLoser'), value: 'Cotton -1.5%', color: 'text-red-500', bg: 'bg-red-50' },
                        { icon: 'storefront', label: t('activeMandis'), value: '2,847', color: 'text-primary', bg: 'bg-primary/5' },
                        { icon: 'swap_horiz', label: t('totalVolume'), value: '2.1L Qtl', color: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map(({ icon, label, value, color, bg }) => (
                        <div key={label} className="shine-card bg-surface-light border border-border-light rounded-xl p-4 flex items-center gap-3 shadow-sm">
                            <div className={`size-10 rounded-xl ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
                                <span className="material-symbols-outlined text-xl">{icon}</span>
                            </div>
                            <div>
                                <p className="text-xs text-text-sub">{label}</p>
                                <p className={`font-bold text-sm ${color}`}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── MAIN GRID ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* LEFT: Commodity Price Table */}
                    <div className="lg:col-span-7 bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-border-light flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                            <div>
                                <h2 className="font-bold text-base flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">bar_chart</span>
                                    {t('commodityPrices')}
                                </h2>
                                <p className="text-xs text-text-sub mt-0.5">Live mandi rates across India — {t('pricePerQtl')}</p>
                            </div>
                            {/* Search */}
                            <div className="relative">
                                <span className="absolute inset-y-0 left-3 flex items-center text-text-sub pointer-events-none">
                                    <span className="material-symbols-outlined text-sm">search</span>
                                </span>
                                <input
                                    type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    placeholder={t('searchPlaceholder')}
                                    className="pl-8 pr-4 py-2 rounded-xl border border-border-light bg-background-light text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all w-52"
                                />
                            </div>
                        </div>

                        <div className="divide-y divide-border-light">
                            {filtered.map((crop) => (
                                <div key={crop.name} className="flex items-center gap-4 px-5 py-3.5 hover:bg-primary/[0.02] transition-colors group">
                                    <div className="size-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: crop.color + '20' }}>
                                        <span className="material-symbols-outlined text-lg" style={{ color: crop.color }}>{crop.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-text-main">{crop.name}</p>
                                        <p className="text-xs text-text-sub truncate">{crop.mandi}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-base text-text-main">₹{fmt(crop.price)}</p>
                                        <p className={`text-xs font-semibold flex items-center justify-end gap-0.5 ${crop.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            <span className="material-symbols-outlined text-xs">{crop.change >= 0 ? 'arrow_upward' : 'arrow_downward'}</span>
                                            {Math.abs(crop.change)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {filtered.length === 0 && (
                                <div className="py-10 text-center text-text-sub text-sm">No results found for "{searchQuery}"</div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: Chart + Top Mandis */}
                    <div className="lg:col-span-5 flex flex-col gap-6">

                        {/* Price Trend Chart */}
                        <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-border-light">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="font-bold text-sm flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-base">show_chart</span>
                                            6-Month Price Trend
                                        </h2>
                                        <p className={`text-xs font-semibold mt-0.5 flex items-center gap-0.5 ${chartUp ? 'text-green-600' : 'text-red-500'}`}>
                                            <span className="material-symbols-outlined text-xs">{chartUp ? 'arrow_upward' : 'arrow_downward'}</span>
                                            {chartUp ? '+' : ''}{chartPct}% in 6 months
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        {Object.keys(PRICE_CHART_DATA).map(k => (
                                            <button key={k} onClick={() => setSelectedChart(k)}
                                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selectedChart === k ? 'bg-primary text-white' : 'bg-background-light text-text-sub hover:text-primary border border-border-light'}`}>
                                                {k}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="p-4">
                                <ResponsiveContainer width="100%" height={160}>
                                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                                        <defs>
                                            <linearGradient id="mktGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#526353' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#526353' }} axisLine={false} tickLine={false}
                                            domain={['auto', 'auto']} tickFormatter={v => `₹${v}`} width={48} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="p" stroke="#10b981" strokeWidth={2} fill="url(#mktGrad)" dot={false} activeDot={{ r: 4, fill: '#10b981' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Mandis by Volume */}
                        <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-border-light">
                                <h2 className="font-bold text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-base">leaderboard</span>
                                    {t('topMandisByVol')}
                                </h2>
                            </div>
                            <div className="divide-y divide-border-light">
                                {TOP_MANDIS.map(m => (
                                    <div key={m.rank} className="flex items-center gap-3 px-5 py-3 hover:bg-primary/[0.02] transition-colors">
                                        <div className={`size-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${m.rank === 1 ? 'bg-yellow-100 text-yellow-700' : m.rank === 2 ? 'bg-slate-100 text-slate-600' : 'bg-background-light text-text-sub border border-border-light'}`}>
                                            {m.rank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-text-main truncate">{m.name}</p>
                                            <p className="text-xs text-text-sub">{m.state} · {m.volume}</p>
                                        </div>
                                        <span className={`text-xs font-bold ${m.positive ? 'text-green-600' : 'text-red-500'}`}>{m.change}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MARKET NEWS ── */}
                <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
                        <h2 className="font-bold text-base flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">article</span>
                            {t('marketNewsAlerts')}
                        </h2>
                        <button className="text-xs font-semibold text-primary hover:underline">{t('viewAll')}</button>
                    </div>
                    <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border-light">
                        {MARKET_NEWS.map((news, i) => (
                            <div key={i} className="flex gap-3 px-5 py-4 hover:bg-primary/[0.02] transition-colors cursor-pointer">
                                <div className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${news.color}`}>
                                    <span className="material-symbols-outlined text-base">{news.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-border-light text-text-sub">{news.tag}</span>
                                        <span className="text-[10px] text-text-sub">{news.time}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-text-main leading-snug">{news.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-xs text-text-sub pb-4">
                    {t('dataFooter')}{new Date().getFullYear()} {t('pricesIndicative')}
                </p>
            </main>
        </div>
    );
}
