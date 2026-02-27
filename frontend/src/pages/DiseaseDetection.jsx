import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { detectDisease, getDetectionHistory } from '../services/api';
import Squares from '../components/Squares';
import toast from 'react-hot-toast';

/* ── Severity helpers ────────────────────────────────────────────── */
const SEVERITY_STYLES = {
    Low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-500', icon: 'check_circle' },
    Medium: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500', icon: 'warning' },
    High: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-500', icon: 'emergency' },
};

function SeverityBadge({ severity }) {
    const s = SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.Medium;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}>
            <span className={`size-2 rounded-full ${s.dot}`} />
            {severity} Risk
        </span>
    );
}

/* ── Confidence ring ─────────────────────────────────────────────── */
function ConfidenceRing({ pct }) {
    const r = 28, circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
    return (
        <svg width={72} height={72} viewBox="0 0 72 72">
            <circle cx={36} cy={36} r={r} fill="none" stroke="#e5e7eb" strokeWidth={8} />
            <circle cx={36} cy={36} r={r} fill="none" stroke={color} strokeWidth={8}
                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                transform="rotate(-90 36 36)"
                style={{ transition: 'stroke-dasharray 1.2s ease' }} />
            <text x={36} y={40} textAnchor="middle" fontSize={13} fill={color} fontWeight={700}>{Math.round(pct)}%</text>
        </svg>
    );
}

/* ── Multi-step loading component ──────────────────────────────────── */
const LOADING_STEPS = [
    { icon: 'cloud_upload', label: 'Uploading Image', sub: 'Sending leaf photo to server…' },
    { icon: 'image_search', label: 'Processing Image', sub: 'Enhancing and normalising the photo…' },
    { icon: 'neurology', label: 'Running AI Analysis', sub: 'Scanning for 18 known crop diseases…' },
    { icon: 'lab_profile', label: 'Generating Report', sub: 'Preparing treatment recommendations…' },
];

