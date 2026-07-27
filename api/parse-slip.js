import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on server' });
  }

  try {
    let base64Data = null;
    let mimeType = 'image/png';

    if (req.body && req.body.imageBase64) {
      base64Data = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      if (req.body.mimeType) mimeType = req.body.mimeType;
    } else if (typeof req.body === 'string') {
      try {
        const parsed = JSON.parse(req.body);
        if (parsed.imageBase64) {
          base64Data = parsed.imageBase64.replace(/^data:image\/\w+;base64,/, '');
          if (parsed.mimeType) mimeType = parsed.mimeType;
        }
      } catch (e) {}
    }

    if (!base64Data) {
      return res.status(400).json({ error: 'Missing imageBase64 in request body' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ];

    const prompt = `
      You are an expert multi-lingual sports betting AI scanner. Analyze the provided betslip image (which may be in English, Bulgarian, German, Spanish, French, etc.).
      Extract all numbers and information carefully and return ONLY a single valid JSON object (no markdown formatting, no code blocks, no text before or after).

      Field Extraction Rules:
      1. "sport": Identify the sport if shown (e.g. Tennis, Football, Basketball, MMA, Esports, Unknown). Look for icons or terms like 🎾, ⚽, 🏀, "Победител".
      2. "type": Bet type (e.g. "Single" / "Сингъл", "Parlay" / "Акумулатор", "Spread", "Over/Under", "Unknown").
      3. "teams": The match or event participants (e.g. "Andrey Martin vs Alec Beckley" or "Андрей Мартин vs Алек Бекли").
      4. "stake": The amount betted / wagered. Look for labels like "Stake", "Залог", "Wager", "Total Stake", "1 залог x 250.00 €". Extract as a clean float number (e.g. 250.0).
      5. "odds": The decimal odds / multiplier. Look for numbers like 2.05, 1.85, 3.40. Convert American odds (+150 -> 2.5) to decimal floats.
      6. "payout": The total return or amount won. Look for labels like "Печалба: 512.50 €", "Payout", "Return", "Win Amount", "Total Return". Extract as a clean float number (e.g. 512.5).
      7. "date": The date of the bet or event (formatted as YYYY-MM-DD e.g. "2026-07-27" from "27.07.2026").
      8. "status": Determine the bet status:
         - "Won" if settled as win (e.g. green badge, "Печалба", "Settled Win", "Won")
         - "Lost" if settled as loss (e.g. red badge, "Загуба", "Lost")
         - "Cashed Out" if cashed out
         - "Pending" if active / unsettled

      Required JSON format:
      {
        "sport": "Tennis",
        "type": "Single",
        "teams": "Andrey Martin vs Alec Beckley",
        "stake": 250.00,
        "odds": 2.05,
        "payout": 512.50,
        "date": "2026-07-27",
        "status": "Won"
      }
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const responseText = result.response.text();
    
    // Clean up potential markdown formatting from Gemini response
    const jsonString = responseText.replace(/```json\n?|\n?```/g, '').trim();
    const parsedData = JSON.parse(jsonString);
    
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error("Vercel AI Vision Error:", error);
    return res.status(500).json({ error: 'Failed to analyze betslip', details: error.message });
  }
}
