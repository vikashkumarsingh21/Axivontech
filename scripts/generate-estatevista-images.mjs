import fs from "fs";
import path from "path";

const targetDir = path.resolve("public/images/demo-projects/estatevista");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Helper to create an architectural SVG
function createSvg(width = 800, height = 500, content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Gradients & Filters -->
    <linearGradient id="skyDusk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#152B24"/>
      <stop offset="45%" stop-color="#2D4D41"/>
      <stop offset="75%" stop-color="#877558"/>
      <stop offset="100%" stop-color="#CBB58F"/>
    </linearGradient>
    <linearGradient id="skyTribeca" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0E1B18"/>
      <stop offset="50%" stop-color="#1A332B"/>
      <stop offset="100%" stop-color="#544B3D"/>
    </linearGradient>
    <linearGradient id="skyCoastal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#112922"/>
      <stop offset="60%" stop-color="#214D40"/>
      <stop offset="85%" stop-color="#5C7A6D"/>
      <stop offset="100%" stop-color="#D9CBB0"/>
    </linearGradient>
    <linearGradient id="skyAspen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0D1815"/>
      <stop offset="50%" stop-color="#1C382F"/>
      <stop offset="80%" stop-color="#3D594E"/>
      <stop offset="100%" stop-color="#B0C2B9"/>
    </linearGradient>

    <linearGradient id="travertine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FAF8F2"/>
      <stop offset="50%" stop-color="#EFEAE0"/>
      <stop offset="100%" stop-color="#DFD7C7"/>
    </linearGradient>
    <linearGradient id="darkStone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#26302B"/>
      <stop offset="100%" stop-color="#141C18"/>
    </linearGradient>
    <linearGradient id="warmGlass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFECC7" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#E5BE7E" stop-opacity="0.95"/>
    </linearGradient>
    <linearGradient id="coolGlass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#8BB3A4" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#557B6E" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="#1E3E34" stop-opacity="0.7"/>
    </linearGradient>
    <linearGradient id="poolWater" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1C4E43"/>
      <stop offset="50%" stop-color="#12382F"/>
      <stop offset="100%" stop-color="#0A221C"/>
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0A1411" flood-opacity="0.5"/>
    </filter>
  </defs>

  ${content}

  <!-- EstateVista Architectural Monogram & Watermark -->
  <g opacity="0.4" transform="translate(730, 460)">
    <circle cx="20" cy="20" r="14" fill="none" stroke="#FAF8F2" stroke-width="1.2"/>
    <text x="20" y="24" font-family="'DM Serif Display', Georgia, serif" font-size="11" fill="#FAF8F2" text-anchor="middle" font-weight="bold">EV</text>
  </g>
</svg>`;
}

// 1. HERO VILLA & PROP-1 EXTERIOR (The Glass Pavilion Villa)
const prop1Exterior = createSvg(800, 500, `
  <!-- Sky -->
  <rect width="800" height="500" fill="url(#skyDusk)"/>

  <!-- Distant Hillside Ridges -->
  <path d="M0 290 Q 200 240 450 270 T 800 250 L 800 500 L 0 500 Z" fill="#1B3028" opacity="0.9"/>
  <path d="M0 310 Q 280 280 520 300 T 800 280 L 800 500 L 0 500 Z" fill="#13231D"/>

  <!-- Villa Structure: Cantilevered Pavilion -->
  <!-- Lower Stone Foundation -->
  <polygon points="120,320 680,320 660,420 140,420" fill="url(#darkStone)" filter="url(#softShadow)"/>

  <!-- Cantilevered Upper Terrace Slab -->
  <polygon points="80,240 720,240 740,256 60,256" fill="url(#travertine)" filter="url(#softShadow)"/>

  <!-- Roof Slab Cantilever -->
  <polygon points="100,140 700,140 710,152 90,152" fill="url(#travertine)" filter="url(#softShadow)"/>

  <!-- Glass Pavilion Interior (Glowing warm light) -->
  <rect x="130" y="152" width="550" height="88" fill="url(#warmGlass)" filter="url(#glow)"/>
  
  <!-- Architectural Mullions / Columns -->
  <rect x="130" y="152" width="6" height="88" fill="#15201B"/>
  <rect x="220" y="152" width="4" height="88" fill="#15201B"/>
  <rect x="310" y="152" width="4" height="88" fill="#15201B"/>
  <rect x="400" y="152" width="5" height="88" fill="#15201B"/>
  <rect x="490" y="152" width="4" height="88" fill="#15201B"/>
  <rect x="580" y="152" width="4" height="88" fill="#15201B"/>
  <rect x="674" y="152" width="6" height="88" fill="#15201B"/>

  <!-- Interior Silhouettes (Linear chandelier & staircase) -->
  <line x1="200" y1="175" x2="330" y2="175" stroke="#FAF8F2" stroke-width="2" filter="url(#glow)"/>
  <circle cx="265" cy="175" r="3" fill="#FFF"/>
  <polygon points="500,240 560,180 570,180 510,240" fill="#2B3631" opacity="0.8"/>

  <!-- Teak Infinity Terrace & Glass Railing -->
  <rect x="80" y="256" width="640" height="64" fill="#C49A62" opacity="0.3"/>
  <rect x="80" y="244" width="640" height="12" fill="url(#coolGlass)"/>

  <!-- Infinity Edge Reflection Pool -->
  <polygon points="160,370 640,370 680,480 120,480" fill="url(#poolWater)"/>
  <polygon points="165,372 635,372 675,475 125,475" fill="none" stroke="#3D7A6C" stroke-width="1.5" opacity="0.6"/>

  <!-- Pool Water Shimmer Reflections -->
  <ellipse cx="400" cy="410" rx="140" ry="8" fill="#B89A63" opacity="0.3" filter="url(#glow)"/>
  <ellipse cx="380" cy="440" rx="100" ry="6" fill="#388A77" opacity="0.4"/>

  <!-- Architectural Landscaping: Sculptural Cypress & Agave -->
  <path d="M 680 320 Q 690 220 700 160 Q 710 220 720 320 Z" fill="#0D1814"/>
  <path d="M 720 330 Q 730 250 738 190 Q 746 250 756 330 Z" fill="#09120F"/>
  <path d="M 80 340 Q 90 240 98 180 Q 106 240 116 340 Z" fill="#0D1814"/>

  <!-- Subtle Landscape Lighting Pins -->
  <circle cx="150" cy="365" r="3" fill="#FFE2A3" filter="url(#glow)"/>
  <circle cx="650" cy="365" r="3" fill="#FFE2A3" filter="url(#glow)"/>
`);

// 2. HERO LUXURY CENTERPIECE (Dedicated high-res hero visual asset)
const heroVilla = prop1Exterior;

// 3. PROP-1 LIVING (Grand Salon with Travertine)
const prop1Living = createSvg(800, 500, `
  <rect width="800" height="500" fill="#1C2621"/>
  <!-- Travertine Floor with Perspective Lines -->
  <polygon points="0,320 800,320 800,500 0,500" fill="url(#travertine)"/>
  <line x1="100" y1="500" x2="300" y2="320" stroke="#C5BCAE" stroke-width="1"/>
  <line x1="280" y1="500" x2="380" y2="320" stroke="#C5BCAE" stroke-width="1"/>
  <line x1="520" y1="500" x2="420" y2="320" stroke="#C5BCAE" stroke-width="1"/>
  <line x1="700" y1="500" x2="500" y2="320" stroke="#C5BCAE" stroke-width="1"/>

  <!-- Back Floor-to-Ceiling Windows Looking at Valley -->
  <rect x="60" y="40" width="680" height="280" fill="url(#skyDusk)"/>
  <path d="M60 220 Q 300 180 500 200 T 740 190 L 740 320 L 60 320 Z" fill="#11221B"/>

  <!-- Window Framing Structure -->
  <rect x="60" y="40" width="680" height="280" fill="none" stroke="#15241E" stroke-width="8"/>
  <line x1="230" y1="40" x2="230" y2="320" stroke="#15241E" stroke-width="4"/>
  <line x1="400" y1="40" x2="400" y2="320" stroke="#15241E" stroke-width="6"/>
  <line x1="570" y1="40" x2="570" y2="320" stroke="#15241E" stroke-width="4"/>

  <!-- Floating Travertine Linear Fireplace -->
  <rect x="240" y="270" width="320" height="40" fill="url(#darkStone)" filter="url(#softShadow)"/>
  <rect x="280" y="280" width="240" height="12" fill="#E89B48" filter="url(#glow)"/>
  <line x1="290" y1="285" x2="510" y2="285" stroke="#FFF" stroke-width="2" filter="url(#glow)"/>

  <!-- Designer Minimalist Living Lounge Furniture -->
  <!-- Low Profile Charcoal Sectional -->
  <polygon points="120,440 340,440 330,380 140,380" fill="#2E3934" filter="url(#softShadow)"/>
  <polygon points="340,440 460,440 445,395 330,395" fill="#26312C"/>
  <!-- Sculptural Marble Coffee Table -->
  <ellipse cx="440" cy="450" rx="70" ry="24" fill="#FAF8F2" filter="url(#softShadow)"/>
  <!-- Minimalist Brass Floor Arc Lamp -->
  <path d="M 660 440 Q 640 220 540 200" fill="none" stroke="#B89A63" stroke-width="2.5"/>
  <circle cx="540" cy="205" r="8" fill="#FFF2D6" filter="url(#glow)"/>
`);

// 4. PROP-1 POOL (75ft Infinity Pool at Twilight)
const prop1Pool = createSvg(800, 500, `
  <rect width="800" height="500" fill="url(#skyDusk)"/>
  <!-- Mountain Horizon -->
  <path d="M0 260 Q 300 200 550 230 L 800 210 L 800 500 L 0 500 Z" fill="#13241D"/>

  <!-- Limestone Patio Slab -->
  <polygon points="0,320 800,320 800,500 0,500" fill="#DCD5C8"/>

  <!-- Infinity Pool Basin -->
  <polygon points="80,315 720,315 780,480 20,480" fill="url(#poolWater)"/>
  <polygon points="80,312 720,312 722,316 78,316" fill="#459E89" filter="url(#glow)"/>

  <!-- Sunken Fire Pit Lounge at Edge of Pool -->
  <circle cx="400" cy="420" r="45" fill="#1A2420" filter="url(#softShadow)"/>
  <circle cx="400" cy="420" r="32" fill="#0F1714"/>
  <circle cx="400" cy="420" r="14" fill="#FF8D3B" filter="url(#glow)"/>
  <circle cx="400" cy="420" r="7" fill="#FFE8B3"/>

  <!-- Loungers at Poolside -->
  <rect x="580" y="340" width="70" height="24" rx="3" fill="#FAF8F2" transform="rotate(-10 580 340)"/>
  <rect x="660" y="340" width="70" height="24" rx="3" fill="#FAF8F2" transform="rotate(-10 660 340)"/>
`);

// 5. PROP-1 MASTER (Primary Luxury Suite)
const prop1Master = createSvg(800, 500, `
  <rect width="800" height="500" fill="#17221D"/>
  <rect x="80" y="50" width="640" height="260" fill="url(#skyDusk)"/>
  <rect x="80" y="50" width="640" height="260" fill="none" stroke="#22362E" stroke-width="6"/>
  <line x1="400" y1="50" x2="400" y2="310" stroke="#22362E" stroke-width="4"/>

  <!-- Hardwood Floor -->
  <polygon points="0,310 800,310 800,500 0,500" fill="#3D3025"/>

  <!-- Low Platform Bed with Floating Nightstands -->
  <rect x="260" y="300" width="280" height="120" rx="4" fill="#FAF8F2" filter="url(#softShadow)"/>
  <rect x="290" y="270" width="220" height="40" rx="4" fill="#4A5650"/>
  <rect x="310" y="285" width="80" height="20" rx="3" fill="#FAF8F2"/>
  <rect x="410" y="285" width="80" height="20" rx="3" fill="#FAF8F2"/>

  <!-- Warm Pendants -->
  <line x1="220" y1="50" x2="220" y2="280" stroke="#B89A63" stroke-width="1.5"/>
  <circle cx="220" cy="285" r="9" fill="#FFE3A8" filter="url(#glow)"/>
  <line x1="580" y1="50" x2="580" y2="280" stroke="#B89A63" stroke-width="1.5"/>
  <circle cx="580" cy="285" r="9" fill="#FFE3A8" filter="url(#glow)"/>
`);

// 6. PROP-2 SKYLINE & PENTHOUSE (Tribeca Horizon Tower)
const prop2Skyline = createSvg(800, 500, `
  <rect width="800" height="500" fill="url(#skyTribeca)"/>

  <!-- Manhattan Tower Silhouettes -->
  <rect x="40" y="220" width="70" height="280" fill="#0C1714"/>
  <rect x="130" y="180" width="90" height="320" fill="#13241F"/>
  <rect x="240" y="240" width="60" height="260" fill="#0F1D18"/>
  <rect x="520" y="160" width="100" height="340" fill="#11221C"/>
  <rect x="640" y="200" width="120" height="300" fill="#0B1713"/>

  <!-- Centerpiece: Tribeca Glass Penthouse Crown -->
  <polygon points="320,80 480,80 500,500 300,500" fill="url(#coolGlass)" stroke="#274D3F" stroke-width="2"/>
  <polygon points="340,90 460,90 480,320 320,320" fill="url(#warmGlass)" opacity="0.85" filter="url(#glow)"/>

  <!-- Penthouse Wrap-around Cantilevered Balconies -->
  <rect x="290" y="160" width="220" height="8" fill="#FAF8F2"/>
  <rect x="290" y="240" width="220" height="8" fill="#FAF8F2"/>
  <rect x="290" y="320" width="220" height="8" fill="#FAF8F2"/>

  <!-- Glowing City Window Matrix -->
  <g fill="#FFE9BA" opacity="0.75" filter="url(#glow)">
    <rect x="360" y="110" width="12" height="18"/>
    <rect x="390" y="110" width="12" height="18"/>
    <rect x="420" y="110" width="12" height="18"/>
    <rect x="350" y="180" width="16" height="24"/>
    <rect x="380" y="180" width="16" height="24"/>
    <rect x="420" y="180" width="16" height="24"/>
  </g>
`);

// 7. PROP-2 INTERIOR & TERRACE
const prop2Interior = createSvg(800, 500, `
  <rect width="800" height="500" fill="#141E1A"/>
  <!-- Vast Tribeca Skyline View -->
  <rect x="40" y="30" width="720" height="300" fill="url(#skyTribeca)"/>
  <g fill="#0B1612" opacity="0.9">
    <rect x="80" y="160" width="40" height="170"/>
    <rect x="140" y="120" width="55" height="210"/>
    <rect x="220" y="180" width="35" height="150"/>
    <rect x="480" y="110" width="70" height="220"/>
    <rect x="580" y="140" width="80" height="190"/>
    <rect x="680" y="170" width="50" height="160"/>
  </g>

  <!-- Polished Concrete Gallery Floor -->
  <polygon points="0,330 800,330 800,500 0,500" fill="#2E3633"/>

  <!-- Architectural Floating Spiral Staircase -->
  <path d="M 620 500 Q 560 380 620 260 Q 680 140 620 30" fill="none" stroke="#FAF8F2" stroke-width="12" filter="url(#softShadow)"/>
  <path d="M 620 500 Q 560 380 620 260 Q 680 140 620 30" fill="none" stroke="#B89A63" stroke-width="2"/>

  <!-- Minimalist Seating and Art Pedestal -->
  <rect x="160" y="410" width="260" height="40" rx="6" fill="#FAF8F2" filter="url(#softShadow)"/>
  <rect x="480" y="370" width="36" height="80" fill="#102C25"/>
  <circle cx="498" cy="350" r="16" fill="#B89A63" filter="url(#glow)"/>
`);

const prop2Terrace = prop2Skyline;

// 8. PROP-3 (The Courtyard Biophilic Residence)
const prop3Exterior = createSvg(800, 500, `
  <rect width="800" height="500" fill="url(#skyCoastal)"/>
  <!-- Pacific Palisades Eucalyptus Canopy -->
  <path d="M0 240 Q 200 180 400 220 T 800 200 L 800 500 L 0 500 Z" fill="#182E26"/>

  <!-- Board-formed Concrete & Cedar Slats Residence -->
  <rect x="140" y="200" width="520" height="180" fill="#C2B8A7" stroke="#153D32" stroke-width="2" filter="url(#softShadow)"/>
  <!-- Cedar Slat Accent Wall -->
  <g fill="#7A4E2D">
    <rect x="440" y="200" width="220" height="180"/>
    ${Array.from({ length: 18 }, (_, i) => `<line x1="${440}" y1="${200 + i * 10}" x2="${660}" y2="${200 + i * 10}" stroke="#5A371E" stroke-width="2"/>`).join("")}
  </g>

  <!-- Central Japanese Maple Courtyard Glass Core -->
  <rect x="220" y="200" width="180" height="180" fill="url(#warmGlass)" filter="url(#glow)"/>
  <!-- Japanese Maple Bonsai Silhouette in Glass Box -->
  <path d="M 310 380 Q 310 310 290 270 Q 260 250 250 230" fill="none" stroke="#38241D" stroke-width="6"/>
  <circle cx="260" cy="240" r="28" fill="#A83232" opacity="0.85"/>
  <circle cx="300" cy="260" r="32" fill="#B83A3A" opacity="0.85"/>

  <!-- Basalt Paver Walkway & Reflecting Pool -->
  <polygon points="60,380 740,380 800,500 0,500" fill="#242B28"/>
  <rect x="200" y="410" width="400" height="50" fill="url(#poolWater)"/>
`);

const prop3Courtyard = prop3Exterior;
const prop3Living = prop1Living;

// 9. PROP-4 (The Lumina Waterfront Estate, Malibu)
const prop4Dock = createSvg(800, 500, `
  <rect width="800" height="500" fill="url(#skyCoastal)"/>
  <!-- Ocean Horizon & Pacific Swell -->
  <rect x="0" y="280" width="800" height="220" fill="url(#poolWater)"/>
  <line x1="0" y1="280" x2="800" y2="280" stroke="#7CB3A4" stroke-width="1.5"/>

  <!-- Modern White Cantilevered Beachfront Pavilion -->
  <polygon points="120,160 680,140 700,320 100,340" fill="url(#travertine)" filter="url(#softShadow)"/>
  <polygon points="160,180 640,165 650,290 140,305" fill="url(#warmGlass)" filter="url(#glow)"/>

  <!-- Teak Private Pier & Sunken Lounge -->
  <polygon points="260,340 540,340 600,500 200,500" fill="#996E47"/>
  <g stroke="#664629" stroke-width="1.5">
    ${Array.from({ length: 12 }, (_, i) => `<line x1="200" y1="${340 + i * 13}" x2="600" y2="${340 + i * 13}"/>`).join("")}
  </g>

  <!-- Malibu Sunset Golden Glow on Water -->
  <ellipse cx="400" cy="380" rx="180" ry="20" fill="#B89A63" opacity="0.4" filter="url(#glow)"/>
`);

const prop4Pool = prop4Dock;
const prop4Foyer = prop1Living;

// 10. PROP-5 (Atelier Loft & Gallery Residence, SoHo)
const prop5Loft = createSvg(800, 500, `
  <rect width="800" height="500" fill="#292019"/>
  <!-- Exposed Red Brick Wall Texture -->
  <rect x="0" y="0" width="800" height="340" fill="#6E3E2E"/>
  <g stroke="#522B1E" stroke-width="1" opacity="0.6">
    ${Array.from({ length: 25 }, (_, i) => `<line x1="0" y1="${i * 14}" x2="800" y2="${i * 14}"/>`).join("")}
  </g>

  <!-- SoHo Historic Arched Cast-Iron Windows -->
  <g fill="url(#skyDusk)">
    <path d="M 120 300 L 120 120 A 70 70 0 0 1 260 120 L 260 300 Z"/>
    <path d="M 330 300 L 330 120 A 70 70 0 0 1 470 120 L 470 300 Z"/>
    <path d="M 540 300 L 540 120 A 70 70 0 0 1 680 120 L 680 300 Z"/>
  </g>
  <!-- Cast Iron Framing Grids -->
  <g stroke="#141916" stroke-width="4" fill="none">
    <path d="M 120 300 L 120 120 A 70 70 0 0 1 260 120 L 260 300 Z"/>
    <line x1="190" y1="50" x2="190" y2="300"/>
    <path d="M 330 300 L 330 120 A 70 70 0 0 1 470 120 L 470 300 Z"/>
    <line x1="400" y1="50" x2="400" y2="300"/>
    <path d="M 540 300 L 540 120 A 70 70 0 0 1 680 120 L 680 300 Z"/>
    <line x1="610" y1="50" x2="610" y2="300"/>
  </g>

  <!-- Wide-Plank Smoked Oak Floor -->
  <polygon points="0,340 800,340 800,500 0,500" fill="#423429"/>
  <!-- Modern Velvet Olive Couch -->
  <rect x="240" y="380" width="320" height="60" rx="8" fill="#1D382B" filter="url(#softShadow)"/>
  <!-- Cast Iron Structural Pillar -->
  <rect x="80" y="0" width="24" height="500" fill="#141A17" filter="url(#softShadow)"/>
  <rect x="700" y="0" width="24" height="500" fill="#141A17" filter="url(#softShadow)"/>
`);

const prop5Kitchen = prop5Loft;

// 11. PROP-6 (Monolith Commercial Tech Pavilion)
const prop6Commercial = createSvg(800, 500, `
  <rect width="800" height="500" fill="url(#skyTribeca)"/>
  <!-- Silicon Beach Corporate Campus -->
  <polygon points="100,100 700,70 720,420 80,440" fill="url(#darkStone)" filter="url(#softShadow)"/>
  <!-- Dark Glass Curtain Wall Ribbons -->
  <g fill="url(#coolGlass)" stroke="#153D32" stroke-width="2">
    <rect x="120" y="120" width="560" height="60"/>
    <rect x="115" y="200" width="570" height="60"/>
    <rect x="110" y="280" width="580" height="60"/>
    <rect x="105" y="360" width="590" height="60"/>
  </g>
  <!-- Illuminated Executive Atrium -->
  <rect x="340" y="280" width="120" height="140" fill="url(#warmGlass)" filter="url(#glow)"/>
`);

const prop6Atrium = prop6Commercial;

// 12. PROP-7 (The Solstice Timber Ridge Chalet, Aspen)
const prop7Chalet = createSvg(800, 500, `
  <rect width="800" height="500" fill="url(#skyAspen)"/>
  <!-- Aspen Highlands Snowcapped Mountain Peaks -->
  <polygon points="0,300 180,120 340,280" fill="#E8EDEA"/>
  <polygon points="260,280 440,90 620,290" fill="#F4F7F5"/>
  <polygon points="520,290 680,140 800,300" fill="#DEE5E1"/>

  <!-- Timber & Fieldstone Chalet Architecture -->
  <!-- Soaring A-Frame Glass Gable -->
  <polygon points="400,140 220,400 580,400" fill="#291F18" stroke="#FAF8F2" stroke-width="4" filter="url(#softShadow)"/>
  <polygon points="400,160 245,390 555,390" fill="url(#warmGlass)" filter="url(#glow)"/>

  <!-- Heavy Timber Cross-Bracing -->
  <line x1="400" y1="160" x2="400" y2="390" stroke="#3D2B20" stroke-width="6"/>
  <line x1="290" y1="320" x2="510" y2="320" stroke="#3D2B20" stroke-width="6"/>

  <!-- Steaming Outdoor Hot Spring Pool in Snow -->
  <polygon points="0,420 800,420 800,500 0,500" fill="#E1EBE6"/>
  <ellipse cx="400" cy="460" rx="130" ry="26" fill="url(#poolWater)"/>
  <ellipse cx="400" cy="455" rx="90" ry="12" fill="#75B8A6" opacity="0.6" filter="url(#glow)"/>
`);

const prop7Greatroom = prop7Chalet;

// 13. PROP-8 (The Ostrava Duplex Terrace, Denver)
const prop8Exterior = createSvg(800, 500, `
  <rect width="800" height="500" fill="url(#skyDusk)"/>
  <!-- Modern Tiered Brick & Zinc Duplex -->
  <rect x="180" y="140" width="440" height="280" fill="url(#darkStone)" filter="url(#softShadow)"/>
  <!-- Tiered Roof Garden & Pergola -->
  <rect x="220" y="80" width="360" height="60" fill="url(#travertine)"/>
  <g stroke="#153D32" stroke-width="3">
    ${Array.from({ length: 10 }, (_, i) => `<line x1="${240 + i * 32}" y1="80" x2="${240 + i * 32}" y2="140"/>`).join("")}
  </g>
  <!-- Floor to ceiling windows -->
  <rect x="210" y="170" width="160" height="90" fill="url(#warmGlass)" filter="url(#glow)"/>
  <rect x="430" y="170" width="160" height="90" fill="url(#warmGlass)" filter="url(#glow)"/>
  <rect x="210" y="290" width="380" height="110" fill="url(#warmGlass)" filter="url(#glow)"/>
`);

// 14. NEIGHBORHOODS (4 Enclaves)
const neighborhoodHillside = createSvg(600, 400, `
  <rect width="600" height="400" fill="url(#skyDusk)"/>
  <path d="M0 220 Q 200 160 380 200 T 600 180 L 600 400 L 0 400 Z" fill="#142B22"/>
  <path d="M0 280 Q 250 220 480 260 L 600 240 L 600 400 L 0 400 Z" fill="#0C1B15"/>
  <!-- Vineyard Rows & Estate Silhouettes -->
  <polygon points="260,220 340,220 330,260 270,260" fill="url(#warmGlass)" filter="url(#glow)"/>
`);

const neighborhoodMetropolitan = createSvg(600, 400, `
  <rect width="600" height="400" fill="url(#skyTribeca)"/>
  <rect x="60" y="140" width="70" height="260" fill="#0E1B17"/>
  <rect x="150" y="90" width="90" height="310" fill="#182E27"/>
  <rect x="260" y="160" width="60" height="240" fill="#0D1A16"/>
  <rect x="340" y="60" width="110" height="340" fill="#203E34"/>
  <rect x="470" y="120" width="75" height="280" fill="#12251F"/>
`);

const neighborhoodWaterfront = createSvg(600, 400, `
  <rect width="600" height="400" fill="url(#skyCoastal)"/>
  <rect x="0" y="240" width="600" height="160" fill="url(#poolWater)"/>
  <polygon points="120,180 340,180 360,250 100,250" fill="url(#travertine)"/>
  <polygon points="140,200 320,200 330,245 130,245" fill="url(#warmGlass)" filter="url(#glow)"/>
`);

const neighborhoodDiplomatic = createSvg(600, 400, `
  <rect width="600" height="400" fill="url(#skyDusk)"/>
  <rect x="140" y="140" width="320" height="180" fill="#26211C"/>
  <g fill="#B89A63">
    <rect x="180" y="170" width="24" height="60"/>
    <rect x="240" y="170" width="24" height="60"/>
    <rect x="330" y="170" width="24" height="60"/>
    <rect x="390" y="170" width="24" height="60"/>
  </g>
  <path d="M0 260 Q 200 200 400 240 T 600 220 L 600 400 L 0 400 Z" fill="#0F1F18" opacity="0.8"/>
`);

// Write all assets to disk
const files = {
  "hero-villa.svg": heroVilla,
  "prop-1-exterior.svg": prop1Exterior,
  "prop-1-living.svg": prop1Living,
  "prop-1-pool.svg": prop1Pool,
  "prop-1-master.svg": prop1Master,
  "prop-2-skyline.svg": prop2Skyline,
  "prop-2-interior.svg": prop2Interior,
  "prop-2-terrace.svg": prop2Terrace,
  "prop-3-courtyard.svg": prop3Courtyard,
  "prop-3-exterior.svg": prop3Exterior,
  "prop-3-living.svg": prop3Living,
  "prop-4-dock.svg": prop4Dock,
  "prop-4-pool.svg": prop4Pool,
  "prop-4-foyer.svg": prop4Foyer,
  "prop-5-loft.svg": prop5Loft,
  "prop-5-kitchen.svg": prop5Kitchen,
  "prop-6-commercial.svg": prop6Commercial,
  "prop-6-atrium.svg": prop6Atrium,
  "prop-7-chalet.svg": prop7Chalet,
  "prop-7-greatroom.svg": prop7Greatroom,
  "prop-8-exterior.svg": prop8Exterior,
  "neighborhood-hillside.svg": neighborhoodHillside,
  "neighborhood-metropolitan.svg": neighborhoodMetropolitan,
  "neighborhood-waterfront.svg": neighborhoodWaterfront,
  "neighborhood-diplomatic.svg": neighborhoodDiplomatic,
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(targetDir, filename), content, "utf8");
  // Also create a .jpg alias copy so any existing .jpg reference automatically works!
  const jpgAlias = filename.replace(".svg", ".jpg");
  fs.writeFileSync(path.join(targetDir, jpgAlias), content, "utf8");
}

console.log(`Generated ${Object.keys(files).length} architectural image assets successfully.`);