function AnalysisLoader({ step }) {
    const pct = Math.round(((step + 1) / LOADING_STEPS.length) * 100);
    return (
        <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-4 flex items-center gap-3">
                <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <div className="size-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
                <div>
                    <p className="text-white font-bold text-sm">Analysing Your Crop</p>
                    <p className="text-white/70 text-xs">Please wait — this takes a few seconds</p>
                </div>
                <span className="ml-auto text-white font-black text-lg">{pct}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                />
            </div>

            {/* Steps list */}
            <div className="p-5 space-y-3">
                {LOADING_STEPS.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    const pending = i > step;
                    return (
                        <div key={i} className={`flex items-center gap-3 transition-all duration-500 ${pending ? 'opacity-30' : 'opacity-100'
                            }`}>
                            {/* Step icon / check */}
                            <div className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${done ? 'bg-emerald-100 text-emerald-600' :
                                    active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' :
                                        'bg-gray-100 text-gray-300'
                                }`}>
                                {done
                                    ? <span className="material-symbols-outlined text-sm">check</span>
                                    : active
                                        ? <div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        : <span className="material-symbols-outlined text-sm">{s.icon}</span>
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold ${done ? 'text-emerald-700 line-through opacity-60' :
                                        active ? 'text-gray-900' : 'text-gray-400'
                                    }`}>{s.label}</p>
                                {active && (
                                    <p className="text-xs text-gray-400 mt-0.5 animate-pulse">{s.sub}</p>
                                )}
                            </div>
                            {done && (
                                <span className="text-xs text-emerald-600 font-semibold flex-shrink-0">Done</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Fun fact footer */}
            <div className="px-5 pb-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5 flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-sm mt-0.5">lightbulb</span>
                    <p className="text-xs text-emerald-700">
                        <span className="font-semibold">Did you know?</span> Crop diseases cause 20–40% yield loss globally.
                        Early detection can save up to 80% of an affected harvest.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════ */
export default function DiseaseDetection() {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const dropZoneRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [cropHint, setCropHint] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [loadingStep, setLoadingStep] = useState(0);
    const [result, setResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    /* ── Drive loading step animation ── */
    useEffect(() => {
        if (!isAnalyzing) { setLoadingStep(0); return; }
        setLoadingStep(0);
        const timers = [
            setTimeout(() => setLoadingStep(1), 800),
            setTimeout(() => setLoadingStep(2), 1800),
            setTimeout(() => setLoadingStep(3), 2800),
        ];
        return () => timers.forEach(clearTimeout);
    }, [isAnalyzing]);

    /* ── Load history on mount ── */
    useEffect(() => {
        getDetectionHistory()
            .then(data => setHistory(data || []))
            .catch(() => { });
    }, [result]); // re-fetch after new scan

    /* ── File picker helper ── */
    const handleFile = useCallback((file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file (JPEG, PNG or WebP).');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be smaller than 10 MB.');
            return;
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
    }, []);

    /* ── Drag-and-drop ── */
    const onDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFile(file);
    }, [handleFile]);

    const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
    const onDragLeave = () => setIsDragOver(false);

    /* ── Analyse ── */
    const handleAnalyze = async () => {
        if (!selectedFile) return;
        setIsAnalyzing(true);
        setResult(null);
        const toastId = toast.loading('Analysing crop image…');
        try {
            const form = new FormData();
            form.append('file', selectedFile);
            if (cropHint.trim()) form.append('crop_hint', cropHint.trim());
            const data = await detectDisease(form);
            setResult(data);
            toast.success('Analysis complete!', { id: toastId });
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Analysis failed. Please try again.', { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    const sev = result ? (SEVERITY_STYLES[result.severity] ?? SEVERITY_STYLES.Medium) : null;

    return (
        <div className="relative min-h-screen bg-gray-50 text-gray-900 font-display">

            {/* ── Squares background ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Squares speed={0.25} squareSize={44} direction="diagonal" borderColor="#d1fae5" hoverFillColor="#f0fdf4" />
            </div>

            {/* ── Header ── */}
            <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-emerald-700 hover:text-emerald-600 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="font-semibold text-sm hidden sm:block">Back to Dashboard</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                            <span className="material-symbols-outlined text-lg">biotech</span>
                        </div>
                        <span className="font-bold text-gray-800">Disease Detection</span>
                    </div>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">history</span>
                        History{history.length > 0 && <span className="ml-1 bg-emerald-600 text-white rounded-full px-1.5">{history.length}</span>}
                    </button>
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* ── Hero headline ── */}
                <div className="text-center">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">AI Crop Disease <span className="text-emerald-600">Detection</span></h1>
                    <p className="mt-2 text-gray-500 text-sm max-w-md mx-auto">
                        Upload a photo of any crop leaf — our AI identifies disease, severity and tailored treatment instantly.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* ══ LEFT: Upload panel ══════════════════════════════ */}
                    <div className="space-y-4">

                        {/* Drop zone */}
                        {!previewUrl ? (
                            <div
                                ref={dropZoneRef}
                                onDrop={onDrop}
                                onDragOver={onDragOver}
                                onDragLeave={onDragLeave}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center gap-4 min-h-[260px] rounded-2xl border-2 border-dashed cursor-pointer transition-all
                                    ${isDragOver
                                        ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                                        : 'border-emerald-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/50'
                                    }`}
                            >
                                <div className="size-20 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                    <span className="material-symbols-outlined text-5xl">add_photo_alternate</span>
                                </div>
                                <div className="text-center px-6">
                                    <p className="font-bold text-gray-700">Drop leaf photo here</p>
                                    <p className="text-xs text-gray-400 mt-1">or click to browse · JPEG PNG WebP · max 10 MB</p>
                                </div>

                                {/* Camera capture button for mobile */}
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-semibold text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-lg">photo_camera</span>
                                    Take Photo
                                </button>

                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                                    onChange={e => handleFile(e.target.files[0])} />
                                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                                    onChange={e => handleFile(e.target.files[0])} />
                            </div>
                        ) : (
                            /* ── Image preview ── */
                            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-md bg-white">
                                <img src={previewUrl} alt="Leaf preview" className="w-full max-h-72 object-cover" />
                                <button
                                    onClick={clearImage}
                                    className="absolute top-3 right-3 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                                <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm font-medium">
                                    {selectedFile?.name}
                                </div>
                            </div>
                        )}

                        {/* Crop hint + Analyze */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Crop Type <span className="text-gray-300 font-normal">(optional)</span>
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-3 flex items-center text-emerald-500">
                                        <span className="material-symbols-outlined text-lg">grass</span>
                                    </span>
                                    <input
                                        type="text"
                                        value={cropHint}
                                        onChange={e => setCropHint(e.target.value)}
                                        placeholder="e.g. wheat, rice, tomato…"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 bg-gray-50 transition-all"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!selectedFile || isAnalyzing}
                                className="group relative w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] active:scale-95"
                            >
                                {/* animated gradient background */}
                                <span className="animate-gradient absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 bg-[length:300%_100%]" />
                                <span className="relative flex items-center gap-2 text-white">
                                    {isAnalyzing
                                        ? <><div className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Analysing…</>
                                        : <><span className="material-symbols-outlined text-lg">biotech</span>Analyse Disease</>
                                    }
                                </span>
                            </button>
                        </div>

                        {/* Tips card */}
                        {!result && !isAnalyzing && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                                <p className="text-xs font-semibold text-emerald-700 mb-2 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm">tips_and_updates</span>
                                    Tips for best results
                                </p>
                                <ul className="text-xs text-emerald-700/80 space-y-1 list-disc list-inside">
                                    <li>Capture the affected leaf clearly in good natural light</li>
                                    <li>Include both healthy and affected parts of the leaf</li>
                                    <li>Avoid blurry or too-dark photos</li>
                                    <li>Specify the crop type for more accurate recommendations</li>
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* ══ RIGHT: Results panel ════════════════════════════ */}
                    <div className="space-y-4">

                        {/* ── Multi-step loading animation ── */}
                        {isAnalyzing && <AnalysisLoader step={loadingStep} />}

                        {/* Empty state */}
                        {!isAnalyzing && !result && (
                            <div className="flex flex-col items-center justify-center gap-3 min-h-[300px] bg-white rounded-2xl border border-dashed border-gray-200 text-gray-400">
                                <span className="material-symbols-outlined text-6xl text-gray-200">science</span>
                                <p className="text-sm font-medium">Results will appear here</p>
                                <p className="text-xs">Upload a leaf image and click Analyse</p>
                            </div>
                        )}

                        {/* ── RESULTS ── */}
                        {result && !isAnalyzing && (
                            <>
                                {/* Disease overview card */}
                                <div className={`rounded-2xl border shadow-sm p-5 ${sev.border} ${sev.bg}`}>
                                    <div className="flex items-start gap-4">
                                        <ConfidenceRing pct={result.confidence} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h2 className="text-lg font-black text-gray-900 truncate">{result.diseaseName}</h2>
                                                <SeverityBadge severity={result.severity} />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Confidence: <span className="font-bold">{result.confidence.toFixed(1)}%</span>
                                                {result.timestamp && <> · {new Date(result.timestamp).toLocaleTimeString()}</>}
                                            </p>
                                            <div className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${sev.text}`}>
                                                <span className="material-symbols-outlined text-sm">{sev.icon}</span>
                                                {result.severity === 'Low' ? 'Crop is healthy or showing minor stress.' :
                                                    result.severity === 'Medium' ? 'Moderate infection — act within 48 hours.' :
                                                        'Severe infection — immediate treatment required.'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Treatment steps */}
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-3">
                                        <span className="size-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                            <span className="material-symbols-outlined text-sm">medical_services</span>
                                        </span>
                                        Treatment Steps
                                    </h3>
                                    <ol className="space-y-2">
                                        {result.treatment.map((step, i) => (
                                            <li key={i} className="flex gap-3 text-sm text-gray-700">
                                                <span className="flex-shrink-0 size-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                                                {step}
                                            </li>
                                        ))}
                                    </ol>
                                </div>

                                {/* Pesticide */}
                                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
                                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-2">
                                        <span className="size-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                                            <span className="material-symbols-outlined text-sm">science</span>
                                        </span>
                                        Recommended Pesticide
                                    </h3>
                                    <p className="text-sm text-gray-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                                        {result.pesticide}
                                    </p>
                                </div>

                                {/* Prevention tips */}
                                <div className="bg-white rounded-2xl border border-green-100 shadow-sm p-5">
                                    <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-3">
                                        <span className="size-6 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                            <span className="material-symbols-outlined text-sm">shield</span>
                                        </span>
                                        Prevention Tips
                                    </h3>
                                    <ul className="space-y-2">
                                        {result.prevention.map((tip, i) => (
                                            <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                                                <span className="material-symbols-outlined text-green-500 text-sm flex-shrink-0 mt-0.5">check_circle</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Leaf image thumbnail */}
                                {previewUrl && (
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                                        <img src={previewUrl} alt="Scanned leaf" className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-700">Scanned Image</p>
                                            <p className="text-xs text-gray-400 truncate max-w-[200px]">{selectedFile?.name}</p>
                                        </div>
                                        <button
                                            onClick={clearImage}
                                            className="ml-auto text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center gap-1"
                                        >
                                            <span className="material-symbols-outlined text-sm">refresh</span>
                                            New Scan
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* ── History drawer ─────────────────────────────────────── */}
                {showHistory && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-base flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600">history</span>
                                Detection History
                            </h3>
                            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined text-lg">close</span>
                            </button>
                        </div>
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <span className="material-symbols-outlined text-4xl text-gray-200 block mb-2">history</span>
                                No previous scans yet.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {history.map(h => {
                                    const hs = SEVERITY_STYLES[h.severity] ?? SEVERITY_STYLES.Medium;
                                    return (
                                        <div key={h.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors">
                                            {h.imageUrl && !h.imageUrl.startsWith('data:') ? (
                                                <img src={h.imageUrl} alt={h.diseaseName} className="w-12 h-12 object-cover rounded-xl border border-gray-100 flex-shrink-0" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-emerald-400">eco</span>
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm text-gray-800 truncate">{h.diseaseName}</p>
                                                <p className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleDateString()} · {h.confidence.toFixed(1)}% confidence</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${hs.bg} ${hs.text} border ${hs.border} flex-shrink-0`}>
                                                {h.severity}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 pb-4">
                    AI results are advisory — always consult a certified agronomist for critical decisions.
                </p>
            </main>
        </div>
    );
}
