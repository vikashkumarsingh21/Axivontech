const fs = require('fs');
const https = require('https');
const path = require('path');

const downloads = [
  {
    url: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop',
    filename: 'web-engineering.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
    filename: 'mobile-app-design.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    filename: 'ai-machine-learning.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=800&auto=format&fit=crop',
    filename: 'ui-ux-design-workspace.jpg'
  },
  {
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1200&auto=format&fit=crop',
    filename: 'process-workflow.jpg'
  }
];

const targetDir = path.join(__dirname, 'public', 'assets', 'images', 'services');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

downloads.forEach((item) => {
  const filePath = path.join(targetDir, item.filename);
  const file = fs.createWriteStream(filePath);
  
  https.get(item.url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      https.get(response.headers.location, (res) => {
        res.pipe(file);
      });
    } else {
      response.pipe(file);
    }
    
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${item.filename}`);
    });
  }).on('error', (err) => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${item.filename}:`, err.message);
  });
});
