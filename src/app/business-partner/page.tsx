import type { Metadata } from "next";
import Link from "next/link";
import { 
  ArrowRight, 
  Briefcase, 
  CheckCircle2, 
  ChevronDown, 
  Globe, 
  Laptop, 
  LineChart, 
  Smartphone, 
  Users,
  ShieldCheck,
  Building,
  GraduationCap,
  Stethoscope,
  Utensils,
  Store,
  Cpu
} from "lucide-react";

export const metadata: Metadata = {
  title: "AXIVON Business Partner Program | Grow With AXIVON",
  description: "Join the AXIVON Business Partner Program and connect businesses with technology solutions across web, mobile, AI, software and digital services.",
  alternates: {
    canonical: "https://axivontech.in/business-partner",
  },
  openGraph: {
    title: "AXIVON Business Partner Program",
    description: "Connect businesses with the right technology solutions and build long-term opportunities with AXIVON.",
    url: "https://axivontech.in/business-partner",
    siteName: "Axivon Technologies",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AXIVON Business Partner Program",
    description: "Join the AXIVON Business Partner Program.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BusinessPartnerPage() {
  return (
    <main className="bg-[#0a0a0a] text-white selection:bg-[#e8a064] selection:text-[#0a0a0a] min-h-screen font-sans">
      
      {/* 01 — HERO */}
      <section className="relative w-full min-h-[85vh] flex items-center pt-24 pb-16 overflow-hidden border-b border-white/[0.05]">
        <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
          {/* Subtle background element */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#e8a064]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-900/10 rounded-full blur-[100px]" />
        </div>

        <div className="container relative z-10 mx-auto px-6 lg:px-12">
          <div className="max-w-4xl">
            <p className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-[#e8a064]/50" />
              AXIVON Partner Ecosystem
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.1] tracking-tight mb-8">
              Become an AXIVON <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">Business Partner</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed font-light mb-10">
              Connect businesses with the right technology solutions and build long-term opportunities with AXIVON.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Link
                href="/business-partner/apply"
                className="bg-[#e8a064] text-[#1a1a1a] px-8 py-4 rounded-sm font-semibold hover:bg-white transition-colors duration-300"
              >
                Become a Partner
              </Link>
              <Link
                href="#how-it-works"
                className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors duration-300 uppercase tracking-widest text-xs font-semibold"
              >
                How It Works <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 02 — WHAT IS A BUSINESS PARTNER */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0e0e0e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-4">
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4 sticky top-32">
                Program Overview
              </h2>
            </div>
            <div className="lg:col-span-8">
              <h3 className="text-3xl md:text-4xl font-medium leading-snug mb-8 text-white">
                What is an AXIVON Business Partner?
              </h3>
              <div className="text-gray-400 space-y-6 text-lg leading-relaxed max-w-3xl font-light mb-12">
                <p>
                  An AXIVON Business Partner is an external individual or professional who identifies potential business opportunities and connects relevant clients with AXIVON's technology services.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  "Identify potential clients",
                  "Introduce AXIVON",
                  "Submit referrals/leads",
                  "Coordinate communication when required",
                  "Help move genuine opportunities toward project discussions",
                  "Track relevant lead/project information through the partner ecosystem",
                  "Receive applicable commission according to AXIVON's Partner Commission Policy"
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#e8a064] shrink-0 mt-0.5" />
                    <span className="text-gray-300 font-light">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — WHY AXIVON HAS A PARTNER PROGRAM & 04 WHO CAN BECOME A PARTNER */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24">
            
            <div>
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4">
                Our Purpose
              </h2>
              <h3 className="text-3xl font-medium leading-snug mb-6 text-white">
                Why AXIVON Has a Partner Program
              </h3>
              <p className="text-gray-400 font-light leading-relaxed mb-8">
                We believe in the power of local business networks, professional connections, and entrepreneurial communities. The program exists to expand technology adoption through trusted relationships.
              </p>
              <div className="bg-[#111] p-6 border-l-2 border-[#e8a064]">
                <p className="text-lg text-white font-medium italic">
                  "You bring the connection. AXIVON brings the technology expertise."
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4">
                Eligibility
              </h2>
              <h3 className="text-3xl font-medium leading-snug mb-6 text-white">
                Who Can Become a Partner?
              </h3>
              <p className="text-gray-400 font-light leading-relaxed mb-6">
                We are looking for individuals with strong professional or business networks who can identify real technology needs. Applications are reviewed by AXIVON.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <ul className="space-y-3 text-gray-300 font-light">
                  <li>• Entrepreneurs</li>
                  <li>• Freelancers</li>
                  <li>• Consultants</li>
                  <li>• Business professionals</li>
                  <li>• IT professionals</li>
                </ul>
                <ul className="space-y-3 text-gray-300 font-light">
                  <li>• Marketing professionals</li>
                  <li>• Students / Graduates</li>
                  <li>• Local business connectors</li>
                  <li>• Industry professionals</li>
                </ul>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* BP-0102 — ROLE & RESPONSIBILITIES */}
      <section id="how-it-works" className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0e0e0e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4">
              Your Role
            </h2>
            <h3 className="text-3xl md:text-5xl font-medium leading-tight">
              What Does an AXIVON Business Partner Do?
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
            <div className="space-y-4 border border-white/5 bg-[#111] p-8 rounded-sm">
              <span className="text-[#e8a064] font-mono text-xl block mb-2">01 — Identify</span>
              <h4 className="text-xl font-medium">Identify</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Identify businesses or organizations that may need technology solutions.
              </p>
            </div>
            <div className="space-y-4 border border-white/5 bg-[#111] p-8 rounded-sm">
              <span className="text-[#e8a064] font-mono text-xl block mb-2">02 — Introduce</span>
              <h4 className="text-xl font-medium">Introduce</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Introduce the relevant opportunity to AXIVON.
              </p>
            </div>
            <div className="space-y-4 border border-white/5 bg-[#111] p-8 rounded-sm">
              <span className="text-[#e8a064] font-mono text-xl block mb-2">03 — Refer</span>
              <h4 className="text-xl font-medium">Refer</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Submit the required lead information through the AXIVON referral system.
              </p>
            </div>
            <div className="space-y-4 border border-white/5 bg-[#111] p-8 rounded-sm">
              <span className="text-[#e8a064] font-mono text-xl block mb-2">04 — Connect</span>
              <h4 className="text-xl font-medium">Connect</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Coordinate with AXIVON when client communication or meetings are required.
              </p>
            </div>
            <div className="space-y-4 border border-white/5 bg-[#111] p-8 rounded-sm">
              <span className="text-[#e8a064] font-mono text-xl block mb-2">05 — Support Qualification</span>
              <h4 className="text-xl font-medium">Support Qualification</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Help provide relevant context about the opportunity when appropriate.
              </p>
            </div>
            <div className="space-y-4 border border-white/5 bg-[#111] p-8 rounded-sm">
              <span className="text-[#e8a064] font-mono text-xl block mb-2">06 — Track</span>
              <h4 className="text-xl font-medium">Track</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Use the partner ecosystem to follow the progress of eligible referrals/projects.
              </p>
            </div>
            <div className="space-y-4 border border-white/5 bg-[#111] p-8 rounded-sm md:col-span-2 lg:col-span-3">
              <span className="text-[#e8a064] font-mono text-xl block mb-2">07 — Grow</span>
              <h4 className="text-xl font-medium">Grow</h4>
              <p className="text-gray-400 text-sm font-light leading-relaxed">
                Build a long-term relationship with AXIVON through genuine business opportunities.
              </p>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto mt-20 p-8 border border-white/10 bg-[#0a0a0a]">
            <h4 className="text-xl font-medium mb-6 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#e8a064]" /> Partner Responsibility Boundaries</h4>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400 text-sm font-light">
              <li>• Provide genuine information</li>
              <li>• Respect client privacy</li>
              <li>• Avoid misleading claims</li>
              <li>• Avoid making unauthorized commitments on behalf of AXIVON</li>
              <li>• Avoid changing referral attribution</li>
              <li>• Follow AXIVON partner policies</li>
              <li>• Maintain professional communication</li>
            </ul>
          </div>
        </div>
      </section>

      {/* BP-0103 — PARTNER BENEFITS */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-4">
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4 sticky top-32">
                Partner Benefits
              </h2>
            </div>
            <div className="lg:col-span-8">
              <h3 className="text-3xl md:text-5xl font-medium leading-tight mb-12">
                Why Partner With AXIVON?
              </h3>
              
              <div className="space-y-12">
                <div>
                  <h4 className="text-xl font-medium mb-3">Dedicated Partner Identity</h4>
                  <p className="text-gray-400 font-light leading-relaxed">Approved partners receive a dedicated partner identity within the AXIVON ecosystem.</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Referral Tracking</h4>
                  <p className="text-gray-400 font-light leading-relaxed">Partners can track relevant referrals and opportunities in real-time.</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Project Visibility</h4>
                  <p className="text-gray-400 font-light leading-relaxed">Approved partners can access applicable project information through their partner environment.</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Commission Visibility</h4>
                  <p className="text-gray-400 font-light leading-relaxed">Eligible commissions can be tracked according to AXIVON's applicable commission policy.</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Partner Resources</h4>
                  <p className="text-gray-400 font-light leading-relaxed">Access to AXIVON-provided business and service resources.</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Professional Support</h4>
                  <p className="text-gray-400 font-light leading-relaxed">Coordination and support from the experienced AXIVON team.</p>
                </div>
                <div>
                  <h4 className="text-xl font-medium mb-3">Long-Term Partnership</h4>
                  <p className="text-gray-400 font-light leading-relaxed">Opportunity to build an ongoing, rewarding business relationship with AXIVON.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERSHIP PROCESS & HOW REFERRALS WORK */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0e0e0e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            
            {/* Partnership Lifecycle Timeline */}
            <div>
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-6">
                The Lifecycle
              </h2>
              <h3 className="text-3xl font-medium mb-10">Partnership Process</h3>
              
              <div className="relative border-l border-white/10 ml-4 md:ml-6 space-y-8 pb-4">
                {[
                  "Apply",
                  "Application Review",
                  "Meeting / Discussion",
                  "Approval",
                  "Partner Account",
                  "Referral",
                  "Lead Qualification",
                  "Confirmed Project",
                  "Contract & Payment",
                  "Project Execution",
                  "Commission / Payout"
                ].map((step, idx) => (
                  <div key={idx} className="relative pl-8">
                    <span className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#0e0e0e] border-2 ${idx < 5 ? 'border-[#e8a064]' : 'border-white/20'}`} />
                    <h4 className="text-base text-gray-300 font-light">{step}</h4>
                  </div>
                ))}
              </div>
            </div>

            {/* How Referrals Work */}
            <div>
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-6">
                The Mechanism
              </h2>
              <h3 className="text-3xl font-medium mb-10">How Referrals Work</h3>
              
              <div className="space-y-8">
                <div>
                  <h4 className="text-lg font-medium mb-2"><span className="text-[#e8a064] mr-2">Step 1:</span> Identify</h4>
                  <p className="text-gray-400 text-sm font-light">Identify a potential client with a real technology need.</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2"><span className="text-[#e8a064] mr-2">Step 2:</span> Submit</h4>
                  <p className="text-gray-400 text-sm font-light">Share/submit the opportunity through AXIVON's partner system.</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2"><span className="text-[#e8a064] mr-2">Step 3:</span> Connect</h4>
                  <p className="text-gray-400 text-sm font-light">AXIVON reviews the submission and contacts/coordinates with the client.</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2"><span className="text-[#e8a064] mr-2">Step 4:</span> Qualify</h4>
                  <p className="text-gray-400 text-sm font-light">If qualified, the opportunity can move toward a confirmed project.</p>
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2"><span className="text-[#e8a064] mr-2">Step 5:</span> Execute</h4>
                  <p className="text-gray-400 text-sm font-light">Project, contract, payment and commission processes follow AXIVON's applicable policies.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SERVICES & INDUSTRIES */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12">
          
          <div className="mb-24">
            <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-6 text-center">
              Our Capabilities
            </h2>
            <h3 className="text-3xl md:text-4xl font-medium leading-tight text-center max-w-3xl mx-auto mb-16">
              What Can You Refer to AXIVON?
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { name: "Website Development", icon: Globe },
                { name: "Web Application Development", icon: Laptop },
                { name: "Mobile App Development", icon: Smartphone },
                { name: "AI Development", icon: Cpu },
                { name: "Machine Learning", icon: LineChart },
                { name: "Custom Software Development", icon: Briefcase },
                { name: "Cloud Solutions", icon: Globe },
                { name: "UI/UX Design", icon: Laptop },
                { name: "SEO", icon: LineChart },
                { name: "Digital Marketing", icon: Users },
                { name: "Chatbot Development", icon: Cpu },
                { name: "Business Automation", icon: Briefcase }
              ].map((service, i) => (
                <div key={i} className="flex flex-col items-center justify-center p-6 bg-[#111] border border-white/5 rounded-sm text-center">
                  <service.icon className="w-8 h-8 text-[#e8a064] mb-4" />
                  <span className="text-gray-300 font-light text-sm">{service.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-6 text-center">
              Target Markets
            </h2>
            <h3 className="text-3xl md:text-4xl font-medium leading-tight text-center max-w-3xl mx-auto mb-16">
              Industries We Serve
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { name: "Schools", icon: GraduationCap },
                { name: "Colleges", icon: GraduationCap },
                { name: "Universities", icon: GraduationCap },
                { name: "Hospitals", icon: Stethoscope },
                { name: "Healthcare", icon: Stethoscope },
                { name: "Restaurants", icon: Utensils },
                { name: "Hotels", icon: Building },
                { name: "Coaching Centers", icon: Users },
                { name: "Shops", icon: Store },
                { name: "Shopping Malls", icon: Building },
                { name: "Other Businesses", icon: Briefcase }
              ].map((ind, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-[#111] border border-white/5 rounded-sm">
                  <ind.icon className="w-4 h-4 text-[#e8a064]" />
                  <span className="text-gray-300 font-light text-sm">{ind.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* BP-0104 — FAQ */}
      <section className="py-14 sm:py-20 lg:py-32 border-b border-white/[0.05] bg-[#0e0e0e]">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
            <div className="lg:col-span-4">
              <h2 className="text-[#e8a064] font-semibold tracking-widest text-xs uppercase mb-4 sticky top-32">
                Frequently Asked
              </h2>
            </div>
            <div className="lg:col-span-8 space-y-2">
              
              {[
                {
                  q: "What is an AXIVON Business Partner?",
                  a: "An AXIVON Business Partner is a professional who identifies opportunities and refers clients to AXIVON for technology services."
                },
                {
                  q: "Who can become an AXIVON Business Partner?",
                  a: "Entrepreneurs, freelancers, consultants, students, and professionals with a strong network can apply. Applications are subject to AXIVON review."
                },
                {
                  q: "Do I need to be a technical professional?",
                  a: "No. You bring the connection and business relationship; we bring the technology expertise and engineering."
                },
                {
                  q: "What does a Business Partner do?",
                  a: "Partners identify clients, introduce them to AXIVON, submit the referral through our platform, and track the progress of the project."
                },
                {
                  q: "How do I refer a client?",
                  a: "Approved partners will receive access to the AXIVON Partner Ecosystem, where they can securely submit lead information and requirements."
                },
                {
                  q: "What happens after I submit a lead?",
                  a: "AXIVON reviews the submission and will coordinate with you and the client to discuss the opportunity and qualify the requirement."
                },
                {
                  q: "When does a lead become a project?",
                  a: "A lead becomes a project after successful qualification, requirement analysis, proposal acceptance, and contract signing."
                },
                {
                  q: "How are commissions handled?",
                  a: "Commissions are processed according to AXIVON's Partner Commission Policy once a project is confirmed and applicable payments are verified."
                },
                {
                  q: "Can I track my referrals?",
                  a: "Yes. Approved partners receive an environment where they can track the status of their leads, projects, and eligible commissions."
                },
                {
                  q: "Will I get a dedicated partner dashboard?",
                  a: "Yes, approved partners gain access to a dedicated dashboard within the AXIVON portal to manage their partnership activities."
                },
                {
                  q: "How does the application process work?",
                  a: "You submit an application providing your details. The AXIVON team reviews it, may schedule a brief discussion, and if approved, your account will be activated."
                },
                {
                  q: "Does submitting an application guarantee approval?",
                  a: "No. All applications are reviewed by the AXIVON team to ensure a good fit, and approval is at AXIVON's discretion."
                }
              ].map((faq, i) => (
                <details key={i} className="group border-b border-white/10 pb-4 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer items-center justify-between py-4 text-lg font-medium text-white">
                    {faq.q}
                    <span className="transition duration-300 group-open:-rotate-180 text-gray-500">
                      <ChevronDown className="w-5 h-5" />
                    </span>
                  </summary>
                  <div className="text-gray-400 font-light leading-relaxed pb-4 pr-8">
                    {faq.a}
                  </div>
                </details>
              ))}

            </div>
          </div>
        </div>
      </section>

      {/* BP-0105 — APPLICATION CTA & POLICY LINKS */}
      <section className="py-20 sm:py-24 lg:py-32 bg-[#e8a064] text-[#0a0a0a]">
        <div className="container mx-auto px-6 lg:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-medium mb-8 max-w-3xl mx-auto">
            Ready to build opportunities with AXIVON Technologies?
          </h2>
          <Link
            href="/business-partner/apply"
            className="inline-flex items-center gap-3 bg-[#0a0a0a] text-white px-8 py-4 rounded-sm font-semibold hover:bg-[#1a1a1a] transition-colors duration-300 mb-12"
          >
            Apply to Become an AXIVON Business Partner <ArrowRight className="w-4 h-4" />
          </Link>
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-[#1a1a1a]">
            <Link href="/terms-and-conditions" className="hover:underline">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/business-partner/policy" className="hover:underline">Partner & Referral Policy</Link>
          </div>
        </div>
      </section>

    </main>
  );
}
