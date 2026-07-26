import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, Shield, CheckCircle, Sparkles, Activity, ShieldCheck, Users, CreditCard, TrendingUp, MoreHorizontal } from 'lucide-react';

export default function Landing() {
  // Scroll Reveal Observer for One-Pager Experience
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.12 }
    );

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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
    
    const spotlight = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.08) 0%, transparent 80%)`;
    card.style.backgroundImage = spotlight;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    card.style.backgroundImage = 'none';
  };

  return (
    <div className="flex-col light-streak-bg" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      
      {/* Dynamic Moving Speed Streaks & Flare FX */}
      <div className="flowing-speed-container">
        <div className="flowing-beam beam-cyan"></div>
        <div className="flowing-beam beam-magenta"></div>
        <div className="flowing-beam beam-flare"></div>
      </div>

      {/* Navigation Header */}
      <header className="flex justify-between items-center responsive-header-padding" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(4, 7, 20, 0.75)', backdropFilter: 'blur(24px)', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100 }}>
        <div className="flex items-center gap-3">
          <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '56px', objectFit: 'contain' }} />
        </div>
        
        <nav className="flex gap-10 items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terminal</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Features</a>
          
          <div className="desktop-only" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link to="/auth" className="text-secondary desktop-only" style={{ textDecoration: 'none', fontWeight: 600, padding: '0.5rem 0.5rem' }}>Login</Link>
          <Link to="/auth" className="btn-white-pill" style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem' }}>Sign up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '11rem', paddingBottom: '8rem', width: '100%', minHeight: '88vh' }}>
        
        <div className="hero-cirform-grid responsive-padding" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
          
          {/* Hero Left Column: Headline, Description & White Pill Action */}
          <div className="flex-col reveal-on-scroll" style={{ alignItems: 'flex-start' }}>
            <h1 className="title-cirform mb-6" style={{ textAlign: 'left' }}>
              We create bright <br />
              future <span className="serif-italic-accent">for Portfolio Management</span>
            </h1>

            <p className="text-secondary mb-10" style={{ fontSize: '1.15rem', maxWidth: '540px', lineHeight: '1.7', textAlign: 'left' }}>
              Empowering sports analysts with verified metrics, cryptographic proof, and institutional-grade portfolio tracking.
            </p>

            {/* CTA Action Group: White Pill + Learn More */}
            <div className="flex items-center gap-6 flex-wrap mb-6">
              <Link to="/auth" className="btn-white-pill">
                Open Account
              </Link>

              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>
                Learn more
              </a>
            </div>
          </div>

          {/* Hero Right Column: Floating Financial Metric Glass Card */}
          <div className="flex flex-col items-center justify-center reveal-on-scroll delay-200" style={{ position: 'relative', width: '100%' }}>
            
            {/* Ambient Backlight Glow behind Card */}
            <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 80%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }}></div>

            <div className="fintech-metric-card">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: 500 }}>
                  <TrendingUp size={18} color="#38bdf8" /> Revenue / ROI
                </div>
                <MoreHorizontal size={20} style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }} />
              </div>

              <div style={{ fontSize: '3.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-1.5px', marginBottom: '0.2rem', lineHeight: 1 }}>
                +$10,629
              </div>
              <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '2rem', fontWeight: 500 }}>
                Last 30 days
              </div>

              <div className="flex items-center gap-3" style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '0.75rem 1rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem' }}>
                  +26%
                </span>
                <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  Since previous 30 days
                </span>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* Two Paths Section */}
      <section className="flex-col items-center responsive-padding" style={{ position: 'relative', zIndex: 10 }}>
        <div className="reveal-on-scroll text-center flex-col items-center">
          <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>Choose Your Path</h3>
          <p className="text-secondary mb-12 text-center" style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>Whether you're a sharp analyst proving your edge, or an investor looking for quantitative alpha, QuantStakes is built for you.</p>
        </div>
        
        <div className="features-grid">
          {/* Analyst Path */}
          <div className="glass-card flex-col reveal-on-scroll delay-100" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '3rem', transition: 'all 0.5s ease', cursor: 'default', height: '100%' }}>
            <div style={{ alignSelf: 'flex-start', background: 'rgba(168, 85, 247, 0.1)', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem', pointerEvents: 'none' }}>
              <Sparkles size={32} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold', pointerEvents: 'none', color: 'var(--text-primary)' }}>Become a Quant Analyst</h3>
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.7', pointerEvents: 'none', marginBottom: '2.5rem' }}>
              Upload your portfolio records to parse them into a cryptographic track record. Share your verified winning picks and grow an audience.
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
              <Link to="/auth" className="btn-white-pill" style={{ width: '100%', pointerEvents: 'auto', padding: '1rem', fontSize: '1rem', textAlign: 'center' }}>Start Tracking Edge</Link>
            </div>
          </div>

          {/* Follower Path */}
          <div className="glass-card flex-col reveal-on-scroll delay-200" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '3rem', transition: 'all 0.5s ease', cursor: 'default', height: '100%' }}>
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
              <Link to="/auth" className="btn-white-pill" style={{ width: '100%', pointerEvents: 'auto', padding: '1rem', fontSize: '1rem', textAlign: 'center' }}>Browse Top Analysts</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="flex-col items-center" style={{ padding: '5rem 2rem' }}>
        <h3 className="reveal-on-scroll" style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: 'bold' }}>Platform Capabilities</h3>
        <div className="grid grid-cols-3" style={{ gap: '1.5rem', maxWidth: '1200px', width: '100%' }}>
          
          <div className="glass-card feature-card reveal-on-scroll delay-100" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <BrainCircuit size={24} color="#a855f7" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Smart Record Parsing</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Upload screenshots of your portfolio slips for fast, accurate parsing of odds, teams, and stake values.</p>
          </div>
          
          <div className="glass-card feature-card reveal-on-scroll delay-200" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <ShieldCheck size={24} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Cryptographic Proof</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Sealed portfolio records ensure past metrics cannot be forged, altered, or retroactively edited.</p>
          </div>
          
          <div className="glass-card feature-card reveal-on-scroll delay-300" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <BarChart3 size={24} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>ROI Analytics</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Visualize true return on investment and bankroll trajectory with deep performance charts.</p>
          </div>

          <div className="glass-card feature-card reveal-on-scroll delay-100" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <Users size={24} color="#6366f1" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Analyst Profiles</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Showcase your quantitative edge on public leaderboards built purely on real data.</p>
          </div>

          <div className="glass-card feature-card reveal-on-scroll delay-200" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <CreditCard size={24} color="#FFD700" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Track Record Sharing</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Generate sleek, verified share cards to showcase your winning performance on social channels.</p>
          </div>

          <div className="glass-card feature-card reveal-on-scroll delay-300" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'var(--adaptive-white-10)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <Activity size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Global League Coverage</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Log and analyze performance across NBA, NFL, Premier League, Champions League, and more.</p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'rgba(2, 4, 12, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '5rem 4rem 3rem 4rem' }}>
        <div className="flex justify-between" style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '4rem', flexWrap: 'wrap', gap: '4rem' }}>
          
          <div style={{ maxWidth: '350px' }}>
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '56px', objectFit: 'contain' }} />
            </div>
            <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.8' }}>
              A non-profit sports portfolio management terminal to track, analyze, and maintain cryptographic proof of your performance edge.
            </p>
          </div>

          <div className="flex" style={{ gap: '6rem' }}>
            <div className="flex-col gap-4">
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem', marginBottom: '1rem' }}>Product</h4>
              <Link to="/auth" className="text-secondary" style={{ textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terminal</Link>
              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Features</a>
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
            QuantStakes is a sports portfolio management platform.
          </p>
        </div>
      </footer>
    </div>
  );
}
