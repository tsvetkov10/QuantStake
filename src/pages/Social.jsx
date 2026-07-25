import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, X, Search, Heart, MessageSquare, Share2, MoreHorizontal, ShieldCheck, Image as ImageIcon, Link as LinkIcon, Paperclip, Send, Plus, Video, Laugh } from 'lucide-react';

const MOCK_ANALYSTS = {
  elena_valuebet: { id: 'm1', username: 'elena_valuebet', name: 'Elena Dimitrova', winRate: 72.1, roi: 18.2, region: 'Bulgaria', verified: true },
  quant_edge: { id: 'm2', username: 'quant_edge', name: 'Quant Edge', winRate: 59.5, roi: 31.4, region: 'United Kingdom', verified: true },
  algo_vance: { id: 'm3', username: 'algo_vance', name: 'Alex Vance', winRate: 68.2, roi: 24.5, region: 'United States', verified: true },
  sofia_picks: { id: 'm4', username: 'sofia_picks', name: 'Sofia Picks', winRate: 51.2, roi: 8.4, region: 'Bulgaria', verified: false },
  bg_pro_trader: { id: 'm5', username: 'bg_pro_trader', name: 'Bulgarian Pro', winRate: 64.0, roi: 15.7, region: 'Bulgaria', verified: true }
};

const MOCK_ACTIVE_PREDICTIONS = [
  { id: 'p1', analyst_username: 'elena_valuebet', created_at: new Date(Date.now() - 3600000 * 2).toISOString(), sport: 'Football', bookmaker: 'Bet365', type: 'Single', teams: 'Real Madrid vs Barcelona', stake: 200, odds: 1.85, status: 'Pending', likes: 142, comments: 24, text: "The xG data for Madrid at home is undeniable right now. Missing Araujo will hurt Barca's high line significantly." },
  { id: 'p2', analyst_username: 'quant_edge', created_at: new Date(Date.now() - 3600000 * 5).toISOString(), sport: 'Basketball', bookmaker: 'Betway', type: 'Multiple', teams: 'Bulls + Knicks ML Acca', stake: 300, odds: 3.40, status: 'Pending', likes: 89, comments: 12, text: "Model showing massive value on this parlay. Both away teams are dealing with B2B fatigue and key injuries not priced in." },
  { id: 'p3', analyst_username: 'algo_vance', created_at: new Date(Date.now() - 3600000 * 8).toISOString(), sport: 'Tennis', bookmaker: 'Bet365', type: 'Single', teams: 'Swiatek vs Sabalenka', stake: 120, odds: 1.90, status: 'Pending', likes: 215, comments: 56, text: "Just firing some thoughts on the WTA final. Swiatek's return game on clay vs Sabalenka's second serve is the key metric here." },
  { id: 'p4', analyst_username: 'sofia_picks', created_at: new Date(Date.now() - 3600000 * 12).toISOString(), sport: 'Football', bookmaker: 'Betano', type: 'Single', teams: 'Levski vs CSKA', stake: 50, odds: 2.50, status: 'Pending', likes: 45, comments: 8, text: "" },
  { id: 'p5', analyst_username: 'bg_pro_trader', created_at: new Date(Date.now() - 3600000 * 24).toISOString(), sport: 'Football', bookmaker: 'Bet365', type: 'Single', teams: 'Ludogorets vs Botev', stake: 150, odds: 1.65, status: 'Pending', likes: 312, comments: 89, text: "Locking this in before the line moves." }
];

