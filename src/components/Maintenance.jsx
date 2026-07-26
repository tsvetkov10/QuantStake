import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ShieldAlert, ArrowLeft, Sparkles, Clock } from 'lucide-react';

export default function Maintenance({ title = "Module Under Maintenance", description = "We are performing scheduled upgrades to enhance high-frequency algorithmic accuracy and ledger security. This page will return online shortly." }) {
  return (
    <div className="flex justify-center items-center" style={{ minHeight: 'calc(100vh - 120px)', padding: '2rem' }}>
      <div className="glass-panel text-center flex-col items-center" style={{ maxWidth: '640px', width: '100%', padding: '3.5rem 2.5rem', background: 'rgba(10, 10, 16, 0.75)', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
        
        {/* Glowing Top Line Accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, transparent, var(--accent-cyan), #E2E8F0, transparent)' }}></div>

        {/* Animated Cyber Icon Ring */}
        <div className="flex justify-center items-center mb-6" style={{ position: 'relative' }}>
          <div style={{ width: '88px', height: '88px', borderRadius: '50%', background: 'rgba(226, 232, 240, 0.08)', border: '1px solid rgba(226, 232, 240, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(226, 232, 240, 0.2)' }}>
            <Wrench size={42} color="#FFFFFF" style={{ animation: 'spin-slow 12s linear infinite' }} />
          </div>
          <div style={{ position: 'absolute', bottom: '-4px', right: 'calc(50% - 40px)', background: '#E2E8F0', borderRadius: '50%', padding: '4px', display: 'flex' }}>
            <Sparkles size={14} color="#fff" />
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 mb-4" style={{ background: 'rgba(255, 140, 0, 0.12)', border: '1px solid rgba(255, 140, 0, 0.3)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', color: '#ff8c00', letterSpacing: '1px', textTransform: 'uppercase' }}>
          <Clock size={14} /> SYSTEM UPGRADE IN PROGRESS
        </div>

        {/* Title & Description */}
        <h2 className="text-gradient mb-3" style={{ fontSize: '2.2rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
          {title}
        </h2>
        <p className="text-secondary mb-8" style={{ fontSize: '1rem', lineHeight: '1.7', maxWidth: '500px' }}>
          {description}
        </p>

        {/* Progress Tracker Card */}
        <div className="mb-8" style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '1.25rem 1.5rem', textAlign: 'left' }}>
          <div className="flex justify-between items-center mb-2" style={{ fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>System Optimization</span>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>85% Completed</span>
          </div>
          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, #FFFFFF, #E2E8F0)', borderRadius: '4px' }}></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 items-center justify-center" style={{ width: '100%' }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', fontWeight: 600 }}>
            <Sparkles size={18} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
