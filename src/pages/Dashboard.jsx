import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ComposedChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LabelList, Legend } from 'recharts';
import { DollarSign, Percent, Target, Euro, PoundSterling, Banknote, Filter, TrendingDown, TrendingUp, Activity, AlertTriangle, Zap, BarChart2, Share2, Copy, X, Download, Check, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ShareCard from '../components/ShareCard';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';

const CustomTooltip = ({ active, payload, sym }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    if (data.date === 'Start') {
      return (
        <div style={{ background: 'var(--bg-glass-hover)', border: '1px solid var(--accent-cyan)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(10px)', color: 'var(--text-primary)', minWidth: '200px' }}>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Initial Balance</p>
          <p style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>Profit: {sym}{payload[0].value.toFixed(2)}</p>
        </div>
      );
    }

    const currentBet = data.rawBet;
    if (!currentBet) return null;

    const statusInfo = currentBet.status === 'Won' ? { color: '#00ffaa', label: 'SETTLED • WIN', shadow: '0 0 10px #00ffaa' } : currentBet.status === 'Lost' ? { color: '#ff3366', label: 'SETTLED • LOSS', shadow: '0 0 10px #ff3366' } : currentBet.status === 'Cashed Out' ? { color: '#FFD700', label: 'SETTLED • CASHOUT', shadow: '0 0 10px #FFD700' } : { color: '#aaa', label: 'PENDING', shadow: 'none' };
    let hashStr = currentBet.id ? currentBet.id.replace(/-/g, '').toUpperCase() : 'PENDING';
    const matchupParts = currentBet.teams ? currentBet.teams.split('vs').map(s => s.trim()) : ['Unknown'];
    const isWin = currentBet.status === 'Won';
    const isCashout = currentBet.status === 'Cashed Out';
    const isLoss = currentBet.status === 'Lost';
    const returnAmount = isWin ? currentBet.stake * currentBet.odds : isCashout ? currentBet.cashout_amount || 0 : 0;
    const netProfitVal = isWin ? returnAmount - currentBet.stake : isCashout ? returnAmount - currentBet.stake : isLoss ? -currentBet.stake : 0;

    return (
      <div 
        className="glass-panel" 
        style={{ 
          width: '320px', 
          background: 'linear-gradient(180deg, var(--slip-gradient-1) 0%, var(--slip-gradient-2) 100%)',
          border: `1.5px solid ${statusInfo.color}`,
          borderRadius: '12px',
          padding: '1.25rem',
          boxShadow: `0 0 30px rgba(${isWin ? '0,255,170' : isLoss ? '255,51,102' : isCashout ? '255,215,0' : '255,255,255'}, 0.05)`,
          overflow: 'hidden'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusInfo.color, boxShadow: statusInfo.shadow, animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: statusInfo.color, letterSpacing: '1px', fontWeight: 'bold' }}>
              {statusInfo.label}
            </span>
          </div>
          <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
            {new Date(currentBet.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="flex-col gap-3">
          <div className="flex justify-between items-center">
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text-secondary)', background: 'var(--adaptive-white-03)', padding: '0.15rem 0.4rem', borderRadius: '4px', textTransform: 'uppercase' }}>
              {currentBet.sport || 'OTHER'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: '500' }}>{currentBet.bookmaker || 'Unknown'}</span>
          </div>

          <div style={{ background: 'var(--adaptive-white-02)', border: '1px solid var(--adaptive-white-05)', borderRadius: '8px', padding: '0.75rem' }}>
            <div className="flex justify-between items-center mb-1.5">
              <span style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>SELECTION</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: 'var(--text-secondary)', letterSpacing: '1px' }}>{currentBet.type.toUpperCase()}</span>
            </div>
            {matchupParts.length === 2 ? (
              <div className="flex items-center justify-between gap-1">
                <div className="flex-col" style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{matchupParts[0]}</span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>HOME</span>
                </div>
                <div style={{ padding: '0.1rem 0.25rem', background: 'var(--adaptive-white-05)', borderRadius: '4px', fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>vs</div>
                <div className="flex-col text-right" style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{matchupParts[1]}</span>
                  <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>AWAY</span>
                </div>
              </div>
            ) : (
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentBet.teams}</span>
            )}
          </div>

          <div className="flex-col gap-2 mt-1">
            <div className="flex justify-between items-center p-1.5 rounded" style={{ background: 'rgba(0, 243, 255, 0.02)', border: '1px solid rgba(0, 243, 255, 0.1)' }}>
              <span className="text-secondary" style={{ fontSize: '0.7rem', fontWeight: '600' }}>Stake x Odds</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{sym}{parseFloat(currentBet.stake).toFixed(2)} @{parseFloat(currentBet.odds).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-1.5 rounded" style={{ background: statusInfo.color === '#aaa' ? 'var(--adaptive-white-05)' : `rgba(${isWin ? '0, 255, 170' : isLoss ? '255, 51, 102' : '255, 215, 0'}, 0.05)`, border: `1px solid ${statusInfo.color === '#aaa' ? 'rgba(255, 255, 255, 0.2)' : statusInfo.color}` }}>
              <span className="text-secondary" style={{ fontSize: '0.75rem', fontWeight: '700' }}>PnL Return</span>
              <span style={{ fontSize: '1rem', color: statusInfo.color, fontWeight: 'bold', textShadow: `0 0 10px ${statusInfo.color}` }}>
                {netProfitVal > 0 ? '+' : ''}{sym}{netProfitVal.toFixed(2)}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--adaptive-white-05)' }}>
            <div style={{ width: '100%', height: '24px', display: 'flex', alignItems: 'stretch', background: 'var(--adaptive-white-01)', padding: '2px', borderRadius: '4px', overflow: 'hidden', justifyContent: 'center' }}>
              {hashStr.split('').slice(0, 40).map((char, index) => {
                const val = parseInt(char, 16) || 0;
                return <div key={index} style={{ width: val < 8 ? '1px' : '2px', marginRight: `${(val % 2) + 1}px`, backgroundColor: 'var(--text-invert)', opacity: 0.18, flexShrink: 0 }} />;
              })}
            </div>
          </div>
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
  const pieColors = ['#00f3ff', '#ff3366', '#FFD700', '#00ffaa', '#8b5cf6', '#ff8c00', '#10b981'];

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

  const handleDownload = async () => {
    if (!shareCardRef.current) return;
    try {
      setIsGeneratingShare(true);
      const dataUrl = await htmlToImage.toPng(shareCardRef.current, { quality: 1.0, pixelRatio: 1, cacheBust: true });
      const timestamp = Math.floor(Date.now() / 1000);
      download(dataUrl, `QuantStake_${profile?.username || 'Trader'}_Performance_${timestamp}.png`);
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
      const blob = await htmlToImage.toBlob(shareCardRef.current, { quality: 1.0, pixelRatio: 1, cacheBust: true });
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (clipErr) {
        console.warn('Clipboard write failed, downloading instead...', clipErr);
        const timestamp = Math.floor(Date.now() / 1000);
        download(blob, `QuantStake_${profile?.username || 'Trader'}_Performance_${timestamp}.png`);
        alert('Image exported to downloads folder.');
      }
    } catch (err) {
      console.error('Failed to copy/download image', err);
      alert('Failed to generate image.');
    } finally {
      setIsGeneratingShare(false);
    }
  };

  const maxAbsBalance = chartData.length > 1 ? chartData.slice(1).reduce((max, d) => Math.max(max, Math.abs(d.balance)), 0) : 0;
  const maxAbsPnL = chartData.length > 1 ? chartData.slice(1).reduce((max, d) => Math.max(max, Math.abs(d.betPnL || 0)), 0) : 0;
  
  const globalMax = Math.max(maxAbsBalance, maxAbsPnL);
  const yGlobalMax = Math.ceil(globalMax * 1.2) || 100;

  return (
    <div className="flex-col gap-12 pb-12">
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
                  key={`${netProfit}-${roi}-${winRate}-${totalStaked}-${biggestWin}`}
                  ref={shareCardRef} 
                  profile={profile} 
                  metrics={{ netProfit, roi, winRate, totalStaked, biggestWin }} 
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', zIndex: 100000, marginTop: '1.5rem' }}>
            <button 
              onClick={handleCopy}
              disabled={isGeneratingShare || isCopied}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem', padding: '1rem 2rem', color: isCopied ? 'var(--success)' : undefined, borderColor: isCopied ? 'var(--success)' : undefined }}
            >
              {isGeneratingShare ? (
                <div className="spinner" style={{ width: '24px', height: '24px', borderTopColor: 'white' }}></div>
              ) : isCopied ? (
                <Check size={24} color="var(--success)" />
              ) : (
                <Copy size={24} />
              )}
              {isCopied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button 
              onClick={handleDownload}
              disabled={isGeneratingShare}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '1.2rem',
                padding: '1rem 2rem',
                background: 'rgba(0, 243, 255, 0.03)',
                border: '1.5px solid rgba(0, 243, 255, 0.3)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.03)'; }}
            >
              {isGeneratingShare ? <div className="spinner" style={{ width: '24px', height: '24px', borderTopColor: 'white' }}></div> : <Download size={24} color="white" />}
              <span>Save PNG</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end flex-wrap gap-6">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Portfolio Analytics</h2>
          <p className="text-secondary">Comprehensive quantitative breakdown of your betting strategy.</p>
        </div>
        
        <div className="flex gap-3 items-end md-flex-col" style={{ animation: 'fade-in 0.3s ease' }}>
          <div className="flex-col">
            <label className="text-secondary" style={{ fontSize: '0.65rem', marginBottom: '0.25rem', visibility: 'hidden', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Share</label>
            <button 
              onClick={() => setShowSharePreview(true)}
              className="btn btn-secondary" 
              style={{ padding: '0 1.25rem', height: '38px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}
            >
              <Share2 size={16} />
              <span style={{ marginLeft: '8px' }}>Share Performance</span>
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
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Total Profit</p>
            <DollarSign size={20} color="var(--accent-cyan)" />
          </div>
          {filteredBets.length === 0 ? <NoData /> : (
            <h3 className={`relative z-10 ${netProfit >= 0 ? 'glow-text-success' : 'glow-text-danger'}`} style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'monospace' }}>
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
            <h3 className="relative z-10 glow-text-neutral" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'monospace' }}>{winRate.toFixed(1)}%</h3>
          )}
          <p className="text-secondary relative z-10" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{wonBets.length} / {resolvedBets.length} Won</p>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Yield (ROI)</p>
            <Percent size={20} color="var(--success)" />
          </div>
          {filteredBets.length === 0 ? <NoData /> : (
            <h3 className={`relative z-10 ${roi >= 0 ? 'glow-text-success' : 'glow-text-danger'}`} style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'monospace' }}>{roi > 0 ? '+' : ''}{roi.toFixed(1)}%</h3>
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
            <h3 className="relative z-10 glow-text-neutral" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'monospace' }}>{sym}{totalStaked.toFixed(2)}</h3>
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
            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{profitFactor.toFixed(2)}</h3>
          )}
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{profitFactor > 1 ? 'Profitable Strategy' : 'Losing Strategy'}</p>
        </div>
        
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="label text-secondary" style={{ fontSize: '0.85rem' }}>Most Betted Sport</p>
            <TrendingUp size={16} color="var(--accent-cyan)" />
          </div>
          {filteredBets.length === 0 ? <NoDataSmall /> : (
            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{mostBettedSport}</h3>
          )}
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Top Volume Sport</p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="label text-secondary" style={{ fontSize: '0.85rem' }}>Avg Stake</p>
            <Euro size={16} color="var(--accent-magenta)" />
          </div>
          {filteredBets.length === 0 ? <NoDataSmall /> : (
            <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{sym}{avgStake.toFixed(2)}</h3>
          )}
          <p className="text-secondary" style={{ fontSize: '0.8rem' }}>Avg Bet Size</p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-2">
            <p className="label text-secondary" style={{ fontSize: '0.85rem' }}>Longest Streaks</p>
            <Zap size={16} color="#FFD700" />
          </div>
          {filteredBets.length === 0 ? <NoDataSmall /> : (
            <div className="flex gap-4 mt-2">
              <div>
                <p style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>{maxWinStreak} W</p>
              </div>
              <div>
                <p style={{ color: 'var(--danger)', fontWeight: 'bold', fontSize: '1.2rem' }}>{maxLossStreak} L</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="flex-col gap-12" style={{ animation: 'fade-in 0.6s ease' }}>
        
        {/* Bankroll Trajectory */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="label mb-0 text-gradient" style={{ fontSize: '1.5rem' }}>Bankroll Trajectory</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Cumulative PnL over time.</p>
            </div>
            <div className="flex gap-2 p-1" style={{ background: 'var(--adaptive-white-05)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
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
          <div style={{ height: '350px' }}>
            {filteredBets.length === 0 ? <div className="flex items-center justify-center" style={{ height: '100%', opacity: 0.5, fontStyle: 'italic', color: 'var(--text-secondary)' }}>No data to display.</div> : (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData.slice(1)} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={netProfit >= 0 ? "var(--success)" : "var(--danger)"} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={netProfit >= 0 ? "var(--success)" : "var(--danger)"} stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis yAxisId="left" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${sym}${value}`} dx={-10} domain={[-yGlobalMax, yGlobalMax]} />
                  <Tooltip content={<CustomTooltip sym={sym} />} cursor={{ fill: 'transparent' }} />
                  <Bar yAxisId="left" dataKey="waterfallRange" radius={4} fillOpacity={0.75} activeBar={{ fillOpacity: 1 }} style={{ outline: 'none' }}>
                    {chartData.slice(1).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.betPnL > 0 ? 'var(--success)' : entry.betPnL < 0 ? 'var(--danger)' : 'var(--text-secondary)'} />
                    ))}
                  </Bar>
                  <Line yAxisId="left" type="monotone" dataKey="balance" stroke="var(--accent-cyan)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-primary)', stroke: 'var(--accent-cyan)', strokeWidth: 2 }} activeDot={{ r: 6, fill: 'var(--accent-cyan)', stroke: 'none', outline: 'none' }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Performance Calendar */}
        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          <div className="flex justify-between items-center mb-6">
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
