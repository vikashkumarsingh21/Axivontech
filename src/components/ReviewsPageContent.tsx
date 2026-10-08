'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Loader2, User, ChevronDown } from 'lucide-react';
import { SectionHeader } from '@/components/ui';
import { Badge } from '@/components/ui';
import ReviewForm from '@/components/ReviewForm';

interface Review {
  id: string;
  rating: number;
  reviewText: string;
  reviewerName: string;
  companyName?: string | null;
  designation?: string | null;
  service?: string | null;
  photoUrl?: string | null;
  isFeatured: boolean;
  createdAt: string;
}

interface Stats {
  averageRating: number;
  totalReviews: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SERVICES = [
  'All',
  'Website Development',
  'Web Application',
  'Mobile Application',
  'AI/ML Solutions',
  'UI/UX Design',
  'Digital Marketing',
  'SEO & SEM',
];

export default function ReviewsPageContent() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);

  const fetchReviews = async (pageNum: number, filter: string, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
      });
      
      if (filter !== 'All') {
        queryParams.append('service', filter);
      }
      
      const res = await fetch(`/api/v1/public/reviews?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      
      const data = await res.json();
      
      if (data.success) {
        if (append) {
          setReviews(prev => [...prev, ...data.reviews]);
        } else {
          setReviews(data.reviews);
        }
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchReviews(1, activeFilter, false);
  }, [activeFilter]);

  const handleLoadMore = () => {
    if (pagination && page < pagination.totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReviews(nextPage, activeFilter, true);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-[#e8a064] text-[#e8a064]' : 'fill-transparent text-[#52525b]'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#0f0f0f] pt-24 pb-14 sm:pt-32 sm:pb-20 lg:pb-28">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <SectionHeader
          overline="Client Testimonials"
          heading="What Our Clients Say"
          body="Read genuine reviews from businesses and individuals who have partnered with us to achieve their digital goals."
        />

        {/* Aggregate Stats */}
        {stats && stats.totalReviews >= 5 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 flex flex-col items-center justify-center space-y-4 rounded-2xl border border-[#262626] bg-[#141414] p-8 text-center sm:flex-row sm:space-x-8 sm:space-y-0 sm:text-left"
          >
            <div className="flex items-center space-x-2">
              <span className="text-4xl font-bold text-[#f4f4f5]">{stats.averageRating.toFixed(1)}</span>
              <div className="flex flex-col items-start justify-center">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(stats.averageRating)
                          ? 'fill-[#e8a064] text-[#e8a064]'
                          : 'fill-transparent text-[#52525b]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-[#a1a1aa]">Average Rating</span>
              </div>
            </div>
            <div className="hidden h-12 w-px bg-[#262626] sm:block"></div>
            <div>
              <p className="text-3xl font-bold text-[#f4f4f5]">{stats.totalReviews}+</p>
              <p className="text-sm text-[#a1a1aa]">Verified Reviews</p>
            </div>
          </motion.div>
        )}
      </section>

      {/* Filters & Reviews Grid */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex flex-wrap gap-2">
          {SERVICES.map((service) => (
            <button
              key={service}
              onClick={() => setActiveFilter(service)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeFilter === service
                  ? 'bg-[#e8a064] text-[#0f0f0f]'
                  : 'bg-[#141414] text-[#a1a1aa] border border-[#262626] hover:text-[#f4f4f5] hover:border-[#e8a064]/50'
              }`}
            >
              {service}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#e8a064]" />
          </div>
        ) : reviews.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {reviews.map((review, index) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex h-full flex-col justify-between rounded-2xl border border-[#262626] bg-[#141414] p-6 transition-colors hover:border-[#303030]"
                  >
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        {renderStars(review.rating)}
                        {review.service && (
                          <Badge className="text-[#d4d4d4] border-[#262626] bg-[#262626]/50">
                            {review.service}
                          </Badge>
                        )}
                      </div>
                      <p className="mb-6 text-base text-[#a1a1aa] leading-relaxed line-clamp-6">
                        "{review.reviewText}"
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-auto border-t border-[#262626] pt-4">
                      {review.photoUrl ? (
                        <img
                          src={review.photoUrl}
                          alt={review.reviewerName}
                          className="h-10 w-10 rounded-full object-cover border border-[#262626]"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#262626] text-[#a1a1aa]">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-[#f4f4f5]">{review.reviewerName}</p>
                        {(review.designation || review.companyName) && (
                          <p className="text-xs text-[#71717a]">
                            {review.designation}
                            {review.designation && review.companyName && ' at '}
                            {review.companyName}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {pagination && page < pagination.totalPages && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group flex items-center justify-center gap-2 rounded-full border border-[#262626] bg-[#141414] px-6 py-3 text-sm font-medium text-[#f4f4f5] transition-all hover:border-[#e8a064] hover:text-[#e8a064] disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[#262626] bg-[#141414] py-24 text-center">
            <MessageSquare className="mb-4 h-12 w-12 text-[#52525b]" />
            <h3 className="mb-2 text-xl font-semibold text-[#f4f4f5]">No reviews found</h3>
            <p className="text-[#a1a1aa]">
              {activeFilter === 'All'
                ? "We don't have any reviews yet."
                : `We don't have any reviews for ${activeFilter} yet.`}
            </p>
          </div>
        )}
      </section>

      {/* Review Submission Form Section */}
      <section className="mx-auto mt-24 max-w-4xl px-4 sm:px-6 lg:px-10">
        <div className="rounded-2xl border border-[#262626] bg-[#141414] p-6 sm:p-10">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-[#f4f4f5]">Share Your Experience</h3>
            <p className="mt-2 text-[#a1a1aa]">
              We value your feedback. Please let us know how we did.
            </p>
          </div>
          <ReviewForm />
        </div>
      </section>
    </main>
  );
}
