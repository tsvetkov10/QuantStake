import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Activity, CheckCircle, DollarSign, Percent, Banknote, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MOCK_ANALYSTS = {
  elena_valuebet: { username: 'elena_valuebet', name: 'Elena Dimitrova', winRate: 72.1, roi: 18.2, netProfit: 5890, region: 'Bulgaria', totalBets: 154, currency: 'EUR' },
  quant_edge: { username: 'quant_edge', name: 'Quant Edge', winRate: 59.5, roi: 31.4, netProfit: 8120, region: 'United Kingdom', totalBets: 284, currency: 'GBP' },
  algo_vance: { username: 'algo_vance', name: 'Alex Vance', winRate: 68.2, roi: 24.5, netProfit: 4250, region: 'United States', totalBets: 98, currency: 'USD' },
  sofia_picks: { username: 'sofia_picks', name: 'Sofia Picks', winRate: 51.2, roi: 8.4, netProfit: 420, region: 'Bulgaria', totalBets: 45, currency: 'EUR' },
  bg_pro_trader: { username: 'bg_pro_trader', name: 'Bulgarian Pro', winRate: 64.0, roi: 15.7, netProfit: 2100, region: 'Bulgaria', totalBets: 112, currency: 'EUR' }
};

const MOCK_TRADER_BETS = {
  elena_valuebet: [
    { id: 'e2', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), sport: 'Tennis', bookmaker: 'Betano', type: 'Single', teams: 'Alcaraz vs Djokovic', stake: 150, odds: 2.10, status: 'Won' },
    { id: 'e3', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), sport: 'Basketball', bookmaker: 'Inbet', type: 'Single', teams: 'Lakers vs Warriors', stake: 100, odds: 1.95, status: 'Won' }
  ],
  quant_edge: [
    { id: 'q2', created_at: new Date(Date.now() - 86400000 * 1).toISOString(), sport: 'Football', bookmaker: 'Bet365', type: 'Single', teams: 'Man City vs Arsenal', stake: 500, odds: 1.75, status: 'Won' },
    { id: 'q3', created_at: new Date(Date.now() - 86400000 * 3).toISOString(), sport: 'Tennis', bookmaker: 'Bwin', type: 'Single', teams: 'Sinner vs Medvedev', stake: 250, odds: 1.80, status: 'Lost' }
  ],
  algo_vance: [
    { id: 'a2', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), sport: 'Football', bookmaker: 'Unibet', type: 'Single', teams: 'Bayern vs Dortmund', stake: 180, odds: 2.20, status: 'Won' }
  ],
  sofia_picks: [
    { id: 's2', created_at: new Date(Date.now() - 86400000 * 4).toISOString(), sport: 'Basketball', bookmaker: 'Sesame', type: 'Single', teams: 'Rilski vs Balkan', stake: 30, odds: 1.85, status: 'Lost' }
  ],
  bg_pro_trader: [
    { id: 'b2', created_at: new Date(Date.now() - 86400000 * 2).toISOString(), sport: 'Football', bookmaker: 'Betano', type: 'Single', teams: 'Lokomotiv vs Cherno More', stake: 100, odds: 2.10, status: 'Won' }
  ]
};

