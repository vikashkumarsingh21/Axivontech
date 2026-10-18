"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { BLOG_POSTS, BlogPost } from "@/data/blog-posts";
import {
  Search,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Sparkles,
  Tag,
  Cpu,
  Bot,
  Code2,
} from "lucide-react";

export default function BlogClientView({ posts }: { posts?: BlogPost[] } = {}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const allPosts = posts && posts.length > 0 ? posts : BLOG_POSTS;

  const categories = [
    "All",
    "Web & Custom Software",
    "AI & Automation",
    "Robotics & Embedded Systems",
  ];

  const filteredPosts = useMemo(() => {
    return allPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.keywords.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0];
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-10 space-y-12">
      {/* Blog Page Hero Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Axivon Technology & Engineering Blog</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-[#F3F5F7] tracking-tight leading-[1.12] text-balance">
          Insights, Guides & Engineering Blueprints
        </h1>
        <p className="text-sm sm:text-base text-[#A7B0BC] leading-relaxed text-pretty">
          In-depth technical guides, software evaluation frameworks, AI automation blueprints, and educational robotics resources for businesses, engineering students, and makers in Gujarat.
        </p>
      </div>

      {/* Category Pills & Search Input */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#111115] border border-[#1E2530] p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-tight transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-500 text-[#04130E] shadow-lg shadow-emerald-500/20 font-bold"
                  : "bg-[#151A21] text-[#A7B0BC] hover:text-[#F3F5F7] hover:bg-[#1B222B] border border-[#29313B]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#566171]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, topics..."
            className="w-full bg-[#10151B] border border-[#29313B] text-[#F3F5F7] text-xs rounded-xl pl-9 pr-4 py-2 placeholder:text-[#566171] focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>

      {/* Featured Pillar Hero Article */}
      {featuredPost && selectedCategory === "All" && searchQuery === "" && (
        <div className="relative group overflow-hidden bg-gradient-to-br from-[#121217] via-[#16161f] to-[#0c0c10] border border-[#1E2530] rounded-3xl p-6 md:p-8 hover:border-emerald-500/40 transition-all duration-300 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" /> Featured Pillar Guide
                </span>
                <span className="text-xs text-[#7E8997] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {featuredPost.readingTime}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-[#F3F5F7] tracking-tight group-hover:text-emerald-300 transition-colors leading-[1.2]">
                <Link href={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h2>

              <p className="text-sm text-[#A7B0BC] leading-relaxed line-clamp-3 text-pretty">
                {featuredPost.excerpt}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#1E2530]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono">
                    AX
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#F3F5F7]">{featuredPost.author.name}</p>
                    <p className="text-[11px] text-[#7E8997]">{featuredPost.publishedDate}</p>
                  </div>
                </div>

                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-semibold tracking-tight transition-all shadow-lg shadow-emerald-500/20"
                >
                  Read Master Guide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-64 lg:h-80 w-full rounded-2xl overflow-hidden border border-[#1E2530]">
              <Image
                src={featuredPost.featuredImage}
                alt={featuredPost.featuredImageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-6">
        <h3 className="text-xl font-heading font-bold text-[#F3F5F7] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span>All Published Pillar Articles</span>
        </h3>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 bg-[#111115] border border-[#1E2530] rounded-2xl text-[#A7B0BC] text-sm">
            No articles match your selected category or search query.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col bg-[#111115] border border-[#1E2530] hover:border-emerald-500/40 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-[#0a0a0c] overflow-hidden">
                  <Image
                    src={post.featuredImage}
                    alt={post.featuredImageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#0B0D10]/85 backdrop-blur-md text-emerald-400 border border-emerald-500/25">
                      {post.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#7E8997] font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#566171]" />
                      <span>{post.publishedDate}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-[#566171]" />
                      <span>{post.readingTime}</span>
                    </div>

                    <h4 className="text-base font-heading font-bold text-[#F3F5F7] group-hover:text-emerald-300 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h4>

                    <p className="text-xs text-[#A7B0BC] line-clamp-3 leading-relaxed text-pretty">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#1E2530] flex items-center justify-between">
                    <span className="text-[11px] text-[#7E8997] font-medium">{post.author.name}</span>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors tracking-tight"
                    >
                      Read Guide <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Non-aggressive Blog CTA */}
      <div className="bg-gradient-to-r from-[#111115] via-[#161A22] to-[#111115] border border-[#1E2530] rounded-3xl p-8 text-center space-y-4">
        <h3 className="text-2xl font-heading font-bold text-[#F3F5F7] text-balance">Have a Custom Technology or Robotics Idea?</h3>
        <p className="text-xs sm:text-sm text-[#A7B0BC] max-w-2xl mx-auto leading-relaxed text-pretty">
          From custom business software and mobile apps to embedded IoT systems and hardware prototyping, Axivon Technologies helps Gujarat businesses and innovators bring tech projects to life.
        </p>
        <div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-[#04130E] text-xs font-semibold tracking-tight transition-all shadow-lg shadow-emerald-500/20"
          >
            Contact Axivon Technologies
          </Link>
        </div>
      </div>
    </div>
  );
}
