import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const PLANS = [
    {
        id: 'free',
        name: 'Starter',
        price: { monthly: 0, annual: 0 },
        description: 'Perfect for small farms just getting started with AI insights.',
        color: 'from-slate-400 to-slate-500',
        badge: null,
        features: [
            { text: '5 AI analyses per month', included: true },
            { text: 'Basic price trend charts', included: true },
            { text: 'Weather forecast (3-day)', included: true },
            { text: 'Single crop tracking', included: true },
            { text: 'Real-time Mandi recommendations', included: false },
            { text: 'Spoilage risk alerts', included: false },
            { text: 'Satellite land scans', included: false },
            { text: 'Priority support', included: false },
        ],
        cta: 'Get Started Free',
        ctaStyle: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 499, annual: 399 },
        description: 'Everything you need to maximize your harvest profits.',
        color: 'from-primary to-accent',
        badge: 'Most Popular',
        features: [
            { text: 'Unlimited AI analyses', included: true },
            { text: 'Advanced price predictions (14-day)', included: true },
            { text: 'Weather forecast (14-day)', included: true },
            { text: 'Up to 8 crops simultaneously', included: true },
            { text: 'Real-time Mandi recommendations', included: true },
            { text: 'Spoilage risk alerts', included: true },
            { text: 'Satellite land scans (weekly)', included: false },
            { text: 'Priority support', included: false },
        ],
        cta: 'Start Pro Trial',
        ctaStyle: 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg shadow-primary/30 hover:shadow-primary/50',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: { monthly: 1499, annual: 1199 },
        description: 'Full-scale intelligence for large farms and agri-businesses.',
        color: 'from-purple-500 to-blue-500',
        badge: 'Best Value',
        features: [
            { text: 'Unlimited AI analyses', included: true },
            { text: 'Advanced price predictions (30-day)', included: true },
            { text: 'Weather forecast (30-day)', included: true },
            { text: 'Unlimited crop tracking', included: true },
            { text: 'Real-time Mandi recommendations', included: true },
            { text: 'Spoilage risk alerts', included: true },
            { text: 'Satellite land scans (daily)', included: true },
            { text: 'Priority support + account manager', included: true },
        ],
        cta: 'Contact Sales',
        ctaStyle: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50',
    },
];

const FAQS = [
    { q: 'Can I cancel anytime?', a: 'Yes — cancel your subscription at any time. You retain access until the end of your billing period. No hidden fees.' },
    { q: 'Is there a free trial?', a: 'Pro and Enterprise plans include a 14-day free trial with no credit card required.' },
    { q: 'Can I switch between plans?', a: 'Absolutely. Upgrade or downgrade at any time. Prorated credits are applied automatically.' },
    { q: 'What payment methods do you accept?', a: 'We accept all major credit cards, UPI, net banking, and PayTM through our secure Razorpay integration.' },
    { q: 'Is my billing information secure?', a: 'Yes. All payment processing is handled by Razorpay (PCI-DSS Level 1 certified). We never store your card details.' },
];

function FAQItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-xl border border-border-light bg-surface-light overflow-hidden">
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 text-left text-text-main font-semibold hover:bg-primary/5 transition-colors">
                <span>{q}</span>
                <span className="material-symbols-outlined text-primary transition-transform duration-200 flex-shrink-0 ml-4"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
            </button>
            {open && <div className="px-6 pb-5 text-sm text-text-sub leading-relaxed border-t border-border-light pt-3">{a}</div>}
        </div>
    );
}

