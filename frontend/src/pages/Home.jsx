import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AnimatedCounter from '../components/AnimatedCounter';
import { AnimatedThemeToggler } from '../components/AnimatedThemeToggler';

const Home = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

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
                            <a className="text-sm font-medium text-text-sub hover:text-primary transition-colors" href="#">How it Works</a>
                            <a className="text-sm font-medium text-text-sub hover:text-primary transition-colors" href="#">Pricing</a>
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
                                onClick={() => navigate('/login')}
                                className="h-10 rounded-lg bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                            >
                                Login
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
                                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent drop-shadow-sm">Better Profits.</span>
                            </h1>
                            <p className="max-w-xl text-lg text-text-sub">
                                CropSense AI helps farmers optimize harvest timing and market selection with precision agriculture intelligence. Stop guessing, start knowing.
                            </p>
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
                                <AnimatedCounter end="10" suffix="k+" />
                            </span>
                            <span className="text-sm font-medium text-text-sub">Farmers Helped Worldwide</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 text-center sm:items-start sm:text-left sm:border-l sm:border-border-light sm:pl-8">
                            <span className="text-4xl font-black tracking-tight text-primary">
                                <AnimatedCounter end="2.5" suffix="M" />
                            </span>
                            <span className="text-sm font-medium text-text-sub">Acres Monitored Daily</span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-2 text-center sm:items-start sm:text-left sm:border-l sm:border-border-light sm:pl-8">
                            <span className="text-4xl font-black tracking-tight text-primary">
                                <AnimatedCounter end="15" suffix="%" />
                            </span>
                            <span className="text-sm font-medium text-text-sub">Average Profit Increase</span>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="w-full bg-surface-light px-6 py-16 lg:px-12 lg:py-24">
                    <div className="mx-auto flex max-w-7xl flex-col gap-12">
                        <div className="flex flex-col gap-4 text-center sm:text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-text-main sm:text-4xl">Why Choose CropSense?</h2>
                            <p className="max-w-2xl text-lg text-text-sub">Empowering farmers with data-driven insights for sustainable growth and maximum profitability.</p>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                icon="schedule"
                                title="Harvest Timing"
                                description="Know exactly when to harvest for peak quality and quantity using localized weather patterns and historical data."
                            />
                            <FeatureCard
                                icon="monitoring"
                                title="Market Predictions"
                                description="Get AI-driven insights on commodity prices to identify the best time and place to sell your yield."
                            />
                            <FeatureCard
                                icon="potted_plant"
                                title="Yield Analysis"
                                description="Analyze your crop performance history against regional benchmarks to improve future season planning."
                            />
                        </div>
                    </div>
                </section>

                {/* Dashboard Preview */}
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
                            <p className="text-text-sub max-w-xs text-sm leading-relaxed">
                                Helping farmers feed the world through intelligent data analysis and predictive modeling.
                            </p>
                        </div>
                        {/* Links abbreviated for brevity */}
                    </div>
                    <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">© 2024 CropSense AI. All rights reserved.</p>
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

export default Home;
