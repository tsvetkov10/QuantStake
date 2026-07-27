import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, History, Trophy, PlusCircle, Wrench, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HeaderNav({ session, profile, isMock }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <>
      <header className="flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: '#040714', position: 'fixed', top: 0, left: 0, width: '100%', height: '76px', zIndex: 1000, padding: '0 1.5rem' }}>
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '48px', objectFit: 'contain', cursor: 'pointer' }} />
        </Link>

        {/* Center Navigation Bar (Desktop Only) */}
        <nav className="flex items-center gap-2 desktop-only" style={{ overflowX: 'auto' }}>
          <Link 
            to="/dashboard" 
            style={{ 
              color: isLinkActive('/dashboard') ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.92rem',
              textDecoration: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              background: isLinkActive('/dashboard') ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Dashboard
          </Link>

          <Link 
            to="/history" 
            style={{ 
              color: isLinkActive('/history') ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.92rem',
              textDecoration: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              background: isLinkActive('/history') ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            History
          </Link>

          <Link 
            to="/leaderboard" 
            style={{ 
              color: isLinkActive('/leaderboard') ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.92rem',
              textDecoration: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              background: isLinkActive('/leaderboard') ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Leaderboard
          </Link>

          <Link 
            to="/add" 
            style={{ 
              color: isLinkActive('/add') ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.92rem',
              textDecoration: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              background: isLinkActive('/add') ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Log Entry
          </Link>

          <Link 
            to="/tools" 
            style={{ 
              color: isLinkActive('/tools') ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '600',
              fontSize: '0.92rem',
              textDecoration: 'none',
              padding: '0.45rem 0.95rem',
              borderRadius: '8px',
              background: isLinkActive('/tools') ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'transparent',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            Tools
          </Link>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {session ? (
            <div className="flex items-center gap-2">
              <Link to="/settings" style={{ textDecoration: 'none' }}>
                <div 
                  className="flex items-center" 
                  style={{ gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '0.35rem 0.75rem 0.35rem 0.35rem', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                >
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: profile?.avatar_url ? `url(${profile.avatar_url}) center/cover` : 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontWeight: 'bold', fontSize: '0.85rem', flexShrink: 0, overflow: 'hidden' }}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{(profile?.username?.[0] || session.user?.email?.[0] || 'U').toUpperCase()}</span>
                    )}
                  </div>
                  <span className="desktop-only" style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {profile?.username || session.user?.email?.split('@')[0]}
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="text-secondary desktop-only" style={{ textDecoration: 'none', fontWeight: 600, padding: '0.5rem 0.75rem' }}>Login</Link>
              <Link to="/auth" className="btn-white-pill" style={{ padding: '0.55rem 1.4rem', fontSize: '0.88rem' }}>Sign up</Link>
            </div>
          )}

          {/* Mobile Only Hamburger Menu Button (Right next to profile) */}
          <button
            className="mobile-only flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: mobileMenuOpen ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: `1px solid ${mobileMenuOpen ? '#38bdf8' : 'rgba(255, 255, 255, 0.12)'}`,
              color: '#ffffff',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              cursor: 'pointer',
              marginLeft: '4px',
              transition: 'all 0.2s ease'
            }}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} color="#38bdf8" /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Glass Slide-Down Navigation Menu */}
      {mobileMenuOpen && (
        <div 
          className="mobile-only"
          style={{
            position: 'fixed',
            top: '76px',
            left: 0,
            width: '100%',
            background: 'rgba(4, 7, 20, 0.96)',
            backdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9)',
            padding: '1.25rem 1.5rem',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}
        >
          {[
            { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/history', label: 'History', icon: History },
            { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
            { path: '/add', label: 'Log Entry', icon: PlusCircle },
            { path: '/tools', label: 'Tools & Calculators', icon: Wrench },
            { path: '/settings', label: 'Profile Settings', icon: Settings },
          ].map(item => {
            const Icon = item.icon;
            const active = isLinkActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '0.85rem 1.25rem',
                  borderRadius: '12px',
                  color: active ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: active ? '700' : '500',
                  background: active ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(168, 85, 247, 0.2))' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${active ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.06)'}`,
                  textDecoration: 'none',
                  fontSize: '1rem'
                }}
              >
                <Icon size={20} color={active ? '#38bdf8' : 'rgba(255,255,255,0.6)'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
