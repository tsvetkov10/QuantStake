import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="flex-col light-streak-bg" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden', position: 'relative' }}>
      
      {/* Dynamic Moving Speed Streaks & Flare FX */}
      <div className="flowing-speed-container">
        <div className="flowing-beam beam-cyan"></div>
        <div className="flowing-beam beam-magenta"></div>
        <div className="flowing-beam beam-flare"></div>
      </div>

      {/* Navigation Header */}
      <header className="flex justify-between items-center responsive-header-padding" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(4, 7, 20, 0.75)', backdropFilter: 'blur(24px)', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100 }}>
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '56px', objectFit: 'contain' }} />
        </Link>
        
        <nav className="flex gap-10 items-center">
          <Link to="/" className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Home</Link>
          <div className="desktop-only" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link to="/auth" className="text-secondary desktop-only" style={{ textDecoration: 'none', fontWeight: 600, padding: '0.5rem 0.5rem' }}>Login</Link>
          <Link to="/auth" className="btn-white-pill" style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem' }}>Sign up</Link>
        </nav>
      </header>

      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '10rem', paddingBottom: '6rem', position: 'relative', zIndex: 10 }}>
        
        <Link to="/" className="flex items-center gap-2 text-secondary mb-8" style={{ textDecoration: 'none', display: 'inline-flex', fontWeight: 600 }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
        
        <div className="mb-10">
          <h1 className="title-cirform" style={{ fontSize: '3rem', fontWeight: '800' }}>
            QuantStakes <span className="serif-italic-accent">Privacy Policy</span>
          </h1>
        </div>

        <div className="glass-panel text-secondary" style={{ padding: '3.5rem 3rem', background: 'rgba(11, 16, 35, 0.85)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '28px', lineHeight: '1.8', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
          <p style={{ marginBottom: '2rem', color: '#ffffff', fontWeight: 600 }}><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <p style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>Your privacy is critically important to us. At QuantStakes, we have a few fundamental principles:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', color: '#cbd5e1' }}>
            <li style={{ marginBottom: '0.5rem' }}>We don't ask for personal information unless we truly need it.</li>
            <li style={{ marginBottom: '0.5rem' }}>We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
            <li style={{ marginBottom: '0.5rem' }}>We don't sell your financial or portfolio data to third parties.</li>
          </ul>

          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem', fontWeight: 700 }}>Data Security</h3>
          <p style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>We use enterprise-grade PostgreSQL databases secured with strict Row Level Security (RLS) policies. Your ledger and performance history are mathematically isolated.</p>
          
          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem', fontWeight: 700 }}>Information We Collect</h3>
          <p style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>We collect the email address you provide upon registration and the performance data you manually input or upload (via screenshots) to the terminal. Uploaded screenshots are processed in memory and are not permanently stored on our servers unless explicitly requested.</p>
        </div>
      </div>
    </div>
  );
}
