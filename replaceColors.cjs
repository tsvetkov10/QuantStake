const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content;

    // Direct color string replacements
    newContent = newContent.replace(/color:\s*'white'/g, "color: 'var(--text-primary)'");
    newContent = newContent.replace(/color:\s*"white"/g, 'color: "var(--text-primary)"');
    newContent = newContent.replace(/backgroundColor:\s*'white'/g, "backgroundColor: 'var(--text-invert)'");
    newContent = newContent.replace(/background:\s*'#000000'/g, "background: 'var(--bg-invert)'");
    newContent = newContent.replace(/background:\s*'#0a0a0f'/g, "background: 'var(--bg-glass)'");

    // Adaptive opacities
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.15\)/g, 'var(--adaptive-white-15)');
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.1\)/g, 'var(--adaptive-white-10)');
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.08\)/g, 'var(--adaptive-white-08)');
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.06\)/g, 'var(--adaptive-white-06)');
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.05\)/g, 'var(--adaptive-white-05)');
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.04\)/g, 'var(--adaptive-white-04)');
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.03\)/g, 'var(--adaptive-white-03)');
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.02\)/g, 'var(--adaptive-white-02)');
    newContent = newContent.replace(/rgba\(255,\s*255,\s*255,\s*0\.01\)/g, 'var(--adaptive-white-01)');

    // Modal background
    newContent = newContent.replace(/rgba\(0,\s*0,\s*0,\s*0\.85\)/g, 'var(--bg-modal)');
    newContent = newContent.replace(/rgba\(10,\s*10,\s*15,\s*0\.85\)/g, 'var(--bg-modal)');

    // Slips and Items gradients
    newContent = newContent.replace(/rgba\(10,\s*10,\s*15,\s*0\.95\)/g, 'var(--slip-gradient-1)');
    newContent = newContent.replace(/rgba\(20,\s*20,\s*25,\s*0\.98\)/g, 'var(--slip-gradient-2)');
    
    newContent = newContent.replace(/rgba\(10,\s*10,\s*15,\s*0\.7\)/g, 'var(--item-gradient-1)');
    newContent = newContent.replace(/rgba\(20,\s*20,\s*25,\s*0\.9\)/g, 'var(--item-gradient-2)');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

walkDir(srcDir, processFile);
console.log("Done!");
