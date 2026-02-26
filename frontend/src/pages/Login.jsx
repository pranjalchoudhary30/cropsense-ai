import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, googleAuthLogin } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import Prism from '../components/Prism';
import MagicCard from '../components/MagicCard';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const toastId = toast.loading('Signing in…', { icon: <div className="loader" /> });
        try {
            const data = await loginUser(email, password);
            login(data.access_token, data.user);
            toast.success('Welcome back! 👋', { id: toastId });
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.detail || err.message || 'Login failed. Please try again.';
            toast.error(err.response ? msg : 'Cannot reach server. Is the backend running?', { id: toastId });
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
            toast.error('Google login failed', { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">

            {/* ── Prism OGL full-page background ── */}
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
                    <p className="text-white/70 text-sm font-medium">Signing in…</p>
                </div>
            )}

            {/* ── Login card ── */}
            <MagicCard
                className="relative z-10 max-w-md w-full rounded-2xl shadow-2xl ring-1 ring-white/20"
                gradientColor="rgba(16,185,129,0.10)"
                gradientSize={380}
                style={{ background: 'rgba(10, 15, 20, 0.78)', backdropFilter: 'blur(20px)' }}
            >
                <div className="space-y-8 p-8">
                    <div>
                        <div className="flex justify-center flex-col items-center gap-2">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary">
                                <span className="material-symbols-outlined text-3xl">eco</span>
                            </div>
                            <h2 className="text-center text-3xl font-extrabold text-white">
                                Welcome Back
                            </h2>
                        </div>
                        <p className="mt-2 text-center text-sm text-white/50">
                            Or{' '}
                            <Link to="/register" className="font-medium text-primary hover:text-primary-dark underline underline-offset-2">
                                create a new account
                            </Link>
                        </p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-white/80">Email address</label>
                                <input
                                    name="email" type="email" required
                                    className="mt-1 block w-full px-3 py-2 border border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 sm:text-sm bg-white/10 text-white placeholder-white/40 backdrop-blur-sm"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-white/80">Password</label>
                                <input
                                    name="password" type="password" required
                                    className="mt-1 block w-full px-3 py-2 border border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 sm:text-sm bg-white/10 text-white placeholder-white/40 backdrop-blur-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full flex justify-center py-2.5 px-4 border border-white/30 rounded-lg shadow-sm text-sm font-semibold text-white bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 transition-all backdrop-blur-sm"
                        >
                            {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/20" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 text-white/60 bg-transparent">Or continue with</span>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => toast.error('Google Sign In failed.')}
                                useOneTap
                            />
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <Link to="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                            ← Take me back home
                        </Link>
                    </div>
                </div>
            </MagicCard>
        </div>
    );
};

export default Login;
