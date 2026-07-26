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
  
  // Replace Gold Theme with Premium Indigo Theme
  // Light Gold -> Soft Periwinkle
  content = content.replace(/#F3E5AB/g, '#9d8df0');
  // Metallic Gold -> Logo Indigo
  content = content.replace(/#D4AF37/g, '#4833b5');
  // Deep Gold -> Dark Indigo
  content = content.replace(/#B8860B/g, '#29187a');
  // Gold RGBA -> Indigo RGBA
  content = content.replace(/rgba\(212,\s*175,\s*55/g, 'rgba(72, 51, 181');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
