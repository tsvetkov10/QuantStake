import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, LogOut, Settings as SettingsIcon, TrendingUp, Target, Trophy, Globe, Moon, Sun } from 'lucide-react';
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

function AuthenticatedApp({ session, isMock, profile, setProfileCompleted, onProfileUpdate }) {
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
    <div className="flex app-container" style={{ minHeight: '100vh', width: '100vw', position: 'relative' }}>
      <div className="bg-animation"></div>
      <div className="bg-grid"></div>

      {/* Floating Theme Toggle */}
      <button onClick={toggleTheme} className="btn btn-secondary" style={{ position: 'fixed', top: '0.5rem', right: '1.5rem', zIndex: 1000, borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-glass)', backdropFilter: 'blur(10px)', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        {theme === 'dark' ? <Sun size={20} color="#facc15" /> : <Moon size={20} color="#475569" />}
      </button>
      
      {/* Mobile Top Header */}
      <div className="mobile-top-header">
        <div className="flex items-center gap-2">
          <TrendingUp size={24} className="logo-icon" strokeWidth={3} />
          <h2 className="logo-text brand-logo-animated" style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>QuantStakes</h2>
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
          <TrendingUp size={36} className="logo-icon" strokeWidth={3} />
          <h2 className="logo-text brand-logo-animated" style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0, letterSpacing: '1px', lineHeight: 1 }}>QuantStakes</h2>
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
          <Route path="/leaderboard" element={<Leaderboard session={session} profile={profile} />} />
          <Route path="/trader/:username" element={<TraderProfile session={session} profile={profile} />} />
          <Route path="/social" element={<Social session={session} profile={profile} />} />
          <Route path="/add" element={<AddBet session={session} profile={profile} />} />
          <Route path="/history" element={<BetHistory session={session} profile={profile} />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/settings" element={<Settings session={session} profile={profile} onProfileUpdate={onProfileUpdate} />} />
          <Route path="/bet/:id" element={<BetDetails session={session} profile={profile} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [profile, setProfile] = useState(null);
  const currentUserId = useRef(null);
  const isMock = isMockMode;

  useEffect(() => {
    const checkProfile = async (currentSession, isNewSignIn = false) => {
      if (isMock) {
        const p = sessionStorage.getItem('mock_profile');
        if (p) {
          setProfile(JSON.parse(p));
        }
        const isMockLogin = sessionStorage.getItem('mock_new_login') === 'true';
        if (isMockLogin) {
           sessionStorage.removeItem('mock_new_login');
           setIsInitializing(true);
           setTimeout(() => {
             setLoading(false);
             setIsInitializing(false);
           }, 3000);
        } else {
           setLoading(false);
        }
        return;
      }

      if (currentSession) {
        const { data } = await supabase.from('profiles').select('*').eq('id', currentSession.user.id).single();
        if (data) {
          setProfile(data);
        } else {
          setProfile(null);
        }
      }
      
      if (isNewSignIn) {
         setIsInitializing(true);
         setTimeout(() => {
           setLoading(false);
           setIsInitializing(false);
         }, 3000);
      } else {
         setLoading(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        currentUserId.current = currentSession.user.id;
      }
      checkProfile(currentSession, true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'SIGNED_IN' && currentSession) {
         if (currentUserId.current !== currentSession.user.id) {
            currentUserId.current = currentSession.user.id;
            setLoading(true);
            checkProfile(currentSession, true);
         }
      } else if (event === 'SIGNED_OUT') {
         currentUserId.current = null;
         setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isMock]);

  if (loading) {
    if (isInitializing) {
      return (
        <div style={{height: '100vh', width: '100vw', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
          <div className="flex items-center gap-3 mb-10">
            <TrendingUp size={48} color="#00ffaa" strokeWidth={3} />
            <h1 className="text-gradient brand-logo-animated" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, letterSpacing: '2px' }}>QuantStakes</h1>
          </div>
          
          <div style={{ width: '300px', height: '4px', background: 'var(--adaptive-white-05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
             <div className="loading-bar-fill" style={{ position: 'absolute', top: 0, left: 0, height: '100%', background: 'var(--accent-cyan)' }}></div>
          </div>
          <p className="text-secondary mt-5" style={{ fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', animation: 'pulse 1.5s infinite' }}>Establishing Secure Connection...</p>
        </div>
      );
    }
    return <div style={{height: '100vh', width: '100vw', background: 'var(--bg-dark)'}}></div>;
  }

  const hasMockSession = sessionStorage.getItem('mock_session') === 'true' || localStorage.getItem('mock_session') === 'true';
  const userToUse = session || (hasMockSession ? { user: { email: 'demo@quantstakes.com', id: 'demo-uuid' } } : isMock ? { user: { email: 'demo@quantstakes.com', id: 'demo-uuid' } } : null);

  return (
    <Router>
      <div className="bg-animation"></div>
      <div className="bg-grid"></div>
      <Routes>
        <Route path="/" element={userToUse ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/auth" element={userToUse ? <Navigate to="/dashboard" replace /> : <Auth />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/*" element={userToUse ? <AuthenticatedApp session={userToUse} isMock={isMock} profile={profile} setProfileCompleted={(val) => {
          if (val) {
            // Re-fetch profile on completion
            supabase.from('profiles').select('*').eq('id', userToUse.user.id).single().then(({data}) => setProfile(data));
          }
        }} onProfileUpdate={(newProfile) => setProfile(newProfile)} /> : <Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
