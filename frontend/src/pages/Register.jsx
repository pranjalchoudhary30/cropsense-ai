import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, loginUser, googleAuthLogin } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { Stepper, Step } from '../components/Stepper';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [farmName, setFarmName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stepError, setStepError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleComplete = async () => {
        if (!name || !email || !password) {
            toast.error('Please fill in all required fields.');
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters.');
            return;
        }

        setIsSubmitting(true);
        try {
            // Step 1: Register the new user
            await registerUser({ name, email, password });
        } catch (err) {
            setIsSubmitting(false);
            if (!err.response) {
                toast.error('Cannot reach server. Is the backend running?');
            } else {
                const detail = err.response?.data?.detail || 'Registration failed. Please try again.';
                toast.error(detail);
            }
            return; // stop here — don't try to login
        }

        try {
            // Step 2: Auto-login with the new credentials
            const data = await loginUser(email, password);
            login(data.access_token, data.user);
            toast.success('🌱 Welcome to CropSense AI!');
            navigate('/dashboard');
        } catch (err) {
            // Registration succeeded but auto-login failed — redirect to login page
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsSubmitting(true);
        try {
            const data = await googleAuthLogin(credentialResponse.credential);
            login(data.access_token, data.user);
            toast.success('Successfully signed in with Google!');
            navigate('/dashboard');
        } catch (err) {
            toast.error('Google login failed. Your email may not be authorised.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background-light px-4">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
                <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <span className="material-symbols-outlined text-2xl">eco</span>
                </div>
                <span className="text-2xl font-bold text-text-main">CropSense AI</span>
            </div>

            <div className="w-full max-w-md">
                <Stepper
                    initialStep={1}
                    onFinalStepCompleted={handleComplete}
                    backButtonText="Back"
                    nextButtonText="Continue"
                >
                    {/* Step 1: Your Identity */}
                    <Step>
                        <div className="pb-2">
                            <h2 className="text-2xl font-bold text-text-main mb-1">Let's get started</h2>
                            <p className="text-sm text-text-sub mb-6">Tell us who you are</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-1">Full Name</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-sub">
                                            <span className="material-symbols-outlined text-lg">person</span>
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-3 py-2.5 border border-border-light rounded-lg bg-background-light text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                                            placeholder="John Farmer"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-1">Farm Name <span className="text-text-sub font-normal">(optional)</span></label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-sub">
                                            <span className="material-symbols-outlined text-lg">agriculture</span>
                                        </span>
                                        <input
                                            type="text"
                                            className="w-full pl-10 pr-3 py-2.5 border border-border-light rounded-lg bg-background-light text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                                            placeholder="Green Acres Farm"
                                            value={farmName}
                                            onChange={(e) => setFarmName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Step>

                    {/* Step 2: Account Credentials */}
                    <Step>
                        <div className="pb-2">
                            <h2 className="text-2xl font-bold text-text-main mb-1">Create your account</h2>
                            <p className="text-sm text-text-sub mb-6">Set up your email and password</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-1">Email Address</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-sub">
                                            <span className="material-symbols-outlined text-lg">mail</span>
                                        </span>
                                        <input
                                            type="email"
                                            required
                                            className="w-full pl-10 pr-3 py-2.5 border border-border-light rounded-lg bg-background-light text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-1">Password</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-sub">
                                            <span className="material-symbols-outlined text-lg">lock</span>
                                        </span>
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="w-full pl-10 pr-3 py-2.5 border border-border-light rounded-lg bg-background-light text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                                            placeholder="At least 6 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main mb-1">Confirm Password</label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-sub">
                                            <span className="material-symbols-outlined text-lg">lock_reset</span>
                                        </span>
                                        <input
                                            type="password"
                                            required
                                            className="w-full pl-10 pr-3 py-2.5 border border-border-light rounded-lg bg-background-light text-text-main focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                                            placeholder="Repeat your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                    {confirmPassword && password !== confirmPassword && (
                                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">error</span>
                                            Passwords don't match
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Step>

                    {/* Step 3: Review & Confirm */}
                    <Step>
                        <div className="pb-2">
                            <div className="flex justify-center mb-4">
                                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-text-main mb-1 text-center">Almost done!</h2>
                            <p className="text-sm text-text-sub mb-6 text-center">Review your details and create your account</p>

                            <div className="rounded-xl bg-background-light border border-border-light p-4 space-y-3 mb-5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-sub font-medium">Name</span>
                                    <span className="text-text-main font-semibold">{name || '—'}</span>
                                </div>
                                {farmName && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-sub font-medium">Farm</span>
                                        <span className="text-text-main font-semibold">{farmName}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-sub font-medium">Email</span>
                                    <span className="text-text-main font-semibold">{email || '—'}</span>
                                </div>
                            </div>

                            {isSubmitting && (
                                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    Creating your account...
                                </div>
                            )}

                            {/* Google Sign Up alternative */}
                            <div className="mt-4">
                                <div className="relative my-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border-light" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="px-2 bg-surface-light text-text-sub">Or sign up with Google</span>
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

                <p className="text-center text-sm text-text-sub mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
