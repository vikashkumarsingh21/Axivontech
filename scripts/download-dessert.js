const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'demo-projects', 'foodiehub');

// High-quality dessert photo: Cardamom / Saffron artisan dessert
const url = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop';
const dest = path.join(targetDir, 'sig-kulfi-dessert.jpg');

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const fileStream = fs.createWriteStream(dest);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close(() => resolve());
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

downloadImage(url, dest)
  .then(() => {
    const size = fs.statSync(dest).size;
    console.log(`✓ Successfully downloaded sig-kulfi-dessert.jpg (${Math.round(size / 1024)} KB)`);
  })
  .catch((e) => console.error(e));
