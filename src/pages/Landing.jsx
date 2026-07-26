import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, Shield, CheckCircle, Sparkles, Activity, ShieldCheck, Users, CreditCard, TrendingUp, MoreHorizontal, ArrowRight, Lock, Award, Eye, FileText, ChevronDown, ChevronUp, Calculator, HelpCircle, Sliders, Zap, Star } from 'lucide-react';
import { playUiSound } from '../utils/soundEffects';

export default function Landing() {
  // Animated Revenue Counter (0 -> 10,000)
  const [revenue, setRevenue] = useState(0);
  const targetRevenue = 10000;

  // Interactive Calculator State
  const [calcBankroll, setCalcBankroll] = useState(2500);
  const [calcRoi, setCalcRoi] = useState(15);

  // Expandable Features State
  const [expandedFeature, setExpandedFeature] = useState(null);

  // Expandable FAQ State
  const [openFaq, setOpenFaq] = useState(0); // First FAQ open by default

  // Global UI Click Listener for Interactive Buttons
  useEffect(() => {
    const handleGlobalClick = (e) => {
      const target = e.target.closest('button, a, input[type="range"], .btn-white-pill, .glass-card');
      if (target) {
        playUiSound('click');
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    let startTimestamp = null;
    const duration = 2400; // 2.4s count up

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setRevenue(Math.floor(easeOut * targetRevenue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, []);

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
    if (!card.classList.contains('reveal-visible')) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -2;
    const rotateY = ((x - centerX) / centerX) * 2;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    card.style.transition = 'transform 0.15s ease-out';
    
    const spotlight = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.08) 0%, transparent 80%)`;
    card.style.backgroundImage = spotlight;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
    card.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)';
    card.style.backgroundImage = 'none';
  };

  // Compound Calculator calculations
  const calc3Months = Math.round(calcBankroll * Math.pow(1 + calcRoi / 100, 3));
  const calc6Months = Math.round(calcBankroll * Math.pow(1 + calcRoi / 100, 6));
  const calc12Months = Math.round(calcBankroll * Math.pow(1 + calcRoi / 100, 12));

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
        
        <nav className="flex gap-8 items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terminal</a>
          <a href="#preview" onClick={(e) => { e.preventDefault(); document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Sneak Peek</a>
          <a href="#calculator" onClick={(e) => { e.preventDefault(); document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Calculator</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Capabilities</a>
          <a href="#faq" onClick={(e) => { e.preventDefault(); document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>FAQ</a>
          
          <div className="desktop-only" style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
          <Link to="/auth" className="text-secondary desktop-only" style={{ textDecoration: 'none', fontWeight: 600, padding: '0.5rem 0.5rem' }}>Login</Link>
          <Link to="/auth" className="btn-white-pill" style={{ padding: '0.55rem 1.4rem', fontSize: '0.9rem' }}>Sign up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '10.5rem', paddingBottom: '5rem', width: '100%', minHeight: '88vh' }}>
        
        <div className="hero-cirform-grid responsive-padding" style={{ paddingTop: '1rem', paddingBottom: '3rem' }}>
          
          {/* Hero Left Column: Headline, Description & White Pill Action */}
          <div className="flex-col reveal-on-scroll" style={{ alignItems: 'flex-start' }}>
            <h1 className="title-cirform mb-6" style={{ textAlign: 'left', letterSpacing: '-2px' }}>
              We create bright <br />
              future for Portfolio Management
            </h1>

            <p className="text-secondary mb-10" style={{ fontSize: '1.15rem', maxWidth: '540px', lineHeight: '1.7', textAlign: 'left' }}>
              Empowering sports analysts with verified metrics, cryptographic proof, and institutional-grade portfolio tracking.
            </p>

            {/* CTA Action Group: White Pill + Learn More */}
            <div className="flex items-center gap-6 flex-wrap mb-8">
              <Link to="/auth" className="btn-white-pill">
                Open Account
              </Link>

              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>

              <a href="#preview" onClick={(e) => { e.preventDefault(); document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>
                Explore Terminal
              </a>
            </div>

            {/* Hero Trust Badges Row */}
            <div className="flex items-center gap-6 flex-wrap" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
              <span className="flex items-center gap-2"><CheckCircle size={15} color="#34d399" /> 100% Mathematical Proof</span>
              <span className="flex items-center gap-2"><CheckCircle size={15} color="#38bdf8" /> Zero Fake Records</span>
              <span className="flex items-center gap-2"><CheckCircle size={15} color="#a855f7" /> Instant Slip Parser</span>
            </div>
          </div>

          {/* Hero Right Column: Floating Financial Metric Glass Card */}
          <div className="flex flex-col items-center justify-center reveal-on-scroll delay-200" style={{ position: 'relative', width: '100%' }}>
            
            {/* Ambient Backlight Glow behind Card */}
            <div style={{ position: 'absolute', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.4) 0%, rgba(168, 85, 247, 0.2) 60%, transparent 80%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }}></div>

            {/* Floating Top Badge */}
            <div className="desktop-only" style={{ position: 'absolute', top: '-25px', right: '-10px', zIndex: 10, background: 'rgba(11, 16, 35, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '0.6rem 1.2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'float 4s ease-in-out infinite' }}>
              <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#38bdf8' }}>
                <Zap size={16} color="#38bdf8" /> Live Edge: +34.2% ROI
              </div>
            </div>

            {/* Floating Bottom Badge */}
            <div className="desktop-only" style={{ position: 'absolute', bottom: '-25px', left: '-10px', zIndex: 10, background: 'rgba(11, 16, 35, 0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(52, 211, 153, 0.4)', padding: '0.6rem 1.2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', animation: 'float 5s ease-in-out infinite' }}>
              <div className="flex items-center gap-2" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399' }}>
                <ShieldCheck size={16} color="#34d399" /> SHA-256 Block Sealed
              </div>
            </div>

            <div className="fintech-metric-card" style={{ position: 'relative', zIndex: 5 }}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', fontWeight: 500 }}>
                  <TrendingUp size={18} color="#38bdf8" /> Revenue / ROI
                </div>
                <MoreHorizontal size={20} style={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }} />
              </div>

              {/* Animated 0 to 10,000 Revenue Counter */}
              <div style={{ fontSize: '3.4rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-1.5px', marginBottom: '0.2rem', lineHeight: 1 }}>
                +${revenue.toLocaleString()}
              </div>
              <div className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '1.5rem', fontWeight: 500 }}>
                Last 30 days verified growth
              </div>

              {/* Mini Sparkline Graph inside Card */}
              <div style={{ height: '50px', width: '100%', marginBottom: '1.5rem' }}>
                <svg viewBox="0 0 300 50" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="heroSparkline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 0,45 Q 50,35 100,28 T 200,18 T 300,5 L 300,50 L 0,50 Z" fill="url(#heroSparkline)" />
                  <path d="M 0,45 Q 50,35 100,28 T 200,18 T 300,5" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="300" cy="5" r="4" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)" />
                </svg>
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

      {/* PERSISTENT FIXED FOOTER TICKER: Live Verification Marquee Ticker */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'rgba(4, 7, 20, 0.92)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(56, 189, 248, 0.25)', boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.8)', padding: '0.75rem 0', overflow: 'hidden', whiteSpace: 'nowrap', zIndex: 9999 }}>
        <div className="marquee-content flex items-center gap-12" style={{ display: 'inline-flex', animation: 'marquee 30s linear infinite' }}>
          <span className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}><Zap size={14} color="#34d399" /> @alex_vance verified +€1,551 payout on Polymarket</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}><ShieldCheck size={14} color="#38bdf8" /> SHA-256 Block #948202 Sealed</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}><Zap size={14} color="#a855f7" /> @elena_dimitrova hit +536.9% ROI milestone</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}><FileText size={14} color="#34d399" /> Slip OCR parsed in 0.38s</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}><Zap size={14} color="#FFD700" /> @marcus_devlin verified 14-game win streak</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}><ShieldCheck size={14} color="#34d399" /> Zero fake records verified</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span className="flex items-center gap-2" style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600 }}><Zap size={14} color="#34d399" /> @alex_vance verified +€1,551 payout on Polymarket</span>
        </div>
      </div>

      {/* SECTION: Dashboard Terminal Sneak Peek */}
      <section id="preview" className="flex-col items-center responsive-padding" style={{ padding: '5rem 2rem 6rem 2rem', position: 'relative', zIndex: 10, scrollMarginTop: '100px' }}>
        <div className="reveal-on-scroll text-center flex-col items-center mb-12">
          <h2 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: '1rem' }}>
            Built Like a Quantitative Trading Desk
          </h2>
          <p className="text-secondary text-center" style={{ fontSize: '1.15rem', maxWidth: '680px', lineHeight: '1.7' }}>
            Explore how QuantStakes tracks your bankroll trajectory, parses bet slips, and generates immutable cryptographic proof of performance.
          </p>
        </div>

        {/* Mock Dashboard Terminal Window */}
        <div className="reveal-on-scroll delay-100" style={{ maxWidth: '1200px', width: '100%', background: 'rgba(11, 16, 35, 0.9)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '24px', boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(56, 189, 248, 0.12)', overflow: 'hidden' }}>
          
          {/* Terminal Window Header Bar */}
          <div className="flex justify-between items-center" style={{ padding: '1rem 1.5rem', background: 'rgba(4, 7, 20, 0.8)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="flex items-center gap-2">
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
              <span className="text-secondary" style={{ marginLeft: '1rem', fontSize: '0.85rem', fontWeight: 600 }}>QuantStakes Terminal v2.4</span>
            </div>
          </div>

          {/* Terminal Body */}
          <div style={{ padding: '2.5rem' }}>
            
            {/* Top Stat Row */}
            <div className="grid grid-cols-4 gap-6 mb-8" style={{ gap: '1.25rem' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Net Profit</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', margin: '0.3rem 0 0 0' }}>+$24,850.00</h4>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Yield (ROI)</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', margin: '0.3rem 0 0 0' }}>+34.2%</h4>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Win Rate</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', margin: '0.3rem 0 0 0' }}>68.4%</h4>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '1.25rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Sharpe Ratio</span>
                <h4 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', margin: '0.3rem 0 0 0' }}>2.84</h4>
              </div>
            </div>

            {/* Live Ledger Table */}
            <div style={{ background: 'rgba(5, 9, 22, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '1.25rem', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ color: 'rgba(255,255,255,0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '0.6rem 0' }}>EVENT</th>
                    <th>SELECTION</th>
                    <th>ODDS</th>
                    <th>STAKE</th>
                    <th>PROFIT</th>
                    <th>LEDGER STATUS</th>
                  </tr>
                </thead>
                <tbody style={{ color: '#e2e8f0' }}>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.8rem 0', fontWeight: 600 }}>NBA Playoffs</td>
                    <td>Boston Celtics ML</td>
                    <td>1.95</td>
                    <td>$500</td>
                    <td style={{ color: '#34d399', fontWeight: 700 }}>+$475.00</td>
                    <td><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>VERIFIED</span></td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.8rem 0', fontWeight: 600 }}>Premier League</td>
                    <td>Arsenal vs Chelsea Over 2.5</td>
                    <td>2.10</td>
                    <td>$400</td>
                    <td style={{ color: '#34d399', fontWeight: 700 }}>+$440.00</td>
                    <td><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>VERIFIED</span></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.8rem 0', fontWeight: 600 }}>NFL Regular Season</td>
                    <td>Kansas City Chiefs -3.5</td>
                    <td>1.90</td>
                    <td>$600</td>
                    <td style={{ color: '#34d399', fontWeight: 700 }}>+$540.00</td>
                    <td><span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700 }}>VERIFIED</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </section>

      {/* INTERACTIVE SECTION: Bankroll Compound Growth Calculator */}
      <section id="calculator" className="flex-col items-center responsive-padding" style={{ padding: '5rem 2rem 6rem 2rem', position: 'relative', zIndex: 10, scrollMarginTop: '100px' }}>
        <div className="reveal-on-scroll text-center flex-col items-center mb-12">
          <h2 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: '1rem' }}>
            Project Your Bankroll Growth
          </h2>
          <p className="text-secondary text-center" style={{ fontSize: '1.15rem', maxWidth: '640px', lineHeight: '1.7' }}>
            Adjust the bankroll and monthly ROI sliders to see how compounding yield expands your portfolio over 3, 6, and 12 months.
          </p>
        </div>

        {/* Calculator Widget Card */}
        <div className="reveal-on-scroll delay-100" style={{ maxWidth: '1000px', width: '100%', background: 'rgba(11, 16, 35, 0.85)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '24px', padding: '3rem', boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}>
          <div className="grid grid-cols-2 gap-12" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
            
            {/* Sliders Left Column */}
            <div className="flex-col gap-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Initial Bankroll</label>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>${calcBankroll.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="500" 
                  max="25000" 
                  step="500" 
                  value={calcBankroll} 
                  onChange={e => setCalcBankroll(Number(e.target.value))}
                  style={{ width: '100%', height: '8px', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-secondary" style={{ fontSize: '0.95rem', fontWeight: 600 }}>Target Monthly Yield (ROI)</label>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>+{calcRoi}% / mo</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="35" 
                  step="1" 
                  value={calcRoi} 
                  onChange={e => setCalcRoi(Number(e.target.value))}
                  style={{ width: '100%', height: '8px', accentColor: '#34d399', cursor: 'pointer' }}
                />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
                  💡 <strong>Kelly Criterion Principle:</strong> Controlled position sizing preserves bankroll capital while maximizing logarithmic growth rate over long horizons.
                </span>
              </div>
            </div>

            {/* Results Right Column */}
            <div className="flex-col justify-between gap-4">
              <div style={{ background: 'rgba(5, 9, 22, 0.7)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '18px', padding: '1.5rem' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>3 Months Compounded</span>
                  <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 700 }}>+${(calc3Months - calcBankroll).toLocaleString()} profit</span>
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>${calc3Months.toLocaleString()}</h3>
              </div>

              <div style={{ background: 'rgba(5, 9, 22, 0.7)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: '18px', padding: '1.5rem' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>6 Months Compounded</span>
                  <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 700 }}>+${(calc6Months - calcBankroll).toLocaleString()} profit</span>
                </div>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>${calc6Months.toLocaleString()}</h3>
              </div>

              <div style={{ background: 'rgba(5, 9, 22, 0.7)', border: '1px solid rgba(52, 211, 153, 0.35)', borderRadius: '18px', padding: '1.5rem' }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: 600 }}>12 Months Compounded</span>
                  <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 700 }}>+${(calc12Months - calcBankroll).toLocaleString()} profit</span>
                </div>
                <h3 style={{ fontSize: '2.4rem', fontWeight: 900, color: '#34d399', margin: 0, textShadow: '0 0 15px rgba(52, 211, 153, 0.3)' }}>${calc12Months.toLocaleString()}</h3>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* NEW SECTION 2: How It Works (3-Step Workflow) */}
      <section id="how-it-works" style={{ padding: '6rem 2rem', background: 'rgba(4, 7, 20, 0.4)', position: 'relative', zIndex: 10, scrollMarginTop: '100px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="reveal-on-scroll text-center flex-col items-center mb-16">
            <h2 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: '1rem' }}>
              How QuantStakes Works
            </h2>
            <p className="text-secondary text-center" style={{ fontSize: '1.15rem', maxWidth: '600px', lineHeight: '1.7' }}>
              Three simple steps to transform your raw predictions into an institutional-grade, verifiable track record.
            </p>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
            
            {/* Step 1 */}
            <div className="glass-card reveal-on-scroll delay-100" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2.5rem', transition: 'all 0.5s ease' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(56, 189, 248, 0.3)', marginBottom: '1rem', lineHeight: 1 }}>01</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', pointerEvents: 'none' }}>Log Portfolio Records</h3>
              <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.7', pointerEvents: 'none', margin: 0 }}>
                Upload screenshot slips or log predictions manually. Our smart parser extracts odds, teams, and stake values automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card reveal-on-scroll delay-200" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2.5rem', transition: 'all 0.5s ease' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(168, 85, 247, 0.3)', marginBottom: '1rem', lineHeight: 1 }}>02</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', pointerEvents: 'none' }}>Cryptographic Proof</h3>
              <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.7', pointerEvents: 'none', margin: 0 }}>
                Past records are sealed using immutable mathematical hashes. Once logged, past history cannot be altered or retroactively deleted.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card reveal-on-scroll delay-300" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2.5rem', transition: 'all 0.5s ease' }}>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'rgba(52, 211, 153, 0.3)', marginBottom: '1rem', lineHeight: 1 }}>03</div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem', pointerEvents: 'none' }}>Monetize & Scale Edge</h3>
              <p className="text-secondary" style={{ fontSize: '0.95rem', lineHeight: '1.7', pointerEvents: 'none', margin: 0 }}>
                Generate high-res share cards, climb global leaderboards, and build a subscriber base with 100% verified ROI.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* NEW SECTION 3: Verified Analyst Showcase */}
      <section style={{ padding: '6rem 2rem', position: 'relative', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div className="reveal-on-scroll text-center flex-col items-center mb-16">
            <h2 style={{ fontSize: '2.8rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center', marginBottom: '1rem' }}>
              Top Verified Analysts
            </h2>
            <p className="text-secondary text-center" style={{ fontSize: '1.15rem', maxWidth: '600px', lineHeight: '1.7' }}>
              Ranked purely on mathematical performance, return on investment, and verified bankroll growth.
            </p>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
            
            {/* Analyst 1 */}
            <div className="glass-card reveal-on-scroll delay-100" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2.2rem', transition: 'all 0.5s ease' }}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #38bdf8, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>AV</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>@alex_vance</h4>
                    <span className="text-secondary" style={{ fontSize: '0.8rem' }}>1,420 Followers</span>
                  </div>
                </div>
                <Award size={24} color="#FFD700" />
              </div>
              <div style={{ background: 'rgba(56, 189, 248, 0.08)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid rgba(56, 189, 248, 0.2)', marginBottom: '1rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.75rem', uppercase: true, fontWeight: 700 }}>VERIFIED 30-DAY ROI</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8', margin: 0 }}>+34.2%</h3>
              </div>
              <div className="flex items-center justify-between text-secondary" style={{ fontSize: '0.85rem' }}>
                <span>Win Rate: <strong>68.4%</strong></span>
                <span>Ledger: <strong style={{ color: '#34d399' }}>SEALED</strong></span>
              </div>
            </div>

            {/* Analyst 2 */}
            <div className="glass-card reveal-on-scroll delay-200" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2.2rem', transition: 'all 0.5s ease' }}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>ED</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>@elena_dimitrova</h4>
                    <span className="text-secondary" style={{ fontSize: '0.8rem' }}>980 Followers</span>
                  </div>
                </div>
                <Award size={24} color="#cbd5e1" />
              </div>
              <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)', marginBottom: '1rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.75rem', uppercase: true, fontWeight: 700 }}>VERIFIED 30-DAY ROI</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a855f7', margin: 0 }}>+28.6%</h3>
              </div>
              <div className="flex items-center justify-between text-secondary" style={{ fontSize: '0.85rem' }}>
                <span>Win Rate: <strong>64.1%</strong></span>
                <span>Ledger: <strong style={{ color: '#34d399' }}>SEALED</strong></span>
              </div>
            </div>

            {/* Analyst 3 */}
            <div className="glass-card reveal-on-scroll delay-300" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2.2rem', transition: 'all 0.5s ease' }}>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #34d399, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff' }}>MD</div>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>@marcus_devlin</h4>
                    <span className="text-secondary" style={{ fontSize: '0.8rem' }}>740 Followers</span>
                  </div>
                </div>
                <Award size={24} color="#cd7f32" />
              </div>
              <div style={{ background: 'rgba(52, 211, 153, 0.08)', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.2)', marginBottom: '1rem' }}>
                <span className="text-secondary" style={{ fontSize: '0.75rem', uppercase: true, fontWeight: 700 }}>VERIFIED 30-DAY ROI</span>
                <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', margin: 0 }}>+24.9%</h3>
              </div>
              <div className="flex items-center justify-between text-secondary" style={{ fontSize: '0.85rem' }}>
                <span>Win Rate: <strong>61.8%</strong></span>
                <span>Ledger: <strong style={{ color: '#34d399' }}>SEALED</strong></span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Two Paths Section */}
      <section className="flex-col items-center responsive-padding" style={{ position: 'relative', zIndex: 10, padding: '5rem 2rem' }}>
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
      <section id="features" className="flex-col items-center responsive-padding" style={{ padding: '4rem 2rem 6rem 2rem', position: 'relative', zIndex: 10, scrollMarginTop: '100px' }}>
        <h2 className="reveal-on-scroll" style={{ fontSize: '2.8rem', marginBottom: '2.5rem', fontWeight: 'bold', color: '#ffffff', textAlign: 'center' }}>Platform Capabilities</h2>
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

      {/* Sleek, Compact Footer */}
      <footer style={{ background: 'rgba(2, 4, 12, 0.95)', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '2.2rem 3rem 5.5rem 3rem' }}>
        <div className="flex justify-between items-center" style={{ maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', gap: '1.5rem' }}>
          
          <div className="flex items-center gap-4">
            <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '44px', objectFit: 'contain' }} />
            <span className="text-secondary desktop-only" style={{ fontSize: '0.85rem', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
              Non-profit sports portfolio management terminal
            </span>
          </div>

          <div className="flex items-center gap-8" style={{ fontSize: '0.9rem' }}>
            <Link to="/auth" className="text-secondary" style={{ textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terminal</Link>
            <a href="#preview" onClick={(e) => { e.preventDefault(); document.getElementById('preview')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Sneak Peek</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Features</a>
            <Link to="/terms" className="text-secondary" style={{ textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terms of Service</Link>
            <Link to="/privacy" className="text-secondary" style={{ textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Privacy Policy</Link>
          </div>

          <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>
            © {new Date().getFullYear()} QuantStakes. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
