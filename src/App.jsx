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

function TopNavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/dashboard' && location.pathname === '/');
  return (
    <Link 
      to={to} 
      style={{ 
        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontWeight: isActive ? '700' : '500',
        fontSize: '0.92rem',
        textDecoration: 'none',
        padding: '0.45rem 0.9rem',
        borderRadius: '8px',
        background: isActive ? 'var(--adaptive-white-08)' : 'transparent',
        border: isActive ? '1px solid var(--border-glass)' : '1px solid transparent',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap'
      }}
    >
      {children}
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
    <div className="flex-col app-container" style={{ minHeight: '100vh', width: '100%', position: 'relative', background: 'var(--bg-dark)' }}>
      <div className="bg-animation"></div>
      <div className="bg-grid"></div>

      {/* Top Landing Header Navbar */}
      <header className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-glass)', backdropFilter: 'blur(24px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '76px', zIndex: 1000, padding: '0 2rem' }}>
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo-full.png" alt="QuantStakes Logo" className="brand-logo-img" style={{ height: '52px', objectFit: 'contain', cursor: 'pointer' }} />
        </Link>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center gap-2 desktop-only" style={{ overflowX: 'auto' }}>
          <TopNavLink to="/dashboard">Terminal</TopNavLink>
          <TopNavLink to="/history">History</TopNavLink>
          <TopNavLink to="/leaderboard">Leaderboard</TopNavLink>
          <TopNavLink to="/add">Log Entry</TopNavLink>
          <TopNavLink to="/tools">Tools</TopNavLink>
          <a href="/#faq" onClick={(e) => {
            if (window.location.pathname === '/' || window.location.pathname === '/dashboard') {
              e.preventDefault();
              document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
            }
          }} style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.92rem', textDecoration: 'none', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}>FAQ</a>
        </nav>

        {/* Right Tools & User Profile */}
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="btn btn-secondary" style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--adaptive-white-05)', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            {theme === 'dark' ? <Sun size={18} color="#facc15" /> : <Moon size={18} color="#475569" />}
          </button>

          <Link to="/settings" style={{ textDecoration: 'none' }}>
            <div className="flex items-center gap-2.5" style={{ background: 'var(--adaptive-white-05)', padding: '0.35rem 0.85rem 0.35rem 0.35rem', borderRadius: '30px', border: '1px solid var(--border-glass)', transition: 'all 0.2s ease' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0 }}>
                {!profile?.avatar_url && (profile?.username?.[0] || session.user?.email?.[0] || 'U').toUpperCase()}
              </div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                {profile?.username || session.user?.email?.split('@')[0]}
              </span>
            </div>
          </Link>

          <button 
            className="flex items-center gap-1.5"
            style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', padding: '0.45rem 0.85rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem', transition: 'all 0.25s ease' }}
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
            <LogOut size={16} /> <span className="desktop-only">Disconnect</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content" style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', paddingTop: '96px', paddingBottom: '3rem', paddingLeft: '2rem', paddingRight: '2rem', flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard session={session} profile={profile} />} />
          <Route path="/dashboard" element={<Dashboard session={session} profile={profile} />} />
          <Route path="/leaderboard" element={MAINTENANCE_CONFIG.leaderboard ? <Maintenance title="Analyst Leaderboard" description="We are optimizing track record verification algorithms. The analyst leaderboard will return online shortly." /> : <Leaderboard session={session} profile={profile} />} />
          <Route path="/trader/:username" element={MAINTENANCE_CONFIG.traderProfile ? <Maintenance title="Trader Profile" description="Trader profile customization and public track record views are currently undergoing scheduled upgrades." /> : <TraderProfile session={session} profile={profile} />} />
          <Route path="/add" element={MAINTENANCE_CONFIG.addBet ? <Maintenance title="Bet Slip Parser" description="Upgrading OCR parsing engine and image extraction models. This module will return online shortly." /> : <AddBet session={session} profile={profile} />} />
          <Route path="/history" element={MAINTENANCE_CONFIG.history ? <Maintenance title="Bet History" description="Optimizing bankroll history indexing. History views will return online shortly." /> : <BetHistory session={session} profile={profile} />} />
          <Route path="/tools" element={MAINTENANCE_CONFIG.tools ? <Maintenance title="Calculators & Analytics" description="Upgrading Kelly Criterion and arbitrage computation engines." /> : <Tools />} />
          <Route path="/settings" element={MAINTENANCE_CONFIG.settings ? <Maintenance title="Account Settings" description="System configuration upgrades in progress." /> : <Settings session={session} profile={profile} onProfileUpdate={onProfileUpdate} />} />
          <Route path="/bet/:id" element={<BetDetails session={session} profile={profile} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
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
        <Route path="/" element={<Landing session={userToUse} profile={profile} />} />
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
