import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search, Trophy, Check, ArrowRight, ShieldCheck } from 'lucide-react';

const MOCK_ANALYSTS = [
  { username: 'elena_valuebet', name: 'Elena Dimitrova', winRate: 72.1, roi: 18.2, netProfit: 5890, region: 'Bulgaria', totalBets: 154, avatar_url: '' },
  { username: 'quant_edge', name: 'Quant Edge', winRate: 59.5, roi: 31.4, netProfit: 8120, region: 'United Kingdom', totalBets: 284, avatar_url: '' },
  { username: 'algo_vance', name: 'Alex Vance', winRate: 68.2, roi: 24.5, netProfit: 4250, region: 'United States', totalBets: 98, avatar_url: '' },
  { username: 'sofia_picks', name: 'Sofia Picks', winRate: 51.2, roi: 8.4, netProfit: 420, region: 'Bulgaria', totalBets: 45, avatar_url: '' },
  { username: 'bg_pro_trader', name: 'Bulgarian Pro', winRate: 64.0, roi: 15.7, netProfit: 2100, region: 'Bulgaria', totalBets: 112, avatar_url: '' }
];

const calculateStatsForBets = (betsData, username, name, region) => {
  const resolved = betsData.filter(b => b.status !== 'Pending');
  const totalStaked = betsData.reduce((sum, bet) => sum + parseFloat(bet.stake || 0), 0);
  let grossProfit = 0;
  let grossLoss = 0;

  betsData.forEach(bet => {
    if (bet.status === 'Pending') return;
    const stake = parseFloat(bet.stake || 0);
    const returned = bet.status === 'Won' ? (stake * parseFloat(bet.odds || 0)) : (bet.status === 'Cashed Out' ? parseFloat(bet.cashout_amount || 0) : 0);
    const pl = returned - stake;
    if (pl > 0) grossProfit += pl;
    else grossLoss += Math.abs(pl);
  });

  const netProfit = grossProfit - grossLoss;
  const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
  const wonBets = resolved.filter(b => b.status === 'Won' || b.status === 'Cashed Out');
  const winRate = resolved.length > 0 ? (wonBets.length / resolved.length) * 100 : 0;

  return {
    username,
    name,
    winRate: parseFloat(winRate.toFixed(1)),
    roi: parseFloat(roi.toFixed(1)),
    netProfit: parseFloat(netProfit.toFixed(2)),
    totalBets: betsData.length,
    region
  };
};

