// Vercel Serverless Function: New User Signup Email Notification Dispatcher
export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, timestamp, userAgent } = req.body || {};

    if (!email) {
      return res.status(400).json({ error: 'Email parameter missing' });
    }

    const adminEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
    const resendApiKey = process.env.RESEND_API_KEY;

    console.log(`[Signup Notification] New user registered: ${email} at ${timestamp || new Date().toISOString()}`);

    // If Resend API key is configured in Vercel environment variables, send instant email
    if (resendApiKey && adminEmail) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'QuantStakes Alerts <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `⚡ New QuantStakes User Registration: ${email}`,
          html: `
            <div style="font-family: sans-serif; background: #040714; color: #ffffff; padding: 2rem; border-radius: 12px;">
              <h2 style="color: #38bdf8; margin-top: 0;">🎉 New User Signed Up!</h2>
              <p style="font-size: 1.1rem;">A new user just created an account on <strong>QuantStakes</strong>:</p>
              <div style="background: rgba(255, 255, 255, 0.05); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3); margin: 1.5rem 0;">
                <p style="margin: 0 0 0.5rem 0;"><strong>Email:</strong> <span style="color: #34d399;">${email}</span></p>
                <p style="margin: 0 0 0.5rem 0;"><strong>Signed Up At:</strong> ${timestamp || new Date().toISOString()}</p>
                <p style="margin: 0;"><strong>Device/Browser:</strong> ${userAgent || 'Web Browser'}</p>
              </div>
              <p style="font-size: 0.85rem; color: #94a3b8;">QuantStakes Quantitative Portfolio Terminal</p>
            </div>
          `
        })
      });

      const resData = await response.json();
      return res.status(200).json({ success: true, resendId: resData.id });
    }

    // Fallback response logging notification attempt
    return res.status(200).json({ 
      success: true, 
      message: 'Signup event received and logged.',
      registeredUser: email,
      note: 'Set RESEND_API_KEY and NOTIFICATION_EMAIL in Vercel environment variables to dispatch emails to your inbox automatically.'
    });

  } catch (error) {
    console.error('Error dispatching signup notification:', error);
    return res.status(500).json({ error: error.message });
  }
}
