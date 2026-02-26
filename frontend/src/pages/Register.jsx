import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser, googleAuthLogin } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Stepper, Step } from '../components/Stepper';
import Prism from '../components/Prism';
import MagicCard from '../components/MagicCard';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [farmName, setFarmName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleComplete = async () => {
        if (!name || !email || !password) { toast.error('Please fill in all required fields.'); return; }
        if (password !== confirmPassword) { toast.error("Passwords do not match!"); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
        setIsSubmitting(true);
        const toastId = toast.loading('Creating your account…', { icon: <div className="loader" /> });
        try {
            await registerUser({ name, email, password });
        } catch (err) {
            setIsSubmitting(false);
            const detail = err.response?.data?.detail || 'Registration failed. Please try again.';
            toast.error(err.response ? detail : 'Cannot reach server. Is the backend running?', { id: toastId });
            return;
        }
        try {
            const data = await loginUser(email, password);
            login(data.access_token, data.user);
            toast.success('🌱 Welcome to CropSense AI!', { id: toastId });
            navigate('/dashboard');
        } catch {
            toast.success('Account created! Please sign in.', { id: toastId });
            navigate('/login');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsSubmitting(true);
        const toastId = toast.loading('Signing in with Google…', { icon: <div className="loader" /> });
        try {
            const data = await googleAuthLogin(credentialResponse.credential);
            login(data.access_token, data.user);
            toast.success('Signed in with Google!', { id: toastId });
            navigate('/dashboard');
        } catch {
            toast.error('Google login failed.', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    /* shared input style */
    const inputCls = "w-full pl-10 pr-3 py-2.5 rounded-lg text-sm text-white placeholder-white/30 border border-white/15 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary";
    const inputStyle = { background: 'rgba(255,255,255,0.07)' };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">

            {/* ── Prism full-page background ── */}
            <div className="absolute inset-0 z-0">
                <Prism
                    animationType="rotate"
                    timeScale={0.5}
                    height={3.5}
                    baseWidth={5.5}
                    scale={3.6}
                    hueShift={0}
                    colorFrequency={1}
                    noise={0}
                    glow={1}
                    transparent={false}
                />
            </div>

            {/* ── Loading overlay ── */}
            {isSubmitting && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center"
                    style={{ background: 'rgba(10,15,20,0.75)', backdropFilter: 'blur(6px)' }}>
                    <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-primary animate-spin mb-4" />
                    <p className="text-white/70 text-sm font-medium">Creating your account…</p>
                </div>
            )}

            {/* ── Logo ── */}
            <div className="relative z-10 flex items-center gap-3 mb-6">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/20 text-primary">
                    <span className="material-symbols-outlined text-2xl">eco</span>
                </div>
                <span className="text-2xl font-bold text-white drop-shadow">CropSense AI</span>
            </div>

            {/* ── Card ── */}
            <MagicCard
                className="relative z-10 w-full max-w-md rounded-2xl shadow-2xl ring-1 ring-white/15"
                gradientColor="rgba(16,185,129,0.10)"
                gradientSize={420}
                style={{ background: 'rgba(10, 15, 20, 0.82)', backdropFilter: 'blur(22px)' }}
            >
                <Stepper
                    initialStep={1}
                    onFinalStepCompleted={handleComplete}
                    backButtonText="Back"
                    nextButtonText="Continue"
                >
                    {/* Step 1: Identity */}
                    <Step>
                        <div className="pb-2">
                            <h2 className="text-2xl font-bold text-white mb-1">Let's get started</h2>
                            <p className="text-sm text-white/50 mb-6">Tell us who you are</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">Full Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                                            <span className="material-symbols-outlined text-lg">person</span>
                                        </span>
                                        <input type="text" required className={inputCls} style={inputStyle}
                                            placeholder="John Farmer" value={name} onChange={(e) => setName(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">
                                        Farm Name <span className="text-white/40 font-normal">(optional)</span>
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                                            <span className="material-symbols-outlined text-lg">agriculture</span>
                                        </span>
                                        <input type="text" className={inputCls} style={inputStyle}
                                            placeholder="Green Acres Farm" value={farmName} onChange={(e) => setFarmName(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Step>

                    {/* Step 2: Credentials */}
                    <Step>
                        <div className="pb-2">
                            <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
                            <p className="text-sm text-white/50 mb-6">Set up your email and password</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                                            <span className="material-symbols-outlined text-lg">mail</span>
                                        </span>
                                        <input type="email" required className={inputCls} style={inputStyle}
                                            placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">Password</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                                            <span className="material-symbols-outlined text-lg">lock</span>
                                        </span>
                                        <input type="password" required minLength={6} className={inputCls} style={inputStyle}
                                            placeholder="At least 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-white/80 mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-white/40">
                                            <span className="material-symbols-outlined text-lg">lock_reset</span>
                                        </span>
                                        <input type="password" required className={inputCls} style={inputStyle}
                                            placeholder="Repeat your password" value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)} />
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">error</span>
                                            Passwords don't match
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Step>

                    {/* Step 3: Review */}
                    <Step>
                        <div className="pb-2">
                            <div className="flex justify-center mb-4">
                                <div className="flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1 text-center">Almost done!</h2>
                            <p className="text-sm text-white/50 mb-6 text-center">Review your details and create your account</p>

                            <div className="rounded-xl border border-white/10 p-4 space-y-3 mb-5"
                                style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50 font-medium">Name</span>
                                    <span className="text-white font-semibold">{name || '—'}</span>
                                </div>
                                {farmName && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50 font-medium">Farm</span>
                                        <span className="text-white font-semibold">{farmName}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/50 font-medium">Email</span>
                                    <span className="text-white font-semibold">{email || '—'}</span>
                                </div>
                            </div>

                            {isSubmitting && (
                                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    Creating your account...
                                </div>
                            )}

                            <div className="mt-4">
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-white/10" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2 text-white/40" style={{ background: 'transparent' }}>Or sign up with Google</span>
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => toast.error('Google Sign In failed.')}
                                    />
                                </div>
                            </div>
                        </div>
                    </Step>
                </Stepper>

                <p className="text-center text-sm text-white/40 pb-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">Sign in</Link>
                </p>
            </MagicCard>
        </div>
    );
};

export default Register;
