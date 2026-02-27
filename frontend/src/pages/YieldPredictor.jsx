import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, RadialBarChart, RadialBar, Legend, Cell,
} from 'recharts';
import Squares from '../components/Squares';
import { predictYield, getYieldHistory } from '../services/api';
import toast from 'react-hot-toast';

/* ─────────────────────────────────────────────────────────── constants ── */
const CROPS = [
    { key: 'wheat', label: 'Wheat', hi: 'गेहूं', icon: '🌾' },
    { key: 'rice', label: 'Rice', hi: 'चावल', icon: '🌾' },
    { key: 'cotton', label: 'Cotton', hi: 'कपास', icon: '🧶' },
    { key: 'soybean', label: 'Soybean', hi: 'सोयाबीन', icon: '🫘' },
    { key: 'tomato', label: 'Tomato', hi: 'टमाटर', icon: '🍅' },
    { key: 'maize', label: 'Maize', hi: 'मक्का', icon: '🌽' },
    { key: 'sugarcane', label: 'Sugarcane', hi: 'गन्ना', icon: '🎋' },
];

const SOILS = [
    { key: 'alluvial', label: 'Alluvial', hi: 'जलोढ़ मिट्टी' },
    { key: 'black', label: 'Black Soil', hi: 'काली मिट्टी' },
    { key: 'red', label: 'Red Soil', hi: 'लाल मिट्टी' },
    { key: 'sandy', label: 'Sandy', hi: 'रेतीली मिट्टी' },
    { key: 'clay', label: 'Clay', hi: 'चिकनी मिट्टी' },
];

const RISK_STYLE = {
    Low: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', bar: '#10b981' },
    Medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', bar: '#f59e0b' },
    High: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', bar: '#ef4444' },
};

const LOADING_STEPS = [
    { icon: 'location_on', label: 'Reading location data', sub: 'Fetching coordinates & region info…' },
    { icon: 'cloud', label: 'Fetching weather data', sub: 'Checking temperature, rainfall & humidity…' },
    { icon: 'agriculture', label: 'Running crop model', sub: 'Applying soil & irrigation factors…' },
    { icon: 'currency_rupee', label: 'Calculating profit & risk', sub: 'Estimating revenue, cost & risk level…' },
];

const fmt = (n) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);
const fmtRs = (n) => `₹${new Intl.NumberFormat('en-IN').format(Math.round(n))}`;

