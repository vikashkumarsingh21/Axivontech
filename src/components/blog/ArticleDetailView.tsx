"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS, BlogPost, ProjectIdea } from "@/data/blog-posts";
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
      <header className="bg-gradient-to-b from-[#121218] via-[#0d0d12] to-[#0a0a0c] border-b border-gray-800/80 pt-10 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 space-y-6">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <Link href="/blog" className="hover:text-indigo-400 transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-300 font-medium truncate max-w-[200px] sm:max-w-md">
              {post.category}
            </span>
          </nav>

          {/* Category Badge & Meta */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold">
              {post.category}
            </span>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {post.publishedDate}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                {post.readingTime}
              </span>
            </div>
          </div>

          {/* Title & Excerpt */}
          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {post.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-light">
              {post.excerpt}
            </p>
          </div>

          {/* Author info card */}
          <div className="flex items-center gap-3 pt-2">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-indigo-500/40 bg-gray-900 flex-shrink-0">
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{post.author.name}</p>
              <p className="text-xs text-gray-400">{post.author.role}</p>
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
              <div className="lg:hidden bg-[#121217] border border-gray-800 rounded-xl p-4">
                <button
                  onClick={() => setIsTocMobileOpen(!isTocMobileOpen)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-white"
                >
                  <span className="flex items-center gap-2">
                    <List className="w-4 h-4 text-indigo-400" />
                    Table of Contents ({post.toc.length} Sections)
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isTocMobileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isTocMobileOpen && (
                  <nav className="mt-3 pt-3 border-t border-gray-800 space-y-2 text-xs">
                    {post.toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={() => setIsTocMobileOpen(false)}
                        className={`block text-gray-300 hover:text-indigo-400 transition-colors ${
                          item.level === 3 ? "pl-4 text-gray-400" : "font-medium"
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
              className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:font-bold prose-headings:text-white prose-h2:text-2xl prose-h2:border-b prose-h2:border-gray-800 prose-h2:pb-3 prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4 prose-li:text-gray-300 prose-strong:text-white prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-table:w-full prose-table:border-collapse prose-th:border prose-th:border-gray-800 prose-th:bg-gray-900 prose-th:p-3 prose-th:text-white prose-td:border prose-td:border-gray-800 prose-td:p-3 prose-td:text-gray-300"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* Interactive Project Ideas Section (Blog 3 only) */}
            {post.projectIdeas && (
              <div id="project-ideas-directory" className="space-y-6 pt-8 border-t border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
                      <FolderGit2 className="w-3.5 h-3.5" />
                      <span>30 Handpicked Robotics Project Blueprints</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
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
              <div id="faqs" className="space-y-6 pt-8 border-t border-gray-800">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-2xl font-bold text-white">
                    Frequently Asked Questions
                  </h3>
                </div>

                <div className="space-y-3">
                  {post.faqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div
                        key={index}
                        className="bg-[#121217] border border-gray-800 rounded-xl overflow-hidden transition-colors"
                      >
                        <button
                          onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                          className="w-full flex items-center justify-between p-4 text-left text-sm font-semibold text-white hover:text-indigo-400 transition-colors"
                        >
                          <span className="pr-4">{faq.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
                              isOpen ? "rotate-180 text-indigo-400" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-4 pb-4 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-gray-800/60 pt-3">
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
            <div className="bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-gray-900 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Engineering & Consultation Advisory</span>
              </div>
              <h4 className="text-xl font-bold text-white">
                Need Help Planning Your Software, AI, or Hardware Architecture?
              </h4>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Whether you need a custom web application, an enterprise AI integration, or technical guidance for embedded robotics development in Rajkot, Ahmedabad, or anywhere in Gujarat, our senior engineering team is ready to assist.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Schedule Technical Consultation
                </Link>
                <Link
                  href="/services/web-development"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 text-xs font-semibold transition-all"
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
                <div className="bg-[#111116] border border-gray-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm border-b border-gray-800 pb-3">
                    <List className="w-4 h-4 text-indigo-400" />
                    <span>Table of Contents</span>
                  </div>
                  <nav className="space-y-2 text-xs max-h-[60vh] overflow-y-auto pr-2">
                    {post.toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`block text-gray-400 hover:text-indigo-400 transition-colors py-1 ${
                          item.level === 3 ? "pl-3 text-gray-500" : "font-medium"
                        }`}
                      >
                        {item.title}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Keywords Tag Cloud Box */}
              <div className="bg-[#111116] border border-gray-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Target Topics & Technologies
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {post.keywords.map((kw, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-gray-900 border border-gray-800 text-gray-300 text-[11px]"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Contact Banner */}
              <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-2xl p-5 space-y-3 text-center">
                <BookOpen className="w-8 h-8 text-indigo-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Have a Specific Project Requirement?</h4>
                <p className="text-xs text-gray-300">
                  Talk directly to our engineering architects in Gujarat.
                </p>
                <Link
                  href="/contact"
                  className="inline-block w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  Contact Engineering Team
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-gray-800 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                  Continue Reading
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Related Guides & Articles
                </h3>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
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
                  className="group bg-[#111115] border border-gray-800 hover:border-indigo-500/40 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between p-6"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">
                        {rel.category}
                      </span>
                      <span>{rel.readingTime}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                      {rel.excerpt}
                    </p>
                  </div>
                  <div className="pt-4 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Strong Bottom CTA Banner */}
        <div className="mt-16 bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-black border border-indigo-500/40 rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Axivon Technologies — Engineering Excellence</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white max-w-2xl mx-auto leading-tight">
            Ready to Build Next-Generation Software, AI Systems, or Robotics Projects?
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            From enterprise web platforms and custom mobile apps to IoT telemetry and school/college robotics solutions, Axivon Technologies provides end-to-end engineering support in Gujarat.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-xl shadow-indigo-600/30"
            >
              <span>Get Free Technical Proposal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 font-semibold text-xs sm:text-sm transition-all"
            >
              View Our Services
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