export default function Leaderboard({ session, profile }) {
  const navigate = useNavigate();
  const [analystsList, setAnalystsList] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('roi'); // 'roi', 'winRate', 'netProfit'
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined;

  useEffect(() => {
    document.title = "Leaderboard - Top Analysts";
    
    // Load subscriptions
    const savedSubs = sessionStorage.getItem('quant_subscriptions');
    if (savedSubs) {
      setSubscriptions(JSON.parse(savedSubs));
    }

    const fetchAnalystsAndStats = async () => {
      setLoading(true);
      
      // 1. Fetch current user stats first (only public wagers)
      let userBets = [];
      if (isMock) {
        const mockBetsRaw = sessionStorage.getItem('mock_bets');
        userBets = mockBetsRaw ? JSON.parse(mockBetsRaw).filter(b => b.is_public !== false) : [];
      } else {
        const { data } = await supabase
          .from('bets')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('is_public', true);
        if (data) userBets = data;
      }
      const uStats = calculateStatsForBets(userBets, profile?.username || 'You', 'Your Profile', profile?.region || 'Unknown');
      setUserStats({ ...uStats, isUser: true });

      // 2. Fetch other analysts from database if not in mock mode
      if (!isMock) {
        try {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('*')
            .eq('profile_mode', 'analyst')
            .neq('id', session.user.id);
            
          if (profilesData && profilesData.length > 0) {
            const analystIds = profilesData.map(p => p.id);
            const { data: betsData } = await supabase
              .from('bets')
              .select('*')
              .in('user_id', analystIds)
              .eq('is_public', true);

            // Fetch DB subscriptions
            const { data: dbSubs } = await supabase
              .from('subscriptions')
              .select('subscribed_to_id')
              .eq('subscriber_id', session.user.id);

            if (dbSubs) {
              const followedUsernames = profilesData
                .filter(p => dbSubs.some(s => s.subscribed_to_id === p.id))
                .map(p => p.username);
              setSubscriptions(prev => [...new Set([...prev, ...followedUsernames])]);
            }

            const calculatedAnalysts = profilesData.map(p => {
              const pBets = betsData ? betsData.filter(b => b.user_id === p.id) : [];
              return calculateStatsForBets(pBets, p.username, p.username, p.region || 'Unknown');
            });
            
            setAnalystsList(calculatedAnalysts);
          } else {
            setAnalystsList([]);
          }
        } catch (e) {
          console.error("Error loading DB analysts, falling back to mock", e);
          setAnalystsList(MOCK_ANALYSTS);
        }
      } else {
        setAnalystsList(MOCK_ANALYSTS);
      }
      setLoading(false);
    };

    fetchAnalystsAndStats();
  }, [profile, session, isMock]);

  // Combine and sort analysts list
  const getRankedList = () => {
    let list = [...analystsList];
    
    // Add current user if they are registered as Quant Analyst
    if (profile?.profile_mode === 'analyst' && userStats) {
      // Avoid duplicate entry if user stats are somehow already there
      if (!list.some(a => a.isUser)) {
        list.push(userStats);
      }
    }

    return list.sort((a, b) => b[sortBy] - a[sortBy]);
  };

  const rankedAnalysts = getRankedList();

  const filteredAnalysts = rankedAnalysts.filter(a => 
    a.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-col gap-8">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Quant Analyst Leaderboard</h2>
          <p className="text-secondary">Explore top quantitative strategies and subscribe to unlock live signals.</p>
        </div>

        <div className="flex gap-4 items-center">
          <div style={{ position: 'relative' }}>
            <Search size={18} className="text-secondary" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Search analysts..." 
              className="input-field" 
              style={{ paddingLeft: '2.5rem', width: '220px', height: '38px', fontSize: '0.85rem' }} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-black-200" style={{ borderRadius: '8px', border: '1px solid var(--border-glass)', padding: '2px' }}>
            {['roi', 'winRate', 'netProfit'].map((sortOption) => (
              <button
                key={sortOption}
                onClick={() => setSortBy(sortOption)}
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.8rem',
                  borderRadius: '6px',
                  background: sortBy === sortOption ? 'var(--accent-cyan)' : 'transparent',
                  color: sortBy === sortOption ? 'white' : 'var(--text-secondary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  transition: 'all 0.2s ease'
                }}
              >
                {sortOption === 'roi' ? 'ROI' : sortOption === 'winRate' ? 'Win Rate' : 'Profit'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>Compiling ledger statistics...</div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--adaptive-white-03)', borderBottom: '1px solid var(--border-glass)' }}>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', width: '80px', textAlign: 'center' }}>Rank</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Analyst</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>ROI (Yield)</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Win Rate</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Total Profit</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Track Record</th>
                  <th style={{ padding: '1.25rem 1.5rem', color: 'var(--text-secondary)', fontWeight: '500', width: '200px' }}>Access Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnalysts.map((analyst, index) => {
                  const isFollowing = subscriptions.includes(analyst.username);
                  const isOwn = analyst.isUser;
                  
                  return (
                    <tr 
                      key={analyst.username}
                      onClick={() => navigate(isOwn ? '/dashboard' : `/trader/${analyst.username}`)}
                      style={{ 
                        borderBottom: '1px solid var(--border-glass)', 
                        cursor: 'pointer',
                        background: isOwn ? 'rgba(0, 243, 255, 0.02)' : 'transparent'
                      }}
                      className="hover-highlight transition-all group"
                    >
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
                        {index === 0 ? <Trophy size={20} color="#FFD700" style={{ margin: '0 auto' }} /> : 
                         index === 1 ? <Trophy size={20} color="#C0C0C0" style={{ margin: '0 auto' }} /> : 
                         index === 2 ? <Trophy size={20} color="#CD7F32" style={{ margin: '0 auto' }} /> : 
                         <span style={{ color: 'var(--text-secondary)' }}>#{index + 1}</span>}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        <div className="flex items-center gap-3">
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                            {analyst.username[0].toUpperCase()}
                          </div>
                          <div className="flex-col">
                            <span style={{ fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              {analyst.username}
                              {isOwn && <span style={{ fontSize: '0.65rem', background: 'var(--adaptive-white-08)', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>You</span>}
                            </span>
                            <span className="text-secondary" style={{ fontSize: '0.8rem' }}>{analyst.region}</span>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', color: analyst.roi >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {analyst.roi >= 0 ? '+' : ''}{analyst.roi.toFixed(1)}%
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                        {analyst.winRate.toFixed(1)}%
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.1rem', color: analyst.netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        €{analyst.netProfit.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'monospace' }}>
                        {analyst.totalBets} bets log
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                        {isOwn ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--adaptive-white-05)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <ShieldCheck size={14} /> Own Ledger
                          </span>
                        ) : isFollowing ? (
                          <span style={{ fontSize: '0.85rem', color: 'var(--success)', background: 'rgba(0, 255, 136, 0.05)', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid rgba(0, 255, 136, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <Check size={14} /> Subscribed
                          </span>
                        ) : (
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/trader/${analyst.username}`);
                            }}
                          >
                            Follow €50/mo <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredAnalysts.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No analysts match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
