// ==============================================
// Axivon Technologies — Careers & Job Positions Data
// Single Source of Truth for verified openings
// ==============================================

export type EmploymentType = "Internship" | "Full-time" | "Part-time" | "Contract";
export type WorkMode = "Remote" | "Hybrid" | "On-site";
export type JobDepartment = "Engineering" | "AI & Automation" | "Design" | "Operations";

export interface JobPosition {
  id: string;
  slug: string;
  title: string;
  department: JobDepartment;
  type: EmploymentType;
  workMode: WorkMode;
  location: string;
  experience: string;
  shortDescription: string;
  roleOverview: string;
  responsibilities: string[];
  qualifications: string[];
  skills: string[];
  status: "Open" | "Closed";
  postedDate: string;
}

export const JOB_POSITIONS: JobPosition[] = [
  {
    id: "frontend-intern",
    slug: "frontend-developer-intern",
    title: "Frontend Developer Intern",
    department: "Engineering",
    type: "Internship",
    workMode: "Remote",
    location: "Remote (India)",
    experience: "0–1 Years",
    shortDescription:
      "Build modern, responsive, and high-performance web user interfaces using Next.js, React, TypeScript, and Tailwind CSS.",
    roleOverview:
      "As a Frontend Developer Intern at Axivon Technologies, you will collaborate with our engineering team to craft elegant, responsive, and accessible user interfaces. You will work on real client platforms and internal enterprise tools, implementing modern component architectures, optimizing Core Web Vitals, and writing clean, type-safe code.",
    responsibilities: [
      "Develop responsive user interface components using Next.js, React 19, and Tailwind CSS.",
      "Translate Figma prototypes and design tokens into pixel-perfect, accessible web pages.",
      "Optimize web applications for maximum speed, scalability, and cross-browser compatibility.",
      "Integrate RESTful APIs and handle client-side state management effectively.",
      "Participate in code reviews, testing, and agile engineering workflows.",
    ],
    qualifications: [
      "Solid understanding of HTML5, CSS3, modern JavaScript (ES6+), and TypeScript.",
      "Hands-on project experience with React or Next.js.",
      "Familiarity with Tailwind CSS and responsive design principles.",
      "Familiarity with Git and version control workflows.",
      "Strong problem-solving ability, curiosity, and eagerness to learn.",
    ],
    skills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Git", "REST APIs"],
    status: "Open",
    postedDate: "2026-03-01",
  },
  {
    id: "backend-intern",
    slug: "backend-developer-intern",
    title: "Backend Developer Intern",
    department: "Engineering",
    type: "Internship",
    workMode: "Remote",
    location: "Remote (India)",
    experience: "0–1 Years",
    shortDescription:
      "Design scalable server architectures, robust APIs, and secure database integrations using Node.js, Express, and PostgreSQL.",
    roleOverview:
      "As a Backend Developer Intern, you will focus on building reliable server-side systems, managing relational database schemas, and developing secure RESTful APIs. You will work with Node.js, Prisma ORM, and PostgreSQL to power enterprise dashboards, CRM workflows, and lead automation pipelines.",
    responsibilities: [
      "Develop and maintain server-side endpoints and RESTful API architectures.",
      "Design and optimize relational database models using PostgreSQL and Prisma ORM.",
      "Implement authentication, authorization (RBAC), and session management protocols.",
      "Ensure API security, rate-limiting, data validation, and input sanitization.",
      "Write unit and integration tests to maintain high code reliability.",
    ],
    qualifications: [
      "Proficiency in Node.js and JavaScript / TypeScript.",
      "Understanding of relational databases (PostgreSQL or MySQL) and basic SQL.",
      "Experience building basic REST APIs with Express or Next.js Route Handlers.",
      "Understanding of HTTP lifecycle, status codes, and JSON data structures.",
      "Familiarity with Prisma, TypeORM, or equivalent database abstraction tools is a plus.",
    ],
    skills: ["Node.js", "Express.js", "PostgreSQL", "Prisma ORM", "TypeScript", "REST APIs"],
    status: "Open",
    postedDate: "2026-03-01",
  },
  {
    id: "fullstack-intern",
    slug: "full-stack-developer-intern",
    title: "Full Stack Developer Intern",
    department: "Engineering",
    type: "Internship",
    workMode: "Remote",
    location: "Remote (India)",
    experience: "0–1 Years",
    shortDescription:
      "Work across the complete technology stack from interactive frontend interfaces to database design, server actions, and cloud deployments.",
    roleOverview:
      "As a Full Stack Developer Intern, you will have broad exposure to the entire development lifecycle. You will build end-to-end features, connect frontend interfaces to database models, and write clean, maintainable code across both client and server environments.",
    responsibilities: [
      "Build full-stack web applications using Next.js App Router, React, and TypeScript.",
      "Create and integrate backend API routes, database models, and external webhooks.",
      "Implement responsive user interfaces matching design specifications.",
      "Maintain code quality through linting, type-checking, and automated testing.",
      "Collaborate on feature planning, architectural discussions, and continuous improvements.",
    ],
    qualifications: [
      "Working knowledge of both frontend (React / Next.js) and backend (Node.js) development.",
      "Proficiency in TypeScript and modern JavaScript.",
      "Familiarity with SQL databases and ORMs like Prisma.",
      "Understanding of modern deployment environments (Vercel, Render, or cloud VPS).",
      "Passion for shipping complete, user-facing digital products.",
    ],
    skills: ["Next.js", "React", "Node.js", "TypeScript", "PostgreSQL", "Tailwind CSS"],
    status: "Open",
    postedDate: "2026-03-01",
  },
  {
    id: "aiml-intern",
    slug: "ai-ml-intern",
    title: "AI / Machine Learning Intern",
    department: "AI & Automation",
    type: "Internship",
    workMode: "Remote",
    location: "Remote (India)",
    experience: "0–1 Years",
    shortDescription:
      "Develop applied AI integrations, LLM workflows, conversational assistants, and automated intelligence pipelines.",
    roleOverview:
      "As an AI/ML Intern, you will explore applied artificial intelligence and machine learning solutions for real business workflows. You will work on integrating LLM APIs (Gemini, Claude, OpenAI), building custom knowledge base retrieval systems, and developing automation pipelines.",
    responsibilities: [
      "Build and optimize prompt engineering workflows and retrieval-augmented pipelines.",
      "Integrate AI models and LLM APIs into web and backend applications.",
      "Process and prepare datasets for document extraction and workflow automation.",
      "Evaluate model response quality, latency, and hallucination reduction.",
      "Collaborate with developers to embed intelligent features into user interfaces.",
    ],
    qualifications: [
      "Proficiency in Python and basic data processing libraries (Pandas, NumPy).",
      "Familiarity with modern LLM APIs, LangChain, or vector databases is a strong plus.",
      "Basic understanding of machine learning principles, neural networks, and NLP concepts.",
      "Experience with FastAPI, Flask, or backend API integrations.",
      "Strong analytical mindset and enthusiasm for AI engineering.",
    ],
    skills: ["Python", "FastAPI", "OpenAI / Gemini APIs", "LangChain", "Vector DBs", "Machine Learning"],
    status: "Open",
    postedDate: "2026-03-01",
  },
  {
    id: "uiux-intern",
    slug: "ui-ux-design-intern",
    title: "UI/UX Design Intern",
    department: "Design",
    type: "Internship",
    workMode: "Remote",
    location: "Remote (India)",
    experience: "0–1 Years",
    shortDescription:
      "Craft intuitive user journeys, wireframes, high-fidelity prototypes, and design systems for enterprise SaaS and client platforms.",
    roleOverview:
      "As a UI/UX Design Intern at Axivon Technologies, you will translate user requirements into intuitive, elegant, and modern interface designs. You will work closely with frontend engineers to ensure design integrity, build scalable component libraries, and solve complex UX challenges.",
    responsibilities: [
      "Create wireframes, user flow diagrams, and high-fidelity prototypes in Figma.",
      "Design consistent, accessible UI components aligned with our dark enterprise design system.",
      "Collaborate with frontend developers during implementation and QA reviews.",
      "Conduct heuristic evaluations and usability feedback sessions.",
      "Maintain and expand design system tokens, typography scales, and iconography.",
    ],
    qualifications: [
      "Proficiency in Figma (auto-layout, components, variants, and prototyping).",
      "Understanding of visual hierarchy, typography, color theory, and responsive grids.",
      "Basic understanding of frontend implementation constraints (HTML, CSS, flexbox).",
      "A portfolio or case studies demonstrating UI/UX projects or redesigns.",
      "Empathy for user needs and keen attention to detail.",
    ],
    skills: ["Figma", "UI Design", "UX Research", "Wireframing", "Prototyping", "Design Systems"],
    status: "Open",
    postedDate: "2026-03-01",
  },
];

