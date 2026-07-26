import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, Mail, Shield, CheckCircle, Sparkles, Activity, ShieldCheck, Users, CreditCard, ArrowRight } from 'lucide-react';

export default function Landing() {
  const [sent, setSent] = useState(false);

  // 3D Card Tilt Handler
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    card.style.transition = 'none';
    
    const spotlight = `radial-gradient(circle at ${x}px ${y}px, var(--adaptive-white-10) 0%, transparent 80%)`;
    card.style.backgroundImage = spotlight;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    card.style.backgroundImage = 'none';
  };

  return (
    <div className="flex-col" style={{ minHeight: '100vh', width: '100%', backgroundColor: '#030308', overflowX: 'hidden' }}>
      
      {/* Navigation Header */}
      <header className="flex justify-between items-center responsive-header-padding" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(3, 3, 8, 0.85)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100 }}>
        <div className="flex items-center gap-3">
          <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '56px', objectFit: 'contain' }} />
        </div>
        <nav className="flex gap-10 items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="nav-link-active desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' }}>Terminal</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Features</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Contact</a>
          
          <div className="desktop-only" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link to="/auth" className="btn btn-secondary desktop-only" style={{ padding: '0.5rem 1rem', borderRadius: '20px' }}>Log In</Link>
          <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1.4rem', borderRadius: '20px', fontWeight: '700' }}>Open Account</Link>
        </nav>
      </header>

      {/* Hero Section - Matching Screenshot Layout */}
      <section style={{ position: 'relative', paddingTop: '10rem', paddingBottom: '14rem', background: 'radial-gradient(ellipse at 80% 20%, #110d2b 0%, #05040a 50%, #000000 100%)', width: '100%', overflow: 'hidden' }}>
        
        {/* Shooting Stars background effect */}
        <div className="shooting-star" style={{ top: '18%', left: '35%' }}></div>
        <div className="shooting-star" style={{ top: '25%', right: '20%', width: '120px' }}></div>
        <div className="shooting-star" style={{ top: '60%', left: '15%' }}></div>

        {/* Floating Space Planet Orbs */}
        <div style={{ position: 'absolute', top: '22%', right: '38%', width: '60px', height: '60px', borderRadius: '50%', background: 'radial-gradient(circle, #2a1f5c 0%, #0d0a21 100%)', boxShadow: 'inset 0 -5px 12px rgba(0,0,0,0.8), 0 0 20px rgba(139, 92, 246, 0.2)', opacity: 0.8, pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', top: '65%', right: '12%', width: '40px', height: '40px', borderRadius: '50%', background: 'radial-gradient(circle, #1a2b4c 0%, #071021 100%)', boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.8)', opacity: 0.6, pointerEvents: 'none' }}></div>

        <div className="hero-split-grid responsive-padding" style={{ paddingTop: '2rem', paddingBottom: '0' }}>
          
          {/* Hero Left Column: Headline, Description & Pill CTA */}
          <div className="flex-col hero-title-left" style={{ alignItems: 'flex-start' }}>
            <h1 className="hero-title-large mb-6" style={{ textAlign: 'left' }}>
              Boost <br />
              <span className="hero-accent-text">
                Your Edge
                <div className="hero-accent-underline"></div>
              </span>
            </h1>

            <p className="text-secondary mb-10" style={{ fontSize: '1.2rem', maxWidth: '540px', lineHeight: '1.7', textAlign: 'left' }}>
              QuantStakes is a non-profit platform for tracking your sports portfolio, verifying your performance, and maintaining unforgeable cryptographic proof of your edge.
            </p>

            {/* Pill CTA Button (Matching Screenshot) */}
            <Link to="/auth" className="pill-cta-button">
              <span>Boost Now</span>
              <div className="pill-cta-arrow">
                <ArrowRight size={20} />
              </div>
            </Link>
          </div>

          {/* Hero Right Column: Vector Rocket Illustration */}
          <div className="flex justify-center items-center" style={{ position: 'relative', width: '100%', height: '100%', minHeight: '380px' }}>
            <svg viewBox="0 0 500 500" style={{ width: '100%', height: 'auto', maxWidth: '480px', filter: 'drop-shadow(0 20px 40px rgba(6, 182, 212, 0.25))' }}>
              <defs>
                <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <linearGradient id="rocketWing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="flame" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Flame Trails */}
              <path d="M 170 330 Q 120 400 80 430 Q 150 390 190 350 Z" fill="url(#flame)" opacity="0.8" />
              <path d="M 180 340 Q 140 430 110 470 Q 170 410 200 360 Z" fill="#06b6d4" opacity="0.6" />

              {/* Vector Rocket Body */}
              <g transform="rotate(-35 250 250)">
                {/* Back Fins */}
                <path d="M 200 320 L 140 380 L 190 350 Z" fill="url(#rocketWing)" />
                <path d="M 300 320 L 360 380 L 310 350 Z" fill="url(#rocketWing)" />
                
                {/* Main Body Hull */}
                <path d="M 250 100 C 310 200 310 300 290 340 L 210 340 C 190 300 190 200 250 100 Z" fill="url(#rocketBody)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                
                {/* Nose Cone Accent */}
                <path d="M 250 100 C 275 140 275 170 275 180 L 225 180 C 225 170 225 140 250 100 Z" fill="#ffffff" opacity="0.9" />

                {/* Windows */}
                <circle cx="250" cy="220" r="22" fill="#090a14" stroke="#ffffff" strokeWidth="4" />
                <circle cx="250" cy="220" r="14" fill="#38bdf8" opacity="0.8" />

                <circle cx="250" cy="280" r="16" fill="#090a14" stroke="#ffffff" strokeWidth="3" />
                <circle cx="250" cy="280" r="10" fill="#38bdf8" opacity="0.8" />
              </g>
            </svg>
          </div>
        </div>

        {/* Fluid Multi-Layer Wave Gradients (Matching Screenshot Bottom) */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', overflow: 'hidden', lineHeight: 0, zIndex: 5 }}>
          <svg viewBox="0 0 1200 180" preserveAspectRatio="none" style={{ position: 'relative', display: 'block', width: '100%', height: '140px' }}>
            <defs>
              <linearGradient id="waveGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.9" />
                <stop offset="35%" stopColor="#a855f7" stopOpacity="0.85" />
                <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
              </linearGradient>
            </defs>
            {/* Flowing Organic Wave Path */}
            <path d="M0,80 C200,160 450,20 700,90 C950,160 1100,50 1200,80 L1200,180 L0,180 Z" fill="url(#waveGradLeft)"></path>
            <path d="M0,110 C300,40 600,150 900,80 C1050,45 1150,110 1200,130 L1200,180 L0,180 Z" fill="#030308" opacity="0.95"></path>
          </svg>
        </div>

      </section>

      {/* Two Paths Section */}
      <section className="flex-col items-center responsive-padding" style={{ position: 'relative', zIndex: 10 }}>
        <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>Choose Your Path</h3>
        <p className="text-secondary mb-12 text-center" style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>Whether you're a sharp bettor proving your edge, or an investor looking for quantitative alpha, QuantStakes is built for you.</p>
        
        <div className="features-grid">
          {/* Analyst Path */}
          <div className="glass-card flex-col" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '3rem', transition: 'all 0.5s ease', cursor: 'default', height: '100%' }}>
            <div style={{ alignSelf: 'flex-start', background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem', pointerEvents: 'none' }}>
              <Sparkles size={32} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold', pointerEvents: 'none', color: 'var(--text-primary)' }}>Become a Quant Analyst</h3>
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.7', pointerEvents: 'none', marginBottom: '2.5rem' }}>
              Upload your slips to parse them into a cryptographic track record. Share your verified winning picks and grow an audience.
            </p>
            <ul className="flex-col flex-grow" style={{ pointerEvents: 'none', padding: 0, margin: 0, listStyle: 'none', marginBottom: '3rem' }}>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="#a855f7" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Build an unforgeable performance record</span>
              </li>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="#a855f7" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Set custom portfolio management goals</span>
              </li>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="#a855f7" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>100% free non-profit platform</span>
              </li>
            </ul>
            <div style={{ marginTop: 'auto' }}>
              <Link to="/auth" className="btn" style={{ 
                width: '100%', pointerEvents: 'auto', padding: '1.2rem', fontSize: '1.05rem', fontWeight: '600',
                background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 20px rgba(168, 85, 247, 0.3)',
                borderRadius: '12px'
              }}>Start Tracking Edge</Link>
            </div>
          </div>

          {/* Follower Path */}
          <div className="glass-card flex-col" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '3rem', transition: 'all 0.5s ease', cursor: 'default', height: '100%' }}>
            <div style={{ alignSelf: 'flex-start', background: 'rgba(6, 182, 212, 0.1)', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem', pointerEvents: 'none' }}>
              <Users size={32} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold', pointerEvents: 'none', color: 'var(--text-primary)' }}>Become an Investor</h3>
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.7', pointerEvents: 'none', marginBottom: '2.5rem' }}>
              Browse the global leaderboard to find proven analysts with verified ROI and cryptographic proof of past results.
            </p>
            <ul className="flex-col flex-grow" style={{ pointerEvents: 'none', padding: 0, margin: 0, listStyle: 'none', marginBottom: '3rem' }}>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Follow analysts with proven edge</span>
              </li>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Real-time portfolio notifications</span>
              </li>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Unforgeable cryptographic performance</span>
              </li>
            </ul>
            <div style={{ marginTop: 'auto' }}>
              <Link to="/auth" className="btn" style={{ 
                width: '100%', pointerEvents: 'auto', padding: '1.2rem', fontSize: '1.05rem', fontWeight: '600',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: '#ffffff',
                border: 'none',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)',
                borderRadius: '12px'
              }}>Browse Top Analysts</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="flex-col items-center" style={{ padding: '5rem 2rem' }}>
        <h3 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: 'bold' }}>Platform Capabilities</h3>
        <div className="grid grid-cols-3" style={{ gap: '1.5rem', maxWidth: '1200px', width: '100%' }}>
          
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <BrainCircuit size={24} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Smart Slip Parsing</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Upload screenshots of your bet slips for fast, accurate parsing of odds, teams, and stake values.</p>
          </div>
          
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <ShieldCheck size={24} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Cryptographic Proof</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Sealed slip records ensure past bets cannot be forged, altered, or retroactively edited.</p>
          </div>
          
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <BarChart3 size={24} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>ROI Analytics</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Visualize true return on investment and bankroll trajectory with deep performance charts.</p>
          </div>

          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <Users size={24} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Analyst Profiles</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Showcase your quantitative edge on public leaderboards built purely on real data.</p>
          </div>

          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <CreditCard size={24} color="#FFD700" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Track Record Sharing</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Generate sleek, verified share cards to showcase your winning bets on social channels.</p>
          </div>

          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'var(--adaptive-white-10)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <Activity size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Global League Coverage</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Log and analyze bets across NBA, NFL, Premier League, Champions League, and more.</p>
          </div>

        </div>
      </section>

      {/* Inline Contact Section */}
      <section id="contact" style={{ padding: '6rem 2rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Mail size={28} className="text-success" />
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>Contact Support</h2>
          </div>
          <p className="text-secondary text-center mb-12" style={{ fontSize: '1.2rem' }}>Have a question or feedback for QuantStakes? Send us a message.</p>

          <div className="grid grid-cols-2" style={{ gap: '5rem', alignItems: 'start' }}>
            
            <div className="flex-col gap-6 justify-center">
              <div className="glass-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ background: 'var(--adaptive-white-04)', padding: '2.5rem', transition: 'all 0.5s ease' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-primary)', pointerEvents: 'none' }}>About QuantStakes</h3>
                <p className="text-secondary" style={{ marginBottom: '1.5rem', lineHeight: '1.6', pointerEvents: 'none' }}>A non-profit platform created for sports portfolio management, maintaining code, website architecture, and bet-tracking APIs.</p>
                <div className="flex items-center gap-3 text-secondary" style={{ fontSize: '1.1rem', pointerEvents: 'none' }}>
                  <BarChart3 size={20} /> Data-Driven & Open
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden', background: 'rgba(10, 10, 16, 0.85)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '24px' }}>
              {sent ? (
                <div className="flex-col items-center justify-center text-center h-full" style={{ padding: '2rem', position: 'relative', zIndex: 1 }}>
                  <CheckCircle size={56} className="text-success mb-6" />
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff' }}>Message Sent</h3>
                  <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Thank you for reaching out! We'll be in touch soon.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex-col gap-6" style={{ position: 'relative', zIndex: 1 }}>
                  <div>
                    <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Name</label>
                    <input type="text" className="input-field" placeholder="Your Name" required style={{ background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }} />
                  </div>
                  <div>
                    <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                    <input type="email" className="input-field" placeholder="name@example.com" required style={{ background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }} />
                  </div>
                  <div>
                    <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Message</label>
                    <textarea className="input-field" placeholder="How can we help?" required rows="4" style={{ resize: 'vertical', background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }}></textarea>
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: '700', background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'rgba(0, 0, 0, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '5rem 4rem 3rem 4rem' }}>
        <div className="flex justify-between" style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '4rem', flexWrap: 'wrap', gap: '4rem' }}>
          
          <div style={{ maxWidth: '350px' }}>
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '56px', objectFit: 'contain' }} />
            </div>
            <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
              A non-profit sports portfolio management terminal to track, analyze, and maintain cryptographic proof of your betting edge.
            </p>
          </div>

          <div className="flex" style={{ gap: '6rem' }}>
            <div className="flex-col gap-4">
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '1rem' }}>Product</h4>
              <Link to="/auth" className="text-secondary" style={{ textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terminal</Link>
              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Features</a>
            </div>

            <div className="flex-col gap-4">
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '1rem' }}>Company</h4>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Contact</a>
            </div>

            <div className="flex-col gap-4">
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '1rem' }}>Legal</h4>
              <Link to="/terms" className="text-secondary" style={{ textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terms of Service</Link>
              <Link to="/privacy" className="text-secondary" style={{ textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap' }}>
          <p className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
            © {new Date().getFullYear()} QuantStakes. All rights reserved. Non-profit platform. <br/>
            QuantStakes is not a sportsbook and does not accept wagers.
          </p>
          <div className="flex items-center gap-3 text-secondary" style={{ fontSize: '0.85rem' }}>
            <Shield size={16} color="var(--success)" /> SECURE PLATFORM
          </div>
        </div>
      </footer>
    </div>
  );
}
