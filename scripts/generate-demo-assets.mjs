import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const OAKFIELD_DIR = 'public/demo-assets/education/oakfield';
const SOLARA_DIR = 'public/demo-assets/hospitality/solara';

// Helper to convert SVG to JPG and WebP
async function saveImages(svgString, dir, name) {
  const svgBuffer = Buffer.from(svgString);
  const jpgPath = path.join(dir, `${name}.jpg`);
  const webpPath = path.join(dir, `${name}.webp`);

  await sharp(svgBuffer)
    .resize(1200, 800)
    .jpeg({ quality: 90, progressive: true })
    .toFile(jpgPath);

  await sharp(svgBuffer)
    .resize(1200, 800)
    .webp({ quality: 88, effort: 6 })
    .toFile(webpPath);

  console.log(`✓ Generated ${name} in ${dir}`);
}

async function generateOakfieldAssets() {
  console.log('Generating Oakfield International School assets...');

  // 1. Hero Campus
  const heroCampus = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4A90E2"/>
        <stop offset="60%" stop-color="#E4F0FB"/>
        <stop offset="100%" stop-color="#FFFDF9"/>
      </linearGradient>
      <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3A7D44"/>
        <stop offset="100%" stop-color="#1E4522"/>
      </linearGradient>
      <linearGradient id="brickGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#8C3A27"/>
        <stop offset="50%" stop-color="#B24C34"/>
        <stop offset="100%" stop-color="#7A2F1E"/>
      </linearGradient>
      <linearGradient id="stoneGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#F2EBD9"/>
        <stop offset="100%" stop-color="#D6CBB2"/>
      </linearGradient>
    </defs>
    <!-- Sky -->
    <rect width="1200" height="520" fill="url(#skyGrad)"/>
    <!-- Distant Trees -->
    <path d="M 0 500 Q 150 460 300 490 Q 450 450 600 480 Q 750 440 900 480 Q 1050 450 1200 490 L 1200 550 L 0 550 Z" fill="#2D5A27" opacity="0.6"/>
    <path d="M 0 520 Q 200 480 400 510 Q 700 470 950 510 Q 1100 480 1200 520 L 1200 560 L 0 560 Z" fill="#22481E" opacity="0.8"/>
    
    <!-- Main Campus Building (Georgian / Heritage Brick Architecture) -->
    <!-- Central Portico -->
    <rect x="350" y="240" width="500" height="280" fill="url(#brickGrad)"/>
    <!-- Wing Left -->
    <rect x="120" y="290" width="230" height="230" fill="#9C412C"/>
    <!-- Wing Right -->
    <rect x="850" y="290" width="230" height="230" fill="#9C412C"/>
    
    <!-- Stone Classical Pediment & Columns -->
    <polygon points="600,160 380,240 820,240" fill="url(#stoneGrad)"/>
    <rect x="420" y="240" width="30" height="280" fill="url(#stoneGrad)"/>
    <rect x="480" y="240" width="30" height="280" fill="url(#stoneGrad)"/>
    <rect x="540" y="240" width="30" height="280" fill="url(#stoneGrad)"/>
    <rect x="630" y="240" width="30" height="280" fill="url(#stoneGrad)"/>
    <rect x="690" y="240" width="30" height="280" fill="url(#stoneGrad)"/>
    <rect x="750" y="240" width="30" height="280" fill="url(#stoneGrad)"/>
    
    <!-- Clock Tower / Cupola -->
    <rect x="560" y="80" width="80" height="90" fill="url(#stoneGrad)"/>
    <polygon points="600,20 540,80 660,80" fill="#143D30"/>
    <circle cx="600" cy="125" r="22" fill="#FAF8F4" stroke="#143D30" stroke-width="4"/>
    <line x1="600" y1="125" x2="600" y2="112" stroke="#143D30" stroke-width="3"/>
    <line x1="600" y1="125" x2="612" y2="125" stroke="#143D30" stroke-width="2"/>
    <rect x="597" y="10" width="6" height="20" fill="#C8A24D"/>

    <!-- Windows Left Wing -->
    <g fill="#1F3540" opacity="0.9">
      <rect x="150" y="320" width="35" height="55" rx="15"/>
      <rect x="215" y="320" width="35" height="55" rx="15"/>
      <rect x="280" y="320" width="35" height="55" rx="15"/>
      <rect x="150" y="410" width="35" height="60"/>
      <rect x="215" y="410" width="35" height="60"/>
      <rect x="280" y="410" width="35" height="60"/>
    </g>
    <!-- Windows Right Wing -->
    <g fill="#1F3540" opacity="0.9">
      <rect x="885" y="320" width="35" height="55" rx="15"/>
      <rect x="950" y="320" width="35" height="55" rx="15"/>
      <rect x="1015" y="320" width="35" height="55" rx="15"/>
      <rect x="885" y="410" width="35" height="60"/>
      <rect x="950" y="410" width="35" height="60"/>
      <rect x="1015" y="410" width="35" height="60"/>
    </g>

    <!-- Main Grand Lawn & Boulevard -->
    <rect x="0" y="520" width="1200" height="280" fill="url(#grassGrad)"/>
    <!-- Central Paved Walkway -->
    <polygon points="560,520 640,520 780,800 420,800" fill="#DFD9C8"/>
    <!-- Fountain in foreground -->
    <ellipse cx="600" cy="650" rx="90" ry="30" fill="#C5BC9F" stroke="#FAF8F4" stroke-width="4"/>
    <ellipse cx="600" cy="650" rx="75" ry="22" fill="#58A2B0"/>
    
    <!-- Trees on Lawn -->
    <circle cx="80" cy="530" r="70" fill="#22552B"/>
    <circle cx="1120" cy="530" r="70" fill="#22552B"/>
    <circle cx="200" cy="560" r="50" fill="#2B6B37"/>
    <circle cx="1000" cy="560" r="50" fill="#2B6B37"/>

    <!-- Crest Badge in Sky (Subtle Watermark) -->
    <g opacity="0.85" transform="translate(60, 50)">
      <circle cx="45" cy="45" r="40" fill="#143D30" stroke="#C8A24D" stroke-width="3"/>
      <text x="45" y="52" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#C8A24D" text-anchor="middle">O</text>
    </g>
  </svg>
  `;
  await saveImages(heroCampus, OAKFIELD_DIR, 'hero-campus');

  // 2. Smart Classroom
  const smartClassroom = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="roomWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#E8E2D2"/>
        <stop offset="100%" stop-color="#DDD5C2"/>
      </linearGradient>
      <linearGradient id="smartBoardGlow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0F2E24"/>
        <stop offset="100%" stop-color="#184939"/>
      </linearGradient>
    </defs>
    <!-- Room Background -->
    <rect width="1200" height="520" fill="url(#roomWall)"/>
    <rect x="0" y="520" width="1200" height="280" fill="#B38A5A"/> <!-- Wood Parquet Floor -->
    
    <!-- Large Windows with Sunlight -->
    <rect x="50" y="80" width="220" height="360" fill="#EAF5FD" stroke="#C5BCA8" stroke-width="12"/>
    <line x1="160" y1="80" x2="160" y2="440" stroke="#C5BCA8" stroke-width="8"/>
    <line x1="50" y1="260" x2="270" y2="260" stroke="#C5BCA8" stroke-width="8"/>
    <!-- Sunlight Cast -->
    <polygon points="50,440 270,440 500,750 150,750" fill="#FFFDF0" opacity="0.3"/>

    <!-- Central Interactive Smart Display -->
    <rect x="360" y="70" width="580" height="340" rx="10" fill="#1A1C1B" stroke="#686E6B" stroke-width="10"/>
    <rect x="375" y="85" width="550" height="310" rx="6" fill="url(#smartBoardGlow)"/>
    
    <!-- Content on Smart Board -->
    <text x="410" y="140" font-family="'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="bold" fill="#FAF8F4">CBSE Science &amp; Innovation: DNA Molecular Architecture</text>
    <line x1="410" y1="160" x2="900" y2="160" stroke="#C8A24D" stroke-width="3"/>
    
    <!-- Graphic Diagram on board -->
    <g transform="translate(420, 190)">
      <path d="M 0 50 Q 50 10 100 50 T 200 50 T 300 50 T 400 50" fill="none" stroke="#4ADE80" stroke-width="5"/>
      <path d="M 0 50 Q 50 90 100 50 T 200 50 T 300 50 T 400 50" fill="none" stroke="#60A5FA" stroke-width="5"/>
      <line x1="50" y1="30" x2="50" y2="70" stroke="#FAF8F4" stroke-width="2"/>
      <line x1="150" y1="30" x2="150" y2="70" stroke="#FAF8F4" stroke-width="2"/>
      <line x1="250" y1="30" x2="250" y2="70" stroke="#FAF8F4" stroke-width="2"/>
      <line x1="350" y1="30" x2="350" y2="70" stroke="#FAF8F4" stroke-width="2"/>
    </g>
    <text x="420" y="330" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" fill="#D4AF37">Class X · Biology Division · Interactive Model 2026</text>

    <!-- Teacher Podium -->
    <rect x="990" y="280" width="130" height="240" fill="#754728" stroke="#5E381F" stroke-width="4"/>
    
    <!-- Student Desks in Foreground -->
    <g transform="translate(100, 520)">
      <rect x="80" y="40" width="280" height="90" rx="8" fill="#EFE8D6" stroke="#9C8972" stroke-width="4"/>
      <rect x="520" y="40" width="280" height="90" rx="8" fill="#EFE8D6" stroke="#9C8972" stroke-width="4"/>
      <rect x="180" y="180" width="340" height="100" rx="8" fill="#EFE8D6" stroke="#9C8972" stroke-width="4"/>
    </g>
  </svg>
  `;
  await saveImages(smartClassroom, OAKFIELD_DIR, 'smart-classroom');

  // 3. STEM Robotics Lab
  const stemLab = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="labBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#151C22"/>
        <stop offset="100%" stop-color="#0E1216"/>
      </linearGradient>
      <linearGradient id="neonCyan" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#00F2FE"/>
        <stop offset="100%" stop-color="#4FACFE"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#labBg)"/>
    <!-- High Tech Wall Panels -->
    <rect x="50" y="50" width="1100" height="380" rx="12" fill="#1C242C" stroke="#2C3B49" stroke-width="3"/>
    
    <!-- Futuristic Display -->
    <text x="100" y="110" font-family="'Segoe UI', monospace" font-size="24" fill="#00F2FE">OAKFIELD ADVANCED ROBOTICS &amp; AI INNOVATION LAB</text>
    <line x1="100" y1="130" x2="1100" y2="130" stroke="#00F2FE" stroke-width="2" opacity="0.6"/>
    
    <!-- Robotic Arm Silhouette & Blueprint -->
    <g transform="translate(180, 160)">
      <circle cx="100" cy="200" r="40" fill="#2E3C4A" stroke="#00F2FE" stroke-width="3"/>
      <line x1="100" y1="200" x2="180" y2="100" stroke="#4FACFE" stroke-width="12" stroke-linecap="round"/>
      <circle cx="180" cy="100" r="25" fill="#2E3C4A" stroke="#00F2FE" stroke-width="3"/>
      <line x1="180" y1="100" x2="300" y2="150" stroke="#4FACFE" stroke-width="10" stroke-linecap="round"/>
      <circle cx="300" cy="150" r="20" fill="#2E3C4A" stroke="#00F2FE" stroke-width="3"/>
      <!-- End Effector Gripper -->
      <path d="M 300 150 L 340 130 L 360 145 M 300 150 L 340 170 L 360 155" fill="none" stroke="#C8A24D" stroke-width="6" stroke-linecap="round"/>
    </g>

    <!-- Lab Workbench -->
    <rect x="0" y="480" width="1200" height="320" fill="#182026"/>
    <rect x="0" y="480" width="1200" height="24" fill="#3A4D5E"/>
    
    <!-- Equipment on Bench -->
    <!-- 3D Printer -->
    <rect x="700" y="320" width="220" height="220" rx="8" fill="#222B33" stroke="#4FACFE" stroke-width="3"/>
    <rect x="720" y="340" width="180" height="150" fill="#0B0E11"/>
    <line x1="730" y1="410" x2="890" y2="410" stroke="#FF5722" stroke-width="4"/>
    <circle cx="810" cy="410" r="6" fill="#00F2FE"/>
    <text x="810" y="520" font-family="monospace" font-size="14" fill="#889CAE" text-anchor="middle">3D PROTOTYPING STATION</text>

    <!-- Circuit Boards & Monitors -->
    <rect x="120" y="420" width="180" height="100" rx="6" fill="#1B4D3E" stroke="#2DE0A5" stroke-width="2"/>
    <text x="210" y="475" font-family="monospace" font-size="16" fill="#FAF8F4" text-anchor="middle">MICRO-CONTROLLER</text>
  </svg>
  `;
  await saveImages(stemLab, OAKFIELD_DIR, 'stem-robotics');

  // 4. Grand Library
  const library = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="woodRich" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#4A2511"/>
        <stop offset="100%" stop-color="#2D1508"/>
      </linearGradient>
      <linearGradient id="warmLight" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFF5DB"/>
        <stop offset="100%" stop-color="#EED9A5"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="#1C1814"/>
    <!-- Double Height Bookshelves (Background) -->
    <rect x="60" y="40" width="1080" height="480" fill="url(#woodRich)" stroke="#663A1E" stroke-width="8"/>
    
    <!-- Rows of Books in Multi-Colors -->
    ${[100, 200, 300, 400].map(y => `
      <rect x="80" y="${y + 70}" width="1040" height="14" fill="#663A1E"/>
      ${Array.from({ length: 45 }).map((_, i) => {
        const colors = ['#8C3A27', '#1E4522', '#1B3B6F', '#C8A24D', '#D97706', '#5B21B6', '#374151'];
        const col = colors[(i + Math.floor(y / 100)) % colors.length];
        const h = 45 + ((i * 7) % 20);
        return `<rect x="${95 + i * 23}" y="${y + 70 - h}" width="18" height="${h}" rx="2" fill="${col}"/>`;
      }).join('')}
    `).join('')}

    <!-- Reading Tables & Green Banker Lamps -->
    <rect x="0" y="540" width="1200" height="260" fill="#2E1C10"/>
    <g transform="translate(200, 560)">
      <rect x="0" y="30" width="360" height="100" rx="8" fill="#522C16" stroke="#6E3D21" stroke-width="4"/>
      <!-- Green Banker Lamp -->
      <rect x="170" y="0" width="20" height="30" fill="#C8A24D"/>
      <ellipse cx="180" cy="0" rx="30" ry="12" fill="#14532D" stroke="#C8A24D" stroke-width="2"/>
      <ellipse cx="180" cy="10" rx="40" ry="20" fill="url(#warmLight)" opacity="0.3"/>
    </g>
    <g transform="translate(640, 560)">
      <rect x="0" y="30" width="360" height="100" rx="8" fill="#522C16" stroke="#6E3D21" stroke-width="4"/>
      <rect x="170" y="0" width="20" height="30" fill="#C8A24D"/>
      <ellipse cx="180" cy="0" rx="30" ry="12" fill="#14532D" stroke="#C8A24D" stroke-width="2"/>
      <ellipse cx="180" cy="10" rx="40" ry="20" fill="url(#warmLight)" opacity="0.3"/>
    </g>
  </svg>
  `;
  await saveImages(library, OAKFIELD_DIR, 'school-library');

  // 5. Sports Complex & Athletic Ground
  const sports = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="trackGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#C2410C"/>
        <stop offset="100%" stop-color="#9A3412"/>
      </linearGradient>
    </defs>
    <!-- Sky -->
    <rect width="1200" height="400" fill="#7DD3FC"/>
    <!-- Distant Pavilion -->
    <rect x="150" y="240" width="900" height="120" fill="#FAF8F4" stroke="#CBD5E1" stroke-width="4"/>
    <polygon points="600,180 120,240 1080,240" fill="#143D30"/>
    <text x="600" y="290" font-family="'Segoe UI', sans-serif" font-size="28" font-weight="bold" fill="#143D30" text-anchor="middle">OAKFIELD SPORTS PAVILION</text>

    <!-- Synthetic Running Track -->
    <ellipse cx="600" cy="650" rx="580" ry="260" fill="url(#trackGrad)"/>
    <ellipse cx="600" cy="650" rx="550" ry="240" fill="none" stroke="#FAF8F4" stroke-width="4"/>
    <ellipse cx="600" cy="650" rx="520" ry="220" fill="none" stroke="#FAF8F4" stroke-width="4"/>
    <ellipse cx="600" cy="650" rx="490" ry="200" fill="none" stroke="#FAF8F4" stroke-width="4"/>
    <!-- Green Football Field In Center -->
    <ellipse cx="600" cy="650" rx="460" ry="180" fill="#15803D"/>
    <!-- Field Goal Posts -->
    <line x1="280" y1="580" x2="280" y2="520" stroke="#FAF8F4" stroke-width="5"/>
    <line x1="280" y1="550" x2="240" y2="550" stroke="#FAF8F4" stroke-width="5"/>
    <line x1="240" y1="550" x2="240" y2="580" stroke="#FAF8F4" stroke-width="5"/>
    
    <line x1="920" y1="580" x2="920" y2="520" stroke="#FAF8F4" stroke-width="5"/>
    <line x1="920" y1="550" x2="960" y2="550" stroke="#FAF8F4" stroke-width="5"/>
    <line x1="960" y1="550" x2="960" y2="580" stroke="#FAF8F4" stroke-width="5"/>
  </svg>
  `;
  await saveImages(sports, OAKFIELD_DIR, 'sports-ground');

  // 6. Principal Portrait / Desk
  const principal = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="officeWall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2D3A34"/>
        <stop offset="100%" stop-color="#19241F"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#officeWall)"/>
    <!-- Bookshelf & Certificates on wall -->
    <rect x="80" y="80" width="450" height="320" fill="#3D4D45" rx="8" stroke="#C8A24D" stroke-width="3"/>
    <text x="305" y="140" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#C8A24D" text-anchor="middle">DR. GAYATRI SUNDARAM</text>
    <text x="305" y="175" font-family="'Segoe UI', sans-serif" font-size="16" fill="#FAF8F4" text-anchor="middle">Ph.D. in Education · M.Sc. · B.Ed.</text>
    <text x="305" y="210" font-family="'Segoe UI', sans-serif" font-size="15" fill="#A7B7AF" text-anchor="middle">Principal &amp; Academic Director</text>
    <line x1="140" y1="240" x2="470" y2="240" stroke="#C8A24D" stroke-width="2"/>
    <text x="305" y="280" font-family="Georgia, serif" font-style="italic" font-size="16" fill="#E2ECE6" text-anchor="middle">&#8220;Education is the cultivation of character, intellect, and empathy.&#8221;</text>

    <!-- Principal Figure Profile Silhouette -->
    <g transform="translate(680, 160)">
      <!-- Oval Portrait Frame -->
      <ellipse cx="220" cy="240" rx="190" ry="240" fill="#143D30" stroke="#C8A24D" stroke-width="8"/>
      <!-- Academic Stole / Saree Silhouette -->
      <path d="M 120 450 Q 220 330 320 450 Z" fill="#8C3A27"/>
      <path d="M 170 380 Q 220 340 270 380 L 250 480 L 190 480 Z" fill="#C8A24D"/>
      <!-- Head / Hair -->
      <circle cx="220" cy="240" r="75" fill="#D9A87E"/>
      <path d="M 145 220 Q 220 140 295 220 Q 280 180 220 170 Q 160 180 145 220 Z" fill="#1A1A1A"/>
      <!-- Glasses -->
      <rect x="185" y="225" width="28" height="18" rx="4" fill="none" stroke="#C8A24D" stroke-width="3"/>
      <rect x="227" y="225" width="28" height="18" rx="4" fill="none" stroke="#C8A24D" stroke-width="3"/>
      <line x1="213" y1="234" x2="227" y2="234" stroke="#C8A24D" stroke-width="3"/>
    </g>

    <!-- Executive Teak Desk in Foreground -->
    <rect x="0" y="580" width="1200" height="220" fill="#422513"/>
    <rect x="0" y="580" width="1200" height="20" fill="#693B1F"/>
    <!-- Brass Desk Nameplate -->
    <polygon points="480,620 720,620 740,670 460,670" fill="#C8A24D"/>
    <text x="600" y="652" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#143D30" text-anchor="middle">DR. GAYATRI SUNDARAM</text>
  </svg>
  `;
  await saveImages(principal, OAKFIELD_DIR, 'principal-desk');
}

