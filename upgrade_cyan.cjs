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
  
  // Replace Premium Indigo Theme with High-Contrast Premium Cyan Theme
  
  // Soft Periwinkle -> Ice Cyan (Bright highlight for gradients)
  content = content.replace(/#9d8df0/g, '#22d3ee');
  
  // Logo Indigo -> Electric Cyan (Main accent)
  content = content.replace(/#4833b5/g, '#06b6d4');
  
  // Dark Indigo -> Deep Marine (Dark accents/borders)
  content = content.replace(/#29187a/g, '#083344');
  
  // Indigo RGBA -> Cyan RGBA
  content = content.replace(/rgba\(72,\s*51,\s*181/g, 'rgba(6, 182, 212');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
