import {
  Program,
  Trainer,
  ScheduleClassSession,
  MembershipPlan,
  FacilityArea,
  GoalPlanResult,
} from "@/components/demo-projects/fitzone/types";

export const FITZONE_PROGRAMS: Program[] = [
  {
    id: "iron-forge",
    name: "IronForge™ Hypertrophy",
    tagline: "Structured progressive overload for lean muscle mass and raw power",
    category: "Strength",
    intensity: "High Intensity",
    durationMinutes: 60,
    caloriesBurnEstimate: "500–650 kcal",
    trainerName: "Marcus Vance",
    trainerRole: "Head of Strength & Conditioning",
    description:
      "A scientifically engineered strength protocol utilizing periodized barbell lifts, dumbbell isolation, and tempo-controlled hypertrophy sets. Built for athletes seeking dense muscular development and structural integrity.",
    targetFocus: ["Barbell Mechanics", "Posterior Chain Development", "Core Rigidity", "Compound Volume"],
    weeklyCommitment: "4 Sessions / Week (60 Min)",
    equipment: ["Eleiko Olympic Bars", "Calibrated Steel Plates", "Safety Squat Bars", "Dumbbells up to 150 lbs"],
    sampleCurriculum: [
      { week: "Phase 1 (Weeks 1–3)", focus: "Mechanical Tension & Baseline Conditioning", details: "3x6-8 linear compound movements with strict 3-second eccentric tempo." },
      { week: "Phase 2 (Weeks 4–6)", focus: "Metabolic Stress & Density Overload", details: "Drop sets, mechanical advantage supersets, and accessory hypertrophy clusters." },
      { week: "Phase 3 (Weeks 7–8)", focus: "Peak Force & Deload Integration", details: "Heavy singles at RPE 8.5 followed by CNS restoration protocols." },
    ],
    gradientClass: "from-[#1F1713] via-[#2A1810] to-[#120D0B]",
    accentColor: "#FF7138",
  },
  {
    id: "velocity-hiit",
    name: "VelocityX™ Metabolic Burn",
    tagline: "High-octane interval conditioning for explosive stamina and rapid calorie burn",
    category: "HIIT",
    intensity: "Elite Athlete",
    durationMinutes: 45,
    caloriesBurnEstimate: "650–850 kcal",
    trainerName: "Elena Rostova",
    trainerRole: "Master HIIT & Track Specialist",
    description:
      "A high-output anaerobic conditioning system alternating between Concept2 curved treadmills, SkiErgs, assault air bikes, and kettlebell plyometrics. Elevates post-exercise oxygen consumption (EPOC) for up to 36 hours.",
    targetFocus: ["VO2 Max Elevation", "Lactate Threshold", "Agility & Sprints", "Explosive Power"],
    weeklyCommitment: "3 Sessions / Week (45 Min)",
    equipment: ["Concept2 Rowers & SkiErgs", "Woodway Curve Treadmills", "Rogue Kettlebells", "Plyo Boxes"],
    sampleCurriculum: [
      { week: "Interval Protocol 1", focus: "30s Work / 15s Active Recovery", details: "Tabata-style intervals targeting ATP-CP and anaerobic glycolysis energy pathways." },
      { week: "Interval Protocol 2", focus: "Pyramid Capacity Ladder", details: "Ascending and descending sprint blocks on the curved treadmill and SkiErg." },
      { week: "Interval Protocol 3", focus: "Team Relays & Prowler Sled Drills", details: "High-density functional turf sled pushes paired with kettlebell snatches." },
    ],
    gradientClass: "from-[#2A170F] via-[#3B1E12] to-[#170E08]",
    accentColor: "#FF934D",
  },
  {
    id: "spartan-functional",
    name: "Spartan Rig™ Functional Athletics",
    tagline: "Multi-planar agility, gymnastic ring work, and athletic movement mastery",
    category: "Functional",
    intensity: "High Intensity",
    durationMinutes: 50,
    caloriesBurnEstimate: "450–600 kcal",
    trainerName: "Tariq Al-Mansoor",
    trainerRole: "Functional Biomechanics Coach",
    description:
      "Move how humans were built to move. Combining calisthenics, suspension gymnastics, sandbag carries, and rotational power drills to create injury-resistant, all-terrain physical readiness.",
    targetFocus: ["Grip Endurance", "Rotational Stability", "Gymnastic Ring Dips", "Loaded Carries"],
    weeklyCommitment: "3–4 Sessions / Week (50 Min)",
    equipment: ["Custom 40ft Monkey Rig", "Gymnastic Wood Rings", "Cortex Sandbags", "Battle Ropes"],
    sampleCurriculum: [
      { week: "Block A", focus: "Isometric Tension & Scapular Control", details: "Ring pull-ups, hollow body holds, and strict Turkish get-ups." },
      { week: "Block B", focus: "Locomotive Carrying & Unilateral Power", details: "Farmer walks, single-arm suitcase carries, and Bulgarian bag rotations." },
      { week: "Block C", focus: "Obstacle Agility & Dynamic Ring Complexes", details: "High-velocity rope climbs, muscle-up progressions, and box jumps." },
    ],
    gradientClass: "from-[#1B1A1E] via-[#241F1A] to-[#111013]",
    accentColor: "#FF7138",
  },
  {
    id: "zen-flex-mobility",
    name: "ZenFlex™ Structural Recovery",
    tagline: "Fascial release, joint decompression, and deep passive mobility",
    category: "Mobility",
    intensity: "Moderate",
    durationMinutes: 55,
    caloriesBurnEstimate: "200–300 kcal",
    trainerName: "Chloe Dubois",
    trainerRole: "Yoga & Corrective Exercise Specialist",
    description:
      "The antidote to heavy training. Combines myofascial trigger point release, PNF stretching, dynamic mobility flow, and breathwork to decompress vertebrae, open tight hip capsules, and speed systemic recovery.",
    targetFocus: ["Thoracic Spine Rotation", "Hip Capsule Mobility", "Myofascial Release", "Down-Regulation"],
    weeklyCommitment: "2–3 Sessions / Week (55 Min)",
    equipment: ["High-Density Foam Rollers", "Lacrosse Trigger Balls", "TheraBands", "Acro Matting"],
    sampleCurriculum: [
      { week: "Restoration 1", focus: "Lower Body Hip & Hamstring Decompression", details: "90/90 hip flow, couch stretches, and targeted glute fascial rolling." },
      { week: "Restoration 2", focus: "Thoracic, Shoulder & Cervical Opening", details: "Wall slides, band pull-aparts, and deep diaphragmatic box breathing." },
      { week: "Restoration 3", focus: "Full-Body Passive Yin Flow", details: "Extended 3-minute passive floor holds for deep connective tissue hydration." },
    ],
    gradientClass: "from-[#111A16] via-[#162721] to-[#0C120F]",
    accentColor: "#48D597",
  },
  {
    id: "combat-strike",
    name: "Apex Strike™ Boxing & Kickboxing",
    tagline: "Authentic martial arts conditioning, heavy bag rounds, and footwork drills",
    category: "Functional",
    intensity: "High Intensity",
    durationMinutes: 50,
    caloriesBurnEstimate: "600–750 kcal",
    trainerName: "Jaxson Reed",
    trainerRole: "Professional Striking & MMA Coach",
    description:
      "Step into the ring. Learn clean punch mechanics, slipping defense, rotational power transfer, and intense heavy bag combinations designed to melt fat and build razor-sharp reflexes.",
    targetFocus: ["Punch Combinations", "Footwork Pivot Angles", "Rotational Core Power", "Endurance"],
    weeklyCommitment: "3 Sessions / Week (50 Min)",
    equipment: ["Everlast Leather Heavy Bags", "Speed Bags", "Focus Mitts", "Weighted Jump Ropes"],
    sampleCurriculum: [
      { week: "Round 1", focus: "Jab-Cross Mechanics & Stance Balance", details: "Footwork ladder drills, shadow boxing, and basic 1-2 punch velocity." },
      { week: "Round 2", focus: "Hooks, Uppercuts & Head Movement Slips", details: "Heavy bag power rounds paired with medicine ball rotational slams." },
      { week: "Round 3", focus: "10-Round Fight Conditioning Gauntlet", details: "Simulated round timers with push-up sprint burnouts between rounds." },
    ],
    gradientClass: "from-[#251412] via-[#331814] to-[#140B0A]",
    accentColor: "#FF7138",
  },
  {
    id: "elite-personal",
    name: "Precision™ 1-on-1 Coaching",
    tagline: "Bespoke biomechanical analysis, nutritional macros, and private training",
    category: "Coaching",
    intensity: "All Levels",
    durationMinutes: 60,
    caloriesBurnEstimate: "400–700 kcal",
    trainerName: "Maya Chen",
    trainerRole: "Master Biomechanist & Nutritionist",
    description:
      "A completely individualized athletic roadmap. Includes initial 3D postural laser assessment, metabolic rate testing, weekly tailored workouts, and direct WhatsApp / App coach access.",
    targetFocus: ["Personalized Form Correction", "Injury Rehabilitation", "Specific Sport Peak", "Custom Nutrition"],
    weeklyCommitment: "2–4 Private Sessions / Week",
    equipment: ["Full Club Access", "Private Assessment Studio", "InBody 770 Body Composition"],
    sampleCurriculum: [
      { week: "Diagnostic", focus: "Complete Movement & Biometric Audit", details: "Functional movement screen (FMS), metabolic baseline, and goal roadmap." },
      { week: "Execution", focus: "Progressive Resistance Adaptation", details: "Dedicated 1-on-1 coaching with real-time biofeedback and form tracking." },
      { week: "Refinement", focus: "Nutritional Titration & Milestone Audit", details: "Macro adjustments and periodic DEXA scan check-ins." },
    ],
    gradientClass: "from-[#1F1916] via-[#2E201B] to-[#120F0D]",
    accentColor: "#FF934D",
  },
];

