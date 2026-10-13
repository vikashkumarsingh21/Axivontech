import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  NOVACART_CATEGORIES,
  getProductsByCategory,
} from "@/data/novacart-data";
import ProductCard from "@/components/demo-projects/novacart/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return NOVACART_CATEGORIES.map((cat) => ({
    slug: cat.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = NOVACART_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return { title: "Category Not Found | NovaCart" };

  return {
    title: `${category.name} — NovaCart Lifestyle E-Commerce`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = NOVACART_CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(slug);

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#696D66]">
          <Link href="/demo-projects/ecommerce/novacart" className="hover:text-[#1C1D1A]">
            Home
          </Link>
          <span>/</span>
          <Link href="/demo-projects/ecommerce/novacart/shop" className="hover:text-[#1C1D1A]">
            Shop
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#1C1D1A]" aria-current="page">
            {category.name}
          </span>
        </nav>

        {/* Category Hero Banner */}
        <div className="mt-6 relative overflow-hidden rounded-2xl border border-[#DCDDD5] bg-white p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex rounded-full bg-[#E8EBE3] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#1C1D1A]">
                {category.shortTag} · {products.length} Products
              </span>
              <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1C1D1A]">
                {category.name}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#696D66] max-w-xl leading-relaxed">
                {category.description}
              </p>
            </div>

            <div className="relative aspect-16/9 lg:aspect-4/3 w-full overflow-hidden rounded-xl bg-[#F7F7F2] lg:col-span-5">
              <Image
                src={category.image}
                alt={`${category.name} collection spotlight`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>

        {/* Category Navigation Pills */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-[#DCDDD5] pb-4">
          <span className="text-xs font-semibold text-[#696D66] mr-2">All Collections:</span>
          {NOVACART_CATEGORIES.map((cat) => {
            const isCurrent = cat.slug === slug;
            return (
              <Link
                key={cat.id}
                href={`/demo-projects/ecommerce/novacart/category/${cat.slug}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  isCurrent
                    ? "bg-[#1C1D1A] text-white"
                    : "bg-white border border-[#DCDDD5] text-[#1C1D1A] hover:bg-[#E8EBE3]"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="mt-8">
          {products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#DCDDD5] bg-white p-12 text-center">
              <h3 className="text-base font-bold text-[#1C1D1A]">No products in this category yet</h3>
              <p className="mt-1 text-xs text-[#696D66]">
                Explore our complete catalogue for available everyday items.
              </p>
              <Link
                href="/demo-projects/ecommerce/novacart/shop"
                className="mt-4 inline-flex rounded-md bg-[#1C1D1A] px-5 py-2 text-xs font-semibold text-white"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