// Helper functions
export function getOpenJobs(): JobPosition[] {
  return JOB_POSITIONS.filter((j) => j.status === "Open");
}

export function getJobById(id: string): JobPosition | undefined {
  return JOB_POSITIONS.find((j) => j.id === id || j.slug === id);
}

export const CAREER_HIGHLIGHTS = {
  totalOpenings: JOB_POSITIONS.filter((j) => j.status === "Open").length,
  workArrangement: "100% Remote-First",
  experienceLevel: "0–1 Years (Early Career & Internships)",
  focusAreas: ["Web Engineering", "Backend & APIs", "Applied AI", "UI/UX Design"],
};

export const RECRUITMENT_STAGES = [
  {
    number: "01",
    title: "Submit Application",
    description: "Fill out the online application form with your details, resume or portfolio link, and background.",
  },
  {
    number: "02",
    title: "Profile Review",
    description: "Our technical team reviews your skills, projects, GitHub repositories, and past coursework.",
  },
  {
    number: "03",
    title: "Technical Discussion",
    description: "A focused, friendly conversation and practical evaluation centered on your problem-solving approach.",
  },
  {
    number: "04",
    title: "Welcome & Onboarding",
    description: "Selected candidates receive an offer, set up their developer workspace, and begin contributing.",
  },
];