export const FITZONE_TRAINERS: Trainer[] = [
  {
    id: "marcus-vance",
    name: "Marcus Vance",
    title: "Head Strength & Conditioning Director",
    specialty: "Olympic Weightlifting & Powerlifting",
    experienceYears: 12,
    biography:
      "Former collegiate strength coach and competitive powerlifter. Marcus specializes in barbell biomechanics, helping hundreds of athletes break deadlift plateaus and build injury-resistant frames through disciplined progressive overload.",
    certifications: ["CSCS (NSCA)", "USA Weightlifting Level 2", "Precision Nutrition Level 1"],
    coachingPhilosophy: "Technique is non-negotiable. Add weight only when the bar path is immaculate.",
    achievements: ["Coached 18 National-Level Powerlifters", "Over 12,000 Coaching Hours Logged"],
    programsTrained: ["IronForge™ Hypertrophy", "Precision™ 1-on-1 Coaching"],
    gradientClass: "from-[#2A1810] via-[#1E130E] to-[#120C09]",
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    title: "High-Performance HIIT & Track Director",
    specialty: "Metabolic Conditioning & Sprint Mechanics",
    experienceYears: 9,
    biography:
      "Ex-track & field sprinter with a Master's degree in Exercise Physiology. Elena crafts high-intensity conditioning sessions that challenge mental grit while protecting joints through proper landing mechanics.",
    certifications: ["M.S. Exercise Physiology", "EXOS Performance Specialist", "CrossFit Level 2"],
    coachingPhilosophy: "Fatigue is mental before it is physical. Breathe through the burn and stay in control.",
    achievements: ["National 400m Finalist (2018)", "Created the VelocityX Protocol"],
    programsTrained: ["VelocityX™ Metabolic Burn"],
    gradientClass: "from-[#331A10] via-[#24130C] to-[#140B07]",
  },
  {
    id: "tariq-al-mansoor",
    name: "Tariq Al-Mansoor",
    title: "Functional Movement & Calisthenics Lead",
    specialty: "Gymnastics, Animal Flow & Grip Athletics",
    experienceYears: 8,
    biography:
      "Tariq blends gymnastics ring training with multi-planar animal movements and obstacle athletics. He trains body control, unilateral balance, and core tension that carries over directly into real-world agility.",
    certifications: ["Animal Flow Master Instructor", "NASM-PES", "Gymnastic Bodies Level 1"],
    coachingPhilosophy: "Master your own body weight before you demand submission from external iron.",
    achievements: ["Featured Speaker at Global Movement Summit", "Calisthenics Pioneer"],
    programsTrained: ["Spartan Rig™ Functional Athletics"],
    gradientClass: "from-[#231B15] via-[#191410] to-[#100C0A]",
  },
  {
    id: "chloe-dubois",
    name: "Chloe Dubois",
    title: "Mobility & Structural Recovery Specialist",
    specialty: "Fascial Release & Postural Alignment",
    experienceYears: 11,
    biography:
      "A former professional contemporary dancer who transitioned into sports rehabilitation and corrective mobility. Chloe teaches lifters and desk workers how to restore lost thoracic range of motion and eradicate chronic lower back tension.",
    certifications: ["E-RYT 500", "FRC® Mobility Specialist (Functional Range Conditioning)", "RockTape FMT"],
    coachingPhilosophy: "True strength requires full range. If you cannot own the end-range, you do not own the lift.",
    achievements: ["Trained Olympic Divers & Marathoners", "Published Mobility Author"],
    programsTrained: ["ZenFlex™ Structural Recovery"],
    gradientClass: "from-[#162721] via-[#111C18] to-[#0A110E]",
  },
  {
    id: "jaxson-reed",
    name: "Jaxson Reed",
    title: "Combat Striking & Conditioning Coach",
    specialty: "Boxing Mechanics & Tactical Conditioning",
    experienceYears: 10,
    biography:
      "Golden Gloves regional champion and certified combat conditioning coach. Jaxson teaches authentic heavy bag combinations, slip defense, and rotational core engagement in a welcoming, high-energy environment.",
    certifications: ["USA Boxing Certified Coach", "ACE-CPT", "TRX Suspension Pro"],
    coachingPhilosophy: "Every punch originates in the hips and feet. Respect the fundamentals.",
    achievements: ["14-2 Amateur Boxing Record", "Head Striking Coach for FitZone Combat"],
    programsTrained: ["Apex Strike™ Boxing & Kickboxing"],
    gradientClass: "from-[#2F1612] via-[#22100D] to-[#130A08]",
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    title: "Director of Biometrics & Precision Coaching",
    specialty: "Body Composition & Hormone Optimization",
    experienceYears: 13,
    biography:
      "Maya leads FitZone's 1-on-1 coaching department, utilizing 3D motion capture and continuous metabolic assessments. She specializes in crafting sustainable lifestyle transformations for busy executives and competitive athletes.",
    certifications: ["Ph.D. Biomechanics Candidate", "CISSN Sports Nutritionist", "ACSM-EP"],
    coachingPhilosophy: "Data removes the guesswork. We test, we analyze, we adapt, and we conquer.",
    achievements: ["Supervised 2,500+ Body Recomposition Cases", "Lead Author on Nutrient Timing"],
    programsTrained: ["Precision™ 1-on-1 Coaching"],
    gradientClass: "from-[#271E18] via-[#1C1611] to-[#110D0A]",
  },
];

