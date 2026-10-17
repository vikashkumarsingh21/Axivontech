export type IntensityLevel = "All Levels" | "Moderate" | "High Intensity" | "Elite Athlete";

export interface Program {
  id: string;
  name: string;
  tagline: string;
  category: "Strength" | "HIIT" | "Functional" | "Mobility" | "Coaching";
  intensity: IntensityLevel;
  durationMinutes: number;
  caloriesBurnEstimate: string;
  trainerName: string;
  trainerRole: string;
  description: string;
  targetFocus: string[];
  weeklyCommitment: string;
  equipment: string[];
  sampleCurriculum: {
    week: string;
    focus: string;
    details: string;
  }[];
  gradientClass: string;
  accentColor: string;
}

export interface Trainer {
  id: string;
  name: string;
  title: string;
  specialty: string;
  experienceYears: number;
  biography: string;
  certifications: string[];
  coachingPhilosophy: string;
  achievements: string[];
  programsTrained: string[];
  gradientClass: string;
}

export interface ScheduleClassSession {
  id: string;
  className: string;
  category: "Strength" | "HIIT" | "Functional" | "Mobility" | "Combat";
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  timeSlot: string; // e.g. "06:30 AM", "05:30 PM"
  timeCategory: "morning" | "afternoon" | "evening";
  durationMinutes: number;
  zone: string; // e.g. "Performance Arena", "The Iron Pit", "Mobility Loft"
  trainer: string;
  intensity: IntensityLevel;
  spotsTotal: number;
  spotsRemaining: number;
}

export interface MembershipPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPriceMonthly: number;
  isPopular: boolean;
  features: string[];
  highlight: string;
}

export interface FacilityArea {
  id: string;
  title: string;
  category: "Weights" | "Cardio" | "Functional" | "Recovery" | "Combat";
  sqFt: number;
  highlights: string[];
  equipmentList: string[];
  description: string;
  gradientClass: string;
}

export interface GoalPlanResult {
  goalTitle: string;
  summary: string;
  recommendedSchedule: {
    day: string;
    focus: string;
    suggestedClass: string;
  }[];
  nutritionFocus: string;
  cardioTarget: string;
}
