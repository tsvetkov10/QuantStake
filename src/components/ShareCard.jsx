import React, { forwardRef, useState, useEffect } from 'react';
import { Target, Activity, CheckCircle, Zap } from 'lucide-react';
import { LOGO_FULL_BASE64 } from '../assets/logoDataUrl';

const ShareCard = forwardRef(({ profile, metrics }, ref) => {
  const { netProfit, roi, winRate, totalStaked, biggestWin, wonCount, totalBets } = metrics;
  const sym = profile?.currency === 'EUR' ? '€' : profile?.currency === 'GBP' ? '£' : '$';
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);

  // Convert profile avatar to base64 via fetch + canvas to ensure 100% CORS-proof rendering in html-to-image exports
  useEffect(() => {
    if (!profile?.avatar_url) {
      setAvatarDataUrl(null);
      return;
    }

    let isMounted = true;

    const convertViaFetch = async (url) => {
      try {
        const response = await fetch(url, { mode: 'cors' });
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        return null;
      }
    };

    const convertViaCanvas = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          try {
            const size = Math.min(img.naturalWidth || 300, img.naturalHeight || 300);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const sx = (img.naturalWidth - size) / 2;
            const sy = (img.naturalHeight - size) / 2;
            ctx.drawImage(img, sx, sy, size, size, 0, 0, size, size);
            resolve(canvas.toDataURL('image/png'));
          } catch (e) {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.src = url;
      });
    };

    const processAvatar = async () => {
      if (profile.avatar_url.startsWith('data:')) {
        if (isMounted) setAvatarDataUrl(profile.avatar_url);
        return;
      }

      let dataUrl = await convertViaFetch(profile.avatar_url);
      if (!dataUrl) {
        dataUrl = await convertViaCanvas(profile.avatar_url);
      }

      if (isMounted) {
        setAvatarDataUrl(dataUrl);
      }
    };

    processAvatar();

    return () => {
      isMounted = false;
    };
  }, [profile?.avatar_url]);

  const activeAvatar = avatarDataUrl || profile?.avatar_url;

  return (
    <div
      ref={ref}
      style={{
        width: '1080px',
        height: '1080px',
        background: '#040714',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        overflow: 'hidden',
        color: '#ffffff',
      }}
    >
      {/* Background Graphic Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(0, 243, 255, 0.18) 0%, transparent 70%)', filter: 'blur(60px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.18) 0%, transparent 70%)', filter: 'blur(80px)' }}></div>
      
      {/* Grid Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none'
      }}></div>

      <div style={{ padding: '60px', flexGrow: 1, display: 'flex', flexDirection: 'column', zIndex: 10 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {/* Avatar Badge matching Profile Page CSS center/cover with solid opaque background */}
            <div 
              style={{ 
                width: '90px', 
                height: '90px', 
                borderRadius: '50%', 
                backgroundColor: '#090e1a',
                background: activeAvatar ? `url(${activeAvatar}) center/cover no-repeat #090e1a` : 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)', 
                border: '3px solid rgba(255, 255, 255, 0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden', 
                flexShrink: 0, 
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.3)' 
              }}
            >
              {!activeAvatar && (
                <span style={{ fontSize: '3.2rem', fontWeight: '900', color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {(profile?.username?.[0] || 'U').toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '3.2rem', fontWeight: 'bold', margin: 0, letterSpacing: '-1px', color: '#ffffff' }}>{profile?.username || 'Trader'}</h1>
              <span style={{ color: '#38bdf8', fontSize: '1.5rem', fontWeight: '600' }}>QuantStakes Verified</span>
            </div>
          </div>
          
          {/* Exact QuantStakes Asset Logo */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/logo-full.png"
              crossOrigin="anonymous"
              alt="QuantStakes Logo"
              style={{
                height: '115px',
                maxWidth: '480px',
                objectFit: 'contain',
                display: 'block',
                margin: 0
              }}
            />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
            <div style={{ background: 'rgba(10, 10, 15, 0.6)', border: '1px solid var(--adaptive-white-08)', borderRadius: '24px', padding: '36px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Target size={30} color="#3b82f6" style={{ flexShrink: 0 }} />
                <span style={{ color: '#888888', fontSize: '1.4rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                  Win Rate {totalBets > 0 && <span style={{ color: '#38bdf8', fontWeight: '700', marginLeft: '6px' }}>({wonCount || 0}/{totalBets})</span>}
                </span>
              </div>
              <p style={{ fontSize: winRate.toFixed(1).length > 5 ? '3.2rem' : '3.6rem', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-1px' }}>
                {winRate.toFixed(1)}%
              </p>
            </div>
            
            <div style={{ background: 'rgba(10, 10, 15, 0.6)', border: '1px solid var(--adaptive-white-08)', borderRadius: '24px', padding: '36px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Activity size={30} color="#22d3ee" style={{ flexShrink: 0 }} />
                <span style={{ color: '#888888', fontSize: '1.4rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Yield (ROI)</span>
              </div>
              <p style={{ fontSize: `${roi >= 0 ? '+' : ''}${roi.toFixed(1)}%`.length > 6 ? '3.1rem' : '3.6rem', fontWeight: 'bold', margin: 0, color: roi >= 0 ? '#10b981' : '#ffffff', whiteSpace: 'nowrap', letterSpacing: '-1px' }}>{roi >= 0 ? '+' : ''}{roi.toFixed(1)}%</p>
            </div>

            <div style={{ background: 'rgba(10, 10, 15, 0.6)', border: '1px solid var(--adaptive-white-08)', borderRadius: '24px', padding: '36px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Zap size={30} color="#FFD700" style={{ flexShrink: 0 }} />
                <span style={{ color: '#888888', fontSize: '1.4rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Biggest Hit</span>
              </div>
              <p style={{ fontSize: `+${sym}${biggestWin.toFixed(0)}`.length > 6 ? '3.1rem' : '3.5rem', fontWeight: 'bold', margin: 0, color: '#FFD700', whiteSpace: 'nowrap', letterSpacing: '-1px' }}>+{sym}{biggestWin.toFixed(0)}</p>
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
            <p style={{ fontSize: '1.8rem', color: '#3b82f6', margin: 0, fontWeight: '900' }}>www.quantstakes.com</p>
          </div>
        </div>

      </div>
    </div>
  );
});

export default ShareCard;
