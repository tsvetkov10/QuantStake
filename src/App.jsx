import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, LogOut, Settings as SettingsIcon, Sparkles, Target, Trophy, Globe, Moon, Sun } from 'lucide-react';
import { supabase, isMockMode } from './lib/supabase';
import Dashboard from './pages/Dashboard';
import AddBet from './pages/AddBet';
import BetHistory from './pages/BetHistory';
import Auth from './pages/Auth';
import Settings from './pages/Settings';
import BetDetails from './pages/BetDetails';
import Landing from './pages/Landing';
import Onboarding from './pages/Onboarding';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Tools from './pages/Tools';
import Leaderboard from './pages/Leaderboard';
import TraderProfile from './pages/TraderProfile';
import Social from './pages/Social';
import Maintenance from './components/Maintenance';
import { MAINTENANCE_CONFIG } from './config/maintenanceConfig';
import './index.css';

function NavLink({ to, icon: Icon, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className="hover-highlight"
      style={{ 
        width: '100%', 
        display: 'flex',
        alignItems: 'center',
        background: isActive ? 'linear-gradient(90deg, rgba(0, 243, 255, 0.15) 0%, rgba(0, 243, 255, 0.02) 100%)' : 'transparent',
        border: isActive ? '1px solid rgba(0, 243, 255, 0.2)' : '1px solid transparent',
        borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
        color: isActive ? '#fff' : 'var(--text-secondary)',
        padding: '0.8rem 1rem',
        borderRadius: '8px',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        boxShadow: isActive ? '0 0 15px rgba(0, 243, 255, 0.05)' : 'none'
      }}
    >
      <Icon size={20} style={{ color: isActive ? 'var(--accent-cyan)' : 'inherit', marginRight: '0.75rem', transition: 'color 0.3s ease' }} /> 
      <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '0.95rem', letterSpacing: '0.5px' }}>{children}</span>
    </Link>
  );
}

