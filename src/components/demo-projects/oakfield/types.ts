export interface AcademicWing {
  id: string;
  name: string;
  grades: string;
  tagline: string;
  description: string;
  features: string[];
  timing: string;
  ratio: string;
  subjects: string[];
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  qualifications: string;
  department: string;
  experience: string;
  bio: string;
  iconType: "science" | "math" | "humanities" | "arts" | "sports";
}

export interface SchoolNotice {
  id: string;
  title: string;
  category: "Academic" | "Admissions" | "Events" | "Sports" | "Circular";
  date: string;
  summary: string;
  urgent?: boolean;
}

export interface CampusFacility {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  stats: string;
  highlights: string[];
}
