import fs from 'fs';

const content = fs.readFileSync('src/data/demo-projects.ts', 'utf8');

const imageRegex = /image:\s*"([^"]+)"/g;
let match;
const allImages = [];
while ((match = imageRegex.exec(content)) !== null) {
  allImages.push(match[1]);
}

console.log('Total images referenced in demo-projects.ts:', allImages.length);

const missing = [];
const existing = [];
for (const img of allImages) {
  if (img.startsWith('/')) {
    const local = 'public' + img;
    if (fs.existsSync(local)) {
      existing.push(img);
    } else {
      missing.push(img);
    }
  }
}

console.log('Existing images:', existing.length);
console.log('Missing images:', missing.length);
if (missing.length > 0) {
  console.log('Sample missing:', missing.slice(0, 10));
}
