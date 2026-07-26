import React, { forwardRef } from 'react';
import { Sparkles, Target, Activity, CheckCircle, Zap } from 'lucide-react';

const ShareCard = forwardRef(({ profile, metrics }, ref) => {
  const { netProfit, roi, winRate, totalStaked, biggestWin } = metrics;
  const sym = profile?.currency === 'EUR' ? '€' : profile?.currency === 'GBP' ? '£' : '$';

  return (
    <div
      ref={ref}
      style={{
        width: '1080px',
        height: '1080px',
        background: 'var(--bg-invert)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* Background Graphic Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(0, 243, 255, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
      
      {/* Grid Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--adaptive-white-03) 1px, transparent 1px), linear-gradient(90deg, var(--adaptive-white-03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }}></div>

      <div style={{ padding: '60px', flexGrow: 1, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(10, 10, 15, 0.6)', border: '2px solid var(--adaptive-white-08)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{(profile?.username?.[0] || 'U').toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '3rem', fontWeight: 'bold', margin: 0, letterSpacing: '-1px' }}>{profile?.username || 'Trader'}</h1>
              <span style={{ color: '#888888', fontSize: '1.5rem' }}>QuantStakes Verified</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <img src="/logo-full.png" alt="QuantStakes Logo" style={{ height: '64px', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', flexGrow: 1, justifyContent: 'center' }}>
          
          <div style={{ background: 'rgba(10, 10, 15, 0.6)', border: '1px solid var(--adaptive-white-08)', borderRadius: '30px', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
             <p style={{ color: '#888888', fontSize: '2rem', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '4px', fontWeight: 'bold' }}>Total Net Profit</p>
             <h1 style={{ fontSize: '7rem', fontWeight: '900', margin: 0, color: netProfit >= 0 ? '#10b981' : '#ef4444', textShadow: `0 0 40px ${netProfit >= 0 ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 51, 102, 0.4)'}`, lineHeight: 1 }}>
               {netProfit >= 0 ? '+' : ''}{sym}{netProfit.toFixed(2)}
             </h1>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' }}>
            <div style={{ background: 'rgba(10, 10, 15, 0.6)', border: '1px solid var(--adaptive-white-08)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <Target size={32} color="#3b82f6" style={{ flexShrink: 0 }} />
                <span style={{ color: '#888888', fontSize: '1.5rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Win Rate</span>
              </div>
              <p style={{ fontSize: '4rem', fontWeight: 'bold', margin: 0 }}>{winRate.toFixed(1)}%</p>
            </div>
            
            <div style={{ background: 'rgba(10, 10, 15, 0.6)', border: '1px solid var(--adaptive-white-08)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <Activity size={32} color="#FFFFFF" style={{ flexShrink: 0 }} />
                <span style={{ color: '#888888', fontSize: '1.5rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Yield (ROI)</span>
              </div>
              <p style={{ fontSize: '4rem', fontWeight: 'bold', margin: 0, color: roi >= 0 ? '#10b981' : '#ffffff' }}>{roi >= 0 ? '+' : ''}{roi.toFixed(1)}%</p>
            </div>

            <div style={{ background: 'rgba(10, 10, 15, 0.6)', border: '1px solid var(--adaptive-white-08)', borderRadius: '24px', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <Zap size={32} color="#FFD700" style={{ flexShrink: 0 }} />
                <span style={{ color: '#888888', fontSize: '1.5rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Biggest Hit</span>
              </div>
              <p style={{ fontSize: '4rem', fontWeight: 'bold', margin: 0, color: '#FFD700' }}>+{sym}{biggestWin.toFixed(0)}</p>
            </div>
          </div>

        </div>

        {/* Footer CTA */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <CheckCircle size={32} color="#10b981" />
            <span style={{ fontSize: '1.8rem', fontWeight: '500', color: '#888888', lineHeight: '32px' }}>All data mathematically verified on ledger</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 5px 0', lineHeight: '32px' }}>Join the elite community.</p>
            <p style={{ fontSize: '1.8rem', color: '#3b82f6', margin: 0, fontWeight: '900' }}>app.quantstakes.com</p>
          </div>
        </div>

      </div>
    </div>
  );
});

export default ShareCard;
