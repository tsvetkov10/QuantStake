import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, X, ShieldCheck, User, Globe, Image as ImageIcon, Zap, Activity, Check, Lock, Sparkles, RefreshCw, RotateCcw, Trash2 } from 'lucide-react';

export default function Settings({ session, profile: initialProfile, onProfileUpdate }) {
  const [profile, setProfile] = useState(initialProfile || { username: '', region: '', nationality: '', age: '', currency: 'USD', avatar_url: '', last_avatar_update: null, last_username_update: null, profile_mode: 'tracker' });
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
    document.title = "My Profile | QuantStakes";
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

  const checkAvatarCooldown = () => {
    if (!profile.last_avatar_update) return true;
    const lastUpdate = new Date(profile.last_avatar_update).getTime();
    const now = new Date().getTime();
    const msInWeek = 7 * 24 * 60 * 60 * 1000;
    
    if (now - lastUpdate < msInWeek) {
      const daysLeft = Math.ceil((msInWeek - (now - lastUpdate)) / (1000 * 60 * 60 * 24));
      setErrorMsg(`Profile pictures can only be changed once per week. Please wait ${daysLeft} more day(s).`);
      return false;
    }
    return true;
  };

  const checkUsernameCooldown = () => {
    if (profile.username === originalUsername) return true;
    if (!profile.last_username_update) return true;
    
    const lastUpdate = new Date(profile.last_username_update).getTime();
    const now = new Date().getTime();
    const msInMonth = 30 * 24 * 60 * 60 * 1000;
    
    if (now - lastUpdate < msInMonth) {
      const daysLeft = Math.ceil((msInMonth - (now - lastUpdate)) / (1000 * 60 * 60 * 24));
      setErrorMsg(`Usernames can only be changed once every 30 days. Please wait ${daysLeft} more day(s).`);
      return false;
    }
    return true;
  };

  const handleImageUpload = (e) => {
    if (!checkAvatarCooldown()) return;
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
      setErrorMsg("No changes detected. Make a change first.");
      return;
    }
    if (!checkUsernameCooldown()) return;
    
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
        region: profile.region,
        currency: profile.currency,
        avatar_url: profile.avatar_url,
        profile_mode: profile.profile_mode || 'tracker'
      };

      if (profile.avatar_url !== originalAvatar) updates.last_avatar_update = new Date().toISOString();
      if (profile.username !== originalUsername) updates.last_username_update = new Date().toISOString();

      const { error } = await supabase.from('profiles').update(updates).eq('id', session.user.id);
      if (error) throw error;
      
      setSuccessMsg('Profile saved successfully.');
      setOriginalAvatar(profile.avatar_url);
      
      const newProfileState = { ...profile };
      if (updates.last_avatar_update) newProfileState.last_avatar_update = updates.last_avatar_update;
      if (updates.last_username_update) newProfileState.last_username_update = updates.last_username_update;
      
      setProfile(newProfileState);
      setOriginalUsername(profile.username);
      
      if (onProfileUpdate) onProfileUpdate(newProfileState);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToAnalyst = () => {
    if (profile.profile_mode === 'analyst') return;
    setShowCheckout(true);
  };

  const processPayment = (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    setTimeout(() => {
      setProfile({ ...profile, profile_mode: 'analyst' });
      setShowCheckout(false);
      setPaymentLoading(false);
      setSuccessMsg('Analyst license activated.');
    }, 1500);
  };

  const handleResetStats = async () => {
    setIsResetting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      if (isMock) {
        sessionStorage.setItem('mock_bets', JSON.stringify([]));
        setStats({ totalBets: 0, wined: 0 });
        setSuccessMsg('All betting statistics and records have been successfully reset.');
      } else if (session?.user?.id) {
        const { error } = await supabase.from('bets').delete().eq('user_id', session.user.id);
        if (error) throw error;
        setStats({ totalBets: 0, wined: 0 });
        setSuccessMsg('All betting statistics and records have been successfully reset.');
      }
      setShowResetConfirm(false);
    } catch (err) {
      console.error("Failed to reset stats:", err);
      setErrorMsg("Failed to reset stats: " + (err.message || err));
    } finally {
      setIsResetting(false);
    }
  };

  const winRate = stats.totalBets > 0 ? ((stats.wined / stats.totalBets) * 100).toFixed(1) : '0.0';
  const isAnalyst = profile.profile_mode === 'analyst';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingTop: '0.5rem', paddingBottom: '3rem', animation: 'fade-in 0.4s ease-out' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', margin: 0, letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Profile <span style={{ background: 'linear-gradient(90deg, #22d3ee, #a13bf7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Settings</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', margin: '0.25rem 0 0 0' }}>Manage your identity, public stats, and network tier.</p>
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
              color: '#000000',
              fontWeight: '800',
              fontSize: '0.875rem',
              padding: '0.7rem 1.75rem',
              borderRadius: '40px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 20px rgba(255, 255, 255, 0.15)',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.6 : 1
            }}
            className="hover-highlight"
          >
            {loading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={16} />}
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* Main Grid: Responsive 2 Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Profile Summary & Demographics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Card 1: User Profile Card */}
          <div style={{ 
            background: 'rgba(15, 18, 25, 0.75)', 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.08)', 
            padding: '2rem 1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
          }}>
            
            {/* Top Badges */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '800', color: '#ccc', letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={12} color="#22d3ee" /> Public ID
              </span>
              <span style={{ 
                background: isAnalyst ? 'rgba(161, 59, 247, 0.15)' : 'rgba(6, 182, 212, 0.15)', 
                border: isAnalyst ? '1px solid rgba(161, 59, 247, 0.3)' : '1px solid rgba(6, 182, 212, 0.3)', 
                color: isAnalyst ? '#a13bf7' : '#22d3ee', 
                padding: '0.3rem 0.75rem', 
                borderRadius: '20px', 
                fontSize: '0.7rem', 
                fontWeight: '800', 
                letterSpacing: '1px', 
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}>
                {isAnalyst ? <Zap size={12} /> : <Activity size={12} />}
                {isAnalyst ? 'Analyst' : 'Tracker'}
              </span>
            </div>

            {/* Avatar Circle */}
            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <div style={{ 
                width: '110px', 
                height: '110px', 
                borderRadius: '50%', 
                border: '2px solid rgba(255,255,255,0.12)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: '#fff', 
                fontSize: '2.5rem', 
                fontWeight: '300', 
                overflow: 'hidden', 
                boxShadow: isAnalyst ? '0 0 25px rgba(161, 59, 247, 0.25)' : '0 0 25px rgba(6, 182, 212, 0.2)',
                background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, #1e293b, #0f172a)'
              }}>
                {!profile.avatar_url && (profile.username?.[0] || session?.user?.email?.[0] || 'U').toUpperCase()}
              </div>

              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="avatar-upload" />
              <label 
                htmlFor="avatar-upload" 
                style={{ 
                  position: 'absolute', 
                  bottom: '2px', 
                  right: '2px', 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: '#22d3ee', 
                  color: '#000', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer', 
                  boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)', 
                  border: '3px solid #0a0a0f' 
                }}
                className="hover-highlight"
                title="Change Avatar"
              >
                <ImageIcon size={16} />
              </label>
            </div>

            {/* Name & Handle */}
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#fff', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              {profile.username || 'Anonymous'}
              {isAnalyst && <ShieldCheck size={20} color="#a13bf7" />}
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0 0 1.25rem 0' }}>
              {isAnalyst ? 'Verified Signal Publisher' : 'Private Portfolio Tracker'}
            </p>

            {/* Stats Banner */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)' }}>Signals</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '600', color: '#fff', marginTop: '0.2rem' }}>{stats.totalBets}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.4)' }}>Win Rate</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '600', color: '#22d3ee', marginTop: '0.2rem', textShadow: '0 0 10px rgba(6, 182, 212,0.3)' }}>{winRate}%</span>
              </div>
            </div>

            {profile.avatar_url && (
              <button 
                type="button" 
                onClick={() => { if (checkAvatarCooldown()) setProfile({ ...profile, avatar_url: '' }) }} 
                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: '600', marginTop: '1.25rem', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '1px' }}
              >
                Remove Custom Photo
              </button>
            )}
          </div>

          {/* Card 2: Demographics */}
          <div style={{ 
            background: 'rgba(15, 18, 25, 0.75)', 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.08)', 
            padding: '1.5rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'rgba(255,255,255,0.7)', margin: 0, textTransform: 'uppercase', letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={16} color="#a13bf7" /> Demographics & KYC
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>Currency</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', marginTop: '0.2rem' }}>{profile.currency || 'USD'}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>Region</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', marginTop: '0.2rem' }}>{profile.region || 'Unknown'}</div>
              </div>

              <div style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.4)' }}>Nationality</div>
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#fff', marginTop: '0.2rem' }}>{profile.nationality || 'Unknown'}</div>
              </div>

              <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '0.75rem', borderRadius: '12px' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#10b981' }}>KYC Verification</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600', color: '#34d399', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <CheckCircle size={12} /> Age Verified 18+
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.04)', padding: '0.75rem', borderRadius: '12px', marginTop: '0.25rem' }}>
              <Lock size={14} color="rgba(255,255,255,0.4)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
                Demographic details were permanently verified during KYC onboarding and are strictly immutable.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Settings Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          
          {/* Section 1: Account Identity */}
          <div style={{ 
            background: 'rgba(15, 18, 25, 0.75)', 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.08)', 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '12px', color: '#22d3ee' }}>
                <User size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>Network Handle & Identity</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0.2rem 0 0 0' }}>Your unique handle on the QuantStakes network.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.6)' }}>
                Network Username
              </label>
              <input 
                type="text" 
                value={profile.username || ''}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
                style={{ 
                  width: '100%', 
                  background: 'rgba(0,0,0,0.4)', 
                  border: '1px solid rgba(255,255,255,0.12)', 
                  color: '#fff', 
                  fontSize: '1.1rem', 
                  fontWeight: '500',
                  padding: '0.9rem 1.2rem', 
                  borderRadius: '14px', 
                  outline: 'none', 
                  transition: 'all 0.2s ease',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)' 
                }}
                onFocus={e => { e.target.style.borderColor = '#22d3ee'; e.target.style.boxShadow = '0 0 0 3px rgba(6, 182, 212, 0.15), inset 0 2px 8px rgba(0,0,0,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.5)'; }}
                placeholder="Enter a unique username"
              />
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0.4rem 0 0 0', lineHeight: 1.5 }}>
                Your username serves as your primary identifier on the network. For security, changes are restricted to once every 30 days.
              </p>
            </div>
          </div>

          {/* Section 2: Network Tier Selection */}
          <div style={{ 
            background: 'rgba(15, 18, 25, 0.75)', 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.08)', 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(161, 59, 247, 0.1)', border: '1px solid rgba(161, 59, 247, 0.2)', borderRadius: '12px', color: '#a13bf7' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>Network Operating Tier</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0.2rem 0 0 0' }}>Select your privacy level and network monetization features.</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              
              {/* Tracker Card */}
              <div 
                onClick={() => setProfile({ ...profile, profile_mode: 'tracker' })} 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: '18px', 
                  background: !isAnalyst ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(0, 0, 0, 0.4))' : 'rgba(255,255,255,0.02)', 
                  border: !isAnalyst ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255,255,255,0.08)', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: !isAnalyst ? '0 8px 25px rgba(6, 182, 212, 0.15)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ padding: '0.5rem', background: !isAnalyst ? 'rgba(6, 182, 212,0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '10px', color: !isAnalyst ? '#22d3ee' : 'rgba(255,255,255,0.4)' }}>
                        <Activity size={18} />
                      </div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '1.05rem' }}>Quant Tracker</div>
                    </div>

                    {!isAnalyst && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 10px #22d3ee' }}></div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                    Maintain a private, unlisted ledger. Your trading activity and win rate remain completely hidden from public leaderboards.
                  </p>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255,255,255,0.4)' }}>Free Tier</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '800', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    background: !isAnalyst ? '#22d3ee' : 'rgba(255,255,255,0.05)', 
                    color: !isAnalyst ? '#000' : 'rgba(255,255,255,0.4)' 
                  }}>
                    {!isAnalyst ? 'Active' : 'Select'}
                  </span>
                </div>
              </div>

              {/* Analyst Card */}
              <div 
                onClick={handleSwitchToAnalyst} 
                style={{ 
                  padding: '1.5rem', 
                  borderRadius: '18px', 
                  background: isAnalyst ? 'linear-gradient(135deg, rgba(161, 59, 247, 0.1), rgba(0, 0, 0, 0.4))' : 'rgba(255,255,255,0.02)', 
                  border: isAnalyst ? '1px solid rgba(161, 59, 247, 0.4)' : '1px solid rgba(255,255,255,0.08)', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: isAnalyst ? '0 8px 25px rgba(161, 59, 247, 0.2)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <div style={{ padding: '0.5rem', background: isAnalyst ? 'rgba(161,59,247,0.15)' : 'rgba(255,255,255,0.05)', borderRadius: '10px', color: isAnalyst ? '#a13bf7' : 'rgba(255,255,255,0.4)' }}>
                        <Zap size={18} />
                      </div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        Quant Analyst <Sparkles size={14} color="#a13bf7" />
                      </div>
                    </div>

                    {isAnalyst && (
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#a13bf7', boxShadow: '0 0 10px #a13bf7' }}></div>
                    )}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, margin: '0 0 1.25rem 0' }}>
                    Publish your verified signals to the public network leaderboard. Build a track record and allow users to subscribe for €50/mo.
                  </p>
                </div>

                <div style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#c084fc' }}>€50.00 / year</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: '800', 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    background: isAnalyst ? '#a13bf7' : 'rgba(161, 59, 247, 0.15)', 
                    color: isAnalyst ? '#fff' : '#c084fc',
                    border: isAnalyst ? 'none' : '1px solid rgba(161, 59, 247, 0.3)'
                  }}>
                    {isAnalyst ? 'Active' : 'Upgrade'}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Danger Zone / Performance Data Reset */}
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.03)', 
            backdropFilter: 'blur(24px)', 
            WebkitBackdropFilter: 'blur(24px)',
            borderRadius: '24px', 
            border: '1px solid rgba(239, 68, 68, 0.2)', 
            padding: '2rem', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.25rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid rgba(239, 68, 68, 0.15)', paddingBottom: '1rem' }}>
              <div style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', color: '#ef4444' }}>
                <Trash2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', margin: 0 }}>Danger Zone & Portfolio Data</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0.2rem 0 0 0' }}>Manage portfolio records and clear betting history.</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>Reset All Betting Statistics</div>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', margin: '0.25rem 0 0 0', lineHeight: 1.5 }}>
                  Permanently delete all recorded bets, win/loss history, and performance analytics from the database.
                </p>
              </div>

              <button 
                type="button"
                onClick={() => setShowResetConfirm(true)}
                style={{ 
                  padding: '0.75rem 1.25rem', 
                  borderRadius: '30px', 
                  background: 'rgba(239, 68, 68, 0.15)', 
                  border: '1px solid rgba(239, 68, 68, 0.4)', 
                  color: '#ef4444', 
                  fontSize: '0.85rem', 
                  fontWeight: '700', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
                className="hover-highlight"
              >
                <RotateCcw size={15} />
                <span>Reset Stats</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Analyst Checkout Modal */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#0a0a0f', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.12)', padding: '2rem', position: 'relative', animation: 'fade-in 0.3s ease-out', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            <button 
              onClick={() => setShowCheckout(false)} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              className="hover-highlight"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(161, 59, 247, 0.15)', borderRadius: '14px', border: '1px solid rgba(161, 59, 247, 0.3)', color: '#a13bf7' }}>
                <Zap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>Analyst License Activation</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', margin: '0.2rem 0 0 0' }}>Monetize your signal feed on QuantStakes.</p>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '0.85rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
              Publishing verified signals allows users to subscribe to you for <strong style={{ color: '#fff' }}>€50/mo</strong>. The Analyst license fee is <strong style={{ color: '#a13bf7' }}>€50.00 / year</strong>.
            </p>

            <form onSubmit={processPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>Cardholder Name</label>
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
                <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>Card Number</label>
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
                  <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>Expiry</label>
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
                  <label style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', display: 'block' }}>CVV</label>
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
                style={{ width: '100%', marginTop: '0.75rem', background: '#a13bf7', color: '#fff', cursor: 'pointer', padding: '0.9rem', fontSize: '0.95rem', fontWeight: '800', borderRadius: '30px', border: 'none', transition: 'all 0.2s ease', boxShadow: '0 8px 25px rgba(161, 59, 247, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                className="hover-highlight"
              >
                {paymentLoading ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Zap size={16} />}
                {paymentLoading ? 'Processing...' : 'Pay €50.00 & Activate'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ width: '100%', maxWidth: '440px', background: '#0a0a0f', borderRadius: '28px', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '2rem', position: 'relative', animation: 'fade-in 0.3s ease-out', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
            <button 
              onClick={() => setShowResetConfirm(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              className="hover-highlight"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '14px', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
                <Trash2 size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#fff', margin: 0 }}>Reset Performance Stats?</h3>
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
                  fontWeight: '800', 
                  background: '#ef4444', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '30px', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                  opacity: isResetting ? 0.6 : 1
                }}
              >
                {isResetting ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={15} />}
                {isResetting ? 'Deleting...' : 'Yes, Delete All Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
