export interface ProductVariantColor {
  name: string;
  hex: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: string[];
  imageAlt: string;
  colors?: ProductVariantColor[];
  sizes?: string[];
  tags: string[];
  stockStatus: "In Stock" | "Low Stock" | "Sample Stock Only";
  isFeatured: boolean;
  isNewArrival: boolean;
  sampleRating: number;
  sampleReviewCount: number;
  specs: ProductSpec[];
  highlights: string[];
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortTag: string;
  image: string;
  itemCount: number;
}

export const NOVACART_CATEGORIES: ProductCategory[] = [
  {
    id: "fashion-accessories",
    name: "Fashion Accessories",
    slug: "fashion-accessories",
    description: "Curated watches, precision eyewear, full-grain leather goods, and timeless personal styling accents.",
    shortTag: "Personal Style",
    image: "/images/demo-projects/novacart/cat-fashion.jpg",
    itemCount: 6,
  },
  {
    id: "bags-travel",
    name: "Bags & Travel",
    slug: "bags-travel",
    description: "Ergonomic commuter packs, weather-resistant weekend duffels, and modular travel accessories.",
    shortTag: "Mobility & Journey",
    image: "/images/demo-projects/novacart/cat-bags.jpg",
    itemCount: 6,
  },
  {
    id: "home-living",
    name: "Home & Living",
    slug: "home-living",
    description: "Ceramic brew gear, tactile ambient lighting, organic textiles, and sculptural accents for mindful spaces.",
    shortTag: "Mindful Spaces",
    image: "/images/demo-projects/novacart/cat-home.jpg",
    itemCount: 6,
  },
  {
    id: "tech-accessories",
    name: "Tech Accessories",
    slug: "tech-accessories",
    description: "Minimalist multi-device charging docks, studio headphones, ergonomic stands, and precision cables.",
    shortTag: "Modern Workspace",
    image: "/images/demo-projects/novacart/cat-tech.jpg",
    itemCount: 6,
  },
];

