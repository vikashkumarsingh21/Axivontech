"use client";

import React, { useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  RotateCcw,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  NOVACART_PRODUCTS,
  NOVACART_CATEGORIES,
  Product,
} from "@/data/novacart-data";
import ProductCard from "@/components/demo-projects/novacart/ProductCard";

type SortOption = "recommended" | "price-asc" | "price-desc" | "name-asc";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialFilter = searchParams.get("filter") || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [onlyNew, setOnlyNew] = useState<boolean>(initialFilter === "new");
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(initialFilter === "featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter and sort pipeline
  const filteredProducts = useMemo(() => {
    let list: Product[] = [...NOVACART_PRODUCTS];

    // Category filter
    if (selectedCategory !== "all") {
      list = list.filter((p) => p.categorySlug === selectedCategory);
    }

    // New arrivals pill
    if (onlyNew) {
      list = list.filter((p) => p.isNewArrival);
    }

    // Featured pill
    if (onlyFeatured) {
      list = list.filter((p) => p.isFeatured);
    }

    // Max Price filter
    list = list.filter((p) => p.price <= maxPrice);

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "recommended":
      default:
        // Featured and top rated first
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    return list;
  }, [selectedCategory, onlyNew, onlyFeatured, maxPrice, searchQuery, sortBy]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setMaxPrice(10000);
    setSortBy("recommended");
    setOnlyNew(false);
    setOnlyFeatured(false);
  };

  const isFiltered =
    selectedCategory !== "all" ||
    searchQuery.trim().length > 0 ||
    maxPrice < 10000 ||
    onlyNew ||
    onlyFeatured;

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col gap-2 border-b border-[#DCDDD5] pb-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#696D66]">
            <Link href="/demo-projects/ecommerce/novacart" className="hover:text-[#1C1D1A]">
              Home
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#1C1D1A]" aria-current="page">
              Shop Catalogue
            </span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#1C1D1A] sm:text-4xl">
                All Products
              </h1>
              <p className="mt-1 text-sm text-[#696D66]">
                Showing {filteredProducts.length} of {NOVACART_PRODUCTS.length} curated everyday essentials
              </p>
            </div>

            {/* Mobile Filter Toggle & Desktop Sort */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="inline-flex items-center gap-2 rounded-md border border-[#DCDDD5] bg-white px-3.5 py-2 text-xs font-semibold text-[#1C1D1A] lg:hidden hover:bg-[#E8EBE3]"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters {isFiltered && "(Active)"}</span>
              </button>

              <div className="flex items-center gap-2">
                <label htmlFor="shop-sort" className="text-xs font-medium text-[#696D66] hidden sm:inline">
                  Sort by:
                </label>
                <div className="relative">
                  <select
                    id="shop-sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="appearance-none rounded-md border border-[#DCDDD5] bg-white py-2 pl-3 pr-8 text-xs font-semibold text-[#1C1D1A] focus:border-[#1C1D1A] focus:outline-none"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A to Z</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#696D66]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Filter Badges */}
        {isFiltered && (
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <span className="text-xs text-[#696D66] font-medium">Active Filters:</span>
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EBE3] px-3 py-1 text-xs font-medium text-[#1C1D1A]">
                Category: {NOVACART_CATEGORIES.find((c) => c.slug === selectedCategory)?.name || selectedCategory}
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="hover:text-red-600"
                  aria-label="Remove category filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {onlyNew && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EBE3] px-3 py-1 text-xs font-medium text-[#1C1D1A]">
                New Arrivals
                <button
                  type="button"
                  onClick={() => setOnlyNew(false)}
                  className="hover:text-red-600"
                  aria-label="Remove new filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {onlyFeatured && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EBE3] px-3 py-1 text-xs font-medium text-[#1C1D1A]">
                Featured
                <button
                  type="button"
                  onClick={() => setOnlyFeatured(false)}
                  className="hover:text-red-600"
                  aria-label="Remove featured filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {maxPrice < 10000 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EBE3] px-3 py-1 text-xs font-medium text-[#1C1D1A]">
                Under ₹{maxPrice.toLocaleString("en-IN")}
                <button
                  type="button"
                  onClick={() => setMaxPrice(10000)}
                  className="hover:text-red-600"
                  aria-label="Reset price filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E8EBE3] px-3 py-1 text-xs font-medium text-[#1C1D1A]">
                Search: &quot;{searchQuery}&quot;
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-red-600"
                  aria-label="Clear search query"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#1C1D1A] underline underline-offset-2 hover:text-[#696D66]"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset all</span>
            </button>
          </div>
        )}

        {/* Main 2-column layout */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar Filters (Desktop & Mobile Drawer) */}
          <aside
            className={`space-y-6 lg:block ${
              mobileFilterOpen ? "block border-b border-[#DCDDD5] pb-6" : "hidden"
            }`}
          >
            {/* Search Input Box */}
            <div className="rounded-lg border border-[#DCDDD5] bg-white p-4">
              <label htmlFor="shop-search" className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A]">
                Search Products
              </label>
              <div className="relative mt-2">
                <input
                  id="shop-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="E.g. watch, backpack, wool..."
                  className="w-full rounded-md border border-[#DCDDD5] bg-[#F7F7F2] py-2 pl-8 pr-3 text-xs text-[#1C1D1A] placeholder-[#696D66] focus:border-[#1C1D1A] focus:outline-none"
                />
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#696D66]" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#696D66] hover:text-[#1C1D1A]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter */}
            <div className="rounded-lg border border-[#DCDDD5] bg-white p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A]">
                Category
              </h3>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                    selectedCategory === "all"
                      ? "bg-[#1C1D1A] text-white"
                      : "text-[#696D66] hover:bg-[#F7F7F2] hover:text-[#1C1D1A]"
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-[10px] opacity-80">24</span>
                </button>
                {NOVACART_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? "bg-[#1C1D1A] text-white"
                        : "text-[#696D66] hover:bg-[#F7F7F2] hover:text-[#1C1D1A]"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] opacity-80">{cat.itemCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter Slider */}
            <div className="rounded-lg border border-[#DCDDD5] bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A]">
                  Max Price
                </h3>
                <span className="text-xs font-bold text-[#1C1D1A]">
                  ₹{maxPrice.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={10000}
                step={500}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="mt-3 w-full accent-[#1C1D1A]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-[#696D66]">
                <span>₹1,000</span>
                <span>₹10,000</span>
              </div>
            </div>

            {/* Quick Badge Filter Toggles */}
            <div className="rounded-lg border border-[#DCDDD5] bg-white p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1D1A]">
                Curated Badges
              </h3>
              <div className="mt-3 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1C1D1A]">
                  <input
                    type="checkbox"
                    checked={onlyNew}
                    onChange={(e) => setOnlyNew(e.target.checked)}
                    className="rounded border-[#DCDDD5] text-[#1C1D1A] focus:ring-[#1C1D1A]"
                  />
                  <span>New Arrivals Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#1C1D1A]">
                  <input
                    type="checkbox"
                    checked={onlyFeatured}
                    onChange={(e) => setOnlyFeatured(e.target.checked)}
                    className="rounded border-[#DCDDD5] text-[#1C1D1A] focus:ring-[#1C1D1A]"
                  />
                  <span>Featured Highlights</span>
                </label>
              </div>
            </div>

            {/* Clear All Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="w-full rounded-md border border-[#DCDDD5] bg-white py-2 text-xs font-semibold text-[#1C1D1A] hover:bg-[#E8EBE3] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DCDDD5] bg-white p-12 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F7F2] text-[#696D66]">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#1C1D1A]">
                  No products match your criteria
                </h3>
                <p className="mt-1 text-xs text-[#696D66] max-w-sm">
                  We couldn&apos;t find any items matching your current filters. Try relaxing the search keywords or broadening the price range.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="mt-6 rounded-md bg-[#1C1D1A] px-5 py-2.5 text-xs font-bold text-[#D8F16A] hover:bg-[#343630] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NovaCartShopPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#696D66]">Loading shop catalogue...</div>}>
      <ShopContent />
    </Suspense>
  );
}
