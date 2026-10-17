export type PropertyType = "Luxury Villa" | "Penthouse" | "Modern Residence" | "Commercial Estate";

export type PropertyStatusTag = "Exclusive Listing" | "Featured Residence" | "Price Improvement" | "Rare Penthouse" | "Under Contract";

export interface FloorPlanZone {
  id: string;
  name: string;
  dimensions: string;
  areaSqFt: number;
  description: string;
}

export interface FloorPlan {
  levelName: string;
  totalAreaSqFt: number;
  blueprintSvgPath?: string;
  zones: FloorPlanZone[];
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  price: number;
  formattedPrice: string;
  location: string;
  neighborhood: string;
  address: string;
  propertyType: PropertyType;
  statusTag: PropertyStatusTag;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number;
  pricePerSqFt: number;
  yearBuilt: number;
  hoaMonthly: number;
  overview: string;
  architecturalStyle: string;
  keyAmenities: string[];
  features: string[];
  images: {
    url: string;
    alt: string;
    caption: string;
    gradientClass: string;
  }[];
  floorPlans: FloorPlan[];
  coordinates: { lat: number; lng: number };
  virtualTourUrl?: string;
  isFeatured: boolean;
}

export interface NeighborhoodGuide {
  id: string;
  name: string;
  city: string;
  vibe: string;
  description: string;
  avgPricePerSqFt: number;
  walkScore: number;
  transitScore: number;
  greeneryScore: number;
  highlights: string[];
  keyAttractions: string[];
  gradientStyle: string;
}

export interface FilterState {
  searchQuery: string;
  propertyType: string;
  priceRange: [number, number];
  bedrooms: string;
  sortBy: "curated" | "price-asc" | "price-desc" | "area-desc";
  statusFilter: string;
}
