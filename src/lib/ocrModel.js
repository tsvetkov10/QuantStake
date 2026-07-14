import { createWorker } from 'tesseract.js';
import { footballTeams } from './teams';

export async function extractBetData(imageSource, onProgress) {
  try {
    const worker = await createWorker('bul+eng', 1, {
      logger: m => {
        if (onProgress && m.status === 'recognizing text') {
          onProgress(m.progress);
        }
      }
    });

    // Request blocks layout structure in v7
    const { data } = await worker.recognize(imageSource, {}, { blocks: true, text: true });
    await worker.terminate();

    return parseSpatialData(data);
  } catch (error) {
    console.error("OCR Extraction failed:", error);
    throw error;
  }
}

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1));
      }
    }
  }
  return matrix[b.length][a.length];
}

function parseSpatialData(data) {
  const result = {
    stake: '',
    odds: '',
    teams: '',
    date: '',
    type: ''
  };

  const blocks = data.blocks;
  const allWords = [];
  
  if (blocks) {
    for (const block of blocks) {
      if (!block.paragraphs) continue;
      for (const para of block.paragraphs) {
        if (!para.lines) continue;
        for (const line of para.lines) {
          if (!line.words) continue;
          for (const word of line.words) {
            allWords.push({ text: word.text, bbox: word.bbox });
          }
        }
      }
    }
  }

  // Fallback if blocks fail (e.g., no text)
  if (allWords.length === 0) return result;

  const maxX = Math.max(...allWords.map(w => w.bbox.x1));
  const maxY = Math.max(...allWords.map(w => w.bbox.y1));

  // 1. Spatial Currency & Stake Matching
  const currencyWords = [];
  for (let i = 0; i < allWords.length; i++) {
    const w = allWords[i];
    const text = w.text;
    const decimalMatch = text.match(/(\d+[\.,]\d{2})/);
    if (decimalMatch) {
      const val = parseFloat(decimalMatch[1].replace(',', '.'));
      if (text.match(/[€$£лв]/i)) {
        currencyWords.push({ val, bbox: w.bbox });
      } else if (i + 1 < allWords.length && allWords[i+1].text.match(/^[€$£лв]/i)) {
        currencyWords.push({ val, bbox: w.bbox });
      }
    }
  }

  if (currencyWords.length > 0) {
    // Filter to bottom half of the image
    const bottomCurrency = currencyWords.filter(c => (c.bbox.y0 / maxY) > 0.5);
    if (bottomCurrency.length > 0) {
      // Stake is always to the left of the potential payout on bet slips
      bottomCurrency.sort((a, b) => a.bbox.x0 - b.bbox.x0);
      result.stake = bottomCurrency[0].val.toFixed(2);
    } else {
      // Fallback: smallest currency value
      result.stake = Math.min(...currencyWords.map(c => c.val)).toFixed(2);
    }
  }

  // 2. Database-Driven Team Detection
  const teamDictionary = {
    "франция": "France",
    "мароко": "Morocco",
    "аржентина": "Argentina",
    "хърватия": "Croatia",
    "англия": "England",
    "бразилия": "Brazil",
    "португалия": "Portugal",
    "нидерландия": "Netherlands",
    "испания": "Spain",
    "германия": "Germany",
    "италия": "Italy",
    "белгия": "Belgium",
    "египет": "Egypt",
    "цска": "CSKA",
    "дери сити": "Derry City",
    "реал мадрид": "Real Madrid",
    "барселона": "Barcelona",
    "атлетико мадрид": "Atletico Madrid",
    "байерн мюнхен": "Bayern Munich",
    "борусия дортмунд": "Borussia Dortmund",
    "ювентус": "Juventus",
    "милан": "AC Milan",
    "интер": "Inter",
    "наполи": "Napoli",
    "рома": "AS Roma",
    "арсенал": "Arsenal",
    "челси": "Chelsea",
    "ливърпул": "Liverpool",
    "манчестър сити": "Manchester City",
    "манчестър юнайтед": "Manchester United",
    "тотнъм": "Tottenham",
    "нюкасъл": "Newcastle",
    "псж": "Paris Saint Germain",
    "пари сен жермен": "Paris Saint Germain"
  };

  const allTeamNames = footballTeams.map(t => t.name.toLowerCase());
  const allTeamKeys = Object.keys(teamDictionary);

  const foundTeams = [];
  const foundTeamBBoxes = [];
  
  // Create clean string to use our word-grouping logic
  const flatText = data.text || allWords.map(w => w.text).join(' ');
  const cleanText = flatText.toLowerCase().replace(/[^\w\s\u0400-\u04FF]/gi, ' ');
  const words = cleanText.split(/\s+/).filter(w => w.length > 1);

  for (let i = 0; i < words.length; i++) {
    for (let len = 3; len > 0; len--) {
      if (i + len <= words.length) {
        let phrase = words.slice(i, i + len).join(' ');
        
        // Normalize mixed Latin/Cyrillic characters that look identical
        const normalizeVisuals = (str) => {
          const map = {
            'a': 'а', 'o': 'о', 'e': 'е', 'p': 'р', 'c': 'с', 'x': 'х', 'y': 'у', 'm': 'м', 't': 'т', 'h': 'н'
          };
          return str.replace(/[aoepcxymth]/g, m => map[m]);
        };
        const normalizedPhrase = normalizeVisuals(phrase);

        let matchedTeam = null;
        if (allTeamKeys.includes(phrase) || allTeamKeys.includes(normalizedPhrase)) {
          matchedTeam = teamDictionary[phrase] || teamDictionary[normalizedPhrase];
        } else if (allTeamNames.includes(phrase)) {
          matchedTeam = footballTeams.find(t => t.name.toLowerCase() === phrase).name;
        } else {
          // Fallback: Substring match to catch OCR noise
          const phraseToUse = normalizedPhrase;
          for (const key of allTeamKeys) {
            if (key.length >= 4 && phraseToUse.includes(key)) {
              matchedTeam = teamDictionary[key];
              break;
            }
          }
          if (!matchedTeam) {
            for (const name of allTeamNames) {
              if (name.length >= 4 && phrase.includes(name)) {
                matchedTeam = footballTeams.find(t => t.name.toLowerCase() === name).name;
                break;
              }
            }
          }
          // Ultimate Fallback: Fuzzy / Levenshtein Distance
          if (!matchedTeam && phraseToUse.length >= 4) {
            let bestMatch = null;
            let minDistance = 3; // Max typos allowed
            
            for (const key of allTeamKeys) {
              const dist = levenshteinDistance(phraseToUse, key);
              const threshold = Math.max(1, Math.floor(key.length / 4)); // e.g., 8 letters = 2 typos allowed
              if (dist <= threshold && dist < minDistance) {
                minDistance = dist;
                bestMatch = teamDictionary[key];
              }
            }
            if (!bestMatch) {
              for (const name of allTeamNames) {
                const dist = levenshteinDistance(phraseToUse, name);
                const threshold = Math.max(1, Math.floor(name.length / 4));
                if (dist <= threshold && dist < minDistance) {
                  minDistance = dist;
                  bestMatch = footballTeams.find(t => t.name.toLowerCase() === name).name;
                }
              }
            }
            matchedTeam = bestMatch;
          }
        }
        
        if (matchedTeam && !foundTeams.includes(matchedTeam)) {
          foundTeams.push(matchedTeam);
          // Attempt to find its approx Y coord to anchor the odds search
          const originalWordMatch = allWords.find(w => w.text.toLowerCase().includes(words[i]));
          if (originalWordMatch) {
             foundTeamBBoxes.push(originalWordMatch.bbox);
          }
          i += len - 1;
          break;
        }
      }
    }
  }

  if (foundTeams.length >= 2) {
    result.teams = `${foundTeams[0]} vs ${foundTeams[1]}`;
  } else if (foundTeams.length === 1) {
    result.teams = foundTeams[0];
  }

  // 3. Spatial Odds Extraction
  const potentialOdds = [];
  for (const w of allWords) {
    const decimalMatch = w.text.match(/(?:^|[^\d])(\d+[\.,]\d{2})(?:[^\d]|$)/);
    if (decimalMatch && !w.text.match(/[€$£лв]/i)) {
      const num = parseFloat(decimalMatch[1].replace(',', '.'));
      // Filter out times
      const isLikelyTime = w.text.endsWith('.00') && num >= 10 && num <= 24 && (w.bbox.y0 / maxY) > 0.8;
      
      if (num > 1.00 && num < 100.00 && !isLikelyTime) {
        potentialOdds.push({ val: num, bbox: w.bbox });
      }
    }
  }

  if (potentialOdds.length > 0) {
    if (foundTeamBBoxes.length > 0) {
      // Find the odds physically closest to the Matchup (Y-axis distance)
      const avgTeamY = foundTeamBBoxes.reduce((sum, box) => sum + box.y0, 0) / foundTeamBBoxes.length;
      potentialOdds.sort((a, b) => Math.abs(a.bbox.y0 - avgTeamY) - Math.abs(b.bbox.y0 - avgTeamY));
      result.odds = potentialOdds[0].val.toFixed(2);
    } else {
      // Fallback
      result.odds = potentialOdds[0].val.toFixed(2);
    }
  }

  // 4. Type & Date (Flat text fallback)
  if (flatText.match(/създай залог/i)) {
    result.type = "Bet Builder";
  } else if (flatText.match(/сингъл/i)) {
    result.type = "Single";
  } else if (flatText.match(/множествен/i) || flatText.match(/права колонка/i) || flatText.match(/комбо/i)) {
    result.type = "Multiple";
  }

  const dateMatch = flatText.match(/(\d{2})[\./](\d{2})[\./](\d{4})/);
  if (dateMatch) {
    result.date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
  }

  return result;
}
