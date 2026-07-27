import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, X, ShieldCheck, User, ImageIcon, Zap, Check, Sparkles, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';

export default function Settings({ session, profile: initialProfile, onProfileUpdate }) {
  const [profile, setProfile] = useState(initialProfile || { username: '', currency: 'USD', avatar_url: '', last_avatar_update: null, last_username_update: null, profile_mode: 'tracker' });
  const [originalProfile, setOriginalProfile] = useState(initialProfile);
  const [originalAvatar, setOriginalAvatar] = useState(initialProfile?.avatar_url || '');
  const [originalUsername, setOriginalUsername] = useState(initialProfile?.username || '');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ card: '', expiry: '', cvv: '', name: '' });
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const [stats, setStats] = useState({ totalBets: 0, wined: 0 });
  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined;

  useEffect(() => {
    document.title = "Profile Settings | QuantStakes";
    if (initialProfile) {
      setProfile(initialProfile);
      setOriginalProfile(initialProfile);
      setOriginalAvatar(initialProfile.avatar_url || '');
      setOriginalUsername(initialProfile.username || '');
    } else {
      if (isMock) {
        const p = sessionStorage.getItem('mock_profile');
        if (p) {
          const parsed = JSON.parse(p);
          setProfile(parsed);
          setOriginalProfile(parsed);
          setOriginalAvatar(parsed.avatar_url || '');
          setOriginalUsername(parsed.username || '');
        }
        
        const mockBets = sessionStorage.getItem('mock_bets');
        if (mockBets) {
          const parsedBets = JSON.parse(mockBets);
          const settled = parsedBets.filter(b => b.status !== 'Pending');
          const wined = settled.filter(b => b.status === 'Won').length;
          setStats({ totalBets: settled.length, wined });
        }
        return;
      }
      
      if (session) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
          if (data) {
            setProfile(data);
            setOriginalProfile(data);
            setOriginalAvatar(data.avatar_url || '');
            setOriginalUsername(data.username || '');
          }
        });
        
        supabase.from('bets').select('*').eq('user_id', session.user.id).neq('status', 'Pending').then(({ data }) => {
          if (data) {
            const wined = data.filter(b => b.status === 'Won').length;
            setStats({ totalBets: data.length, wined });
          }
        });
      }
    }
  }, [session, isMock, initialProfile]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile({ ...profile, avatar_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (originalProfile && 
        profile.username === originalProfile.username && 
        profile.currency === originalProfile.currency && 
        profile.avatar_url === originalProfile.avatar_url &&
        (profile.profile_mode || 'tracker') === (originalProfile.profile_mode || 'tracker')) {
      setErrorMsg("No changes detected.");
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (isMock) {
      sessionStorage.setItem('mock_profile', JSON.stringify(profile));
      setSuccessMsg('Profile saved successfully.');
      setOriginalProfile(profile);
      setOriginalAvatar(profile.avatar_url);
      if (onProfileUpdate) onProfileUpdate(profile);
      setLoading(false);
      return;
    }

    try {
      const updates = {
        username: profile.username,
        currency: profile.currency,
        avatar_url: profile.avatar_url,
        profile_mode: profile.profile_mode || 'tracker'
      };

      const { error } = await supabase.from('profiles').update(updates).eq('id', session.user.id);
      if (error) throw error;
      
      setSuccessMsg('Profile saved successfully.');
      setOriginalAvatar(profile.avatar_url);
      setProfile(updates);
      setOriginalUsername(profile.username);
      
      if (onProfileUpdate) onProfileUpdate(updates);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const processPayment = (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      const updated = { ...profile, profile_mode: 'analyst' };
      setProfile(updated);
      if (isMock) {
        sessionStorage.setItem('mock_profile', JSON.stringify(updated));
      }
      setShowCheckout(false);
      setPaymentLoading(false);
      setSuccessMsg('Quant Analyst / Tipster status activated!');
      if (onProfileUpdate) onProfileUpdate(updated);
    }, 1200);
  };

  const handleResetStats = async () => {
    setIsResetting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (isMock) {
        sessionStorage.setItem('mock_bets', JSON.stringify([]));
        setStats({ totalBets: 0, wined: 0 });
        setSuccessMsg('All statistics have been reset.');
      } else if (session?.user?.id) {
        const { error } = await supabase.from('bets').delete().eq('user_id', session.user.id);
        if (error) throw error;
        setStats({ totalBets: 0, wined: 0 });
        setSuccessMsg('All statistics have been reset.');
      }
      setShowResetConfirm(false);
    } catch (err) {
      setErrorMsg("Failed to reset stats: " + (err.message || err));
    } finally {
      setIsResetting(false);
    }
  };

  const isAnalyst = profile.profile_mode === 'analyst';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', maxWidth: '1200px', margin: '0 auto', paddingTop: '0.25rem', paddingBottom: '1rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)', paddingBottom: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#fff', margin: 0, letterSpacing: '-0.5px' }}>
            Profile <span style={{ background: 'linear-gradient(90deg, #22d3ee, #a13bf7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</span>
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Manage your account avatar, username, and tipster status.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.4rem 0.8rem', borderRadius: '30px' }}>
              <AlertCircle size={14} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '600', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.4rem 0.8rem', borderRadius: '30px' }}>
              <CheckCircle size={14} /> {successMsg}
            </div>
          )}
          <button 
            onClick={handleSave} 
            disabled={loading} 
            style={{
              background: '#ffffff',
              color: '#040714',
              fontWeight: '700',
              fontSize: '0.88rem',
              padding: '0.6rem 1.5rem',
              borderRadius: '40px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Main Unscrollable 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Profile Avatar, Username Display & Social Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Avatar Upload */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ 
                  width: '84px', 
                  height: '84px', 
                  borderRadius: '50%', 
                  border: '2px solid rgba(255, 255, 255, 0.15)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  color: '#fff', 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  overflow: 'hidden', 
                  background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))'
                }}>
                  {!profile.avatar_url && (profile.username?.[0] || session?.user?.email?.[0] || 'U').toUpperCase()}
                </div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="avatar-upload" />
                <label 
                  htmlFor="avatar-upload" 
                  style={{ 
                    position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent-cyan)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid #040714'
                  }}
                  title="Change Picture"
                >
                  <ImageIcon size={14} />
                </label>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                    {profile.username || 'Trader'}
                  </h2>
                  {isAnalyst && <ShieldCheck size={18} color="#a13bf7" />}
                </div>
                <span style={{ fontSize: '0.82rem', color: isAnalyst ? '#c084fc' : 'var(--text-secondary)', fontWeight: 500 }}>
                  {isAnalyst ? 'Verified Quant Analyst / Tipster' : 'Standard Member'}
                </span>
              </div>
            </div>

            {/* Social Metrics Bar: Followers, Following, Subscribers (DEFAULT 0) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', background: 'rgba(0, 0, 0, 0.25)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '16px', padding: '0.85rem 0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                  Followers
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>
                  {profile?.followers_count || 0}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', borderLeft: '1px solid rgba(255, 255, 255, 0.08)', borderRight: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                  Following
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '0.15rem' }}>
                  {profile?.following_count || 0}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-cyan)' }}>
                  Subscribers
                </span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: isAnalyst ? '#c084fc' : '#ffffff', marginTop: '0.15rem' }}>
                  {profile?.subscribers_count || 0}
                </span>
              </div>
            </div>

            {/* Reset Stats Option */}
            <div style={{ background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '14px', padding: '0.85rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '0.88rem', fontWeight: '700', color: '#fff', margin: 0 }}>Reset Performance</h4>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', margin: '0.1rem 0 0 0' }}>Wipe recorded bets from database.</p>
              </div>

              <button 
                onClick={() => setShowResetConfirm(true)}
                style={{ background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontWeight: '600', fontSize: '0.8rem', padding: '0.45rem 1rem', borderRadius: '8px', cursor: 'pointer' }}
              >
                Reset
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: Become Tipster Banner + Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* BECOME A QUANT ANALYST / TIPSTER BANNER */}
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(161, 59, 247, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)', 
            border: '1px solid rgba(161, 59, 247, 0.3)', 
            borderRadius: '20px', 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 8px 25px rgba(161, 59, 247, 0.1)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <Zap size={18} color="#a13bf7" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', margin: 0 }}>
                  Become a Quant Analyst / Tipster
                </h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', margin: 0, lineHeight: 1.5 }}>
                Publish verified mathematical performance, get featured on the public leaderboard, and monetize your strategy.
              </p>
            </div>

            <button 
              onClick={() => { if (!isAnalyst) setShowCheckout(true); }}
              disabled={isAnalyst}
              style={{ 
                background: isAnalyst ? 'rgba(161, 59, 247, 0.2)' : 'linear-gradient(135deg, #a13bf7, #22d3ee)', 
                color: '#ffffff', 
                fontWeight: '700', 
                fontSize: '0.88rem', 
                padding: '0.75rem 1.4rem', 
                borderRadius: '40px', 
                border: isAnalyst ? '1px solid rgba(161, 59, 247, 0.4)' : 'none', 
                cursor: isAnalyst ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: isAnalyst ? 'none' : '0 6px 20px rgba(161, 59, 247, 0.3)',
                whiteSpace: 'nowrap'
              }}
            >
              {isAnalyst ? <CheckCircle size={16} color="#a13bf7" /> : <Sparkles size={16} />}
              <span>{isAnalyst ? 'Verified Analyst Active' : 'Become a Quant Analyst / Tipster'}</span>
            </button>
          </div>

          {/* Account Edit Fields: Username & Currency */}
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Username Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                Username Handle
              </label>
              <input 
                type="text" 
                value={profile.username || ''}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                style={{ 
                  width: '100%', 
                  background: 'rgba(0, 0, 0, 0.4)', 
                  border: '1px solid rgba(255, 255, 255, 0.12)', 
                  color: '#fff', 
                  fontSize: '0.95rem', 
                  padding: '0.7rem 0.9rem', 
                  borderRadius: '10px', 
                  outline: 'none'
                }}
                placeholder="Enter username"
              />
            </div>

            {/* Currency Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                Default Currency
              </label>
              <select
                value={profile.currency || 'USD'}
                onChange={(e) => setProfile({ ...profile, currency: e.target.value })}
                style={{ width: '100%', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.95rem', padding: '0.7rem 0.9rem', borderRadius: '10px', outline: 'none' }}
              >
                <option value="USD" style={{ background: '#040714', color: '#fff' }}>USD ($)</option>
                <option value="EUR" style={{ background: '#040714', color: '#fff' }}>EUR (€)</option>
                <option value="GBP" style={{ background: '#040714', color: '#fff' }}>GBP (£)</option>
              </select>
            </div>
          </div>

        </div>

      </div>

      {/* Analyst Upgrade Modal */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#0a0a0f', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.12)', padding: '2rem', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            <button 
              onClick={() => setShowCheckout(false)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(161, 59, 247, 0.15)', borderRadius: '14px', border: '1px solid rgba(161, 59, 247, 0.3)', color: '#a13bf7' }}>
                <Zap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>Quant Analyst / Tipster</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: '0.2rem 0 0 0' }}>Monetize your verified strategy.</p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              Get featured on the public leaderboard and let subscribers follow your verified bets for <strong style={{ color: '#fff' }}>€50/mo</strong>. Annual analyst license is <strong style={{ color: '#a13bf7' }}>€50.00 / year</strong>.
            </p>

            <form onSubmit={processPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>Cardholder Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="John Doe" 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.8rem 1rem', fontSize: '0.95rem', borderRadius: '12px', color: '#fff', outline: 'none' }}
                  value={paymentDetails.name} 
                  onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })} 
                />
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>Card Number</label>
                <input 
                  type="text" 
                  required 
                  placeholder="4532 •••• •••• 8892" 
                  style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.8rem 1rem', fontSize: '0.95rem', borderRadius: '12px', color: '#fff', outline: 'none' }}
                  value={paymentDetails.card} 
                  onChange={e => setPaymentDetails({ ...paymentDetails, card: e.target.value })} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>Expiry</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="MM/YY" 
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.8rem 1rem', fontSize: '0.95rem', borderRadius: '12px', color: '#fff', outline: 'none' }}
                    value={paymentDetails.expiry} 
                    onChange={e => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>CVV</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="123" 
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.8rem 1rem', fontSize: '0.95rem', borderRadius: '12px', color: '#fff', outline: 'none' }}
                    value={paymentDetails.cvv} 
                    onChange={e => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })} 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={paymentLoading} 
                style={{ width: '100%', marginTop: '0.75rem', background: 'linear-gradient(135deg, #a13bf7, #22d3ee)', color: '#fff', cursor: 'pointer', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '700', borderRadius: '30px', border: 'none', transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {paymentLoading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={16} />}
                {paymentLoading ? 'Activating...' : 'Activate Analyst License'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#0a0a0f', borderRadius: '28px', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2rem', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            <button 
              onClick={() => setShowResetConfirm(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>Reset Performance History?</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: '0.2rem 0 0 0' }}>This action cannot be undone.</p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              Are you sure you want to delete all recorded bets? This will permanently wipe your betting history, PnL analytics, and performance stats from the database.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowResetConfirm(false)}
                style={{ padding: '0.7rem 1.25rem', fontSize: '0.85rem', fontWeight: '600', color: '#fff', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleResetStats}
                disabled={isResetting}
                style={{ 
                  padding: '0.7rem 1.25rem', 
                  fontSize: '0.85rem', 
                  fontWeight: '700', 
                  background: '#ef4444', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '30px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: isResetting ? 0.6 : 1
                }}
              >
                {isResetting ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
                {isResetting ? 'Deleting...' : 'Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
