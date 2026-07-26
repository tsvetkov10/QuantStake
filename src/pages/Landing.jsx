import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, BarChart3, ChevronRight, PieChart, Send, Mail, MapPin, Shield, CheckCircle, Sparkles, Activity, ShieldCheck, Users, CreditCard } from 'lucide-react';

export default function Landing() {
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  // 3D Hover Effect Handler
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
    
    // Add a glowing spotlight effect
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
    <div className="flex-col" style={{ minHeight: '100vh', width: '100%', backgroundColor: 'var(--bg-dark)' }}>
      {/* Header - Fixed to always stay on top */}
      <header className="flex justify-between items-center responsive-header-padding" style={{ borderBottom: '1px solid var(--border-glass)', background: 'rgba(5, 5, 8, 0.9)', backdropFilter: 'blur(20px)', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100 }}>
        <div className="flex items-center gap-3">
          <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '60px', objectFit: 'contain' }} />
        </div>
        <nav className="flex gap-8 items-center">
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terminal</a>
          <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Features</a>
          <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary desktop-only" style={{ textDecoration: 'none', transition: 'color 0.2s', fontWeight: 500, cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Contact</a>
          <div className="desktop-only" style={{ width: '1px', height: '24px', background: 'var(--border-glass)' }}></div>
          <Link to="/auth" className="btn btn-secondary desktop-only" style={{ padding: '0.5rem 1rem' }}>Log In</Link>
          <Link to="/auth" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Open Account</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-col items-center justify-center hero-padding" style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vw', background: 'radial-gradient(ellipse, rgba(72, 51, 181, 0.15) 0%, transparent 60%)', zIndex: 0, pointerEvents: 'none' }}></div>
        
        <div style={{ background: 'var(--adaptive-white-05)', padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--border-glass)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></span>
          <span className="text-secondary" style={{ fontSize: '0.9rem', letterSpacing: '1px', fontWeight: 600 }}>SYSTEM ONLINE • V2.0 DEPLOYED</span>
        </div>

        <h2 style={{ fontSize: '5rem', fontWeight: '800', maxWidth: '1000px', lineHeight: '1.1', letterSpacing: '-1px', zIndex: 1 }} className="mb-6 hero-title">
          The Marketplace For <br/>
          <span className="text-gradient">Sports Portfolio Management.</span>
        </h2>
        <p className="text-secondary mb-10" style={{ fontSize: '1.25rem', maxWidth: '700px', lineHeight: '1.6', zIndex: 1 }}>
          QuantStakes replaces scattered spreadsheets with a unified, AI-driven terminal. Upload your bet slips to generate cryptographic proof of your edge, build your public track record, and monetize your analytics like a hedge fund.
        </p>
        <div className="flex gap-4 flex-wrap md-flex-col justify-center" style={{ zIndex: 1 }}>
          <Link to="/auth" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1.2rem 3rem', borderRadius: '12px' }}>
            Open Account <ChevronRight size={20} />
          </Link>
          <a href="#features" className="btn btn-secondary" style={{ fontSize: '1.1rem', padding: '1.2rem 3rem', borderRadius: '12px' }}>
            View Technology
          </a>
        </div>
      </main>

      {/* Trust Banner */}
      <div className="flex justify-center flex-wrap responsive-gap" style={{ borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', padding: '3rem', background: 'var(--adaptive-white-03)', opacity: 0.7 }}>
         <div className="flex items-center gap-2 font-bold" style={{ fontSize: '1.4rem', letterSpacing: '2px', color: '#fff' }}>APEX<span style={{ color: 'var(--accent-cyan)' }}>CAPITAL</span></div>
         <div className="flex items-center gap-2 font-bold" style={{ fontSize: '1.4rem', letterSpacing: '2px', color: '#fff' }}>QUANTUM<span style={{ color: 'var(--accent-magenta)' }}>EDGE</span></div>
         <div className="flex items-center gap-2 font-bold" style={{ fontSize: '1.4rem', letterSpacing: '2px', color: '#fff' }}>SYNDICATE<span style={{ color: 'var(--success)' }}>VENTURES</span></div>
      </div>

      {/* Two Paths Section */}
      <section className="flex-col items-center responsive-padding">
        <h3 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 'bold', textAlign: 'center' }}>Choose Your Path</h3>
        <p className="text-secondary mb-12 text-center" style={{ fontSize: '1.1rem', maxWidth: '600px', lineHeight: '1.6' }}>Whether you're a sharp bettor proving your edge, or an investor looking for alpha, QuantStakes is built for you.</p>
        
        <div className="features-grid">
          {/* Analyst Path */}
          <div className="glass-card flex-col" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '3rem', transition: 'all 0.5s ease', cursor: 'default', height: '100%' }}>
            <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 0, 234, 0.1)', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem', pointerEvents: 'none' }}>
              <Sparkles size={32} color="var(--accent-magenta)" />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold', pointerEvents: 'none', color: 'var(--text-primary)' }}>Become a Quant Analyst</h3>
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.7', pointerEvents: 'none', marginBottom: '2.5rem' }}>
              Upload your bet slips and let our AI parse them into a cryptographic track record. Sell your winning picks and grow a dedicated audience.
            </p>
            <ul className="flex-col flex-grow" style={{ pointerEvents: 'none', padding: 0, margin: 0, listStyle: 'none', marginBottom: '3rem' }}>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-magenta)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span><strong>Keep 80%</strong> of your subscription revenue</span>
              </li>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-magenta)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Set your own custom monthly price</span>
              </li>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-magenta)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Build a global on-chain track record</span>
              </li>
            </ul>
            <div style={{ marginTop: 'auto' }}>
              <Link to="/auth" className="btn" style={{ 
                width: '100%', pointerEvents: 'auto', padding: '1.2rem', fontSize: '1.05rem', fontWeight: '600',
                background: 'linear-gradient(135deg, #d946ef, #4833b5)',
                color: 'var(--text-primary)',
                border: 'none',
                boxShadow: '0 4px 20px rgba(217, 70, 239, 0.3)'
              }}>Start Selling Picks</Link>
            </div>
          </div>

          {/* Follower Path */}
          <div className="glass-card flex-col" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '3rem', transition: 'all 0.5s ease', cursor: 'default', height: '100%' }}>
            <div style={{ alignSelf: 'flex-start', background: 'rgba(72, 51, 181, 0.1)', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem', pointerEvents: 'none' }}>
              <Users size={32} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', fontWeight: 'bold', pointerEvents: 'none', color: 'var(--text-primary)' }}>Become an Investor</h3>
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.7', pointerEvents: 'none', marginBottom: '2.5rem' }}>
              Stop guessing. Browse the global leaderboard to find proven, winning analysts with on-chain ROI and subscribe to their premium tiers.
            </p>
            <ul className="flex-col flex-grow" style={{ pointerEvents: 'none', padding: 0, margin: 0, listStyle: 'none', marginBottom: '3rem' }}>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Pay only for analysts with proven edge</span>
              </li>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Instant alerts the millisecond a bet is placed</span>
              </li>
              <li className="flex items-start gap-3 text-secondary" style={{ marginBottom: '1.25rem', lineHeight: '1.5' }}>
                <CheckCircle size={20} color="var(--accent-cyan)" style={{ flexShrink: 0, marginTop: '1px' }}/> 
                <span>Unforgeable cryptographic proof of past performance</span>
              </li>
            </ul>
            <div style={{ marginTop: 'auto' }}>
              <Link to="/auth" className="btn" style={{ 
                width: '100%', pointerEvents: 'auto', padding: '1.2rem', fontSize: '1.05rem', fontWeight: '600',
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: 'var(--text-primary)',
                border: 'none',
                boxShadow: '0 4px 20px rgba(6, 182, 212, 0.3)'
              }}>Browse Top Analysts</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="flex-col items-center" style={{ padding: '5rem 2rem' }}>
        <h3 style={{ fontSize: '2.5rem', marginBottom: '2rem', fontWeight: 'bold' }}>Enterprise Capabilities</h3>
        <div className="grid grid-cols-3" style={{ gap: '1.5rem', maxWidth: '1200px', width: '100%' }}>
          
          {/* Card 1 */}
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(255, 0, 234, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <BrainCircuit size={24} color="var(--accent-magenta)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Neural Vision Parsing</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Drag and drop screenshots of your slips. Our proprietary vision models instantly extract odds, stakes, and endpoints with 99.9% accuracy.</p>
          </div>
          
          {/* Card 2 */}
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(72, 51, 181, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <ShieldCheck size={24} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Cryptographic Slips</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Every bet is sealed with a unique Cryptographic Block Record hash. Share your slips knowing they can never be forged or altered.</p>
          </div>
          
          {/* Card 3 */}
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <BarChart3 size={24} color="var(--success)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Waterfall Analytics</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Visualize your true ROI and bankroll trajectory with institutional-grade waterfall charts. Hover any bar to instantly inspect the underlying slip.</p>
          </div>

          {/* Card 4 */}
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <Users size={24} color="var(--accent-purple)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Analyst Marketplace</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Prove your edge on the global leaderboard. Build a public profile, showcase your ROI, and gain followers based purely on quantitative performance.</p>
          </div>

          {/* Card 5 */}
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <CreditCard size={24} color="#FFD700" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Monetization & Subscriptions</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Turn your betting edge into a scalable business. Set custom subscription tiers and monetize your picks to your loyal subscriber base.</p>
          </div>

          {/* Card 6 */}
          <div className="glass-card feature-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ padding: '2rem', transition: 'all 0.5s ease', cursor: 'default' }}>
            <div style={{ background: 'var(--adaptive-white-10)', padding: '0.75rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1rem', pointerEvents: 'none' }}>
              <Activity size={24} color="white" />
            </div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', fontWeight: 'bold', pointerEvents: 'none' }}>Global Data Integration</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6', pointerEvents: 'none' }}>Instantly search and log bets for any sports team on the planet. Our dynamic terminal UI gives you absolute flexibility for deep portfolio categorization.</p>
          </div>

        </div>
      </section>

      {/* Inline Contact Section */}
      <section id="contact" style={{ padding: '6rem 2rem', borderTop: '1px solid var(--border-glass)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="flex items-center gap-3 mb-8 justify-center">
            <Mail size={28} className="text-success" />
            <h2 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0 }}>Contact Support</h2>
          </div>
          <p className="text-secondary text-center mb-12" style={{ fontSize: '1.2rem' }}>Interested in API access or have a question? Drop us a line.</p>

          <div className="grid grid-cols-2" style={{ gap: '5rem', alignItems: 'start' }}>
            
            <div className="flex-col gap-6 justify-center">
              <div 
                className="glass-card" 
                onMouseMove={handleMouseMove} 
                onMouseLeave={handleMouseLeave} 
                onClick={() => {
                  navigator.clipboard.writeText('enterprise@quantstakes.com');
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ background: 'var(--adaptive-white-04)', padding: '2.5rem', transition: 'all 0.5s ease', cursor: 'pointer' }}
              >
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-primary)', pointerEvents: 'none' }}>Enterprise Inquiries</h3>
                <p className="text-secondary" style={{ marginBottom: '1.5rem', lineHeight: '1.6', pointerEvents: 'none' }}>We offer white-label solutions and direct API access for professional syndicates.</p>
                <div className="flex items-center gap-3 text-gradient" style={{ fontSize: '1.1rem', pointerEvents: 'none' }}>
                  {copied ? (
                    <>
                      <CheckCircle size={20} /> Copied to clipboard!
                    </>
                  ) : (
                    <>
                      <Mail size={20} /> enterprise@quantstakes.com
                    </>
                  )}
                </div>
              </div>

              <div className="glass-card" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ background: 'var(--adaptive-white-04)', padding: '2.5rem', transition: 'all 0.5s ease' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--text-primary)', pointerEvents: 'none' }}>Infrastructure</h3>
                <p className="text-secondary" style={{ marginBottom: '1.5rem', lineHeight: '1.6', pointerEvents: 'none' }}>QuantStakes Technologies is a 100% online-based platform with fully integrated AI processing.</p>
                <div className="flex items-center gap-3 text-secondary" style={{ fontSize: '1.1rem', pointerEvents: 'none' }}>
                  <BrainCircuit size={20} /> Distributed Cloud Nodes
                </div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '3rem', position: 'relative', overflow: 'hidden', background: 'rgba(10, 10, 16, 0.85)', border: '1px solid rgba(72, 51, 181, 0.15)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'radial-gradient(circle at top right, rgba(72, 51, 181, 0.08), transparent 60%)', zIndex: 0, pointerEvents: 'none' }}></div>
              {sent ? (
                <div className="flex-col items-center justify-center text-center h-full" style={{ padding: '2rem', position: 'relative', zIndex: 1 }}>
                  <Send size={56} className="text-success mb-6" />
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#fff' }}>Message Received</h3>
                  <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Our support team will get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex-col gap-6" style={{ position: 'relative', zIndex: 1 }}>
                  <div>
                    <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Name</label>
                    <input type="text" className="input-field" placeholder="John Doe" required style={{ background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }} />
                  </div>
                  <div>
                    <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Email Address</label>
                    <input type="email" className="input-field" placeholder="john@example.com" required style={{ background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }} />
                  </div>
                  <div>
                    <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Message</label>
                    <textarea className="input-field" placeholder="How can we help you?" required rows="4" style={{ resize: 'vertical', background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }}></textarea>
                  </div>
                  <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: '700', background: 'linear-gradient(135deg, #4833b5 0%, #29187a 100%)', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 25px rgba(72, 51, 181, 0.3)' }}>
                    Send Transmission
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Footer */}
      <footer style={{ background: 'rgba(0, 0, 0, 0.8)', borderTop: '1px solid var(--border-glass)', padding: '6rem 4rem 3rem 4rem' }}>
        <div className="flex justify-between" style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '5rem', flexWrap: 'wrap', gap: '4rem' }}>
          
          <div style={{ maxWidth: '350px' }}>
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '60px', objectFit: 'contain' }} />
            </div>
            <p className="text-secondary" style={{ fontSize: '1rem', lineHeight: '1.8' }}>
              The premium marketplace for sharp bettors and sports syndicates to track, analyze, and monetize their portfolios with algorithmic precision and cryptographic proof.
            </p>
          </div>

          <div className="flex" style={{ gap: '6rem' }}>
            <div className="flex-col gap-4">
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1rem' }}>Product</h4>
              <Link to="/auth" className="text-secondary" style={{ textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terminal Login</Link>
              <Link to="/auth" className="text-secondary" style={{ textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Pricing</Link>
              <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Technology</a>
            </div>

            <div className="flex-col gap-4">
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1rem' }}>Company</h4>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Contact Us</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Careers</a>
              <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-secondary" style={{ textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Press</a>
            </div>

            <div className="flex-col gap-4">
              <h4 style={{ color: 'var(--text-primary)', fontWeight: 'bold', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '1rem', marginBottom: '1rem' }}>Legal</h4>
              <Link to="/terms" className="text-secondary" style={{ textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Terms of Service</Link>
              <Link to="/privacy" className="text-secondary" style={{ textDecoration: 'none', fontSize: '1rem', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='var(--text-secondary)'}>Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--adaptive-white-05)', paddingTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap' }}>
          <p className="text-secondary" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            © {new Date().getFullYear()} QuantStakes Technologies LLC. All rights reserved. <br/>
            QuantStakes is not a sportsbook and does not accept wagers.
          </p>
          <div className="flex items-center gap-4 text-secondary" style={{ fontSize: '0.9rem' }}>
            <Shield size={16} color="var(--success)" /> SECURE SSL ENCRYPTION
          </div>
        </div>
      </footer>
    </div>
  );
}
