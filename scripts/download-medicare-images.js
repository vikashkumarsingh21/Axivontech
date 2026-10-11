const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'demo-projects', 'medicare');

const img = {
  name: 'doctor-nisha.jpg',
  url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=800&auto=format&fit=crop'
};

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
        fileStream.close();
        resolve();
      });
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

downloadImage(img.url, path.join(targetDir, img.name))
  .then(() => {
    const size = fs.statSync(path.join(targetDir, img.name)).size;
    console.log(`Successfully saved ${img.name} (${Math.round(size / 1024)} KB)`);
  })
  .catch((err) => {
    console.error('Failed:', err.message);
  });