export const NOVACART_PRODUCTS: Product[] = [
  // ── CATEGORY 1: Fashion Accessories (6 products) ──────────────────────────
  {
    id: "nc-prod-01",
    name: "Minimalist Matte Chrono Watch",
    slug: "minimalist-matte-chrono-watch",
    category: "Fashion Accessories",
    categorySlug: "fashion-accessories",
    shortDescription: "Ultra-slim 38mm surgical steel timepiece with Japanese quartz movement and quick-release strap.",
    fullDescription: "Constructed with 316L bead-blasted surgical stainless steel, the Matte Chrono is designed for quiet elegance. Features a scratch-resistant sapphire crystal dome, 5ATM water resistance, and an interchangeable vegetable-tanned Italian leather band. Every detail has been pared down to pure functional beauty.",
    price: 4499,
    compareAtPrice: 5999,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/watch-matte-chrono.jpg",
      "/images/demo-projects/novacart/watch-matte-chrono-2.jpg",
    ],
    imageAlt: "Matte finish minimalist chronograph watch with leather band",
    colors: [
      { name: "Slate Black", hex: "#1C1D1A" },
      { name: "Brushed Silver", hex: "#DCDDD5" },
      { name: "Desert Tan", hex: "#C2A385" },
    ],
    tags: ["Timepiece", "Minimalist", "Watch", "Accessories", "Water Resistant"],
    stockStatus: "In Stock",
    isFeatured: true,
    isNewArrival: false,
    sampleRating: 4.9,
    sampleReviewCount: 128,
    specs: [
      { label: "Case Diameter", value: "38 mm" },
      { label: "Case Thickness", value: "7.2 mm" },
      { label: "Glass", value: "Anti-reflective Sapphire Crystal" },
      { label: "Movement", value: "Miyota Japanese Quartz" },
      { label: "Strap Width", value: "20 mm quick-release" },
      { label: "Water Resistance", value: "5 ATM (50 meters)" },
    ],
    highlights: [
      "Ultra-thin 7.2mm low-profile case fits cleanly under shirt cuffs",
      "Scratch-resistant sapphire crystal with anti-glare undercoating",
      "Interchangeable vegetable-tanned leather quick-release system",
    ],
  },
  {
    id: "nc-prod-02",
    name: "Acetate Geometric Sunglasses",
    slug: "acetate-geometric-sunglasses",
    category: "Fashion Accessories",
    categorySlug: "fashion-accessories",
    shortDescription: "Handcrafted plant-based cellulose acetate frames with polarized category 3 UV400 lenses.",
    fullDescription: "A contemporary reinterpretation of the classic silhouette. Hand-milled from sustainable Italian cellulose acetate, featuring custom five-barrel hinges and scratch-resistant polarized TAC lenses providing complete UVA/UVB protection with zero optical distortion.",
    price: 2899,
    compareAtPrice: 3499,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/sunglasses-acetate.jpg",
      "/images/demo-projects/novacart/sunglasses-acetate-2.jpg",
    ],
    imageAlt: "Handcrafted geometric acetate frame sunglasses with polarized dark lenses",
    colors: [
      { name: "Tortoiseshell", hex: "#5C3A21" },
      { name: "Noir Black", hex: "#1C1D1A" },
      { name: "Amber Crystal", hex: "#C79D5E" },
    ],
    tags: ["Eyewear", "UV400", "Polarized", "Summer", "Acetate"],
    stockStatus: "In Stock",
    isFeatured: true,
    isNewArrival: true,
    sampleRating: 4.8,
    sampleReviewCount: 94,
    specs: [
      { label: "Frame Material", value: "Italian Bio-Cellulose Acetate" },
      { label: "Lens Type", value: "Polarized Triacetate Cellulose (TAC)" },
      { label: "Protection", value: "100% UV400 (UVA & UVB)" },
      { label: "Hinges", value: "Custom 5-barrel German OBE stainless steel" },
      { label: "Includes", value: "Recycled microfibre pouch & hard magnetic case" },
    ],
    highlights: [
      "Lightweight bio-based acetate crafted for all-day comfort",
      "Polarized lenses eliminate glare from water and pavements",
      "Five-barrel barrel hinges tested through 20,000 cycles",
    ],
  },
  {
    id: "nc-prod-03",
    name: "Handcrafted Full-Grain Leather Belt",
    slug: "handcrafted-full-grain-leather-belt",
    category: "Fashion Accessories",
    categorySlug: "fashion-accessories",
    shortDescription: "Vegetable-tanned full-grain bridle leather with brushed solid brass buckle hardware.",
    fullDescription: "Cut from thick 9oz vegetable-tanned bridle leather and finished with hand-burnished beeswax edges. The solid brass roller buckle develops a distinct patina over years of wear, making this an heirloom wardrobe foundation.",
    price: 1999,
    compareAtPrice: 2499,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/leather-belt.jpg",
      "/images/demo-projects/novacart/leather-belt-2.jpg",
    ],
    imageAlt: "Vegetable tanned full grain leather belt with brushed brass buckle",
    colors: [
      { name: "Cognac Brown", hex: "#8B4513" },
      { name: "Espresso Black", hex: "#1C1D1A" },
    ],
    sizes: ["30-32 (S)", "34-36 (M)", "38-40 (L)"],
    tags: ["Leather", "Belt", "Handcrafted", "Heritage", "Wardrobe Essential"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.9,
    sampleReviewCount: 76,
    specs: [
      { label: "Width", value: "32 mm (1.25 in)" },
      { label: "Leather Weight", value: "9 oz (3.6 mm thickness)" },
      { label: "Tannage", value: "All-natural botanical vegetable extracts" },
      { label: "Buckle", value: "Solid forged brass with matte brushed finish" },
    ],
    highlights: [
      "Full-grain uncorrected surface that deepens in character over time",
      "Hand-burnished edges sealed with natural organic beeswax",
      "Dual keeper loops for secure, clean daily wear",
    ],
  },
  {
    id: "nc-prod-04",
    name: "Silk & Linen Woven Scarf",
    slug: "silk-linen-woven-scarf",
    category: "Fashion Accessories",
    categorySlug: "fashion-accessories",
    shortDescription: "Featherlight breathable blend woven on traditional handlooms with eyelash fringe trims.",
    fullDescription: "A balanced 60% mulberry silk and 40% Belgian linen weave providing natural temperature regulation across seasons. Drapes effortlessly with gentle tactile texture and subtle tonal gradation.",
    price: 1699,
    compareAtPrice: 2199,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/woven-scarf.jpg",
      "/images/demo-projects/novacart/woven-scarf-2.jpg",
    ],
    imageAlt: "Breathable textured silk and linen blended woven scarf",
    colors: [
      { name: "Oatmeal Beige", hex: "#D8D2C2" },
      { name: "Dusty Olive", hex: "#6B705C" },
      { name: "Charcoal", hex: "#343A40" },
    ],
    tags: ["Silk", "Linen", "Scarf", "Handloom", "Textiles"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: true,
    sampleRating: 4.7,
    sampleReviewCount: 52,
    specs: [
      { label: "Dimensions", value: "190 cm x 70 cm" },
      { label: "Composition", value: "60% Mulberry Silk, 40% Belgian Linen" },
      { label: "Weave", value: "Lightweight plain weave, 90 GSM" },
      { label: "Edge Finish", value: "Hand-pulled 1.5cm eyelash fringe" },
    ],
    highlights: [
      "Breathable natural fibers suitable for both air-conditioned offices and breezy evenings",
      "Pre-washed for an immediate ultra-soft hand feel without stiff sizing",
    ],
  },
  {
    id: "nc-prod-05",
    name: "Sculptural Brass Cuff Bracelet",
    slug: "sculptural-brass-cuff-bracelet",
    category: "Fashion Accessories",
    categorySlug: "fashion-accessories",
    shortDescription: "Solid sand-cast brass with architectural facets and a satin brushed protective finish.",
    fullDescription: "Inspired by modernist brutalist architecture, this cuff is forged in solid brass and individually hand-finished. Slightly flexible to allow gentle micro-adjustment to your wrist size while retaining its sculptural rigidity.",
    price: 1499,
    compareAtPrice: 1899,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/brass-cuff.jpg",
      "/images/demo-projects/novacart/brass-cuff-2.jpg",
    ],
    imageAlt: "Minimalist sculptural brushed solid brass cuff bracelet",
    colors: [
      { name: "Satin Brass", hex: "#D4AF37" },
      { name: "Rose Gold", hex: "#B76E79" },
    ],
    tags: ["Jewelry", "Brass", "Minimalist", "Sculptural", "Handmade"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.8,
    sampleReviewCount: 41,
    specs: [
      { label: "Material", value: "Solid Eco-Brass (Lead & Nickel free)" },
      { label: "Width", value: "8 mm" },
      { label: "Thickness", value: "3.2 mm" },
      { label: "Finish", value: "Micro-brushed satin with anti-tarnish micro-seal" },
    ],
    highlights: [
      "Hypoallergenic nickel-free solid metal construction",
      "Subtle architectural bevels reflect light with organic warmth",
    ],
  },
  {
    id: "nc-prod-06",
    name: "Modular Leather Key Organiser",
    slug: "modular-leather-key-organiser",
    category: "Fashion Accessories",
    categorySlug: "fashion-accessories",
    shortDescription: "Eliminates key rattle with a stainless steel locking mechanism holding 2–7 keys.",
    fullDescription: "Keep your pocket quiet and your belongings scratch-free. Premium top-grain leather strap wraps securely around keys with an engineered wave washer that keeps tension reliable over months of daily use.",
    price: 1199,
    compareAtPrice: 1499,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/key-organiser.jpg",
      "/images/demo-projects/novacart/key-organiser-2.jpg",
    ],
    imageAlt: "Modular leather key organiser with stainless steel locking post",
    colors: [
      { name: "Chestnut", hex: "#6F4E37" },
      { name: "Forest Green", hex: "#2D5A27" },
      { name: "Black", hex: "#1C1D1A" },
    ],
    tags: ["Everyday Carry", "EDC", "Leather", "Key Holder", "Minimalist"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: true,
    sampleRating: 4.9,
    sampleReviewCount: 88,
    specs: [
      { label: "Capacity", value: "2 to 7 standard keys" },
      { label: "Hardware", value: "Surgical-grade 316 stainless steel post" },
      { label: "Carabiner Ring", value: "Included D-ring for car key fobs" },
    ],
    highlights: [
      "Silent pocket carry stops keys jingling against your phone screen",
      "Includes integrated D-ring attachment for larger car key transponders",
    ],
  },

  // ── CATEGORY 2: Bags & Travel (6 products) ───────────────────────────────
  {
    id: "nc-prod-07",
    name: "Aeroflex Commuter Backpack 22L",
    slug: "aeroflex-commuter-backpack-22l",
    category: "Bags & Travel",
    categorySlug: "bags-travel",
    shortDescription: "Weatherproof 840D recycled nylon pack with dedicated suspended 16-inch laptop cocoon.",
    fullDescription: "Built for urban daily commuters and frequent flyers. Featuring clamshell flat-pack opening, hidden passport pocket against the back panel, magnetic Fidlock quick-release sternum strap, and ergonomically contoured dual-density EVA shoulder foam.",
    price: 5999,
    compareAtPrice: 7499,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/backpack-commuter.jpg",
      "/images/demo-projects/novacart/backpack-commuter-2.jpg",
    ],
    imageAlt: "Weatherproof minimalist urban commuter backpack 22L in matte finish",
    colors: [
      { name: "Matte Black", hex: "#1C1D1A" },
      { name: "Slate Grey", hex: "#52525B" },
      { name: "Olive Drab", hex: "#4B5320" },
    ],
    tags: ["Backpack", "Waterproof", "Commuter", "Laptop Bag", "Travel"],
    stockStatus: "In Stock",
    isFeatured: true,
    isNewArrival: false,
    sampleRating: 4.9,
    sampleReviewCount: 215,
    specs: [
      { label: "Volume", value: "22 Liters" },
      { label: "Weight", value: "1.05 kg" },
      { label: "Dimensions", value: "48 x 30 x 16 cm" },
      { label: "Laptop Compartment", value: "Suspended padding up to 16\" MacBook Pro" },
      { label: "Zippers", value: "YKK AquaGuard weather-sealed zippers" },
      { label: "Fabric", value: "840D CORDURA Recycled Ballistic Nylon with DWR" },
    ],
    highlights: [
      "180-degree clamshell opening for seamless packing and airport TSA checkpoints",
      "Suspended false-bottom laptop sleeve protects computers during accidental drops",
      "Luggage pass-through strap fits over rolling suitcase trolley handles",
    ],
  },
  {
    id: "nc-prod-08",
    name: "Water-Resistant Weekend Duffel",
    slug: "water-resistant-weekend-duffel",
    category: "Bags & Travel",
    categorySlug: "bags-travel",
    shortDescription: "40L carry-on compliant duffel bag with separated ventilated shoe compartment.",
    fullDescription: "Engineered for 3–4 day escapes and gym transitions. Features TPU-coated water-resistant twill shell, separate zippered shoe capsule that isolates dirty footwear from clean garments, and padded detachable seatbelt-webbing shoulder strap.",
    price: 4899,
    compareAtPrice: 6299,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/weekend-duffel.jpg",
      "/images/demo-projects/novacart/weekend-duffel-2.jpg",
    ],
    imageAlt: "Spacious 40L water resistant weekend duffel bag with leather accents",
    colors: [
      { name: "Deep Navy", hex: "#1A2530" },
      { name: "Charcoal", hex: "#2D3139" },
      { name: "Khaki", hex: "#8F8165" },
    ],
    tags: ["Duffel", "Travel", "Weekend Bag", "Carry-on", "Water Resistant"],
    stockStatus: "In Stock",
    isFeatured: true,
    isNewArrival: true,
    sampleRating: 4.8,
    sampleReviewCount: 142,
    specs: [
      { label: "Capacity", value: "40 Liters (IATA carry-on compliant)" },
      { label: "Weight", value: "1.18 kg" },
      { label: "Shoe Tunnel", value: "Fits up to Men's UK/US 12 sneakers" },
      { label: "Hardware", value: "Custom matte black alloy buckles" },
    ],
    highlights: [
      "Dedicated ventilated side chamber for footwear or damp swim gear",
      "Reinforced spill-proof bottom panel with protective rubber feet",
      "Quick-access magnetic slip pocket for passports and boarding passes",
    ],
  },
  {
    id: "nc-prod-09",
    name: "Slim Laptop Folio Sleeve",
    slug: "slim-laptop-folio-sleeve",
    category: "Bags & Travel",
    categorySlug: "bags-travel",
    shortDescription: "Magnetic fold-close protective sleeve with microfibre interior and cable pocket.",
    fullDescription: "A streamlined protective folio crafted with water-repellent recycled felt and vegan microfiber leather. Magnetic dual-snap flap avoids zipper abrasion against your laptop edges, while the front pleated pocket stores power adapters and stylus pens.",
    price: 2299,
    compareAtPrice: 2899,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/laptop-sleeve.jpg",
      "/images/demo-projects/novacart/laptop-sleeve-2.jpg",
    ],
    imageAlt: "Slim protective magnetic laptop sleeve with textured felt finish",
    colors: [
      { name: "Heather Grey", hex: "#7A7D84" },
      { name: "Obsidian Black", hex: "#1C1D1A" },
    ],
    sizes: ["13-14 inch", "15-16 inch"],
    tags: ["Laptop Sleeve", "Tech Pouch", "Protection", "Minimalist"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.7,
    sampleReviewCount: 67,
    specs: [
      { label: "Compatibility", value: "Fits 13\" / 14\" & 15\" / 16\" laptops" },
      { label: "Lining", value: "Anti-scratch micro-plush velvet" },
      { label: "Closure", value: "Dual silent neodymium magnetic bars" },
    ],
    highlights: [
      "Zipperless magnetic closure prevents scratches to delicate aluminum edges",
      "Doubles as an ergonomic mouse pad and desk protective mat when opened",
    ],
  },
  {
    id: "nc-prod-10",
    name: "Crossbody Canvas Messenger",
    slug: "crossbody-canvas-messenger",
    category: "Bags & Travel",
    categorySlug: "bags-travel",
    shortDescription: "Heavy-duty 16oz waxed cotton canvas shoulder bag with brass storm hardware.",
    fullDescription: "A durable daily satchel with weatherproof paraffin wax treatment that repels sudden downpours. Features internal padded tablet divider, pen slots, key tether, and an adjustable wide cotton webbing strap.",
    price: 3499,
    compareAtPrice: 4199,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/canvas-messenger.jpg",
      "/images/demo-projects/novacart/canvas-messenger-2.jpg",
    ],
    imageAlt: "Waxed heavy canvas messenger shoulder bag with brass fixtures",
    colors: [
      { name: "Raw Canvas", hex: "#CFC5B2" },
      { name: "Midnight Black", hex: "#1C1D1A" },
    ],
    tags: ["Messenger Bag", "Canvas", "Everyday Carry", "Crossbody"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.8,
    sampleReviewCount: 93,
    specs: [
      { label: "Capacity", value: "11 Liters" },
      { label: "Material", value: "16 oz Scottish Paraffin-Waxed Cotton Canvas" },
      { label: "Dimensions", value: "34 x 26 x 10 cm" },
      { label: "Strap Drop", value: "Adjustable 35 to 68 cm" },
    ],
    highlights: [
      "Natural wax barrier develops personal patina and can be reproofed indefinitely",
      "Concealed anti-theft rear zippered security pocket sits flush against hip",
    ],
  },
  {
    id: "nc-prod-11",
    name: "Structured Travel Packing Cubes (Set of 4)",
    slug: "structured-travel-packing-cubes-set",
    category: "Bags & Travel",
    categorySlug: "bags-travel",
    shortDescription: "Compression ripstop organizers with breathable mesh lids and dual-zipper volume reduction.",
    fullDescription: "Maximize your suitcase capacity by up to 40%. This four-piece compression organizer set includes 1 Large (jumpers/jeans), 2 Medium (shirts/shorts), and 1 Small (underwear/socks). Ultralight 40D diamond ripstop fabric withstands aggressive compression pulls.",
    price: 1799,
    compareAtPrice: 2299,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/packing-cubes.jpg",
      "/images/demo-projects/novacart/packing-cubes-2.jpg",
    ],
    imageAlt: "Set of 4 ultralight compression travel packing organizers with ripstop fabric",
    colors: [
      { name: "Stone Grey", hex: "#8F9499" },
      { name: "Seafoam", hex: "#6D9886" },
    ],
    tags: ["Packing Cubes", "Travel Accessories", "Organization", "Luggage"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: true,
    sampleRating: 4.9,
    sampleReviewCount: 164,
    specs: [
      { label: "Included Sizes", value: "1 Large (38x28cm), 2 Medium (30x20cm), 1 Small (25x15cm)" },
      { label: "Fabric", value: "Water-repellent 40D Diamond Ripstop Nylon" },
      { label: "Zippers", value: "Reinforced SBS double-slider compression track" },
    ],
    highlights: [
      "Secondary perimeter compression zipper reduces packed bulk by 40%",
      "Mesh window enables instant visual identification without unpacking",
    ],
  },
  {
    id: "nc-prod-12",
    name: "Minimalist Hard-Shell Passport Wallet",
    slug: "minimalist-hardshell-passport-wallet",
    category: "Bags & Travel",
    categorySlug: "bags-travel",
    shortDescription: "RFID-shielded anodized aluminum and leather hybrid travel document organizer.",
    fullDescription: "Keeps passports, boarding passes, currency notes, and international SIM cards impeccably arranged and protected from electromagnetic RFID skimming. Includes a miniature stainless ejector pin for SIM swaps on arrival.",
    price: 1499,
    compareAtPrice: 1999,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/passport-wallet.jpg",
      "/images/demo-projects/novacart/passport-wallet-2.jpg",
    ],
    imageAlt: "Compact RFID-blocking minimalist travel passport and card wallet",
    colors: [
      { name: "Terracotta", hex: "#C86D51" },
      { name: "Noir", hex: "#1C1D1A" },
    ],
    tags: ["Passport Holder", "RFID Protection", "Travel Wallet", "Security"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.7,
    sampleReviewCount: 83,
    specs: [
      { label: "Slots", value: "1 Passport, 4 Cards, 1 Boarding Pass, 2 Micro SIMs" },
      { label: "Security", value: "Certified 13.56 MHz RFID / NFC Faraday Shield" },
      { label: "Weight", value: "78 grams" },
    ],
    highlights: [
      "Total RFID protection shields biometric data and contactless payment cards",
      "Integrated micro SIM card slots and ejector pin holder for seamless travel transitions",
    ],
  },

  // ── CATEGORY 3: Home & Living (6 products) ───────────────────────────────
  {
    id: "nc-prod-13",
    name: "Ceramic Pour-Over Carafe & Dripper",
    slug: "ceramic-pour-over-carafe-dripper",
    category: "Home & Living",
    categorySlug: "home-living",
    shortDescription: "Hand-thrown stoneware slow coffee brewer with heat-retaining double glaze.",
    fullDescription: "Engineered in collaboration with specialty baristas. The 60-degree internal spiral fluting promotes optimal water flow rate and uniform extraction, while the thermal mass of the ceramic maintains steady brewing temperature from first bloom to final pour.",
    price: 2399,
    compareAtPrice: 2999,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/ceramic-pourover.jpg",
      "/images/demo-projects/novacart/ceramic-pourover-2.jpg",
    ],
    imageAlt: "Handcrafted matte ceramic coffee dripper and glass carafe set",
    colors: [
      { name: "Speckled Sand", hex: "#D8CFBC" },
      { name: "Matte Charcoal", hex: "#2B2D31" },
    ],
    tags: ["Coffee", "Ceramic", "Pour Over", "Kitchen", "Barista"],
    stockStatus: "In Stock",
    isFeatured: true,
    isNewArrival: false,
    sampleRating: 4.9,
    sampleReviewCount: 178,
    specs: [
      { label: "Carafe Capacity", value: "600 ml (2 to 4 cups)" },
      { label: "Dripper Size", value: "Standard 02 filter compatible" },
      { label: "Dishwasher Safe", value: "Yes (Microwave safe carafe)" },
      { label: "Glaze", value: "Lead-free food-safe matte mineral glaze" },
    ],
    highlights: [
      "Precision 60-degree extraction angle produces sweet, clean cup clarity",
      "Ergonomic handle stays cool to touch even with boiling water",
    ],
  },
  {
    id: "nc-prod-14",
    name: "Ambient Portable LED Lantern",
    slug: "ambient-portable-led-lantern",
    category: "Home & Living",
    categorySlug: "home-living",
    shortDescription: "Rechargeable warm glow lantern with capacitive stepless dimmer and brass handle.",
    fullDescription: "Creates an intimate focal point anywhere. Cast in powder-coated spun aluminum with an opal polycarbonate diffuser emitting 2200K sunset-warm light. Built-in 4000mAh battery delivers up to 36 hours on a single USB-C charge.",
    price: 3799,
    compareAtPrice: 4599,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/led-lantern.jpg",
      "/images/demo-projects/novacart/led-lantern-2.jpg",
    ],
    imageAlt: "Minimalist portable rechargeable LED lantern with brass carry handle",
    colors: [
      { name: "Warm White", hex: "#EAE7DF" },
      { name: "Forest Moss", hex: "#434B3E" },
    ],
    tags: ["Lighting", "Lantern", "LED", "Rechargeable", "Ambient"],
    stockStatus: "In Stock",
    isFeatured: true,
    isNewArrival: true,
    sampleRating: 4.9,
    sampleReviewCount: 112,
    specs: [
      { label: "Color Temperature", value: "2200K to 2700K Warm Glow" },
      { label: "Battery Life", value: "8 to 36 hours (brightness dependent)" },
      { label: "Charging", value: "USB-C fast charge (3 hours full)" },
      { label: "Water Rating", value: "IP44 splash resistant for outdoor terrace use" },
    ],
    highlights: [
      "Stepless capacitive touch top control dims smoothly with a fingertip rest",
      "IP44 rating allows moving comfortably between indoor tables and garden patios",
    ],
  },
  {
    id: "nc-prod-15",
    name: "Organic Waffle Weave Cotton Throw",
    slug: "organic-waffle-weave-cotton-throw",
    category: "Home & Living",
    categorySlug: "home-living",
    shortDescription: "GOTS-certified 100% long-staple organic cotton blanket with deep honeycomb texture.",
    fullDescription: "Spun from 100% long-staple Turkish organic cotton and pre-tumbled for plush cloud-like softness. The three-dimensional waffle grid traps air for lightweight year-round warmth without bulk.",
    price: 2899,
    compareAtPrice: 3699,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/waffle-throw.jpg",
      "/images/demo-projects/novacart/waffle-throw-2.jpg",
    ],
    imageAlt: "Deep waffle honeycomb woven cotton throw blanket draped casually",
    colors: [
      { name: "Ivory White", hex: "#F3F1EB" },
      { name: "Sage Mist", hex: "#A8B4A5" },
      { name: "Terracotta", hex: "#BD6B54" },
    ],
    tags: ["Bedding", "Throw", "Cotton", "Organic", "Textiles"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.8,
    sampleReviewCount: 97,
    specs: [
      { label: "Dimensions", value: "150 x 200 cm" },
      { label: "Weight", value: "380 GSM heavyweight weave" },
      { label: "Certification", value: "GOTS Organic & OEKO-TEX Standard 100" },
      { label: "Care", value: "Machine wash cold, tumble dry low" },
    ],
    highlights: [
      "Zero harmful chemical sizing; pre-washed for immediate cocoon softness",
      "Breathable thermal weave prevents overheating during humid nights",
    ],
  },
  {
    id: "nc-prod-16",
    name: "Architectural Stoneware Planter",
    slug: "architectural-stoneware-planter",
    category: "Home & Living",
    categorySlug: "home-living",
    shortDescription: "Fluted cylindrical ceramic planter with integrated concealed drainage dish.",
    fullDescription: "Elevate your indoor botanicals. Hand-cast from dense stoneware clay with vertical fluting inspired by classical Greco-Roman columns. Includes a fitted drainage saucer that sits flush to protect timber furniture.",
    price: 1899,
    compareAtPrice: 2399,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/stoneware-planter.jpg",
      "/images/demo-projects/novacart/stoneware-planter-2.jpg",
    ],
    imageAlt: "Fluted cylindrical stoneware planter with drainage saucer and green foliage",
    colors: [
      { name: "Raw Terracotta", hex: "#C46B51" },
      { name: "Glazed Ochre", hex: "#C79D5E" },
    ],
    sizes: ["6 inch (Medium)", "8 inch (Large)"],
    tags: ["Planter", "Ceramics", "Home Decor", "Plants"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.7,
    sampleReviewCount: 65,
    specs: [
      { label: "Diameter", value: "16 cm / 20 cm options" },
      { label: "Drainage", value: "Pre-drilled center hole with rubber stopper" },
      { label: "Material", value: "High-fire porous earthenware" },
    ],
    highlights: [
      "Natural porous clay promotes healthy root respiration and prevents root rot",
      "Flush-fit saucer catches excess runoff without breaking the clean profile",
    ],
  },
  {
    id: "nc-prod-17",
    name: "Scented Soy Candle in Concrete Vessel",
    slug: "scented-soy-candle-concrete-vessel",
    category: "Home & Living",
    categorySlug: "home-living",
    shortDescription: "Hand-poured 100% natural soy wax with crackling wood wick in reusable geometric concrete jar.",
    fullDescription: "Curated aromatics designed to center your evening routine. Formulated with pure essential oils and phthalate-free fragrance oils. The raw concrete vessel can be repurposed as a desktop pen holder or succulent planter once burned.",
    price: 1299,
    compareAtPrice: 1599,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/concrete-candle.jpg",
      "/images/demo-projects/novacart/concrete-candle-2.jpg",
    ],
    imageAlt: "Natural soy wax scented candle in geometric charcoal concrete jar with wood wick",
    colors: [
      { name: "Cedarwood & Fig", hex: "#52525B" },
      { name: "Amber Resin", hex: "#8F6B47" },
      { name: "Bergamot & Sage", hex: "#5E6C5B" },
    ],
    tags: ["Candle", "Soy Wax", "Fragrance", "Home Scents", "Eco-friendly"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: true,
    sampleRating: 4.9,
    sampleReviewCount: 135,
    specs: [
      { label: "Burn Time", value: "55 to 60 hours" },
      { label: "Wax Weight", value: "280 grams net soy wax" },
      { label: "Wick", value: "FSC-certified dual natural cherrywood wick" },
      { label: "Vessel", value: "Hand-cast sealed concrete with cork base" },
    ],
    highlights: [
      "Crackling wood wick creates ambient fireplace soundscape as it burns",
      "Clean-burning 100% soy wax creates zero toxic petroleum soot",
    ],
  },
  {
    id: "nc-prod-18",
    name: "Brushed Anodized Incense Burner",
    slug: "brushed-anodized-incense-burner",
    category: "Home & Living",
    categorySlug: "home-living",
    shortDescription: "Precision CNC-machined aerospace alloy tray with magnetic brass sphere holder.",
    fullDescription: "A meditative sculpture for your desk or mantelpiece. The linear ash-catching trench is CNC-milled from aircraft-grade aluminum, paired with a solid brass spherical bead that securely grips both Japanese coreless and Indian bamboo sticks at variable angles.",
    price: 1599,
    compareAtPrice: 1999,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/incense-burner.jpg",
      "/images/demo-projects/novacart/incense-burner-2.jpg",
    ],
    imageAlt: "Precision machined minimalist aluminum incense holder with brass sphere",
    colors: [
      { name: "Space Grey", hex: "#3A3D40" },
      { name: "Champagne Gold", hex: "#D8C7A3" },
    ],
    tags: ["Incense", "Meditation", "Aluminum", "Desk Decor", "Minimalist"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.8,
    sampleReviewCount: 58,
    specs: [
      { label: "Length", value: "24 cm" },
      { label: "Material", value: "Anodized 6061 Aluminum & Solid Brass" },
      { label: "Compatibility", value: "Holds sticks from 1.5mm to 3.5mm thickness" },
    ],
    highlights: [
      "Magnetic brass bead allows tilting stick angle to adjust burn rate",
      "Deep contour catches 100% of falling ash without countertop spill",
    ],
  },

  // ── CATEGORY 4: Tech Accessories (6 products) ────────────────────────────
  {
    id: "nc-prod-19",
    name: "Wireless Multi-Device Charging Pad",
    slug: "wireless-multidevice-charging-pad",
    category: "Tech Accessories",
    categorySlug: "tech-accessories",
    shortDescription: "Qi2-certified 3-in-1 magnetic fast charging station wrapped in acoustic woven wool fabric.",
    fullDescription: "Declutter your nightstand. Simultaneously charges your phone (up to 15W Qi2 MagSafe), smartwatch (5W fast charge), and wireless earbuds (5W). Features thermal management vents and weighted non-slip zinc base so it never lifts off the desk.",
    price: 3499,
    compareAtPrice: 4299,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/charging-pad.jpg",
      "/images/demo-projects/novacart/charging-pad-2.jpg",
    ],
    imageAlt: "Modern 3-in-1 magnetic wireless charging pad with premium fabric surface",
    colors: [
      { name: "Charcoal Wool", hex: "#2C2D30" },
      { name: "Walnut Wood", hex: "#5C4033" },
      { name: "White Ash", hex: "#EAE7DF" },
    ],
    tags: ["Wireless Charger", "MagSafe", "Qi2", "Desk Setup", "Multi-device"],
    stockStatus: "In Stock",
    isFeatured: true,
    isNewArrival: false,
    sampleRating: 4.9,
    sampleReviewCount: 189,
    specs: [
      { label: "Total Output", value: "25W maximum concurrent output" },
      { label: "Phone Output", value: "15W Qi2 / MagSafe certified" },
      { label: "Watch Output", value: "5W fast charging module" },
      { label: "Earbuds Output", value: "5W Qi pad" },
      { label: "Included Cable", value: "1.5m braided USB-C to USB-C cable" },
    ],
    highlights: [
      "Qi2 certification delivers official 15W fast magnetic phone charging speeds",
      "Foreign object detection and smart temperature cut-off preserve battery health",
    ],
  },
  {
    id: "nc-prod-20",
    name: "Noise-Isolating Studio On-Ear Headphones",
    slug: "noise-isolating-studio-headphones",
    category: "Tech Accessories",
    categorySlug: "tech-accessories",
    shortDescription: "Custom 40mm beryllium drivers with memory foam lambskin cushions and lossless Bluetooth 5.3.",
    fullDescription: "Engineered for uncompromising sonic fidelity. Tuned to a neutral acoustic response curve with airy highs and punchy, tight sub-bass. Enjoy 45 hours of continuous playback, multipoint device pairing, and analog 3.5mm wired override.",
    price: 7999,
    compareAtPrice: 9999,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/studio-headphones.jpg",
      "/images/demo-projects/novacart/studio-headphones-2.jpg",
    ],
    imageAlt: "Matte black studio monitoring headphones with memory foam cushions",
    colors: [
      { name: "Matte Black", hex: "#1C1D1A" },
      { name: "Bone Silver", hex: "#DCDDD5" },
    ],
    tags: ["Audio", "Headphones", "Bluetooth", "Studio Sound", "Music"],
    stockStatus: "In Stock",
    isFeatured: true,
    isNewArrival: true,
    sampleRating: 4.9,
    sampleReviewCount: 240,
    specs: [
      { label: "Acoustic Drivers", value: "40 mm Custom Beryllium Diaphragm" },
      { label: "Frequency Response", value: "10 Hz to 40,000 Hz (Hi-Res Audio Certified)" },
      { label: "Battery Playtime", value: "45 hours (15 min charge = 6 hours)" },
      { label: "Codecs", value: "LDAC, aptX Adaptive, AAC, SBC" },
      { label: "Weight", value: "245 grams" },
    ],
    highlights: [
      "Lossless LDAC wireless audio streaming delivers 3x more bandwidth than standard Bluetooth",
      "Ergonomic swivel cups fold flat into included hardshell ballistic travel case",
    ],
  },
  {
    id: "nc-prod-21",
    name: "Magnetic Floating Tablet Stand",
    slug: "magnetic-floating-tablet-stand",
    category: "Tech Accessories",
    categorySlug: "tech-accessories",
    shortDescription: "Full 360-degree rotation CNC aluminum stand with high-strength magnetic snap panel.",
    fullDescription: "Transforms your tablet into a desktop workstation or secondary display. Precision dual-axis friction hinges allow infinite angle adjustments from drawing mode to upright video conference alignment without wobbling.",
    price: 2999,
    compareAtPrice: 3799,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/tablet-stand.jpg",
      "/images/demo-projects/novacart/tablet-stand-2.jpg",
    ],
    imageAlt: "CNC machined aluminum magnetic floating tablet stand with dual hinges",
    colors: [
      { name: "Space Grey", hex: "#3A3D40" },
      { name: "Silver Anodized", hex: "#D5D8DC" },
    ],
    sizes: ["11 inch compatible", "12.9 inch compatible"],
    tags: ["Tablet Stand", "Aluminum", "Desk Setup", "Ergonomics", "Workstation"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.8,
    sampleReviewCount: 88,
    specs: [
      { label: "Rotation", value: "360° portrait/landscape + 180° tilt" },
      { label: "Material", value: "Aircraft Grade 6000-series Anodized Aluminum" },
      { label: "Base Weight", value: "720g counterbalanced weighted base" },
    ],
    highlights: [
      "Heavy counterbalanced base prevents tipping even during firm touchscreen tapping",
      "Integrated cable routing channel keeps charging wire tidy along the spine",
    ],
  },
  {
    id: "nc-prod-22",
    name: "Mechanical Low-Profile Keyboard",
    slug: "mechanical-low-profile-keyboard",
    category: "Tech Accessories",
    categorySlug: "tech-accessories",
    shortDescription: "Slim 75% hot-swappable mechanical keyboard with PBT dye-sub keycaps and triple-mode connectivity.",
    fullDescription: "Experience tactile mechanical keystrokes without wrist strain. Features low-profile Gateron optical switches, silicone sound-dampening pads, RGB per-key backlighting, and instant switching between macOS and Windows layouts.",
    price: 6499,
    compareAtPrice: 7999,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/mechanical-keyboard.jpg",
      "/images/demo-projects/novacart/mechanical-keyboard-2.jpg",
    ],
    imageAlt: "Low profile minimalist mechanical keyboard with aluminum frame and PBT keycaps",
    colors: [
      { name: "Linear Red", hex: "#9E2A2B" },
      { name: "Tactile Brown", hex: "#6F4E37" },
    ],
    tags: ["Keyboard", "Mechanical", "Wireless", "Desk Setup", "Productivity"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: true,
    sampleRating: 4.9,
    sampleReviewCount: 156,
    specs: [
      { label: "Layout", value: "75% compact (84 keys)" },
      { label: "Thickness", value: "Only 17 mm at tallest point" },
      { label: "Connectivity", value: "Bluetooth 5.1 (3 devices), 2.4GHz USB Dongle, USB-C" },
      { label: "Battery", value: "4000 mAh (up to 190 hours without backlight)" },
    ],
    highlights: [
      "Low profile architecture eliminates the necessity of a separate palm rest",
      "Triple connectivity pairs with up to 5 devices simultaneously across Mac, Windows, iOS, and Android",
    ],
  },
  {
    id: "nc-prod-23",
    name: "Braided Silicone Fast-Charging Cable Duo",
    slug: "braided-silicone-cable-duo",
    category: "Tech Accessories",
    categorySlug: "tech-accessories",
    shortDescription: "240W Power Delivery USB-C cables with tangle-free liquid silicone jacket and leather organizer strap.",
    fullDescription: "Built to survive 30,000 bends. Super-soft liquid silicone coating feels ultra-smooth to touch and resists knotting in your bag. E-Marker smart chip supports maximum 240W USB-PD charging suitable for demanding laptops down to earbuds.",
    price: 999,
    compareAtPrice: 1299,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/braided-cables.jpg",
      "/images/demo-projects/novacart/braided-cables-2.jpg",
    ],
    imageAlt: "Soft tangle-free braided silicone USB-C fast charging cables with leather snap strap",
    colors: [
      { name: "Olive Green", hex: "#556B2F" },
      { name: "Stone Grey", hex: "#708090" },
    ],
    sizes: ["1.2m Duo Pack", "2.0m Duo Pack"],
    tags: ["Cables", "USB-C", "Fast Charging", "240W", "Tangle Free"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.8,
    sampleReviewCount: 174,
    specs: [
      { label: "Power Rating", value: "Up to 240W (48V / 5A) USB Power Delivery 3.1" },
      { label: "Data Transfer", value: "USB 2.0 (480 Mbps)" },
      { label: "Bend Tolerance", value: "Tested through 35,000 90-degree flex cycles" },
      { label: "Includes", value: "2x Cables + 2x Vegetable tanned leather cable snaps" },
    ],
    highlights: [
      "Ultra-supple liquid silicone outer shell naturally unwinds without tangling",
      "Full 240W throughput charges 16-inch laptops at maximum manufacturer speed",
    ],
  },
  {
    id: "nc-prod-24",
    name: "Precision CNC Aluminum Laptop Riser",
    slug: "precision-aluminum-laptop-riser",
    category: "Tech Accessories",
    categorySlug: "tech-accessories",
    shortDescription: "Elevates screen to natural eye level while promoting 360-degree passive convective cooling.",
    fullDescription: "Engineered from a single piece of 4mm bead-blasted aircraft-grade aluminum. Elevates your laptop screen 15cm to align with natural posture, relieving cervical neck strain during marathon work sessions. Silicone pads protect your laptop body and desk.",
    price: 2499,
    compareAtPrice: 3199,
    currency: "INR",
    images: [
      "/images/demo-projects/novacart/aluminum-riser.jpg",
      "/images/demo-projects/novacart/aluminum-riser-2.jpg",
    ],
    imageAlt: "Single-piece precision bent aluminum laptop stand for ergonomic desk posture",
    colors: [
      { name: "Matte Silver", hex: "#D5D8DC" },
      { name: "Deep Graphite", hex: "#2E3033" },
    ],
    tags: ["Laptop Stand", "Ergonomics", "Aluminum", "Desk Setup", "Cooling"],
    stockStatus: "In Stock",
    isFeatured: false,
    isNewArrival: false,
    sampleRating: 4.9,
    sampleReviewCount: 119,
    specs: [
      { label: "Elevation", value: "15 cm (6 inches) at 18° viewing tilt" },
      { label: "Weight", value: "480 grams" },
      { label: "Compatibility", value: "All laptops from 11\" to 17\" (MacBook, Dell, ThinkPad)" },
      { label: "Finish", value: "Fine bead-blast anodized aluminum" },
    ],
    highlights: [
      "Open cantilever design acts as a heat sink and promotes passive airflow underneath laptop",
      "Stash your keyboard and mouse underneath the shelf when not in use to reclaim desk space",
    ],
  },
];

