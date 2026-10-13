const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'demo-projects', 'foodiehub');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const images = [
  {
    name: 'hero-dish.jpg',
    url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=1200&auto=format&fit=crop',
    description: 'Contemporary plated Indian dish with vibrant saffron and aromatic spices'
  },
  {
    name: 'story-kitchen.jpg',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop',
    description: 'Artisan culinary kitchen preparation with fresh herbs and spices'
  },
  {
    name: 'sig-paneer-tikka.jpg',
    url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?q=80&w=800&auto=format&fit=crop',
    description: 'Smoked artisan paneer tikka skewers with mint chutney'
  },
  {
    name: 'sig-dal-makhani.jpg',
    url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=800&auto=format&fit=crop',
    description: 'Slow-simmered rich dal with fresh cream and whole spices'
  },
  {
    name: 'sig-kulfi-dessert.jpg',
    url: 'https://images.unsplash.com/photo-1505253758473-96b3015f27eb?q=80&w=800&auto=format&fit=crop',
    description: 'Artisan saffron and pistachio dessert presentation'
  },
  {
    name: 'ambience-interior.jpg',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200&auto=format&fit=crop',
    description: 'Warm, contemporary restaurant dining room with elegant atmospheric lighting'
  },
  {
    name: 'ambience-table.jpg',
    url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=1000&auto=format&fit=crop',
    description: 'Intimate table setting with warm candlelight and ceramic dinnerware'
  },
  {
    name: 'gallery-ingredients.jpg',
    url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop',
    description: 'Handpicked Indian whole spices, saffron threads, and cardamom pods'
  },
  {
    name: 'gallery-drink.jpg',
    url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop',
    description: 'Handcrafted spiced botanical cooler with fresh citrus'
  },
  {
    name: 'gallery-tandoor.jpg',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=800&auto=format&fit=crop',
    description: 'Clay tandoor flatbread and chargrilled culinary craftsmanship'
  },
  {
    name: 'private-dining.jpg',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000&auto=format&fit=crop',
    description: 'Exclusive private dining banquet setup with bespoke tablescape'
  }
];

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

async function run() {
  console.log(`Downloading ${images.length} FoodieHub images into ${targetDir}...`);
  for (const img of images) {
    const dest = path.join(targetDir, img.name);
    try {
      await downloadImage(img.url, dest);
      const size = fs.statSync(dest).size;
      console.log(`✓ Downloaded ${img.name} (${Math.round(size / 1024)} KB)`);
    } catch (e) {
      console.error(`✗ Error downloading ${img.name}:`, e.message);
    }
  }
  console.log('Finished downloading FoodieHub images.');
}

run();
