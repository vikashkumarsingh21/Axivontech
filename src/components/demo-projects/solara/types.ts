export interface VillaAccommodation {
  id: string;
  name: string;
  category: "Private Villa" | "Canopy Suite" | "Heritage Cottage" | "Glamping";
  area: string;
  occupancy: string;
  bedType: string;
  pricePerNight: string;
  tagline: string;
  description: string;
  image: string;
  features: string[];
  inclusions: string[];
}

export interface DiningVenue {
  id: string;
  name: string;
  cuisine: string;
  timings: string;
  ambiance: string;
  description: string;
  highlights: string[];
  signatureDish: string;
}

export interface WellnessTherapy {
  id: string;
  title: string;
  duration: string;
  focus: string;
  description: string;
  benefits: string[];
}

export interface ResortExperience {
  id: string;
  title: string;
  category: "Nature" | "Culture" | "Culinary" | "Astronomy";
  timeSlot: string;
  description: string;
  highlights: string[];
}
