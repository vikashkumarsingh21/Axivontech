import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NOVACART_PRODUCTS, getProductBySlug } from "@/data/novacart-data";
import ProductDetailView from "@/components/demo-projects/novacart/ProductDetailView";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return NOVACART_PRODUCTS.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product Not Found | NovaCart" };

  return {
    title: `${product.name} — NovaCart Lifestyle E-Commerce`,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} | NovaCart`,
      description: product.shortDescription,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.imageAlt,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailView product={product} />;
}
