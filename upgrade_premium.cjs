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
  
  // 1. Color Replacements
  content = content.replace(/#a78bfa/g, '#F3E5AB');
  content = content.replace(/#8b5cf6/g, '#D4AF37');
  content = content.replace(/#4c1d95/g, '#B8860B');
  content = content.replace(/rgba\(167,\s*139,\s*250/g, 'rgba(212, 175, 55');
  
  // 2. Logo Size Replacements
  // height: '24px' -> height: '40px'
  content = content.replace(/style=\{\{\s*height:\s*'24px'/g, "style={{ height: '40px'");
  // height: '36px' -> height: '60px'
  content = content.replace(/style=\{\{\s*height:\s*'36px'/g, "style={{ height: '60px'");
  // height: '40px' -> height: '64px'
  content = content.replace(/style=\{\{\s*height:\s*'40px'/g, "style={{ height: '64px'");
  // height: '48px' -> height: '90px'
  content = content.replace(/style=\{\{\s*height:\s*'48px'/g, "style={{ height: '90px'");
  
  // Also check inline objectFit just in case spacing is different
  content = content.replace(/height:\s*'24px',\s*objectFit/g, "height: '40px', objectFit");
  content = content.replace(/height:\s*'36px',\s*objectFit/g, "height: '60px', objectFit");
  content = content.replace(/height:\s*'40px',\s*objectFit/g, "height: '64px', objectFit");
  content = content.replace(/height:\s*'48px',\s*objectFit/g, "height: '90px', objectFit");

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
