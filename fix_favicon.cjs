const Jimp = require('jimp');

async function fixFavicon() {
  // Read the image
  const image = await Jimp.read('src/assets/symbol.png');
  
  // Find the maximum dimension
  const maxDim = Math.max(image.bitmap.width, image.bitmap.height);
  
  // Create a new square image with transparent background
  const square = new Jimp(maxDim, maxDim, 0x00000000);
  
  // Calculate offsets to center
  const x = Math.round((maxDim - image.bitmap.width) / 2);
  const y = Math.round((maxDim - image.bitmap.height) / 2);
  
  // Composite the original image onto the center of the square
  square.composite(image, x, y);
  
  // Resize to a reasonable favicon size to save bandwidth, e.g., 256x256
  square.resize(256, 256);
  
  // Write to public/favicon.png
  await square.writeAsync('public/favicon.png');
  console.log('Fixed favicon successfully!');
}

fixFavicon().catch(err => {
  console.error(err);
  process.exit(1);
});
