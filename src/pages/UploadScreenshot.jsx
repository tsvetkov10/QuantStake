export default function UploadScreenshot({ session }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const validateAndSelectFile = (selectedFile) => {
    if (!selectedFile) return false;
    setError(null);

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif'];
    const fileNameLower = selectedFile.name.toLowerCase();
    const validExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.heic', '.heif'];
    const hasValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));
    const isValidType = validTypes.includes(selectedFile.type) || hasValidExt;

    if (!isValidType) {
      setError(`Invalid file format "${selectedFile.name}". Please upload a supported image file (PNG, JPG, JPEG, WEBP, HEIC).`);
      setFile(null);
      return false;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError(`File "${selectedFile.name}" is too large (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 10MB.`);
      setFile(null);
      return false;
    }

    setFile(selectedFile);
    return true;
  };

  // Global window drag counter to detect macOS Finder file dragging anywhere on page
  useEffect(() => {
    let dragCounter = 0;

    const handleWindowDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleWindowDragOver = (e) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
      setIsDragging(true);
    };

    const handleWindowDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        dragCounter = 0;
        setIsDragging(false);
      }
    };

    const handleWindowDrop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFile = e.dataTransfer.files[0];
        validateAndSelectFile(droppedFile);
      }
    };

    window.addEventListener('dragenter', handleWindowDragEnter);
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragleave', handleWindowDragLeave);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragenter', handleWindowDragEnter);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragleave', handleWindowDragLeave);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

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
         type: result.type || 'Single',
         teams: result.teams || 'Unknown',
         stake: parseFloat(result.stake) || 0,
         odds: parseFloat(result.odds) || 1.0,
         cashout_amount: parseFloat(result.payout) || 0,
         created_at: result.date ? new Date(result.date).toISOString() : new Date().toISOString(),
         status: result.status || 'Won'
      }]);
      if (error) throw error;
      alert("Bet Slip Saved successfully!");
      setResult(null); setFile(null);
      navigate('/history');
    } catch(err) {
      alert("Error saving: " + err.message);
    }
  };

  return (
    <div className="flex-col gap-8 items-center" style={{ position: 'relative' }}>
      <div style={{ textAlign: 'center' }}>
        <h2 className="text-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>AI Slip Scanning</h2>
        <p className="text-secondary">Upload or drop a screenshot of any bet slip (in any language) to automatically extract stake, odds, date, payout & teams.</p>
      </div>

      <div 
        className="glass-panel flex-col items-center justify-center gap-6" 
        style={{ 
          position: 'relative',
          width: '100%', 
          maxWidth: '640px', 
          padding: isDragging ? '4.5rem 2rem' : '3.5rem 2rem', 
          borderStyle: 'dashed', 
          borderWidth: isDragging ? '3px' : '2px', 
          borderColor: error ? 'var(--danger)' : isDragging ? '#38bdf8' : 'var(--border-glass)',
          background: isDragging ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)' : 'var(--bg-glass)',
          transform: isDragging ? 'scale(1.03)' : 'scale(1)',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isDragging ? '0 0 50px rgba(6, 182, 212, 0.4)' : 'none',
          overflow: 'hidden'
        }}
      >
        
        {error && (
           <div style={{ padding: '1rem', background: 'rgba(255, 51, 102, 0.15)', color: 'var(--danger)', border: '1px solid rgba(255, 51, 102, 0.3)', borderRadius: '12px', width: '100%', textAlign: 'center', fontWeight: '500', zIndex: 10 }}>
             {error}
           </div>
        )}

        {!result && !analyzing && (
          <>
            {/* Full Overlay Input for direct file selection & drop target */}
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/jpg, image/webp, image/heic, image/heif" 
              id="file-upload" 
              style={{ 
                position: 'absolute', 
                inset: 0, 
                width: '100%', 
                height: '100%', 
                opacity: 0, 
                cursor: 'pointer', 
                zIndex: 20 
              }} 
              onChange={handleFileChange}
            />

            <div 
              style={{ 
                background: isDragging ? 'rgba(56, 189, 248, 0.35)' : 'rgba(0, 243, 255, 0.1)', 
                padding: isDragging ? '2rem' : '1.5rem', 
                borderRadius: '50%', 
                transition: 'all 0.25s ease', 
                pointerEvents: 'none',
                boxShadow: isDragging ? '0 0 30px rgba(56, 189, 248, 0.6)' : 'none',
                transform: isDragging ? 'scale(1.15)' : 'scale(1)'
              }}
            >
              <Upload size={isDragging ? 64 : 52} color={isDragging ? '#ffffff' : 'var(--accent-cyan)'} />
            </div>
            
            <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
              <h3 style={{ fontSize: isDragging ? '1.6rem' : '1.4rem', fontWeight: 'bold', marginBottom: '0.4rem', color: isDragging ? '#38bdf8' : '#ffffff', transition: 'all 0.2s ease' }}>
                {isDragging ? 'RELEASE MOUSE TO DROP BET SLIP!' : 'Drag & Drop your bet slip screenshot here'}
              </h3>
              <p style={{ color: isDragging ? '#ffffff' : 'var(--text-secondary)', fontSize: '0.95rem', fontWeight: isDragging ? 'bold' : 'normal' }}>
                {isDragging ? 'AI will scan and extract all details automatically' : 'or click anywhere inside this box to browse files'}
              </p>
            </div>

            <div style={{ textAlign: 'center', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--adaptive-white-08)', borderRadius: '8px', padding: '0.6rem 1.2rem', pointerEvents: 'none' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                Supported Formats: <strong style={{ color: '#ffffff' }}>PNG, JPG, JPEG, WEBP, HEIC</strong> (Max 10MB)
              </p>
            </div>
            
            <div className="btn btn-secondary" style={{ pointerEvents: 'none', zIndex: 10 }}>
              {file ? `Selected: ${file.name}` : 'Choose File'}
            </div>

            {file && (
               <button 
                 className="btn btn-primary" 
                 onClick={handleUpload} 
                 style={{ width: '100%', maxWidth: '280px', zIndex: 30, position: 'relative' }}
               >
                 Analyze Bet Slip
               </button>
            )}
          </>
        )}

        {analyzing && (
          <div className="flex-col items-center gap-4">
             <BrainCircuit size={48} color="var(--accent-magenta)" className="animate-pulse" style={{ animation: 'pulse 1.5s infinite' }} />
             <h3 className="text-gradient">AI is scanning your bet slip...</h3>
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
                  <p className="label">Sport / Event</p>
                  <p style={{ fontWeight: 'bold' }}>{result.sport || 'Tennis'}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{result.teams}</p>
                </div>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Betted Amount (Stake)</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#06b6d4' }}>{result.stake ? `${result.stake} €` : 'N/A'}</p>
                </div>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Multiplier (Odds)</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{result.odds ? `${result.odds}` : 'N/A'}</p>
                </div>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Total Amount Won (Payout)</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#10b981' }}>{result.payout ? `${result.payout} €` : 'N/A'}</p>
                </div>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Date</p>
                  <p style={{ fontWeight: 'bold' }}>{result.date || 'Today'}</p>
                </div>
                <div className="glass-card" style={{ padding: '1rem' }}>
                  <p className="label">Status</p>
                  <p style={{ fontWeight: 'bold', color: result.status === 'Won' ? '#10b981' : '#ef4444' }}>{result.status || 'Won'}</p>
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
