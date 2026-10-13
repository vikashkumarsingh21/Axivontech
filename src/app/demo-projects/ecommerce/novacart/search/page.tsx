"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X, ArrowRight, Sparkles } from "lucide-react";
import { NOVACART_PRODUCTS, Product } from "@/data/novacart-data";
import ProductCard from "@/components/demo-projects/novacart/ProductCard";

const POPULAR_SUGGESTIONS = [
  "Watch",
  "Backpack",
  "Lantern",
  "Leather",
  "Headphones",
  "Ceramic",
  "Keyboard",
  "Charging",
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/demo-projects/ecommerce/novacart/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/demo-projects/ecommerce/novacart/search`);
    }
  };

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    router.push(`/demo-projects/ecommerce/novacart/search?q=${encodeURIComponent(term)}`);
  };

  const handleClear = () => {
    setQuery("");
    router.push(`/demo-projects/ecommerce/novacart/search`);
  };

  const results: Product[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return NOVACART_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.shortDescription.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#696D66]">
          <Link href="/demo-projects/ecommerce/novacart" className="hover:text-[#1C1D1A]">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1C1D1A]" aria-current="page">
            Search
          </span>
        </nav>

        {/* Search Input Box */}
        <div className="mt-6 max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-[#1C1D1A]">
            Search NovaCart
          </h1>
          <p className="mt-1 text-sm text-[#696D66]">
            Find everyday essentials across accessories, travel bags, home objects, and desk gear.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-6 relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product name, category, material, or keyword..."
              className="w-full rounded-xl border-2 border-[#DCDDD5] bg-white px-12 py-3.5 text-sm font-medium text-[#1C1D1A] placeholder-[#696D66] shadow-xs focus:border-[#1C1D1A] focus:outline-none"
              autoFocus
            />
            <Search className="pointer-events-none absolute left-4 h-5 w-5 text-[#696D66]" />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 text-[#696D66] hover:text-[#1C1D1A] p-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>

          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#696D66] font-medium flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#1C1D1A]" />
              Popular:
            </span>
            {POPULAR_SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleSuggestionClick(term)}
                className="rounded-full border border-[#DCDDD5] bg-white px-3 py-1 font-medium text-[#1C1D1A] hover:bg-[#E8EBE3] transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="mt-10 border-t border-[#DCDDD5] pt-8">
          {query.trim().length === 0 ? (
            /* Prompt state */
            <div className="rounded-2xl border border-[#DCDDD5] bg-white p-8 sm:p-12 text-center">
              <h2 className="text-lg font-bold text-[#1C1D1A]">Discover Everyday Objects</h2>
              <p className="mt-1 text-xs text-[#696D66] max-w-md mx-auto">
                Type in the search field above to search our 24 curated demonstration products, or start by browsing our featured catalogue.
              </p>
              <div className="mt-6">
                <Link
                  href="/demo-projects/ecommerce/novacart/shop"
                  className="inline-flex items-center gap-2 rounded-md bg-[#1C1D1A] px-5 py-2.5 text-xs font-bold text-[#D8F16A]"
                >
                  <span>Browse Full Store Catalogue</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : results.length === 0 ? (
            /* No results state */
            <div className="rounded-2xl border border-dashed border-[#DCDDD5] bg-white p-12 text-center">
              <p className="text-base font-bold text-[#1C1D1A]">
                No products found for &quot;{query}&quot;
              </p>
              <p className="mt-1 text-xs text-[#696D66] max-w-sm mx-auto">
                Try searching for general keywords such as &quot;bag&quot;, &quot;cotton&quot;, &quot;steel&quot;, or &quot;audio&quot;.
              </p>
              <button
                type="button"
                onClick={handleClear}
                className="mt-5 rounded-md border border-[#1C1D1A] bg-white px-4 py-2 text-xs font-semibold text-[#1C1D1A] hover:bg-[#E8EBE3]"
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between pb-6">
                <p className="text-sm font-bold text-[#1C1D1A]">
                  Found {results.length} {results.length === 1 ? "result" : "results"} for &quot;{query}&quot;
                </p>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs font-medium text-[#696D66] hover:text-[#1C1D1A] underline"
                >
                  Clear search
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NovaCartSearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#696D66]">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
