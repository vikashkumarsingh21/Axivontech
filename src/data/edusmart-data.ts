export interface AcademicProgram {
  id: string;
  name: string;
  category: "undergraduate" | "postgraduate" | "executive";
  categoryLabel: string;
  duration: string;
  overview: string;
  curriculumHighlights: string[];
  keyFocus: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  title: string;
  department: string;
  bio: string;
  expertise: string[];
  imageSrc: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: "Lecture" | "Workshop" | "Orientation" | "Exhibition";
  dateFormatted: string;
  description: string;
  location: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  {
    id: "prog-business",
    name: "Business Strategy & Innovation",
    category: "undergraduate",
    categoryLabel: "Undergraduate Studies",
    duration: "4 Academic Semesters (Full-time)",
    overview:
      "A forward-looking curriculum examining enterprise leadership, venture creation, sustainable finance, and strategic organizational decision-making in evolving global markets.",
    curriculumHighlights: [
      "Venture Capital & Seed Modeling",
      "Sustainable Supply Architectures",
      "Strategic Governance & Market Ethics",
      "Managerial Economics & Analytics",
    ],
    keyFocus: "Enterprise Strategy & Ethical Leadership",
  },
  {
    id: "prog-cs",
    name: "Computer Science & Intelligent Systems",
    category: "undergraduate",
    categoryLabel: "Undergraduate Studies",
    duration: "6 Academic Semesters (Full-time)",
    overview:
      "Rigorous foundations in distributed architectures, computational logic, machine intelligence, and secure cloud software engineering with emphasis on collaborative development.",
    curriculumHighlights: [
      "High-Performance Distributed Systems",
      "Neural Network Modeling & Heuristics",
      "Cryptographic Verification & Systems Security",
      "Algorithm Design & Complexity",
    ],
    keyFocus: "Systems Engineering & Applied Intelligence",
  },
  {
    id: "prog-design",
    name: "Design Systems & Spatial Interaction",
    category: "undergraduate",
    categoryLabel: "Undergraduate Studies",
    duration: "4 Academic Semesters (Full-time)",
    overview:
      "Studio-intensive learning in product ergonomics, human-computer interaction, typographic hierarchy, and responsive physical-digital spatial environments.",
    curriculumHighlights: [
      "Editorial Design & Micro-Typography",
      "Spatial Ergonomics & Interaction Models",
      "Prototyping across Mixed Mediums",
      "Design Research & Usability Synthesis",
    ],
    keyFocus: "Human-Centred Interaction & Aesthetics",
  },
  {
    id: "prog-data",
    name: "Data Science & Quantitative Economics",
    category: "postgraduate",
    categoryLabel: "Postgraduate Studies",
    duration: "3 Academic Semesters (Full-time)",
    overview:
      "Advanced quantitative methodology bridging causal statistical inference, machine learning, predictive econometric modeling, and data-driven public policy analysis.",
    curriculumHighlights: [
      "Causal Inference & Panel Econometrics",
      "Bayesian Computational Statistics",
      "Large-Scale Data Ingestion & Pipelines",
      "Public Policy Decision Modeling",
    ],
    keyFocus: "Statistical Rigour & Empirical Decision Science",
  },
  {
    id: "prog-media",
    name: "Contemporary Communication & Media",
    category: "postgraduate",
    categoryLabel: "Postgraduate Studies",
    overview:
      "Critical analysis of digital narrative structures, investigative media ethics, cultural studies, and audience engagement across evolving modern publishing channels.",
    duration: "3 Academic Semesters (Full-time)",
    curriculumHighlights: [
      "Digital Media Ethics & Information Law",
      "Investigative Visual Journalism",
      "Cultural Discourse & Narrative Rhetoric",
      "Audience Dynamics & Media Analytics",
    ],
    keyFocus: "Narrative Strategy & Information Ethics",
  },
  {
    id: "prog-foundations",
    name: "Interdisciplinary Foundation Studies",
    category: "executive",
    categoryLabel: "Executive & Foundation",
    duration: "2 Academic Terms (Modular)",
    overview:
      "A preparatory liberal arts and scientific inquiry framework designed to cultivate rigorous critical thinking, research writing, rhetoric, and exploratory scholarship.",
    curriculumHighlights: [
      "History of Scientific Revolutions",
      "Logic, Reasoning & Deductive Logic",
      "Academic Research & Peer Synthesis",
      "Collaborative Problem Discovery",
    ],
    keyFocus: "Inquiry Fundamentals & Critical Reasoning",
  },
];

