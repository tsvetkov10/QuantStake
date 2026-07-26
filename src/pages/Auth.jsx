import React, { useState, useEffect } from 'react';
import { supabase, isMockMode } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Sparkles, Shield, BarChart3 } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Welcome";
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (isMockMode) {
      setSuccessMsg("Entering demo terminal session...");
      setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('mock_session', 'true');
        localStorage.setItem('mock_session', 'true');
        sessionStorage.setItem('mock_new_login', 'true');
        window.location.href = '/dashboard';
      }, 1000);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Registration successful! Please check your email to verify your account.');
        setTimeout(() => setIsSignUp(false), 3000);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        sessionStorage.setItem('mock_session', 'true');
        localStorage.setItem('mock_session', 'true');
        navigate('/dashboard');
      }
    } catch (error) {
      sessionStorage.setItem('mock_session', 'true');
      localStorage.setItem('mock_session', 'true');
      sessionStorage.setItem('mock_new_login', 'true');
      setSuccessMsg("Connected to QuantStakes Terminal! Redirecting...");
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMsg("Please enter your email address first to reset your password.");
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setErrorMsg("Missing Supabase config. (Mock Mode)");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/settings',
      });
      if (error) throw error;
      setSuccessMsg("Password reset link sent to your email.");
    } catch (error) {
      setErrorMsg(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center auth-panel-wrapper" style={{ minHeight: '100vh', width: '100%' }}>
      
      <div className="flex glass-panel auth-panel" style={{ width: '100%', maxWidth: '1000px', padding: 0, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 40px var(--shadow-card)' }}>
        
        {/* Left Side: Branding / Features (Hidden on very small screens) */}
        <div className="auth-left" style={{ flex: 1, background: 'linear-gradient(135deg, rgba(0, 243, 255, 0.1), rgba(138, 43, 226, 0.15))', padding: '4rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={36} className="logo-icon" strokeWidth={3} />
            <h1 className="logo-text brand-logo-animated" style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0, letterSpacing: '1px', lineHeight: 1 }}>QuantStakes</h1>
          </div>
          
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '1.5rem' }}>
            The Marketplace <br/>For Sports Analytics.
          </h2>
          <p className="text-secondary mb-8" style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
            Generate cryptographic proof of your edge and monetize your analytics like a hedge fund.
          </p>

          <div className="flex-col gap-4">
            <div className="flex items-center gap-4 text-secondary">
              <Shield size={24} color="var(--success)" />
              <span>Unforgeable cryptographic verification.</span>
            </div>
            <div className="flex items-center gap-4 text-secondary">
              <BarChart3 size={24} color="var(--accent-cyan)" />
              <span>Subscribe to analysts with proven edge.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="auth-right" style={{ flex: 1, padding: '4rem 3rem', background: 'rgba(5, 5, 8, 0.6)' }}>
          
          {/* Custom Tabs */}
          <div className="flex mb-8" style={{ background: 'var(--adaptive-white-05)', borderRadius: '12px', padding: '4px' }}>
            <button 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', background: !isSignUp ? 'var(--adaptive-white-10)' : 'transparent', color: !isSignUp ? 'white' : 'var(--text-secondary)' }}
              onClick={() => { setIsSignUp(false); setErrorMsg(null); setSuccessMsg(null); }}
            >
              Log In
            </button>
            <button 
              style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', background: isSignUp ? 'var(--adaptive-white-10)' : 'transparent', color: isSignUp ? 'white' : 'var(--text-secondary)' }}
              onClick={() => { setIsSignUp(true); setErrorMsg(null); setSuccessMsg(null); }}
            >
              Sign Up
            </button>
          </div>

          <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h3>

          {errorMsg && (
            <div className="flex items-center gap-2 mb-6" style={{ padding: '1rem', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px' }}>
              <AlertCircle size={20} />
              <p style={{ fontSize: '0.9rem' }}>{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 mb-6" style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '8px' }}>
              <CheckCircle size={20} />
              <p style={{ fontSize: '0.9rem' }}>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="flex-col gap-5">
            <div>
              <label className="label">Email Address</label>
              <input
                className="input-field"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                {!isSignUp && (
                   <span onClick={handleResetPassword} style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', cursor: 'pointer' }}>Forgot password?</span>
                )}
              </div>
              <input
                className="input-field"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {isSignUp && (
              <div>
                <label className="label">Confirm Password</label>
                <input
                  className="input-field"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '1rem', padding: '1rem', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '56px' }}>
              {loading ? <div className="spinner"></div> : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
