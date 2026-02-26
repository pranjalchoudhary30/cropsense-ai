import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const CROPS = [
    'Wheat (Triticum aestivum)', 'Rice (Paddy)', 'Corn (Maize)',
    'Soybean', 'Cotton', 'Sugarcane', 'Mustard', 'Barley',
];

const NOTIFICATIONS = [
    { id: 1, icon: 'trending_up', color: 'text-green-600 bg-green-50', title: 'Price Alert', body: 'Wheat price up 8% in Khanna Mandi — great time to sell!', time: '2m ago', unread: true },
    { id: 2, icon: 'water_drop', color: 'text-blue-500 bg-blue-50', title: 'Weather Warning', body: 'Heavy rain expected in Punjab in the next 48 hours.', time: '1h ago', unread: true },
    { id: 3, icon: 'check_circle', color: 'text-primary bg-primary/10', title: 'Analysis Complete', body: 'Your latest crop analysis report is ready to view.', time: '3h ago', unread: false },
];

export default function Profile() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClick = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || 'Punjab, India',
        crop: user?.preferred_crop || CROPS[0],
        bio: user?.bio || '',
    });
    const [saving, setSaving] = useState(false);

    const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const handleSave = async () => {
        setSaving(true);
        // Simulated save — swap for real API call when backend endpoint exists
        await new Promise((r) => setTimeout(r, 900));
        setSaving(false);
        toast.success('Profile updated successfully!');
    };

    const initials = (user?.name || 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const inputCls =
        'w-full px-4 py-3 rounded-xl border border-border-light bg-background-light text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all placeholder:text-text-sub/50';

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
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-sub hover:text-primary hover:bg-primary/5 transition-all">
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

                        {/* avatar dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => { setDropdownOpen((o) => !o); setNotifOpen(false); }}
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
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary bg-primary/5 font-medium transition-colors">
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

            {/* ── MAIN ── */}
            <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

                {/* Back link */}
                <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text-sub hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Dashboard
                </Link>

                {/* Hero card */}
                <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm">
                    {/* Gradient banner */}
                    <div className="h-28 rounded-t-2xl bg-gradient-to-r from-primary via-accent to-emerald-400 relative">
                        <div className="absolute inset-0 rounded-t-2xl opacity-20"
                            style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                    </div>
                    {/* White area: avatar absolutely positioned to straddle the boundary */}
                    <div className="relative px-6 pb-6 pt-14">
                        {/* Avatar — absolutely positioned at top, overlapping banner */}
                        <div className="absolute -top-10 left-6 size-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-black ring-4 ring-surface-light shadow-lg z-10">
                            {initials}
                        </div>
                        {/* Info row fully in the white area */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="min-w-0">
                                <h1 className="text-2xl font-black text-text-main truncate">{user?.name || 'Unknown User'}</h1>
                                <p className="text-sm text-text-sub mt-0.5">{user?.email}</p>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-semibold w-fit">
                                <span className="size-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                Active Farmer
                            </div>
                        </div>
                    </div>
                </div>


                {/* Form grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── Left: stats ── */}
                    <div className="space-y-4">
                        <div className="bg-surface-light border border-border-light rounded-2xl p-5 space-y-4">
                            <h3 className="font-bold text-sm text-text-sub uppercase tracking-wider">Account Info</h3>
                            {[
                                { icon: 'verified_user', label: 'Account Type', value: 'Farmer Pro' },
                                { icon: 'calendar_month', label: 'Member Since', value: 'Feb 2026' },
                                { icon: 'bar_chart', label: 'Analyses Run', value: '24' },
                                { icon: 'trending_up', label: 'Avg. Accuracy', value: '92%' },
                            ].map(({ icon, label, value }) => (
                                <div key={label} className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                        <span className="material-symbols-outlined text-base">{icon}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-text-sub font-medium uppercase tracking-wide">{label}</p>
                                        <p className="text-sm font-semibold text-text-main">{value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-2xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-primary">workspace_premium</span>
                                <h3 className="font-bold text-sm text-primary">Pro Plan</h3>
                            </div>
                            <p className="text-xs text-text-sub leading-relaxed">
                                Unlimited AI analyses, real-time market alerts, and priority support.
                            </p>
                            <Link to="/pricing" className="mt-3 w-full py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                Manage Plan
                            </Link>
                        </div>
                    </div>

                    {/* ── Right: editable fields ── */}
                    <div className="lg:col-span-2 bg-surface-light border border-border-light rounded-2xl p-6 space-y-5">
                        <h2 className="font-bold text-base text-text-main flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">edit</span>
                            Edit Profile
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Full Name</label>
                                <input type="text" value={form.name} onChange={handle('name')}
                                    placeholder="Your full name" className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Email</label>
                                <input type="email" value={form.email} onChange={handle('email')}
                                    placeholder="your@email.com" className={`${inputCls} opacity-60 cursor-not-allowed`} disabled />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Phone Number</label>
                                <input type="tel" value={form.phone} onChange={handle('phone')}
                                    placeholder="+91 98765 43210" className={inputCls} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Location</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-primary pointer-events-none">
                                        <span className="material-symbols-outlined text-xl">location_on</span>
                                    </span>
                                    <input type="text" value={form.location} onChange={handle('location')}
                                        placeholder="e.g. Punjab, India"
                                        className={`${inputCls} pl-10`} />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Preferred Crop</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-primary pointer-events-none">
                                        <span className="material-symbols-outlined text-xl">grass</span>
                                    </span>
                                    <select value={form.crop} onChange={handle('crop')}
                                        className={`${inputCls} pl-10 appearance-none`}>
                                        {CROPS.map((c) => <option key={c}>{c}</option>)}
                                    </select>
                                    <span className="absolute inset-y-0 right-3 flex items-center text-text-sub pointer-events-none">
                                        <span className="material-symbols-outlined text-xl">expand_more</span>
                                    </span>
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-xs font-semibold text-text-sub uppercase tracking-wider mb-2">Short Bio</label>
                                <textarea value={form.bio} onChange={handle('bio')} rows={3}
                                    placeholder="Tell us a little about your farm…"
                                    className={`${inputCls} resize-none`} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button onClick={handleSave} disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold shadow-lg shadow-primary/30 hover:scale-[1.03] hover:shadow-primary/50 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                                {saving
                                    ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                                    : <><span className="material-symbols-outlined text-lg">save</span>Save Changes</>
                                }
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-text-sub pb-4">
                    CropSense AI © {new Date().getFullYear()} · Your data is encrypted and never shared
                </p>
            </main>
        </div>
    );
}
