export interface ServiceDetail {
  id: string;
  number: string;
  title: string;
  shortDescription: string;
  detailedOverview: string;
  deliverables: string[];
  durationEstimate: string;
  focusAreas: string[];
}

export interface CaseStudy {
  id: string;
  category: string;
  title: string;
  briefDescription: string;
  challenge: string;
  approach: string;
  illustrativeOutcome: string;
  imageSrc: string;
  imageAlt: string;
  tags: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
