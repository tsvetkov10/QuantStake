import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Rocket, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import { countries } from '../lib/countries';

export default function Onboarding({ session, onComplete }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    region: 'North America',
    nationality: 'Bulgaria',
    age: '',
    currency: 'USD'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      sessionStorage.setItem('mock_profile', JSON.stringify(formData));
      onComplete();
      navigate('/dashboard');
      return;
    }

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        username: formData.username,
        region: formData.region,
        nationality: formData.nationality,
        age: parseInt(formData.age, 10),
        currency: formData.currency
      });

      if (error) throw error;
      onComplete();
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save profile. Ensure the database table exists.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '100vh', width: '100%' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '3rem' }}>
        <div className="flex-col items-center justify-center mb-8">
          <div style={{ background: 'rgba(72, 51, 181, 0.1)', padding: '1.5rem', borderRadius: '50%', marginBottom: '1rem', boxShadow: 'var(--glow-cyan)' }}>
            <Rocket size={40} color="var(--accent-cyan)" />
          </div>
          <h2 className="text-gradient" style={{ fontSize: '2.5rem', textAlign: 'center' }}>Welcome Aboard</h2>
          <p className="text-secondary" style={{ textAlign: 'center', marginTop: '0.5rem' }}>Let's set up your betting profile.</p>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 mb-6" style={{ padding: '1rem', background: 'rgba(255, 51, 102, 0.1)', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: '8px', boxShadow: '0 0 10px rgba(255, 51, 102, 0.2)' }}>
            <AlertCircle size={20} />
            <p style={{ fontSize: '0.9rem' }}>{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col gap-6">
          <div>
            <label className="label flex items-center gap-2"><User size={16} /> Username</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="e.g. sharpbettor99" 
              required 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2"><MapPin size={16} /> Region</label>
              <select className="input-field" value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})}>
                <option>North America</option>
                <option>Europe</option>
                <option>Asia</option>
                <option>Oceania</option>
                <option>South America</option>
              </select>
            </div>
            
            <div>
              <label className="label flex items-center gap-2"><MapPin size={16} /> Nationality</label>
              <select className="input-field" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})}>
                {countries.map(c => (
                  <option key={c.code} value={c.name}>{c.flag} {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label flex items-center gap-2"><Calendar size={16} /> Age (18+)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="e.g. 21" 
                required 
                min="18"
                max="120"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>

            <div>
              <label className="label flex items-center gap-2"><DollarSign size={16} /> Currency</label>
              <select className="input-field" value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
          
          <p className="text-secondary" style={{ fontSize: '0.85rem', textAlign: 'center' }}>
            Note: Your base currency cannot be changed after your profile is created.
          </p>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '0.5rem', padding: '1rem' }}>
            {loading ? 'Saving Profile...' : 'Initialize Terminal'}
          </button>
        </form>
      </div>
    </div>
  );
}
