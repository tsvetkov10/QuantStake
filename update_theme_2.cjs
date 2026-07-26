const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/pages/Privacy.jsx',
  'src/pages/Terms.jsx',
  'src/pages/Tools.jsx',
  'src/pages/TraderProfile.jsx',
  'src/pages/Onboarding.jsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join('/Users/4avo/Documents/QuantStakes', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace TrendingUp with Sparkles
    content = content.replace(/TrendingUp/g, 'Sparkles');
    
    // Replace #00f3ff with #a78bfa
    content = content.replace(/#00f3ff/g, '#a78bfa');
    
    // Replace rgba cyan with rgba violet
    content = content.replace(/rgba\(0\s*,\s*243\s*,\s*255/g, 'rgba(167, 139, 250');
    
    // Replace gradient that uses #00ffaa
    content = content.replace(/linear-gradient\([^)]*#a78bfa[^)]*#00ffaa[^)]*\)/g, 'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
