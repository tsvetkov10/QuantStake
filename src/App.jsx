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
import HeaderNav from './components/HeaderNav';
import { MAINTENANCE_CONFIG } from './config/maintenanceConfig';
import './index.css';

function AuthenticatedApp({ session, isMock, profile, isCheckingProfile, setProfileCompleted, onProfileUpdate }) {
  if (isCheckingProfile && !profile) {
    return <div style={{ height: '100vh', width: '100%', background: 'var(--bg-dark)' }}></div>;
  }

  if (!profile) {
    return <Onboarding session={session} onComplete={() => setProfileCompleted(true)} />;
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  return (
    <div className="flex-col app-container" style={{ minHeight: '100vh', width: '100%', position: 'relative', background: '#040714' }}>
      <div className="bg-animation"></div>
      <div className="bg-grid"></div>

      {/* Top Universal Header Navbar */}
      <HeaderNav session={session} profile={profile} isMock={isMock} />

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
  const [profile, setProfile] = useState(() => {
    try {
      const cached = localStorage.getItem('quant_cached_profile');
      return cached ? JSON.parse(cached) : null;
    } catch(e) {
      return null;
    }
  });
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);
  const currentUserId = useRef(null);
  const isMock = isMockMode;

  useEffect(() => {
    const checkProfile = async (currentSession) => {
      if (isMock) {
        const p = sessionStorage.getItem('mock_profile') || localStorage.getItem('quant_cached_profile');
        if (p) {
          try {
            setProfile(typeof p === 'string' ? JSON.parse(p) : p);
          } catch(e) {
            setProfile(p);
          }
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
          try {
            localStorage.setItem('quant_cached_profile', JSON.stringify(data));
          } catch(e) {}
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
        <Route path="/" element={<Landing session={session} profile={profile} />} />
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