export const FITZONE_SCHEDULE: ScheduleClassSession[] = [
  // Monday
  { id: "mon-1", className: "IronForge™ Heavy Barbell", category: "Strength", dayOfWeek: "Monday", timeSlot: "06:30 AM", timeCategory: "morning", durationMinutes: 60, zone: "The Iron Pit", trainer: "Marcus Vance", intensity: "High Intensity", spotsTotal: 16, spotsRemaining: 3 },
  { id: "mon-2", className: "VelocityX™ Morning Blast", category: "HIIT", dayOfWeek: "Monday", timeSlot: "07:45 AM", timeCategory: "morning", durationMinutes: 45, zone: "Performance Arena", trainer: "Elena Rostova", intensity: "Elite Athlete", spotsTotal: 20, spotsRemaining: 5 },
  { id: "mon-3", className: "Spartan Rig™ Calisthenics", category: "Functional", dayOfWeek: "Monday", timeSlot: "12:15 PM", timeCategory: "afternoon", durationMinutes: 50, zone: "The 40ft Rig", trainer: "Tariq Al-Mansoor", intensity: "High Intensity", spotsTotal: 14, spotsRemaining: 6 },
  { id: "mon-4", className: "Apex Strike™ Bag Rounds", category: "Combat", dayOfWeek: "Monday", timeSlot: "05:30 PM", timeCategory: "evening", durationMinutes: 50, zone: "Combat Studio", trainer: "Jaxson Reed", intensity: "High Intensity", spotsTotal: 18, spotsRemaining: 2 },
  { id: "mon-5", className: "ZenFlex™ Evening Recovery", category: "Mobility", dayOfWeek: "Monday", timeSlot: "07:00 PM", timeCategory: "evening", durationMinutes: 55, zone: "Mobility Loft", trainer: "Chloe Dubois", intensity: "Moderate", spotsTotal: 24, spotsRemaining: 8 },

  // Tuesday
  { id: "tue-1", className: "VelocityX™ Sprints & SkiErg", category: "HIIT", dayOfWeek: "Tuesday", timeSlot: "06:30 AM", timeCategory: "morning", durationMinutes: 45, zone: "Performance Arena", trainer: "Elena Rostova", intensity: "Elite Athlete", spotsTotal: 20, spotsRemaining: 4 },
  { id: "tue-2", className: "IronForge™ Upper Body Density", category: "Strength", dayOfWeek: "Tuesday", timeSlot: "09:00 AM", timeCategory: "morning", durationMinutes: 60, zone: "The Iron Pit", trainer: "Marcus Vance", intensity: "High Intensity", spotsTotal: 16, spotsRemaining: 7 },
  { id: "tue-3", className: "ZenFlex™ Midday Spine Mobility", category: "Mobility", dayOfWeek: "Tuesday", timeSlot: "01:00 PM", timeCategory: "afternoon", durationMinutes: 50, zone: "Mobility Loft", trainer: "Chloe Dubois", intensity: "All Levels", spotsTotal: 20, spotsRemaining: 11 },
  { id: "tue-4", className: "Spartan Rig™ Loaded Carries", category: "Functional", dayOfWeek: "Tuesday", timeSlot: "06:00 PM", timeCategory: "evening", durationMinutes: 50, zone: "Turf Zone", trainer: "Tariq Al-Mansoor", intensity: "High Intensity", spotsTotal: 16, spotsRemaining: 1 },
  { id: "tue-5", className: "Apex Strike™ Boxing Basics", category: "Combat", dayOfWeek: "Tuesday", timeSlot: "07:15 PM", timeCategory: "evening", durationMinutes: 50, zone: "Combat Studio", trainer: "Jaxson Reed", intensity: "All Levels", spotsTotal: 18, spotsRemaining: 9 },

  // Wednesday
  { id: "wed-1", className: "IronForge™ Deadlift Mastery", category: "Strength", dayOfWeek: "Wednesday", timeSlot: "06:30 AM", timeCategory: "morning", durationMinutes: 60, zone: "The Iron Pit", trainer: "Marcus Vance", intensity: "Elite Athlete", spotsTotal: 14, spotsRemaining: 2 },
  { id: "wed-2", className: "VelocityX™ Tabata Intervals", category: "HIIT", dayOfWeek: "Wednesday", timeSlot: "08:00 AM", timeCategory: "morning", durationMinutes: 45, zone: "Performance Arena", trainer: "Elena Rostova", intensity: "High Intensity", spotsTotal: 20, spotsRemaining: 6 },
  { id: "wed-3", className: "Spartan Rig™ Ring Gymnastics", category: "Functional", dayOfWeek: "Wednesday", timeSlot: "12:30 PM", timeCategory: "afternoon", durationMinutes: 50, zone: "The 40ft Rig", trainer: "Tariq Al-Mansoor", intensity: "Moderate", spotsTotal: 14, spotsRemaining: 4 },
  { id: "wed-4", className: "Apex Strike™ Power Boxing", category: "Combat", dayOfWeek: "Wednesday", timeSlot: "05:45 PM", timeCategory: "evening", durationMinutes: 50, zone: "Combat Studio", trainer: "Jaxson Reed", intensity: "High Intensity", spotsTotal: 18, spotsRemaining: 3 },
  { id: "wed-5", className: "ZenFlex™ Deep Hip Restoration", category: "Mobility", dayOfWeek: "Wednesday", timeSlot: "07:00 PM", timeCategory: "evening", durationMinutes: 55, zone: "Mobility Loft", trainer: "Chloe Dubois", intensity: "All Levels", spotsTotal: 22, spotsRemaining: 12 },

  // Thursday
  { id: "thu-1", className: "VelocityX™ Lactate Threshold", category: "HIIT", dayOfWeek: "Thursday", timeSlot: "06:30 AM", timeCategory: "morning", durationMinutes: 45, zone: "Performance Arena", trainer: "Elena Rostova", intensity: "Elite Athlete", spotsTotal: 20, spotsRemaining: 5 },
  { id: "thu-2", className: "IronForge™ Squat Volume", category: "Strength", dayOfWeek: "Thursday", timeSlot: "08:30 AM", timeCategory: "morning", durationMinutes: 60, zone: "The Iron Pit", trainer: "Marcus Vance", intensity: "High Intensity", spotsTotal: 16, spotsRemaining: 4 },
  { id: "thu-3", className: "ZenFlex™ Thoracic Opening", category: "Mobility", dayOfWeek: "Thursday", timeSlot: "01:00 PM", timeCategory: "afternoon", durationMinutes: 50, zone: "Mobility Loft", trainer: "Chloe Dubois", intensity: "All Levels", spotsTotal: 20, spotsRemaining: 8 },
  { id: "thu-4", className: "Spartan Rig™ Obstacle Athletics", category: "Functional", dayOfWeek: "Thursday", timeSlot: "06:00 PM", timeCategory: "evening", durationMinutes: 50, zone: "The 40ft Rig", trainer: "Tariq Al-Mansoor", intensity: "High Intensity", spotsTotal: 16, spotsRemaining: 2 },
  { id: "thu-5", className: "Apex Strike™ Fight Conditioning", category: "Combat", dayOfWeek: "Thursday", timeSlot: "07:15 PM", timeCategory: "evening", durationMinutes: 50, zone: "Combat Studio", trainer: "Jaxson Reed", intensity: "High Intensity", spotsTotal: 18, spotsRemaining: 6 },

  // Friday
  { id: "fri-1", className: "IronForge™ Full-Body Friday", category: "Strength", dayOfWeek: "Friday", timeSlot: "06:30 AM", timeCategory: "morning", durationMinutes: 60, zone: "The Iron Pit", trainer: "Marcus Vance", intensity: "High Intensity", spotsTotal: 16, spotsRemaining: 1 },
  { id: "fri-2", className: "VelocityX™ Weekend Starter", category: "HIIT", dayOfWeek: "Friday", timeSlot: "07:45 AM", timeCategory: "morning", durationMinutes: 45, zone: "Performance Arena", trainer: "Elena Rostova", intensity: "High Intensity", spotsTotal: 20, spotsRemaining: 7 },
  { id: "fri-3", className: "Spartan Rig™ Team Challenges", category: "Functional", dayOfWeek: "Friday", timeSlot: "12:15 PM", timeCategory: "afternoon", durationMinutes: 50, zone: "Turf Zone", trainer: "Tariq Al-Mansoor", intensity: "All Levels", spotsTotal: 18, spotsRemaining: 5 },
  { id: "fri-4", className: "Apex Strike™ Heavy Spar Rounds", category: "Combat", dayOfWeek: "Friday", timeSlot: "05:30 PM", timeCategory: "evening", durationMinutes: 50, zone: "Combat Studio", trainer: "Jaxson Reed", intensity: "Elite Athlete", spotsTotal: 16, spotsRemaining: 0 },
  { id: "fri-5", className: "ZenFlex™ Sunset Breath & Unwind", category: "Mobility", dayOfWeek: "Friday", timeSlot: "06:45 PM", timeCategory: "evening", durationMinutes: 55, zone: "Mobility Loft", trainer: "Chloe Dubois", intensity: "All Levels", spotsTotal: 24, spotsRemaining: 10 },

  // Saturday
  { id: "sat-1", className: "Super Saturday Spartan Gauntlet", category: "Functional", dayOfWeek: "Saturday", timeSlot: "08:00 AM", timeCategory: "morning", durationMinutes: 75, zone: "Full Club Arena", trainer: "Tariq Al-Mansoor", intensity: "Elite Athlete", spotsTotal: 28, spotsRemaining: 3 },
  { id: "sat-2", className: "VelocityX™ 90-Minute Endurance", category: "HIIT", dayOfWeek: "Saturday", timeSlot: "09:30 AM", timeCategory: "morning", durationMinutes: 60, zone: "Performance Arena", trainer: "Elena Rostova", intensity: "High Intensity", spotsTotal: 22, spotsRemaining: 6 },
  { id: "sat-3", className: "IronForge™ Olympic Lifting Clinic", category: "Strength", dayOfWeek: "Saturday", timeSlot: "11:00 AM", timeCategory: "morning", durationMinutes: 75, zone: "The Iron Pit", trainer: "Marcus Vance", intensity: "Moderate", spotsTotal: 12, spotsRemaining: 2 },
  { id: "sat-4", className: "ZenFlex™ Post-Training Decompression", category: "Mobility", dayOfWeek: "Saturday", timeSlot: "01:00 PM", timeCategory: "afternoon", durationMinutes: 60, zone: "Mobility Loft", trainer: "Chloe Dubois", intensity: "All Levels", spotsTotal: 24, spotsRemaining: 9 },

  // Sunday
  { id: "sun-1", className: "Sunday Heavy Reset Barbell", category: "Strength", dayOfWeek: "Sunday", timeSlot: "09:00 AM", timeCategory: "morning", durationMinutes: 60, zone: "The Iron Pit", trainer: "Marcus Vance", intensity: "Moderate", spotsTotal: 16, spotsRemaining: 6 },
  { id: "sun-2", className: "ZenFlex™ 75-Min Complete Mobility", category: "Mobility", dayOfWeek: "Sunday", timeSlot: "10:30 AM", timeCategory: "morning", durationMinutes: 75, zone: "Mobility Loft", trainer: "Chloe Dubois", intensity: "All Levels", spotsTotal: 26, spotsRemaining: 14 },
  { id: "sun-3", className: "Open Mat Functional Sparring & Bag", category: "Combat", dayOfWeek: "Sunday", timeSlot: "01:00 PM", timeCategory: "afternoon", durationMinutes: 60, zone: "Combat Studio", trainer: "Jaxson Reed", intensity: "All Levels", spotsTotal: 18, spotsRemaining: 10 },
];

