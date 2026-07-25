import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="flex-col" style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-dark)' }}>
      {/* Header - Fixed to always stay on top */}
      <header className="flex justify-between items-center" style={{ padding: '1.5rem 4rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(5, 5, 8, 0.9)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100 }}>
        <div className="flex items-center gap-3">
          <TrendingUp size={36} className="logo-icon" strokeWidth={3} />
          <h1 className="logo-text brand-logo-animated" style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: 0, letterSpacing: '1px', lineHeight: 1 }}>QuantStakes</h1>
        </div>
        <nav className="flex gap-8 items-center landing-nav">
          <Link to="/" className="text-secondary" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500 }}>Home</Link>
          <div style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>
          <Link to="/auth" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>Log In</Link>
          <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Open Account</Link>
        </nav>
      </header>

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '10rem', paddingBottom: '4rem' }}>
        
        <Link to="/" className="flex items-center gap-2 text-secondary mb-8" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp size={24} className="text-success" />
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>QuantStakes Privacy Policy</h1>
        </div>

        <div className="glass-panel text-secondary" style={{ lineHeight: '1.8' }}>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>Last updated: July 2026</p>
          
          <p style={{ marginBottom: '1.5rem' }}>Your privacy is critically important to us. At QuantStakes, we have a few fundamental principles:</p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
            <li>We don't ask for personal information unless we truly need it.</li>
            <li>We don't share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
            <li>We don't sell your financial data to third parties.</li>
          </ul>

          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '2rem' }}>Data Security</h3>
          <p style={{ marginBottom: '1.5rem' }}>We use enterprise-grade PostgreSQL databases secured with strict Row Level Security (RLS) policies. Your ledger and bet history are mathematically isolated. Even our database administrators cannot arbitrarily query your personal betting data.</p>
          
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '2rem' }}>Information We Collect</h3>
          <p style={{ marginBottom: '1.5rem' }}>We collect the email address you provide upon registration and the data you manually input or upload (via screenshots) to the terminal. Uploaded screenshots are processed in memory and are not permanently stored on our servers unless explicitly requested.</p>
        </div>
      </div>
    </div>
  );
}
