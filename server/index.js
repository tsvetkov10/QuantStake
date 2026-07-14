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
      You are an expert sports betting analyst. Look at the provided screenshot of a bet slip.
      Extract the following information and return ONLY a valid JSON object (no markdown, no backticks).
      If a value is not found, leave it as null.
      
      Required JSON structure:
      {
        "sport": "String (e.g. Football, Basketball, Tennis, MMA, Racing, Unknown)",
        "type": "String (e.g. Moneyline, Spread, Parlay, Over/Under, Prop, Unknown)",
        "teams": "String (The teams/players involved, e.g. Lakers vs Warriors)",
        "stake": Number (The amount wagered, extract just the number),
        "odds": Number (The decimal odds. If American odds like +150, convert to decimal e.g. 2.5)
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
