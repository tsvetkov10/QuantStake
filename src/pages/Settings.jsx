import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, X, ShieldCheck, User, Globe, Image as ImageIcon, Zap, Activity } from 'lucide-react';

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
  
  const [stats, setStats] = useState({ totalBets: 0, wined: 0 });
  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined;

  useEffect(() => {
    document.title = "My Profile | QuantStake";
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

  const InfoItem = ({ label, value, highlight }) => (
    <div className="flex-col gap-1 mb-6">
      <span style={{ fontSize: '0.65rem', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', color: 'rgba(255,255,255,0.4)' }}>{label}</span>
      <span style={{ fontSize: '1.15rem', fontWeight: '500', color: highlight ? 'var(--accent-cyan)' : '#fff', textShadow: highlight ? '0 0 10px rgba(0, 243, 255, 0.4)' : 'none' }}>{value}</span>
    </div>
  );

  return (
    <div className="flex-col gap-8 w-full h-full max-w-[1600px] mx-auto pt-4" style={{ animation: 'fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      
      {/* Header */}
      <div className="flex justify-between items-end flex-shrink-0">
        <div className="flex-col gap-1">
          <h2 style={{ fontSize: '2.5rem', fontWeight: '300', margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
            Profile <span style={{ fontWeight: '700', background: 'linear-gradient(90deg, var(--accent-cyan), #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dashboard</span>
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)' }}>Manage your identity and network tier.</p>
        </div>
        <div className="flex items-center gap-6">
          {errorMsg && <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: '500' }}>{errorMsg}</div>}
          {successMsg && <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: '500' }}>{successMsg}</div>}
          <button 
            className="hover-highlight" 
            onClick={handleSave} 
            disabled={loading} 
            style={{ 
              background: '#fff', 
              color: '#000', 
              padding: '0.8rem 2.5rem', 
              borderRadius: '40px', 
              fontWeight: '800', 
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 30px rgba(255, 255, 255, 0.2)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>

      {/* 
        Massive Unified Glass Panel 
        Fixed background to be uniformly glass to avoid the awkward opaque corners
      */}
      <div style={{ 
        background: 'rgba(15, 18, 25, 0.65)', 
        backdropFilter: 'blur(30px)', 
        WebkitBackdropFilter: 'blur(30px)',
        borderRadius: '32px', 
        border: '1px solid rgba(255,255,255,0.06)', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)', 
        flexGrow: 1, 
        minHeight: 0,
        overflow: 'hidden'
      }}>
        
        {/* 
          Grid Layout: Redesigned columns.
          1.2fr for Preview, 1.6fr for Network Tier (Middle emphasis), 1fr for Identity, 1fr for KYC.
        */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.6fr 1fr 1fr', height: '100%' }}>
          
          {/* Section 1: Overview / Public Preview */}
          <div style={{ padding: '3.5rem 2.5rem', position: 'relative', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Subtle glow behind avatar */}
            <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: profile.profile_mode === 'analyst' ? 'rgba(161, 59, 247, 0.15)' : 'rgba(0, 243, 255, 0.15)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
            
            <div style={{ width: '100%', display: 'flex', justifySelf: 'start', marginBottom: '2.5rem', zIndex: 1 }}>
               <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 1rem', borderRadius: '30px', fontSize: '0.65rem', fontWeight: '800', color: '#fff', letterSpacing: '1.5px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={12} /> PUBLIC ID
               </div>
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, #1f2937, #111827)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '3.5rem', fontWeight: '300', overflow: 'hidden', boxShadow: '0 15px 40px rgba(0,0,0,0.5)' }}>
                 {!profile.avatar_url && (profile.username?.[0] || session?.user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="avatar-upload" />
              <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: '0px', right: '0px', background: 'var(--accent-cyan)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0, 243, 255, 0.5)', border: '4px solid #111' }} className="hover-highlight">
                <ImageIcon size={20} color="#000" />
              </label>
            </div>
            
            <div className="mt-6 text-center" style={{ zIndex: 1 }}>
               <h3 style={{ fontSize: '2rem', fontWeight: '400', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', letterSpacing: '-0.5px' }}>
                 {profile.username || 'Anonymous'}
                 {profile.profile_mode === 'analyst' && <ShieldCheck size={24} color="var(--accent-purple)" style={{ filter: 'drop-shadow(0 0 8px rgba(161, 59, 247, 0.5))' }} />}
               </h3>
               <p style={{ fontSize: '1rem', marginTop: '0.4rem', color: profile.profile_mode === 'analyst' ? 'var(--accent-purple)' : 'var(--text-secondary)', fontWeight: '500' }}>
                 {profile.profile_mode === 'analyst' ? 'Verified Analyst' : 'Quant Tracker'}
               </p>
            </div>

            <div className="flex gap-10 mt-12 pt-8 w-full justify-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', zIndex: 1 }}>
               <div className="flex-col items-center gap-1">
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', color: 'rgba(255,255,255,0.4)' }}>Signals</span>
                  <span style={{ fontSize: '2rem', fontWeight: '300', color: '#fff' }}>{stats.totalBets}</span>
               </div>
               <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
               <div className="flex-col items-center gap-1">
                  <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800', color: 'rgba(255,255,255,0.4)' }}>Win Rate</span>
                  <span style={{ fontSize: '2rem', fontWeight: '300', color: stats.totalBets > 0 ? 'var(--accent-cyan)' : '#fff', textShadow: stats.totalBets > 0 ? '0 0 15px rgba(0, 243, 255, 0.3)' : 'none' }}>
                    {stats.totalBets > 0 ? ((stats.wined / stats.totalBets) * 100).toFixed(1) : '0.0'}%
                  </span>
               </div>
            </div>
            
            {profile.avatar_url && (
              <button type="button" onClick={() => { if (checkAvatarCooldown()) setProfile({ ...profile, avatar_url: '' }) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', marginTop: 'auto', paddingTop: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Remove Photo
              </button>
            )}
          </div>

          {/* Section 2: Network Tier (Moved to center and made a hero section) */}
          <div style={{ padding: '3.5rem 3rem', borderRight: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
            {/* Background accent for emphasis */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)', pointerEvents: 'none' }}></div>
            
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: '0 0 3rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldCheck size={20} color="var(--success)" /> Network Tier
            </h3>
            
            <div className="flex-col gap-6 relative z-10">
              
              {/* Tracker Card */}
              <div 
                onClick={() => setProfile({ ...profile, profile_mode: 'tracker' })} 
                style={{ 
                  padding: '2rem', 
                  borderRadius: '20px', 
                  background: (profile.profile_mode || 'tracker') !== 'analyst' ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.1), rgba(0, 0, 0, 0))' : 'rgba(255,255,255,0.02)', 
                  border: (profile.profile_mode || 'tracker') !== 'analyst' ? '1px solid rgba(0, 243, 255, 0.3)' : '1px solid rgba(255,255,255,0.05)', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: (profile.profile_mode || 'tracker') !== 'analyst' ? '0 10px 30px rgba(0, 243, 255, 0.1), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-3">
                      <div style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <Activity size={20} color={(profile.profile_mode || 'tracker') !== 'analyst' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.5)'} />
                      </div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>Quant Tracker</div>
                   </div>
                   {(profile.profile_mode || 'tracker') !== 'analyst' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-cyan)', boxShadow: '0 0 15px var(--accent-cyan)' }}></div>}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginTop: '1rem' }}>
                  Maintain a private ledger. Your activity is hidden from the public leaderboard. Perfect for personal portfolio tracking.
                </div>
              </div>
              
              {/* Analyst Card */}
              <div 
                onClick={handleSwitchToAnalyst} 
                style={{ 
                  padding: '2rem', 
                  borderRadius: '20px', 
                  background: profile.profile_mode === 'analyst' ? 'linear-gradient(135deg, rgba(161, 59, 247, 0.1), rgba(0, 0, 0, 0))' : 'rgba(255,255,255,0.02)', 
                  border: profile.profile_mode === 'analyst' ? '1px solid rgba(161, 59, 247, 0.3)' : '1px solid rgba(255,255,255,0.05)', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: profile.profile_mode === 'analyst' ? '0 10px 30px rgba(161, 59, 247, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none'
                }}
              >
                <div className="flex justify-between items-start mb-3">
                   <div className="flex items-center gap-3">
                      <div style={{ padding: '0.6rem', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                         <Zap size={20} color={profile.profile_mode === 'analyst' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.5)'} />
                      </div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '1.3rem', letterSpacing: '-0.5px' }}>Quant Analyst</div>
                   </div>
                   {profile.profile_mode === 'analyst' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-purple)', boxShadow: '0 0 15px var(--accent-purple)' }}></div>}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginTop: '1rem' }}>
                  Publish your stats & signals to the network. Build a reputation and allow users to subscribe to your feed for €50/mo.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Identity Configuration */}
          <div style={{ padding: '3.5rem 2.5rem', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: '0 0 3rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <User size={20} color="var(--accent-cyan)" /> Identity
            </h3>
            
            <div className="mt-8">
              <label style={{ fontSize: '0.65rem', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '800', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: '1rem' }}>Network Username</label>
              <input 
                type="text" 
                value={profile.username || ''}
                onChange={(e) => setProfile({...profile, username: e.target.value})}
                style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.2rem', padding: '1.2rem', borderRadius: '16px', outline: 'none', transition: 'all 0.3s ease', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)' }}
                onFocus={e => { e.target.style.borderColor = 'var(--accent-cyan)'; e.target.style.boxShadow = '0 0 0 3px rgba(0, 243, 255, 0.1), inset 0 2px 10px rgba(0,0,0,0.5)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'inset 0 2px 10px rgba(0,0,0,0.5)'; }}
                placeholder="Enter a unique username"
              />
              <p style={{ fontSize: '0.85rem', marginTop: '1.2rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.4)', padding: '0 0.5rem' }}>
                Your username is your primary identifier on the network. For security, changes are restricted to once every 30 days.
              </p>
            </div>
          </div>

          {/* Section 4: Immutable Demographics */}
          <div style={{ padding: '3.5rem 2.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', margin: '0 0 3rem 0', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Globe size={20} color="var(--accent-purple)" /> Demographics
            </h3>
            
            <div className="flex-col">
              <InfoItem label="Primary Currency" value={profile.currency || 'USD'} />
              <InfoItem label="Trading Region" value={profile.region || 'Unknown'} />
              <InfoItem label="Nationality" value={profile.nationality || 'Unknown'} />
              <InfoItem label="Verification" value="Age Verified (18+)" highlight={true} />
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
               <p style={{ fontSize: '0.8rem', lineHeight: 1.5, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                 These details are strictly immutable and were permanently set during KYC onboarding.
               </p>
            </div>
          </div>

        </div>
      </div>

      {/* Analyst Checkout Modal */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ width: '100%', maxWidth: '420px', background: '#0a0a0f', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', padding: '2.5rem', position: 'relative', animation: 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setShowCheckout(false)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'rgba(255,255,255,0.6)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }} className="hover-highlight">
              <X size={18} />
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div style={{ padding: '0.8rem', background: 'rgba(161, 59, 247, 0.1)', borderRadius: '16px', border: '1px solid rgba(161, 59, 247, 0.2)' }}>
                 <Zap size={28} color="var(--accent-purple)" />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>Analyst License</h3>
            </div>
            
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', marginBottom: '2rem' }}>
              Publishing your stats allows users to subscribe to you for <strong style={{color: '#fff'}}>€50/mo</strong>. A commercial license costs <strong style={{color: 'var(--accent-purple)'}}>€50.00 / year</strong>.
            </p>

            <form onSubmit={processPayment} className="flex-col gap-4">
              <input type="text" required placeholder="Cardholder Name" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', fontSize: '1rem', borderRadius: '16px', color: '#fff', outline: 'none' }} value={paymentDetails.name} onChange={e => setPaymentDetails({ ...paymentDetails, name: e.target.value })} onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <input type="text" required placeholder="Card Number" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', fontSize: '1rem', borderRadius: '16px', color: '#fff', outline: 'none' }} value={paymentDetails.card} onChange={e => setPaymentDetails({ ...paymentDetails, card: e.target.value })} onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" required placeholder="MM/YY" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', fontSize: '1rem', borderRadius: '16px', color: '#fff', outline: 'none' }} value={paymentDetails.expiry} onChange={e => setPaymentDetails({ ...paymentDetails, expiry: e.target.value })} onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                <input type="text" required placeholder="CVV" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.2rem', fontSize: '1rem', borderRadius: '16px', color: '#fff', outline: 'none' }} value={paymentDetails.cvv} onChange={e => setPaymentDetails({ ...paymentDetails, cvv: e.target.value })} onFocus={e => e.target.style.borderColor = 'var(--accent-purple)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
              </div>

              <button type="submit" disabled={paymentLoading} style={{ width: '100%', marginTop: '1.5rem', background: '#fff', color: '#000', cursor: 'pointer', padding: '1.2rem', fontSize: '1.05rem', fontWeight: '800', borderRadius: '40px', border: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 10px 30px rgba(255, 255, 255, 0.2)' }} className="hover-highlight">
                {paymentLoading ? 'Processing...' : 'Pay €50.00'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
