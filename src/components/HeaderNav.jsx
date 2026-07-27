import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Moon, Sun, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HeaderNav({ session, profile, isMock, theme, toggleTheme }) {
  const location = useLocation();

  const handleLogout = async () => {
    sessionStorage.removeItem('mock_session');
    localStorage.removeItem('mock_session');
    sessionStorage.removeItem('mock_profile');
    if (!isMock) {
      await supabase.auth.signOut();
    }
    window.location.replace('/');
  };

  const isLinkActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <header className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-glass)', background: 'var(--bg-glass)', backdropFilter: 'blur(24px)', position: 'fixed', top: 0, left: 0, width: '100%', height: '76px', zIndex: 1000, padding: '0 2rem' }}>
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo-full.png" alt="QuantStakes Logo" className="brand-logo-img" style={{ height: '52px', objectFit: 'contain', cursor: 'pointer' }} />
      </Link>

      {/* Center Navigation Bar */}
      <nav className="flex items-center gap-2 desktop-only" style={{ overflowX: 'auto' }}>
        {session ? (
          <>
            <Link 
              to="/dashboard" 
              style={{ 
                color: isLinkActive('/dashboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isLinkActive('/dashboard') ? '700' : '500',
                fontSize: '0.92rem',
                textDecoration: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                background: isLinkActive('/dashboard') ? 'var(--adaptive-white-08)' : 'transparent',
                border: isLinkActive('/dashboard') ? '1px solid var(--border-glass)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Dashboard
            </Link>

            <Link 
              to="/history" 
              style={{ 
                color: isLinkActive('/history') ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isLinkActive('/history') ? '700' : '500',
                fontSize: '0.92rem',
                textDecoration: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                background: isLinkActive('/history') ? 'var(--adaptive-white-08)' : 'transparent',
                border: isLinkActive('/history') ? '1px solid var(--border-glass)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              History
            </Link>

            <Link 
              to="/leaderboard" 
              style={{ 
                color: isLinkActive('/leaderboard') ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isLinkActive('/leaderboard') ? '700' : '500',
                fontSize: '0.92rem',
                textDecoration: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                background: isLinkActive('/leaderboard') ? 'var(--adaptive-white-08)' : 'transparent',
                border: isLinkActive('/leaderboard') ? '1px solid var(--border-glass)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Leaderboard
            </Link>

            <Link 
              to="/add" 
              style={{ 
                color: isLinkActive('/add') ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isLinkActive('/add') ? '700' : '500',
                fontSize: '0.92rem',
                textDecoration: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                background: isLinkActive('/add') ? 'var(--adaptive-white-08)' : 'transparent',
                border: isLinkActive('/add') ? '1px solid var(--border-glass)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Log Entry
            </Link>

            <Link 
              to="/tools" 
              style={{ 
                color: isLinkActive('/tools') ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isLinkActive('/tools') ? '700' : '500',
                fontSize: '0.92rem',
                textDecoration: 'none',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                background: isLinkActive('/tools') ? 'var(--adaptive-white-08)' : 'transparent',
                border: isLinkActive('/tools') ? '1px solid var(--border-glass)' : '1px solid transparent',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              Tools
            </Link>

            <a 
              href="/#faq" 
              onClick={(e) => {
                if (location.pathname === '/' || location.pathname === '/dashboard') {
                  e.preventDefault();
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              style={{ 
                color: 'var(--text-secondary)', 
                fontWeight: 500, 
                fontSize: '0.92rem', 
                textDecoration: 'none', 
                padding: '0.45rem 0.9rem', 
                whiteSpace: 'nowrap' 
              }}
            >
              FAQ
            </a>
          </>
        ) : (
          <>
            <Link to="/auth" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.92rem', textDecoration: 'none', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}>Dashboard</Link>
            <a href="#preview" onClick={(e) => { e.preventDefault(); document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.92rem', textDecoration: 'none', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}>Sneak Peek</a>
            <a href="#calculator" onClick={(e) => { e.preventDefault(); document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.92rem', textDecoration: 'none', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}>Calculator</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.92rem', textDecoration: 'none', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}>Capabilities</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.92rem', textDecoration: 'none', padding: '0.45rem 0.9rem', whiteSpace: 'nowrap' }}>FAQ</a>
          </>
        )}
      </nav>

      {/* Right Action Tools */}
      <div className="flex items-center gap-4">
        {toggleTheme && (
          <button onClick={toggleTheme} className="btn btn-secondary" style={{ borderRadius: '50%', width: '38px', height: '38px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--adaptive-white-05)', border: '1px solid var(--border-glass)', cursor: 'pointer', transition: 'all 0.2s ease' }}>
            {theme === 'dark' ? <Sun size={18} color="#facc15" /> : <Moon size={18} color="#475569" />}
          </button>
        )}

        {session ? (
          <div className="flex items-center gap-3">
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
              onClick={handleLogout}
            >
              <LogOut size={16} /> <span className="desktop-only">Disconnect</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/auth" className="text-secondary desktop-only" style={{ textDecoration: 'none', fontWeight: 600, padding: '0.5rem 0.75rem' }}>Login</Link>
            <Link to="/auth" className="btn-white-pill" style={{ padding: '0.55rem 1.4rem', fontSize: '0.88rem' }}>Sign up</Link>
          </div>
        )}
      </div>
    </header>
  );
}
