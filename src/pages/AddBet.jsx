import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Upload, ShieldCheck, Target, Activity, FileText, BadgePercent, Coins, Calendar, Copy, CheckCircle2, Sparkles, Lock, ArrowRight } from 'lucide-react';
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
    
    // Construct teams string cleanly, defaulting to 'Quick Bet' if left empty
    const cleanMatchup = (m) => (m && m.trim() !== '' && m.trim() !== 'vs') ? m.trim() : '';
    const teamsString = type === 'Single' 
      ? (cleanMatchup(matchups[0]) ? `${cleanMatchup(matchups[0])} @ ${markets[0] || 'Match Winner'}` : 'Quick Bet')
      : (matchups.map((m, i) => cleanMatchup(m) ? `${cleanMatchup(m)} @ ${markets[i] || 'Match Winner'}` : `Selection ${i+1}`).join(' | ') || 'Quick Bet Acca');

    const betData = {
      user_id: session.user.id,
      bookmaker,
      sport,
      type,
      stake: parseFloat(stake) || 0,
      odds: parseFloat(odds) || 0,
      teams: teamsString,
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

  const [isDragging, setIsDragging] = useState(false);

  const validateSlipFile = (selectedFile) => {
    if (!selectedFile) return false;
    setErrorMsg(null);

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
    const fileNameLower = selectedFile.name.toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'];
    const hasValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));
    const isValidType = validTypes.includes(selectedFile.type) || hasValidExt;

    if (!isValidType) {
      setErrorMsg(`Invalid file format "${selectedFile.name}". Please upload a supported image file (PNG, JPG, JPEG, WEBP, HEIC).`);
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg(`File "${selectedFile.name}" is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 10MB.`);
      return false;
    }

    return true;
  };

  const processSlipFile = async (file) => {
    if (!validateSlipFile(file)) return;

    setOcrLoading(true);
    setOcrProgress(20);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // 1. Try server Gemini Vision AI parser
      let data = null;
      try {
        const res = await fetch('http://localhost:3001/api/parse-slip', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {
        console.warn('Gemini Vision backend unreachable, using fallback OCR...', e);
      }

      // 2. Client Tesseract OCR fallback
      if (!data) {
        data = await extractBetData(file, (progress) => {
          setOcrProgress(Math.round(progress * 100));
        });
      }

      if (data) {
        if (data.stake) setStake(data.stake);
        if (data.odds) setOdds(data.odds);
        if (data.teams) {
          setMatchups([data.teams]);
          setMarkets(['Match Winner']);
        }
        if (data.sport && ['Football', 'Basketball', 'Tennis', 'MMA', 'Esports', 'Other'].includes(data.sport)) {
          setSport(data.sport);
        }
        if (data.type && ['Single', 'Parlay', 'System'].includes(data.type)) {
          setType(data.type);
        }
        if (data.date) {
          const parsedDate = new Date(data.date);
          if (!isNaN(parsedDate.getTime())) {
            setSelectedDate(parsedDate.toISOString().split('T')[0]);
          }
        }
        
        showToastMsg(
          '✨ AI SLIP SCAN COMPLETE',
          `Auto-filled Stake (${data.stake || 'N/A'}), Odds (${data.odds || 'N/A'}), Teams (${data.teams || 'N/A'}).`
        );
        setSuccessMsg('Bet slip scanned! Verify the auto-filled fields below before submitting.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process bet slip screenshot. Please enter details manually.');
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

  // Global window drag counter to detect macOS Finder file dragging anywhere on page
  useEffect(() => {
    let dragCounter = 0;

    const handleWindowDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleWindowDragOver = (e) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      setIsDragging(true);
    };

    const handleWindowDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDragging(false);
      }
    };

    const handleWindowDrop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        processSlipFile(droppedFile);
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await processSlipFile(file);
    e.target.value = null; // reset input
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
        backgroundColor: '#0d0f17',
        style: {
          background: '#0d0f17',
          backgroundColor: '#0d0f17',
          color: '#ffffff'
        },
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
        await navigator.clipboard.writeText(`QuantStakes Live Slip: 0x${generatedHash}`);
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
    if (!teamsString) {
      return (
        <div style={{ 
          padding: '0.85rem 1rem', 
          borderRadius: '12px', 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px dashed rgba(255,255,255,0.1)', 
          textAlign: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem', 
          color: 'rgba(255,255,255,0.35)', 
          fontSize: '0.8rem', 
          fontWeight: '500',
          fontFamily: 'monospace' 
        }}>
          <Activity size={14} /> Pending Matchup Input
        </div>
      );
    }
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
                  background: 'rgba(255, 255, 255, 0.04)', 
                  border: '1px solid rgba(255, 255, 255, 0.08)',
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
                <div className="flex justify-between items-center" style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <span>SELECTION LEG #{idx + 1}</span>
                  <span style={{ color: sportColor }}>ACTIVE RUNTIME</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginTop: '2px' }}>
                  <div className="flex-col" style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teams[0]}</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase' }}>Home Team</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ 
                      fontSize: '0.55rem', 
                      color: '#ffffff', 
                      background: 'rgba(255, 255, 255, 0.08)', 
                      border: '1px solid rgba(255, 255, 255, 0.15)', 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontWeight: 'bold', 
                      fontFamily: 'monospace',
                      letterSpacing: '1px'
                    }}>VS</span>
                  </div>

                  <div className="flex-col text-right" style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{teams[1]}</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase' }}>Away Team</span>
                  </div>
                </div>

                <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: '#22d3ee', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{market}</span>
                </div>
              </div>
            );
          }
          
          return (
            <div 
              key={idx}
              style={{ 
                background: 'rgba(255, 255, 255, 0.04)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px', 
                padding: '12px 16px', 
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: sportColor }} />
              <div style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                SELECTION LEG #{idx + 1}
              </div>
              <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', marginTop: '2px' }}>{leg}</span>
              <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#22d3ee', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{market}</span>
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
              boxShadow: '0 10px 40px rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2rem', margin: 0, fontWeight: 'bold', letterSpacing: '-0.5px' }}>Terminal Ingestion</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>Commit verified quantitative bets to your public cryptographic ledger index.</p>
        </div>

        {/* Live SHA-256 Ledger Seal Badge */}
        <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.25)', padding: '0.5rem 1rem', borderRadius: '24px', color: '#22d3ee', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 20px rgba(6, 182, 212, 0.1)' }}>
          <Lock size={14} color="#22d3ee" />
          <span>SHA-256 SEAL: {generatedHash.substring(0, 16)}...</span>
        </div>
      </div>

      <div style={{ maxWidth: '960px', width: '100%', paddingBottom: '2rem' }}>
        
        {/* Main Form Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* AI Slip Scan Bar with dynamic drag-and-drop transformation */}
          <div 
            className="glass-panel" 
            style={{ 
              padding: isDragging ? '1.5rem 2rem' : '0.85rem 1.5rem', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              minHeight: isDragging ? '90px' : '56px', 
              border: isDragging ? '3px dashed #38bdf8' : '1px solid rgba(56, 189, 248, 0.25)', 
              background: isDragging ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)' : 'rgba(15, 23, 42, 0.75)', 
              borderRadius: '14px',
              transform: isDragging ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isDragging ? '0 0 40px rgba(56, 189, 248, 0.4)' : 'none'
            }}
          >
            <div className="flex items-center gap-3">
              <div style={{ width: isDragging ? '48px' : '32px', height: isDragging ? '48px' : '32px', borderRadius: '50%', background: isDragging ? 'rgba(56, 189, 248, 0.35)' : 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                <Upload size={isDragging ? 26 : 16} color={isDragging ? '#ffffff' : '#38bdf8'} />
              </div>
              <span style={{ fontSize: isDragging ? '1.1rem' : '0.88rem', color: isDragging ? '#38bdf8' : '#e2e8f0', fontWeight: isDragging ? '700' : '500', transition: 'all 0.2s ease' }}>
                {isDragging ? 'RELEASE MOUSE TO SCAN & AUTO-FILL BET SLIP!' : ocrLoading ? `Extracting slip values (${ocrProgress}%)...` : 'AI Slip Scan: Upload or drag any sports slip screenshot for instant 0.5s auto-fill'}
              </span>
            </div>
            
            <input type="file" id="screenshot-upload" accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif" onChange={handleImageUpload} style={{ display: 'none' }} disabled={ocrLoading} />
            <label 
              htmlFor="screenshot-upload" 
              className="btn-white-pill" 
              style={{ 
                padding: '0.45rem 1.1rem', 
                fontSize: '0.82rem', 
                height: 'auto', 
                margin: 0, 
                cursor: ocrLoading ? 'default' : 'pointer',
                textAlign: 'center'
              }}
            >
              {ocrLoading ? 'Scanning...' : '⚡ Scan Slip Screenshot'}
            </label>
          </div>

          {/* Core Input Form Card */}
          <div className="glass-panel" style={{ padding: '2rem 2.25rem', background: 'rgba(6, 9, 20, 0.95)', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {errorMsg && (
              <div className="flex items-center gap-2 mb-6" style={{ padding: '0.85rem 1.25rem', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '10px' }}>
                <AlertCircle size={18} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 mb-6" style={{ padding: '0.85rem 1.25rem', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '10px' }}>
                <CheckCircle size={18} />
                <p style={{ fontSize: '0.85rem', margin: 0 }}>{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-col gap-6">
              
              {/* 1. Visual Sport Pills Selector */}
              <div>
                <label className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', display: 'block' }}>Select Sport Discipline</label>
                <div className="flex gap-2.5 flex-wrap">
                  {[
                    { id: 'Football', label: '⚽ Football' },
                    { id: 'Basketball', label: '🏀 Basketball' },
                    { id: 'Tennis', label: '🎾 Tennis' },
                    { id: 'MMA', label: '🥊 MMA' },
                    { id: 'Esports', label: '🎮 Esports' },
                    { id: 'Other', label: '🌐 Other' }
                  ].map(item => {
                    const isSelected = sport === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSport(item.id)}
                        style={{
                          padding: '0.45rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? '700' : '500',
                          background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                          color: isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)',
                          border: `1px solid ${isSelected ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'}`,
                          boxShadow: isSelected ? '0 0 14px rgba(56, 189, 248, 0.25)' : 'none',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Bet Type & Bookmaker & Date Row */}
              <div className="grid grid-cols-3 gap-4">
                {/* Bet Type Pills */}
                <div>
                  <label className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', display: 'block' }}>Bet Type</label>
                  <select 
                    className="input-field" 
                    value={type} 
                    onChange={e => {
                      setType(e.target.value);
                      if (e.target.value === 'Single' && matchups.length > 1) {
                        setMatchups([matchups[0]]);
                      }
                    }}
                    style={{ color: 'var(--text-primary)', height: '44px', minHeight: '44px', boxSizing: 'border-box', borderRadius: '10px', padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
                  >
                    <option value="Single">Single</option>
                    <option value="Multiple">Multiple (Acca)</option>
                    <option value="System">System</option>
                    <option value="Bet Builder">Bet Builder</option>
                  </select>
                </div>

                {/* Bookmaker Select */}
                <div>
                  <label className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', display: 'block' }}>Bookmaker Platform</label>
                  <select 
                    className="input-field" 
                    value={bookmaker} 
                    onChange={e => setBookmaker(e.target.value)}
                    style={{ color: 'var(--text-primary)', height: '44px', minHeight: '44px', boxSizing: 'border-box', borderRadius: '10px', padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
                  >
                    <option value="Polymarket">Polymarket</option>
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
                  <label className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem', display: 'block' }}>Log Date</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)} 
                    style={{ color: 'var(--text-primary)', height: '44px', minHeight: '44px', boxSizing: 'border-box', borderRadius: '10px', padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
                    required
                  />
                </div>
              </div>

              {/* 3. Matchup & Market Grid */}
              <div className="flex-col gap-3">
                <label className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)' }}>
                  Matchup / Selection Teams <span style={{ textTransform: 'none', fontWeight: 'normal', color: 'var(--text-secondary)' }}>(Optional)</span>
                </label>
                <div className="flex-col gap-3">
                  {matchups.map((matchup, idx) => (
                    <div key={idx} className="flex-col gap-2.5" style={{ background: 'transparent' }}>
                      <div className="flex gap-2.5 items-center w-full">
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
                                placeholder="Home Team (Optional)"
                              />
                            </div>
                            <span style={{ fontWeight: 'bold', fontSize: '0.78rem', color: '#22d3ee', background: 'rgba(34, 211, 238, 0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(34, 211, 238, 0.25)' }}>VS</span>
                            <div className="flex-1">
                              <TeamSelector 
                                value={matchup.split(' vs ')[1] || ''} 
                                onChange={(away) => {
                                  const home = matchup.split(' vs ')[0] || '';
                                  const newMatchups = [...matchups];
                                  newMatchups[idx] = `${home} vs ${away}`;
                                  setMatchups(newMatchups);
                                }}
                                placeholder="Away Team (Optional)"
                              />
                            </div>
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder={sport === 'Basketball' ? 'Lakers vs Warriors (Optional)' : sport === 'Tennis' ? 'Alcaraz vs Djokovic (Optional)' : 'Selection Name (Optional)'} 
                            value={matchup} 
                            onChange={e => {
                              const newMatchups = [...matchups];
                              newMatchups[idx] = e.target.value;
                              setMatchups(newMatchups);
                            }} 
                            style={{ height: '44px', minHeight: '44px', padding: '0.5rem 0.85rem', fontSize: '0.88rem' }}
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
                      
                      {/* Render Market Selection ONLY for Football */}
                      {sport === 'Football' && (
                        <div className="flex-col gap-2 mt-2 pt-2" style={{ borderTop: '1px dashed var(--adaptive-white-05)' }}>
                          <span className="text-secondary" style={{ fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px' }}>MARKET SELECTION</span>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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
                                    padding: '5px 12px',
                                    borderRadius: '18px',
                                    fontSize: '0.78rem',
                                    fontWeight: isSelected ? 'bold' : '500',
                                    background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                    color: isSelected ? 'var(--success)' : 'var(--text-secondary)',
                                    border: `1px solid ${isSelected ? 'var(--success)' : 'var(--border-glass)'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    flexShrink: 0
                                  }}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {type !== 'Single' && (
                    <button type="button" onClick={() => {
                      setMatchups([...matchups, '']);
                      setMarkets([...markets, 'Match Winner']);
                    }} className="btn btn-secondary" style={{ width: 'fit-content', padding: '0.4rem 0.9rem', fontSize: '0.82rem', height: 'auto', border: '1px dashed var(--border-glass)' }}>
                      + Add Matchup Selection
                    </button>
                  )}
                </div>
              </div>

              {/* 4. Financial Calculation & Preset Bar */}
              <div className="grid grid-cols-2 gap-4" style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem 1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Stake Amount ({currencySymbol})</label>
                  </div>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="0.00" 
                    value={stake} 
                    onChange={e => setStake(e.target.value)} 
                    required 
                    min="0.01" 
                    step="0.01" 
                    style={{ height: '44px', minHeight: '44px', padding: '0.5rem 0.85rem', fontSize: '0.92rem', fontWeight: 'bold' }}
                  />
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {[5, 10, 20, 50, 100, 250].map(amt => (
                      <button 
                        key={amt} 
                        type="button" 
                        onClick={() => setStake(amt.toString())}
                        style={{
                          background: stake === amt.toString() ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${stake === amt.toString() ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'}`,
                          borderRadius: '8px',
                          padding: '0.2rem 0.55rem',
                          color: stake === amt.toString() ? '#38bdf8' : 'rgba(255, 255, 255, 0.75)',
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {currencySymbol}{amt}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="label" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginBottom: '0.35rem', display: 'block' }}>Decimal Odds (@)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    placeholder="2.00" 
                    value={odds} 
                    onChange={e => setOdds(e.target.value)} 
                    required 
                    min="1.01" 
                    step="0.01" 
                    style={{ height: '44px', minHeight: '44px', padding: '0.5rem 0.85rem', fontSize: '0.92rem', fontWeight: 'bold', color: '#22d3ee' }}
                  />

                  {/* Live Est. Return Pill */}
                  <div style={{ marginTop: '0.6rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', padding: '0.45rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '500' }}>Est. Return:</span>
                    <span style={{ fontSize: '0.92rem', color: '#10b981', fontWeight: '800', fontFamily: 'monospace' }}>
                      {currencySymbol}{(parseFloat(stake || 0) * parseFloat(odds || 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Commit Action Button */}
              <button 
                className="btn-white-pill" 
                type="submit" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  marginTop: '0.75rem', 
                  padding: '0.95rem',
                  fontSize: '1rem',
                  height: '52px',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {loading ? 'Processing Ledger Ingestion...' : (
                  <>
                    <span>Commit Log Entry to Cryptographic Ledger</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