export default function Pricing() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [annual, setAnnual] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [currentPlan] = useState('pro'); // in real app this comes from user data

    const initials = (user?.name || 'U')
        .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const handleSelect = (planId) => {
        if (planId === 'free') {
            toast.success('You are already on the Starter plan!');
        } else if (planId === currentPlan) {
            toast.success('This is your current plan!');
        } else if (planId === 'enterprise') {
            toast('Our sales team will reach out shortly!', { icon: '📞' });
        } else {
            toast.success(`Upgrading to ${planId === 'pro' ? 'Pro' : 'Enterprise'}...`);
        }
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
                        {[['Dashboard', 'dashboard', '/dashboard'], ['Market', 'store', '#'], ['Insights', 'auto_awesome', '#']].map(([label, icon, href]) => (
                            <a key={label} href={href}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-sub hover:text-primary hover:bg-primary/5 transition-all">
                                <span className="material-symbols-outlined text-base">{icon}</span>
                                {label}
                            </a>
                        ))}
                    </nav>

                    <div className="flex items-center gap-3">
                        <button className="relative size-9 rounded-full hover:bg-border-light transition-colors flex items-center justify-center text-text-sub">
                            <span className="material-symbols-outlined text-xl">notifications</span>
                            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full ring-2 ring-surface-light" />
                        </button>
                        <div className="relative">
                            <button onClick={() => setDropdownOpen(o => !o)}
                                className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-border-light hover:border-primary/40 hover:bg-primary/5 transition-all">
                                <div className="size-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-sm">{initials}</div>
                                <span className="text-sm font-medium hidden sm:block">{user?.name?.split(' ')[0] || 'User'}</span>
                                <span className="material-symbols-outlined text-text-sub text-base">expand_more</span>
                            </button>
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-surface-light border border-border-light rounded-xl shadow-2xl py-2 z-50">
                                    <div className="px-4 py-3 border-b border-border-light">
                                        <p className="font-semibold text-sm text-text-main truncate">{user?.name}</p>
                                        <p className="text-xs text-text-sub truncate mt-0.5">{user?.email}</p>
                                    </div>
                                    <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-sub hover:text-primary hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-base">account_circle</span> Profile
                                    </Link>
                                    <Link to="/settings" onClick={() => setDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-sub hover:text-primary hover:bg-primary/5 transition-colors">
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

            <main className="flex-1">
                {/* ── HERO ── */}
                <section className="relative overflow-hidden bg-surface-light px-6 py-16 lg:py-24 text-center">
                    <div className="absolute inset-0 -z-0 pointer-events-none">
                        <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-[80px]" />
                        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[80px]" />
                    </div>
                    <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center gap-6">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-semibold text-primary">
                            <span className="material-symbols-outlined text-base">workspace_premium</span>
                            Plans & Pricing
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-text-main sm:text-5xl">
                            Simple, transparent<br />
                            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg,#10b981,#06b6d4)' }}>pricing for every farm</span>
                        </h1>
                        <p className="text-lg text-text-sub max-w-xl">
                            Start free, scale as your farm grows. No hidden fees. Cancel anytime.
                        </p>

                        {/* Billing toggle */}
                        <div className="flex items-center gap-3 bg-background-light border border-border-light rounded-full px-2 py-1.5">
                            <button onClick={() => setAnnual(false)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? 'bg-primary text-white shadow-md' : 'text-text-sub hover:text-primary'}`}>
                                Monthly
                            </button>
                            <button onClick={() => setAnnual(true)}
                                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 ${annual ? 'bg-primary text-white shadow-md' : 'text-text-sub hover:text-primary'}`}>
                                Annual
                                <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Save 20%</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* ── PLAN CARDS ── */}
                <section className="px-6 py-8 lg:px-12 -mt-4">
                    <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        {PLANS.map((plan) => {
                            const price = annual ? plan.price.annual : plan.price.monthly;
                            const isCurrent = plan.id === currentPlan;
                            const isPopular = plan.badge === 'Most Popular';
                            return (
                                <div key={plan.id}
                                    className={`relative rounded-2xl border bg-surface-light flex flex-col overflow-hidden shadow-sm transition-all hover:shadow-xl ${isPopular ? 'border-primary ring-2 ring-primary ring-offset-2 scale-[1.02]' : 'border-border-light hover:border-primary/40'}`}>
                                    {/* Top gradient bar */}
                                    <div className={`h-1.5 w-full bg-gradient-to-r ${plan.color}`} />

                                    {plan.badge && (
                                        <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full text-white bg-gradient-to-r ${plan.color}`}>
                                            {plan.badge}
                                        </div>
                                    )}
                                    {isCurrent && (
                                        <div className="absolute top-4 left-4 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                                            <span className="size-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                                            Current Plan
                                        </div>
                                    )}

                                    <div className="p-6 flex flex-col gap-5 flex-1">
                                        <div className="pt-6">
                                            <h3 className="text-xl font-black text-text-main">{plan.name}</h3>
                                            <p className="text-sm text-text-sub mt-1">{plan.description}</p>
                                        </div>

                                        <div className="flex items-end gap-1">
                                            <span className="text-4xl font-black text-text-main">
                                                {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
                                            </span>
                                            {price > 0 && <span className="text-text-sub text-sm mb-1.5">/month{annual ? ' (billed annually)' : ''}</span>}
                                        </div>

                                        <ul className="flex flex-col gap-2.5">
                                            {plan.features.map((f, i) => (
                                                <li key={i} className={`flex items-start gap-2.5 text-sm ${f.included ? 'text-text-main' : 'text-text-sub/50'}`}>
                                                    <span className={`material-symbols-outlined text-base flex-shrink-0 mt-0.5 ${f.included ? 'text-primary' : 'text-border-light'}`}>
                                                        {f.included ? 'check_circle' : 'remove_circle'}
                                                    </span>
                                                    {f.text}
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleSelect(plan.id)}
                                            className={`mt-auto w-full py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-95 ${plan.ctaStyle}`}>
                                            {isCurrent ? '✓ Current Plan' : plan.cta}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* ── FEATURE COMPARISON TABLE ── */}
                <section className="px-6 py-16 lg:px-12">
                    <div className="mx-auto max-w-4xl">
                        <h2 className="text-2xl font-black text-text-main text-center mb-8">Full Feature Comparison</h2>
                        <div className="rounded-2xl border border-border-light bg-surface-light overflow-hidden shadow-sm">
                            <div className="grid grid-cols-4 bg-background-light border-b border-border-light">
                                <div className="p-4 text-sm font-bold text-text-sub">Feature</div>
                                {PLANS.map(p => (
                                    <div key={p.id} className={`p-4 text-sm font-bold text-center ${p.id === currentPlan ? 'text-primary' : 'text-text-main'}`}>{p.name}</div>
                                ))}
                            </div>
                            {[
                                ['AI Analyses', '5/month', 'Unlimited', 'Unlimited'],
                                ['Price Forecast', '7-day', '14-day', '30-day'],
                                ['Weather Data', '3-day', '14-day', '30-day'],
                                ['Crop Tracking', '1 crop', '8 crops', 'Unlimited'],
                                ['Mandi Alerts', '✗', '✓', '✓'],
                                ['Spoilage Risk', '✗', '✓', '✓'],
                                ['Satellite Scans', '✗', '✗', 'Daily'],
                                ['Support', 'Community', 'Email', 'Priority + Manager'],
                            ].map(([feature, ...vals], ri) => (
                                <div key={feature} className={`grid grid-cols-4 border-b border-border-light last:border-0 ${ri % 2 === 0 ? '' : 'bg-background-light/50'}`}>
                                    <div className="p-4 text-sm text-text-main font-medium">{feature}</div>
                                    {vals.map((v, i) => (
                                        <div key={i} className={`p-4 text-sm text-center font-medium ${v === '✗' ? 'text-text-sub/40' : PLANS[i].id === currentPlan ? 'text-primary font-bold' : 'text-text-sub'}`}>{v}</div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section className="px-6 pb-16 lg:px-12">
                    <div className="mx-auto max-w-2xl flex flex-col gap-6">
                        <h2 className="text-2xl font-black text-text-main text-center">Frequently Asked Questions</h2>
                        <div className="flex flex-col gap-3">
                            {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
                        </div>
                    </div>
                </section>

                {/* ── CTA ── */}
                <section className="px-6 pb-16 lg:px-12">
                    <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-accent p-12 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-16 -left-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black sm:text-4xl">Not sure which plan is right?</h2>
                            <p className="mt-3 text-white/80 text-lg">Start free and upgrade when you're ready. Our team is happy to help.</p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                                <button onClick={() => navigate('/dashboard')}
                                    className="px-8 py-3.5 rounded-xl bg-white text-primary font-bold hover:scale-105 transition-transform shadow-lg">
                                    Go to Dashboard
                                </button>
                                <Link to="/profile"
                                    className="px-8 py-3.5 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm text-white font-bold hover:bg-white/20 transition-colors">
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border-light px-6 py-6 text-center text-xs text-text-sub">
                CropSense AI © {new Date().getFullYear()} · All prices include GST · Cancel anytime
            </footer>
        </div>
    );
}
