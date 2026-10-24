"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS, BlogPost, ProjectIdea } from "@/data/blog-posts";
import { sanitizeHtml } from "@/lib/sanitize";
import {
  Calendar,
  Clock,
  ChevronRight,
  ChevronDown,
  List,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  FolderGit2,
  Sparkles,
  BookOpen,
  MessageSquare,
  Search,
} from "lucide-react";

interface ArticleDetailViewProps {
  post: BlogPost;
}

export default function ArticleDetailView({ post }: ArticleDetailViewProps) {
  // FAQ accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  
  // Project Ideas filter & search state
  const [ideaDifficulty, setIdeaDifficulty] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [ideaSearch, setIdeaSearch] = useState<string>("");

  // Mobile TOC toggle state
  const [isTocMobileOpen, setIsTocMobileOpen] = useState<boolean>(false);

  // Compute related posts
  const relatedPosts = BLOG_POSTS.filter((p) => post.relatedSlugs.includes(p.slug));

  // Flatten project ideas if present
  const allProjectIdeas: (ProjectIdea & { level: "Beginner" | "Intermediate" | "Advanced" })[] = post.projectIdeas
    ? [
        ...post.projectIdeas.beginner.map((i) => ({ ...i, level: "Beginner" as const })),
        ...post.projectIdeas.intermediate.map((i) => ({ ...i, level: "Intermediate" as const })),
        ...post.projectIdeas.advanced.map((i) => ({ ...i, level: "Advanced" as const })),
      ]
    : [];

  const filteredProjectIdeas = allProjectIdeas.filter((idea) => {
    const matchesDifficulty = ideaDifficulty === "All" || idea.level === ideaDifficulty;
    const matchesSearch =
      ideaSearch.trim() === "" ||
      idea.name.toLowerCase().includes(ideaSearch.toLowerCase()) ||
      idea.objective.toLowerCase().includes(ideaSearch.toLowerCase()) ||
      idea.components.toLowerCase().includes(ideaSearch.toLowerCase()) ||
      idea.skillsLearned.toLowerCase().includes(ideaSearch.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  return (
    <article className="min-h-screen pb-20">
      {/* Top Banner & Hero */}
      <header className="bg-gradient-to-b from-[#12161E] via-[#0E1116] to-[#0B0D10] border-b border-[#1E2530] pt-10 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-[#7E8997] font-mono">
            <Link href="/" className="hover:text-emerald-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#566171]" />
            <Link href="/blog" className="hover:text-emerald-400 transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#566171]" />
            <span className="text-[#A7B0BC] font-medium truncate max-w-[200px] sm:max-w-md">
              {post.category}
            </span>
          </nav>

          {/* Category Badge & Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold font-mono uppercase tracking-wider">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-xs text-[#7E8997] font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {post.publishedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                {post.readingTime}
              </span>
            </div>
          </div>

          {/* Title & Excerpt */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-[#F3F5F7] tracking-tight leading-[1.12] text-balance">
              {post.title}
            </h1>
            <p className="text-base sm:text-lg text-[#A7B0BC] leading-relaxed text-pretty font-normal">
              {post.excerpt}
            </p>
          </div>

          {/* Author info card */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-emerald-500/30 bg-[#151A21] flex-shrink-0">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F3F5F7]">{post.author.name}</p>
              <p className="text-xs text-[#7E8997]">{post.author.role}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid: Left/Right layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Article Body Column */}
          <main className="lg:col-span-8 space-y-10">
            {/* Video Embeds */}
            {post.videos && post.videos.length > 0 && (
              <div className="mt-8 space-y-8">
                {post.videos.map((video, idx) => (
                  <div key={idx} className="aspect-w-16 aspect-h-9">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.youtubeId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg"
                    ></iframe>
                    <p className="mt-2 text-sm text-gray-400">
                      {video.title} – {video.channelName}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {/* Featured Image */}

            {/* Mobile Table of Contents Accordion */}
            {post.toc && post.toc.length > 0 && (
              <div className="lg:hidden bg-[#111115] border border-[#1E2530] rounded-xl p-4">
                <button
                  onClick={() => setIsTocMobileOpen(!isTocMobileOpen)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-[#F3F5F7]"
                >
                  <span className="flex items-center gap-2">
                    <List className="w-4 h-4 text-emerald-400" />
                    Table of Contents ({post.toc.length} Sections)
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7E8997] transition-transform ${
                      isTocMobileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isTocMobileOpen && (
                  <nav className="mt-3 pt-3 border-t border-[#1E2530] space-y-2 text-xs">
                    {post.toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setIsTocMobileOpen(false)}
                        className={`block text-[#A7B0BC] hover:text-emerald-400 transition-colors ${
                          item.level === 3 ? "pl-4 text-[#7E8997]" : "font-medium"
                        }`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                )}
              </div>
            )}

            {/* Article Content HTML */}
            <div
              className="prose prose-invert max-w-none prose-readable prose-headings:scroll-mt-24 prose-headings:font-heading prose-headings:font-bold prose-headings:text-[#F3F5F7] prose-headings:tracking-tight prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:border-b prose-h2:border-[#1E2530] prose-h2:pb-3 prose-h2:mt-12 prose-h2:mb-5 prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-[#A7B0BC] prose-p:leading-[1.74] prose-p:mb-5 prose-li:text-[#A7B0BC] prose-li:leading-[1.7] prose-strong:text-[#F3F5F7] prose-strong:font-semibold prose-a:text-emerald-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-[#1E2530] prose-th:bg-[#151A21] prose-th:p-3 prose-th:text-[#F3F5F7] prose-th:font-heading prose-td:border prose-td:border-[#1E2530] prose-td:p-3 prose-td:text-[#A7B0BC]"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.contentHtml) }}
            />

            {/* Interactive Project Ideas Section (Blog 3 only) */}
            {post.projectIdeas && (
              <div id="project-ideas-directory" className="space-y-6 pt-8 border-t border-[#1E2530]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2 font-mono">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>30 Handpicked Robotics Project Blueprints</span>
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-[#F3F5F7]">
                      Interactive Project Finder
                    </h3>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((diff) => (
                      <button
                        key={diff}
                        onClick={() => setIdeaDifficulty(diff)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          ideaDifficulty === diff
                            ? "bg-amber-500 text-black font-bold"
                            : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search input */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={ideaSearch}
                    onChange={(e) => setIdeaSearch(e.target.value)}
                    placeholder="Search projects by keyword, sensor, board, or topic..."
                    className="w-full bg-[#141419] border border-gray-800 text-white text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Projects Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-800 bg-[#111115]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#18181f] text-gray-400 border-b border-gray-800 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Project Name</th>
                        <th className="p-3.5">Difficulty</th>
                        <th className="p-3.5">Key Components</th>
                        <th className="p-3.5">Objective & Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60">
                      {filteredProjectIdeas.map((idea, idx) => (
                        <tr key={idx} className="hover:bg-gray-900/50 transition-colors">
                          <td className="p-3.5 font-semibold text-white max-w-[180px]">
                            {idea.name}
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span
                              className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                idea.level === "Beginner"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : idea.level === "Intermediate"
                                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {idea.level}
                            </span>
                          </td>
                          <td className="p-3.5 text-gray-300 max-w-[220px]">
                            {idea.components}
                          </td>
                          <td className="p-3.5 text-gray-400 max-w-[260px]">
                            {idea.objective}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProjectIdeas.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-xs">
                      No project ideas match your search query or filter.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Interactive FAQs Accordion Section */}
            {post.faqs && post.faqs.length > 0 && (
              <div id="faqs" className="space-y-6 pt-8 border-t border-[#1E2530]">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-2xl font-heading font-bold text-[#F3F5F7]">
                    Frequently Asked Questions
                  </h3>
                </div>

                <div className="space-y-3">
                  {post.faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        className="bg-[#111115] border border-[#1E2530] rounded-xl overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left text-sm font-heading font-semibold text-[#F3F5F7] hover:text-emerald-400 transition-colors"
                        >
                          <span className="pr-4">{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-[#7E8997] shrink-0 transition-transform ${
                              isOpen ? "rotate-180 text-emerald-400" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-xs sm:text-sm text-[#A7B0BC] leading-[1.72] border-t border-[#1E2530] pt-3 text-pretty">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Soft CTA Box */}
            <div className="bg-gradient-to-r from-[#151A21] via-[#1A202A] to-[#151A21] border border-[#29313B] rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4" />
                <span>Engineering & Consultation Advisory</span>
              </div>
              <h4 className="text-xl font-heading font-bold text-[#F3F5F7]">
                Need Help Planning Your Software, AI, or Hardware Architecture?
              </h4>
              <p className="text-xs sm:text-sm text-[#A7B0BC] leading-relaxed text-pretty">
                Whether you need a custom web application, an enterprise AI integration, or technical guidance for embedded robotics development across India or globally, our remote engineering team is ready to assist.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-semibold tracking-tight transition-all shadow-lg shadow-emerald-500/25"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Schedule Technical Consultation
                </Link>
                <Link
                  href="/services/web-development"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B222B] hover:bg-[#202833] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#29313B] text-xs font-semibold tracking-tight transition-all"
                >
                  Explore Web Services
                </Link>
              </div>
            </div>
          </main>

          {/* Sidebar Column (Desktop Table of Contents & Quick Links) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Sticky TOC Box */}
              {post.toc && post.toc.length > 0 && (
                <div className="bg-[#111116] border border-[#1E2530] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-[#F3F5F7] font-heading font-bold text-sm border-b border-[#1E2530] pb-3">
                    <List className="w-4 h-4 text-emerald-400" />
                    <span>Table of Contents</span>
                  </div>
                  <nav className="space-y-2 text-xs max-h-[60vh] overflow-y-auto pr-2">
                    {post.toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-[#A7B0BC] hover:text-emerald-400 transition-colors py-1 ${
                          item.level === 3 ? "pl-3 text-[#7E8997]" : "font-medium"
                        }`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Keywords Tag Cloud Box */}
              <div className="bg-[#111116] border border-[#1E2530] rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#7E8997] uppercase tracking-wider">
                  Target Topics & Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {post.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#151A21] border border-[#29313B] text-[#A7B0BC] text-[11px] font-mono"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Contact Banner */}
              <div className="bg-gradient-to-br from-[#151A21] to-[#1B222B] border border-[#29313B] rounded-2xl p-5 space-y-3 text-center">
                <BookOpen className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-heading font-bold text-[#F3F5F7]">Have a Specific Project Requirement?</h4>
                <p className="text-xs text-[#A7B0BC] leading-relaxed">
                  Talk directly to our engineering architects in Gujarat.
                </p>
                <Link
                  href="/contact"
                  className="inline-block w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-semibold tracking-tight transition-colors shadow-md shadow-emerald-500/20"
                >
                  Contact Engineering Team
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#1E2530] space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                  Continue Reading
                </span>
                <h3 className="text-2xl font-heading font-bold text-[#F3F5F7] mt-1">
                  Related Guides & Articles
                </h3>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors tracking-tight"
              >
                <span>View All Articles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/blog/${rel.slug}`}
                  className="group bg-[#111115] border border-[#1E2530] hover:border-emerald-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between p-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#7E8997] font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-medium">
                        {rel.category}
                      </span>
                      <span>{rel.readingTime}</span>
                    </div>
                    <h4 className="text-lg font-heading font-bold text-[#F3F5F7] group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-[#A7B0BC] line-clamp-2 leading-relaxed text-pretty">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform tracking-tight">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Strong Bottom CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-[#12161E] via-[#161B24] to-[#0E1116] border border-[#29313B] rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Axivon Technologies — Engineering Excellence</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-heading font-extrabold text-[#F3F5F7] max-w-2xl mx-auto leading-tight text-balance">
            Ready to Build Next-Generation Software, AI Systems, or Robotics Projects?
          </h2>
          <p className="text-xs sm:text-sm text-[#A7B0BC] max-w-xl mx-auto leading-relaxed text-pretty">
            From enterprise web platforms and custom mobile apps to IoT telemetry and school/college robotics solutions, Axivon Technologies provides end-to-end engineering support in Gujarat.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] font-semibold text-xs sm:text-sm tracking-tight transition-all shadow-xl shadow-emerald-500/25"
            >
              <span>Get Free Technical Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#151A21] hover:bg-[#1B222B] text-[#A7B0BC] hover:text-[#F3F5F7] border border-[#29313B] font-semibold text-xs sm:text-sm tracking-tight transition-all"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
