import React, { useState, useEffect } from 'react';
import { Target, Sparkles, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';

export default function Tools() {
  const [activeTool, setActiveTool] = useState('ladder');

  // Ladder State
  const [startAmount, setStartAmount] = useState(10);
  const [targetAmount, setTargetAmount] = useState(500);
  const [activeSteps, setActiveSteps] = useState({ safe: 1, mod: 1, agg: 1 });

  // Kelly State
  const [kellyBankroll, setKellyBankroll] = useState(1000);
  const [kellyOdds, setKellyOdds] = useState(2.0);
  const [kellyProb, setKellyProb] = useState(55);
  const [kellyMultiplier, setKellyMultiplier] = useState(0.5); // Fractional Kelly (0.5 = Half Kelly)

  // Arbitrage State
  const [arbStake, setArbStake] = useState(100);
  const [arbOdds1, setArbOdds1] = useState(2.10);
  const [arbOdds2, setArbOdds2] = useState(2.10);

  // EV State
  const [evOdds, setEvOdds] = useState(1.90);
  const [evProb, setEvProb] = useState(55);
  const [evStake, setEvStake] = useState(100);

  // Odds Converter State
  const [convDec, setConvDec] = useState(2.00);
  const [convFrac, setConvFrac] = useState("1/1");
  const [convAm, setConvAm] = useState("+100");

  useEffect(() => {
    document.title = "Tools - Compounding Calculator";
  }, []);

  const calculateLadder = (start, target, odds) => {
    if (start >= target || start <= 0) return [];
    
    // Calculate exact number of steps required
    // Formula: Target = Start * (Odds ^ Steps)
    // Steps = log(Target/Start) / log(Odds)
    const exactSteps = Math.log(target / start) / Math.log(odds);
    const steps = Math.ceil(exactSteps);
    
    const ladder = [];
    let currentAmount = start;
    
    for (let i = 1; i <= steps; i++) {
      const isLastStep = i === steps;
      // On the last step, we don't need to bet the full amount if we're going to overshoot the target
      // Actually, standard rollover ladder means betting everything. Let's just bet everything.
      const stake = currentAmount;
      const returns = stake * odds;
      
      ladder.push({
        step: i,
        stake: stake,
        returns: returns,
        odds: odds
      });
      
      currentAmount = returns;
    }
    
    return ladder;
  };

  const safeLadder = calculateLadder(parseFloat(startAmount) || 0, parseFloat(targetAmount) || 0, 1.20);
  const modLadder = calculateLadder(parseFloat(startAmount) || 0, parseFloat(targetAmount) || 0, 1.50);
  const aggLadder = calculateLadder(parseFloat(startAmount) || 0, parseFloat(targetAmount) || 0, 2.00);

  // Kelly Calculations
  const numKellyOdds = Number(kellyOdds) || 0;
  const numKellyProb = Number(kellyProb) || 0;
  const numKellyBankroll = Number(kellyBankroll) || 0;
  const numKellyMultiplier = Number(kellyMultiplier) || 0;
  const b = numKellyOdds - 1;
  const p = numKellyProb / 100;
  const q = 1 - p;
  const fullKellyPct = b > 0 ? ((b * p) - q) / b : 0;
  const adjKellyPct = Math.max(0, fullKellyPct * numKellyMultiplier);
  const recKellyStake = numKellyBankroll * adjKellyPct;

  // Arbitrage Calculations
  const numArbOdds1 = Number(arbOdds1) || 0;
  const numArbOdds2 = Number(arbOdds2) || 0;
  const numArbStake = Number(arbStake) || 0;
  const arbImplied1 = numArbOdds1 > 0 ? 1 / numArbOdds1 : 0;
  const arbImplied2 = numArbOdds2 > 0 ? 1 / numArbOdds2 : 0;
  const arbMargin = (arbImplied1 + arbImplied2) * 100;
  const isArb = arbMargin < 100 && arbMargin > 0;
  const arbStake2 = numArbOdds2 > 0 ? (numArbStake * numArbOdds1) / numArbOdds2 : 0;
  const arbTotalStake = numArbStake + arbStake2;
  const arbReturn = numArbStake * numArbOdds1;
  const arbProfit = arbReturn - arbTotalStake;
  const arbROI = arbTotalStake > 0 ? (arbProfit / arbTotalStake) * 100 : 0;

  // EV Calculations
  const numEvOdds = Number(evOdds) || 0;
  const numEvProb = Number(evProb) || 0;
  const numEvStake = Number(evStake) || 0;
  const evImpliedProb = numEvOdds > 0 ? (1 / numEvOdds) * 100 : 0;
  const evTrueP = numEvProb / 100;
  const evWinAmount = numEvStake * (numEvOdds - 1);
  const evExpectedValue = (evTrueP * evWinAmount) - ((1 - evTrueP) * numEvStake);
  const evEdge = numEvStake > 0 ? (evExpectedValue / numEvStake * 100) : 0;

  // Converter Functions
  const handleDecChange = (val) => {
    setConvDec(val);
    const d = parseFloat(val);
    if (d > 1) {
      if (d >= 2) setConvAm(`+${Math.round((d - 1) * 100)}`);
      else setConvAm(`${Math.round(-100 / (d - 1))}`);
      // Simple fraction approximation
      const gcd = function(a, b) { return b ? gcd(b, a % b) : a; };
      const decPart = d - 1;
      const len = decPart.toString().length - 2;
      let denominator = Math.pow(10, len);
      let numerator = decPart * denominator;
      const divisor = gcd(numerator, denominator);
      setConvFrac(`${Math.round(numerator/divisor)}/${Math.round(denominator/divisor)}`);
    } else {
      setConvAm(""); setConvFrac("");
    }
  };

  return (
    <div className="flex-col gap-8 pb-12">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Quantitative Tools</h2>
          <p className="text-secondary">Institutional-grade mathematical calculators for professional edge modeling.</p>
        </div>
      </div>

      <div className="flex gap-4 mb-4" style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {['ladder', 'kelly', 'arbitrage', 'ev', 'converter'].map(tool => (
          <button 
            key={tool}
            onClick={() => setActiveTool(tool)}
            className="glass-card"
            style={{ 
              padding: '0.75rem 1.5rem', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              textTransform: 'capitalize',
              border: activeTool === tool ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
              background: activeTool === tool ? 'rgba(59,130,246,0.1)' : 'var(--bg-glass)'
            }}
          >
            {tool === 'ladder' ? 'Compounding Ladder' : tool === 'kelly' ? 'Kelly Criterion' : tool === 'ev' ? 'Expected Value (+EV)' : tool === 'converter' ? 'Odds Converter' : 'Arbitrage Engine'}
          </button>
        ))}
      </div>

      {activeTool === 'ladder' && (
        <>
          <div className="glass-panel" style={{ animation: 'fade-in 0.3s ease' }}>
        <h3 className="label text-gradient mb-6" style={{ fontSize: '1.2rem' }}>Set Your Goal</h3>
        <div className="flex gap-6 md-flex-col">
          <div className="flex-col flex-1">
            <label className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Starting Bankroll ($)</label>
            <input 
              type="number" 
              className="input-field text-xl font-bold" 
              value={startAmount} 
              onChange={e => setStartAmount(e.target.value)}
              min="1"
            />
          </div>
          <div className="flex-col flex-1">
            <label className="text-secondary" style={{ fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Target Goal ($)</label>
            <input 
              type="number" 
              className="input-field text-xl font-bold" 
              style={{ color: 'var(--accent-cyan)' }}
              value={targetAmount} 
              onChange={e => setTargetAmount(e.target.value)}
              min="2"
            />
          </div>
        </div>
      </div>

      {(parseFloat(startAmount) > 0 && parseFloat(targetAmount) > parseFloat(startAmount)) ? (
        <div className="grid grid-cols-3 gap-8" style={{ animation: 'fade-in 0.4s ease' }}>
          
          {/* Safe Profile */}
          <div className="glass-card flex-col gap-4" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(0, 255, 136, 0.05)' }}>
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>Safe (Grind)</h3>
                <Sparkles size={20} color="var(--success)" />
              </div>
              <p className="text-secondary mb-4" style={{ fontSize: '0.85rem' }}>Average Odds: <strong style={{ color: 'var(--text-primary)' }}>1.20</strong></p>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{safeLadder.length} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Bets</span></h2>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }} className="team-dropdown">
              {safeLadder.map(step => {
                const isCompleted = step.step < activeSteps.safe;
                const isActive = step.step === activeSteps.safe;
                
                return (
                  <div 
                    key={step.step} 
                    onClick={() => setActiveSteps({ ...activeSteps, safe: step.step })}
                    className="flex justify-between items-center mb-3" 
                    style={{ 
                      background: isActive ? 'rgba(0,255,136,0.1)' : 'var(--adaptive-white-02)', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--success)' : '1px solid transparent',
                      opacity: isCompleted ? 0.4 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isActive ? 'var(--success)' : 'rgba(0,255,136,0.1)', color: isActive ? '#000' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {isCompleted ? '✓' : step.step}
                      </div>
                      <div className="flex-col">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>STAKE</span>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>${step.stake.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex-col" style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>RETURN</span>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isCompleted ? 'var(--text-secondary)' : 'var(--success)', textDecoration: isCompleted ? 'line-through' : 'none' }}>${step.returns.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Moderate Profile */}
          <div className="glass-card flex-col gap-4" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(226, 232, 240, 0.05)' }}>
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', fontSize: '1.2rem' }}>Moderate</h3>
                <Zap size={20} color="var(--accent-cyan)" />
              </div>
              <p className="text-secondary mb-4" style={{ fontSize: '0.85rem' }}>Average Odds: <strong style={{ color: 'var(--text-primary)' }}>1.50</strong></p>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{modLadder.length} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Bets</span></h2>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }} className="team-dropdown">
              {modLadder.map(step => {
                const isCompleted = step.step < activeSteps.mod;
                const isActive = step.step === activeSteps.mod;
                
                return (
                  <div 
                    key={step.step} 
                    onClick={() => setActiveSteps({ ...activeSteps, mod: step.step })}
                    className="flex justify-between items-center mb-3" 
                    style={{ 
                      background: isActive ? 'rgba(59,130,246,0.1)' : 'var(--adaptive-white-02)', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                      opacity: isCompleted ? 0.4 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isActive ? 'var(--accent-cyan)' : 'rgba(59,130,246,0.1)', color: isActive ? '#fff' : 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {isCompleted ? '✓' : step.step}
                      </div>
                      <div className="flex-col">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>STAKE</span>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>${step.stake.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex-col" style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>RETURN</span>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isCompleted ? 'var(--text-secondary)' : 'var(--accent-cyan)', textDecoration: isCompleted ? 'line-through' : 'none' }}>${step.returns.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Aggressive Profile */}
          <div className="glass-card flex-col gap-4" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255, 0, 234, 0.05)' }}>
              <div className="flex justify-between items-center mb-2">
                <h3 style={{ color: 'var(--accent-magenta)', fontWeight: 'bold', fontSize: '1.2rem' }}>Aggressive</h3>
                <AlertTriangle size={20} color="var(--accent-magenta)" />
              </div>
              <p className="text-secondary mb-4" style={{ fontSize: '0.85rem' }}>Average Odds: <strong style={{ color: 'var(--text-primary)' }}>2.00 (Even)</strong></p>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{aggLadder.length} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Bets</span></h2>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }} className="team-dropdown">
              {aggLadder.map(step => {
                const isCompleted = step.step < activeSteps.agg;
                const isActive = step.step === activeSteps.agg;
                
                return (
                  <div 
                    key={step.step} 
                    onClick={() => setActiveSteps({ ...activeSteps, agg: step.step })}
                    className="flex justify-between items-center mb-3" 
                    style={{ 
                      background: isActive ? 'rgba(139,92,246,0.1)' : 'var(--adaptive-white-02)', 
                      padding: '0.75rem', 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--accent-magenta)' : '1px solid transparent',
                      opacity: isCompleted ? 0.4 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: isActive ? 'var(--accent-magenta)' : 'rgba(139,92,246,0.1)', color: isActive ? '#fff' : 'var(--accent-magenta)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {isCompleted ? '✓' : step.step}
                      </div>
                      <div className="flex-col">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>STAKE</span>
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem', textDecoration: isCompleted ? 'line-through' : 'none' }}>${step.stake.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex-col" style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>RETURN</span>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: isCompleted ? 'var(--text-secondary)' : 'var(--accent-magenta)', textDecoration: isCompleted ? 'line-through' : 'none' }}>${step.returns.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
            <div className="glass-panel text-center" style={{ padding: '4rem 2rem' }}>
              <ShieldAlert size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <h3 className="mb-2" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Target must be greater than starting bankroll</h3>
            </div>
          )}
        </>
      )}

      {activeTool === 'kelly' && (
        <div className="glass-panel" style={{ animation: 'fade-in 0.3s ease' }}>
          <h3 className="label text-gradient mb-6" style={{ fontSize: '1.2rem' }}>Kelly Criterion Calculator</h3>
          <p className="text-secondary mb-8" style={{ maxWidth: '600px' }}>Calculates the mathematically optimal percentage of your bankroll to wager based on your perceived edge.</p>
          
          <div className="grid grid-cols-2 gap-10">
            <div className="flex-col gap-6">
              <div>
                <label className="text-secondary text-sm">Total Bankroll ($)</label>
                <input type="number" className="input-field mt-2" value={kellyBankroll} onChange={e => setKellyBankroll(e.target.value)} />
              </div>
              <div>
                <label className="text-secondary text-sm">Bookmaker Odds (Decimal)</label>
                <input type="number" className="input-field mt-2" value={kellyOdds} onChange={e => setKellyOdds(e.target.value)} step="0.01" />
              </div>
              <div>
                <label className="text-secondary text-sm">Your True Probability (%)</label>
                <input type="number" className="input-field mt-2" value={kellyProb} onChange={e => setKellyProb(e.target.value)} />
              </div>
              <div>
                <label className="text-secondary text-sm">Kelly Multiplier (Fractional Kelly)</label>
                <select className="input-field mt-2" value={kellyMultiplier} onChange={e => setKellyMultiplier(e.target.value)}>
                  <option value={1}>Full Kelly (Aggressive)</option>
                  <option value={0.5}>Half Kelly (Moderate)</option>
                  <option value={0.25}>Quarter Kelly (Conservative)</option>
                </select>
              </div>
            </div>

            <div className="glass-card flex-col items-center justify-center" style={{ background: fullKellyPct > 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
              {fullKellyPct > 0 ? (
                <>
                  <p className="text-secondary mb-2 uppercase">Recommended Stake</p>
                  <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--success)' }}>${recKellyStake.toFixed(2)}</h1>
                  <p style={{ color: 'var(--success)', fontWeight: 'bold' }}>{(adjKellyPct * 100).toFixed(2)}% of Bankroll</p>
                  <p className="text-secondary mt-6 text-sm text-center">True Edge: {(((kellyProb/100) * kellyOdds) - 1 > 0) ? '+' : ''}{((((kellyProb/100) * kellyOdds) - 1) * 100).toFixed(2)}%</p>
                </>
              ) : (
                <>
                  <AlertTriangle size={48} color="var(--danger)" className="mb-4" />
                  <h2 style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Negative Expected Value</h2>
                  <p className="text-secondary mt-2 text-center">Do not bet. Your perceived probability is lower than the bookmaker's implied probability.</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTool === 'arbitrage' && (
        <div className="glass-panel" style={{ animation: 'fade-in 0.3s ease' }}>
          <h3 className="label text-gradient mb-6" style={{ fontSize: '1.2rem' }}>Arbitrage Engine (Sure-Bets)</h3>
          
          <div className="grid grid-cols-2 gap-10">
            <div className="flex-col gap-6">
              <div>
                <label className="text-secondary text-sm">Stake on Outcome 1 ($)</label>
                <input type="number" className="input-field mt-2" value={arbStake} onChange={e => setArbStake(e.target.value)} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-secondary text-sm">Outcome 1 Odds</label>
                  <input type="number" className="input-field mt-2" value={arbOdds1} onChange={e => setArbOdds1(e.target.value)} step="0.01" />
                </div>
                <div className="flex-1">
                  <label className="text-secondary text-sm">Outcome 2 Odds</label>
                  <input type="number" className="input-field mt-2" value={arbOdds2} onChange={e => setArbOdds2(e.target.value)} step="0.01" />
                </div>
              </div>
            </div>

            <div className="glass-card flex-col justify-center" style={{ background: isArb ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
              <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
                <span className="text-secondary">Required Stake 2:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>${arbStake2.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-secondary">Total Investment:</span>
                <span>${arbTotalStake.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-secondary">Guaranteed Return:</span>
                <span>${arbReturn.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-glass)' }}>
                <span className="text-secondary font-bold">Arbitrage Status:</span>
                {isArb ? (
                  <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.2rem' }}>+${arbProfit.toFixed(2)} ({arbROI.toFixed(2)}%)</span>
                ) : (
                  <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>No Arbitrage (Margin: {arbMargin.toFixed(2)}%)</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTool === 'ev' && (
        <div className="glass-panel" style={{ animation: 'fade-in 0.3s ease' }}>
          <h3 className="label text-gradient mb-6" style={{ fontSize: '1.2rem' }}>Expected Value (+EV)</h3>
          
          <div className="grid grid-cols-2 gap-10">
            <div className="flex-col gap-6">
              <div>
                <label className="text-secondary text-sm">Stake Amount ($)</label>
                <input type="number" className="input-field mt-2" value={evStake} onChange={e => setEvStake(e.target.value)} />
              </div>
              <div>
                <label className="text-secondary text-sm">Bookmaker Odds</label>
                <input type="number" className="input-field mt-2" value={evOdds} onChange={e => setEvOdds(e.target.value)} step="0.01" />
                <p className="text-secondary text-xs mt-1">Implied Probability: {evImpliedProb.toFixed(1)}%</p>
              </div>
              <div>
                <label className="text-secondary text-sm">True Fair Probability (%)</label>
                <input type="number" className="input-field mt-2" value={evProb} onChange={e => setEvProb(e.target.value)} />
              </div>
            </div>

            <div className="glass-card flex-col items-center justify-center" style={{ background: evExpectedValue > 0 ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)' }}>
              <p className="text-secondary mb-2 uppercase">Expected Value</p>
              <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: evExpectedValue > 0 ? 'var(--success)' : 'var(--danger)' }}>
                {evExpectedValue > 0 ? '+' : ''}${evExpectedValue.toFixed(2)}
              </h1>
              <p style={{ color: evExpectedValue > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>Edge: {evEdge > 0 ? '+' : ''}{evEdge.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      )}

      {activeTool === 'converter' && (
        <div className="glass-panel" style={{ animation: 'fade-in 0.3s ease' }}>
          <h3 className="label text-gradient mb-6" style={{ fontSize: '1.2rem' }}>Odds Converter</h3>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="glass-card flex-col text-center">
              <label className="text-secondary text-sm mb-4 uppercase font-bold">Decimal</label>
              <input type="number" className="input-field text-center text-xl font-bold" value={convDec} onChange={e => handleDecChange(e.target.value)} step="0.01" />
            </div>
            <div className="glass-card flex-col text-center" style={{ opacity: 0.7 }}>
              <label className="text-secondary text-sm mb-4 uppercase font-bold">American</label>
              <input type="text" className="input-field text-center text-xl font-bold" value={convAm} readOnly />
            </div>
            <div className="glass-card flex-col text-center" style={{ opacity: 0.7 }}>
              <label className="text-secondary text-sm mb-4 uppercase font-bold">Fractional</label>
              <input type="text" className="input-field text-center text-xl font-bold" value={convFrac} readOnly />
            </div>
          </div>
          <p className="text-center text-secondary mt-6">Enter Decimal odds to instantly convert to American and Fractional formats.</p>
        </div>
      )}
    </div>
  );
}
