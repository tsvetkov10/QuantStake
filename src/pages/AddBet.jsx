import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Upload, ShieldCheck, Target, Activity, FileText, BadgePercent, Coins, Calendar, Copy, CheckCircle2, TrendingUp } from 'lucide-react';
import { extractBetData } from '../lib/ocrModel';
import TeamSelector from '../components/TeamSelector';
import * as htmlToImage from 'html-to-image';

// Lightweight, pure-JS SHA-256 implementation
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  
  var result = '';
  var words = [];
  var asciiLength = ascii[lengthProperty];
  var hash = [];
  var k = [];
  var primeCounter = 0;

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = 1;
      }
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  
  ascii += '\x80';
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return ''; // ASCII only
    words[i >> 2] |= j << (24 - (i % 4) * 8);
  }
  words[words[lengthProperty]] = ((asciiLength / 8) / maxWord) | 0;
  words[words[lengthProperty]] = (asciiLength * 8) | 0;
  
  for (j = 0; j < words[lengthProperty]; j += 16) {
    var w = words.slice(j, j + 16);
    var oldHash = hash;
    hash = hash.slice(0, 8);
    
    for (i = 0; i < 64; i++) {
      var w16 = w[i - 16], w15 = w[i - 15], w7 = w[i - 7], w2 = w[i - 2];
      var s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      var s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      var temp1 = hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0));
      var temp2 = (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;
      
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16 ? '0' : '') + b.toString(16));
    }
  }
  return result;
}

