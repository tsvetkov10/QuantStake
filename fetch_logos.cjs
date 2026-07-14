const fs = require('fs');
const https = require('https');

const existingContent = fs.readFileSync('src/lib/teams.js', 'utf8');
const existingTeams = [];
const regex = /\{\s*name:\s*'([^']+)',\s*logo:\s*'([^']+)'\s*\}/g;
let match;
while ((match = regex.exec(existingContent)) !== null) {
  existingTeams.push({ name: match[1], logo: match[2] });
}

const bulgarianTeams = [
  'Ludogorets', 'Levski Sofia', 'CSKA Sofia', 'Botev Plovdiv', 'Lokomotiv Plovdiv', 
  'Cherno More', 'Slavia Sofia', 'Beroe', 'Arda', 'Krumovgrad'
];

for (const bt of bulgarianTeams) {
  if (!existingTeams.some(t => t.name.toLowerCase() === bt.toLowerCase())) {
    existingTeams.push({ name: bt, logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(bt)}&background=18181b&color=fff` });
  }
}

function fetchLogo(teamName) {
  return new Promise((resolve) => {
    const searchName = encodeURIComponent(teamName);
    const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${searchName}`;
    
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.teams && data.teams.length > 0 && data.teams[0].strBadge) {
            resolve(data.teams[0].strBadge);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function run() {
  console.log(`Starting to fetch logos for ${existingTeams.length} teams...`);
  let count = 0;
  
  // Process in small batches so we don't overwhelm the API
  for (let i = 0; i < existingTeams.length; i++) {
    const t = existingTeams[i];
    
    // Only fetch if it's currently a ui-avatars generated logo or has no good logo
    if (t.logo.includes('ui-avatars.com')) {
      const newLogo = await fetchLogo(t.name);
      if (newLogo) {
        t.logo = newLogo;
        count++;
        console.log(`Found logo for ${t.name}`);
      } else {
        console.log(`No logo found for ${t.name}, trying with alternative names...`);
        // Try fallback for some typical names (e.g., stripping FC)
        const altName = t.name.replace(/( FC| Utd| CF| CP)/i, '');
        if (altName !== t.name) {
           const altLogo = await fetchLogo(altName);
           if (altLogo) {
             t.logo = altLogo;
             count++;
             console.log(`Found logo for ${t.name} (using ${altName})`);
           }
        }
      }
      
      // Delay to respect API limits
      await new Promise(r => setTimeout(r, 200));
    }
  }

  let fileStr = 'export const footballTeams = [\n';
  for (let i = 0; i < existingTeams.length; i++) {
    fileStr += `  { name: '${existingTeams[i].name.replace(/'/g, "\\'")}', logo: '${existingTeams[i].logo}' }`;
    if (i < existingTeams.length - 1) fileStr += ',';
    fileStr += '\n';
  }
  fileStr += '];\n';

  fs.writeFileSync('src/lib/teams.js', fileStr);
  console.log(`Successfully updated ${count} logos. Total teams: ${existingTeams.length}`);
}

run();
