import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

/* ── small toggle switch ── */
function Toggle({ checked, onChange }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${checked ? 'bg-primary' : 'bg-border-light'}`}
        >
            <span className={`inline-block size-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
}

/* ── section wrapper ── */
function Section({ icon, title, color = 'text-primary bg-primary/10', children }) {
    return (
        <div className="bg-surface-light border border-border-light rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center gap-3">
                <div className={`size-8 rounded-lg flex items-center justify-center ${color}`}>
                    <span className="material-symbols-outlined text-base">{icon}</span>
                </div>
                <h2 className="font-bold text-base text-text-main">{title}</h2>
            </div>
            <div className="p-5 space-y-4">{children}</div>
        </div>
    );
}

/* ── single row ── */
function Row({ label, sublabel, children }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-medium text-text-main">{label}</p>
                {sublabel && <p className="text-xs text-text-sub mt-0.5">{sublabel}</p>}
            </div>
            <div className="flex-shrink-0">{children}</div>
        </div>
    );
}

export default function Settings() {
    const { user, logout } = useAuth();
    const { lang, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);

    const initials = (user?.name || 'U')
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    /* notifications */
    const [notifs, setNotifs] = useState({
        emailAlerts: true,
        smsAlerts: false,
        priceDropAlerts: true,
        weeklyReport: true,
        marketNews: false,
    });
    const toggleNotif = (k) => setNotifs((n) => ({ ...n, [k]: !n[k] }));

    /* display */
    const [theme, setTheme] = useState('light');
    // language is now from LanguageContext — no local state needed

    /* close on click outside */
    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
            if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    /* privacy */
    const [privacy, setPrivacy] = useState({
        shareData: false,
        analytics: true,
        locationTracking: true,
    });
    const togglePrivacy = (k) => setPrivacy((p) => ({ ...p, [k]: !p[k] }));

    const handleSave = async () => {
        setSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        setSaving(false);
        toast.success('Settings saved!');
    };

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
                                        {[{ id: 1, icon: 'trending_up', color: 'text-green-600 bg-green-50', title: 'Price Alert', body: 'Wheat price up 8% in Khanna Mandi — great time to sell!', time: '2m ago', unread: true }, { id: 2, icon: 'water_drop', color: 'text-blue-500 bg-blue-50', title: 'Weather Warning', body: 'Heavy rain expected in Punjab in the next 48 hours.', time: '1h ago', unread: true }, { id: 3, icon: 'check_circle', color: 'text-primary bg-primary/10', title: 'Analysis Complete', body: 'Your latest crop analysis report is ready to view.', time: '3h ago', unread: false }].map(n => (
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

                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen((o) => !o)}
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
                                        <span className="material-symbols-outlined text-base">account_circle</span> Profile
                                    </Link>
                                    <Link to="/settings" onClick={() => setDropdownOpen(false)}
                                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary bg-primary/5 font-medium transition-colors">
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
            <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

                <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-text-sub hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-base">arrow_back</span>
                    Back to Dashboard
                </Link>

                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-text-main">Settings</h1>
                        <p className="text-sm text-text-sub">Manage your preferences and account options</p>
                    </div>
                </div>

                {/* Notifications */}
                <Section icon="notifications" title={t('notifications')}>
                    <Row label={t('emailAlerts')} sublabel={t('emailAlertsSub')}>
                        <Toggle checked={notifs.emailAlerts} onChange={() => toggleNotif('emailAlerts')} />
                    </Row>
                    <div className="border-t border-border-light" />
                    <Row label={t('smsAlerts')} sublabel={t('smsAlertsSub')}>
                        <Toggle checked={notifs.smsAlerts} onChange={() => toggleNotif('smsAlerts')} />
                    </Row>
                    <div className="border-t border-border-light" />
                    <Row label={t('priceDropAlerts')} sublabel={t('priceDropAlertsSub')}>
                        <Toggle checked={notifs.priceDropAlerts} onChange={() => toggleNotif('priceDropAlerts')} />
                    </Row>
                    <div className="border-t border-border-light" />
                    <Row label={t('weeklyReport')} sublabel={t('weeklyReportSub')}>
                        <Toggle checked={notifs.weeklyReport} onChange={() => toggleNotif('weeklyReport')} />
                    </Row>
                    <div className="border-t border-border-light" />
                    <Row label={t('marketNews')} sublabel={t('marketNewsSub')}>
                        <Toggle checked={notifs.marketNews} onChange={() => toggleNotif('marketNews')} />
                    </Row>
                </Section>

                {/* Display */}
                <Section icon="palette" title={t('displayLanguage')} color="text-purple-600 bg-purple-100">
                    <Row label={t('theme')}>
                        <div className="flex items-center gap-2">
                            {[['light', 'light_mode', t('light')], ['system', 'brightness_auto', t('system')], ['dark', 'dark_mode', t('dark')]].map(([val, icon, lbl]) => (
                                <button key={val} onClick={() => setTheme(val)}
                                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${theme === val ? 'border-primary text-primary bg-primary/5' : 'border-border-light text-text-sub hover:border-primary/40'}`}>
                                    <span className="material-symbols-outlined text-base">{icon}</span>
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </Row>
                    <div className="border-t border-border-light" />
                    <Row label={t('language')} sublabel={t('languageSub')}>
                        <select value={lang} onChange={(e) => setLanguage(e.target.value)}
                            className="px-3 py-2 rounded-xl border border-border-light bg-background-light text-text-main text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                            <option value="en">English</option>
                            <option value="hi">हिंदी</option>
                            <option value="pa">ਪੰਜਾਬੀ</option>
                            <option value="mr">मराठी</option>
                            <option value="gu">ગુજરાતી</option>
                            <option value="te">తెలుగు</option>
                        </select>
                    </Row>
                </Section>

                {/* Privacy */}
                <Section icon="shield" title={t('privacyData')} color="text-blue-600 bg-blue-100">
                    <Row label={t('shareData')} sublabel={t('shareDataSub')}>
                        <Toggle checked={privacy.shareData} onChange={() => togglePrivacy('shareData')} />
                    </Row>
                    <div className="border-t border-border-light" />
                    <Row label={t('analytics')} sublabel={t('analyticsSub')}>
                        <Toggle checked={privacy.analytics} onChange={() => togglePrivacy('analytics')} />
                    </Row>
                    <div className="border-t border-border-light" />
                    <Row label={t('locationTracking')} sublabel={t('locationTrackingSub')}>
                        <Toggle checked={privacy.locationTracking} onChange={() => togglePrivacy('locationTracking')} />
                    </Row>
                </Section>

                {/* Save button */}
                <div className="flex justify-end">
                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold shadow-lg shadow-primary/30 hover:scale-[1.03] hover:shadow-primary/50 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100">
                        {saving
                            ? <><div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t('saving')}</>
                            : <><span className="material-symbols-outlined text-lg">save</span>{t('saveSettings')}</>
                        }
                    </button>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-100 rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-red-100 flex items-center gap-3">
                        <div className="size-8 rounded-lg flex items-center justify-center text-red-600 bg-red-100">
                            <span className="material-symbols-outlined text-base">warning</span>
                        </div>
                        <h2 className="font-bold text-base text-red-700">{t('dangerZone')}</h2>
                    </div>
                    <div className="p-5">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-red-700">{t('deleteAccount')}</p>
                                <p className="text-xs text-red-500 mt-0.5">{t('deleteAccountSub')}</p>
                            </div>
                            <button onClick={() => setDeleteModal(true)}
                                className="flex-shrink-0 px-4 py-2 rounded-xl border-2 border-red-400 text-red-600 text-sm font-bold hover:bg-red-600 hover:text-white transition-all">
                                {t('delete')}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-text-sub pb-4">
                    CropSense AI © {new Date().getFullYear()} · Changes are saved to your account
                </p>
            </main>

            {/* ── DELETE CONFIRMATION MODAL ── */}
            {deleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-surface-light rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-border-light">
                        <div className="size-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                            <span className="material-symbols-outlined text-2xl">delete_forever</span>
                        </div>
                        <h3 className="text-lg font-black text-text-main text-center">{t('confirmDelete')}</h3>
                        <p className="text-sm text-text-sub text-center leading-relaxed">
                            {t('confirmDeleteBody')}
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button onClick={() => setDeleteModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-border-light text-text-sub font-semibold hover:border-primary hover:text-primary transition-all text-sm">
                                {t('cancel')}
                            </button>
                            <button onClick={() => { setDeleteModal(false); logout(); navigate('/login'); toast.error('Account deleted.'); }}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all text-sm">
                                {t('deleteAccount')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
