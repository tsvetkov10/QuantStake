import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ComposedChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LabelList, Legend } from 'recharts';
import { DollarSign, Percent, Target, Euro, PoundSterling, Banknote, Filter, TrendingDown, Sparkles, Activity, AlertTriangle, Zap, BarChart2, Share2, Copy, X, Download, Check, Plus, Flame } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ShareCard from '../components/ShareCard';
import html2canvas from 'html2canvas';
import download from 'downloadjs';

const BetCardPopup = ({ rawBet, sym }) => {
  if (!rawBet) return null;
  const statusInfo = rawBet.status === 'Won' ? { color: '#10b981', label: 'SETTLED • WIN', shadow: '0 0 12px rgba(16,185,129,0.4)' } : 
                     rawBet.status === 'Lost' ? { color: '#ef4444', label: 'SETTLED • LOSS', shadow: '0 0 12px rgba(239,68,68,0.4)' } : 
                     rawBet.status === 'Cashed Out' ? { color: '#FFD700', label: 'SETTLED • CASHOUT', shadow: '0 0 12px rgba(255,215,0,0.4)' } : 
                     { color: '#22d3ee', label: 'PENDING', shadow: 'none' };
  
  const matchupParts = rawBet.teams ? rawBet.teams.split('vs').map(s => s.trim()) : ['Unknown'];
  const isWin = rawBet.status === 'Won';
  const isCashout = rawBet.status === 'Cashed Out';
  const isLoss = rawBet.status === 'Lost';
  const returnAmount = isWin ? rawBet.stake * rawBet.odds : isCashout ? rawBet.cashout_amount || 0 : 0;
  const netProfitVal = isWin ? returnAmount - rawBet.stake : isCashout ? returnAmount - rawBet.stake : isLoss ? -rawBet.stake : 0;

  return (
    <div 
      className="glass-panel" 
      style={{ 
        width: '320px', 
        background: '#0d0f17',
        border: `1.5px solid ${statusInfo.color}`,
        borderRadius: '16px',
        padding: '1.25rem',
        boxShadow: `0 15px 40px rgba(0,0,0,0.8)`,
        overflow: 'hidden',
        color: '#ffffff'
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusInfo.color, boxShadow: statusInfo.shadow }} />
          <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: statusInfo.color, letterSpacing: '1px', fontWeight: 'bold' }}>
            {statusInfo.label}
          </span>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          {new Date(rawBet.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="flex-col gap-3">
        <div className="flex justify-between items-center">
          <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#22d3ee', background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.6rem', borderRadius: '20px', textTransform: 'uppercase' }}>
            {rawBet.sport || 'OTHER'}
          </span>
          <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '600' }}>{rawBet.bookmaker || 'Unknown'}</span>
        </div>

        <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '0.75rem' }}>
          <div className="flex justify-between items-center mb-1.5">
            <span style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '1px' }}>SELECTION</span>
            <span style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: 'rgba(255, 255, 255, 0.5)', letterSpacing: '1px' }}>{rawBet.type?.toUpperCase() || 'SINGLE'}</span>
          </div>
          {matchupParts.length === 2 ? (
            <div className="flex items-center justify-between gap-1">
              <div className="flex-col" style={{ flex: 1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffffff' }}>{matchupParts[0]}</span>
                <span style={{ fontSize: '0.5rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>HOME</span>
              </div>
              <div style={{ padding: '0.1rem 0.3rem', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', fontSize: '0.6rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 'bold' }}>vs</div>
              <div className="flex-col text-right" style={{ flex: 1 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffffff' }}>{matchupParts[1]}</span>
                <span style={{ fontSize: '0.5rem', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>AWAY</span>
              </div>
            </div>
          ) : (
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#ffffff' }}>{rawBet.teams}</span>
          )}
        </div>

        <div className="flex-col gap-1.5 mt-1" style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between items-center" style={{ fontSize: '0.8rem' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Stake & Odds</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#ffffff' }}>{sym}{Number(rawBet.stake).toFixed(2)} @ {Number(rawBet.odds).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center" style={{ fontSize: '0.85rem', paddingTop: '0.35rem', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>PnL Return</span>
            <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '1rem', color: netProfitVal > 0 ? '#10b981' : netProfitVal < 0 ? '#ef4444' : '#ffffff' }}>
              {netProfitVal > 0 ? '+' : ''}{sym}{netProfitVal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BankrollCandlestickChart = ({ data, sym }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center" style={{ height: '100%', opacity: 0.5, fontStyle: 'italic', color: 'var(--text-secondary)' }}>No data to display.</div>;
  }

  const allLows = data.map(d => d.low);
  const allHighs = data.map(d => d.high);
  const minVal = Math.min(...allLows, 0);
  const maxVal = Math.max(...allHighs, 100);

  // If minVal is >= 0, yMin is strictly 0 (never show negative numbers if bankroll stayed >= 0)
  const yMin = minVal < 0 ? Math.floor(minVal * 1.15) : 0;
  const yMax = Math.ceil(Math.max(maxVal * 1.15, 100));
  const yRange = (yMax - yMin) || 100;

  const totalCount = data.length;
  const viewWidth = 1000;
  const viewHeight = 300;
  const slotWidth = viewWidth / Math.max(1, totalCount);
  const candleWidth = Math.max(3, Math.min(16, slotWidth * 0.65));

  const gridSteps = [0.15, 0.38, 0.62, 0.85];
  const activeItem = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', userSelect: 'none' }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        {/* Horizontal Dashed Reference Gridlines */}
        {gridSteps.map((pct, idx) => {
          const yPos = viewHeight * pct;
          const val = yMax - (yRange * pct);
          if (val < 0 && minVal >= 0) return null; // Never display negative ticks if bankroll >= 0
          return (
            <g key={idx}>
              <line x1="0" y1={yPos} x2={viewWidth} y2={yPos} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" strokeWidth="1" />
              <text x="8" y={yPos - 5} fill="rgba(255, 255, 255, 0.35)" fontSize="11" fontFamily="monospace">
                {val >= 0 ? '+' : ''}{sym}{val.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* Zero baseline */}
        {yMin < 0 && yMax > 0 && (() => {
          const zeroY = viewHeight - ((0 - yMin) / yRange) * viewHeight;
          return <line x1="0" y1={zeroY} x2={viewWidth} y2={zeroY} stroke="rgba(6, 182, 212, 0.3)" strokeDasharray="4 4" strokeWidth="1.5" />;
        })()}

        {/* Candlestick Bars */}
        {data.map((item, index) => {
          const cx = slotWidth * index + slotWidth / 2;
          const openY = viewHeight - ((item.open - yMin) / yRange) * viewHeight;
          const closeY = viewHeight - ((item.close - yMin) / yRange) * viewHeight;
          const highY = viewHeight - ((item.high - yMin) / yRange) * viewHeight;
          const lowY = viewHeight - ((item.low - yMin) / yRange) * viewHeight;

          const isBull = item.close >= item.open;
          const candleColor = isBull ? '#ff8c00' : '#06b6d4';

          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.max(3, Math.abs(openY - closeY));
          const isHovered = hoveredIndex === index;

          return (
            <g 
              key={index} 
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Wick Line */}
              <line 
                x1={cx} y1={highY} 
                x2={cx} y2={lowY} 
                stroke={candleColor} 
                strokeWidth={isHovered ? 2.5 : 1.5} 
                opacity={isHovered ? 1 : 0.9}
              />
              {/* Candle Body Rect */}
              <rect 
                x={cx - (isHovered ? candleWidth * 1.2 : candleWidth) / 2} 
                y={bodyTop} 
                width={isHovered ? candleWidth * 1.2 : candleWidth} 
                height={bodyHeight} 
                fill={candleColor} 
                rx={1}
                stroke={isHovered ? '#ffffff' : 'none'}
                strokeWidth={1}
              />
            </g>
          );
        })}
      </svg>

      {/* Hover Info Bet Slip Card Popup */}
      {activeItem && activeItem.rawBet && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '16px',
          zIndex: 30,
          pointerEvents: 'none',
          animation: 'fade-in 0.15s ease'
        }}>
          <BetCardPopup rawBet={activeItem.rawBet} sym={sym} />
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, sym }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#0d0f17',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '0.4rem 0.75rem',
        boxShadow: '0 8px 20px rgba(0,0,0,0.6)',
        color: '#ffffff',
        fontSize: '0.8rem',
        fontFamily: 'monospace',
        pointerEvents: 'none'
      }}>
        <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem', marginBottom: '2px' }}>
          {data.date === 'Start' ? 'Start Balance' : data.date}
        </div>
        <div style={{ fontWeight: 'bold', color: '#22d3ee', fontSize: '0.95rem' }}>
          {sym}{Number(data.balance).toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};


export default function Dashboard({ session, profile }) {
  const [bets, setBets] = useState([]);
  const [filterSport, setFilterSport] = useState('All');
  const [filterBookmaker, setFilterBookmaker] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [timeframe, setTimeframe] = useState('ALL');
  const [chartType, setChartType] = useState('line'); // 'line' or 'candlestick'
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [isGeneratingShare, setIsGeneratingShare] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedBets, setSelectedBets] = useState(null);
  const [currentBetIndex, setCurrentBetIndex] = useState(0);
  const shareCardRef = useRef(null);
  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined;
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Dashboard - Analytics";
    async function fetchData() {
      if (isMock) {
        const mockBetsRaw = sessionStorage.getItem('mock_bets');
        if (mockBetsRaw) {
          setBets(JSON.parse(mockBetsRaw));
        } else {
          const defaultMock = [
            { id: '1', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), sport: 'Basketball', bookmaker: 'Bet365', type: 'Single', teams: 'Lakers vs Warriors', stake: 50, odds: 1.9, status: 'Won' },
            { id: '2', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), sport: 'Football', bookmaker: 'Betano', type: 'Multiple', teams: 'Acca', stake: 100, odds: 2.1, status: 'Lost' },
            { id: '3', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), sport: 'Tennis', bookmaker: 'Bet365', type: 'Single', teams: 'Alcaraz', stake: 25, odds: 3.5, status: 'Won' },
            { id: '4', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), sport: 'Basketball', bookmaker: 'Inbet', type: 'Single', teams: 'Bulls', stake: 150, odds: 1.8, status: 'Pending' },
            { id: '5', created_at: new Date(Date.now() - 86400000 * 5).toISOString(), sport: 'Football', bookmaker: 'Bet365', type: 'Single', teams: 'France vs Morocco', stake: 60, odds: 2.0, status: 'Lost' },
            { id: '6', created_at: new Date(Date.now() - 86400000 * 6).toISOString(), sport: 'Tennis', bookmaker: 'Betano', type: 'Single', teams: 'Djokovic', stake: 200, odds: 1.2, status: 'Won' }
          ];
          setBets(defaultMock);
          sessionStorage.setItem('mock_bets', JSON.stringify(defaultMock));
        }
        return;
      }

      const { data: betsData } = await supabase.from('bets').select('*').eq('user_id', session.user.id).order('created_at', { ascending: true });
      if (betsData) setBets(betsData);
    }
    fetchData();
  }, [session, isMock]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowSharePreview(false);
        setSelectedBets(null);
      }
    };
    if (showSharePreview || selectedBets) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showSharePreview, selectedBets]);

  const uniqueSports = ['All', ...new Set(bets.map(b => b.sport).filter(Boolean))];
  const uniqueBookmakers = ['All', ...new Set(bets.map(b => b.bookmaker).filter(Boolean))];
  const uniqueTypes = ['All', 'Single', 'Multiple', 'System'];

  const startingBankroll = 0;
  let baseProfit = startingBankroll;
  
  const now = new Date();
  const timeLimit = new Date();
  if (timeframe === '1D') timeLimit.setDate(now.getDate() - 1);
  else if (timeframe === '1M') timeLimit.setDate(now.getDate() - 30);
  else if (timeframe === '1Y') timeLimit.setFullYear(now.getFullYear() - 1);

  const attributeFilteredBets = bets.filter(bet => {
    if (filterSport !== 'All' && bet.sport !== filterSport) return false;
    if (filterBookmaker !== 'All' && bet.bookmaker !== filterBookmaker) return false;
    if (filterType !== 'All' && bet.type !== filterType) return false;
    return true;
  });

  const filteredBets = attributeFilteredBets.filter(bet => {
    if (timeframe !== 'ALL') {
      const betDate = new Date(bet.created_at);
      if (betDate < timeLimit) {
        if (bet.status !== 'Pending') {
          const stake = parseFloat(bet.stake);
          const returned = bet.status === 'Won' ? (stake * parseFloat(bet.odds)) : (bet.status === 'Cashed Out' ? parseFloat(bet.cashout_amount || 0) : 0);
          baseProfit += (returned - stake);
        }
        return false;
      }
    }
    return true;
  });

  // Base Calcs
  const totalStaked = filteredBets.reduce((sum, bet) => sum + parseFloat(bet.stake), 0);
  
  let grossProfit = 0;
  let grossLoss = 0;
  
  filteredBets.forEach(bet => {
    if (bet.status === 'Pending') return;
    const stake = parseFloat(bet.stake);
    const returned = bet.status === 'Won' ? (stake * parseFloat(bet.odds)) : (bet.status === 'Cashed Out' ? parseFloat(bet.cashout_amount || 0) : 0);
    const pl = returned - stake;
    if (pl > 0) grossProfit += pl;
    else grossLoss += Math.abs(pl);
  });

  const netProfit = grossProfit - grossLoss;
  const currentBalance = startingBankroll + netProfit;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 99.9 : 0);
  
  const resolvedBets = filteredBets.filter(b => b.status !== 'Pending');
  const wonBets = resolvedBets.filter(b => b.status === 'Won' || b.status === 'Cashed Out');
  const lostBets = resolvedBets.filter(b => b.status === 'Lost');
  const winRate = resolvedBets.length > 0 ? (wonBets.length / resolvedBets.length) * 100 : 0;
  const avgStake = resolvedBets.length > 0 ? totalStaked / resolvedBets.length : 0;
  
  const avgWinOdds = wonBets.length > 0 ? wonBets.reduce((sum, b) => sum + parseFloat(b.odds), 0) / wonBets.length : 0;
  const avgLossOdds = lostBets.length > 0 ? lostBets.reduce((sum, b) => sum + parseFloat(b.odds), 0) / lostBets.length : 0;

  // Extra Insights
  let biggestWin = 0;
  let biggestLoss = 0;
  let singlesWon = 0;
  let singlesTotal = 0;
  let multiplesWon = 0;
  let multiplesTotal = 0;
  
  resolvedBets.forEach(bet => {
    const stake = parseFloat(bet.stake);
    const returned = bet.status === 'Won' ? (stake * parseFloat(bet.odds)) : (bet.status === 'Cashed Out' ? parseFloat(bet.cashout_amount || 0) : 0);
    const pl = returned - stake;
    
    if (pl > biggestWin) biggestWin = pl;
    if (pl < biggestLoss) biggestLoss = pl;
    
    if (bet.type === 'Single') {
      singlesTotal++;
      if (bet.status === 'Won' || bet.status === 'Cashed Out') singlesWon++;
    } else {
      multiplesTotal++;
      if (bet.status === 'Won' || bet.status === 'Cashed Out') multiplesWon++;
    }
  });

  const singlesWinRate = singlesTotal > 0 ? (singlesWon / singlesTotal) * 100 : 0;
  const multiplesWinRate = multiplesTotal > 0 ? (multiplesWon / multiplesTotal) * 100 : 0;

  // Streaks
  let currentStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  let currentStreakType = null;

  resolvedBets.forEach(bet => {
    const isWin = bet.status === 'Won' || bet.status === 'Cashed Out';
    if (currentStreakType === null) {
      currentStreakType = isWin ? 'W' : 'L';
      currentStreak = 1;
    } else if ((isWin && currentStreakType === 'W') || (!isWin && currentStreakType === 'L')) {
      currentStreak++;
    } else {
      currentStreakType = isWin ? 'W' : 'L';
      currentStreak = 1;
    }

    if (currentStreakType === 'W' && currentStreak > maxWinStreak) maxWinStreak = currentStreak;
    if (currentStreakType === 'L' && currentStreak > maxLossStreak) maxLossStreak = currentStreak;
  });

  const currentActiveStreak = currentStreakType ? `${currentStreak} ${currentStreakType}` : 'None';
  const firstBetDate = bets.length > 0 ? new Date(bets[0].created_at) : new Date();
  const daysSinceFirstBet = Math.max(1, (new Date() - firstBetDate) / (1000 * 60 * 60 * 24));
  const avgVolumePerDay = daysSinceFirstBet > 0 ? totalStaked / daysSinceFirstBet : 0;

  // Chart Data & Drawdown
  let runningBalance = baseProfit;
  let peakBalance = baseProfit;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  
  const chartData = [{ date: 'Start', balance: parseFloat(baseProfit.toFixed(2)), betPnL: 0 }];
  
  filteredBets.forEach((bet) => {
    const stake = parseFloat(bet.stake);
    let betPnL = -stake;
    if (bet.status === 'Won') {
       betPnL += (stake * parseFloat(bet.odds));
    } else if (bet.status === 'Cashed Out') {
       betPnL += parseFloat(bet.cashout_amount || 0);
    }
    
    const previousBalance = runningBalance;
    runningBalance += betPnL;
    
    if (runningBalance > peakBalance) {
      peakBalance = runningBalance;
    } else {
      const drawdown = peakBalance - runningBalance;
      const drawdownPercent = peakBalance > 0 ? (drawdown / peakBalance) * 100 : 0;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
        maxDrawdownPercent = drawdownPercent;
      }
    }

    chartData.push({
      date: new Date(bet.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      balance: parseFloat(runningBalance.toFixed(2)),
      betPnL: parseFloat(betPnL.toFixed(2)),
      waterfallRange: [parseFloat(previousBalance.toFixed(2)), parseFloat(runningBalance.toFixed(2))],
      rawBet: bet
    });
  });

  const candlestickData = [];
  let prevBal = baseProfit;
  filteredBets.forEach((bet) => {
    const stake = parseFloat(bet.stake);
    let betPnL = -stake;
    if (bet.status === 'Won') {
       betPnL += (stake * parseFloat(bet.odds));
    } else if (bet.status === 'Cashed Out') {
       betPnL += parseFloat(bet.cashout_amount || 0);
    }
    
    const openVal = prevBal;
    const closeVal = prevBal + betPnL;
    prevBal = closeVal;

    const absPnL = Math.abs(betPnL);
    const wickExtension = absPnL > 0 ? absPnL * 0.25 : 5;
    const highVal = Math.max(openVal, closeVal) + wickExtension;
    const lowVal = Math.min(openVal, closeVal) - wickExtension;

    candlestickData.push({
      date: new Date(bet.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      open: parseFloat(openVal.toFixed(2)),
      close: parseFloat(closeVal.toFixed(2)),
      high: parseFloat(highVal.toFixed(2)),
      low: parseFloat(lowVal.toFixed(2)),
      betPnL: parseFloat(betPnL.toFixed(2)),
      rawBet: bet
    });
  });

  let mostBettedSport = 'N/A';
  let maxSportCount = 0;
  const sportCounts = {};
  filteredBets.forEach(bet => {
    sportCounts[bet.sport] = (sportCounts[bet.sport] || 0) + 1;
    if (sportCounts[bet.sport] > maxSportCount) {
      maxSportCount = sportCounts[bet.sport];
      mostBettedSport = bet.sport;
    }
  });

  // Daily PnL
  const allBetDates = bets.map(b => new Date(b.created_at)).filter(d => !isNaN(d.getTime()));
  const earliestBetDate = allBetDates.length > 0 ? new Date(Math.min(...allBetDates)) : null;
  
  let accountStartDate = null;
  if (profile?.created_at) {
    const profileDate = new Date(profile.created_at);
    if (!isNaN(profileDate.getTime())) {
      accountStartDate = profileDate;
    }
  }
  
  if (!accountStartDate && earliestBetDate) {
    accountStartDate = earliestBetDate;
  } else if (accountStartDate && earliestBetDate) {
    accountStartDate = new Date(Math.min(accountStartDate.getTime(), earliestBetDate.getTime()));
  }
  
  if (!accountStartDate) {
    accountStartDate = new Date();
  }

  let chartStartDate = new Date(accountStartDate);
  let limitDate = null;
  if (timeframe === '1D') {
    limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - 1);
  } else if (timeframe === '1M') {
    limitDate = new Date();
    limitDate.setMonth(limitDate.getMonth() - 1);
  } else if (timeframe === '1Y') {
    limitDate = new Date();
    limitDate.setFullYear(limitDate.getFullYear() - 1);
  }

  if (limitDate && limitDate > chartStartDate) {
    chartStartDate = limitDate;
  }

  const datesArray = [];
  let currentDate = new Date(chartStartDate);
  currentDate.setHours(0, 0, 0, 0);
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    datesArray.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const dailyPnL = {};
  datesArray.forEach(date => {
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    dailyPnL[dateStr] = { date: dateStr, profit: 0 };
  });

  filteredBets.forEach(bet => {
    if (bet.status === 'Pending') return;
    const dateStr = new Date(bet.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' });
    
    const stake = parseFloat(bet.stake);
    const returned = bet.status === 'Won' ? (stake * parseFloat(bet.odds)) : (bet.status === 'Cashed Out' ? parseFloat(bet.cashout_amount || 0) : 0);
    
    if (!dailyPnL[dateStr]) {
      dailyPnL[dateStr] = { date: dateStr, profit: 0 };
    }
    dailyPnL[dateStr].profit += (returned - stake);
  });

  const dailyPnLData = Object.values(dailyPnL).map(d => ({ ...d, profit: parseFloat(d.profit.toFixed(2)) }));

  // Odds Tier Performance
  const oddsTiers = { '< 1.50': { total: 0, won: 0 }, '1.50 - 2.00': { total: 0, won: 0 }, '2.00 - 3.00': { total: 0, won: 0 }, '> 3.00': { total: 0, won: 0 } };
  resolvedBets.forEach(bet => {
    const odds = parseFloat(bet.odds);
    let bucket = '';
    if (odds < 1.50) bucket = '< 1.50';
    else if (odds < 2.0) bucket = '1.50 - 2.00';
    else if (odds < 3.0) bucket = '2.00 - 3.00';
    else bucket = '> 3.00';
    
    oddsTiers[bucket].total++;
    if (bet.status === 'Won' || bet.status === 'Cashed Out') oddsTiers[bucket].won++;
  });
  const oddsTierData = Object.keys(oddsTiers).map(key => ({
    tier: key,
    winRate: oddsTiers[key].total > 0 ? parseFloat(((oddsTiers[key].won / oddsTiers[key].total) * 100).toFixed(1)) : 0,
    total: oddsTiers[key].total
  })).filter(d => d.total > 0);

  // Day of Week Performance
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayStats = dayNames.map(day => ({ day, profit: 0 }));
  resolvedBets.forEach(bet => {
    const dayIndex = new Date(bet.created_at).getDay();
    const stake = parseFloat(bet.stake);
    const returned = bet.status === 'Won' ? (stake * parseFloat(bet.odds)) : (bet.status === 'Cashed Out' ? parseFloat(bet.cashout_amount || 0) : 0);
    dayStats[dayIndex].profit += (returned - stake);
  });
  const radarData = dayStats.map(d => ({ ...d, profit: parseFloat(d.profit.toFixed(2)) }));

  // Win Rate by Sport
  const sportStats = {};
  resolvedBets.forEach(bet => {
    if (!sportStats[bet.sport]) sportStats[bet.sport] = { sport: bet.sport, wins: 0, total: 0 };
    sportStats[bet.sport].total += 1;
    if (bet.status === 'Won' || bet.status === 'Cashed Out') sportStats[bet.sport].wins += 1;
  });
  const sportWinRateData = Object.values(sportStats).map(s => ({
    sport: s.sport,
    winRate: s.total > 0 ? parseFloat(((s.wins / s.total) * 100).toFixed(1)) : 0,
    total: s.total
  })).filter(s => s.total > 0);
  const pieColors = ['#22d3ee', '#ff3366', '#FFD700', '#00ffaa', '#06b6d4', '#ff8c00', '#10b981'];

  const getCurrencySymbol = (code) => {
    switch(code) {
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'USD': default: return '$';
    }
  };
  const sym = getCurrencySymbol(profile?.currency);

  const NoData = () => <h3 className="relative z-10" style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.7 }}>No Data</h3>;
  const NoDataSmall = () => <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-secondary)', fontStyle: 'italic', opacity: 0.7 }}>No Data</h3>;

  const ensureImagesLoaded = async (element) => {
    if (!element) return;
    const imgs = Array.from(element.querySelectorAll('img'));
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalWidth !== 0) {
          return Promise.resolve();
        }
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          if (img.decode) {
            img.decode().then(resolve).catch(resolve);
          }
        });
      })
    );
  };

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsGeneratingShare(true);
      await ensureImagesLoaded(shareCardRef.current);
      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 3,
        width: 1080,
        height: 1080,
        windowWidth: 1080,
        windowHeight: 1080,
        backgroundColor: '#040714',
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const timestamp = Math.floor(Date.now() / 1000);
      download(dataUrl, `QuantStakes_${profile?.username || 'Trader'}_Performance_${timestamp}.png`);
    } catch (err) {
      console.error('Failed to generate image', err);
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const handleCopy = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsGeneratingShare(true);
      await ensureImagesLoaded(shareCardRef.current);
      const canvas = await html2canvas(shareCardRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 3,
        width: 1080,
        height: 1080,
        windowWidth: 1080,
        windowHeight: 1080,
        backgroundColor: '#040714',
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) {
          alert('Failed to generate image blob.');
          setIsGeneratingShare(false);
          return;
        }
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        } catch (clipErr) {
          console.warn('Clipboard write failed, downloading instead...', clipErr);
          const timestamp = Math.floor(Date.now() / 1000);
          download(blob, `QuantStakes_${profile?.username || 'Trader'}_Performance_${timestamp}.png`);
          alert('Image exported to downloads folder.');
        } finally {
          setIsGeneratingShare(false);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Failed to copy/download image', err);
      alert('Failed to generate image.');
      setIsGeneratingShare(false);
    }
  };

  const allBalances = chartData.map(d => d.balance);
  const minBalance = Math.min(...allBalances, 0);
  const maxBalance = Math.max(...allBalances, 0);

  const chartYMin = minBalance < 0 ? Math.floor(minBalance * 1.15) : 0;
  const chartYMax = Math.ceil(Math.max(maxBalance * 1.15, 100));

  return (
    <div className="flex-col gap-12 pb-12">
      {/* Unscaled 1080x1080 Capture Node (Guarantees zero text distortion and exact 1:1 rendering) */}
      <div style={{ position: 'fixed', top: 0, left: '-9999px', width: '1080px', height: '1080px', pointerEvents: 'none', zIndex: -9999, overflow: 'hidden' }}>
        <ShareCard 
          key={`capture-${netProfit}-${roi}-${winRate}-${totalStaked}-${biggestWin}`}
          ref={shareCardRef} 
          profile={profile} 
          metrics={{ netProfit, roi, winRate, totalStaked, biggestWin, wonCount: wonBets.length, totalBets: resolvedBets.length }} 
        />
      </div>

      {showSharePreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'var(--bg-modal)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          
          <button 
            onClick={() => setShowSharePreview(false)}
            style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', zIndex: 100000 }}
          >
            <X size={40} />
          </button>

          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', zIndex: 100000 }}>Share Your Edge</h2>
          <p className="text-secondary" style={{ marginBottom: '2rem', zIndex: 100000 }}>Export your mathematically verified track record.</p>

          <div style={{ position: 'relative', width: '90vw', maxWidth: '500px', aspectRatio: '1 / 1', overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '1080px', height: '1080px', transformOrigin: 'top left' }} ref={(el) => {
                if (el) {
                  const parentW = el.parentElement.offsetWidth;
                  el.style.transform = `scale(${parentW / 1080})`;
                }
              }}>
                <ShareCard 
                  key={`preview-${netProfit}-${roi}-${winRate}-${totalStaked}-${biggestWin}`}
                  profile={profile} 
                  metrics={{ netProfit, roi, winRate, totalStaked, biggestWin, wonCount: wonBets.length, totalBets: resolvedBets.length }} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', zIndex: 100000, marginTop: '2rem' }}>
            <button 
              onClick={handleCopy}
              disabled={isGeneratingShare || isCopied}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justify: 'center',
                gap: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '0.85rem 1.75rem',
                borderRadius: '14px',
                background: isCopied ? 'rgba(52, 211, 153, 0.15)' : 'linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: isCopied ? '1px solid rgba(52, 211, 153, 0.4)' : '1px solid rgba(56, 189, 248, 0.4)',
                color: isCopied ? '#34d399' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
              }}
            >
              {isGeneratingShare ? (
                <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div>
              ) : isCopied ? (
                <Check size={20} color="#34d399" />
              ) : (
                <Copy size={20} color="#38bdf8" />
              )}
              <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Image'}</span>
            </button>

            <button 
              onClick={handleDownload}
              disabled={isGeneratingShare}
              className="btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justify: 'center',
                gap: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                padding: '0.85rem 1.75rem',
                borderRadius: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
            >
              {isGeneratingShare ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: 'white' }}></div> : <Download size={20} color="#ffffff" />}
              <span>Download PNG</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end flex-wrap gap-4" style={{ width: '100%' }}>
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Portfolio Analytics</h2>
          <p className="text-secondary">Comprehensive quantitative breakdown of your betting strategy.</p>
        </div>
        
        <div className="dashboard-filter-bar flex gap-3 items-end flex-wrap" style={{ animation: 'fade-in 0.3s ease' }}>
          <div className="flex-col">
            <label className="text-secondary" style={{ fontSize: '0.65rem', marginBottom: '0.25rem', opacity: 0, pointerEvents: 'none', userSelect: 'none', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Export</label>
            <button 
              onClick={() => setShowSharePreview(true)}
              className="btn" 
              style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justify: 'center',
                gap: '9px',
                padding: '0 1.35rem', 
                height: '38px', 
                background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.12) 100%)', 
                border: '1px solid rgba(56, 189, 248, 0.35)', 
                color: '#ffffff', 
                fontSize: '0.88rem', 
                fontWeight: '600',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: '0 4px 15px rgba(56, 189, 248, 0.1)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(56, 189, 248, 0.25)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(168, 85, 247, 0.12) 100%)';
                e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.35)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(56, 189, 248, 0.1)';
              }}
            >
              <Share2 size={16} color="#38bdf8" />
              <span>Share Performance</span>
            </button>
          </div>

          <div className="flex-col">
            <label className="text-secondary" style={{ fontSize: '0.65rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeframe</label>
            <div style={{ display: 'flex', gap: '4px', background: 'var(--adaptive-white-02)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-glass)', height: '38px', alignItems: 'center' }}>
              {[{ val: 'ALL', label: 'ALL' }, { val: '1D', label: '24H' }, { val: '1M', label: '30D' }, { val: '1Y', label: '1Y' }].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setTimeframe(opt.val)}
                  style={{
                    padding: '0.3rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: 'none',
                    background: timeframe === opt.val ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'transparent',
                    color: timeframe === opt.val ? '#fff' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-col">
            <label className="text-secondary" style={{ fontSize: '0.65rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sport</label>
            <select className="input-field" style={{ padding: '0 0.75rem', height: '38px', fontSize: '0.85rem', minWidth: '110px', background: 'var(--adaptive-white-02)', borderColor: 'var(--border-glass)' }} value={filterSport} onChange={e => setFilterSport(e.target.value)}>
              {uniqueSports.map(s => <option key={s} value={s} style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)' }}>{s}</option>)}
            </select>
          </div>
          
          <div className="flex-col">
            <label className="text-secondary" style={{ fontSize: '0.65rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bookmaker</label>
            <select className="input-field" style={{ padding: '0 0.75rem', height: '38px', fontSize: '0.85rem', minWidth: '110px', background: 'var(--adaptive-white-02)', borderColor: 'var(--border-glass)' }} value={filterBookmaker} onChange={e => setFilterBookmaker(e.target.value)}>
              {uniqueBookmakers.map(b => <option key={b} value={b} style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)' }}>{b}</option>)}
            </select>
          </div>
          
          <div className="flex-col">
            <label className="text-secondary" style={{ fontSize: '0.65rem', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bet Type</label>
            <select className="input-field" style={{ padding: '0 0.75rem', height: '38px', fontSize: '0.85rem', minWidth: '110px', background: 'var(--adaptive-white-02)', borderColor: 'var(--border-glass)' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              {uniqueTypes.map(t => <option key={t} value={t} style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)' }}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards - Primary */}
      <div className="grid grid-cols-4 gap-10" style={{ animation: 'fade-in 0.4s ease' }}>
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', animation: netProfit > 0 ? 'profitGlowPulse 2.5s infinite ease-in-out' : 'none', border: netProfit > 0 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <p className="label">Total Profit</p>
              {netProfit > 0 && (
                <span className="flex items-center gap-1" style={{ fontSize: '0.62rem', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.15rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.3)', letterSpacing: '0.5px' }}>
                  <Sparkles size={10} /> IN PROFIT
                </span>
              )}
            </div>
            <DollarSign size={20} color="var(--accent-cyan)" />
          </div>
          {filteredBets.length === 0 ? <NoData /> : (
            <h3 className={`relative z-10 ${netProfit >= 0 ? 'glow-text-success' : 'glow-text-danger'}`} style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2.2rem)', fontWeight: '900', letterSpacing: '-0.5px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {netProfit >= 0 ? '+' : ''}{sym}{netProfit.toFixed(2)}
            </h3>
          )}
          <p className="relative z-10 text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Net Earnings</p>
        </div>
        
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--accent-magenta) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Win Rate</p>
            <Target size={20} color="var(--accent-magenta)" />
          </div>
          {filteredBets.length === 0 ? <NoData /> : (
            <h3 className="relative z-10 glow-text-neutral" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2.2rem)', fontWeight: '900', letterSpacing: '-0.5px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{winRate.toFixed(1)}%</h3>
          )}
          <p className="text-secondary relative z-10" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{wonBets.length} / {resolvedBets.length} Won</p>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden', animation: roi > 0 ? 'profitGlowPulse 2.5s infinite ease-in-out' : 'none', border: roi > 0 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-glass)' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Yield (ROI)</p>
            <Percent size={20} color="var(--success)" />
          </div>
          {filteredBets.length === 0 ? <NoData /> : (
            <h3 className={`relative z-10 ${roi >= 0 ? 'glow-text-success' : 'glow-text-danger'}`} style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2.2rem)', fontWeight: '900', letterSpacing: '-0.5px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{roi > 0 ? '+' : ''}{roi.toFixed(1)}%</h3>
          )}
          <p className="text-secondary relative z-10" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>True Edge</p>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, #a13bf7 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Total Wagered</p>
            <Banknote size={20} color="#a13bf7" />
          </div>
          {filteredBets.length === 0 ? <NoData /> : (
            <h3 className="relative z-10 glow-text-neutral" style={{ fontSize: 'clamp(1.4rem, 2.2vw, 2.2rem)', fontWeight: '900', letterSpacing: '-0.5px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{sym}{totalStaked.toFixed(2)}</h3>
          )}
          <p className="text-secondary relative z-10" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Total Turnover</p>
        </div>
      </div>

      {/* Metric Cards - Secondary */}
      <div className="grid grid-cols-4 gap-10" style={{ animation: 'fade-in 0.5s ease' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="label text-secondary" style={{ fontSize: '0.85rem' }}>Profit Factor</p>
            <Activity size={16} color="var(--accent-cyan)" />
          </div>
          {filteredBets.length === 0 ? <NoDataSmall /> : (
            <h3 style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.6rem)', fontWeight: 'bold', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{profitFactor.toFixed(2)}</h3>
          )}
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{profitFactor > 1 ? 'Profitable Strategy' : 'Losing Strategy'}</p>
        </div>
        
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="label text-secondary" style={{ fontSize: '0.85rem' }}>Most Betted Sport</p>
            <Sparkles size={16} color="var(--accent-cyan)" />
          </div>
          {filteredBets.length === 0 ? <NoDataSmall /> : (
            <h3 style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.6rem)', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{mostBettedSport}</h3>
          )}
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Top Volume Sport</p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="label text-secondary" style={{ fontSize: '0.85rem' }}>Avg Stake</p>
            <Euro size={16} color="var(--accent-magenta)" />
          </div>
          {filteredBets.length === 0 ? <NoDataSmall /> : (
            <h3 style={{ fontSize: 'clamp(1.1rem, 1.6vw, 1.6rem)', fontWeight: 'bold', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{sym}{avgStake.toFixed(2)}</h3>
          )}
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Avg Bet Size</p>
        </div>

        {/* Longest Streaks Card with Animated Flame & Hot Win Streak Pulse */}
        {(() => {
          const isHotStreak = (currentStreakType === 'W' && currentStreak >= 2) || maxWinStreak >= 3;
          return (
            <div 
              className="glass-card" 
              style={{ 
                padding: '1.5rem',
                position: 'relative',
                animation: isHotStreak ? 'hotStreakPulse 2s infinite ease-in-out' : 'none',
                border: isHotStreak ? '1px solid rgba(245, 158, 11, 0.6)' : '1px solid var(--border-glass)'
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <p className="label text-secondary" style={{ fontSize: '0.85rem' }}>Longest Streaks</p>
                  {isHotStreak && (
                    <div className="flex items-center gap-1" style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', borderRadius: '12px', padding: '0.15rem 0.5rem' }}>
                      <Flame className="flame-icon-bounce" size={13} color="#f59e0b" />
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HOT STREAK</span>
                    </div>
                  )}
                </div>
                <Zap size={16} color="#FFD700" />
              </div>
              {filteredBets.length === 0 ? <NoDataSmall /> : (
                <div className="flex gap-4 mt-2">
                  <div>
                    <p style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      {maxWinStreak} W {maxWinStreak >= 3 && <Flame className="flame-icon-bounce" size={14} color="#f59e0b" />}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{maxLossStreak} L</p>
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Main Charts Section */}
      <div className="flex-col gap-12" style={{ animation: 'fade-in 0.6s ease' }}>
        
        {/* Bankroll Trajectory */}
        <div className="glass-panel dashboard-chart-card" style={{ padding: '2rem' }}>
          <div className="flex justify-between items-center mb-6 dashboard-card-header">
            <div>
              <h3 className="label mb-0 text-gradient" style={{ fontSize: '1.5rem' }}>Bankroll Trajectory</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Cumulative PnL growth & trajectory over time.</p>
            </div>
            
            <div className="flex gap-3 items-center flex-wrap">
              {/* Graph Type Toggle */}
              <div style={{ display: 'flex', gap: '3px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => setChartType('line')}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: 'none',
                    background: chartType === 'line' ? 'linear-gradient(135deg, var(--accent-cyan), #3b82f6)' : 'transparent',
                    color: chartType === 'line' ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Sparkles size={14} /> Line Graph
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('candlestick')}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    border: 'none',
                    background: chartType === 'candlestick' ? 'linear-gradient(135deg, #ff8c00, #06b6d4)' : 'transparent',
                    color: chartType === 'candlestick' ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    transition: 'all 0.2s'
                  }}
                >
                  <BarChart2 size={14} /> Candlesticks
                </button>
              </div>

              {/* Timeframe selector */}
              <div className="flex gap-1 p-1" style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                {['1D', '1M', '1Y', 'ALL'].map(tf => (
                  <button 
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    style={{ 
                      padding: '0.25rem 0.75rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '6px',
                      background: timeframe === tf ? 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))' : 'transparent',
                      color: timeframe === tf ? '#fff' : 'var(--text-secondary)',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="dashboard-chart-container" style={{ height: '350px' }}>
            {filteredBets.length === 0 ? (
              <div className="flex items-center justify-center" style={{ height: '100%', opacity: 0.5, fontStyle: 'italic', color: 'var(--text-secondary)' }}>No data to display.</div>
            ) : chartType === 'line' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 20, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalanceGraph" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={netProfit >= 0 ? "#22d3ee" : "#ef4444"} stopOpacity={0.4}/>
                      <stop offset="75%" stopColor={netProfit >= 0 ? "#3b82f6" : "#ef4444"} stopOpacity={0.05}/>
                      <stop offset="100%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.4)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis yAxisId="left" stroke="rgba(255, 255, 255, 0.4)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${sym}${value}`} dx={-5} domain={[chartYMin, chartYMax]} />
                  <Tooltip content={<CustomTooltip sym={sym} />} cursor={{ stroke: 'rgba(6, 182, 212, 0.4)', strokeDasharray: '3 3' }} />
                  <Area 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="balance" 
                    stroke={netProfit >= 0 ? "#22d3ee" : "#ef4444"} 
                    strokeWidth={3} 
                    fill="url(#colorBalanceGraph)" 
                    dot={{ r: 4, fill: '#0d0f17', stroke: netProfit >= 0 ? "#22d3ee" : "#ef4444", strokeWidth: 2 }} 
                    activeDot={{ r: 7, fill: netProfit >= 0 ? "#22d3ee" : "#ef4444", stroke: '#ffffff', strokeWidth: 2 }} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <BankrollCandlestickChart data={candlestickData} sym={sym} />
            )}
          </div>
        </div>

        {/* Recent Performance Calendar */}
        <div className="glass-panel dashboard-calendar-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center mb-6 dashboard-card-header">
            <h3 className="label mb-0 text-gradient" style={{ fontSize: '1.5rem' }}>Performance Calendar</h3>
            <div className="flex items-center gap-4" style={{ background: 'var(--adaptive-white-03)', padding: '0.4rem 1rem', borderRadius: '100px', border: '1px solid var(--border-glass)' }}>
              <button 
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >{'<'}</button>
              <span style={{ fontWeight: 'bold', width: '120px', textAlign: 'center', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {calendarMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
              </span>
              <button 
                onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem', padding: '0 0.5rem', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >{'>'}</button>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {(() => {
              const year = calendarMonth.getFullYear();
              const month = calendarMonth.getMonth();
              const firstDay = new Date(year, month, 1);
              const lastDay = new Date(year, month + 1, 0);
              const daysInMonth = lastDay.getDate();
              const startDayIndex = firstDay.getDay();
              const monthDays = Array.from({ length: daysInMonth }).map((_, i) => new Date(year, month, i + 1));
              
              return (
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '8px' }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{d}</div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {Array.from({ length: startDayIndex }).map((_, i) => <div key={`empty-${i}`} />)}
                    {monthDays.map((date) => {
                      const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                      const p = dailyPnL[dateStr]?.profit || 0;
                      const hasBet = dailyPnL[dateStr] && Object.keys(dailyPnL).includes(dateStr) && (filteredBets.some(b => new Date(b.created_at).toDateString() === date.toDateString()));
                      const isProfit = p > 0;
                      const isLoss = p < 0;
                      return (
                        <div 
                          key={dateStr}
                          title={`${dateStr}: ${sym}${p}`}
                          onClick={() => {
                            if (hasBet) {
                              const dayBets = resolvedBets.filter(b => new Date(b.created_at).toDateString() === date.toDateString());
                              if (dayBets.length > 0) {
                                setSelectedBets(dayBets);
                                setCurrentBetIndex(0);
                              }
                            }
                          }}
                          style={{
                            background: isProfit ? 'rgba(0, 255, 136, 0.08)' : isLoss ? 'rgba(255, 51, 102, 0.08)' : 'var(--adaptive-white-02)',
                            border: `1px solid ${isProfit ? 'rgba(0, 255, 136, 0.2)' : isLoss ? 'rgba(255, 51, 102, 0.2)' : 'var(--border-glass)'}`,
                            borderRadius: '8px',
                            padding: '6px 4px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '50px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={e => {
                             e.currentTarget.style.transform = 'scale(1.05)';
                             e.currentTarget.style.background = isProfit ? 'rgba(0, 255, 136, 0.15)' : isLoss ? 'rgba(255, 51, 102, 0.15)' : 'var(--adaptive-white-05)';
                          }}
                          onMouseLeave={e => {
                             e.currentTarget.style.transform = 'scale(1)';
                             e.currentTarget.style.background = isProfit ? 'rgba(0, 255, 136, 0.08)' : isLoss ? 'rgba(255, 51, 102, 0.08)' : 'var(--adaptive-white-02)';
                          }}
                        >
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '2px' }}>{date.getDate()}</span>
                          {p !== 0 ? (
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isProfit ? 'var(--success)' : 'var(--danger)' }}>
                              {isProfit ? '+' : '-'}{sym}{Math.abs(p).toFixed(0)}
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', opacity: 0.4 }}>0</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Advanced Distribution Charts */}
        <div className="grid grid-cols-2 gap-12">
          {/* Odds Tier Win Rate */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 className="label mb-6 text-gradient" style={{ fontSize: '1.3rem' }}>Win Rate by Odds Tier</h3>
            <div style={{ height: '250px' }}>
              {filteredBets.length === 0 ? <div className="flex items-center justify-center" style={{ height: '100%', opacity: 0.5, fontStyle: 'italic', color: 'var(--text-secondary)' }}>No data to display.</div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip
                      content={({active, payload}) => {
                        if(active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div style={{ background: 'var(--bg-glass-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                              <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Odds: {d.tier}</p>
                              <p style={{ color: 'var(--accent-magenta)', fontSize: '1.2rem', fontWeight: 'bold' }}>{d.winRate}%</p>
                              <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{d.total} total bets</p>
                            </div>
                          )
                        }
                        return null;
                      }}
                    />
                    <Pie data={oddsTierData} dataKey="winRate" nameKey="tier" cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                      {oddsTierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sport Win Rate */}
          <div className="glass-panel" style={{ padding: '2rem' }}>
            <h3 className="label mb-6 text-gradient" style={{ fontSize: '1.3rem' }}>Win Rate by Sport</h3>
            <div style={{ height: '250px' }}>
              {filteredBets.length === 0 ? <div className="flex items-center justify-center" style={{ height: '100%', opacity: 0.5, fontStyle: 'italic', color: 'var(--text-secondary)' }}>No data to display.</div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Tooltip
                      content={({active, payload}) => {
                        if(active && payload && payload.length) {
                          const d = payload[0].payload;
                          return (
                            <div style={{ background: 'var(--bg-glass-hover)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                              <p style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>Sport: {d.sport}</p>
                              <p style={{ color: 'var(--accent-magenta)', fontSize: '1.2rem', fontWeight: 'bold' }}>{d.winRate}%</p>
                              <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{d.total} total bets</p>
                            </div>
                          )
                        }
                        return null;
                      }}
                    />
                    <Pie data={sportWinRateData} dataKey="winRate" nameKey="sport" cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={5}>
                      {sportWinRateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
