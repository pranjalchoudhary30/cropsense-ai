import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';
import Market from './pages/Market';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPredictor from './pages/YieldPredictor';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingScreen from './components/LoadingScreen';

/* Re-mounts the animated wrapper on every route change */
function SlideWrapper({ children }) {
  return <div className="page-slide-in">{children}</div>;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <SlideWrapper key={location.pathname}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/market" element={<Market />} />
          <Route path="/disease" element={<DiseaseDetection />} />
          <Route path="/yield" element={<YieldPredictor />} />
        </Route>
      </Routes>
    </SlideWrapper>
  );
}

// In a real application, place this in a .env file
const GOOGLE_CLIENT_ID = "114147734011-6qr6us92h398e65qkgs5amrh28fph772.apps.googleusercontent.com";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Remove from DOM after CSS fade-out completes (2.6s delay + 0.4s fade = 3s)
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <LanguageProvider>
          {loading && <LoadingScreen />}
          <Toaster position="top-right" />
          <Router>
            <AnimatedRoutes />
          </Router>
        </LanguageProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