export const FITZONE_MEMBERSHIPS: MembershipPlan[] = [
  {
    id: "starter",
    name: "Starter / Foundation",
    tagline: "Essential access to the iron pit, cardio arena, and open club hours",
    monthlyPrice: 89,
    annualPriceMonthly: 71,
    isPopular: false,
    highlight: "Ideal for self-directed lifters",
    features: [
      "Full Gym Access (Open 5:00 AM – 11:00 PM)",
      "Eleiko Free Weight & Barbell Arena Access",
      "Woodway & Concept2 Cardio Deck",
      "2 Group Training Classes / Month",
      "Standard Locker Room & Towel Service",
      "Mobile App Barcode Key & Workout Tracker",
      "No Long-Term Lock-in Contract",
    ],
  },
  {
    id: "performance",
    name: "Performance / Pro",
    tagline: "Unlimited group classes, functional rig access, and cold plunge therapy",
    monthlyPrice: 149,
    annualPriceMonthly: 119,
    isPopular: true,
    highlight: "Most Popular — All-Inclusive Access",
    features: [
      "24/7 Unlimited Club Access",
      "Unlimited VelocityX™ HIIT & Spartan Rig™ Classes",
      "Unlimited ZenFlex™ Mobility & Apex Strike™ Boxing",
      "Contrast Therapy: Cold Plunge & Finnish Sauna",
      "Monthly InBody 770 Body Composition Scan",
      "2 Complimentary Guest Passes / Month",
      "1 Monthly 1-on-1 Strategy & Form Check Session",
      "15% Discount at FitZone Fuel Bar & Pro Shop",
    ],
  },
  {
    id: "elite",
    name: "Elite / Black Diamond",
    tagline: "Dedicated 1-on-1 coaching, priority recovery suites, and private lockers",
    monthlyPrice: 249,
    annualPriceMonthly: 199,
    isPopular: false,
    highlight: "The Ultimate Executive Athletic Tier",
    features: [
      "All Performance / Pro Tier Inclusions",
      "4 Private 1-on-1 Personal Training Sessions / Month",
      "Custom Macro Nutritional Plan & Bi-Weekly Audit",
      "Dedicated Assigned Permanent Locker with Laundry Service",
      "Hyperice Percussive & NormaTec Compression Suite Access",
      "VIP Priority Booking Window for All Classes (7 Days Advance)",
      "Unlimited Guest Passes (1 Guest per Visit)",
      "Complimentary Pre-Workout & Post-Shake with Every Visit",
    ],
  },
];