// ── UTILITY HELPERS ─────────────────────────────────────────────────────────

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getProductBySlug(slug: string): Product | undefined {
  return NOVACART_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return NOVACART_PRODUCTS.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return NOVACART_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return NOVACART_PRODUCTS.filter((p) => p.isFeatured);
}

export function getNewArrivals(): Product[] {
  return NOVACART_PRODUCTS.filter((p) => p.isNewArrival);
}

export function getRelatedProducts(currentProductId: string, limit: number = 4): Product[] {
  const current = getProductById(currentProductId);
  if (!current) return NOVACART_PRODUCTS.slice(0, limit);
  const sameCategory = NOVACART_PRODUCTS.filter(
    (p) => p.categorySlug === current.categorySlug && p.id !== currentProductId
  );
  if (sameCategory.length >= limit) {
    return sameCategory.slice(0, limit);
  }
  const other = NOVACART_PRODUCTS.filter(
    (p) => p.categorySlug !== current.categorySlug && p.id !== currentProductId
  );
  return [...sameCategory, ...other].slice(0, limit);
}

export interface PromoCode {
  code: string;
  type: "percentage" | "fixed";
  value: number; // e.g. 10 for 10% or 500 for ₹500
  description: string;
  minSubtotal: number;
}

export const DEMO_PROMO_CODES: Record<string, PromoCode> = {
  WELCOME10: {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    description: "10% off illustrative demo discount",
    minSubtotal: 1000,
  },
  NOVAFIRST: {
    code: "NOVAFIRST",
    type: "fixed",
    value: 500,
    description: "Flat ₹500 off sample promotional coupon",
    minSubtotal: 2000,
  },
};
