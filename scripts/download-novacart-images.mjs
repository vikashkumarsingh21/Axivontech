import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '../public/images/demo-projects/novacart');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Curated high quality royalty-free photos matching products
const images = [
  // Hero & Categories
  { name: 'hero-lifestyle.jpg', url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80&auto=format&fit=crop' },
  { name: 'cat-fashion.jpg', url: 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=800&q=80&auto=format&fit=crop' },
  { name: 'cat-bags.jpg', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop' },
  { name: 'cat-home.jpg', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80&auto=format&fit=crop' },
  { name: 'cat-tech.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop' },

  // Fashion Accessories (1-6)
  { name: 'watch-matte-chrono.jpg', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format&fit=crop' },
  { name: 'watch-matte-chrono-2.jpg', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80&auto=format&fit=crop' },
  { name: 'sunglasses-acetate.jpg', url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80&auto=format&fit=crop' },
  { name: 'sunglasses-acetate-2.jpg', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80&auto=format&fit=crop' },
  { name: 'leather-belt.jpg', url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&q=80&auto=format&fit=crop' },
  { name: 'leather-belt-2.jpg', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop' },
  { name: 'woven-scarf.jpg', url: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80&auto=format&fit=crop' },
  { name: 'woven-scarf-2.jpg', url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&q=80&auto=format&fit=crop' },
  { name: 'brass-cuff.jpg', url: 'https://images.unsplash.com/photo-1611591475819-79b8b73ff2f6?w=800&q=80&auto=format&fit=crop' },
  { name: 'brass-cuff-2.jpg', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80&auto=format&fit=crop' },
  { name: 'key-organiser.jpg', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80&auto=format&fit=crop' },
  { name: 'key-organiser-2.jpg', url: 'https://images.unsplash.com/photo-1582142306909-195724d33ffc?w=800&q=80&auto=format&fit=crop' },

  // Bags & Travel (7-12)
  { name: 'backpack-commuter.jpg', url: 'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&q=80&auto=format&fit=crop' },
  { name: 'backpack-commuter-2.jpg', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop' },
  { name: 'weekend-duffel.jpg', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80&auto=format&fit=crop' },
  { name: 'weekend-duffel-2.jpg', url: 'https://images.unsplash.com/photo-1473445730015-841f29a9490b?w=800&q=80&auto=format&fit=crop' },
  { name: 'laptop-sleeve.jpg', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=80&auto=format&fit=crop' },
  { name: 'laptop-sleeve-2.jpg', url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&q=80&auto=format&fit=crop' },
  { name: 'canvas-messenger.jpg', url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80&auto=format&fit=crop' },
  { name: 'canvas-messenger-2.jpg', url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80&auto=format&fit=crop' },
  { name: 'packing-cubes.jpg', url: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=800&q=80&auto=format&fit=crop' },
  { name: 'packing-cubes-2.jpg', url: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80&auto=format&fit=crop' },
  { name: 'passport-wallet.jpg', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80&auto=format&fit=crop' },
  { name: 'passport-wallet-2.jpg', url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80&auto=format&fit=crop' },

  // Home & Living (13-18)
  { name: 'ceramic-pourover.jpg', url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80&auto=format&fit=crop' },
  { name: 'ceramic-pourover-2.jpg', url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80&auto=format&fit=crop' },
  { name: 'led-lantern.jpg', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80&auto=format&fit=crop' },
  { name: 'led-lantern-2.jpg', url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80&auto=format&fit=crop' },
  { name: 'waffle-throw.jpg', url: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80&auto=format&fit=crop' },
  { name: 'waffle-throw-2.jpg', url: 'https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=800&q=80&auto=format&fit=crop' },
  { name: 'stoneware-planter.jpg', url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80&auto=format&fit=crop' },
  { name: 'stoneware-planter-2.jpg', url: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=800&q=80&auto=format&fit=crop' },
  { name: 'concrete-candle.jpg', url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80&auto=format&fit=crop' },
  { name: 'concrete-candle-2.jpg', url: 'https://images.unsplash.com/photo-1508253730651-e5ace80a7025?w=800&q=80&auto=format&fit=crop' },
  { name: 'incense-burner.jpg', url: 'https://images.unsplash.com/photo-1602874801007-bd458bb1b8b8?w=800&q=80&auto=format&fit=crop' },
  { name: 'incense-burner-2.jpg', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80&auto=format&fit=crop' },

  // Tech Accessories (19-24)
  { name: 'charging-pad.jpg', url: 'https://images.unsplash.com/photo-1586816879360-004f5b0c51e5?w=800&q=80&auto=format&fit=crop' },
  { name: 'charging-pad-2.jpg', url: 'https://images.unsplash.com/photo-1622445262464-84b14e0745b1?w=800&q=80&auto=format&fit=crop' },
  { name: 'studio-headphones.jpg', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80&auto=format&fit=crop' },
  { name: 'studio-headphones-2.jpg', url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80&auto=format&fit=crop' },
  { name: 'tablet-stand.jpg', url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80&auto=format&fit=crop' },
  { name: 'tablet-stand-2.jpg', url: 'https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=800&q=80&auto=format&fit=crop' },
  { name: 'mechanical-keyboard.jpg', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80&auto=format&fit=crop' },
  { name: 'mechanical-keyboard-2.jpg', url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80&auto=format&fit=crop' },
  { name: 'braided-cables.jpg', url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&q=80&auto=format&fit=crop' },
  { name: 'braided-cables-2.jpg', url: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&q=80&auto=format&fit=crop' },
  { name: 'aluminum-riser.jpg', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80&auto=format&fit=crop' },
  { name: 'aluminum-riser-2.jpg', url: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&q=80&auto=format&fit=crop' },
];

async function downloadAll() {
  console.log(`Starting download of ${images.length} images...`);
  for (const img of images) {
    const dest = path.join(outDir, img.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`Already exists: ${img.name}`);
      continue;
    }
    try {
      console.log(`Downloading: ${img.name}...`);
      const res = await fetch(img.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`Saved: ${img.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`Failed ${img.name}:`, err.message);
    }
  }
  console.log('Finished downloads.');
}

downloadAll();
