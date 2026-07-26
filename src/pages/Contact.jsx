import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Send, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="flex-col" style={{ minHeight: '100vh', width: '100%', padding: '4rem 2rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <Link to="/" className="flex items-center gap-2 text-secondary mb-8" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <Sparkles size={24} className="text-success" />
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Contact Support</h1>
        </div>

        <div className="grid grid-cols-2 gap-8" style={{ alignItems: 'flex-start' }}>
          
          <div className="flex-col gap-6">
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Enterprise Inquiries</h3>
              <p className="text-secondary" style={{ marginBottom: '1rem' }}>Interested in API access or white-label solutions for your syndicate?</p>
              <div className="flex items-center gap-2 text-gradient">
                <Mail size={16} /> enterprise@quantstakes.com
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Headquarters</h3>
              <p className="text-secondary" style={{ marginBottom: '1rem' }}>QuantStakes Technologies LLC</p>
              <div className="flex items-center gap-2 text-secondary">
                <MapPin size={16} /> 100 Cyber Avenue, Silicon Valley, CA 94025
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ background: 'rgba(10, 10, 16, 0.85)', border: '1px solid rgba(226, 232, 240, 0.15)', borderRadius: '24px', padding: '2.5rem', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)' }}>
            {sent ? (
              <div className="flex-col items-center justify-center text-center" style={{ padding: '2rem' }}>
                <Send size={48} className="text-success mb-4" />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Message Received</h3>
                <p className="text-secondary">Our support team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex-col gap-6">
                <div>
                  <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Name</label>
                  <input type="text" className="input-field" placeholder="John Doe" required style={{ background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }} />
                </div>
                <div>
                  <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Email</label>
                  <input type="email" className="input-field" placeholder="john@example.com" required style={{ background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }} />
                </div>
                <div>
                  <label className="label" style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: '700', marginBottom: '0.5rem', display: 'block' }}>Message</label>
                  <textarea className="input-field" placeholder="How can we help you?" required rows="5" style={{ resize: 'vertical', background: 'rgba(5, 5, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', padding: '0.9rem 1.2rem', borderRadius: '12px' }}></textarea>
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '1rem', fontSize: '1.05rem', fontWeight: '700', background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)', color: '#000', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 0 25px rgba(226, 232, 240, 0.3)' }}>
                  Send Transmission
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
