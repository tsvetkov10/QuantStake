import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Trash2, CheckCircle, XCircle, Clock, Banknote, AlertCircle, Edit3, Calendar, Coins, BadgePercent, Copy, CheckCircle2, TrendingUp } from 'lucide-react';
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

export default function BetDetails({ session, profile }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const deleteTimer = useRef(null);
  
  const startDeleteHover = () => {
    setDeleteProgress(0);
    let progress = 0;
    deleteTimer.current = setInterval(() => {
      progress += 2;
      if (progress >= 100) {
        progress = 100;
        clearInterval(deleteTimer.current);
      }
      setDeleteProgress(progress);
    }, 20);
  };
  
  const stopDeleteHover = () => {
    clearInterval(deleteTimer.current);
    setDeleteProgress(0);
  };
 
  const [cashoutInput, setCashoutInput] = useState('');
  const [cashoutError, setCashoutError] = useState(null);
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    sport: '',
    bookmaker: '',
    type: '',
    teams: '',
    stake: '',
    odds: '',
    status: '',
    created_at: '',
    cashout_amount: ''
  });

  useEffect(() => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const mockBetsRaw = sessionStorage.getItem('mock_bets');
      if (mockBetsRaw) {
        const list = JSON.parse(mockBetsRaw);
        const found = list.find(b => String(b.id) === String(id));
        setBet(found || null);
      } else {
        setBet(null);
      }
      setLoading(false);
      return;
    }

    const fetchBet = async () => {
      const { data, error } = await supabase.from('bets').select('*').eq('id', id).single();
      if (data) setBet(data);
      setLoading(false);
    };
    fetchBet();
  }, [id]);

  const getCurrencySymbol = (code) => {
    switch(code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD': default: return '$';
    }
  };
  
  const sym = getCurrencySymbol(profile?.currency);

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const mockBetsRaw = sessionStorage.getItem('mock_bets');
      if (mockBetsRaw) {
        const list = JSON.parse(mockBetsRaw);
        const filtered = list.filter(b => String(b.id) !== String(id));
        sessionStorage.setItem('mock_bets', JSON.stringify(filtered));
      }
      navigate('/history');
      return;
    }
    
    await supabase.from('bets').delete().eq('id', id);
    navigate('/history');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (bet.status === newStatus) return;
    
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const updated = { ...bet, status: newStatus, cashout_amount: null };
      setBet(updated);
      const mockBetsRaw = sessionStorage.getItem('mock_bets');
      if (mockBetsRaw) {
        const list = JSON.parse(mockBetsRaw);
        const idx = list.findIndex(b => String(b.id) === String(id));
        if (idx !== -1) {
          list[idx] = updated;
          sessionStorage.setItem('mock_bets', JSON.stringify(list));
        }
      }
      return;
    }
    
    const { error } = await supabase.from('bets').update({ status: newStatus, cashout_amount: null }).eq('id', id);
    if (!error) {
      setBet({ ...bet, status: newStatus, cashout_amount: null });
    }
  };

  const handleCashoutClick = () => {
    setCashoutInput('');
    setCashoutError(null);
    setShowCashoutModal(true);
  };

  const submitCashout = async () => {
    setCashoutError(null);
    const amount = parseFloat(cashoutInput.replace(',', '.'));
    if (isNaN(amount) || amount < 0) {
      setCashoutError("Please enter a valid cashout amount.");
      return;
    }

    const maxWin = bet.stake * bet.odds;
    if (amount > maxWin) {
      setCashoutError(`Cashout cannot exceed the maximum possible return (${sym}${maxWin.toFixed(2)}).`);
      return;
    }

    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const updated = { ...bet, status: 'Cashed Out', cashout_amount: amount };
      setBet(updated);
      const mockBetsRaw = sessionStorage.getItem('mock_bets');
      if (mockBetsRaw) {
        const list = JSON.parse(mockBetsRaw);
        const idx = list.findIndex(b => String(b.id) === String(id));
        if (idx !== -1) {
          list[idx] = updated;
          sessionStorage.setItem('mock_bets', JSON.stringify(list));
        }
      }
      setShowCashoutModal(false);
      return;
    }

    const { error } = await supabase.from('bets').update({ status: 'Cashed Out', cashout_amount: amount }).eq('id', id);
    if (!error) {
      setBet({ ...bet, status: 'Cashed Out', cashout_amount: amount });
      setShowCashoutModal(false);
    } else {
      setCashoutError("Error saving cashout.");
    }
  };

  const startEditing = () => {
    setEditForm({
      sport: bet.sport || 'Football',
      bookmaker: bet.bookmaker || '',
      type: bet.type || 'Single',
      teams: bet.teams || '',
      stake: String(bet.stake),
      odds: String(bet.odds),
      status: bet.status || 'Pending',
      created_at: bet.created_at ? bet.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      cashout_amount: bet.cashout_amount ? String(bet.cashout_amount) : ''
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const stakeNum = parseFloat(editForm.stake);
    const oddsNum = parseFloat(editForm.odds);
    const cashoutNum = editForm.status === 'Cashed Out' ? parseFloat(editForm.cashout_amount) : null;

    if (isNaN(stakeNum) || stakeNum <= 0) {
      alert("Please enter a valid stake amount.");
      return;
    }
    if (isNaN(oddsNum) || oddsNum <= 1) {
      alert("Please enter odds greater than 1.00.");
      return;
    }
    if (editForm.status === 'Cashed Out' && (isNaN(cashoutNum) || cashoutNum < 0)) {
      alert("Please enter a valid cashout amount.");
      return;
    }

    const timePart = bet.created_at ? bet.created_at.split('T')[1] || new Date().toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0];
    const selectedTime = new Date(`${editForm.created_at}T${timePart}`).toISOString();

    const updated = {
      ...bet,
      sport: editForm.sport,
      bookmaker: editForm.bookmaker,
      type: editForm.type,
      teams: editForm.teams,
      stake: stakeNum,
      odds: oddsNum,
      status: editForm.status,
      created_at: selectedTime,
      cashout_amount: cashoutNum
    };

    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      setBet(updated);
      const mockBetsRaw = sessionStorage.getItem('mock_bets');
      if (mockBetsRaw) {
        const list = JSON.parse(mockBetsRaw);
        const idx = list.findIndex(b => String(b.id) === String(id));
        if (idx !== -1) {
          list[idx] = updated;
          sessionStorage.setItem('mock_bets', JSON.stringify(list));
        }
      }
      setIsEditing(false);
      return;
    }

    const { error } = await supabase.from('bets').update({
      sport: editForm.sport,
      bookmaker: editForm.bookmaker,
      type: editForm.type,
      teams: editForm.teams,
      stake: stakeNum,
      odds: oddsNum,
      status: editForm.status,
      created_at: selectedTime,
      cashout_amount: cashoutNum
    }).eq('id', id);

    if (!error) {
      setBet(updated);
      setIsEditing(false);
    } else {
      alert("Failed to save edits to secure ledger: " + error.message);
    }
  };

  const showToastMsg = (title, message) => {
    setToast({ title, message });
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToast(null), 300);
    }, 3000);
  };

  const copyLiveSlipAsImage = async () => {
    const element = document.getElementById('live-slip-preview');
    const logoEl = document.getElementById('live-slip-logo');
    if (!element) return;

    try {
      if (logoEl) logoEl.style.display = 'flex';

      const blob = await htmlToImage.toBlob(element, {
        quality: 1.0,
        pixelRatio: 2,
        cacheBust: true,
        filter: (node) => {
          return node.getAttribute ? node.getAttribute('data-html2canvas-ignore') !== 'true' : true;
        }
      });

      if (logoEl) logoEl.style.display = 'none';

      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToastMsg(
          'LEDGER EXPORT COMPLETE',
          `Draft slip copied to clipboard as PNG! (TX: 0x${generatedHash.slice(0, 8)})`
        );
      } catch (clipErr) {
        await navigator.clipboard.writeText(`QuantStake Edit Slip: 0x${generatedHash}`);
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

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Decrypting block records...</div>;
  if (!bet) return <div style={{ padding: '4rem', textAlign: 'center' }}>Entry not found on this ledger node.</div>;

  // Real-time calculations for slip preview in edit mode
  const activeStake = parseFloat(editForm.stake) || 0;
  const activeOdds = parseFloat(editForm.odds) || 0;
  const estPayout = activeStake * activeOdds;
  const netProfitVal = editForm.status === 'Won' ? activeStake * (activeOdds - 1) : 
                       editForm.status === 'Cashed Out' ? (parseFloat(editForm.cashout_amount || 0) - activeStake) : 
                       editForm.status === 'Lost' ? -activeStake : 0;

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
  const activeSportColor = getSportColor(editForm.sport);

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Won': return { label: 'INGESTION WON', color: '#00ff88', shadow: '0 0 12px #00ff88' };
      case 'Lost': return { label: 'INGESTION LOST', color: '#ff3366', shadow: '0 0 12px #ff3366' };
      case 'Cashed Out': return { label: 'CASHED OUT', color: '#ffb900', shadow: '0 0 12px #ffb900' };
      default: return { label: 'INGESTION PENDING', color: 'var(--accent-cyan)', shadow: '0 0 12px var(--accent-cyan)' };
    }
  };
  const statusInfo = getStatusStyles(editForm.status);

  // Generate SHA-256 hash of the edit inputs
  const combinedInputData = `${editForm.sport}-${editForm.bookmaker}-${editForm.type}-${editForm.created_at}-${editForm.stake}-${editForm.odds}-${editForm.teams}`;
  const generatedHash = sha256(combinedInputData).toUpperCase();

  // Scoreboard layout parsing for teams matchup
  const renderMatchupsBlock = (teamsString, sportColor) => {
    if (!teamsString) return <span style={{ color: 'var(--text-secondary)', opacity: 0.5, fontSize: '0.85rem' }}>[Pending Selection Input]</span>;
    const legs = teamsString.split(' | ');
    return (
      <div className="flex-col gap-3 mt-1">
        {legs.map((leg, idx) => {
          const hasVs = leg.includes(' vs ');
          if (hasVs) {
            const teams = leg.split(' vs ');
            return (
              <div 
                key={idx}
                style={{ 
                  background: 'linear-gradient(135deg, var(--item-gradient-1) 0%, var(--item-gradient-2) 100%)', 
                  border: '1px solid var(--adaptive-white-04)',
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  overflow: 'hidden',
                  boxShadow: 'inset 0 1px 1px var(--adaptive-white-05), 0 4px 12px var(--adaptive-white-02)'
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
              </div>
            );
          }
          
          return (
            <div 
              key={idx}
              style={{ 
                background: 'linear-gradient(135deg, var(--item-gradient-1) 0%, var(--item-gradient-2) 100%)', 
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
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex-col gap-6 w-full" style={{ animation: 'fade-in 0.3s ease' }}>
      
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
      
      <div className="flex justify-between items-center w-full">
        <Link to="/history" className="text-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to History
        </Link>
        <div className="flex gap-3">
          {!isEditing && (
            <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={startEditing}>
              <Edit3 size={16} /> Edit Entry
            </button>
          )}
          <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--border-glass)', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleDelete}>
            <Trash2 size={16} /> Delete Bet
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
          {isEditing ? 'Modify Terminal Record' : 'Ledger Ingestion Record'}
        </h2>
        <p className="text-secondary">
          {isEditing ? 'Update the cryptographically signed ledger details below.' : `Record key: ${bet.id}`}
        </p>
      </div>

      {isEditing ? (
        /* EDIT SPLIT SCREEN LAYOUT */
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'start', width: '100%' }}>
          
          {/* Left Column: Form Card */}
          <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <form onSubmit={handleSaveEdit} className="glass-panel flex-col gap-6" style={{ padding: '2rem' }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Sport</label>
                  <select className="input-field mt-1" value={editForm.sport} onChange={e => setEditForm({ ...editForm, sport: e.target.value })}>
                    <option value="Football">Football</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Tennis">Tennis</option>
                    <option value="MMA">MMA</option>
                    <option value="Esports">Esports</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label">Bookmaker</label>
                  <select className="input-field mt-1" value={editForm.bookmaker} onChange={e => setEditForm({ ...editForm, bookmaker: e.target.value })}>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Bet Type</label>
                  <input type="text" className="input-field mt-1" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Date</label>
                  <input type="date" className="input-field mt-1" value={editForm.created_at} onChange={e => setEditForm({ ...editForm, created_at: e.target.value })} required />
                </div>
              </div>

              <div>
                <label className="label">Teams / Selection Matchups</label>
                <input type="text" className="input-field mt-1" value={editForm.teams} onChange={e => setEditForm({ ...editForm, teams: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Stake</label>
                  <input type="number" step="0.01" className="input-field mt-1" value={editForm.stake} onChange={e => setEditForm({ ...editForm, stake: e.target.value })} required />
                </div>
                <div>
                  <label className="label">Odds</label>
                  <input type="number" step="0.01" className="input-field mt-1" value={editForm.odds} onChange={e => setEditForm({ ...editForm, odds: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Status</label>
                  <select className="input-field mt-1" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                    <option value="Pending">Pending</option>
                    <option value="Won">Won</option>
                    <option value="Lost">Lost</option>
                    <option value="Cashed Out">Cashed Out</option>
                  </select>
                </div>
                {editForm.status === 'Cashed Out' && (
                  <div>
                    <label className="label">Cashout Return Amount</label>
                    <input type="number" step="0.01" className="input-field mt-1" value={editForm.cashout_amount} onChange={e => setEditForm({ ...editForm, cashout_amount: e.target.value })} required />
                  </div>
                )}
              </div>

              <div className="flex gap-4 mt-4">
                <button 
                  type="submit" 
                  className="btn btn-secondary" 
                  style={{ 
                    flex: 1, 
                    background: 'rgba(0, 243, 255, 0.03)', 
                    border: '1.5px solid rgba(0, 243, 255, 0.3)', 
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.03)'; }}
                >
                  Save Changes
                </button>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>

          {/* Right Column: Live Premium Ticket Preview */}
          <div style={{ width: '380px', flexShrink: 0, position: 'sticky', top: '1.5rem', display: 'flex', flexDirection: 'column' }}>
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
                    EDIT DRAFT
                  </span>
                </div>
              </div>

              {/* Title / Header */}
              <div className="flex-col gap-1 text-center mb-6" style={{ borderBottom: '1px dashed var(--adaptive-white-10)', paddingBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: 'monospace', fontSize: '1.15rem', color: 'var(--text-primary)', letterSpacing: '4px', margin: 0, fontWeight: 'bold' }}>
                  QUANTSTAKE INDEX
                </h3>
                <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase' }}>
                  Modifying Cryptographic Record
                </p>
              </div>

              {/* Ticket Info Rows */}
              <div className="flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>SPORT</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: activeSportColor, background: 'var(--adaptive-white-03)', padding: '0.2rem 0.6rem', borderRadius: '4px', textTransform: 'uppercase' }}>
                    {editForm.sport}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>BET TYPE</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>{editForm.type}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>BOOKMAKER</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500' }}>{editForm.bookmaker}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-secondary" style={{ fontSize: '0.8rem' }}>LEDGER DATE</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} className="text-secondary" /> {editForm.created_at}
                  </span>
                </div>

                {/* Beautified Matchup Content */}
                <div className="flex-col gap-1.5 mt-1">
                  {renderMatchupsBlock(editForm.teams, activeSportColor)}
                </div>

                {/* Dotted border separator */}
                <div style={{ borderTop: '2px dashed var(--adaptive-white-10)', marginTop: '0.75rem', marginBottom: '0.75rem' }} />

                {/* Financial panel */}
                <div className="flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary" style={{ fontSize: '0.85rem', display: 'flex', items: 'center', gap: '4px' }}>
                      <Coins size={14} /> Total Wagered
                    </span>
                    <span style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>
                      {sym}{activeStake.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-secondary" style={{ fontSize: '0.85rem', display: 'flex', items: 'center', gap: '4px' }}>
                      <BadgePercent size={14} /> Decimal Odds
                    </span>
                    <span style={{ fontSize: '1.15rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                      @{activeOdds.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-1 p-2 rounded-lg" style={{ background: 'rgba(0, 243, 255, 0.02)', border: '1px solid rgba(0, 243, 255, 0.1)' }}>
                    <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      Est. Return
                    </span>
                    <span style={{ fontSize: '1.3rem', color: '#00ffaa', fontWeight: 'bold', textShadow: '0 0 10px rgba(0, 255, 170, 0.2)' }}>
                      {sym}{estPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-1 p-2 rounded-lg" style={{ background: 'rgba(0, 243, 255, 0.05)', border: '1px solid rgba(0, 243, 255, 0.2)' }}>
                    <span className="text-secondary" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                      PnL Return
                    </span>
                    <span style={{ fontSize: '1.4rem', color: netProfitVal >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold', textShadow: `0 0 12px ${netProfitVal >= 0 ? 'rgba(0, 255, 170, 0.3)' : 'rgba(255, 51, 102, 0.3)'}` }}>
                      {netProfitVal >= 0 ? '+' : ''}{sym}{netProfitVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Barcode & Hash Footer */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--adaptive-white-05)' }}>
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
                            opacity: 0.18,
                            flexShrink: 0
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-center w-full" style={{ marginTop: '0.25rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.5, letterSpacing: '1px', textAlign: 'center' }}>
                      0x{generatedHash}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      ) : (
        /* STANDARD DETAILS CARD VIEW */
        <div className="glass-panel grid grid-cols-2 gap-6" style={{ animation: 'fade-in 0.3s ease' }}>
          <div>
            <p className="label">Sport</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>{bet.sport}</p>
          </div>
          <div>
            <p className="label">Bookmaker</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>{bet.bookmaker || 'N/A'}</p>
          </div>
          <div>
            <p className="label">Bet Type</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>{bet.type}</p>
          </div>
          <div>
            <p className="label">Ledger Ingestion Date</p>
            <p style={{ fontSize: '1.2rem', fontWeight: '500' }}>{new Date(bet.created_at).toLocaleDateString([], { dateStyle: 'medium' })}</p>
          </div>
          <div className="grid-colspan-2" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', gridColumn: 'span 2' }}>
            <p className="label">Wager Matchups / Selections</p>
            <div style={{ marginTop: '0.5rem' }}>
              {renderMatchupsBlock(bet.teams, activeSportColor)}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
            <p className="label">Stake Amount</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{sym}{bet.stake.toFixed(2)}</p>
          </div>
          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
            <p className="label">Wager Odds</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>@{bet.odds.toFixed(2)}</p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', gridColumn: 'span 2' }}>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <p className="label">Ledger Settlement</p>
                <div className="flex gap-2 mt-2">
                  {['Pending', 'Won', 'Lost'].map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      style={{
                        padding: '0.4rem 1rem',
                        borderRadius: '8px',
                        border: '1.5px solid var(--border-glass)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        background: bet.status === st ? 
                                    (st === 'Won' ? 'rgba(16, 185, 129, 0.15)' : st === 'Lost' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 243, 255, 0.15)') : 
                                    'var(--adaptive-white-02)',
                        borderColor: bet.status === st ? 
                                    (st === 'Won' ? 'var(--success)' : st === 'Lost' ? 'var(--danger)' : 'var(--accent-cyan)') : 
                                    'var(--border-glass)',
                        color: bet.status === st ? 'white' : 'var(--text-secondary)',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                  <button 
                    onClick={handleCashoutClick}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '8px',
                      border: '1.5px solid var(--border-glass)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      background: bet.status === 'Cashed Out' ? 'rgba(255, 215, 0, 0.15)' : 'var(--adaptive-white-02)',
                      borderColor: bet.status === 'Cashed Out' ? '#FFD700' : 'var(--border-glass)',
                      color: bet.status === 'Cashed Out' ? 'white' : 'var(--text-secondary)',
                      fontWeight: 'bold',
                      transition: 'all 0.2s'
                    }}
                  >
                    Cash Out
                  </button>
                </div>
              </div>

              <div className="flex-col items-end text-right">
                <p className="label">PnL Return</p>
                <h3 style={{ 
                  fontSize: '2.2rem', 
                  fontWeight: 'bold', 
                  color: bet.status === 'Won' ? 'var(--success)' : 
                         bet.status === 'Lost' ? 'var(--danger)' : 
                         bet.status === 'Cashed Out' ? '#FFD700' : 'var(--text-secondary)'
                }}>
                  {bet.status === 'Won' ? `+${sym}${(bet.stake * bet.odds).toFixed(2)}` : 
                   bet.status === 'Lost' ? `-${sym}${bet.stake.toFixed(2)}` : 
                   bet.status === 'Cashed Out' ? `+${sym}${bet.cashout_amount?.toFixed(2)}` : 
                   'Pending'}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cashout Modal */}
      {showCashoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'var(--bg-modal)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem', animation: 'fade-in 0.3s ease' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>Record Cashout Value</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Enter the exact return amount received from the bookmaker.
            </p>
            {cashoutError && (
              <div style={{ padding: '0.75rem', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {cashoutError}
              </div>
            )}
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. 120.50" 
              value={cashoutInput} 
              onChange={e => setCashoutInput(e.target.value)} 
              autoFocus 
            />
            <div className="flex gap-4 mt-6">
              <button 
                onClick={submitCashout}
                className="btn btn-secondary"
                style={{ 
                  flex: 1, 
                  background: 'rgba(0, 243, 255, 0.03)', 
                  border: '1.5px solid rgba(0, 243, 255, 0.3)', 
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Log Cashout
              </button>
              <button onClick={() => setShowCashoutModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'var(--bg-modal)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem 2rem', textAlign: 'center', animation: 'fade-in 0.3s ease' }}>
            <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1.5rem auto' }} />
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.5rem', fontWeight: 'bold' }}>Expunge Ledger Block?</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>
              This will permanently delete bet ID <strong>{bet.id}</strong> from your records. This action is irreversible.
            </p>
            
            <div className="flex-col gap-4">
              <button 
                onMouseEnter={startDeleteHover}
                onMouseLeave={stopDeleteHover}
                onClick={confirmDelete}
                className="btn btn-secondary"
                style={{ 
                  width: '100%', 
                  background: 'rgba(239, 68, 68, 0.05)', 
                  border: '1.5px solid rgba(239, 68, 68, 0.4)', 
                  color: 'var(--text-primary)',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer'
                }}
              >
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${deleteProgress}%`, background: 'rgba(239, 68, 68, 0.3)', transition: 'width 0.02s linear', zIndex: 0 }} />
                <span style={{ position: 'relative', zIndex: 1 }}>
                  {deleteProgress >= 100 ? 'Release to Expunge' : deleteProgress > 0 ? 'Hold to Confirm...' : 'Hold to Delete'}
                </span>
              </button>
              
              <button onClick={() => setShowDeleteModal(false)} className="btn btn-secondary" style={{ width: '100%' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