export const FITZONE_FACILITIES: FacilityArea[] = [
  {
    id: "fac-iron",
    title: "The Iron Pit (Strength Pavilion)",
    category: "Weights",
    sqFt: 8500,
    highlights: ["12 Eleiko Power Racks", "Olympic Deadlift Platforms", "Custom Dumbbell Rack up to 150 lbs", "Competition Calibrated Plates"],
    equipmentList: ["Eleiko IPF Certified Bars", "Kabuki Strength Specialty Bars", "Reverse Hypers & GHDs", "BOSU & Plate-Loaded Iso-Lateral Machines"],
    description: "Built for serious progressive overload. Acoustic sound-damped rubber flooring, Olympic lifting platforms with integrated chalk basins, and zero crowd wait times.",
    gradientClass: "from-[#1F1713] via-[#2A1810] to-[#120D0B]",
  },
  {
    id: "fac-performance",
    title: "Performance Turf & Spartan Rig",
    category: "Functional",
    sqFt: 6200,
    highlights: ["60-Yard Indoor Sprint Turf", "Custom 40ft Multi-Grip Monkey Rig", "Rogue Dog Sleds & Prowlers", "Peg Boards & Climbing Ropes"],
    equipmentList: ["Concept2 SkiErgs", "Woodway Curve Slat Treadmills", "Titan Strongman Logs & Yokes", "Wall-Ball Targets up to 12ft"],
    description: "An athletic playground designed for functional movement, plyometrics, sled pushes, and gymnastics conditioning. Engineered for high-output team training.",
    gradientClass: "from-[#2A1810] via-[#1E130E] to-[#120C09]",
  },
  {
    id: "fac-recovery",
    title: "Cryo & Thermal Recovery Spa",
    category: "Recovery",
    sqFt: 3800,
    highlights: ["Dual 38°F Sub-Zero Cold Plunges", "Finnish Cedar Sauna (195°F)", "NormaTec Compression Boot Lounge", "Hyperice Percussive Therapy Zone"],
    equipmentList: ["Commercial Titanium Water Chillers", "Infrared Heat Canopies", "Chromotherapy Mood Lighting", "Private Acoustic Relaxation Pods"],
    description: "Accelerate muscular repair and systemic down-regulation. Contrast hydrotherapy proven to diminish delayed onset muscle soreness (DOMS) and restore CNS balance.",
    gradientClass: "from-[#14231E] via-[#0E1A16] to-[#0A120F]",
  },
  {
    id: "fac-combat",
    title: "Apex Combat Studio",
    category: "Combat",
    sqFt: 3400,
    highlights: ["18 Commercial Heavy Bags", "Speed Bag & Double-End Swivels", "Spring-Suspended Wooden Boxing Ring", "Shock-Absorbing Tatami Mats"],
    equipmentList: ["Everlast Pro Leather Bags", "Thai Kick Pads & Curved Focus Mitts", "Weighted Jump Ropes", "Wall-Mount Uppercut Blocks"],
    description: "A dedicated martial arts training hall for boxing, Muay Thai, and tactical self-defense footwork. Soundproofed with custom acoustic baffles.",
    gradientClass: "from-[#281512] via-[#1D0F0D] to-[#130A09]",
  },
];

