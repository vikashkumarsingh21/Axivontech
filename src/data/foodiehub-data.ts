export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "small-plates" | "mains" | "tandoor" | "vegetarian" | "desserts" | "drinks";
  dietary?: "Vegetarian" | "Vegan" | "Gluten-Free" | "Contains Dairy" | "Chef Recommendation";
  isSignature?: boolean;
}

export const MENU_CATEGORIES = [
  { id: "small-plates", label: "Small Plates", description: "Delicate bites, tikkas, and street-inspired starters." },
  { id: "mains", label: "Mains", description: "Slow-simmered gravies, coastal curries, and comforting heritage recipes." },
  { id: "tandoor", label: "From the Tandoor", description: "Clay-oven fired flatbreads, skewers, and chargrilled marinades." },
  { id: "vegetarian", label: "Vegetarian Favourites", description: "Celebrations of seasonal vegetables, paneer, and lentils." },
  { id: "desserts", label: "Desserts", description: "Fragrant sweet finishes perfumed with saffron, rose, and pistachio." },
  { id: "drinks", label: "Botanical Drinks", description: "Non-alcoholic house coolers, herbal infusions, and iced teas." },
] as const;

export const MENU_ITEMS: MenuItem[] = [
  // ── Small Plates ──────────────────────────────────────────
  {
    id: "sp-1",
    name: "Smoked Paneer Tikka",
    description: "Malai paneer cubes cured in Kashmiri chilli and mustard oil, chargrilled with mint emulsion.",
    price: 495,
    category: "small-plates",
    dietary: "Vegetarian",
    isSignature: true,
  },
  {
    id: "sp-2",
    name: "Charred Avocado & Sweet Potato Chaat",
    description: "Crispy sweet potato cubes, spiced avocado, pomegranate gems, and tamarind date glaze.",
    price: 445,
    category: "small-plates",
    dietary: "Vegan",
  },
  {
    id: "sp-3",
    name: "Wild Mushroom Galouti Kebabs",
    description: "Melt-in-the-mouth forest mushroom mince on saffron sheermal crisps with mint mousse.",
    price: 525,
    category: "small-plates",
    dietary: "Vegetarian",
    isSignature: true,
  },
  {
    id: "sp-4",
    name: "Lotus Stem Crisp & Pepper Toss",
    description: "Thinly sliced lotus root tossed with black pepper, crushed coriander seed, and curry leaf oil.",
    price: 395,
    category: "small-plates",
    dietary: "Vegan",
  },

  // ── Mains ─────────────────────────────────────────────────
  {
    id: "m-1",
    name: "Northline Dal Bukhara Style",
    description: "Slow-simmered black lentils cooked overnight with vine-ripened tomatoes and white churned butter.",
    price: 585,
    category: "mains",
    dietary: "Vegetarian",
    isSignature: true,
  },
  {
    id: "m-2",
    name: "Raw Mango & Coconut Kofta Curry",
    description: "Delicate cottage cheese and raw banana dumplings stewed in gentle Malabar coconut gravy.",
    price: 645,
    category: "mains",
    dietary: "Vegetarian",
  },
  {
    id: "m-3",
    name: "Kashmiri Morels & Baby Potato Rogan",
    description: "Stuffed Himalayan morels braised in a saffron-infused Kashmiri shallot gravy.",
    price: 795,
    category: "mains",
    dietary: "Vegetarian",
    isSignature: true,
  },
  {
    id: "m-4",
    name: "Awadhi Dum Subz Biryani",
    description: "Aged long-grain basmati layered with seasonal farm vegetables, rose water, and sealed with dough.",
    price: 625,
    category: "mains",
    dietary: "Vegetarian",
  },

  // ── From the Tandoor ──────────────────────────────────────
  {
    id: "t-1",
    name: "Truffle & Aged Cheddar Naan",
    description: "Hand-stretched leavened flatbread glazed with black truffle butter and mature cheddar.",
    price: 245,
    category: "tandoor",
    dietary: "Contains Dairy",
    isSignature: true,
  },
  {
    id: "t-2",
    name: "Smoked Saffron Sheermal",
    description: "Traditional milk flatbread gently kneaded with Kashmiri saffron and cardamom ghee.",
    price: 215,
    category: "tandoor",
    dietary: "Vegetarian",
  },
  {
    id: "t-3",
    name: "Charred Broccoli Florets in Kasundi",
    description: "Tender broccoli heads marinated in Bengali mustard cream, roasted on iron skewers.",
    price: 495,
    category: "tandoor",
    dietary: "Vegetarian",
  },
  {
    id: "t-4",
    name: "Chilli Garlic Laccha Paratha",
    description: "Layered flaky whole-wheat bread dusted with roasted garlic and crushed red pepper flakes.",
    price: 185,
    category: "tandoor",
    dietary: "Vegetarian",
  },

  // ── Vegetarian Favourites ─────────────────────────────────
  {
    id: "v-1",
    name: "Paneer Makhani with Smoked Tomato",
    description: "Velvety fresh cottage cheese simmered in roasted plum tomato cream with dried fenugreek.",
    price: 625,
    category: "vegetarian",
    dietary: "Vegetarian",
    isSignature: true,
  },
  {
    id: "v-2",
    name: "Heirloom Baingan Bharta Tartlet",
    description: "Clay-roasted aubergine mash with green garlic, served in a flaky ajwain crust.",
    price: 475,
    category: "vegetarian",
    dietary: "Vegetarian",
  },
  {
    id: "v-3",
    name: "Asparagus & Water Chestnut Poriyal",
    description: "Wok-tempered asparagus, crunchy water chestnuts, fresh grated coconut, and mustard seed.",
    price: 545,
    category: "vegetarian",
    dietary: "Vegan",
  },
  {
    id: "v-4",
    name: "Yellow Lentil Tadka with Ghee Roast Garlic",
    description: "Comforting yellow moong and arhar lentils tempered with desi ghee, cumin, and fried garlic chips.",
    price: 445,
    category: "vegetarian",
    dietary: "Vegetarian",
  },

  // ── Desserts ──────────────────────────────────────────────
  {
    id: "d-1",
    name: "Handcrafted Saffron Cardamom Kulfi",
    description: "Traditional slow-churned clotted milk ice cream topped with slivered pistachios and silver leaf.",
    price: 365,
    category: "desserts",
    dietary: "Vegetarian",
    isSignature: true,
  },
  {
    id: "d-2",
    name: "Warm Saffron Milk Cake with Rose Espuma",
    description: "Slow-baked caramelised milk sponge accompanied by fragrant damascus rose water foam.",
    price: 415,
    category: "desserts",
    dietary: "Vegetarian",
  },
  {
    id: "d-3",
    name: "Textures of Shrikhand & Berries",
    description: "Hung curd whipped with green cardamom, served alongside seasonal macerated berries.",
    price: 385,
    category: "desserts",
    dietary: "Vegetarian",
  },
  {
    id: "d-4",
    name: "Dark Chocolate & Kashmiri Chilli Ganache",
    description: "Single-origin 70% dark chocolate torte with a subtle warm whisper of red chilli.",
    price: 445,
    category: "desserts",
    dietary: "Vegetarian",
  },

  // ── Drinks ────────────────────────────────────────────────
  {
    id: "dr-1",
    name: "Spiced Kaffir Lime & Mango Cooler",
    description: "Alphonso mango pulp shaken with kaffir lime leaves, pink salt, and sparkling spring water.",
    price: 285,
    category: "drinks",
    dietary: "Vegan",
    isSignature: true,
  },
  {
    id: "dr-2",
    name: "Smoked Jamun & Cumin Shrub",
    description: "Wild blackberry nectar infused with roasted cumin, charred citrus, and fresh mint.",
    price: 295,
    category: "drinks",
    dietary: "Vegan",
  },
  {
    id: "dr-3",
    name: "Iced Saffron & Lemongrass Tisane",
    description: "Cold-steeped hill lemongrass with whole saffron threads, honey syrup, and crushed ice.",
    price: 275,
    category: "drinks",
    dietary: "Vegetarian",
  },
  {
    id: "dr-4",
    name: "House Masala Ginger Chaas",
    description: "Light churned probiotic buttermilk seasoned with ginger, toasted cumin, and fresh cilantro.",
    price: 215,
    category: "drinks",
    dietary: "Vegetarian",
  },
];

