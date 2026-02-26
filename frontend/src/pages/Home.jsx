import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedCounter from '../components/AnimatedCounter';
import { AnimatedThemeToggler } from '../components/AnimatedThemeToggler';
import { LineShadowText } from '../components/LineShadowText';
import ScrollReveal from '../components/ScrollReveal';
import GlareHover from '../components/GlareHover';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [navLoading, setNavLoading] = useState(false);

    const handleLoginClick = () => {
        setNavLoading(true);
        setTimeout(() => navigate('/login'), 500);
    };

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-border-light bg-surface-light/90 backdrop-blur-md px-6 py-4 lg:px-12">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-2xl">eco</span>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main">CropSense AI</h2>
                    </div>
                    <nav className="hidden md:flex flex-1 justify-end items-center gap-8">
                        <div className="flex items-center gap-6">
                            <a className="text-sm font-medium text-text-sub hover:text-primary transition-colors" href="#">About</a>
                            <a className="text-sm font-medium text-text-sub hover:text-primary transition-colors" href="#how-it-works">How it Works</a>
                            <button
                                onClick={() => navigate('/pricing')}
                                className="text-sm font-medium text-text-sub hover:text-primary transition-colors"
                            >Pricing</button>
                        </div>
                        {user ? (
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="h-10 rounded-lg bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                            >
                                Go to Dashboard
                            </button>
                        ) : (
                            <button
                                onClick={handleLoginClick}
                                disabled={navLoading}
                                className="h-10 rounded-lg bg-primary px-6 text-sm font-bold text-white transition-all hover:bg-primary-dark flex items-center gap-2 min-w-[90px] justify-center disabled:opacity-80"
                            >
                                {navLoading ? (
                                    <><div className="loader" style={{ width: 18, height: 18, borderWidth: 3 }} /> <span>Loading</span></>
                                ) : 'Login'}
                            </button>
                        )}
                        <AnimatedThemeToggler />
                    </nav>
                    {/* Mobile Menu Icon */}
                    <div className="flex md:hidden items-center gap-4">
                        <AnimatedThemeToggler />
                        <button className="text-text-main">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex flex-col items-center">
                {/* Hero Section */}
                <section className="w-full bg-surface-light px-6 py-12 lg:px-12 lg:py-24">
                    <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
                        <div className="flex flex-col gap-6 lg:gap-8">
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                                <span className="relative flex h-2 w-2">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                                </span>
                                Now analyzing 2.5M+ acres
                            </div>
                            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-text-main sm:text-5xl lg:text-6xl">
                                Smarter Harvest.<br />
                                <span
                                    className="bg-clip-text text-transparent drop-shadow-sm"
                                    style={{
                                        backgroundImage: 'linear-gradient(90deg, #10b981, #06b6d4, #3b82f6, #8b5cf6)',
                                        animation: 'hueRotate 6s linear infinite',
                                    }}
                                >Better Profits.</span>
                            </h1>
                            <ScrollReveal
                                baseOpacity={0.05}
                                enableBlur
                                baseRotation={2}
                                blurStrength={5}
                                textClassName="!text-lg !font-normal text-text-sub"
                                containerClassName="!my-0"
                            >
                                CropSense AI helps farmers optimize harvest timing and market selection with precision agriculture intelligence. Stop guessing, start knowing.
                            </ScrollReveal>
                            <div className="flex flex-col gap-4 sm:flex-row">
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className="flex h-12 items-center justify-center rounded-lg bg-gradient-to-r from-primary to-primary-dark px-8 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/40 ring-1 ring-white/20"
                                >
                                    Check Crop Intelligence
                                </button>
                                <button className="flex h-12 items-center justify-center rounded-lg border border-border-light bg-surface-light px-8 text-base font-bold text-text-main transition-colors hover:border-text-sub hover:bg-background-light">
                                    View Demo
                                </button>
                            </div>
                            <div className="flex items-center gap-4 pt-4 text-sm text-text-sub">
                                <div className="flex -space-x-2">
                                    <div className="size-8 rounded-full border-2 border-surface-light bg-background-light" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDKXHMzWwvrCdyzJqjF7NCTO8qARwLf6nok5gxyy_c03vs7FovSBfehHPI3BXtcAIHdoG6gAvK1O-PxyLqMn_3GT7JLeuWZ-PcEO7QIr1tfTI7RwPh3OyEjoIcPhnzNDbcHEh8h-2Lq0zHbfuLD15CKliL7XsZx_LDLMfPXmnjSswk25S03KMdMVZLue4bqnni8on9VVqoWdgvGA8PrBhDId6XZin1fFRBghkjuDERzzd1hwRhIwLp6JsYHGF7km-W06RTELn3QtWI')", backgroundSize: "cover" }}></div>
                                    <div className="size-8 rounded-full border-2 border-surface-light bg-background-light" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnKV9PxHd97hJvfEjOJbR9hQfpkN7N6OdeZRqOkg4xF3AoYO1Toa9rEeCt29okro5k08W-YIw8c_mfuJmUruSy1ApH3SFbiwvl571gz_bOtKm0x2-kMcYyuh1TYo3-ZCN3RJ1gwWVq0QRswe3nRTUmSAHdi75Tq1BFKbxTLtXNQzQpiyvYBfTXIMOnnU_lfu6WGl0vVdcD76BsBNR8ODcwypdJylvmOx8xGQkhzMfZfiiT5KTQ9reMDKgUOXAA36yCbkZjLxQq-us')", backgroundSize: "cover" }}></div>
                                    <div className="size-8 rounded-full border-2 border-surface-light bg-background-light" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDfg1aX9CdyQ9ch4iOwi4PypnLp9NB4-r6ClYYdPt4Vb3I86ASIwJO4g9Vipv-1KwXJdSRWdK8FfUvopGHcbo3N-OrpSfe5RtfLFM15Gt1TTsBtK-4lwZAYiHpQjh7_L3fuTd5bcC-1Oh-PAPVmxt8c4BIzvenbCkujsYEh4W8Wm5HhqqVzNVJdV3bT-UF38rYCRAhzpUtSp0OO-CsTZbrV4PS663A4FpuiKLWUK9a_Uwx4XxwL61FWWMwBYVvTn7GcfynJv13z_Zw')", backgroundSize: "cover" }}></div>
                                </div>
                                <p>Trusted by <strong>10,000+</strong> farmers</p>
                            </div>
                        </div>
                        <div className="relative h-full w-full lg:h-auto">
                            <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-background-light shadow-2xl ring-1 ring-border-light transition-colors duration-300">
                                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC1sb6MNuqCqeRTPP4KaMYolMJK2SSDdF5CCiM3iwZYENfhkWQDBAeXUDgS0jXRx9B4A41GCfKtGidLAvtQAjGOmynQHXaFwe6D7NHA6qmSve_caOZaOqTLLI7UDk9R3dlMHAIlDRtg6NgRowicPJGJinzJ_tcr1ZFQLNg1s2Ya3J_l3sXUMD0_d6K6Jk5d779KyzocHd9SUDJx8IWy8g2lLgTQpG_LDRHRjpRPidEUGESZuXOajT8CdHQRCosv35oVT9_lwR6zQd4')" }}></div>
                            </div>
                            {/* Floating Card Decoration */}
                            <div className="absolute -bottom-6 -left-6 hidden lg:flex max-w-[240px] flex-col rounded-xl bg-surface-light p-4 shadow-xl ring-1 ring-border-light transition-colors duration-300">
                                <div className="flex items-center gap-3 border-b border-border-light pb-3 transition-colors duration-300">
                                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-300">
                                        <span className="material-symbols-outlined text-lg">trending_up</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-text-sub">Yield Prediction</p>
                                        <p className="text-sm font-bold text-text-main">+15% Increase</p>
                                    </div>
                                </div>
                                <div className="pt-3">
                                    <div className="flex justify-between text-xs text-text-sub mb-1">
                                        <span>Accuracy</span>
                                        <span className="font-bold text-primary">98.4%</span>
                                    </div>
                                    <div className="h-1.5 w-full rounded-full bg-gray-100">
                                        <div className="h-1.5 w-[98%] rounded-full bg-primary"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="w-full border-y border-border-light bg-background-light px-6 py-12 lg:px-12">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-3">
                        <div className="flex flex-col items-center justify-center gap-2 text-center sm:items-start sm:text-left">
                            <span className="text-4xl font-black tracking-tight text-primary">
                                <AnimatedCounter end="10" suffix="k+" delay={3100} />
                            </span>
                            <span className="text-sm font-medium text-text-sub">Farmers Helped Worldwide</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 text-center sm:items-start sm:text-left sm:border-l sm:border-border-light sm:pl-8">
                            <span className="text-4xl font-black tracking-tight text-primary">
                                <AnimatedCounter end="2.5" suffix="M" delay={3100} />
                            </span>
                            <span className="text-sm font-medium text-text-sub">Acres Monitored Daily</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 text-center sm:items-start sm:text-left sm:border-l sm:border-border-light sm:pl-8">
                            <span className="text-4xl font-black tracking-tight text-primary">
                                <AnimatedCounter end="15" suffix="%" delay={3100} />
                            </span>
                            <span className="text-sm font-medium text-text-sub">Average Profit Increase</span>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="w-full bg-surface-light px-6 py-16 lg:px-12 lg:py-24">
                    <div className="mx-auto flex max-w-7xl flex-col gap-12">
                        <div className="flex flex-col gap-4 text-center sm:text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">
                                Why Choose <LineShadowText shadowColor="black" className="italic font-black">CropSense</LineShadowText>?
                            </h2>
                            <p className="max-w-2xl text-lg text-text-sub">Empowering farmers with data-driven insights for sustainable growth and maximum profitability.</p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <GlareHover glareColor="#10b981" glareOpacity={0.2} glareAngle={-30} glareSize={300} transitionDuration={750} borderRadius="12px">
                                <FeatureCard icon="schedule" title="Harvest Timing" description="Know exactly when to harvest for peak quality and quantity using localized weather patterns and historical data." />
                            </GlareHover>
                            <GlareHover glareColor="#10b981" glareOpacity={0.2} glareAngle={-30} glareSize={300} transitionDuration={750} borderRadius="12px">
                                <FeatureCard icon="monitoring" title="Market Predictions" description="Get AI-driven insights on commodity prices to identify the best time and place to sell your yield." />
                            </GlareHover>
                            <GlareHover glareColor="#10b981" glareOpacity={0.2} glareAngle={-30} glareSize={300} transitionDuration={750} borderRadius="12px">
                                <FeatureCard icon="potted_plant" title="Yield Analysis" description="Analyze your crop performance history against regional benchmarks to improve future season planning." />
                            </GlareHover>
                        </div>
                    </div>
                </section>

                {/* ── How It Works ── */}
                <section id="how-it-works" className="w-full bg-background-light px-6 py-16 lg:px-12 lg:py-24">
                    <div className="mx-auto max-w-7xl flex flex-col gap-12">
                        <div className="text-center flex flex-col gap-3">
                            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Simple Process</span>
                            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">How CropSense Works</h2>
                            <ScrollReveal
                                baseOpacity={0.08}
                                enableBlur
                                baseRotation={4}
                                blurStrength={6}
                                textClassName="!text-lg !font-normal text-text-sub"
                                containerClassName="!my-0 max-w-2xl mx-auto"
                            >
                                From sign up to your first AI-powered harvest decision in under 5 minutes.
                            </ScrollReveal>
                        </div>
                        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Connecting line (desktop only) */}
                            <div className="absolute top-8 left-[12.5%] right-[12.5%] hidden lg:block h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
                            <StepCard step={1} icon="person_add" title="Create Account" desc="Sign up free in 30 seconds. No credit card required." />
                            <StepCard step={2} icon="agriculture" title="Add Your Farm" desc="Enter your location, crop type, and acreage details." />
                            <StepCard step={3} icon="satellite_alt" title="AI Scans Your Land" desc="Satellite + weather data is analysed in real-time by our models." />
                            <StepCard step={4} icon="price_check" title="Get Smart Insights" desc="Receive harvest timing, market price alerts, and yield forecasts." />
                        </div>
                    </div>
                </section>

                {/* ── Testimonials ── */}
                <section className="w-full bg-surface-light px-6 py-16 lg:px-12 lg:py-24">
                    <div className="mx-auto max-w-7xl flex flex-col gap-12">
                        <div className="text-center flex flex-col gap-3">
                            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Farmer Stories</span>
                            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Trusted by Farmers Like You</h2>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <TestimonialCard
                                name="Rajesh Kumar" location="Punjab, India" stars={5}
                                quote="CropSense told me to wait 8 more days before harvesting. I did — and got 18% more yield than my neighbours who harvested early."
                                avatar="RK" color="#10b981"
                            />
                            <TestimonialCard
                                name="Maria Santos" location="São Paulo, Brazil" stars={5}
                                quote="The Mandi price predictions are uncanny. I've been consistently selling at the right time. My profits are up ₹40,000 this season."
                                avatar="MS" color="#3b82f6"
                            />
                            <TestimonialCard
                                name="James Okafor" location="Kano, Nigeria" stars={5}
                                quote="I was sceptical at first. After 3 months I'm a full convert. The spoilage risk alerts alone saved me an entire truck of tomatoes."
                                avatar="JO" color="#8b5cf6"
                            />
                        </div>
                    </div>
                </section>

                {/* ── FAQ ── */}
                <section className="w-full bg-background-light px-6 py-16 lg:px-12 lg:py-24">
                    <div className="mx-auto max-w-3xl flex flex-col gap-10">
                        <div className="text-center flex flex-col gap-3">
                            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Got Questions?</span>
                            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Frequently Asked Questions</h2>
                        </div>
                        <div className="flex flex-col gap-3">
                            <FAQItem q="Is CropSense AI free to use?" a="Yes — our core features including harvest timing and basic market alerts are completely free. Premium features like satellite scans and advanced Mandi predictions are available on our Pro plan." />
                            <FAQItem q="What crops does CropSense support?" a="We currently support 40+ crops including wheat, rice, maize, cotton, tomatoes, soybeans, and most common fruits and vegetables. New crops are added monthly." />
                            <FAQItem q="How accurate are the price predictions?" a="Our market price model achieves ~91% directional accuracy over a 7-day window, trained on 5+ years of historical mandi data and real-time macro signals." />
                            <FAQItem q="Do I need any special hardware or sensors?" a="No hardware needed! CropSense uses freely available satellite imagery, weather APIs, and your farm's GPS location to generate all insights." />
                            <FAQItem q="Is my farm data private and secure?" a="Absolutely. Your data is encrypted at rest and in transit. We never sell your data to third parties. You own your data and can delete it at any time." />
                        </div>
                    </div>
                </section>



                {/* ── Pricing Section ── */}
                <section id="pricing" className="w-full bg-surface-light px-6 py-16 lg:px-12 lg:py-24">
                    <div className="mx-auto max-w-7xl flex flex-col gap-12">
                        <div className="text-center flex flex-col gap-3">
                            <span className="text-sm font-semibold uppercase tracking-widest text-primary">Plans & Pricing</span>
                            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Simple, honest pricing</h2>
                            <p className="max-w-xl mx-auto text-lg text-text-sub">Start free. Upgrade when you need more. No surprises, no lock-in.</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3 items-start">
                            {/* Starter */}
                            <div className="rounded-2xl border border-border-light bg-background-light p-6 flex flex-col gap-4">
                                <div className="h-1 rounded-full bg-gradient-to-r from-slate-300 to-slate-400 -mx-6 -mt-6 mb-2" />
                                <div>
                                    <h3 className="text-lg font-black text-text-main">Starter</h3>
                                    <p className="text-sm text-text-sub mt-1">Free forever. Great for trying CropSense.</p>
                                </div>
                                <div className="text-3xl font-black text-text-main">Free</div>
                                <ul className="flex flex-col gap-2 text-sm text-text-sub">
                                    {['5 AI analyses/month', 'Basic price charts', '3-day weather forecast', '1 crop tracking'].map(f => (
                                        <li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">check_circle</span>{f}</li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate('/login')} className="mt-auto w-full py-2.5 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all">Get Started Free</button>
                            </div>

                            {/* Pro — highlighted */}
                            <div className="rounded-2xl border-2 border-primary bg-surface-light p-6 flex flex-col gap-4 shadow-xl shadow-primary/10 ring-2 ring-primary ring-offset-2 relative">
                                <div className="h-1 rounded-full bg-gradient-to-r from-primary to-accent -mx-6 -mt-6 mb-2" />
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
                                <div>
                                    <h3 className="text-lg font-black text-primary">Pro</h3>
                                    <p className="text-sm text-text-sub mt-1">Everything a serious farmer needs.</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-black text-text-main">₹499</span>
                                    <span className="text-text-sub text-sm mb-1">/month</span>
                                </div>
                                <ul className="flex flex-col gap-2 text-sm text-text-sub">
                                    {['Unlimited AI analyses', '14-day price predictions', 'Real-time Mandi alerts', 'Spoilage risk detection', 'Up to 8 crops'].map(f => (
                                        <li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-primary text-base">check_circle</span>{f}</li>
                                    ))}
                                </ul>
                                <button onClick={() => navigate(user ? '/pricing' : '/login')} className="mt-auto w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm shadow-lg shadow-primary/30 hover:scale-[1.02] transition-all">Start 14-day Free Trial</button>
                            </div>

                            {/* Enterprise */}
                            <div className="rounded-2xl border border-border-light bg-background-light p-6 flex flex-col gap-4">
                                <div className="h-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 -mx-6 -mt-6 mb-2" />
                                <div>
                                    <h3 className="text-lg font-black text-text-main">Enterprise</h3>
                                    <p className="text-sm text-text-sub mt-1">For large farms and agri-businesses.</p>
                                </div>
                                <div className="flex items-end gap-1">
                                    <span className="text-3xl font-black text-text-main">₹1,499</span>
                                    <span className="text-text-sub text-sm mb-1">/month</span>
                                </div>
                                <ul className="flex flex-col gap-2 text-sm text-text-sub">
                                    {['Everything in Pro', 'Daily satellite scans', '30-day forecasts', 'Unlimited crops', 'Priority support + manager'].map(f => (
                                        <li key={f} className="flex items-center gap-2"><span className="material-symbols-outlined text-purple-500 text-base">check_circle</span>{f}</li>
                                    ))}
                                </ul>
                                <button className="mt-auto w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm hover:scale-[1.02] hover:shadow-lg transition-all">Contact Sales</button>
                            </div>
                        </div>

                        <div className="text-center">
                            <button onClick={() => navigate(user ? '/pricing' : '/login')}
                                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                                View full plan comparison
                                <span className="material-symbols-outlined text-base">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full bg-background-light px-6 py-16 lg:px-12 lg:py-24">
                    <div className="mx-auto flex max-w-7xl flex-col gap-12 lg:flex-row lg:items-center">
                        <div className="flex flex-1 flex-col gap-6">
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <span className="material-symbols-outlined">analytics</span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Real-time data at your fingertips</h2>
                            <p className="text-lg text-text-sub">Our dashboard simplifies complex data. View soil moisture, satellite imagery analysis, and market trends all in one place.</p>
                            <ul className="flex flex-col gap-3">
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                    <span className="text-text-main font-medium">Daily satellite health scans</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                    <span className="text-text-main font-medium">Soil moisture alerts</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary">check_circle</span>
                                    <span className="text-text-main font-medium">Hyper-local weather forecasts</span>
                                </li>
                            </ul>
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="mt-4 w-fit rounded-lg border-2 border-primary bg-transparent px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                            >
                                Explore Features
                            </button>
                        </div>
                        <div className="relative flex-1">
                            <div className="overflow-hidden rounded-xl bg-surface-light shadow-xl ring-1 ring-border-light">
                                <img alt="Dashboard displaying agricultural charts and data analytics" className="w-full h-auto object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwa6XlKf7uFl7CuGeUg9hnxwsf-OKez6JPQTgb8vEFNk188I1oA7yrQYyrULM1UtlayrQZihgY0Uhw6xGZnKyT0HhKwrasGdnuCgSqdVo7YGBPvlZdRkXwxxLYyK8Nah5vVSYRd2EVw1l-hdvRqgf6d3_9okALDYOTaQDJ9M0LZ6n2Knkruio8VAZb1n8rsYQSq8HzIPS0LT1CoNlXn2YB4wJikVd1CAMJS4FNb4oTh9woMmsUtg9Wg2q26WK9Bo-oEeGf7MiXUKM" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="w-full bg-surface-light px-6 py-16 lg:px-12 lg:py-24">
                    <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary-dark via-primary to-accent text-white shadow-2xl ring-1 ring-white/10 relative">
                        {/* Decorative glow elements */}
                        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-light/30 blur-[100px]"></div>
                        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-accent/30 blur-[100px]"></div>

                        <div className="relative flex flex-col items-center gap-6 px-6 py-16 text-center md:px-12 md:py-20 z-10">
                            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl drop-shadow-md">Ready to optimize your harvest?</h2>
                            <p className="max-w-2xl text-lg text-white/90 font-medium">Join thousands of farmers making smarter decisions today with CropSense AI. Start your free trial now.</p>
                            <div className="relative z-10 mt-4 flex w-full flex-col justify-center gap-4 sm:flex-row">
                                <button
                                    onClick={() => navigate(user ? '/dashboard' : '/login')}
                                    className="rounded-lg bg-white px-8 py-3.5 text-base font-bold text-primary shadow-lg transition-transform hover:scale-105"
                                >
                                    {user ? 'Go to Dashboard' : 'Get Started Now'}
                                </button>
                                <button className="rounded-lg border border-white/30 bg-primary-dark/20 px-8 py-3.5 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/10">
                                    Contact Sales
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full bg-surface-light border-t border-border-light pt-16 pb-8 px-6 lg:px-12">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                        <div className="col-span-2 lg:col-span-2 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-text-main">
                                <span className="material-symbols-outlined text-primary text-3xl">eco</span>
                                <span className="text-xl font-bold">CropSense AI</span>
                            </div>
                            <p className="text-text-sub max-w-xs text-sm leading-relaxed">Helping farmers feed the world through intelligent data analysis and predictive modeling.</p>
                            <ul className="example-2 mt-2">
                                <li className="icon-content">
                                    <a data-social="linkedin" aria-label="LinkedIn" href="https://linkedin.com/">
                                        <div className="filled"></div>
                                        <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z" /></svg>
                                    </a>
                                    <div className="tooltip">LinkedIn</div>
                                </li>
                                <li className="icon-content">
                                    <a data-social="github" aria-label="GitHub" href="https://github.com/">
                                        <div className="filled"></div>
                                        <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" /></svg>
                                    </a>
                                    <div className="tooltip">GitHub</div>
                                </li>
                                <li className="icon-content">
                                    <a data-social="instagram" aria-label="Instagram" href="https://instagram.com/">
                                        <div className="filled"></div>
                                        <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.9 3.9 0 0 0-1.417.923A3.9 3.9 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.9 3.9 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.9 3.9 0 0 0-.923-1.417A3.9 3.9 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599s.453.546.598.92c.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.5 2.5 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.5 2.5 0 0 1-.92-.598 2.5 2.5 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233s.008-2.388.046-3.231c.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92s.546-.453.92-.598c.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92m-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217m0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334" /></svg>
                                    </a>
                                    <div className="tooltip">Instagram</div>
                                </li>
                                <li className="icon-content">
                                    <a data-social="youtube" aria-label="Youtube" href="https://youtube.com/">
                                        <div className="filled"></div>
                                        <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z" /></svg>
                                    </a>
                                    <div className="tooltip">Youtube</div>
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-sm font-bold text-text-main mb-1">Product</p>
                            {['Features', 'Pricing', 'Changelog', 'Roadmap'].map(l => <a key={l} href="#" className="text-sm text-text-sub hover:text-primary transition-colors">{l}</a>)}
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-sm font-bold text-text-main mb-1">Company</p>
                            {['About Us', 'Blog', 'Careers', 'Press Kit'].map(l => <a key={l} href="#" className="text-sm text-text-sub hover:text-primary transition-colors">{l}</a>)}
                        </div>
                        <div className="flex flex-col gap-3">
                            <p className="text-sm font-bold text-text-main mb-1">Support</p>
                            {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(l => <a key={l} href="#" className="text-sm text-text-sub hover:text-primary transition-colors">{l}</a>)}
                        </div>
                    </div>
                    <div className="border-t border-border-light pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">© 2024 CropSense AI. All rights reserved.</p>
                        <p className="text-xs text-gray-400">Made with ❤️ for farmers worldwide 🌾</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <div className="group flex flex-col rounded-xl border border-border-light bg-surface-light p-6 transition-all hover:border-primary/50 hover:shadow-lg duration-300">
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <h3 className="mb-2 text-xl font-bold text-text-main">{title}</h3>
        <p className="text-text-sub">{description}</p>
    </div>
);

const StepCard = ({ step, icon, title, desc }) => (
    <div className="relative flex flex-col items-center text-center gap-4 p-6">
        <div className="relative z-10 flex size-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div className="absolute top-8 left-0 z-0 flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-black -translate-x-1 -translate-y-2 lg:hidden">{step}</div>
        <h3 className="text-lg font-bold text-text-main">{title}</h3>
        <p className="text-sm text-text-sub leading-relaxed">{desc}</p>
    </div>
);

const TestimonialCard = ({ name, location, stars, quote, avatar, color }) => (
    <div className="flex flex-col gap-4 rounded-xl border border-border-light bg-surface-light p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
        <div className="flex gap-1">
            {Array.from({ length: stars }).map((_, i) => (
                <svg key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            ))}
        </div>
        <p className="text-text-sub text-sm leading-relaxed italic">"{quote}"</p>
        <div className="flex items-center gap-3 mt-auto pt-2 border-t border-border-light">
            <div className="flex size-9 items-center justify-center rounded-full text-white text-sm font-bold" style={{ background: color }}>{avatar}</div>
            <div>
                <p className="text-sm font-bold text-text-main">{name}</p>
                <p className="text-xs text-text-sub">{location}</p>
            </div>
        </div>
    </div>
);

const FAQItem = ({ q, a }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-xl border border-border-light bg-surface-light overflow-hidden transition-all duration-200">
            <button
                className="w-full flex items-center justify-between px-6 py-4 text-left text-text-main font-semibold hover:bg-primary/5 transition-colors"
                onClick={() => setOpen(o => !o)}
            >
                <span>{q}</span>
                <span className="material-symbols-outlined text-primary transition-transform duration-200" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>expand_more</span>
            </button>
            {open && (
                <div className="px-6 pb-5 text-sm text-text-sub leading-relaxed border-t border-border-light pt-3">{a}</div>
            )}
        </div>
    );
};

export default Home;