/* ─────────────────────────────────────────── helpers ── */
function AnalysisLoader({ step }) {
    const pct = Math.round(((step + 1) / LOADING_STEPS.length) * 100);
    return (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <div className="size-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm">Analysing Your Farm</p>
                    <p className="text-white/70 text-xs">AI is calculating optimal yield…</p>
                </div>
                <span className="ml-auto text-white font-black text-lg">{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <div className="p-5 space-y-3">
                {LOADING_STEPS.map((s, i) => {
                    const done = i < step, active = i === step, pending = i > step;
                    return (
                        <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${pending ? 'opacity-30' : 'opacity-100'}`}>
                            <div className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-100 text-emerald-600' : active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-gray-100 text-gray-300'}`}>
                                {done
                                    ? <span className="material-symbols-outlined text-sm">check</span>
                                    : active
                                        ? <div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        : <span className="material-symbols-outlined text-sm">{s.icon}</span>
                                }
                            </div>
                            <div>
                                <p className={`text-sm font-semibold ${done ? 'text-emerald-700 line-through opacity-60' : active ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                                {active && <p className="text-xs text-gray-400 mt-0.5 animate-pulse">{s.sub}</p>}
                            </div>
                            {done && <span className="ml-auto text-xs text-emerald-600 font-semibold">Done</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function StepIndicator({ current, total }) {
    return (
        <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: total }).map((_, i) => (
                <React.Fragment key={i}>
                    <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < current ? 'bg-emerald-500 text-white' : i === current ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' : 'bg-gray-100 text-gray-400'}`}>
                        {i < current ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                    </div>
                    {i < total - 1 && <div className={`flex-1 h-1 rounded-full transition-all ${i < current ? 'bg-emerald-400' : 'bg-gray-100'}`} />}
                </React.Fragment>
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════ main component ══ */
export default function YieldPredictor() {
    const [step, setStep] = useState(0);           // 0-3 wizard steps
    const [hindi, setHindi] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadStep, setLoadStep] = useState(0);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const printRef = useRef(null);

    // Form state
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [gpsLoading, setGpsLoading] = useState(false);
    const [crop, setCrop] = useState('');
    const [landSize, setLandSize] = useState('');
    const [unit, setUnit] = useState('acres');
    const [soilType, setSoilType] = useState('alluvial');
    const [irrigation, setIrrigation] = useState(false);

    /* ── load history on mount ── */
    useEffect(() => {
        getYieldHistory().then(d => setHistory(d || [])).catch(() => { });
    }, [result]);

    /* ── loading step timer ── */
    useEffect(() => {
        if (!isAnalyzing) { setLoadStep(0); return; }
        setLoadStep(0);
        const t = [
            setTimeout(() => setLoadStep(1), 900),
            setTimeout(() => setLoadStep(2), 1900),
            setTimeout(() => setLoadStep(3), 2900),
        ];
        return () => t.forEach(clearTimeout);
    }, [isAnalyzing]);

    /* ── GPS ── */
    const detectLocation = () => {
        if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            pos => { setLat(pos.coords.latitude.toFixed(5)); setLon(pos.coords.longitude.toFixed(5)); setGpsLoading(false); toast.success('Location detected!'); },
            () => { setGpsLoading(false); toast.error('Could not get location. Enter manually.'); }
        );
    };

    /* ── Analyse ── */
    const handleAnalyze = async () => {
        if (!lat || !lon) { toast.error('Please set your farm location first.'); return; }
        if (!crop) { toast.error('Please select a crop.'); return; }
        if (!landSize || parseFloat(landSize) <= 0) { toast.error('Enter valid land size.'); return; }
        setIsAnalyzing(true);
        setResult(null);
        try {
            const data = await predictYield({
                latitude: parseFloat(lat),
                longitude: parseFloat(lon),
                crop,
                landSize: parseFloat(landSize),
                unit,
                soilType,
                irrigation,
            });
            setResult(data);
            toast.success('Prediction complete! 🌾');
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Prediction failed. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    /* ── PDF print ── */
    const handlePrint = () => window.print();

    const t = (en, hi) => hindi ? hi : en;
    const rsk = result ? (RISK_STYLE[result.riskLevel] || RISK_STYLE.Medium) : null;

    const chartData = result ? [
        { name: t('Revenue', 'आय'), value: result.expectedRevenue, fill: '#10b981' },
        { name: t('Cost', 'लागत'), value: result.estimatedCost, fill: '#f59e0b' },
        { name: t('Profit', 'लाभ'), value: Math.max(0, result.expectedProfit), fill: result.expectedProfit >= 0 ? '#3b82f6' : '#ef4444' },
    ] : [];

    const mapSrc = lat && lon
        ? `https://www.openstreetmap.org/export/embed.html?bbox=${+lon - 0.05},${+lat - 0.05},${+lon + 0.05},${+lat + 0.05}&layer=mapnik&marker=${lat},${lon}`
        : null;

    /* ── wizard steps ── */
    const steps = [
        { label: t('Location', 'स्थान'), icon: 'location_on' },
        { label: t('Crop', 'फसल'), icon: 'grass' },
        { label: t('Farm Info', 'खेत'), icon: 'agriculture' },
        { label: t('Analyse', 'विश्लेषण'), icon: 'bar_chart' },
    ];

    return (
        <div className="relative min-h-screen bg-gray-50 font-display print:bg-white" ref={printRef}>
            {/* Squares bg — hidden on print */}
            <div className="fixed inset-0 z-0 pointer-events-none print:hidden">
                <Squares speed={0.2} squareSize={44} direction="diagonal" borderColor="#d1fae5" hoverFillColor="#f0fdf4" />
            </div>

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm print:hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-600">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="font-semibold text-sm hidden sm:block">Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                            <span className="material-symbols-outlined text-lg">agriculture</span>
                        </div>
                        <span className="font-bold text-gray-800">{t('Yield Predictor', 'उपज भविष्यवक्ता')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Hindi toggle */}
                        <button
                            onClick={() => setHindi(!hindi)}
                            className={`text-xs px-3 py-1.5 rounded-full font-bold border transition-all ${hindi ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'}`}
                        >
                            {hindi ? 'ENG' : 'हिं'}
                        </button>
                        {/* History */}
                        <button
                            onClick={() => setShowHistory(!showHistory)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                            <span className="material-symbols-outlined text-sm">history</span>
                            {t('History', 'इतिहास')}{history.length > 0 && <span className="ml-1 bg-emerald-600 text-white rounded-full px-1.5">{history.length}</span>}
                        </button>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Hero */}
                <div className="text-center print:hidden">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {t('Smart Crop Yield', 'स्मार्ट फसल उपज')} <span className="text-emerald-600">{t('& Profit Predictor', 'और लाभ भविष्यवक्ता')}</span>
                    </h1>
                    <p className="mt-2 text-gray-500 text-sm max-w-lg mx-auto">
                        {t('Enter your farm details to get AI-powered yield, profit and risk predictions.', 'AI-शक्ति वाली उपज, लाभ और जोखिम भविष्यवाणी पाएं।')}
                    </p>
                </div>

                {/* ── Wizard (hidden when showing full results on print) ── */}
                {!result && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 print:hidden">
                        {/* Step indicator */}
                        <StepIndicator current={step} total={steps.length} />

                        {/* Step labels */}
                        <div className="flex justify-between mb-6 -mt-2">
                            {steps.map((s, i) => (
                                <button key={i} onClick={() => !isAnalyzing && setStep(i)}
                                    className={`flex flex-col items-center gap-1 text-[10px] font-semibold transition-colors ${i === step ? 'text-emerald-600' : i < step ? 'text-emerald-400' : 'text-gray-300'}`}>
                                    <span className="material-symbols-outlined text-base">{s.icon}</span>
                                    <span className="hidden sm:block">{s.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* ── STEP 0: Location ── */}
                        {step === 0 && (
                            <div className="space-y-4">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">location_on</span>
                                    {t('Step 1: Farm Location', 'चरण 1: खेत का स्थान')}
                                </h2>
                                <button onClick={detectLocation} disabled={gpsLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-200">
                                    {gpsLoading
                                        ? <><div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> {t('Detecting…', 'खोज रहे हैं…')}</>
                                        : <><span className="material-symbols-outlined">my_location</span>{t('Use My GPS Location', 'मेरी GPS स्थान उपयोग करें')}</>
                                    }
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-xs text-gray-400 font-medium">{t('or enter manually', 'या मैन्युअल दर्ज करें')}</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[['Latitude', t('Latitude', 'अक्षांश'), lat, setLat, '28.6139'], ['Longitude', t('Longitude', 'देशांतर'), lon, setLon, '77.2090']].map(([id, lbl, val, setter, ph]) => (
                                        <div key={id}>
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">{lbl}</label>
                                            <input type="number" step="any" placeholder={ph} value={val}
                                                onChange={e => setter(e.target.value)}
                                                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50" />
                                        </div>
                                    ))}
                                </div>
                                {/* Map preview */}
                                {mapSrc && (
                                    <div className="rounded-2xl overflow-hidden border border-emerald-100 shadow-sm h-48">
                                        <iframe src={mapSrc} className="w-full h-full" title="Farm location map" />
                                    </div>
                                )}
                                <button onClick={() => { if (!lat || !lon) { toast.error('Set location first'); return; } setStep(1); }}
                                    className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all">
                                    {t('Next →', 'आगे →')}
                                </button>
                            </div>
                        )}

                        {/* ── STEP 1: Crop ── */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">grass</span>
                                    {t('Step 2: Select Your Crop', 'चरण 2: अपनी फसल चुनें')}
                                </h2>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {CROPS.map(c => (
                                        <button key={c.key} onClick={() => setCrop(c.key)}
                                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-semibold text-sm ${crop === c.key ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md shadow-emerald-100' : 'border-gray-100 bg-white text-gray-600 hover:border-emerald-200'}`}>
                                            <span className="text-3xl">{c.icon}</span>
                                            <span>{hindi ? c.hi : c.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all">← {t('Back', 'वापस')}</button>
                                    <button onClick={() => { if (!crop) { toast.error('Select a crop'); return; } setStep(2); }}
                                        className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all">{t('Next →', 'आगे →')}</button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 2: Farm Info ── */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">agriculture</span>
                                    {t('Step 3: Farm Details', 'चरण 3: खेत विवरण')}
                                </h2>
                                {/* Land area */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                        {t('Land Area', 'भूमि क्षेत्र')}
                                    </label>
                                    <div className="flex gap-2">
                                        <input type="number" min="0.1" step="0.1" placeholder="e.g. 5"
                                            value={landSize} onChange={e => setLandSize(e.target.value)}
                                            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-gray-50" />
                                        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                                            {['acres', 'hectares'].map(u => (
                                                <button key={u} onClick={() => setUnit(u)}
                                                    className={`px-3 py-2 text-xs font-bold transition-colors ${unit === u ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>
                                                    {u === 'acres' ? t('Acres', 'एकड़') : t('Ha', 'हे॰')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Soil type */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('Soil Type', 'मिट्टी का प्रकार')}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {SOILS.map(s => (
                                            <button key={s.key} onClick={() => setSoilType(s.key)}
                                                className={`py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${soilType === s.key ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-100 bg-white text-gray-600 hover:border-emerald-200'}`}>
                                                {hindi ? s.hi : s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Irrigation */}
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                                    <div>
                                        <p className="font-semibold text-sm text-gray-700">{t('Irrigation Available?', 'सिंचाई उपलब्ध है?')}</p>
                                        <p className="text-xs text-gray-400">{t('Boosts yield by 12–25%', 'उपज 12–25% बढ़ती है')}</p>
                                    </div>
                                    <button onClick={() => setIrrigation(!irrigation)}
                                        className={`relative w-12 h-6 rounded-full transition-colors ${irrigation ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                                        <span className={`absolute top-1 size-4 rounded-full bg-white shadow transition-all ${irrigation ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all">← {t('Back', 'वापस')}</button>
                                    <button onClick={() => setStep(3)} disabled={!landSize}
                                        className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 disabled:opacity-40 transition-all">{t('Next →', 'आगे →')}</button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Analyse ── */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">bar_chart</span>
                                    {t('Step 4: Confirm & Analyse', 'चरण 4: पुष्टि करें और विश्लेषण करें')}
                                </h2>
                                {/* Summary */}
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 space-y-2">
                                    {[
                                        [t('Location', 'स्थान'), `${parseFloat(lat).toFixed(4)}°N, ${parseFloat(lon).toFixed(4)}°E`],
                                        [t('Crop', 'फसल'), CROPS.find(c => c.key === crop)?.label || crop],
                                        [t('Land Size', 'क्षेत्र'), `${landSize} ${unit}`],
                                        [t('Soil Type', 'मिट्टी'), SOILS.find(s => s.key === soilType)?.label || soilType],
                                        [t('Irrigation', 'सिंचाई'), irrigation ? t('Yes ✓', 'हाँ ✓') : t('No', 'नहीं')],
                                    ].map(([k, v]) => (
                                        <div key={k} className="flex justify-between text-sm">
                                            <span className="text-gray-500">{k}</span>
                                            <span className="font-semibold text-gray-800">{v}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all">← {t('Back', 'वापस')}</button>
                                    <button onClick={handleAnalyze} disabled={isAnalyzing}
                                        className="group relative flex-1 py-3 rounded-xl font-bold overflow-hidden disabled:opacity-50 shadow-lg shadow-emerald-200 hover:scale-[1.02] active:scale-95 transition-all">
                                        <span className="animate-gradient absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 bg-[length:300%_100%]" />
                                        <span className="relative flex items-center justify-center gap-2 text-white">
                                            {isAnalyzing ? <><div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />{t('Analysing…', 'विश्लेषण…')}</> : <><span className="material-symbols-outlined text-lg">analytics</span>{t('Analyse Yield & Profit', 'उपज और लाभ विश्लेषण करें')}</>}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Loading ── */}
                {isAnalyzing && <AnalysisLoader step={loadStep} />}

                {/* ════════════ RESULTS ════════════ */}
                {result && !isAnalyzing && (
                    <div className="space-y-5">

                        {/* Print header */}
                        <div className="hidden print:block mb-4">
                            <h1 className="text-2xl font-black text-emerald-700">CropSense AI — Yield Report</h1>
                            <p className="text-gray-500 text-sm">{result.cropName} · {result.landSize} {result.unit} · {new Date(result.timestamp).toLocaleString('en-IN')}</p>
                        </div>

                        {/* Action bar */}
                        <div className="flex items-center gap-3 flex-wrap print:hidden">
                            <button onClick={() => { setResult(null); setStep(0); }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                <span className="material-symbols-outlined text-sm">refresh</span>{t('New Prediction', 'नई भविष्यवाणी')}
                            </button>
                            <button onClick={handlePrint}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-sm">download</span>{t('Download PDF', 'PDF डाउनलोड')}
                            </button>
                        </div>

                        {/* ── Top stat cards ── */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { icon: '🌾', label: t('Predicted Yield', 'अनुमानित उपज'), value: `${fmt(result.predictedYield)} t`, sub: `${fmt(result.yieldPerAcre)} t/acre`, color: 'emerald' },
                                { icon: '💰', label: t('Expected Revenue', 'अनुमानित आय'), value: fmtRs(result.expectedRevenue), sub: t('at MSP/market rate', 'MSP/बाजार दर पर'), color: 'blue' },
                                { icon: '📉', label: t('Estimated Cost', 'अनुमानित लागत'), value: fmtRs(result.estimatedCost), sub: t('seed + fertiliser + labour', 'बीज+खाद+श्रम'), color: 'amber' },
                                {
                                    icon: result.expectedProfit >= 0 ? '📈' : '📉',
                                    label: t('Expected Profit', 'अनुमानित लाभ'),
                                    value: fmtRs(Math.abs(result.expectedProfit)),
                                    sub: result.expectedProfit >= 0 ? t('Net profit', 'शुद्ध लाभ') : t('Net loss', 'शुद्ध हानि'),
                                    color: result.expectedProfit >= 0 ? 'green' : 'red'
                                },
                            ].map(card => {
                                const colors = {
                                    emerald: 'border-emerald-100 bg-emerald-50 text-emerald-700',
                                    blue: 'border-blue-100 bg-blue-50 text-blue-700',
                                    amber: 'border-amber-100 bg-amber-50 text-amber-700',
                                    green: 'border-green-100 bg-green-50 text-green-700',
                                    red: 'border-red-100 bg-red-50 text-red-700',
                                };
                                return (
                                    <div key={card.label} className={`rounded-2xl border p-4 ${colors[card.color]} shadow-sm`}>
                                        <div className="text-2xl mb-2">{card.icon}</div>
                                        <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">{card.label}</p>
                                        <p className="text-xl font-black mt-1">{card.value}</p>
                                        <p className="text-xs opacity-60 mt-0.5">{card.sub}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Risk + Weather ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className={`rounded-2xl border p-5 ${rsk.bg} ${rsk.border} shadow-sm`}>
                                <h3 className={`font-bold text-sm flex items-center gap-2 mb-3 ${rsk.text}`}>
                                    <span className="material-symbols-outlined text-lg">warning</span>
                                    {t('Risk Assessment', 'जोखिम मूल्यांकन')}
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className={`size-3 rounded-full ${rsk.dot}`} />
                                    <span className={`text-2xl font-black ${rsk.text}`}>{t(result.riskLevel + ' Risk', result.riskLevel === 'Low' ? 'कम जोखिम' : result.riskLevel === 'Medium' ? 'मध्यम जोखिम' : 'उच्च जोखिम')}</span>
                                </div>
                                <p className={`text-sm mt-2 opacity-80 ${rsk.text}`}>{result.recommendations[0]}</p>
                            </div>
                            <div className="bg-white rounded-2xl border border-sky-100 p-5 shadow-sm">
                                <h3 className="font-bold text-sm text-sky-700 flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-lg">cloud</span>
                                    {t('Weather Summary', 'मौसम सारांश')}
                                </h3>
                                <p className="text-sm text-gray-700">{result.weatherSummary}</p>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    {[
                                        ['thermometer', `${result.weatherData.temperature}°C`, t('Temp', 'तापमान')],
                                        ['humidity_percentage', `${result.weatherData.humidity}%`, t('Humidity', 'नमी')],
                                        ['water_drop', `${result.weatherData.rainfall_forecast} mm`, t('Rainfall', 'वर्षा')],
                                        ['air', `${result.weatherData.wind_speed} m/s`, t('Wind', 'हवा')],
                                    ].map(([icon, val, lbl]) => (
                                        <div key={lbl} className="bg-sky-50 rounded-xl px-3 py-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sky-500 text-sm">{icon}</span>
                                            <div>
                                                <p className="text-xs font-bold text-sky-700">{val}</p>
                                                <p className="text-[10px] text-sky-500">{lbl}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ── Charts ── */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Bar chart */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-bold text-sm text-gray-700 mb-4">
                                    📊 {t('Revenue vs Cost vs Profit', 'आय बनाम लागत बनाम लाभ')}
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={chartData} barCategoryGap="30%">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                        <Tooltip formatter={v => [`₹${new Intl.NumberFormat('en-IN').format(v)}`, '']} />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                            {chartData.map((entry, i) => (
                                                <Cell key={i} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Radial gauge */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                <h3 className="font-bold text-sm text-gray-700 mb-4">
                                    🌾 {t('Yield Performance Score', 'उपज प्रदर्शन स्कोर')}
                                </h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <RadialBarChart
                                        cx="50%" cy="60%"
                                        innerRadius="55%" outerRadius="90%"
                                        startAngle={180} endAngle={0}
                                        data={[{ name: 'Score', value: Math.min(100, Math.round((result.yieldPerAcre / 10) * 100)), fill: rsk.bar }]}
                                    >
                                        <RadialBar background dataKey="value" cornerRadius={10} />
                                        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" className="fill-gray-900 font-black" fontSize={28} fontWeight={900}>
                                            {Math.min(100, Math.round((result.yieldPerAcre / 5) * 100))}
                                        </text>
                                        <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" fill="#9ca3af" fontSize={12}>
                                            {t('out of 100', '100 में से')}
                                        </text>
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* ── Recommendations ── */}
                        <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
                            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-3">
                                <span className="size-6 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                    <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                                </span>
                                {t('AI Recommendations', 'AI सुझाव')}
                            </h3>
                            <ul className="space-y-2">
                                {result.recommendations.map((rec, i) => (
                                    <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                                        <span className="material-symbols-outlined text-green-500 text-sm flex-shrink-0 mt-0.5">check_circle</span>
                                        {rec}
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>
                )}

                {/* ── History drawer ── */}
                {showHistory && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden print:hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600">history</span>
                                {t('Prediction History', 'भविष्यवाणी इतिहास')}
                            </h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <span className="material-symbols-outlined text-4xl text-gray-200 block mb-2">history</span>
                                {t('No predictions yet.', 'अभी तक कोई भविष्यवाणी नहीं।')}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {history.map(h => {
                                    const hs = RISK_STYLE[h.riskLevel] || RISK_STYLE.Medium;
                                    return (
                                        <div key={h.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                            <div className="size-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-xl">
                                                {CROPS.find(c => c.key === h.cropName?.toLowerCase())?.icon || '🌾'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-800">{h.cropName} · {h.landSize} {h.unit}</p>
                                                <p className="text-xs text-gray-400">{fmt(h.predictedYield)} t · {new Date(h.timestamp).toLocaleDateString('en-IN')}</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${hs.bg} ${hs.text} ${hs.border}`}>{h.riskLevel}</span>
                                                <p className={`text-xs mt-1 font-semibold ${h.expectedProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>{fmtRs(Math.abs(h.expectedProfit))}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                <p className="text-center text-xs text-gray-400 pb-4 print:hidden">
                    {t('All predictions are advisory — verify with your local KVK or agronomist.', 'सभी भविष्यवाणियां सलाहकारी हैं — अपने स्थानीय KVK या कृषि विशेषज्ञ से सत्यापित करें।')}
                </p>
            </main>

            {/* Print styles */}
            <style>{`
                @media print {
                    .print\\:hidden { display: none !important; }
                    .print\\:block  { display: block !important; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
            `}</style>
        </div>
    );
}