export const SIGNATURE_DISHES = [
  {
    id: "sig-1",
    name: "Smoked Paneer Tikka",
    subtitle: "Clay-Oven Char · Kashmiri Chilli · Fresh Mint Emulsion",
    description:
      "Tender malai paneer steeped in roasted gram flour and cold-pressed mustard oil, chargrilled over wood charcoal and served with crisp pickled shallots.",
    price: 495,
    imageSrc: "/images/demo-projects/foodiehub/sig-paneer-tikka.jpg",
    category: "small-plates",
    categoryLabel: "Small Plates",
  },
  {
    id: "sig-2",
    name: "Slow-Simmered Dal",
    subtitle: "Overnight Coal Simmer · Vine Tomatoes · White Farm Butter",
    description:
      "Slow-simmered whole urad lentils bathed over low charcoal embers for eighteen hours, creating an extraordinarily rich, velvety texture without heavy cream.",
    price: 585,
    imageSrc: "/images/demo-projects/foodiehub/sig-dal-makhani.jpg",
    category: "mains",
    categoryLabel: "Mains",
  },
  {
    id: "sig-3",
    name: "Artisan Saffron Kulfi",
    subtitle: "Slow-Reduced Whole Milk · Kashmiri Saffron · Irani Pistachio",
    description:
      "A celebration of heritage Indian confectionery, patiently reduced over open fire and perfumed with pure saffron threads and hand-pounded green cardamom.",
    price: 365,
    imageSrc: "/images/demo-projects/foodiehub/sig-kulfi-dessert.jpg",
    category: "desserts",
    categoryLabel: "Desserts",
  },
];

