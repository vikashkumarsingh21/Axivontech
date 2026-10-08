'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';
import { SectionHeader } from '@/components/ui';

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  reviewerName: string;
  companyName?: string;
  designation?: string;
  service?: string;
  photoUrl?: string;
  isFeatured: boolean;
  createdAt: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
}

interface ApiResponse {
  success: boolean;
  reviews: Review[];
  stats: ReviewStats;
}

export default function ClientReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/v1/public/reviews?limit=9');
        if (!res.ok) throw new Error('API Error');
        const data: ApiResponse = await res.json();
        if (data.success) {
          setReviews(data.reviews);
          setStats(data.stats);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, reviews.length - 1)));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < reviews.length - 1 ? prev + 1 : 0));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-[#e8a064] text-[#e8a064]' : 'text-[#303030]'
            }`}
          />
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <section className="bg-[#0f0f0f] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 text-center">
          <SectionHeader
            overline="Client Reviews"
            heading={<>What Our <span className="text-gradient-amber">Clients</span> Say</>}
            body="Client reviews are temporarily unavailable."
          />
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="bg-[#0f0f0f] py-12 sm:py-16 lg:py-20 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <SectionHeader
            overline="Client Reviews"
            heading={<>What Our <span className="text-gradient-amber">Clients</span> Say</>}
            body="Discover how we've helped businesses achieve their technology goals."
          />
          <div className="mt-12 flex gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] rounded-2xl border border-[#262626] bg-[#141414] p-6 animate-pulse">
                <div className="h-4 w-24 bg-[#262626] rounded mb-4"></div>
                <div className="h-4 w-full bg-[#262626] rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-[#262626] rounded mb-6"></div>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-[#262626]"></div>
                  <div>
                    <div className="h-4 w-20 bg-[#262626] rounded mb-1"></div>
                    <div className="h-3 w-16 bg-[#262626] rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="bg-[#0f0f0f] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 text-center">
          <SectionHeader
            overline="Client Reviews"
            heading={<>What Our <span className="text-gradient-amber">Clients</span> Say</>}
            body="Be among the first to share your experience with AXIVON."
          />
          <div className="mt-8 flex justify-center">
            <Link href="/reviews#submit-review" className="inline-flex items-center justify-center rounded-full border border-[#e8a064] text-[#e8a064] px-6 py-3 font-medium transition-colors hover:bg-[rgba(232,160,100,0.1)]">
              Share Your Experience
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#0f0f0f] py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="flex-1">
            <SectionHeader
              overline="Client Reviews"
              heading={<>What Our <span className="text-gradient-amber">Clients</span> Say</>}
              body="Real experiences from people and businesses who have worked with AXIVON."
              align="left"
            />
          </div>
          
          {stats && stats.totalReviews >= 5 && (
            <div className="flex flex-col items-start md:items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-[#f4f4f5]">{stats.averageRating.toFixed(1)}</span>
                {renderStars(Math.round(stats.averageRating))}
              </div>
              <p className="text-[#a1a1aa] text-sm">Based on {stats.totalReviews} reviews</p>
            </div>
          )}
        </div>

        {reviews.length <= 2 ? (
          <div className="flex flex-col md:flex-row justify-center gap-6">
            {reviews.map((review, index) => (
              <div key={review.id} className="w-full md:w-[calc(50%-12px)] max-w-md">
                <ReviewCard review={review} index={index} />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden">
              <motion.div 
                className="flex gap-6"
                animate={{
                  x: `calc(-${currentIndex * 100}% - ${currentIndex * 24}px)`
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                {reviews.map((review, index) => (
                  <div key={review.id} className="min-w-full md:min-w-[calc(50%-12px)] lg:min-w-[calc(33.333%-16px)] shrink-0">
                    <ReviewCard review={review} index={index} />
                  </div>
                ))}
              </motion.div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={handlePrev}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e8a064] text-[#e8a064] transition-colors hover:bg-[rgba(232,160,100,0.1)] focus:outline-none"
                  aria-label="Previous review"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-[#e8a064] text-[#e8a064] transition-colors hover:bg-[rgba(232,160,100,0.1)] focus:outline-none"
                  aria-label="Next review"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              <div className="hidden sm:block">
                <Link href="/reviews#submit-review" className="inline-flex items-center justify-center rounded-full border border-[#e8a064] text-[#e8a064] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[rgba(232,160,100,0.1)]">
                  Share Your Experience
                </Link>
              </div>
            </div>
            
            <div className="mt-6 sm:hidden flex justify-center">
              <Link href="/reviews#submit-review" className="inline-flex items-center justify-center rounded-full border border-[#e8a064] text-[#e8a064] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[rgba(232,160,100,0.1)]">
                Share Your Experience
              </Link>
            </div>
          </div>
        )}
        
        {reviews.length <= 2 && reviews.length > 0 && (
           <div className="mt-8 flex justify-center">
              <Link href="/reviews#submit-review" className="inline-flex items-center justify-center rounded-full border border-[#e8a064] text-[#e8a064] px-6 py-2.5 text-sm font-medium transition-colors hover:bg-[rgba(232,160,100,0.1)]">
                Share Your Experience
              </Link>
           </div>
        )}
      </div>
    </section>
  );
}

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const truncatedText = review.reviewText.length > 150 
    ? review.reviewText.substring(0, 150) + '...' 
    : review.reviewText;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="flex h-full flex-col rounded-2xl border border-[#262626] bg-[#141414] p-6 transition-colors hover:border-[rgba(232,160,100,0.25)] hover:bg-[#1c1c1e]"
    >
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= review.rating ? 'fill-[#e8a064] text-[#e8a064]' : 'text-[#303030]'
            }`}
          />
        ))}
      </div>
      
      <p className="mb-6 flex-1 text-[#a1a1aa] leading-relaxed">
        &ldquo;{truncatedText}&rdquo;
      </p>

      <div className="mt-auto border-t border-[#262626] pt-4">
        <div className="flex items-center gap-3">
          {review.photoUrl ? (
            <img src={review.photoUrl} alt={review.reviewerName} className="h-10 w-10 rounded-full object-cover border border-[#262626]" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#262626] text-[#71717a]">
              <User className="h-5 w-5" />
            </div>
          )}
          <div className="overflow-hidden">
            <h4 className="text-sm font-medium text-[#f4f4f5] truncate">{review.reviewerName}</h4>
            <div className="text-xs text-[#71717a] truncate">
              {review.designation && <span>{review.designation}</span>}
              {review.designation && review.companyName && <span> at </span>}
              {review.companyName && <span>{review.companyName}</span>}
            </div>
          </div>
        </div>
        {review.service && (
          <div className="mt-3 inline-block rounded bg-[#262626] px-2 py-1 text-xs text-[#a1a1aa]">
            {review.service}
          </div>
        )}
      </div>
    </motion.div>
  );
}
