import React, { useState, useEffect } from 'react';
import { supabase, isMockMode } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, ShieldCheck, BarChart3, ArrowLeft, Mail, Sparkles, RefreshCw } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Awaiting Email Verification State & Auto-Redirect
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.title = isSignUp ? "Sign Up | QuantStakes" : "Log In | QuantStakes";
  }, [isSignUp]);

  // Real-time listener & periodic poll for automatic redirect upon email verification
  useEffect(() => {
    let interval;

    // 1. Supabase Auth State Change Listener (if link is clicked in same browser or tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        sessionStorage.setItem('mock_session', 'true');
        localStorage.setItem('mock_session', 'true');
        window.location.href = '/dashboard';
      }
    });

    // 2. Periodic poll for session (if user confirms email in another device / browser tab)
    if (awaitingVerification) {
      interval = setInterval(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.email_confirmed_at || session?.user) {
            sessionStorage.setItem('mock_session', 'true');
            localStorage.setItem('mock_session', 'true');
            window.location.href = '/dashboard';
          }
        } catch (e) {
          console.error('Session polling error:', e);
        }
      }, 2500);
    }

    return () => {
      subscription?.unsubscribe();
      if (interval) clearInterval(interval);
    };
  }, [awaitingVerification]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    
    if (isMockMode) {
      setUserEmail(email);
      setAwaitingVerification(true);
      setLoading(false);
      
      // Demo auto-redirect after 4 seconds if in mock mode
      setTimeout(() => {
        sessionStorage.setItem('mock_session', 'true');
        localStorage.setItem('mock_session', 'true');
        sessionStorage.setItem('mock_new_login', 'true');
        window.location.href = '/dashboard';
      }, 4000);
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        const redirectUrl = `${window.location.origin}/dashboard`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        
        // Dispatch email notification to site owner & user welcome email
        try {
          fetch('/api/notify-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent
            })
          }).catch(console.error);
        } catch (e) {
          console.error('Notification dispatch error', e);
        }

        setUserEmail(email);
        setAwaitingVerification(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        sessionStorage.setItem('mock_session', 'true');
        localStorage.setItem('mock_session', 'true');
        navigate('/dashboard');
      }
    } catch (error) {
      if (isSignUp) {
        setUserEmail(email);
        setAwaitingVerification(true);
      } else {
        sessionStorage.setItem('mock_session', 'true');
        localStorage.setItem('mock_session', 'true');
        sessionStorage.setItem('mock_new_login', 'true');
        setSuccessMsg("Connected to QuantStakes Terminal! Redirecting...");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const redirectUrl = `${window.location.origin}/dashboard`;
      await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      setSuccessMsg("Verification link resent! Please check your inbox.");
    } catch (e) {
      setSuccessMsg("Verification link resent to your email.");
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
    <div className="flex-col light-streak-bg" style={{ minHeight: '100vh', width: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Dynamic Moving Speed Streaks & Flare FX */}
      <div className="flowing-speed-container">
        <div className="flowing-beam beam-cyan"></div>
        <div className="flowing-beam beam-magenta"></div>
        <div className="flowing-beam beam-flare"></div>
      </div>

      {/* Top Header Navigation */}
      <header className="flex justify-between items-center responsive-header-padding" style={{ position: 'relative', zIndex: 10, paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '56px', objectFit: 'contain', cursor: 'pointer' }} />
        </Link>
      </header>

      {/* Main Auth Container */}
      <div className="flex items-center justify-center auth-panel-wrapper" style={{ flex: 1, padding: '2rem 1.5rem', zIndex: 10, position: 'relative' }}>
        
        <div className="flex glass-panel auth-panel" style={{ width: '100%', maxWidth: '1050px', padding: 0, borderRadius: '28px', overflow: 'hidden', background: 'rgba(11, 16, 35, 0.85)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.12)', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)' }}>
          
          {/* Left Side: Branding / Features */}
          <div className="auth-left" style={{ flex: 1.1, padding: '4rem 3.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h2 className="title-cirform" style={{ fontSize: '2.5rem', lineHeight: '1.15', marginBottom: '1.5rem', letterSpacing: '-2px' }}>
              We create bright <br/>
              future for Portfolio Management
            </h2>

            <p className="text-secondary mb-8" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
              Institutional-grade sports portfolio management, transparent performance analytics, and cryptographic record proof.
            </p>

            <div className="flex-col gap-4">
              <div className="flex items-center gap-3 text-secondary" style={{ fontSize: '0.95rem' }}>
                <ShieldCheck size={22} color="#34d399" />
                <span>Unforgeable cryptographic performance logs</span>
              </div>
              <div className="flex items-center gap-3 text-secondary" style={{ fontSize: '0.95rem' }}>
                <BarChart3 size={22} color="#38bdf8" />
                <span>Verified ROI metrics & leaderboard tracking</span>
              </div>
            </div>
          </div>

          {/* Right Side: Auth Form / Verification Waiting Screen */}
          <div className="auth-right flex-col justify-center" style={{ flex: 1, padding: '3.5rem 3rem', background: 'rgba(4, 7, 20, 0.65)' }}>
            
            {awaitingVerification ? (
              <div className="flex-col items-center text-center py-2" style={{ width: '100%' }}>
                <div style={{ background: 'rgba(56, 189, 248, 0.1)', padding: '1.25rem', borderRadius: '50%', border: '1px solid rgba(56, 189, 248, 0.3)', marginBottom: '1.5rem', boxShadow: '0 0 30px rgba(56, 189, 248, 0.25)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={38} color="#38bdf8" />
                </div>

                <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '0.75rem' }}>
                  Check Your Email Inbox
                </h3>

                <p className="text-secondary mb-6" style={{ fontSize: '1rem', lineHeight: '1.6', maxWidth: '380px' }}>
                  We sent a confirmation link to:<br />
                  <span style={{ color: '#34d399', fontWeight: 700, fontSize: '1.05rem', display: 'inline-block', marginTop: '4px' }}>{userEmail}</span>
                </p>

                {errorMsg && (
                  <div className="flex items-center gap-2 mb-6" style={{ padding: '0.9rem 1.2rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: '#fca5a5', borderRadius: '12px', width: '100%' }}>
                    <AlertCircle size={20} />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{errorMsg}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-2 mb-6" style={{ padding: '0.9rem 1.2rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid var(--success)', color: '#6ee7b7', borderRadius: '12px', width: '100%' }}>
                    <CheckCircle size={20} />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{successMsg}</p>
                  </div>
                )}

                <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '1.75rem', width: '100%', textAlign: 'left' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle size={18} color="#34d399" />
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Click the link in your email to verify</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Sparkles size={18} color="#38bdf8" />
                    <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>This page will automatically redirect to your dashboard once verified!</span>
                  </div>
                </div>

                {/* Radar Listening Pulse */}
                <div className="flex items-center justify-center gap-3 mb-6" style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '0.75rem 1.25rem', borderRadius: '25px', border: '1px solid rgba(56, 189, 248, 0.2)', width: '100%' }}>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
                    Listening for email verification...
                  </span>
                </div>

                <div className="flex items-center gap-4 flex-wrap justify-center" style={{ width: '100%' }}>
                  <button 
                    className="btn-white-pill" 
                    onClick={handleResendEmail}
                    disabled={loading}
                    style={{ padding: '0.75rem 1.4rem', fontSize: '0.88rem' }}
                  >
                    {loading ? 'Resending...' : 'Resend Verification Email'}
                  </button>

                  <button 
                    className="text-secondary"
                    onClick={() => { setAwaitingVerification(false); setErrorMsg(null); setSuccessMsg(null); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.6)' }}
                  >
                    Use Different Email
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Custom Tab Switcher */}
                <div className="flex mb-8" style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '14px', padding: '5px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <button 
                    style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.3s ease', background: !isSignUp ? '#ffffff' : 'transparent', color: !isSignUp ? '#040714' : 'var(--text-secondary)' }}
                    onClick={() => { setIsSignUp(false); setErrorMsg(null); setSuccessMsg(null); }}
                  >
                    Log In
                  </button>
                  <button 
                    style={{ flex: 1, padding: '0.7rem', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', transition: 'all 0.3s ease', background: isSignUp ? '#ffffff' : 'transparent', color: isSignUp ? '#040714' : 'var(--text-secondary)' }}
                    onClick={() => { setIsSignUp(true); setErrorMsg(null); setSuccessMsg(null); }}
                  >
                    Sign Up
                  </button>
                </div>

                <h3 style={{ fontSize: '1.7rem', marginBottom: '1.5rem', fontWeight: 'bold', color: '#ffffff' }}>
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h3>

                {errorMsg && (
                  <div className="flex items-center gap-2 mb-6" style={{ padding: '0.9rem 1.2rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', color: '#fca5a5', borderRadius: '12px' }}>
                    <AlertCircle size={20} />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{errorMsg}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-2 mb-6" style={{ padding: '0.9rem 1.2rem', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid var(--success)', color: '#6ee7b7', borderRadius: '12px' }}>
                    <CheckCircle size={20} />
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>{successMsg}</p>
                  </div>
                )}

                <form onSubmit={handleAuth} className="flex-col gap-5">
                  <div>
                    <label className="label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Email Address</label>
                    <input
                      className="input-field"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      style={{ background: 'rgba(4, 7, 20, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', borderRadius: '12px', padding: '0.9rem 1.2rem' }}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 0 }}>Password</label>
                      {!isSignUp && (
                         <span onClick={handleResetPassword} style={{ fontSize: '0.8rem', color: '#38bdf8', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
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
                      style={{ background: 'rgba(4, 7, 20, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', borderRadius: '12px', padding: '0.9rem 1.2rem' }}
                    />
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="label" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'block' }}>Confirm Password</label>
                      <input
                        className="input-field"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ background: 'rgba(4, 7, 20, 0.8)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', borderRadius: '12px', padding: '0.9rem 1.2rem' }}
                      />
                    </div>
                  )}

                  <button className="btn-white-pill" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.75rem', padding: '1rem', fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {loading ? <div className="spinner"></div> : (isSignUp ? 'Create Account' : 'Log In')}
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