export const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: "fac-mira",
    name: "Dr. Mira Kapoor",
    title: "Chair of Enterprise Studies",
    department: "Business & Management",
    bio: "Focuses on entrepreneurial resilience, governance frameworks, and strategic sustainability across rapidly shifting commercial landscapes.",
    expertise: ["Strategic Leadership", "Corporate Innovation", "Economic Frameworks"],
    imageSrc: "/images/demo-projects/edusmart/faculty-mira.jpg",
  },
  {
    id: "fac-arjun",
    name: "Arjun Mehta",
    title: "Director of Systems Research",
    department: "Computer Science",
    bio: "Specialises in distributed ledger architectures, algorithmic fairness, and building accessible software interfaces for complex technical systems.",
    expertise: ["Distributed Systems", "Algorithm Design", "Computational Logic"],
    imageSrc: "/images/demo-projects/edusmart/faculty-arjun.jpg",
  },
  {
    id: "fac-nisha",
    name: "Nisha Rao",
    title: "Associate Professor of Interaction",
    department: "Design & Creative Studies",
    bio: "Guides studio explorations in digital-physical intersections, typography systems, and empathetic user experience methodologies.",
    expertise: ["Spatial Interaction", "Design Research", "Editorial Typography"],
    imageSrc: "/images/demo-projects/edusmart/faculty-nisha.jpg",
  },
  {
    id: "fac-rohan",
    name: "Rohan Malhotra",
    title: "Lecturer in Digital Cultures",
    department: "Communication Studies",
    bio: "Investigates information dispersion dynamics, contemporary rhetoric, and the cultural implications of networked media environments.",
    expertise: ["Media Theory", "Digital Rhetoric", "Investigative Analysis"],
    imageSrc: "/images/demo-projects/edusmart/faculty-rohan.jpg",
  },
];

export const CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: "evt-1",
    title: "Annual Undergraduate Research Symposium",
    category: "Exhibition",
    dateFormatted: "Sample Autumn Schedule · Day 01",
    description: "Students from across all departments present interdisciplinary capstone thesis findings and live interactive installations.",
    location: "Main Academic Atrium",
  },
  {
    id: "evt-2",
    title: "Design Thinking & Prototyping Workshop",
    category: "Workshop",
    dateFormatted: "Sample Weekend Seminar",
    description: "Hands-on studio sprint examining human-computer interaction ergonomics and sustainable product materials.",
    location: "Creative Design Studios, Hall B",
  },
  {
    id: "evt-3",
    title: "Distinguished Guest Lecture: Future Computing",
    category: "Lecture",
    dateFormatted: "Sample Academic Calendar",
    description: "A thoughtful exploration of neural architecture scaling, open source toolchains, and societal responsibility in engineering.",
    location: "West Quad Auditorium",
  },
  {
    id: "evt-4",
    title: "Prospective Scholars Campus Preview",
    category: "Orientation",
    dateFormatted: "Sample Open Day Session",
    description: "Guided tours through library resources, studio workshops, and conversational discovery sessions with department mentors.",
    location: "Admissions Gallery & Courtyard",
  },
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    question: "What academic areas are represented on this website?",
    answer:
      "Aurevia Academy showcases six sample multidisciplinary pathways across Business Strategy, Computer Science, Interaction Design, Quantitative Economics, Media Studies, and Foundation Inquiry.",
  },
  {
    question: "How can a prospective student make an admissions enquiry?",
    answer:
      "Visitors can explore the interactive admissions enquiry form located in the admissions section. This demonstration validates input fields on the client side and provides an instant preview of how a seamless application workflow functions.",
  },
  {
    question: "What information is shown on a sample program panel?",
    answer:
      "Each curriculum overview highlights academic duration, interdisciplinary focus areas, foundational competencies, and detailed course module highlights.",
  },
  {
    question: "Is Aurevia Academy connected to a real educational institution?",
    answer:
      "No. Aurevia Academy is a fictional brand created by Axivon Technologies as an interactive frontend showcase. It demonstrates the technical excellence, UI/UX aesthetics, and accessibility standards we deliver to universities and academic organizations.",
  },
  {
    question: "How can an educational institution or business request a website from Axivon?",
    answer:
      "Institutions and enterprises can contact Axivon Technologies directly through our consultation portal at /contact to discuss custom web engineering, bespoke design systems, and digital product portals.",
  },
];
