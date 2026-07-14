import React, { useState } from 'react';
import { Upload, CheckCircle, BrainCircuit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function UploadScreenshot({ session }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setAnalyzing(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:3001/api/parse-slip', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse image');
      }

      setResult({
        ...data,
        stake: Number(data.stake) || 0,
        odds: Number(data.odds) || 1.0
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (import.meta.env.VITE_SUPABASE_URL === undefined) {
      alert("Mock Mode: Saved successfully!");
      setResult(null); setFile(null);
      navigate('/history');
      return;
    }

    try {
      const { error } = await supabase.from('bets').insert([{
         user_id: session.user.id,
         sport: result.sport || 'Unknown',
         type: result.type || 'Unknown',
         teams: result.teams || 'Unknown',
         stake: parseFloat(result.stake),
         odds: parseFloat(result.odds),
         status: 'Pending'
      }]);
      if (error) throw error;
      alert("Saved successfully!");
      setResult(null); setFile(null);
      navigate('/history');
    } catch(err) {
      alert("Error saving: " + err.message);
    }
  };

  return (
    <div className="flex-col gap-8 items-center">
      <div style={{ textAlign: 'center' }}>
        <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Slip Parsing</h2>
        <p className="text-secondary">Upload a screenshot of your bet slip and let our Vision API extract the details.</p>
      </div>

      <div className="glass-panel flex-col items-center justify-center gap-6" style={{ width: '100%', maxWidth: '600px', padding: '3rem 2rem', borderStyle: 'dashed', borderWidth: '2px', borderColor: error ? 'var(--danger)' : 'var(--border-glass)' }}>
        
        {error && (
           <div style={{ padding: '1rem', background: 'rgba(255, 51, 102, 0.1)', color: 'var(--danger)', borderRadius: '8px', width: '100%', textAlign: 'center' }}>
             Error: {error}
           </div>
        )}

        {!result && !analyzing && (
          <>
            <div style={{ background: 'rgba(0, 243, 255, 0.1)', padding: '1.5rem', borderRadius: '50%' }}>
              <Upload size={48} color="var(--accent-cyan)" />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Drag & drop your screenshot here</h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Supports JPG, PNG up to 5MB</p>
            
            <input 
              type="file" 
              accept="image/*" 
              id="file-upload" 
              style={{ display: 'none' }} 
              onChange={(e) => setFile(e.target.files[0])} 
            />
            <label htmlFor="file-upload" className="btn btn-secondary">
              {file ? file.name : 'Select File'}
            </label>

            {file && (
               <button className="btn btn-primary" onClick={handleUpload}>
                 Analyze Bet Slip
               </button>
            )}
          </>
        )}

        {analyzing && (
          <div className="flex-col items-center gap-4">
             <BrainCircuit size={48} color="var(--accent-magenta)" className="animate-pulse" style={{ animation: 'pulse 1.5s infinite' }} />
             <h3 className="text-gradient">AI is analyzing your slip...</h3>
             <style>{`
               @keyframes pulse {
                 0% { transform: scale(1); opacity: 1; }
                 50% { transform: scale(1.1); opacity: 0.7; }
                 100% { transform: scale(1); opacity: 1; }
               }
             `}</style>
          </div>
        )}

        {result && (
          <div className="flex-col items-center gap-6" style={{ width: '100%' }}>
             <CheckCircle size={48} className="text-success" />
             <h3 style={{ fontSize: '1.5rem' }}>Bet Extracted Successfully</h3>
             
             <div className="grid grid-cols-2 gap-4" style={{ width: '100%' }}>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Sport</p>
                  <p>{result.sport}</p>
                </div>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Teams</p>
                  <p>{result.teams}</p>
                </div>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Stake</p>
                  <p>${result.stake}</p>
                </div>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Odds</p>
                  <p>{result.odds}</p>
                </div>
             </div>

             <div className="flex gap-4 mt-4">
               <button className="btn btn-secondary" onClick={() => { setResult(null); setFile(null); }}>
                 Discard
               </button>
               <button className="btn btn-primary" onClick={handleSave}>
                 Confirm & Save
               </button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}