export const FITZONE_TESTIMONIALS = [
  {
    id: "test-1",
    athleteName: "David K.",
    memberType: "Sample Member Profile — Tech Executive",
    program: "IronForge™ Hypertrophy",
    metric: "-18 lbs Fat / +70 lbs Deadlift",
    quote:
      "FitZone eliminated the guesswork. Marcus refined my squat bar path within our first week. The 24/7 access and recovery plunge suites mean I train consistently without sacrificing my executive calendar.",
  },
  {
    id: "test-2",
    athleteName: "Sophia L.",
    memberType: "Sample Member Profile — Marathon Competitor",
    program: "VelocityX™ & ZenFlex™",
    metric: "14 Min Off Marathon PR",
    quote:
      "Combining Elena's high-output anaerobic sprint intervals with Chloe's deep hip mobility gave me stamina I never knew I had. My joints feel bulletproof, and the community energy is electric.",
  },
  {
    id: "test-3",
    athleteName: "Dr. Aaron M.",
    memberType: "Sample Member Profile — Orthopedic Surgeon",
    program: "Precision™ 1-on-1 Coaching",
    metric: "Zero Back Pain After 5 Years",
    quote:
      "As a surgeon, posture and spinal health are vital. The scientific biomechanical testing at FitZone is far beyond any commercial gym. Their coaches understand anatomy and periodization on an institutional level.",
  },
];