export default function TraderProfile({ session, profile }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [trader, setTrader] = useState(null);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined;

  useEffect(() => {
    // If user navigates to their own profile username, redirect them to dashboard
    if (profile?.username && username === profile.username) {
      navigate('/dashboard');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      
      if (!isMock) {
        try {
          // 1. Fetch profile
          const { data: profData } = await supabase
            .from('profiles')
            .select('*')
            .eq('username', username)
            .single();
            
          if (profData) {
            // 2. Fetch settled bets only (public ones)
            const { data: betsData } = await supabase
              .from('bets')
              .select('*')
              .eq('user_id', profData.id)
              .neq('status', 'Pending')
              .eq('is_public', true)
              .order('created_at', { ascending: false });
              
            // 3. Compute stats
            const resolved = betsData ? betsData.filter(b => b.status !== 'Pending') : [];
            const totalStaked = betsData ? betsData.reduce((sum, bet) => sum + parseFloat(bet.stake || 0), 0) : 0;
            let grossProfit = 0;
            let grossLoss = 0;

            if (betsData) {
              betsData.forEach(bet => {
                if (bet.status === 'Pending') return;
                const stake = parseFloat(bet.stake || 0);
                const returned = bet.status === 'Won' ? (stake * parseFloat(bet.odds || 0)) : (bet.status === 'Cashed Out' ? parseFloat(bet.cashout_amount || 0) : 0);
                const pl = returned - stake;
                if (pl > 0) grossProfit += pl;
                else grossLoss += Math.abs(pl);
              });
            }

            const netProfit = grossProfit - grossLoss;
            const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0;
            const wonBets = resolved.filter(b => b.status === 'Won' || b.status === 'Cashed Out');
            const winRate = resolved.length > 0 ? (wonBets.length / resolved.length) * 100 : 0;

            setTrader({
              id: profData.id,
              username: profData.username,
              name: profData.username,
              winRate: parseFloat(winRate.toFixed(1)),
              roi: parseFloat(roi.toFixed(1)),
              netProfit: parseFloat(netProfit.toFixed(2)),
              totalBets: betsData ? betsData.length : 0,
              region: profData.region || 'Unknown',
              currency: profData.currency || 'USD'
            });
            setBets(betsData || []);
          } else {
            loadMockData();
          }
        } catch (e) {
          console.error("DB Load failed, falling back to mock", e);
          loadMockData();
        }
      } else {
        loadMockData();
      }
      
      setLoading(false);
    };

    const loadMockData = () => {
      const currentTrader = MOCK_ANALYSTS[username];
      if (currentTrader) {
        setTrader(currentTrader);
        setBets(MOCK_TRADER_BETS[username] || []);
        document.title = `${currentTrader.username} - Quant Portfolio`;
      } else {
        setTrader({ username, name: username, winRate: 60.0, roi: 12.0, netProfit: 1500, region: 'Europe', totalBets: 40, currency: 'EUR' });
        setBets([]);
      }
    };

    loadData();
  }, [username, profile, navigate, isMock, session]);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading trader record...</div>;
  if (!trader) return <div style={{ padding: '4rem', textAlign: 'center' }}>Locating analyst records...</div>;

  const sym = trader.currency === 'EUR' ? '€' : trader.currency === 'GBP' ? '£' : '$';

  return (
    <div className="flex-col gap-10 pb-12">
      
      {/* Header Info */}
      <div className="flex justify-between items-center flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 'bold' }}>
            {trader.username[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {trader.username}
            </h2>
            <p className="text-secondary" style={{ fontSize: '0.95rem' }}>Quant Analyst • {trader.region} • Public Track Record</p>
          </div>
        </div>
      </div>

      {/* Stats Dashcards */}
      <div className="grid grid-cols-4 gap-10">
        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--accent-cyan) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Total Profit</p>
            <DollarSign size={20} color="var(--accent-cyan)" />
          </div>
          <h3 className="relative z-10 glow-text-success" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'monospace' }}>
            {trader.netProfit >= 0 ? '+' : ''}{sym}{trader.netProfit.toLocaleString()}
          </h3>
          <p className="relative z-10 text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Net Earnings</p>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--accent-magenta) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Win Rate</p>
            <Target size={20} color="var(--accent-magenta)" />
          </div>
          <h3 className="relative z-10 glow-text-neutral" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'monospace' }}>
            {trader.winRate.toFixed(1)}%
          </h3>
          <p className="text-secondary relative z-10" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Efficiency</p>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Yield (ROI)</p>
            <Percent size={20} color="var(--success)" />
          </div>
          <h3 className="relative z-10 glow-text-success" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'monospace' }}>
            {trader.roi >= 0 ? '+' : ''}{trader.roi.toFixed(1)}%
          </h3>
          <p className="text-secondary relative z-10" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Average Edge</p>
        </div>

        <div className="glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, #a13bf7 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
          <div className="flex justify-between items-center mb-4 relative z-10">
            <p className="label">Total Signals</p>
            <Banknote size={20} color="#a13bf7" />
          </div>
          <h3 className="relative z-10 glow-text-neutral" style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'monospace' }}>
            {trader.totalBets}
          </h3>
          <p className="text-secondary relative z-10" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Completed Signals</p>
        </div>
      </div>

      {/* Bets List Section */}
      <div className="flex-col gap-4">
        <h3 className="label" style={{ fontSize: '1.2rem' }}>Public Performance Audit Log</h3>
        
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--adaptive-white-03)', borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Sport</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Bet Prediction</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Odds</th>
                <th style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet) => (
                <tr key={bet.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <div style={{ fontWeight: '500' }}>{new Date(bet.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'var(--adaptive-white-05)', fontSize: '0.85rem' }}>{bet.sport}</span>
                  </td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 'bold' }}>{bet.teams}</td>
                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: '500', fontFamily: 'monospace', fontSize: '1.05rem' }}>{bet.odds.toFixed(2)}</td>
                  <td style={{ padding: '1.25rem 1.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.85rem',
                      backgroundColor: bet.status === 'Won' ? 'rgba(16, 185, 129, 0.1)' : 
                                       bet.status === 'Lost' ? 'rgba(239, 68, 68, 0.1)' : 'var(--adaptive-white-10)',
                      color: bet.status === 'Won' ? 'var(--success)' : 
                             bet.status === 'Lost' ? 'var(--danger)' : 'var(--text-primary)',
                      fontWeight: '600'
                    }}>
                      {bet.status}
                    </span>
                  </td>
                </tr>
              ))}
              {bets.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No completed signals logged by this trader.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