export const GALLERY_IMAGES = [
  {
    id: "gal-1",
    src: "/images/demo-projects/foodiehub/hero-dish.jpg",
    title: "Contemporary Food Artistry",
    tag: "Culinary",
    aspect: "landscape",
  },
  {
    id: "gal-2",
    src: "/images/demo-projects/foodiehub/ambience-interior.jpg",
    title: "Dining Room Atmosphere",
    tag: "Interiors",
    aspect: "landscape",
  },
  {
    id: "gal-3",
    src: "/images/demo-projects/foodiehub/sig-paneer-tikka.jpg",
    title: "Smoked Chargrilled Skewers",
    tag: "Culinary",
    aspect: "square",
  },
  {
    id: "gal-4",
    src: "/images/demo-projects/foodiehub/gallery-ingredients.jpg",
    title: "Pounded Spices & Botanicals",
    tag: "Ingredients",
    aspect: "portrait",
  },
  {
    id: "gal-5",
    src: "/images/demo-projects/foodiehub/gallery-drink.jpg",
    title: "Craft Botanical Cooler",
    tag: "Drinks",
    aspect: "portrait",
  },
  {
    id: "gal-6",
    src: "/images/demo-projects/foodiehub/ambience-table.jpg",
    title: "Candlelit Evening Tablescape",
    tag: "Interiors",
    aspect: "landscape",
  },
  {
    id: "gal-7",
    src: "/images/demo-projects/foodiehub/story-kitchen.jpg",
    title: "Behind the Pass",
    tag: "Kitchen",
    aspect: "landscape",
  },
  {
    id: "gal-8",
    src: "/images/demo-projects/foodiehub/gallery-tandoor.jpg",
    title: "Clay Oven Artistry",
    tag: "Technique",
    aspect: "square",
  },
];

export const SPECIAL_EXPERIENCES = [
  {
    id: "exp-1",
    title: "Chef's Seasonal Tasting Menu",
    eyebrow: "Seven-Course Journey",
    description:
      "A curated evening tasting designed around micro-seasonal harvests, heirloom grains, and regional culinary traditions.",
    detail: "Available Friday – Sunday · Advance reservation suggested",
  },
  {
    id: "exp-2",
    title: "Private Dining Room",
    eyebrow: "Intimate Gatherings",
    description:
      "A secluded dining salon surrounded by warm timber panelling and acoustic calm, accommodating up to 16 guests for celebrations.",
    detail: "Bespoke menus & personalised hospitality table setups",
  },
  {
    id: "exp-3",
    title: "Botanical Pairing Evenings",
    eyebrow: "Zero-Proof Mixology",
    description:
      "Our beverage director creates bespoke herb, fruit, and spice shrubs paired with each course for a layered tasting experience.",
    detail: "Offered daily with our evening dining services",
  },
];