async function generateSolaraAssets() {
  console.log('Generating Solara Retreat & Resort assets...');

  // 1. Hero Resort (Atmospheric Nature Sanctuary)
  const heroResort = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="solaraDawn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#C98B5E"/>
        <stop offset="35%" stop-color="#E8C39E"/>
        <stop offset="70%" stop-color="#F5EFEB"/>
        <stop offset="100%" stop-color="#EDE7DC"/>
      </linearGradient>
      <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#3B4F3D"/>
        <stop offset="100%" stop-color="#1F2E23"/>
      </linearGradient>
    </defs>
    <!-- Dawn Sky -->
    <rect width="1200" height="500" fill="url(#solaraDawn)"/>
    <!-- Mist Sun -->
    <circle cx="600" cy="240" r="110" fill="#FFF7ED" opacity="0.6"/>
    
    <!-- Distant Mountains -->
    <path d="M 0 380 Q 250 220 500 320 T 1000 260 T 1200 340 L 1200 500 L 0 500 Z" fill="#607663" opacity="0.5"/>
    <path d="M 0 420 Q 300 290 650 380 T 1200 320 L 1200 560 L 0 560 Z" fill="url(#hill1)" opacity="0.8"/>
    
    <!-- Morning Valley Mist Layer -->
    <rect x="0" y="440" width="1200" height="80" fill="#FAF8F5" opacity="0.6"/>

    <!-- Luxury Resort Eco Pavilions -->
    <g transform="translate(200, 380)">
      <!-- Pavilion 1 (Teakwood & Glass) -->
      <polygon points="120,40 20,90 220,90" fill="#4A3423"/>
      <rect x="40" y="90" width="160" height="90" fill="#EDE4D6" stroke="#2B1D14" stroke-width="3"/>
      <rect x="60" y="105" width="45" height="75" fill="#FFE8C2" opacity="0.8"/>
      <rect x="135" y="105" width="45" height="75" fill="#FFE8C2" opacity="0.8"/>
      <!-- Stilt Pillars -->
      <line x1="45" y1="180" x2="45" y2="230" stroke="#382519" stroke-width="6"/>
      <line x1="195" y1="180" x2="195" y2="230" stroke="#382519" stroke-width="6"/>
    </g>
    <g transform="translate(680, 360)">
      <!-- Pavilion 2 -->
      <polygon points="150,30 30,85 270,85" fill="#4A3423"/>
      <rect x="50" y="85" width="200" height="100" fill="#EDE4D6" stroke="#2B1D14" stroke-width="3"/>
      <rect x="75" y="100" width="60" height="85" fill="#FFE8C2" opacity="0.8"/>
      <rect x="165" y="100" width="60" height="85" fill="#FFE8C2" opacity="0.8"/>
      <line x1="60" y1="185" x2="60" y2="245" stroke="#382519" stroke-width="6"/>
      <line x1="240" y1="185" x2="240" y2="245" stroke="#382519" stroke-width="6"/>
    </g>

    <!-- Foreground Infinity Reflection Water Pool -->
    <polygon points="0,560 1200,560 1200,800 0,800" fill="#2C4A42"/>
    <!-- Water Horizon Reflection -->
    <rect x="0" y="560" width="1200" height="6" fill="#B57A42"/>
    <!-- Soft Water Ripples -->
    <ellipse cx="600" cy="680" rx="400" ry="20" fill="none" stroke="#48786C" stroke-width="2" opacity="0.7"/>
    <ellipse cx="600" cy="720" rx="550" ry="25" fill="none" stroke="#48786C" stroke-width="2" opacity="0.5"/>

    <!-- Stone Sunloungers on Pool Deck -->
    <rect x="60" y="660" width="140" height="35" rx="6" fill="#D9CCA3" stroke="#8A764A" stroke-width="3"/>
    <rect x="1000" y="660" width="140" height="35" rx="6" fill="#D9CCA3" stroke="#8A764A" stroke-width="3"/>
  </svg>
  `;
  await saveImages(heroResort, SOLARA_DIR, 'hero-resort');

  // 2. Forest Villa with Private Plunge Pool
  const villaPool = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="poolWater" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#14B8A6"/>
        <stop offset="100%" stop-color="#0F766E"/>
      </linearGradient>
    </defs>
    <!-- Background Forest Trees -->
    <rect width="1200" height="420" fill="#1B3322"/>
    <circle cx="200" cy="220" r="160" fill="#2A4D33"/>
    <circle cx="500" cy="180" r="190" fill="#24442D"/>
    <circle cx="850" cy="220" r="170" fill="#2A4D33"/>
    <circle cx="1100" cy="190" r="180" fill="#1E3825"/>

    <!-- Villa Wooden Deck & Glass Sliding Doors -->
    <rect x="150" y="160" width="900" height="260" fill="#3D291D" stroke="#5E402D" stroke-width="6"/>
    <!-- Warm Light Inside Villa -->
    <rect x="200" y="180" width="380" height="220" fill="#FFF3D6" opacity="0.9"/>
    <rect x="620" y="180" width="380" height="220" fill="#FFF3D6" opacity="0.9"/>
    <!-- Teak Interior Furniture Silhouette -->
    <rect x="250" y="300" width="160" height="80" rx="8" fill="#5E381F"/>
    
    <!-- Private Heated Plunge Pool -->
    <polygon points="250,420 950,420 1080,720 120,720" fill="url(#poolWater)" stroke="#C48B56" stroke-width="8"/>
    <!-- Pool Steps -->
    <rect x="350" y="440" width="500" height="20" fill="#2DD4BF" opacity="0.6"/>
    <rect x="320" y="480" width="560" height="25" fill="#14B8A6" opacity="0.7"/>
    
    <!-- Stone Deck Border in Foreground -->
    <rect x="0" y="720" width="1200" height="80" fill="#CBBDA4"/>
  </svg>
  `;
  await saveImages(villaPool, SOLARA_DIR, 'villa-plunge-pool');

  // 3. Canopy Valley Suite
  const canopySuite = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#261A14"/>
    <!-- Panoramic Glass Wall Looking at Misty Mountains -->
    <rect x="100" y="60" width="1000" height="460" rx="8" fill="#E8D9C5" stroke="#7A563D" stroke-width="12"/>
    <!-- Mountain Silhouette outside -->
    <path d="M 110 380 Q 400 180 700 320 T 1090 280 L 1090 510 L 110 510 Z" fill="#4B6350"/>
    
    <!-- King Sized Teak Canopy Bed -->
    <g transform="translate(360, 340)">
      <!-- Headboard -->
      <rect x="40" y="40" width="400" height="180" fill="#593922" stroke="#7D5130" stroke-width="6"/>
      <!-- Soft White Pillows & Linen -->
      <rect x="60" y="100" width="160" height="70" rx="12" fill="#FAF8F5"/>
      <rect x="260" y="100" width="160" height="70" rx="12" fill="#FAF8F5"/>
      <rect x="50" y="150" width="380" height="180" fill="#F4EFE6" stroke="#D1C4B0" stroke-width="3"/>
      <!-- Bronze Bedside Lamps -->
      <circle cx="0" cy="120" r="18" fill="#C48B56"/>
      <circle cx="480" cy="120" r="18" fill="#C48B56"/>
    </g>

    <!-- Parquet Wood Flooring -->
    <rect x="0" y="520" width="1200" height="280" fill="#382115"/>
  </svg>
  `;
  await saveImages(canopySuite, SOLARA_DIR, 'canopy-suite');

  // 4. Farm-to-Table Organic Dining
  const dining = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#1C1814"/>
    <!-- Warm Ambient Restaurant Interior -->
    <rect x="80" y="60" width="1040" height="420" rx="12" fill="#2E241B" stroke="#B57A42" stroke-width="4"/>
    
    <!-- Hanging Woven Rattan Lanterns -->
    ${[250, 480, 720, 950].map(x => `
      <line x1="${x}" y1="60" x2="${x}" y2="180" stroke="#8C6647" stroke-width="3"/>
      <ellipse cx="${x}" cy="200" rx="35" ry="25" fill="#D99B5B" stroke="#8C6647" stroke-width="3"/>
      <circle cx="${x}" cy="200" r="12" fill="#FFFBEB"/>
      <!-- Glow -->
      <circle cx="${x}" cy="200" r="80" fill="#F59E0B" opacity="0.15"/>
    `).join('')}

    <!-- Long Rustic Solid Teak Table -->
    <rect x="150" y="500" width="900" height="200" rx="12" fill="#54331C" stroke="#7A4C2A" stroke-width="6"/>
    <!-- Table Runner & Ceramic Dinnerware -->
    <rect x="180" y="540" width="840" height="70" fill="#EAE2D5"/>
    ${[260, 440, 620, 800, 940].map(x => `
      <circle cx="${x}" cy="575" r="24" fill="#FAF8F5" stroke="#B8A892" stroke-width="2"/>
      <circle cx="${x}" cy="575" r="16" fill="#E5D9C5"/>
      <line x1="${x - 34}" y1="555" x2="${x - 34}" y2="595" stroke="#C48B56" stroke-width="3"/>
      <line x1="${x + 34}" y1="555" x2="${x + 34}" y2="595" stroke="#C48B56" stroke-width="3"/>
    `).join('')}
  </svg>
  `;
  await saveImages(dining, SOLARA_DIR, 'harvest-dining');

  // 5. Ayurvedic Spa & Wellness Sanctuary
  const spa = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="spaCandle" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FDE68A"/>
        <stop offset="100%" stop-color="#D97706"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="#18231C"/>
    <!-- Bamboo Wall Texture in background -->
    <rect x="60" y="60" width="1080" height="440" fill="#2C3B30" stroke="#485E4F" stroke-width="6"/>
    
    <!-- Stone Lotus Basin with Floating Flowers -->
    <ellipse cx="600" cy="580" rx="360" ry="140" fill="#4B5563" stroke="#9CA3AF" stroke-width="8"/>
    <ellipse cx="600" cy="580" rx="330" ry="115" fill="#0D9488"/>
    <!-- Floating Lotus Flowers -->
    ${[
      { x: 500, y: 560, r: 28, c: '#F472B6' },
      { x: 680, y: 550, r: 32, c: '#FB7185' },
      { x: 600, y: 610, r: 30, c: '#FDA4AF' },
      { x: 420, y: 590, r: 24, c: '#F43F5E' },
      { x: 760, y: 590, r: 26, c: '#FB7185' },
    ].map(f => `
      <circle cx="${f.x}" cy="${f.y}" r="${f.r}" fill="${f.c}"/>
      <circle cx="${f.x}" cy="${f.y}" r="${f.r * 0.4}" fill="#FEF08A"/>
    `).join('')}

    <!-- Brass Ayurvedic Oil Urn Suspended Above -->
    <path d="M 600 120 L 600 320" stroke="#C48B56" stroke-width="6"/>
    <path d="M 540 320 Q 600 420 660 320 Z" fill="#B57A42" stroke="#8C5C2E" stroke-width="4"/>
    <circle cx="600" cy="425" r="4" fill="#FDE68A"/>

    <!-- Calming Scented Candle Urns -->
    <g transform="translate(140, 560)">
      <rect x="0" y="40" width="60" height="80" rx="6" fill="#374151"/>
      <ellipse cx="30" cy="30" rx="10" ry="18" fill="url(#spaCandle)"/>
    </g>
    <g transform="translate(1000, 560)">
      <rect x="0" y="40" width="60" height="80" rx="6" fill="#374151"/>
      <ellipse cx="30" cy="30" rx="10" ry="18" fill="url(#spaCandle)"/>
    </g>
  </svg>
  `;
  await saveImages(spa, SOLARA_DIR, 'ayurvedic-spa');

  // 6. Stargazing Observatory
  const stargazing = `
  <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
    <!-- Deep Night Sky -->
    <rect width="1200" height="800" fill="#070A12"/>
    
    <!-- Stars & Constellations -->
    ${Array.from({ length: 180 }).map((_, i) => {
      const x = (i * 73) % 1200;
      const y = (i * 97) % 520;
      const r = (i % 5 === 0) ? 2.5 : ((i % 2 === 0) ? 1.5 : 0.8);
      const op = 0.4 + ((i * 13) % 60) / 100;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#FAF8F5" opacity="${op}"/>`;
    }).join('')}
    
    <!-- Milky Way Nebula Glow -->
    <path d="M 0 100 Q 400 300 800 150 T 1200 300" fill="none" stroke="#6366F1" stroke-width="120" opacity="0.12"/>
    <path d="M 0 120 Q 500 280 900 180 T 1200 250" fill="none" stroke="#EC4899" stroke-width="80" opacity="0.08"/>

    <!-- Silhouetted Mountain Crest -->
    <polygon points="0,520 250,420 550,490 850,390 1200,480 1200,800 0,800" fill="#0C101A"/>

    <!-- Stargazing Observatory Deck & Telescope -->
    <rect x="250" y="540" width="700" height="260" fill="#151A24" stroke="#252D3D" stroke-width="4"/>
    <!-- Telescope Mounted on Tripod -->
    <g transform="translate(600, 520)">
      <!-- Tripod legs -->
      <line x1="0" y1="0" x2="-60" y2="120" stroke="#C48B56" stroke-width="6"/>
      <line x1="0" y1="0" x2="60" y2="120" stroke="#C48B56" stroke-width="6"/>
      <line x1="0" y1="0" x2="0" y2="130" stroke="#A67342" stroke-width="6"/>
      <!-- Mount -->
      <circle cx="0" cy="0" r="14" fill="#374151"/>
      <!-- Telescope Tube pointing towards sky (35 deg tilt) -->
      <rect x="-80" y="-35" width="220" height="30" rx="8" fill="#E2E8F0" stroke="#94A3B8" stroke-width="3" transform="rotate(-35)"/>
      <circle cx="-60" cy="35" r="12" fill="#38BDF8"/>
    </g>
  </svg>
  `;
  await saveImages(stargazing, SOLARA_DIR, 'stargazing-deck');
}

async function run() {
  try {
    await generateOakfieldAssets();
    await generateSolaraAssets();
    console.log('\nAll demo assets generated successfully in WebP and JPEG formats!');
  } catch (err) {
    console.error('Error generating assets:', err);
  }
}

run();