export default function AddBet({ session, profile }) {
  const [bookmaker, setBookmaker] = useState('Betano');
  const [sport, setSport] = useState('Football');
  const [type, setType] = useState('Single');
  const [stake, setStake] = useState('');
  const [odds, setOdds] = useState('');
  const [matchups, setMatchups] = useState(['']);
  const [markets, setMarkets] = useState(['Match Winner']);
  const MARKET_OPTIONS = [
    "Match Winner",
    "Match Winner (Home)",
    "Match Winner (Away)",
    "Draw",
    "Over 2.5 Goals",
    "Under 2.5 Goals",
    "Both Teams to Score",
    "Asian Handicap",
    "Player Prop",
    "Other"
  ];
  const [selectedDate, setSelectedDate] = useState(() => {
    const offset = new Date().getTimezoneOffset();
    return new Date(Date.now() - offset * 60000).toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  
  // Toast visibility lifecycle states
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  
  const navigate = useNavigate();
  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined;

  useEffect(() => {
    document.title = "Log Entry";
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
        setErrorMsg(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  const placeholderText = {
    'Football': 'e.g. Real Madrid vs Barcelona',
    'Basketball': 'e.g. Lakers vs Warriors',
    'Tennis': 'e.g. Alcaraz vs Djokovic',
    'MMA': 'e.g. McGregor vs Chandler',
    'Esports': 'e.g. T1 vs G2 Esports',
    'Other': 'e.g. Team A vs Team B'
  }[sport] || 'e.g. Team A vs Team B';

  const getCurrencySymbol = (currency) => {
    switch (currency) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'BGN': return 'лв';
      case 'USD':
      default: return '$';
    }
  };
  const currencySymbol = getCurrencySymbol(profile?.currency);

  // Compute live hash from current form values
  const combinedInputData = `${sport}-${bookmaker}-${type}-${selectedDate}-${stake || '0'}-${odds || '0'}-${matchups.join('|')}`;
  const generatedHash = sha256(combinedInputData).toUpperCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const timePart = new Date().toTimeString().split(' ')[0];
    const selectedTime = new Date(`${selectedDate}T${timePart}`).toISOString();
    const betData = {
      user_id: session.user.id,
      bookmaker,
      sport,
      type,
      stake: parseFloat(stake) || 0,
      odds: parseFloat(odds) || 0,
      teams: type === 'Single' 
        ? `${matchups[0]} @ ${markets[0] || 'Match Winner'}` 
        : matchups.map((m, i) => `${m} @ ${markets[i] || 'Match Winner'}`).filter(x => !x.startsWith(' @')).join(' | '),
      status: 'Pending',
      created_at: selectedTime
    };

    if (isMock) {
      const mockBetsRaw = sessionStorage.getItem('mock_bets');
      let mockBets = [];
      if (mockBetsRaw) {
        mockBets = JSON.parse(mockBetsRaw);
      } else {
        mockBets = [
          { id: '1', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), sport: 'Basketball', bookmaker: 'Bet365', type: 'Single', teams: 'Lakers vs Warriors', stake: 50, odds: 1.9, status: 'Won' },
          { id: '2', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), sport: 'Football', bookmaker: 'Betano', type: 'Multiple', teams: 'Acca', stake: 100, odds: 2.1, status: 'Lost' },
          { id: '3', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), sport: 'Tennis', bookmaker: 'Bet365', type: 'Single', teams: 'Alcaraz vs Djokovic', stake: 25, odds: 3.5, status: 'Won' },
          { id: '4', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), sport: 'Basketball', bookmaker: 'Inbet', type: 'Single', teams: 'Bulls vs Celtics', stake: 150, odds: 1.8, status: 'Pending' },
          { id: '5', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), sport: 'Football', bookmaker: 'Bet365', type: 'Single', teams: 'France vs Morocco', stake: 60, odds: 2.0, status: 'Lost' },
          { id: '6', created_at: new Date(Date.now() - 86400000 * 6).toISOString(), sport: 'Tennis', bookmaker: 'Betano', type: 'Single', teams: 'Djokovic vs Nadal', stake: 200, odds: 1.2, status: 'Won' }
        ];
      }
      const newBet = {
        ...betData,
        id: String(Date.now()),
        created_at: selectedTime
      };
      mockBets.unshift(newBet);
      sessionStorage.setItem('mock_bets', JSON.stringify(mockBets));

      setSuccessMsg('Bet logged successfully!');
      setTimeout(() => navigate('/history'), 1500);
      return;
    }

    try {
      const { error } = await supabase.from('bets').insert([betData]);
      if (error) throw error;
      
      setSuccessMsg('Bet logged to secure ledger.');
      setTimeout(() => navigate('/history'), 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to log bet.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setOcrLoading(true);
    setOcrProgress(0);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const data = await extractBetData(file, (progress) => {
        setOcrProgress(Math.round(progress * 100));
      });
      
      if (data.stake) setStake(data.stake);
      if (data.odds) setOdds(data.odds);
      if (data.teams) {
        setMatchups([data.teams]);
        setMarkets(['Match Winner']);
      }
      if (data.type) setType(data.type);
      
      setSuccessMsg('Screenshot scanned! Verify the fields before submitting.');
    } catch (err) {
      setErrorMsg('Failed to process screenshot. Please enter details manually.');
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
      e.target.value = null; // reset input
    }
  };

  const showToastMsg = (title, message) => {
    setToast({ title, message });
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 300); // Wait for transition
    }, 3000);
  };

  const copyLiveSlipAsImage = async () => {
    const element = document.getElementById('live-slip-preview');
    const logoEl = document.getElementById('live-slip-logo');
    if (!element) return;

    try {
      // Temporarily reveal brand watermark logo for image capture
      if (logoEl) logoEl.style.display = 'flex';

      const blob = await htmlToImage.toBlob(element, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => {
          return node.getAttribute ? node.getAttribute('data-html2canvas-ignore') !== 'true' : true;
        }
      });

      // Restore logo state immediately
      if (logoEl) logoEl.style.display = 'none';

      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToastMsg(
          'LEDGER EXPORT COMPLETE',
          `Live slip copied to clipboard as PNG! (TX: 0x${generatedHash.slice(0, 8)})`
        );
      } catch (clipErr) {
        await navigator.clipboard.writeText(`QuantStake Live Slip: 0x${generatedHash}`);
        showToastMsg(
          'HASH COPIED',
          'Image export blocked. Transaction hash text copied instead.'
        );
      }
    } catch (err) {
      console.error('Failed to capture image:', err);
      if (logoEl) logoEl.style.display = 'none';
    }
  };

  // Real-time slip preview parameters
  const activeStake = parseFloat(stake) || 0;
  const activeOdds = parseFloat(odds) || 0;
  const estPayout = activeStake * activeOdds;
  const netProfitVal = activeStake > 0 && activeOdds > 1 ? activeStake * (activeOdds - 1) : 0;
  
  // Custom sport design helpers
  const getSportColor = (sp) => {
    switch (sp) {
      case 'Football': return 'var(--accent-cyan)';
      case 'Basketball': return '#ffa043';
      case 'Tennis': return '#a1ff43';
      case 'Esports': return 'var(--accent-purple)';
      case 'MMA': return 'rgba(239, 68, 68, 1)';
      default: return 'var(--text-secondary)';
    }
  };
  const activeSportColor = getSportColor(sport);

  // Ingestion status configuration based on lifecycle
  const getIngestionStatus = () => {
    if (successMsg) {
      return {
        label: 'INGESTION COMPLETE',
        color: '#00ff88',
        shadow: '0 0 12px #00ff88'
      };
    }
    if (loading) {
      return {
        label: 'INGESTING...',
        color: 'var(--accent-cyan)',
        shadow: '0 0 12px var(--accent-cyan)'
      };
    }
    return {
      label: 'IN PROCESS',
      color: '#ffb900',
      shadow: '0 0 12px #ffb900'
    };
  };
  const statusInfo = getIngestionStatus();

  // Scoreboard layout parsing for teams matchup
  const renderMatchupsBlock = (teamsString, sportColor) => {
    if (!teamsString) return <span style={{ color: 'var(--text-secondary)', opacity: 0.5, fontSize: '0.85rem' }}>[Pending Selection Input]</span>;
    const legs = teamsString.split(' | ');
    return (
      <div className="flex-col gap-3 mt-1">
        {legs.map((legRaw, idx) => {
          const parts = legRaw.split(' @ ');
          const leg = parts[0];
          const market = parts[1] || 'Match Winner';
          const hasVs = leg.includes(' vs ');

          if (hasVs) {
            const teams = leg.split(' vs ');
            return (
              <div 
                key={idx}
                style={{ 
                  background: 'var(--adaptive-white-02)', 
                  border: '1px solid var(--adaptive-white-04)',
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  overflow: 'hidden'
                }}
              >
                {/* Tech glowing left accent line */}
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: sportColor }} />
                
                {/* Micro tech label */}
                <div className="flex justify-between items-center" style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <span>SELECTION LEG #{idx + 1}</span>
                  <span style={{ color: sportColor }}>ACTIVE RUNTIME</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '2px' }}>
                  <div className="flex-col" style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teams[0]}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase' }}>Home Team</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ 
                      fontSize: '0.55rem', 
                      color: 'var(--text-primary)', 
                      background: 'var(--adaptive-white-04)', 
                      border: `1px solid var(--adaptive-white-10)`, 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 'bold', 
                      fontFamily: 'monospace',
                      letterSpacing: '1px',
                      textShadow: '0 0 5px rgba(255,255,255,0.2)'
                    }}>VS</span>
                  </div>

                  <div className="flex-col text-right" style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teams[1]}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase' }}>Away Team</span>
                  </div>
                </div>

                <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--adaptive-white-05)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{market}</span>
                </div>
              </div>
            );
          }
          
          return (
            <div 
              key={idx}
              style={{ 
                background: 'var(--adaptive-white-02)', 
                border: '1px solid var(--adaptive-white-04)',
                borderRadius: '12px', 
                padding: '12px 16px', 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: sportColor }} />
              <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                SELECTION LEG #{idx + 1}
              </div>
              <span style={{ color: 'var(--text-primary)', fontWeight: '800', fontSize: '0.9rem', marginTop: '2px' }}>{leg}</span>
              <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--adaptive-white-05)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: 'var(--accent-cyan)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{market}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-col gap-8 w-full" style={{ animation: 'fade-in 0.4s ease' }}>
      
      <style>{`
        @keyframes slide-in {
          from {
            transform: translateY(100px) scale(0.9);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes slide-out {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(60px) scale(0.9);
            opacity: 0;
          }
        }
        @keyframes drain-width {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* Toast Alert UI */}
      {toast && (
        <div 
          style={{ 
            position: 'fixed', 
            bottom: '2rem', 
            right: '2rem', 
            zIndex: 99999, 
            animation: toastVisible 
              ? 'slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
              : 'slide-out 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '340px',
            maxWidth: '420px'
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              padding: '1.25rem 1.5rem', 
              background: 'linear-gradient(135deg, rgba(10, 10, 20, 0.96) 0%, rgba(20, 20, 30, 0.98) 100%)',
              border: '1.5px solid var(--accent-cyan)',
              boxShadow: '0 10px 40px rgba(0, 243, 255, 0.2)',
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ background: 'rgba(0, 243, 255, 0.1)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} color="var(--accent-cyan)" />
            </div>
            
            <div className="flex-col gap-1">
              <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 'bold', letterSpacing: '1px', fontFamily: 'monospace' }}>
                {toast.title}
              </h4>
              <p className="text-secondary" style={{ margin: 0, fontSize: '0.8rem', lineHeight: 1.4 }}>
                {toast.message}
              </p>
            </div>

            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: '3px',
              background: 'linear-gradient(90deg, var(--accent-cyan) 0%, var(--accent-purple) 100%)',
              width: '100%',
              animation: 'drain-width 3s linear forwards'
            }} />
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h2 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.4rem', fontWeight: 'bold' }}>Terminal Ingestion</h2>
        <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Commit verified quantitative bets to your public cryptographic ledger index.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', alignItems: 'start', width: '100%', height: 'calc(100vh - 180px)', minHeight: '500px' }}>
        
        {/* Left Column: Form Elements */}
        <div style={{ flex: '1 1 450px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem', scrollbarWidth: 'thin', height: '100%' }}>
          
          {/* Compact OCR Scan Bar */}
          <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '60px' }}>
            <div className="flex items-center gap-3">
              <Upload size={18} color="var(--accent-cyan)" />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {ocrLoading ? `Extracting values (${ocrProgress}%)...` : 'Have a screenshot slip?'}
              </span>
            </div>
            
            <input type="file" id="screenshot-upload" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={ocrLoading} />
            <label 
              htmlFor="screenshot-upload" 
              className="btn btn-secondary" 
              style={{ 
                padding: '0.4rem 1rem', 
                fontSize: '0.85rem', 
                height: 'auto', 
                margin: 0, 
                cursor: ocrLoading ? 'default' : 'pointer',
                background: 'var(--adaptive-white-02)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-primary)'
              }}
            >
              {ocrLoading ? 'Scanning...' : 'Scan Slip'}
            </label>
          </div>

          {/* Core Input Form Card */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            {errorMsg && (
              <div className="flex items-center gap-2 mb-6" style={{ padding: '1rem', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px' }}>
                <AlertCircle size={20} />
                <p style={{ fontSize: '0.9rem' }}>{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 mb-6" style={{ padding: '1rem', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '8px' }}>
                <CheckCircle size={20} />
                <p style={{ fontSize: '0.9rem' }}>{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-col gap-5">
              
              <div className="grid grid-cols-2 gap-4">
                {/* Sport Select */}
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Sport</label>
                  <select 
                    className="input-field mt-1" 
                    value={sport} 
                    onChange={e => setSport(e.target.value)}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="MMA">MMA</option>
                    <option value="Esports">Esports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Bet Type Select */}
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Bet Type</label>
                  <select 
                    className="input-field mt-1" 
                    value={type} 
                    onChange={e => {
                      setType(e.target.value);
                      if (e.target.value === 'Single' && matchups.length > 1) {
                        setMatchups([matchups[0]]);
                      }
                    }}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <option value="Single">Single</option>
                    <option value="Multiple">Multiple</option>
                    <option value="System">System</option>
                    <option value="Bet Builder">Bet Builder</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Bookmaker Select */}
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Bookmaker</label>
                  <select 
                    className="input-field mt-1" 
                    value={bookmaker} 
                    onChange={e => setBookmaker(e.target.value)}
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <option value="Bet365">Bet365</option>
                    <option value="Betano">Betano</option>
                    <option value="Inbet">Inbet</option>
                    <option value="PalmsBet">PalmsBet</option>
                    <option value="efbet">efbet</option>
                    <option value="Sesame">Sesame</option>
                    <option value="8888">8888</option>
                    <option value="MrBit">MrBit</option>
                    <option value="Alphawin">Alphawin</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Date Select */}
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Date</label>
                  <input 
                    type="date" 
                    className="input-field mt-1" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)} 
                    style={{ color: 'var(--text-primary)' }}
                    required
                  />
                </div>
              </div>

              {/* Matchup & Market Grid */}
              <div className="flex-col gap-4">
                <label className="label" style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Matchup / Teams</label>
                <div className="flex-col gap-4">
                  {matchups.map((matchup, idx) => (
                    <div key={idx} className="flex-col gap-3" style={{ background: 'transparent' }}>
                      <div className="flex gap-2 items-center w-full">
                        {sport === 'Football' ? (
                          <div className="flex gap-3 items-center w-full">
                            <div className="flex-1">
                              <TeamSelector 
                                value={matchup.split(' vs ')[0] || ''} 
                                onChange={(home) => {
                                  const away = matchup.split(' vs ')[1] || '';
                                  const newMatchups = [...matchups];
                                  newMatchups[idx] = `${home}${away ? ` vs ${away}` : ' vs '}`;
                                  setMatchups(newMatchups);
                                }}
                                placeholder="Home Team"
                              />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>VS</span>
                            <div className="flex-1">
                              <TeamSelector 
                                value={matchup.split(' vs ')[1] || ''} 
                                onChange={(away) => {
                                  const home = matchup.split(' vs ')[0] || '';
                                  const newMatchups = [...matchups];
                                  newMatchups[idx] = `${home} vs ${away}`;
                                  setMatchups(newMatchups);
                                }}
                                placeholder="Away Team"
                              />
                            </div>
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder={sport === 'Basketball' ? 'Lakers vs Warriors' : sport === 'Tennis' ? 'Alcaraz vs Djokovic' : 'Selection Name'} 
                            value={matchup} 
                            onChange={e => {
                              const newMatchups = [...matchups];
                              newMatchups[idx] = e.target.value;
                              setMatchups(newMatchups);
                            }} 
                            required 
                          />
                        )}
                        {matchups.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => {
                              setMatchups(matchups.filter((_, i) => i !== idx));
                              setMarkets(markets.filter((_, i) => i !== idx));
                            }} 
                            style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.4rem', fontSize: '1.2rem', fontWeight: 'bold' }}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      <div className="flex-col gap-2 mt-2 pt-2" style={{ borderTop: '1px dashed var(--adaptive-white-05)' }}>
                         <span className="text-secondary" style={{ fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px' }}>MARKET SELECTION</span>
                         <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '6px' }}>
                           {MARKET_OPTIONS.map(opt => {
                             const isSelected = (markets[idx] || 'Match Winner') === opt;
                             return (
                               <button
                                 key={opt}
                                 type="button"
                                 onClick={() => {
                                    const newMarkets = [...markets];
                                    newMarkets[idx] = opt;
                                    setMarkets(newMarkets);
                                 }}
                                 style={{
                                   whiteSpace: 'nowrap',
                                   padding: '6px 14px',
                                   borderRadius: '20px',
                                   fontSize: '0.75rem',
                                   fontWeight: isSelected ? 'bold' : '500',
                                   background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                   color: isSelected ? 'var(--success)' : 'var(--text-secondary)',
                                   border: `1px solid ${isSelected ? 'var(--success)' : 'var(--border-glass)'}`,
                                   cursor: 'pointer',
                                   transition: 'all 0.2s ease',
                                   flexShrink: 0
                                 }}
                                 onMouseEnter={e => {
                                   if (!isSelected) {
                                     e.currentTarget.style.background = 'var(--adaptive-white-06)';
                                     e.currentTarget.style.color = 'white';
                                     e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                                   }
                                 }}
                                 onMouseLeave={e => {
                                   if (!isSelected) {
                                     e.currentTarget.style.background = 'transparent';
                                     e.currentTarget.style.color = 'var(--text-secondary)';
                                     e.currentTarget.style.borderColor = 'var(--border-glass)';
                                   }
                                 }}
                               >
                                 {opt}
                               </button>
                             )
                           })}
                         </div>
                      </div>
                    </div>
                  ))}
                  {type !== 'Single' && (
                    <button type="button" onClick={() => {
                      setMatchups([...matchups, '']);
                      setMarkets([...markets, 'Match Winner']);
                    }} className="btn btn-secondary" style={{ width: 'fit-content', padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto', border: '1px dashed var(--border-glass)' }}>
                      + Add Matchup Selection
                    </button>
                  )}
                </div>
              </div>

              {/* Stake & Odds Input */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Stake Amount</label>
                  <input 
                    type="number" 
                    className="input-field mt-1" 
                    placeholder="0.00" 
                    value={stake} 
                    onChange={e => setStake(e.target.value)} 
                    required 
                    min="0.01" 
                    step="0.01" 
                  />
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {[5, 10, 20, 50, 100, 250].map(amt => (
                      <button 
                        key={amt} 
                        type="button" 
                        onClick={() => setStake(amt.toString())}
                        style={{
                          background: 'var(--adaptive-white-02)',
                          border: '1px solid var(--border-glass)',
                          borderRadius: '6px',
                          padding: '0.2rem 0.4rem',
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                      >
                        {currencySymbol}{amt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="label" style={{ fontSize: '0.8rem' }}>Odds (Decimal)</label>
                  <input 
                    type="number" 
                    className="input-field mt-1" 
                    placeholder="2.00" 
                    value={odds} 
                    onChange={e => setOdds(e.target.value)} 
                    required 
                    min="1.01" 
                    step="0.01" 
                  />
                </div>
              </div>

              {/* Submit Action Button */}
              <button 
                className="btn btn-secondary" 
                type="submit" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  marginTop: '1rem', 
                  background: 'rgba(0, 243, 255, 0.05)', 
                  border: '1px solid var(--border-glass)', 
                  color: 'var(--text-primary)', 
                  cursor: 'pointer', 
                  transition: 'all 0.2s',
                  boxShadow: '0 0 10px transparent'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.15)'; e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.5)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(0, 243, 255, 0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.05)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.boxShadow = '0 0 10px transparent'; }}
              >
                {loading ? 'Processing Ledger Ingestion...' : 'Commit Log Entry'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Dynamic Bet Slip Preview */}
        <div style={{ flex: '1 1 350px', minWidth: 0, position: 'sticky', top: '2rem', overflowY: 'auto', scrollbarWidth: 'thin', paddingRight: '0.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>

          <div 
            id="live-slip-preview"
            className="glass-panel" 
            style={{ 
              padding: '2rem 1.75rem', 
              position: 'relative', 
              overflow: 'hidden', 
              border: `1.5px solid ${activeStake > 0 ? activeSportColor : 'var(--border-glass)'}`,
              boxShadow: activeStake > 0 ? `0 0 30px rgba(0, 243, 255, 0.03)` : 'none',
              transition: 'all 0.3s ease',
              background: 'linear-gradient(180deg, var(--slip-gradient-1) 0%, var(--slip-gradient-2) 100%)'
            }}
          >
            {/* Branded Logo (Only visible during image export) */}
            <div 
              id="live-slip-logo" 
              style={{ 
                display: 'none', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '12px', 
                marginBottom: '1.5rem',
                borderBottom: '1px dashed var(--adaptive-white-15)',
                paddingBottom: '1rem',
                width: '100%'
              }}
            >
              <TrendingUp size={28} className="logo-icon" strokeWidth={3} style={{ flexShrink: 0 }} />
              <h2 className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, fontFamily: 'sans-serif' }}>QuantStake</h2>
            </div>

            {/* Pulsing indicator banner */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: statusInfo.color,
                  boxShadow: statusInfo.shadow,
                  animation: 'pulse 1.5s infinite'
                }} />
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: statusInfo.color, letterSpacing: '2px', fontWeight: 'bold' }}>
                  {statusInfo.label}
                </span>
              </div>
              
              {/* Copy Option */}
              <div className="flex items-center gap-1.5" data-html2canvas-ignore="true">
                <button
                  type="button"
                  onClick={copyLiveSlipAsImage}
                  title="Copy Live Slip Image to Clipboard"
                  style={{
                    background: 'var(--adaptive-white-02)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '4px',
                    padding: '0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    marginRight: '0.25rem'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Copy size={13} />
                </button>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  VERIFIED SLIP
                </span>
              </div>
            </div>

            {/* Title / Header */}
            <div className="flex-col gap-1 text-center mb-6" style={{ borderBottom: '1px dashed var(--adaptive-white-10)', paddingBottom: '1.25rem' }}>
              <h3 style={{ fontFamily: 'monospace', fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '4px', margin: 0, fontWeight: 'bold' }}>
                QUANTSTAKE INDEX
              </h3>
              <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase' }}>
                Hashed Cryptographic Ledger Entry
              </p>
            </div>

            {/* Ticket Info Rows */}
            <div className="flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>SPORT</span>
                <span 
                  style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 'bold', 
                    color: activeSportColor, 
                    background: 'var(--adaptive-white-03)', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}
                >
                  {sport}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>BET TYPE</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>{type}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>BOOKMAKER</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>{bookmaker}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-secondary" style={{ fontSize: '0.8rem' }}>LEDGER DATE</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} className="text-secondary" /> {selectedDate}
                </span>
              </div>

              {/* Beautified Matchup Content */}
              <div className="flex-col gap-1.5 mt-1">
                {renderMatchupsBlock(matchups.join(' | '), activeSportColor)}
              </div>

              {/* Dotted border separator */}
              <div style={{ borderTop: '2px dashed var(--adaptive-white-10)', marginTop: '0.75rem', marginBottom: '0.75rem' }} />

              {/* Financial panel */}
              <div className="flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ fontSize: '0.85rem', display: 'flex', items: 'center', gap: '4px' }}>
                    <Coins size={14} /> Total Wagered
                  </span>
                  <span style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    {currencySymbol}{activeStake.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ fontSize: '0.85rem', display: 'flex', items: 'center', gap: '4px' }}>
                    <BadgePercent size={14} /> Decimal Odds
                  </span>
                  <span style={{ fontSize: '1.15rem', color: 'var(--accent-cyan)', fontWeight: 'bold', fontFamily: 'monospace' }}>
                    @{activeOdds.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1 p-2 rounded-lg" style={{ background: 'rgba(0, 243, 255, 0.02)', border: '1px solid rgba(0, 243, 255, 0.1)' }}>
                  <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                    Est. Return
                  </span>
                  <span style={{ fontSize: '1.3rem', color: '#00ffaa', fontWeight: 'bold', textShadow: '0 0 10px rgba(0, 255, 170, 0.2)', fontFamily: 'monospace' }}>
                    {currencySymbol}{estPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center mt-1 p-2 rounded-lg" style={{ background: 'rgba(0, 243, 255, 0.05)', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
                  <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                    Net Profit
                  </span>
                  <span style={{ fontSize: '1.4rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textShadow: '0 0 12px rgba(0, 243, 255, 0.3)', fontFamily: 'monospace' }}>
                    {currencySymbol}{netProfitVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Barcode & Hash Footer */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--adaptive-white-05)' }}>
                
                {/* Dynamically Rendered Unique Barcode */}
                <div style={{
                  width: '100%',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'stretch',
                  background: 'var(--adaptive-white-01)',
                  padding: '4px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  justifyContent: 'center'
                }}>
                  {generatedHash.split('').slice(0, 52).map((char, index) => {
                    const val = parseInt(char, 16);
                    const width = val < 8 ? '1px' : val < 12 ? '2px' : '3.5px';
                    const marginRight = `${(val % 2) + 1}px`;
                    return (
                      <div
                        key={index}
                        style={{
                          width: width,
                          marginRight: marginRight,
                          backgroundColor: 'var(--text-invert)',
                          opacity: successMsg ? 0.4 : 0.18,
                          flexShrink: 0,
                          transition: 'all 0.2s ease'
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Cryptographic Transaction Hash */}
                <div className="flex justify-center w-full" style={{ marginTop: '0.25rem' }}>
                  {successMsg ? (
                    <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--accent-cyan)', letterSpacing: '1px', fontWeight: 'bold', width: '100%', wordBreak: 'break-all', textAlign: 'center' }}>
                      TX-HASH: 0x{generatedHash}
                    </span>
                  ) : (
                    <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.5, letterSpacing: '1px', textAlign: 'center' }}>
                      LEDGER HASH: PENDING COMMIT
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