export const CAREERS_FAQS = [
  {
    question: "Who can apply for internship roles at Axivon Technologies?",
    answer:
      "Students, recent graduates, self-taught developers, and career switchers with foundational technical skills and a passion for building software are warmly encouraged to apply.",
  },
  {
    question: "Are all internship positions remote?",
    answer:
      "Yes, our current internship roles are fully remote. You can collaborate from anywhere within India with flexible working hours.",
  },
  {
    question: "Do interns work on real client projects?",
    answer:
      "Yes. We believe in learning by doing. Interns work directly on client applications, internal SaaS platforms, and production-bound code under senior engineer guidance.",
  },
  {
    question: "What should I submit for my resume?",
    answer:
      "You can provide a public link to your resume (via Google Drive, Dropbox, Notion, or LinkedIn) or your personal portfolio website with past projects.",
  },
  {
    question: "How long does the review process take?",
    answer:
      "We review applications on a rolling basis. Suitable candidates typically hear back within 3 to 7 business days via email.",
  },
  {
    question: "Can an internship convert into a full-time role?",
    answer:
      "Yes. High-performing interns who demonstrate strong work ethic, technical growth, and cultural alignment are given primary consideration for full-time junior engineering roles.",
  },
];

export const CANDIDATE_FAQS = CAREERS_FAQS;
export const HIRING_PROCESS_STAGES = RECRUITMENT_STAGES;
export const CAREERS_PAGE_STATS = CAREER_HIGHLIGHTS;

export const WHY_WORK_PILLARS = [
  {
    title: "Real Production Code",
    description: "From month one, your code runs on production servers powering live client applications.",
  },
  {
    title: "Direct Founder Mentorship",
    description: "Work directly alongside senior engineers and technical founders with daily code reviews.",
  },
  {
    title: "100% Remote Flexibility",
    description: "Work from anywhere in India with async workflows and flexible, output-oriented hours.",
  },
  {
    title: "Modern Tech Ecosystem",
    description: "Master modern tools: Next.js 16, React 19, TypeScript, PostgreSQL, and LLM APIs.",
  },
  {
    title: "Fast-Track Full-Time Offers",
    description: "Top-performing interns transition into permanent full-time junior developer roles.",
  },
  {
    title: "Meaningful Ownership",
    description: "Take end-to-end ownership of features, architecture design, and deployment pipelines.",
  },
];
