import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function Terms() {
  return (
    <div className="flex-col" style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-dark)' }}>
      {/* Header - Fixed to always stay on top */}
      <header className="flex justify-between items-center" style={{ padding: '1.5rem 4rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(5, 5, 8, 0.9)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100 }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="QuantStakes Logo" style={{ height: '36px', objectFit: 'contain' }} />
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
          <Sparkles size={24} className="text-success" />
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>QuantStakes Terms of Service</h1>
        </div>

        <div className="glass-panel text-secondary" style={{ lineHeight: '1.8' }}>
          <p style={{ marginBottom: '1.5rem' }}><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '2rem' }}>1. Acceptance of Terms</h3>
          <p style={{ marginBottom: '1.5rem' }}>By accessing or using the QuantStakes analytics terminal ("Service"), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you do not have permission to access the Service.</p>
          
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '2rem' }}>2. Description of Service</h3>
          <p style={{ marginBottom: '1.5rem' }}>QuantStakes provides portfolio management, data visualization, and AI-driven parsing tools for sports betting analytics. We are strictly a software provider. We do not accept wagers, host gambling operations, or facilitate financial transactions related to sports betting.</p>
          
          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '2rem' }}>3. User Accounts</h3>
          <p style={{ marginBottom: '1.5rem' }}>When you create an account, you must provide accurate and complete information. You are solely responsible for maintaining the confidentiality of your account and password. QuantStakes reserves the right to terminate accounts that violate our terms or engage in abusive behavior.</p>

          <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem', marginBottom: '1rem', marginTop: '2rem' }}>4. Disclaimer of Liability</h3>
          <p style={{ marginBottom: '1.5rem' }}>The information provided by QuantStakes is for analytical and entertainment purposes only. We do not guarantee profits. Sports betting involves significant financial risk. QuantStakes is not liable for any financial losses incurred based on the data or insights provided by our terminal.</p>
        </div>
      </div>
    </div>
  );
}
