const fs = require('fs');
const https = require('https');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'demo-projects', 'edusmart');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const images = [
  {
    // Hero: Modern architectural campus with students walking and thoughtful learning environment
    name: 'hero-campus.jpg',
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop',
    description: 'Modern university academic building architecture with open campus grounds'
  },
  {
    // Intro / Story: Students collaborating thoughtfully around table in bright library
    name: 'about-learning.jpg',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop',
    description: 'Students collaborating in an inspiring modern library study space'
  },
  {
    // Campus Life 1: Modern university library interior with book stacks and study pods
    name: 'campus-library.jpg',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=800&auto=format&fit=crop',
    description: 'Bright modern university library with study pods and reference stacks'
  },
  {
    // Campus Life 2: Creative design workshop / tech lab with student projects
    name: 'campus-creative-lab.jpg',
    url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop',
    description: 'Creative design thinking and digital technology collaborative workshop'
  },
  {
    // Campus Life 3: Outdoor campus courtyard / gathering green space
    name: 'campus-quad.jpg',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=800&auto=format&fit=crop',
    description: 'Historic and contemporary academic building quad with trees'
  },
  {
    // Faculty 1: Dr. Mira Kapoor — Business Studies
    name: 'faculty-mira.jpg',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop',
    description: 'Dr. Mira Kapoor, Business Studies & Innovation'
  },
  {
    // Faculty 2: Arjun Mehta — Computer Science
    name: 'faculty-arjun.jpg',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    description: 'Arjun Mehta, Computer Science & Intelligent Systems'
  },
  {
    // Faculty 3: Nisha Rao — Design & Creative Studies
    name: 'faculty-nisha.jpg',
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=600&auto=format&fit=crop',
    description: 'Nisha Rao, Design & Creative Studies'
  },
  {
    // Faculty 4: Rohan Malhotra — Communication Studies
    name: 'faculty-rohan.jpg',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop',
    description: 'Rohan Malhotra, Communication & Media Studies'
  },
  {
    // Program visual / Academic focus: Seminar classroom discussion
    name: 'academic-seminar.jpg',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1000&auto=format&fit=crop',
    description: 'Thoughtful academic lecture and interactive seminar presentation'
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
  console.log(`Downloading ${images.length} EduSmart images into ${targetDir}...`);
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
  console.log('Finished downloading EduSmart images.');
}

run();
