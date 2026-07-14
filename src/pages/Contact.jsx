import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Send, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  return (
    <div className="flex-col" style={{ minHeight: '100vh', width: '100vw', padding: '4rem 2rem' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        <Link to="/" className="flex items-center gap-2 text-secondary mb-8" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          <ArrowLeft size={16} /> Back to Home
        </Link>
        
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp size={24} className="text-success" />
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>Contact Support</h1>
        </div>

        <div className="grid grid-cols-2 gap-8" style={{ alignItems: 'flex-start' }}>
          
          <div className="flex-col gap-6">
            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Enterprise Inquiries</h3>
              <p className="text-secondary" style={{ marginBottom: '1rem' }}>Interested in API access or white-label solutions for your syndicate?</p>
              <div className="flex items-center gap-2 text-gradient">
                <Mail size={16} /> enterprise@quantstake.com
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Headquarters</h3>
              <p className="text-secondary" style={{ marginBottom: '1rem' }}>QuantStake Technologies LLC</p>
              <div className="flex items-center gap-2 text-secondary">
                <MapPin size={16} /> 100 Cyber Avenue, Silicon Valley, CA 94025
              </div>
            </div>
          </div>

          <div className="glass-panel">
            {sent ? (
              <div className="flex-col items-center justify-center text-center" style={{ padding: '2rem' }}>
                <Send size={48} className="text-success mb-4" />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Message Received</h3>
                <p className="text-secondary">Our support team will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="flex-col gap-6">
                <div>
                  <label className="label">Name</label>
                  <input type="text" className="input-field" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input-field" placeholder="john@example.com" required />
                </div>
                <div>
                  <label className="label">Message</label>
                  <textarea className="input-field" placeholder="How can we help you?" required rows="5" style={{ resize: 'vertical' }}></textarea>
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
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
