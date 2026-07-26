import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, CheckCircle2, XCircle, Clock, Banknote, PlusCircle, Activity, Sparkles, Percent, LayoutGrid, List, Copy, X, Edit3, Trash2, Calendar, Coins, BadgePercent } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

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

export default function BetHistory({ session, profile }) {
  const navigate = useNavigate();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewMode, setViewMode] = useState('slips'); // Default to slips
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Position Expanded Modal State
  const [selectedBet, setSelectedBet] = useState(null);
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

  const [showCashoutModal, setShowCashoutModal] = useState(false);
  const [cashoutInput, setCashoutInput] = useState('');
  const [cashoutError, setCashoutError] = useState(null);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedBet) {
        setSelectedBet(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBet]);

  useEffect(() => {
    document.title = 'Ledger - History';
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const mockBetsRaw = sessionStorage.getItem('mock_bets');
      if (mockBetsRaw) {
        setBets(JSON.parse(mockBetsRaw));
      } else {
        const defaultMock = [
          { id: '1', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), sport: 'Basketball', bookmaker: 'Bet365', type: 'Single', teams: 'Lakers vs Warriors', stake: 50, odds: 1.9, status: 'Won' },
          { id: '2', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), sport: 'Football', bookmaker: 'Betano', type: 'Multiple', teams: 'Acca', stake: 100, odds: 2.1, status: 'Lost' },
          { id: '3', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), sport: 'Tennis', bookmaker: 'Bet365', type: 'Single', teams: 'Alcaraz vs Djokovic', stake: 25, odds: 3.5, status: 'Won' },
          { id: '4', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), sport: 'Basketball', bookmaker: 'Inbet', type: 'Single', teams: 'Bulls vs Celtics', stake: 150, odds: 1.8, status: 'Pending' },
          { id: '5', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), sport: 'Football', bookmaker: 'Bet365', type: 'Single', teams: 'France vs Morocco', stake: 60, odds: 2.0, status: 'Lost' },
          { id: '6', created_at: new Date(Date.now() - 86400000 * 6).toISOString(), sport: 'Tennis', bookmaker: 'Betano', type: 'Single', teams: 'Djokovic vs Nadal', stake: 200, odds: 1.2, status: 'Won' }
        ];
        sessionStorage.setItem('mock_bets', JSON.stringify(defaultMock));
        setBets(defaultMock);
      }
      setLoading(false);
      return;
    }

    const fetchBets = async () => {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setBets(data);
      }
      setLoading(false);
    };

    fetchBets();
  }, []);

  const getCurrencySymbol = (code) => {
    switch(code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD': default: return '$';
    }
  };
  const sym = getCurrencySymbol(profile?.currency);

  // Stats calculation
  const totalBets = bets.length;
  const wonBets = bets.filter(b => b.status === 'Won');
  const lostBets = bets.filter(b => b.status === 'Lost');
  const cashedBets = bets.filter(b => b.status === 'Cashed Out');
  const activeCount = bets.filter(b => b.status === 'Pending').length;

  const totalWagered = bets.reduce((acc, curr) => acc + (parseFloat(curr.stake) || 0), 0);
  
  const netProfit = bets.reduce((acc, curr) => {
    const stake = parseFloat(curr.stake) || 0;
    const odds = parseFloat(curr.odds) || 0;
    if (curr.status === 'Won') {
      return acc + (stake * (odds - 1));
    } else if (curr.status === 'Lost') {
      return acc - stake;
    } else if (curr.status === 'Cashed Out') {
      const cashout = parseFloat(curr.cashout_amount) || 0;
      return acc + (cashout - stake);
    }
    return acc;
  }, 0);

  const overallRoi = totalWagered > 0 ? (netProfit / totalWagered) * 100 : 0;
  const resolved = bets.filter(b => b.status !== 'Pending');
  const winRate = resolved.length > 0 ? (wonBets.length / resolved.length) * 100 : 0;

  // Filter lists
  const sportsList = ['All', 'Football', 'Basketball', 'Tennis', 'MMA', 'Esports', 'Other'];
  const statusList = ['All', 'Pending', 'Won', 'Lost', 'Cashed Out'];

  const filteredBets = bets.filter(bet => {
    const matchesSearch = 
      bet.teams?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.sport?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.bookmaker?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSport = selectedSport === 'All' || bet.sport === selectedSport;
    const matchesStatus = selectedStatus === 'All' || bet.status === selectedStatus;

    return matchesSearch && matchesSport && matchesStatus;
  });

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

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Won': return { label: 'INGESTION WON', color: '#00ff88', shadow: '0 0 12px #00ff88' };
      case 'Lost': return { label: 'INGESTION LOST', color: '#ff3366', shadow: '0 0 12px #ff3366' };
      case 'Cashed Out': return { label: 'CASHED OUT', color: '#ffb900', shadow: '0 0 12px #ffb900' };
      default: return { label: 'INGESTION PENDING', color: 'var(--accent-cyan)', shadow: '0 0 12px var(--accent-cyan)' };
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

  // Open direct overlay details modal
  const openBetDetailsModal = (bet) => {
    setSelectedBet(bet);
    setIsEditing(false);
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
  };

  // Settlement changes from direct overlay
  const handleUpdateStatus = async (betId, newStatus) => {
    const targetBet = bets.find(b => String(b.id) === String(betId));
    if (!targetBet || targetBet.status === newStatus) return;

    const updatedFields = { status: newStatus, cashout_amount: null };

    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const updatedBets = bets.map(b => {
        if (String(b.id) === String(betId)) {
          return { ...b, ...updatedFields };
        }
        return b;
      });
      sessionStorage.setItem('mock_bets', JSON.stringify(updatedBets));
      setBets(updatedBets);
      setSelectedBet({ ...selectedBet, ...updatedFields });
      showToastMsg('SETTLEMENT UPDATED', `Position marked as ${newStatus}`);
      return;
    }

    const { error } = await supabase.from('bets').update(updatedFields).eq('id', betId);
    if (!error) {
      const updatedBets = bets.map(b => {
        if (String(b.id) === String(betId)) {
          return { ...b, ...updatedFields };
        }
        return b;
      });
      setBets(updatedBets);
      setSelectedBet({ ...selectedBet, ...updatedFields });
      showToastMsg('SETTLEMENT UPDATED', `Position marked as ${newStatus}`);
    } else {
      alert("Failed to update settlement: " + error.message);
    }
  };

  // Log Cashout Return Value from submodal
  const submitCashout = async (betId) => {
    setCashoutError(null);
    const amount = parseFloat(cashoutInput.replace(',', '.'));
    if (isNaN(amount) || amount < 0) {
      setCashoutError("Please enter a valid cashout amount.");
      return;
    }

    const maxWin = selectedBet.stake * selectedBet.odds;
    if (amount > maxWin) {
      setCashoutError(`Cashout cannot exceed maximum return (${sym}${maxWin.toFixed(2)}).`);
      return;
    }

    const updatedFields = { status: 'Cashed Out', cashout_amount: amount };

    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const updatedBets = bets.map(b => {
        if (String(b.id) === String(betId)) {
          return { ...b, ...updatedFields };
        }
        return b;
      });
      sessionStorage.setItem('mock_bets', JSON.stringify(updatedBets));
      setBets(updatedBets);
      setSelectedBet({ ...selectedBet, ...updatedFields });
      setShowCashoutModal(false);
      showToastMsg('CASHOUT RECORDED', `Position cashed out for ${sym}${amount}`);
      return;
    }

    const { error } = await supabase.from('bets').update(updatedFields).eq('id', betId);
    if (!error) {
      const updatedBets = bets.map(b => {
        if (String(b.id) === String(betId)) {
          return { ...b, ...updatedFields };
        }
        return b;
      });
      setBets(updatedBets);
      setSelectedBet({ ...selectedBet, ...updatedFields });
      setShowCashoutModal(false);
      showToastMsg('CASHOUT RECORDED', `Position cashed out for ${sym}${amount}`);
    } else {
      setCashoutError("Error saving cashout: " + error.message);
    }
  };

  // Save full edits from direct overlay
  const handleSaveEdit = async (e, betId) => {
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

    const timePart = selectedBet.created_at ? selectedBet.created_at.split('T')[1] || new Date().toTimeString().split(' ')[0] : new Date().toTimeString().split(' ')[0];
    const selectedTime = new Date(`${editForm.created_at}T${timePart}`).toISOString();

    const updatedFields = {
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
      const updatedBets = bets.map(b => {
        if (String(b.id) === String(betId)) {
          return { ...b, ...updatedFields };
        }
        return b;
      });
      sessionStorage.setItem('mock_bets', JSON.stringify(updatedBets));
      setBets(updatedBets);
      setSelectedBet({ ...selectedBet, ...updatedFields });
      setIsEditing(false);
      showToastMsg('RECORD UPDATED', 'Cryptographic block record details updated.');
      return;
    }

    const { error } = await supabase.from('bets').update(updatedFields).eq('id', betId);
    if (!error) {
      const updatedBets = bets.map(b => {
        if (String(b.id) === String(betId)) {
          return { ...b, ...updatedFields };
        }
        return b;
      });
      setBets(updatedBets);
      setSelectedBet({ ...selectedBet, ...updatedFields });
      setIsEditing(false);
      showToastMsg('RECORD UPDATED', 'Cryptographic block record details updated.');
    } else {
      alert("Failed to save edits to secure ledger: " + error.message);
    }
  };

  // Delete position from direct overlay
  const confirmDelete = async (betId) => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      const updatedBets = bets.filter(b => String(b.id) !== String(betId));
      sessionStorage.setItem('mock_bets', JSON.stringify(updatedBets));
      setBets(updatedBets);
      setSelectedBet(null);
      showToastMsg('RECORD EXPUNGED', 'Position has been deleted from local storage.');
      return;
    }
    
    const { error } = await supabase.from('bets').delete().eq('id', betId);
    if (!error) {
      const updatedBets = bets.filter(b => String(b.id) !== String(betId));
      setBets(updatedBets);
      setSelectedBet(null);
      showToastMsg('RECORD EXPUNGED', 'Position has been deleted from secure ledger.');
    } else {
      alert("Failed to delete position: " + error.message);
    }
  };

  // Capture slip element and copy to clipboard as png image
  const copySlipAsImage = async (e, betId, hash) => {
    e.stopPropagation(); // prevent card click
    const element = document.getElementById(`slip-card-${betId}`);
    if (!element) return;

    try {
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

      if (!blob) return;
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        showToastMsg(
          'LEDGER EXPORT COMPLETE',
          `Slip copied to clipboard as PNG! (TX: 0x${hash.slice(0, 8)})`
        );
      } catch (clipErr) {
        console.warn('Clipboard write failed, downloading instead...', clipErr);
        download(blob, `QuantStakes_Slip_${hash.slice(0, 8)}.png`);
        showToastMsg(
          'LEDGER EXPORT COMPLETE',
          'Image export blocked by browser. Slip exported to downloads folder instead.'
        );
      }
    } catch (err) {
      console.error('Failed to capture image:', err);
    }
  };

  // Scoreboard layout parsing for teams matchup
  const renderMatchupsBlock = (teamsString, sportColor) => {
    if (!teamsString) return <span style={{ color: 'rgba(255, 255, 255, 0.4)', opacity: 0.5, fontSize: '0.85rem' }}>[Pending Selection Input]</span>;
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
                  overflow: 'hidden',
                  minHeight: '104px'
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

                <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.6rem', color: '#a78bfa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{market}</span>
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
                gap: '6px',
                overflow: 'hidden',
                minHeight: '104px'
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: sportColor }} />
              
              <div className="flex justify-between items-center" style={{ fontSize: '0.55rem', fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <span>SELECTION LEG #{idx + 1}</span>
                <span style={{ color: sportColor }}>ACTIVE RUNTIME</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px', flex: 1 }}>
                <div className="flex-col" style={{ minWidth: 0, flex: 1 }}>
                  <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{leg}</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase' }}>Selection</span>
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '6px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '0.6rem', color: '#a78bfa', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>{market}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const modalSportColor = selectedBet ? getSportColor(selectedBet.sport) : 'var(--text-secondary)';
  const modalStatusInfo = selectedBet ? getStatusStyles(selectedBet.status) : { label: '', color: 'transparent', shadow: 'none' };
  const modalStake = selectedBet ? (parseFloat(selectedBet.stake) || 0) : 0;
  const modalOdds = selectedBet ? (parseFloat(selectedBet.odds) || 0) : 0;
  const modalNetProfitVal = selectedBet ? (
    selectedBet.status === 'Won' ? modalStake * (modalOdds - 1) : 
    selectedBet.status === 'Cashed Out' ? (parseFloat(selectedBet.cashout_amount || 0) - modalStake) : 
    (selectedBet.status === 'Lost' ? -modalStake : 0)
  ) : 0;

  return (
    <div className="flex-col gap-6 w-full" style={{ animation: 'fade-in 0.4s ease' }}>
      
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
        
        /* Lost slips hover reset */
        .lost-slip-hover {
          transition: all 0.3s ease;
        }
        .lost-slip-hover:hover {
          opacity: 1.0 !important;
          transform: translateY(-2px);
          box-shadow: 0 5px 25px rgba(255, 51, 102, 0.1) !important;
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
              boxShadow: '0 10px 40px rgba(167, 139, 250, 0.2)',
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              borderRadius: '12px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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

      {/* Header section */}
      <div className="flex justify-between items-end flex-wrap gap-6">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Quantitative Ledger</h2>
          <p className="text-secondary">Audit, filter, and monitor all positions in your portfolio.</p>
        </div>

        <button 
          onClick={() => navigate('/add')}
          className="btn btn-secondary" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0.6rem 1.25rem',
            height: 'auto',
            background: 'rgba(167, 139, 250, 0.03)',
            border: '1.5px solid rgba(167, 139, 250, 0.3)',
            color: 'var(--text-primary)',
            boxShadow: '0 0 10px rgba(167, 139, 250, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.1)'; e.currentTarget.style.boxShadow = '0 0 15px rgba(167, 139, 250, 0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.03)'; e.currentTarget.style.boxShadow = '0 0 10px rgba(167, 139, 250, 0.1)'; }}
        >
          <PlusCircle size={18} /> Log New Position
        </button>
      </div>

      {/* Mini Performance Ribbon */}
      <div className="grid grid-cols-4 gap-6" style={{ animation: 'fade-in 0.3s ease' }}>
        <div className="glass-panel flex items-center justify-between" style={{ padding: '1.25rem' }}>
          <div className="flex-col">
            <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Signals</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{activeCount} Plays</span>
          </div>
          <Clock size={24} color="var(--accent-cyan)" style={{ opacity: 0.8 }} />
        </div>
        <div className="glass-panel flex items-center justify-between" style={{ padding: '1.25rem' }}>
          <div className="flex-col">
            <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Success Win Rate</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{winRate.toFixed(1)}%</span>
          </div>
          <Activity size={24} color="var(--accent-magenta)" style={{ opacity: 0.8 }} />
        </div>
        <div className="glass-panel flex items-center justify-between" style={{ padding: '1.25rem' }}>
          <div className="flex-col">
            <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Yield (ROI)</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem' }}>
              {overallRoi >= 0 ? '+' : ''}{overallRoi.toFixed(1)}%
            </span>
          </div>
          <Percent size={24} color={netProfit >= 0 ? 'var(--success)' : 'var(--danger)'} style={{ opacity: 0.8 }} />
        </div>
        <div className="glass-panel flex items-center justify-between" style={{ padding: '1.25rem' }}>
          <div className="flex-col">
            <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Net Profit</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem' }}>
              {netProfit >= 0 ? '+' : ''}{sym}{netProfit.toFixed(2)}
            </span>
          </div>
          <Sparkles size={24} color={netProfit >= 0 ? 'var(--success)' : 'var(--danger)'} style={{ opacity: 0.8 }} />
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="glass-panel flex-col gap-4" style={{ padding: '1.5rem' }}>
        <div className="flex justify-between items-center gap-4 flex-wrap">
          
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
            <Search size={18} className="text-secondary" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search selection, bookmaker, sport..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            {/* Status Select dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: '600' }}>STATUS:</span>
              <select 
                className="input-field" 
                style={{ width: '130px', padding: '0.5rem 1rem', height: 'auto', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
              >
                {statusList.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Layout Toggle Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-lg" style={{ background: 'var(--adaptive-white-02)', border: '1px solid var(--border-glass)' }}>
              <button 
                onClick={() => setViewMode('slips')}
                title="View Slips Grid"
                style={{
                  background: viewMode === 'slips' ? 'rgba(167, 139, 250,0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem',
                  cursor: 'pointer',
                  color: viewMode === 'slips' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('rows')}
                title="View Rows List"
                style={{
                  background: viewMode === 'rows' ? 'rgba(167, 139, 250,0.08)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.35rem',
                  cursor: 'pointer',
                  color: viewMode === 'rows' ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Sport filter chips */}
        <div className="flex gap-2 items-center flex-wrap" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <span className="text-secondary" style={{ fontSize: '0.8rem', fontWeight: 'bold', marginRight: '0.5rem' }}>CATEGORIES:</span>
          {sportsList.map(sp => (
            <button
              key={sp}
              onClick={() => setSelectedSport(sp)}
              style={{
                padding: '0.35rem 0.85rem',
                fontSize: '0.8rem',
                borderRadius: '20px',
                cursor: 'pointer',
                background: selectedSport === sp ? 'rgba(167, 139, 250, 0.1)' : 'var(--adaptive-white-02)',
                border: `1.5px solid ${selectedSport === sp ? 'var(--accent-cyan)' : 'var(--border-glass)'}`,
                color: selectedSport === sp ? 'white' : 'var(--text-secondary)',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { if (selectedSport !== sp) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { if (selectedSport !== sp) e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
            >
              {sp === 'Football' ? '⚽ Football' : 
               sp === 'Basketball' ? '🏀 Basketball' : 
               sp === 'Tennis' ? '🎾 Tennis' : 
               sp === 'MMA' ? '🥊 MMA' : 
               sp === 'Esports' ? '🎮 Esports' : 
               sp === 'Other' ? '🎯 Other' : sp}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Main List Content */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>Synchronizing ledger entries...</div>
      ) : filteredBets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No positions matching the selected filter criteria.
        </div>
      ) : viewMode === 'rows' ? (
        /* LIST ROWS VIEW MODE */
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', animation: 'fade-in 0.5s ease' }}>
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--adaptive-white-03)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Sport</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Wager Prediction</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Stake</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Odds</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'center', width: '150px' }}>Status</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>PnL Return</th>
                  <th style={{ padding: '1.25rem 1.5rem', width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {filteredBets.map((bet) => {
                  const returnAmount = bet.status === 'Won' ? (bet.stake * bet.odds) : 
                                       bet.status === 'Cashed Out' ? (bet.cashout_amount || 0) : 
                                       (bet.status === 'Lost' ? 0 : null);
                  
                  return (
                    <tr 
                      key={bet.id} 
                      onClick={() => openBetDetailsModal(bet)}
                      style={{ borderBottom: '1px solid var(--border-glass)', cursor: 'pointer' }} 
                      className="ledger-row"
                    >
                      <td style={{ padding: '1.25rem 1.5rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '500' }}>{new Date(bet.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-secondary" style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>{new Date(bet.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <span style={{ 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '8px', 
                          background: bet.sport === 'Football' ? 'rgba(167, 139, 250, 0.05)' : 'var(--adaptive-white-03)', 
                          border: `1px solid ${bet.sport === 'Football' ? 'rgba(167, 139, 250, 0.15)' : 'var(--adaptive-white-05)'}`,
                          fontSize: '0.8rem',
                          color: bet.sport === 'Football' ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                        }}>
                          {bet.sport}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: 'var(--text-primary)' }}>{bet.teams || 'N/A'}</div>
                        <div className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{bet.type} • {bet.bookmaker}</div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold', textAlign: 'right' }}>{sym}{Number(bet.stake).toFixed(2)}</td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold', textAlign: 'right', color: 'var(--accent-cyan)' }}>{Number(bet.odds).toFixed(2)}</td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '0.35rem 0.85rem',
                          borderRadius: '999px',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: bet.status === 'Won' ? 'rgba(16, 185, 129, 0.08)' : 
                                           bet.status === 'Lost' ? 'rgba(239, 68, 68, 0.08)' : 
                                           bet.status === 'Cashed Out' ? 'rgba(255, 215, 0, 0.08)' : 'rgba(167, 139, 250, 0.08)',
                          color: bet.status === 'Won' ? 'var(--success)' : 
                                 bet.status === 'Lost' ? 'var(--danger)' : 
                                 bet.status === 'Cashed Out' ? '#FFD700' : 'var(--accent-cyan)',
                          border: `1.5px solid ${
                            bet.status === 'Won' ? 'rgba(16, 185, 129, 0.2)' : 
                            bet.status === 'Lost' ? 'rgba(239, 68, 68, 0.2)' : 
                            bet.status === 'Cashed Out' ? 'rgba(255, 215, 0, 0.2)' : 'rgba(167, 139, 250, 0.2)'
                          }`,
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {bet.status === 'Won' && <CheckCircle2 size={12} />}
                          {bet.status === 'Lost' && <XCircle size={12} />}
                          {bet.status === 'Cashed Out' && <Banknote size={12} />}
                          {bet.status === 'Pending' && <Clock size={12} className="animate-pulse" />}
                          {bet.status}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                        {returnAmount !== null ? (
                          <span style={{ 
                            color: bet.status === 'Won' ? 'var(--success)' : bet.status === 'Cashed Out' ? '#FFD700' : 'var(--text-secondary)', 
                            fontSize: '1.05rem' 
                          }}>
                            {bet.status === 'Won' ? '+' : ''}{sym}{Number(returnAmount).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-secondary">—</span>
                        )}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <ChevronRight size={18} className="text-secondary opacity-30 group-hover:opacity-100 transition-opacity" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TERMINAL TICKET SLIPS VIEW MODE */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem', animation: 'fade-in 0.5s ease' }}>
          {filteredBets.map((bet) => {
            const activeStake = parseFloat(bet.stake) || 0;
            const activeOdds = parseFloat(bet.odds) || 0;
            const estPayout = activeStake * activeOdds;
            const netProfitVal = bet.status === 'Won' ? activeStake * (activeOdds - 1) : 
                                 bet.status === 'Cashed Out' ? (parseFloat(bet.cashout_amount || 0) - activeStake) : 
                                 (bet.status === 'Lost' ? -activeStake : 0);

            const activeSportColor = getSportColor(bet.sport);
            const statusInfo = getStatusStyles(bet.status);
            
            // Generate real cryptographic hash representation for each individual ledger wager
            const combinedData = `${bet.sport}-${bet.bookmaker || 'N/A'}-${bet.type}-${bet.created_at}-${bet.stake}-${bet.odds}-${bet.teams || ''}`;
            const uniqueHash = sha256(combinedData).toUpperCase();

            // Set up distinct values for high-contrast distinctions
            const isWon = bet.status === 'Won';
            const isLost = bet.status === 'Lost';
            const isCashed = bet.status === 'Cashed Out';

            // Distinct Border and Shadow styling
            let slipBorder = '1.5px solid var(--border-glass)';
            let slipShadow = 'none';
            let slipOpacity = 1;

            if (isWon) {
              slipBorder = '2px solid rgba(0, 255, 136, 0.4)';
              slipShadow = '0 0 25px rgba(0, 255, 136, 0.08)';
            } else if (isLost) {
              slipBorder = '2px solid rgba(255, 51, 102, 0.25)';
              slipShadow = '0 0 15px rgba(255, 51, 102, 0.02)';
              slipOpacity = 0.65; // Fade out lost slips to emphasize won plays
            } else if (isCashed) {
              slipBorder = '2px solid rgba(255, 185, 0, 0.35)';
              slipShadow = '0 0 20px rgba(255, 185, 0, 0.05)';
            }

            return (
              <div 
                key={bet.id} 
                id={`slip-card-${bet.id}`}
                onClick={() => openBetDetailsModal(bet)}
                className="glass-panel lost-slip-hover" 
                style={{ 
                  padding: '1.75rem 1.5rem', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  border: slipBorder,
                  boxShadow: slipShadow,
                  opacity: slipOpacity,
                  cursor: 'pointer',
                  background: '#0d0f17',
                  color: '#ffffff',
                  borderRadius: '24px'
                }}
              >
                {/* Status Stamp in exact center of betslip */}
                {isWon && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-12deg)',
                    border: '3px double #10b981',
                    color: '#10b981',
                    fontSize: '0.95rem',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    padding: '0.4rem 1.2rem',
                    borderRadius: '10px',
                    zIndex: 15,
                    letterSpacing: '3px',
                    pointerEvents: 'none',
                    textShadow: '0 0 12px rgba(16, 185, 129, 0.5)',
                    boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
                    background: 'rgba(13, 15, 23, 0.95)',
                    whiteSpace: 'nowrap'
                  }}>
                    SETTLED • WIN
                  </div>
                )}
                {isLost && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-12deg)',
                    border: '3px double #ef4444',
                    color: '#ef4444',
                    fontSize: '0.95rem',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    padding: '0.4rem 1.2rem',
                    borderRadius: '10px',
                    zIndex: 15,
                    letterSpacing: '3px',
                    pointerEvents: 'none',
                    textShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
                    boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
                    background: 'rgba(13, 15, 23, 0.95)',
                    whiteSpace: 'nowrap'
                  }}>
                    SETTLED • LOSS
                  </div>
                )}
                {isCashed && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%) rotate(-12deg)',
                    border: '3px double #FFD700',
                    color: '#FFD700',
                    fontSize: '0.9rem',
                    fontWeight: '900',
                    fontFamily: 'monospace',
                    padding: '0.4rem 1.2rem',
                    borderRadius: '10px',
                    zIndex: 15,
                    letterSpacing: '2px',
                    pointerEvents: 'none',
                    textShadow: '0 0 12px rgba(255, 215, 0, 0.5)',
                    boxShadow: '0 0 25px rgba(255, 215, 0, 0.25)',
                    background: 'rgba(13, 15, 23, 0.95)',
                    whiteSpace: 'nowrap'
                  }}>
                    CASHED OUT
                  </div>
                )}

                {/* Status & Date Banner */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.3rem 0.75rem', borderRadius: '30px' }}>
                    <div style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: statusInfo.color,
                      boxShadow: statusInfo.shadow
                    }} />
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: statusInfo.color, letterSpacing: '1px', fontWeight: 'bold' }}>
                      {statusInfo.label}
                    </span>
                  </div>
                  
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>
                    {new Date(bet.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>

                {/* Details list */}
                <div className="flex-col gap-3" style={{ fontSize: '0.8rem', display: 'flex', flex: 1 }}>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '1px' }}>SPORT</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: activeSportColor, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {bet.sport}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '1px' }}>BOOKMAKER</span>
                    <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>{bet.bookmaker || 'N/A'}</span>
                  </div>

                  {/* Matchup Content */}
                  <div className="flex-col gap-1.5 mt-1">
                    {renderMatchupsBlock(bet.teams, activeSportColor)}
                  </div>

                  <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', marginTop: '0.5rem', marginBottom: '0.5rem' }} />

                  {/* Financial Panel */}
                  <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>Total Stake</span>
                      <span style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '700', fontFamily: 'monospace' }}>{sym}{Number(bet.stake).toFixed(2)}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>Odds</span>
                      <span style={{ fontSize: '1.05rem', color: '#a78bfa', fontWeight: '700', fontFamily: 'monospace' }}>@{Number(bet.odds).toFixed(2)}</span>
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }}>Est. Return</span>
                      <span style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '800', fontFamily: 'monospace', textShadow: '0 0 12px rgba(16, 185, 129, 0.3)' }}>{sym}{estPayout.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Copy to Clipboard Button */}
                  <button
                    data-html2canvas-ignore="true"
                    onClick={(e) => copySlipAsImage(e, bet.id, uniqueHash)}
                    style={{
                      marginTop: '1rem',
                      width: '100%',
                      padding: '0.65rem',
                      background: 'rgba(167, 139, 250, 0.06)',
                      border: '1px solid rgba(167, 139, 250, 0.2)',
                      borderRadius: '10px',
                      color: '#a78bfa',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.15)'; e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.06)'; e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.2)'; }}
                  >
                    <Copy size={14} />
                    <span>Copy Slip</span>
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Expanded Position Modal Overlay */}
      {selectedBet && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 9999, 
            background: 'var(--bg-modal)', 
            backdropFilter: 'blur(12px)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '2rem',
            animation: 'fade-in 0.25s ease'
          }}
          onClick={() => {
            if (!showCashoutModal) {
              setSelectedBet(null);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setSelectedBet(null);
          }}
        >
          <div 
            className="glass-panel" 
            style={{ 
              width: '100%', 
              maxWidth: '960px', 
              maxHeight: '90vh', 
              overflowY: 'auto',
              padding: '2.5rem',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: '0 20px 50px var(--shadow-card)',
              animation: 'slide-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
            onClick={(e) => e.stopPropagation()} // prevent modal click from closing
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedBet(null)}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'var(--adaptive-white-02)',
                border: '1px solid var(--border-glass)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-glass)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <X size={18} />
            </button>

            {/* Modal Body: Split Screen */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', width: '100%', alignItems: 'start' }}>
              
              {/* Left Side: settlement and form controls */}
              <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h3 className="text-gradient" style={{ fontSize: '1.75rem', fontWeight: 'bold', margin: 0 }}>
                    {isEditing ? 'Modify Position' : 'Ledger Ingestion Record'}
                  </h3>
                  <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    {isEditing ? 'Configure cryptographic block params' : `Record block key: ${selectedBet.id}`}
                  </p>
                </div>

                {isEditing ? (
                  /* Form input fields for editing mode */
                  <form onSubmit={(e) => handleSaveEdit(e, selectedBet.id)} className="flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label" style={{ fontSize: '0.75rem' }}>Sport</label>
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
                        <label className="label" style={{ fontSize: '0.75rem' }}>Bookmaker</label>
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
                        <label className="label" style={{ fontSize: '0.75rem' }}>Bet Type</label>
                        <input type="text" className="input-field mt-1" value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label" style={{ fontSize: '0.75rem' }}>Date</label>
                        <input type="date" className="input-field mt-1" value={editForm.created_at} onChange={e => setEditForm({ ...editForm, created_at: e.target.value })} required />
                      </div>
                    </div>

                    <div>
                      <label className="label" style={{ fontSize: '0.75rem' }}>Teams / Matchups</label>
                      <input type="text" className="input-field mt-1" value={editForm.teams} onChange={e => setEditForm({ ...editForm, teams: e.target.value })} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label" style={{ fontSize: '0.75rem' }}>Stake</label>
                        <input type="number" step="0.01" className="input-field mt-1" value={editForm.stake} onChange={e => setEditForm({ ...editForm, stake: e.target.value })} required />
                      </div>
                      <div>
                        <label className="label" style={{ fontSize: '0.75rem' }}>Odds</label>
                        <input type="number" step="0.01" className="input-field mt-1" value={editForm.odds} onChange={e => setEditForm({ ...editForm, odds: e.target.value })} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label" style={{ fontSize: '0.75rem' }}>Status</label>
                        <select className="input-field mt-1" value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}>
                          <option value="Pending">Pending</option>
                          <option value="Won">Won</option>
                          <option value="Lost">Lost</option>
                          <option value="Cashed Out">Cashed Out</option>
                        </select>
                      </div>
                      {editForm.status === 'Cashed Out' && (
                        <div>
                          <label className="label" style={{ fontSize: '0.75rem' }}>Cashout Return</label>
                          <input type="number" step="0.01" className="input-field mt-1" value={editForm.cashout_amount} onChange={e => setEditForm({ ...editForm, cashout_amount: e.target.value })} required />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button type="submit" className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--accent-cyan)' }}>Save Edits</button>
                      <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  /* Standard details view with settlements actions */
                  <div className="flex-col gap-6">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: 'var(--adaptive-white-01)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.25rem' }}>
                      <div>
                        <span className="label" style={{ fontSize: '0.75rem' }}>Sport</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>{selectedBet.sport}</p>
                      </div>
                      <div>
                        <span className="label" style={{ fontSize: '0.75rem' }}>Bookmaker</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>{selectedBet.bookmaker || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="label" style={{ fontSize: '0.75rem' }}>Bet Type</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>{selectedBet.type}</p>
                      </div>
                      <div>
                        <span className="label" style={{ fontSize: '0.75rem' }}>Date Ingested</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '1rem', fontWeight: 'bold' }}>{new Date(selectedBet.created_at).toLocaleDateString([], { dateStyle: 'medium' })}</p>
                      </div>
                    </div>

                    {/* Settlement Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <span className="label" style={{ fontSize: '0.75rem' }}>SETTLEMENT STATUS</span>
                      <div className="flex gap-2 flex-wrap">
                        {['Pending', 'Won', 'Lost'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(selectedBet.id, st)}
                            style={{
                              padding: '0.5rem 1.25rem',
                              borderRadius: '8px',
                              border: '1.5px solid var(--border-glass)',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              background: selectedBet.status === st ? 
                                          (st === 'Won' ? 'rgba(16, 185, 129, 0.15)' : st === 'Lost' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(167, 139, 250, 0.15)') : 
                                          'var(--adaptive-white-02)',
                              borderColor: selectedBet.status === st ? 
                                          (st === 'Won' ? 'var(--success)' : st === 'Lost' ? 'var(--danger)' : 'var(--accent-cyan)') : 
                                          'var(--border-glass)',
                              color: selectedBet.status === st ? 'white' : 'var(--text-secondary)',
                              fontWeight: 'bold',
                              transition: 'all 0.2s'
                            }}
                          >
                            {st}
                          </button>
                        ))}
                        <button 
                          onClick={() => {
                            setCashoutInput('');
                            setCashoutError(null);
                            setShowCashoutModal(true);
                          }}
                          style={{
                            padding: '0.5rem 1.25rem',
                            borderRadius: '8px',
                            border: '1.5px solid var(--border-glass)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            background: selectedBet.status === 'Cashed Out' ? 'rgba(255, 215, 0, 0.15)' : 'var(--adaptive-white-02)',
                            borderColor: selectedBet.status === 'Cashed Out' ? '#FFD700' : 'var(--border-glass)',
                            color: selectedBet.status === 'Cashed Out' ? 'white' : 'var(--text-secondary)',
                            fontWeight: 'bold',
                            transition: 'all 0.2s'
                          }}
                        >
                          Cash Out
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                        onClick={() => openBetDetailsModal(selectedBet)}
                      >
                        <Edit3 size={16} /> Edit Details
                      </button>
                      
                      <button 
                        onMouseEnter={startDeleteHover}
                        onMouseLeave={stopDeleteHover}
                        onClick={() => confirmDelete(selectedBet.id)}
                        className="btn btn-secondary"
                        style={{ 
                          flex: 1, 
                          background: 'rgba(239, 68, 68, 0.05)', 
                          border: '1.5px solid rgba(239, 68, 68, 0.3)', 
                          color: 'var(--danger)',
                          position: 'relative',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          justifyContent: 'center'
                        }}
                      >
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${deleteProgress}%`, background: 'rgba(239, 68, 68, 0.2)', transition: 'width 0.02s linear', zIndex: 0 }} />
                        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Trash2 size={16} /> 
                          {deleteProgress >= 100 ? 'Release to Delete' : deleteProgress > 0 ? 'Hold...' : 'Delete Bet'}
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: The Ticket Preview */}
              <div style={{ width: '360px', flexShrink: 0, margin: '0 auto' }}>
                <div 
                  id={`slip-card-modal`}
                  className="glass-panel" 
                  style={{ 
                    padding: '1.75rem 1.5rem', 
                    position: 'relative', 
                    overflow: 'hidden', 
                    border: selectedBet.status === 'Won' ? '2px solid rgba(16, 185, 129, 0.4)' : 
                            selectedBet.status === 'Lost' ? '2px solid rgba(239, 68, 68, 0.3)' : 
                            selectedBet.status === 'Cashed Out' ? '2px solid rgba(255, 215, 0, 0.4)' : 
                            '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
                    background: '#0d0f17',
                    color: '#ffffff',
                    borderRadius: '24px'
                  }}
                >
                  {/* Status Stamp centered in modal betslip */}
                  {selectedBet.status === 'Won' && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-12deg)',
                      border: '3px double #10b981',
                      color: '#10b981',
                      fontSize: '0.95rem',
                      fontWeight: '900',
                      fontFamily: 'monospace',
                      padding: '0.4rem 1.2rem',
                      borderRadius: '10px',
                      zIndex: 15,
                      letterSpacing: '3px',
                      pointerEvents: 'none',
                      textShadow: '0 0 12px rgba(16, 185, 129, 0.5)',
                      boxShadow: '0 0 25px rgba(16, 185, 129, 0.25)',
                      background: 'rgba(13, 15, 23, 0.95)',
                      whiteSpace: 'nowrap'
                    }}>
                      SETTLED • WIN
                    </div>
                  )}
                  {selectedBet.status === 'Lost' && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-12deg)',
                      border: '3px double #ef4444',
                      color: '#ef4444',
                      fontSize: '0.95rem',
                      fontWeight: '900',
                      fontFamily: 'monospace',
                      padding: '0.4rem 1.2rem',
                      borderRadius: '10px',
                      zIndex: 15,
                      letterSpacing: '3px',
                      pointerEvents: 'none',
                      textShadow: '0 0 12px rgba(239, 68, 68, 0.5)',
                      boxShadow: '0 0 25px rgba(239, 68, 68, 0.25)',
                      background: 'rgba(13, 15, 23, 0.95)',
                      whiteSpace: 'nowrap'
                    }}>
                      SETTLED • LOSS
                    </div>
                  )}
                  {selectedBet.status === 'Cashed Out' && (
                    <div style={{
                      position: 'absolute', top: '50%', left: '50%',
                      transform: 'translate(-50%, -50%) rotate(-12deg)',
                      border: '3px double #FFD700',
                      color: '#FFD700',
                      fontSize: '0.9rem',
                      fontWeight: '900',
                      fontFamily: 'monospace',
                      padding: '0.4rem 1.2rem',
                      borderRadius: '10px',
                      zIndex: 15,
                      letterSpacing: '2px',
                      pointerEvents: 'none',
                      textShadow: '0 0 12px rgba(255, 215, 0, 0.5)',
                      boxShadow: '0 0 25px rgba(255, 215, 0, 0.25)',
                      background: 'rgba(13, 15, 23, 0.95)',
                      whiteSpace: 'nowrap'
                    }}>
                      CASHED OUT
                    </div>
                  )}

                  {/* Pulsing indicator banner */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '0.3rem 0.75rem', borderRadius: '30px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: modalStatusInfo.color, boxShadow: modalStatusInfo.shadow }} />
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: modalStatusInfo.color, letterSpacing: '1px', fontWeight: 'bold' }}>{modalStatusInfo.label}</span>
                    </div>
                    
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>{new Date(selectedBet.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                  </div>

                  {/* Details */}
                  <div className="flex-col gap-3" style={{ fontSize: '0.8rem' }}>
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '1px' }}>SPORT</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: modalSportColor, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{selectedBet.sport}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'rgba(255, 255, 255, 0.4)', letterSpacing: '1px' }}>BOOKMAKER</span>
                      <span style={{ fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>{selectedBet.bookmaker || 'N/A'}</span>
                    </div>

                    {/* Matchup Content */}
                    <div className="flex-col gap-1.5 mt-1">
                      {renderMatchupsBlock(selectedBet.teams, modalSportColor)}
                    </div>

                    <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', marginTop: '0.5rem', marginBottom: '0.5rem' }} />

                    {/* Financial Panel */}
                    <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>Total Stake</span>
                        <span style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '700', fontFamily: 'monospace' }}>{sym}{Number(selectedBet.stake).toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>Odds</span>
                        <span style={{ fontSize: '1.05rem', color: '#a78bfa', fontWeight: '700', fontFamily: 'monospace' }}>@{Number(selectedBet.odds).toFixed(2)}</span>
                      </div>
                      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }}>Est. Return</span>
                        <span style={{ fontSize: '1.25rem', color: '#10b981', fontWeight: '800', fontFamily: 'monospace', textShadow: '0 0 12px rgba(16, 185, 129, 0.3)' }}>{sym}{(selectedBet.stake * selectedBet.odds).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Copy to Clipboard Button */}
                    <button
                      data-html2canvas-ignore="true"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const el = document.getElementById(`slip-card-modal`);
                        if (!el) return;
                        try {
                          const blob = await htmlToImage.toBlob(el, {
                            quality: 1.0,
                            pixelRatio: 2,
                            cacheBust: true,
                            filter: (node) => {
                              return node.getAttribute ? node.getAttribute('data-html2canvas-ignore') !== 'true' : true;
                            }
                          });
                          if (!blob) return;
                          try {
                            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                            showToastMsg('EXPORT COMPLETE', 'Positions slip copied to clipboard.');
                          } catch (clipErr) {
                            console.warn('Clipboard write failed, downloading instead...', clipErr);
                            download(blob, `QuantStakes_Slip_${selectedBet.id.substring(0, 8)}.png`);
                            showToastMsg('EXPORT COMPLETE', 'Positions slip exported to downloads folder.');
                          }
                        } catch (err) {
                          console.error('Failed to capture modal slip:', err);
                        }
                      }}
                      style={{
                        marginTop: '1rem',
                        width: '100%',
                        padding: '0.65rem',
                        background: 'rgba(167, 139, 250, 0.06)',
                        border: '1px solid rgba(167, 139, 250, 0.2)',
                        borderRadius: '10px',
                        color: '#a78bfa',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.15)'; e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167, 139, 250, 0.06)'; e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.2)'; }}
                    >
                      <Copy size={14} />
                      <span>Copy Slip</span>
                    </button>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cashout Submodal */}
      {showCashoutModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: 'var(--bg-modal)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', animation: 'fade-in 0.3s ease' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem', fontWeight: 'bold' }}>Record Cashout Value</h3>
            {cashoutError && (
              <div style={{ padding: '0.75rem', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                {cashoutError}
              </div>
            )}
            <input type="text" className="input-field" placeholder="e.g. 120.50" value={cashoutInput} onChange={e => setCashoutInput(e.target.value)} autoFocus />
            <div className="flex gap-3 mt-6">
              <button onClick={() => submitCashout(selectedBet.id)} className="btn btn-secondary" style={{ flex: 1, borderColor: 'var(--accent-cyan)' }}>Log Return</button>
              <button onClick={() => setShowCashoutModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
