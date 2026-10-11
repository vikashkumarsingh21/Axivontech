const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'demo-projects', 'corporatepro');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const downloads = [
  {
    // Hero: Executive business consulting & advisory team in a refined modern architectural office
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1200&auto=format&fit=crop',
    filename: 'hero-advisory.jpg',
    description: 'Executive strategy meeting in a bright, modern architectural consulting office'
  },
  {
    // Case Study 1: Operational Excellence - Supply chain & process workflow optimization
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000&auto=format&fit=crop',
    filename: 'operations-case-study.jpg',
    description: 'Modern logistics & industrial operations hub undergoing process restructuring'
  },
  {
    // Case Study 2: Digital Transformation - Thoughtful systems modernization & digital connectivity
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
    filename: 'digital-transformation.jpg',
    description: 'Data architecture and digital infrastructure strategy overview'
  },
  {
    // About Section: Collaborative partnership, calm thoughtful advisory discussion
    url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop',
    filename: 'about-philosophy.jpg',
    description: 'Senior partners engaging in thoughtful, collaborative dialogue'
  }
];

function downloadFile(item) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(targetDir, item.filename);
    const file = fs.createWriteStream(filePath);

    function fetchUrl(currentUrl) {
      https.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          fetchUrl(response.headers.location);
          return;
        }
        if (response.statusCode !== 200) {
          reject(new Error(`Failed with HTTP status ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            console.log(`Successfully downloaded: ${item.filename}`);
            resolve();
          });
        });
      }).on('error', (err) => {
        fs.unlink(filePath, () => {});
        reject(err);
      });
    }

    fetchUrl(item.url);
  });
}

async function run() {
  console.log('Downloading CorporatePro demo imagery into:', targetDir);
  for (const item of downloads) {
    try {
      await downloadFile(item);
    } catch (err) {
      console.error(`Error downloading ${item.filename}:`, err.message);
    }
  }
  console.log('CorporatePro image download process complete.');
}

run();
