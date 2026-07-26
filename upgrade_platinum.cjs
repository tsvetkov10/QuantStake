const fs = require('fs');
const path = require('path');

const srcDir = '/Users/4avo/Documents/QuantStakes/src';

const walkSync = function(dir, filelist) {
  files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    }
    else {
      if (file.endsWith('.jsx') || file.endsWith('.css')) {
        filelist.push(path.join(dir, file));
      }
    }
  });
  return filelist;
};

const allFiles = walkSync(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace Gold Theme with Platinum Theme
  // Light Gold -> Platinum White
  content = content.replace(/#F3E5AB/g, '#FFFFFF');
  // Metallic Gold -> Crisp Silver
  content = content.replace(/#D4AF37/g, '#E2E8F0');
  // Deep Gold -> Slate Silver
  content = content.replace(/#B8860B/g, '#94A3B8');
  // Gold RGBA -> Silver RGBA
  content = content.replace(/rgba\(212,\s*175,\s*55/g, 'rgba(226, 232, 240');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
