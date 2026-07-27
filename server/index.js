import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup ES module filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from parent directory (Quant Stake root)
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Setup multer for memory storage (we don't need to save the file to disk)
const upload = multer({ storage: multer.memoryStorage() });

// Initialize Gemini
// Fallback to empty string to prevent crashing on startup if key is missing
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/api/parse-slip', upload.single('image'), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in your .env file' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Prepare the image for Gemini
    const imageParts = [
      {
        inlineData: {
          data: req.file.buffer.toString('base64'),
          mimeType: req.file.mimetype
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
    res.json(parsedData);
    
  } catch (error) {
    console.error("AI Parsing Error:", error);
    res.status(500).json({ error: 'Failed to analyze the image', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Vision Server running on http://localhost:${PORT}`);
});
