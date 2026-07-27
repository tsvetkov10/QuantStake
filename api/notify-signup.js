// Vercel Serverless Function: New User Signup & Welcome Email Dispatcher
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

    const adminEmail = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL || 'contact@quantstakes.com';
    const resendApiKey = process.env.RESEND_API_KEY;

    console.log(`[Signup Event] New user registered: ${email} at ${timestamp || new Date().toISOString()}`);

    const senderEmail = process.env.SENDER_EMAIL || 'QuantStakes Terminal <welcome@quantstakes.com>';

    // If Resend API key is configured, dispatch BOTH Admin Notification & Welcome Email
    if (resendApiKey) {
      // 1. Admin Alert Email to contact@quantstakes.com
      const adminPromise = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [adminEmail],
          subject: `⚡ New QuantStakes User Registration: ${email}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #040714; color: #ffffff; padding: 2rem; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(56, 189, 248, 0.3);">
              <h2 style="color: #38bdf8; margin-top: 0;">🎉 New User Signed Up!</h2>
              <p style="font-size: 1.05rem; color: #e2e8f0;">A new user just created an account on <strong>QuantStakes</strong>:</p>
              <div style="background: rgba(255, 255, 255, 0.04); padding: 1.25rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); margin: 1.5rem 0;">
                <p style="margin: 0 0 0.5rem 0; color: #94a3b8;">User Email: <span style="color: #34d399; font-weight: bold;">${email}</span></p>
                <p style="margin: 0 0 0.5rem 0; color: #94a3b8;">Signed Up At: <span style="color: #ffffff;">${timestamp || new Date().toISOString()}</span></p>
                <p style="margin: 0; color: #94a3b8;">Device / Browser: <span style="color: #ffffff;">${userAgent || 'Web Browser'}</span></p>
              </div>
              <p style="font-size: 0.85rem; color: #64748b;">QuantStakes Quantitative Portfolio Terminal</p>
            </div>
          `
        })
      });

      // 2. Automated Luxury Welcome Email directly to the User's Inbox
      const welcomePromise = fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [email],
          subject: `Welcome to QuantStakes — Your Quantitative Portfolio Terminal 🚀`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to QuantStakes</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #040714; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #040714; padding: 40px 15px;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #0b1023; border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);">
                      
                      <!-- Header Banner -->
                      <tr>
                        <td style="padding: 40px 40px 30px 40px; background: linear-gradient(180deg, rgba(56, 189, 248, 0.12) 0%, rgba(11, 16, 35, 0) 100%); text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                          <img src="https://www.quantstakes.com/logo-full.png" alt="QuantStakes Logo" style="height: 52px; width: auto; margin-bottom: 16px;" />
                          <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Welcome to QuantStakes</h1>
                          <p style="margin: 8px 0 0 0; font-size: 14px; color: #38bdf8; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase;">Institutional-Grade Portfolio Management</p>
                        </td>
                      </tr>

                      <!-- Main Body Content -->
                      <tr>
                        <td style="padding: 36px 40px;">
                          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #e2e8f0;">
                            Welcome aboard! Your QuantStakes account has been successfully created. You now have access to an institutional-grade sports portfolio management engine built on mathematical proof and zero fake records.
                          </p>

                          <!-- Quick Start Features Grid -->
                          <div style="margin: 28px 0; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">⚡ Quick Start Guide</h3>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px;">
                              <tr>
                                <td width="32" valign="top" style="font-size: 18px;">📊</td>
                                <td style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                                  <strong style="color: #ffffff;">Track True ROI:</strong> Log your portfolio metrics with verified mathematical calculation.
                                </td>
                              </tr>
                            </table>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 14px;">
                              <tr>
                                <td width="32" valign="top" style="font-size: 18px;">⚡</td>
                                <td style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                                  <strong style="color: #ffffff;">Instant Slip OCR:</strong> Upload slip screenshots for automated odds and stake extraction.
                                </td>
                              </tr>
                            </table>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                              <tr>
                                <td width="32" valign="top" style="font-size: 18px;">🔒</td>
                                <td style="font-size: 14px; line-height: 1.5; color: #cbd5e1;">
                                  <strong style="color: #ffffff;">Cryptographic Proof:</strong> Unforgeable SHA-256 sealed history that proves your true edge.
                                </td>
                              </tr>
                            </table>
                          </div>

                          <!-- Call to Action Button -->
                          <div style="text-align: center; margin: 36px 0 28px 0;">
                            <a href="https://www.quantstakes.com/dashboard" target="_blank" style="display: inline-block; background: #ffffff; color: #040714; font-size: 15px; font-weight: 700; text-decoration: none; padding: 14px 36px; border-radius: 30px; box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);">
                              Launch Terminal Dashboard →
                            </a>
                          </div>

                          <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #94a3b8; text-align: center;">
                            If you have any questions or need assistance, reply directly to this email or reach us at <a href="mailto:contact@quantstakes.com" style="color: #38bdf8; text-decoration: none;">contact@quantstakes.com</a>.
                          </p>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding: 24px 40px; background-color: #070b19; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center;">
                          <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b;">
                            © ${new Date().getFullYear()} QuantStakes Quantitative Terminal. All rights reserved.
                          </p>
                          <p style="margin: 0; font-size: 12px; color: #475569;">
                            Sports Portfolio Analytics Platform
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        })
      });

      await Promise.allSettled([adminPromise, welcomePromise]);
      return res.status(200).json({ success: true, message: 'Admin alert and Welcome email dispatched.' });
    }

    // Fallback response logging notification attempt
    return res.status(200).json({ 
      success: true, 
      message: 'Signup event received and logged.',
      registeredUser: email,
      note: 'Set RESEND_API_KEY and NOTIFICATION_EMAIL in Vercel environment variables to dispatch emails automatically.'
    });

  } catch (error) {
    console.error('Error dispatching signup & welcome emails:', error);
    return res.status(500).json({ error: error.message });
  }
}

