import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Terms() {
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
            QuantStakes <span className="serif-italic-accent">Terms of Service</span>
          </h1>
        </div>

        <div className="glass-panel text-secondary" style={{ padding: '3.5rem 3rem', background: 'rgba(11, 16, 35, 0.85)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '28px', lineHeight: '1.8', boxShadow: '0 30px 60px rgba(0,0,0,0.6)' }}>
          <p style={{ marginBottom: '2rem', color: '#ffffff', fontWeight: 600 }}><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem', fontWeight: 700 }}>1. Acceptance of Terms</h3>
          <p style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>By accessing or using the QuantStakes analytics terminal ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.</p>
          
          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem', fontWeight: 700 }}>2. Description of Service</h3>
          <p style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>QuantStakes provides sports portfolio management, performance data visualization, and automated record parsing tools. We are strictly a non-profit software platform. We do not accept wagers, host gambling operations, or facilitate financial gambling transactions.</p>
          
          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem', fontWeight: 700 }}>3. User Accounts</h3>
          <p style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>When you create an account, you must provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account and password. QuantStakes reserves the right to terminate accounts that violate our terms or engage in abusive behavior.</p>

          <h3 style={{ color: '#ffffff', fontSize: '1.3rem', marginBottom: '1rem', marginTop: '2rem', fontWeight: 700 }}>4. Disclaimer of Liability</h3>
          <p style={{ marginBottom: '1.5rem', color: '#cbd5e1' }}>The information provided by QuantStakes is for quantitative analytical and tracking purposes only. We do not guarantee financial returns or sports outcomes. QuantStakes is not liable for any decisions or actions taken based on data or insights provided by our terminal.</p>
        </div>
      </div>
    </div>
  );
}