const MOCK_STORIES = [
  { id: 's1', username: 'elena_valuebet', name: 'Elena D.', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=200&q=80', avatar: 'E' },
  { id: 's2', username: 'quant_edge', name: 'Quant Edge', image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=200&q=80', avatar: 'Q' },
  { id: 's3', username: 'algo_vance', name: 'Alex V.', image: 'https://images.unsplash.com/photo-1543351611-58f694240181?auto=format&fit=crop&w=200&q=80', avatar: 'A' },
  { id: 's4', username: 'sofia_picks', name: 'Sofia P.', image: 'https://images.unsplash.com/photo-1505666287802-931dc83948e9?auto=format&fit=crop&w=200&q=80', avatar: 'S' }
];

export default function Social({ session, profile }) {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState([]);
  const [analysts, setAnalysts] = useState({});
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Interaction states
  const [likedPosts, setLikedPosts] = useState(new Set());

  // Compose Post State
  const [postText, setPostText] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [userBets, setUserBets] = useState([]);
  const [showBetSelector, setShowBetSelector] = useState(false);
  const [selectedBetToAttach, setSelectedBetToAttach] = useState(null);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');

  // Checkout modal states
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutAnalyst, setCheckoutAnalyst] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ card: '', expiry: '', cvv: '', name: '' });

  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined;

  const loadSubscriptions = async (analystProfiles) => {
    let subsList = [];
    const savedSubs = sessionStorage.getItem('quant_subscriptions');
    if (savedSubs) {
      subsList = JSON.parse(savedSubs);
    }

    if (!isMock && session) {
      try {
        const { data: dbSubs } = await supabase
          .from('subscriptions')
          .select('subscribed_to_id')
          .eq('subscriber_id', session.user.id);
          
        if (dbSubs && analystProfiles) {
          const dbSubnames = Object.values(analystProfiles)
            .filter(a => dbSubs.some(s => s.subscribed_to_id === a.id))
            .map(a => a.username);
          subsList = [...new Set([...subsList, ...dbSubnames])];
        }
      } catch (e) {
        console.error("Failed to load DB subscriptions", e);
      }
    }
    setSubscriptions(subsList);
  };

  const fetchUserBets = async () => {
    if (isMock) {
      const mockBetsRaw = sessionStorage.getItem('mock_bets');
      if (mockBetsRaw) {
        setUserBets(JSON.parse(mockBetsRaw).filter(b => b.status === 'Pending'));
      }
      return;
    }
    if (!session) return;
    try {
      const { data } = await supabase.from('bets').select('*').eq('user_id', session.user.id).eq('status', 'Pending').order('created_at', { ascending: false });
      if (data) setUserBets(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await fetchUserBets();

    if (isMock) {
      const savedPostsRaw = sessionStorage.getItem('mock_social_posts');
      let currentPosts = MOCK_ACTIVE_PREDICTIONS;
      if (savedPostsRaw) {
        currentPosts = [...JSON.parse(savedPostsRaw), ...MOCK_ACTIVE_PREDICTIONS];
      }
      setPredictions(currentPosts);
      setAnalysts(MOCK_ANALYSTS);
      await loadSubscriptions(MOCK_ANALYSTS);
    } else {
      try {
        const { data: profs } = await supabase
          .from('profiles')
          .select('*')
          .eq('profile_mode', 'analyst');
          
        const analystMap = {};
        if (profs) {
          profs.forEach(p => {
            analystMap[p.username] = {
              id: p.id,
              username: p.username,
              name: p.username,
              winRate: 60.0,
              roi: 10.0,
              region: p.region || 'Europe',
              verified: true
            };
          });
        }
        setAnalysts(analystMap);
        await loadSubscriptions(analystMap);

        if (profs && profs.length > 0) {
          const ids = profs.map(p => p.id);
          const { data: bets } = await supabase
            .from('bets')
            .select('*')
            .in('user_id', ids)
            .eq('is_public', true)
            .order('created_at', { ascending: false });
            
          if (bets) {
            const mappedBets = bets.map(b => {
              const matchedProf = profs.find(p => p.id === b.user_id);
              return {
                id: b.id,
                analyst_username: matchedProf ? matchedProf.username : 'unknown',
                created_at: b.created_at,
                sport: b.sport,
                bookmaker: b.bookmaker,
                type: b.type,
                teams: b.teams,
                stake: b.stake,
                odds: b.odds,
                status: b.status,
                likes: Math.floor(Math.random() * 200) + 10,
                comments: Math.floor(Math.random() * 50),
                text: b.analysis || ''
              };
            });
            setPredictions(mappedBets);
          }
        }
      } catch (e) {
        console.error("DB fetch failed, loading mock", e);
        setPredictions(MOCK_ACTIVE_PREDICTIONS);
        setAnalysts(MOCK_ANALYSTS);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    document.title = "Social Feed | QuantStakes";
    fetchData();
  }, [session, isMock]);

  const handlePost = async () => {
    if (!postText.trim() && !selectedBetToAttach) return;
    
    const newPost = {
      id: 'post_' + Date.now(),
      analyst_username: profile?.username || session?.user?.email?.split('@')[0] || 'guest',
      created_at: new Date().toISOString(),
      text: postText,
      likes: 0,
      comments: 0,
      // If attached bet:
      ...(selectedBetToAttach || { sport: 'Discussion', type: 'Text', status: 'N/A' })
    };

    if (isMock) {
      const savedPostsRaw = sessionStorage.getItem('mock_social_posts') || '[]';
      const savedPosts = JSON.parse(savedPostsRaw);
      savedPosts.unshift(newPost);
      sessionStorage.setItem('mock_social_posts', JSON.stringify(savedPosts));
      setPredictions([newPost, ...predictions]);
      setPostText('');
      setSelectedBetToAttach(null);
      setShowBetSelector(false);
      setIsComposing(false);
      return;
    }

    if (!session) return;

    try {
      if (selectedBetToAttach) {
         await supabase.from('bets').update({ is_public: true, analysis: postText }).eq('id', selectedBetToAttach.id);
      } else {
         await supabase.from('bets').insert([{
           user_id: session.user.id,
           sport: 'Discussion',
           type: 'Text',
           teams: 'General',
           stake: 0,
           odds: 1,
           is_public: true,
           analysis: postText,
           status: 'Settled'
         }]);
      }
      await fetchData();
      setPostText('');
      setSelectedBetToAttach(null);
      setShowBetSelector(false);
      setIsComposing(false);
    } catch (e) {
      alert("Failed to post: " + e.message);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!checkoutAnalyst) return;
    setCheckoutLoading(true);

    if (isMock) {
      setTimeout(() => {
        const savedSubs = sessionStorage.getItem('quant_subscriptions') || '[]';
        const subs = JSON.parse(savedSubs);
        if (!subs.includes(checkoutAnalyst.username)) {
          subs.push(checkoutAnalyst.username);
          sessionStorage.setItem('quant_subscriptions', JSON.stringify(subs));
        }
        setSubscriptions(subs);
        setShowCheckout(false);
        setCheckoutLoading(false);
      }, 1500);
      return;
    }

    if (!session) return;

    try {
      const { error } = await supabase.from('subscriptions').insert([
        {
          subscriber_id: session.user.id,
          subscribed_to_id: checkoutAnalyst.id
        }
      ]);
      if (error) throw error;

      const savedSubs = sessionStorage.getItem('quant_subscriptions') || '[]';
      const subs = JSON.parse(savedSubs);
      if (!subs.includes(checkoutAnalyst.username)) {
        subs.push(checkoutAnalyst.username);
        sessionStorage.setItem('quant_subscriptions', JSON.stringify(subs));
      }
      setSubscriptions(subs);
      setShowCheckout(false);
    } catch (err) {
      alert("Checkout failed: " + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const toggleLike = (id) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const sportsList = ['All', 'Football', 'Basketball', 'Tennis', 'MMA', 'Esports', 'Discussion'];
  
  const filteredPredictions = predictions.filter(pred => {
    const matchesSearch = pred.analyst_username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'All' || pred.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  return (
    <div className="flex-col gap-4 w-full mx-auto" style={{ animation: 'fade-in 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)', maxWidth: '680px' }}>
      


      {/* Compose Post Box (Facebook Style) */}
      <div className="glass-card" style={{ padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex gap-3 items-center mb-3">
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
            {profile?.username?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'G'}
          </div>
          <div 
            style={{ flexGrow: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '0.6rem 1rem', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'background 0.2s' }}
            onClick={() => setIsComposing(true)}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            What's on your mind, {profile?.username || session?.user?.email?.split('@')[0] || 'Guest'}?
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }} className="flex justify-between px-2">
          <button className="flex items-center gap-2 text-secondary hover-highlight" style={{ padding: '0.5rem', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', flexGrow: 1, justifyContent: 'center' }}>
            <Video size={20} color="#f02849" /> <span style={{fontWeight: '600', fontSize: '0.9rem'}}>Live Video</span>
          </button>
          <button className="flex items-center gap-2 text-secondary hover-highlight" style={{ padding: '0.5rem', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', flexGrow: 1, justifyContent: 'center' }}>
            <ImageIcon size={20} color="#45bd62" /> <span style={{fontWeight: '600', fontSize: '0.9rem'}}>Photo/video</span>
          </button>
          <button onClick={() => {setIsComposing(true); setShowBetSelector(true);}} className="flex items-center gap-2 text-secondary hover-highlight" style={{ padding: '0.5rem', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer', flexGrow: 1, justifyContent: 'center' }}>
            <Laugh size={20} color="#f7b928" /> <span style={{fontWeight: '600', fontSize: '0.9rem'}}>Attach Bet</span>
          </button>
        </div>
      </div>

      {/* Compose Post Modal */}
      {isComposing && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
           <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', borderRadius: '12px', padding: 0, border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', background: '#1c1e21' }}>
             {/* Modal Header */}
             <div className="flex justify-between items-center p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ width: '36px' }}></div>
               <h3 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: '#e4e6eb' }}>Create post</h3>
               <button onClick={() => {setIsComposing(false); setPostText(''); setSelectedBetToAttach(null); setShowBetSelector(false);}} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#b0b3b8', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} className="hover-highlight"><X size={20} /></button>
             </div>
             
             <div className="p-4">
               <div className="flex gap-3 items-center mb-4">
                 <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#000' }}>
                   {profile?.username?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'G'}
                 </div>
                 <div style={{ fontWeight: 'bold', color: '#e4e6eb' }}>
                   {profile?.username || session?.user?.email?.split('@')[0] || 'Guest User'}
                 </div>
               </div>
               
               <textarea 
                 autoFocus
                 placeholder={`What's on your mind, ${profile?.username || session?.user?.email?.split('@')[0] || 'Guest'}?`}
                 value={postText}
                 onChange={(e) => setPostText(e.target.value)}
                 style={{ width: '100%', background: 'transparent', border: 'none', color: '#e4e6eb', fontSize: '1.2rem', resize: 'none', minHeight: '120px', outline: 'none', fontFamily: 'inherit' }}
               />

               {/* Bet Attachment Preview in Modal */}
               {selectedBetToAttach && (
                 <div className="mt-2 p-3 rounded-lg" style={{ border: '1px solid rgba(255,255,255,0.1)', position: 'relative', background: 'rgba(255,255,255,0.02)' }}>
                   <button onClick={() => setSelectedBetToAttach(null)} style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#b0b3b8', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} className="hover-highlight"><X size={16}/></button>
                   <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 'bold', textTransform: 'uppercase' }}>Attached Bet Slip</div>
                   <div style={{ fontWeight: 'bold', marginTop: '0.2rem', color: '#e4e6eb', fontSize: '1.1rem' }}>{selectedBetToAttach.teams}</div>
                   <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{selectedBetToAttach.sport} • {selectedBetToAttach.bookmaker}</div>
                 </div>
               )}
               
               <div className="flex justify-between items-center p-3 mt-4" style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                 <span style={{ fontWeight: '600', color: '#e4e6eb' }}>Add to your post</span>
                 <div className="flex gap-2 relative">
                   <button onClick={() => setShowBetSelector(!showBetSelector)} className="hover-highlight" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} title="Attach Bet">
                     <Paperclip size={24} color="#f7b928" />
                   </button>
                   
                   {/* Bet Selector Dropdown inside modal */}
                   {showBetSelector && (
                     <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem', background: '#242526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem', width: '280px', maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', zIndex: 100 }}>
                       {userBets.length === 0 ? <div className="text-secondary text-center p-3 text-sm">No pending bets found in ledger</div> : 
                         userBets.map(b => (
                           <div key={b.id} onClick={() => {setSelectedBetToAttach(b); setShowBetSelector(false);}} className="p-2 hover-highlight cursor-pointer rounded" style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                             <div className="font-bold text-sm text-white">{b.teams}</div>
                             <div className="text-xs text-secondary mt-1">{b.sport} • €{b.stake}</div>
                           </div>
                         ))
                       }
                     </div>
                   )}
                 </div>
               </div>
               
               <button 
                 onClick={handlePost}
                 disabled={!postText.trim() && !selectedBetToAttach}
                 className="btn btn-primary"
                 style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', background: (!postText.trim() && !selectedBetToAttach) ? 'rgba(255,255,255,0.1)' : 'var(--accent-cyan)', color: (!postText.trim() && !selectedBetToAttach) ? '#666' : '#000', cursor: (!postText.trim() && !selectedBetToAttach) ? 'not-allowed' : 'pointer', border: 'none' }}
               >
                 Post
               </button>
             </div>
           </div>
        </div>
      )}

      {/* Feed List */}
      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading feed...</div>
      ) : (
        <div className="flex-col gap-4">
          {filteredPredictions.map(pred => {
            const isSelf = pred.analyst_username === (profile?.username || session?.user?.email?.split('@')[0] || 'guest');
            const analyst = isSelf ? { username: pred.analyst_username, name: profile?.username || session?.user?.email?.split('@')[0] || 'You', region: profile?.region || 'Unknown', verified: true } : (analysts[pred.analyst_username] || { username: pred.analyst_username, region: 'Unknown', verified: false, name: pred.analyst_username });
            const isSubbed = isSelf || subscriptions.includes(pred.analyst_username);
            const isLiked = likedPosts.has(pred.id);
            const isDiscussion = pred.sport === 'Discussion' || !pred.teams;
            
            return (
              <div key={pred.id} className="glass-card flex-col" style={{ borderRadius: '12px', padding: '1rem', border: '1px solid rgba(255,255,255,0.08)', background: '#242526' }}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-2 items-center">
                    <div 
                      onClick={() => !isSelf && navigate(`/trader/${pred.analyst_username}`)}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: isSelf ? 'default' : 'pointer', flexShrink: 0, color: '#000' }}
                    >
                      {pred.analyst_username[0].toUpperCase()}
                    </div>
                    <div className="flex-col">
                      <div className="flex items-center gap-1">
                        <span 
                          style={{ fontWeight: 'bold', cursor: isSelf ? 'default' : 'pointer', color: '#e4e6eb' }} 
                          className={isSelf ? '' : 'hover-highlight'}
                          onClick={() => !isSelf && navigate(`/trader/${pred.analyst_username}`)}
                        >
                          {analyst.name}
                        </span>
                        {analyst.verified && <ShieldCheck size={14} color="var(--accent-cyan)" />}
                      </div>
                      <div className="flex items-center gap-1 text-secondary" style={{ fontSize: '0.75rem', color: '#b0b3b8' }}>
                        <span>{Math.floor((Date.now() - new Date(pred.created_at).getTime()) / 3600000)}h</span>
                        <span>·</span>
                        <Lock size={12} />
                      </div>
                    </div>
                  </div>
                  <button style={{ background: 'none', border: 'none', color: '#b0b3b8', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }} className="hover-highlight">
                    <MoreHorizontal size={20} />
                  </button>
                </div>

                {/* Body */}
                {pred.text && (
                  <p style={{ fontSize: '1rem', lineHeight: '1.5', marginBottom: '0.5rem', whiteSpace: 'pre-wrap', color: '#e4e6eb' }}>
                    {pred.text}
                  </p>
                )}

                {/* Embedded Bet / Link Preview style */}
                {!isDiscussion && (
                  <div style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden', marginTop: '0.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem' }}>
                      {isSubbed ? (
                         <div className="flex-col gap-2">
                           <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-cyan)', textTransform: 'uppercase' }}>{pred.sport} • {pred.type}</span>
                           <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e4e6eb' }}>{pred.teams}</h4>
                           <div className="flex gap-4 mt-2" style={{ fontFamily: 'monospace', fontSize: '1rem', color: '#e4e6eb' }}>
                             <span><span style={{color: '#b0b3b8'}}>Odds:</span> {Number(pred.odds).toFixed(2)}</span>
                             <span><span style={{color: '#b0b3b8'}}>Stake:</span> €{pred.stake}</span>
                             <span><span style={{color: '#b0b3b8'}}>Bookie:</span> {pred.bookmaker}</span>
                           </div>
                         </div>
                      ) : (
                         <div className="flex-col gap-2 relative">
                           <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#b0b3b8', textTransform: 'uppercase' }}>{pred.sport} • Matchup Hidden</span>
                           <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', filter: 'blur(8px)', opacity: 0.5, color: '#e4e6eb' }}>Team A vs Team B</h4>
                           <div className="flex gap-4 mt-2" style={{ fontFamily: 'monospace', fontSize: '1rem', filter: 'blur(5px)', opacity: 0.5, color: '#e4e6eb' }}>
                             <span><span style={{color: '#b0b3b8'}}>Odds:</span> {Number(pred.odds).toFixed(2)}</span>
                             <span><span style={{color: '#b0b3b8'}}>Stake:</span> €000</span>
                           </div>
                           
                           {/* Lock Overlay */}
                           <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                             <div style={{ background: 'rgba(0, 243, 255, 0.1)', padding: '0.5rem', borderRadius: '50%', marginBottom: '0.5rem' }}>
                               <Lock size={20} color="var(--accent-cyan)" />
                             </div>
                             <span style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#e4e6eb' }}>Subscriber Exclusive</span>
                             <button onClick={() => { setCheckoutAnalyst(analyst); setShowCheckout(true); }} className="btn btn-primary" style={{ padding: '0.4rem 1.25rem', borderRadius: '20px', fontSize: '0.85rem', marginTop: '0.75rem', fontWeight: 'bold' }}>Unlock Details</button>
                           </div>
                         </div>
                      )}
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', fontSize: '0.8rem', color: '#b0b3b8', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      Verified Bet Slip • QuantStakes Ledger
                    </div>
                  </div>
                )}

                {/* Like/Comment Counts */}
                <div className="flex justify-between items-center text-secondary mt-3 mb-2 px-1" style={{ fontSize: '0.9rem', color: '#b0b3b8' }}>
                  <div className="flex items-center gap-1.5">
                    <div style={{ background: 'var(--accent-cyan)', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={10} color="#000" fill="#000" /></div>
                    <span>{pred.likes + (isLiked ? 1 : 0)}</span>
                  </div>
                  <div>
                    <span className="hover-highlight" style={{cursor: 'pointer'}}>{pred.comments} comments</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between gap-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.25rem' }}>
                  <button 
                    onClick={() => toggleLike(pred.id)}
                    className="flex items-center justify-center gap-2 text-secondary" 
                    style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', color: isLiked ? 'var(--accent-cyan)' : '#b0b3b8', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Heart size={20} fill={isLiked ? 'var(--accent-cyan)' : 'none'} />
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Like</span>
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 text-secondary" 
                    style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', color: '#b0b3b8', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <MessageSquare size={20} />
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Comment</span>
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 text-secondary" 
                    style={{ flex: 1, padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '4px', color: '#b0b3b8', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Share2 size={20} />
                    <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Share</span>
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredPredictions.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No posts match your search.
            </div>
          )}
        </div>
      )}

      {/* Subscription Checkout Modal */}
      {showCheckout && checkoutAnalyst && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', position: 'relative', animation: 'fade-in 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)', padding: '2.5rem' }}>
            <button 
              onClick={() => setShowCheckout(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}
              className="hover-highlight"
            >
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div style={{ background: 'rgba(0, 243, 255, 0.1)', padding: '0.75rem', borderRadius: '12px' }}>
                <CreditCard size={24} color="var(--accent-cyan)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>Subscribe to {checkoutAnalyst.name}</h3>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>@{checkoutAnalyst.username}</span>
              </div>
            </div>
            
            <p className="text-secondary mb-6" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
              Become a verified follower to instantly unlock all of their ongoing public wagers, bookmaker details, and exact stakes.
            </p>

            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div className="flex justify-between items-center">
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>Monthly Subscription</span>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)', fontSize: '1.1rem' }}>€50.00</span>
              </div>
            </div>

            <form onSubmit={handleSubscribe} className="flex-col gap-4">
              <button 
                type="submit" 
                disabled={checkoutLoading} 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  marginTop: '1rem', 
                  padding: '1rem',
                  fontSize: '1rem',
                  borderRadius: '12px'
                }}
              >
                {checkoutLoading ? 'Authorizing...' : 'Confirm Subscription'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
