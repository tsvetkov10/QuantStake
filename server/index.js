import fs from 'fs';
import { exec } from 'child_process';

// Ensure dataset images directory exists
const datasetDir = path.join(__dirname, '..', 'scripts', 'dataset');
const imagesDir = path.join(datasetDir, 'images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

app.post('/api/parse-slip', upload.single('image'), async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in your .env file' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Save image to automatic training dataset folder
    const imgFilename = `slip_${Date.now()}.png`;
    const imgPath = path.join(imagesDir, imgFilename);
    fs.writeFileSync(imgPath, req.file.buffer);

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
    parsedData.imgFilename = imgFilename;

    res.json(parsedData);

    // Auto-trigger background training dataset update and fine-tuning execution
    triggerAutoTraining(imgFilename, parsedData);
    
  } catch (error) {
    console.error("AI Parsing Error:", error);
    res.status(500).json({ error: 'Failed to analyze the image', details: error.message });
  }
});

// Automatic Active Learning Training Trigger
function triggerAutoTraining(filename, groundTruth) {
  try {
    const labelsPath = path.join(datasetDir, 'labels.json');
    let labels = [];
    if (fs.existsSync(labelsPath)) {
      labels = JSON.parse(fs.readFileSync(labelsPath, 'utf8'));
    }

    labels.push({
      image_filename: filename,
      bookmaker: "AutoCaptured",
      timestamp: new Date().toISOString(),
      ground_truth: groundTruth
    });

    fs.writeFileSync(labelsPath, JSON.stringify(labels, null, 2));
    console.log(`[🤖 AUTO-AI] Saved new labeled sample "${filename}". Total samples: ${labels.length}`);

    // Spawn Python Fine-Tuning Script asynchronously in the background
    const trainScript = path.join(__dirname, '..', 'scripts', 'train_betslip_llm.py');
    exec(`python3 "${trainScript}" --epochs 3`, (err, stdout, stderr) => {
      if (err) {
        console.error('[-] Auto-training background job failed:', err);
        return;
      }
      console.log('[🤖 AUTO-AI] Automatic Fine-Tuning background training complete!');
    });
  } catch (e) {
    console.error('[-] Auto-training error:', e);
  }
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Vision & Automatic Training Server running on http://localhost:${PORT}`);
});
