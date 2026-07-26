import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';
import { footballTeams } from '../lib/teams';

export default function TeamSelector({ value, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const filteredTeams = footballTeams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedTeam = footballTeams.find(t => t.name === value);

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="input-field flex items-center gap-3" 
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', minHeight: '50px', background: 'transparent', display: 'flex', alignItems: 'center' }}
      >
        {selectedTeam ? (
          <>
            <img src={selectedTeam.logo} alt={selectedTeam.name} style={{ width: '24px', height: '64px', objectFit: 'contain' }} />
            <span style={{ color: 'var(--text-primary)' }}>{selectedTeam.name}</span>
          </>
        ) : (
          <span style={{ color: value ? 'white' : 'var(--text-secondary)' }}>
            {value || placeholder}
          </span>
        )}
      </div>

      {isOpen && (
        <div 
          className="glass-panel team-dropdown" 
          style={{ 
            position: 'absolute', 
            top: 'calc(100% + 8px)', 
            left: 0, 
            width: '100%',
            minWidth: '280px',
            zIndex: 999,
            maxHeight: '350px',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            background: 'rgba(15, 10, 25, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--accent-cyan)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            borderRadius: '12px'
          }}
        >
          <div className="flex items-center gap-3 mb-3" style={{ background: 'var(--adaptive-white-05)', padding: '0.8rem 1rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <Search size={18} className="text-secondary" />
            <input 
              type="text" 
              placeholder="Search or add team..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '0.95rem' }}
              autoFocus
            />
          </div>

          <div className="flex-col gap-1" style={{ overflowY: 'auto', paddingRight: '0.5rem', scrollbarWidth: 'thin', flex: 1 }}>
            {searchTerm.trim() !== '' && !filteredTeams.find(t => t.name.toLowerCase() === searchTerm.toLowerCase()) && (
              <div 
                className="flex items-center gap-3"
                style={{ 
                  padding: '0.8rem 1rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  background: 'var(--adaptive-white-02)',
                  transition: 'all 0.2s ease',
                  border: '1px dashed var(--border-glass)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)'; e.currentTarget.style.borderColor = 'var(--success)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--adaptive-white-02)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
                onClick={() => {
                  onChange(searchTerm.trim());
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--adaptive-white-10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--success)' }}>+</div>
                <span style={{ fontStyle: 'italic', color: 'var(--success)', fontWeight: 'bold', fontSize: '0.95rem' }}>Add "{searchTerm.trim()}"</span>
              </div>
            )}
            
            {filteredTeams.length > 0 ? filteredTeams.map(team => (
              <div 
                key={team.name}
                className="flex items-center gap-3"
                style={{ 
                  padding: '0.6rem 1rem', 
                  borderRadius: '6px', 
                  cursor: 'pointer',
                  background: 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)'; e.currentTarget.style.color = 'var(--accent-cyan)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'white'; }}
                onClick={() => {
                  onChange(team.name);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
              >
                <img src={team.logo} alt={team.name} style={{ width: '24px', height: '64px', objectFit: 'contain' }} />
                <span style={{ fontSize: '0.95rem' }}>{team.name}</span>
              </div>
            )) : searchTerm.trim() === '' ? (
              <div className="text-secondary text-center" style={{ padding: '2rem 1rem', fontSize: '0.9rem' }}>Type to search teams...</div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