export const FITZONE_FAQS = [
  {
    question: "What should I bring to my Free Trial session?",
    answer:
      "Bring comfortable athletic training shoes (flat soles recommended for lifting), workout attire, and a government ID for registration. We provide complimentary lockers, chilled towel service, filtered electrolyte water stations, and all training gear.",
  },
  {
    question: "Are FitZone training programs suitable for beginners?",
    answer:
      "Yes. Every program and group class at FitZone features structured regressions and progressions. Our coaches assess your baseline movement mechanics in your trial session and tailor the weights, intervals, and intensity to your exact experience level.",
  },
  {
    question: "How does the Contrast Therapy (Cold Plunge & Sauna) work?",
    answer:
      "Included with Performance and Elite memberships, our recovery suite features twin 38°F filtered cold plunges alongside a 195°F cedar dry sauna. Members alternate between 15-minute thermal sessions and 3-minute cold immersions for rapid metabolic flushing.",
  },
  {
    question: "Can I pause or cancel my membership at any time?",
    answer:
      "All standard FitZone memberships operate on transparent monthly billing with zero cancellation fees. You can freeze your account for up to 60 days per year for travel or injury directly through the member portal with 7 days written notice.",
  },
  {
    question: "What is the guest pass policy for members?",
    answer:
      "Performance tier members receive 2 complimentary guest passes per month, while Elite Black Diamond members can bring a training partner with them on every single visit at no extra charge.",
  },
];
