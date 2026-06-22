export interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  date: string;
  description: string;
  technologies: string[];
  status: "Completed" | "Live" | "In Development";
  liveUrl: string;
  githubUrl: string;
}

export const projects: Project[] = [
  {
    id: "axivon-technologies",
    title: "Axivon Technologies",
    category: "Business Website",
    image: "/portfolio/axivon-technologies.jpg",
    date: "2026-06-22",

    description:
      "Modern technology company website showcasing web development, AI solutions, cloud services, and digital transformation capabilities.",

    technologies: [
      "Next.js",
      "TypeScript",
      "Node.js",
      "JavaScript"
    ],

    status: "Completed",

    liveUrl: "https://axivontech.in/", 

    githubUrl:
      "https://github.com/vikashkumarsingh21/Axivontech",
  },

  {
    id: "krishi-drishti",
    title: "Krishi Drishti",
    category: "Smart Agriculture",
    image: "/portfolio/krishi-drishti.jpg",
    date: "2025-09-04",

    description:
      "AI-powered smart irrigation platform with IoT sensor monitoring, weather analytics, automated irrigation control, and real-time agricultural insights.",

    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "Firebase",
      "Node.js",
      "Bootstrap",
      "IoT"
    ],

    status: "Completed",

    liveUrl:
      "https://krishi-drishti.onrender.com/",

    githubUrl:
      "https://github.com/vikashkumarsingh21/KRISHI-DRISHTI",
  },

  {
    id: "jalmitra",
    title: "JalMitra",
    category: "Environmental Technology",
    image: "/portfolio/jalmitra.jpg",
    date: "2026-06-15",

    description:
      "Smart AI-based solar water cleaning system designed to remove floating waste from water bodies using automation and environmental monitoring.",

    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "Firebase",
      "Node.js",
      "Bootstrap",
      "AI",
      "IoT"
    ],

    status: "Completed",

    liveUrl:
      "https://jal-mitraafrontend.onrender.com/",

    githubUrl:
      "https://github.com/vikashkumarsingh21/jalmitra",
  },

  {
    id: "nani-tathagat",
    title: "Nani Tathagat",
    category: "Business Automation",
    image: "/portfolio/nani-tathagat.jpg",
    date: "2026-06-06",

    description:
      "Business automation and lead generation platform focused on helping companies streamline operations, marketing, sales, and customer engagement.",

    technologies: [
      "HTML",
      "CSS",
      "JavaScript",
      "Node.js",
      "SQL",
      "Bootstrap",
      "Google Apps Script"
    ],

    status: "Completed",

    liveUrl:
      "https://nanitathagat.in/",

    githubUrl:
      "https://github.com/vikashkumarsingh21/nanitathagat",
  },
];