function AuthenticatedApp({ session, isMock, profile, isCheckingProfile, setProfileCompleted, onProfileUpdate }) {
  if (isCheckingProfile && !profile) {
    return <div style={{ height: '100vh', width: '100%', background: 'var(--bg-dark)' }}></div>;
  }

  if (!profile) {
    return <Onboarding session={session} onComplete={() => setProfileCompleted(true)} />;
  }

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  return (
    <div className="flex app-container" style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>
      <div className="bg-animation"></div>
      <div className="bg-grid"></div>

      {/* Floating Theme Toggle */}
      <button onClick={toggleTheme} className="btn btn-secondary" style={{ position: 'fixed', top: '0.5rem', right: '1.5rem', zIndex: 1000, borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {theme === 'dark' ? <Sun size={20} color="#facc15" /> : <Moon size={20} color="#475569" />}
      </button>
      
      {/* Mobile Top Header */}
      <div className="mobile-top-header">
        <div className="flex items-center gap-2">
          <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '64px', objectFit: 'contain' }} />
        </div>
        <div className="flex items-center gap-3">
          <Link to="/settings">
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
              {!profile?.avatar_url && (profile?.username?.[0] || session.user?.email?.[0] || 'U').toUpperCase()}
            </div>
          </Link>
          <LogOut size={20} color="var(--danger)" onClick={async () => {
            sessionStorage.removeItem('mock_session');
            localStorage.removeItem('mock_session');
            sessionStorage.removeItem('mock_profile');
            if (!isMock) {
              await supabase.auth.signOut();
            }
            window.location.replace('/');
          }} style={{ cursor: 'pointer' }} />
        </div>
      </div>

      {/* Sidebar */}
      <aside className="glass-panel sidebar" style={{ width: '280px', flexShrink: 0, borderRadius: '0', borderTop: 'none', borderBottom: 'none', borderLeft: 'none', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, rgba(15,15,20,0.95) 0%, rgba(10,10,15,0.95) 100%)', boxShadow: '5px 0 20px rgba(0,0,0,0.2)' }}>
        <div className="flex items-center gap-3 mb-8 sidebar-header">
          <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '60px', objectFit: 'contain' }} />
        </div>
        
        <nav className="flex-col gap-3" style={{ flexGrow: 1 }}>
          <NavLink to="/dashboard" icon={LayoutDashboard}>Terminal</NavLink>
          <NavLink to="/history" icon={History}>Ledger</NavLink>
          <NavLink to="/social" icon={Globe}>Social Feed</NavLink>
          <NavLink to="/leaderboard" icon={Trophy}>Leaderboard</NavLink>
          <NavLink to="/add" icon={PlusCircle}>Log Entry</NavLink>
          <NavLink to="/tools" icon={Target}>Tools</NavLink>
        </nav>
        
        <div className="mt-auto flex-col gap-4 pt-8 sidebar-footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <Link to="/settings" className="flex items-center gap-3 p-3 hover-highlight" style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', textDecoration: 'none', transition: 'all 0.3s ease', cursor: 'pointer', overflow: 'hidden' }}>
             <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '1.2rem', flexShrink: 0, boxShadow: '0 0 10px rgba(0, 243, 255, 0.2)' }}>
                {!profile?.avatar_url && (profile?.username?.[0] || session.user?.email?.[0] || 'U').toUpperCase()}
             </div>
             <div className="flex-col" style={{ minWidth: 0 }}>
               <span style={{ color: '#fff', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem' }}>{profile?.username || session.user?.email?.split('@')[0]}</span>
               <span className="text-secondary" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--accent-cyan)' }}>Pro Member</span>
             </div>
          </Link>
          <button 
            className="flex items-center justify-center gap-2 hover-highlight" 
            style={{ width: '100%', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
            onClick={async () => {
              sessionStorage.removeItem('mock_session');
              localStorage.removeItem('mock_session');
              sessionStorage.removeItem('mock_profile');
              if (!isMock) {
                await supabase.auth.signOut();
              }
              window.location.replace('/');
            }}
          >
            <LogOut size={18} /> Disconnect
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ flexGrow: 1, padding: '3rem', height: '100vh', overflowY: 'auto' }}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard session={session} profile={profile} />} />
          <Route path="/leaderboard" element={MAINTENANCE_CONFIG.leaderboard ? <Maintenance title="Analyst Leaderboard" description="We are optimizing cryptographic track record verification algorithms. The analyst leaderboard will return online shortly." /> : <Leaderboard session={session} profile={profile} />} />
          <Route path="/trader/:username" element={MAINTENANCE_CONFIG.traderProfile ? <Maintenance title="Trader Profile" description="Trader profile customization and public track record views are currently undergoing scheduled upgrades." /> : <TraderProfile session={session} profile={profile} />} />
          <Route path="/social" element={MAINTENANCE_CONFIG.social ? <Maintenance title="Social Signal Feed" description="Upgrading peer-to-peer signal streams and verification ledgers. The social feed will return online shortly." /> : <Social session={session} profile={profile} />} />
          <Route path="/add" element={MAINTENANCE_CONFIG.addBet ? <Maintenance title="Bet Slip Parser" description="Upgrading OCR parsing engine and image extraction models. This module will return online shortly." /> : <AddBet session={session} profile={profile} />} />
          <Route path="/history" element={MAINTENANCE_CONFIG.history ? <Maintenance title="Bet History & Ledger" description="Optimizing bankroll ledger history indexing. History views will return online shortly." /> : <BetHistory session={session} profile={profile} />} />
          <Route path="/tools" element={MAINTENANCE_CONFIG.tools ? <Maintenance title="Calculators & Analytics" description="Upgrading Kelly Criterion and arbitrage computation engines." /> : <Tools />} />
          <Route path="/settings" element={MAINTENANCE_CONFIG.settings ? <Maintenance title="Account Settings" description="System configuration upgrades in progress." /> : <Settings session={session} profile={profile} onProfileUpdate={onProfileUpdate} />} />
          <Route path="/bet/:id" element={<BetDetails session={session} profile={profile} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const currentUserId = useRef(null);
  const isMock = isMockMode;

  useEffect(() => {
    const checkProfile = async (currentSession) => {
      if (isMock) {
        const p = sessionStorage.getItem('mock_profile');
        if (p) {
          setProfile(JSON.parse(p));
        } else {
          setProfile({ username: 'QuantAnalyst', winRate: 68.4, roi: 34.2, netProfit: 24850 });
        }
        setIsCheckingProfile(false);
        return;
      }

      if (currentSession) {
        setIsCheckingProfile(true);
        const { data } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single();
        if (data) {
          setProfile(data);
        } else {
          setProfile(null);
        }
        setIsCheckingProfile(false);
      } else {
        setIsCheckingProfile(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        currentUserId.current = currentSession.user.id;
      }
      checkProfile(currentSession);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'SIGNED_IN' && currentSession) {
         if (currentUserId.current !== currentSession.user.id) {
            currentUserId.current = currentSession.user.id;
            checkProfile(currentSession);
         }
      } else if (event === 'SIGNED_OUT') {
         currentUserId.current = null;
         setProfile(null);
         setIsCheckingProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isMock]);

  const hasMockSession = sessionStorage.getItem('mock_session') === 'true' || localStorage.getItem('mock_session') === 'true';
  const userToUse = session || (hasMockSession ? { user: { email: 'demo@quantstakes.com', id: 'demo-uuid' } } : null);

  return (
    <Router>
      <div className="bg-animation"></div>
      <div className="bg-grid"></div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/*" element={userToUse ? <AuthenticatedApp session={userToUse} isMock={isMock} profile={profile} isCheckingProfile={isCheckingProfile} setProfileCompleted={(val) => {
          if (val) {
            setIsCheckingProfile(true);
            // Re-fetch profile on completion
            supabase.from('profiles').select('*').eq('id', userToUse.user.id).single().then(({data}) => {
              setProfile(data);
              setIsCheckingProfile(false);
            });
          }
        }} onProfileUpdate={(newProfile) => setProfile(newProfile)} /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
