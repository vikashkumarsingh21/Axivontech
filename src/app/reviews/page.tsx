import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo/metadata';
import ReviewsPageContent from '@/components/ReviewsPageContent';

export const metadata: Metadata = createPageMetadata({
  title: 'Client Reviews — Axivon Technologies',
  description: 'Read genuine reviews from businesses and individuals who have worked with Axivon Technologies.',
  path: '/reviews',
});

export default function ReviewsPage() {
  return <ReviewsPageContent />;
}
