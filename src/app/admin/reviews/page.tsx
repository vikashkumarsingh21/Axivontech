'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Star,
  TrendingUp,
  Search,
  Filter,
  Eye,
  Check,
  X,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  XSquare,
  CheckSquare
} from 'lucide-react';

type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED';

interface Review {
  id: string;
  name: string;
  email: string;
  companyName: string | null;
  position: string | null;
  rating: number;
  reviewText: string;
  serviceId: string | null;
  status: ReviewStatus;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  archived: number;
  featured: number;
  averageRating: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [featuredFilter, setFeaturedFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Modals / Dialogs
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<string>('');
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch reviews
  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy,
      });

      if (debouncedSearch) queryParams.append('search', debouncedSearch);
      if (statusFilter !== 'ALL') queryParams.append('status', statusFilter);
      if (ratingFilter !== 'ALL') queryParams.append('rating', ratingFilter);
      if (featuredFilter !== 'ALL') {
        queryParams.append('featured', featuredFilter === 'FEATURED' ? 'true' : 'false');
      }

      const res = await fetch(`/api/v1/admin/reviews?${queryParams.toString()}`, {
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch reviews');
      
      setReviews(data.reviews || []);
      if (data.pagination) setPagination(data.pagination);
      if (data.stats) setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching reviews');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, debouncedSearch, statusFilter, ratingFilter, featuredFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const updateReview = async (id: string, updates: Partial<Review>) => {
    // Optimistic update
    setReviews(current => current.map(r => r.id === id ? { ...r, ...updates } : r));
    if (selectedReview?.id === id) {
      setSelectedReview({ ...selectedReview, ...updates });
    }

    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update review');
      
      showToast('Review updated successfully');
      fetchReviews(); // refresh stats
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
      fetchReviews(); // revert optimistic update
    }
  };

  const deleteReview = async (id: string) => {
    setReviews(current => current.filter(r => r.id !== id));
    setDeleteConfirmId(null);
    if (selectedReview?.id === id) setIsDetailModalOpen(false);
    
    try {
      const res = await fetch(`/api/v1/admin/reviews/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete review');
      
      showToast('Review deleted successfully');
      fetchReviews(); // refresh stats
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
      fetchReviews(); // revert
    }
  };

  const handleStatusChange = (id: string, status: ReviewStatus) => {
    updateReview(id, { status });
  };

  const toggleFeatured = (id: string, currentStatus: boolean) => {
    updateReview(id, { isFeatured: !currentStatus });
  };

  const handleSaveEdit = async () => {
    if (!selectedReview) return;
    await updateReview(selectedReview.id, { reviewText: reviewToEdit });
    setIsDetailModalOpen(false);
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        size={14} 
        className={i < rating ? "fill-[#e8a064] text-[#e8a064]" : "text-gray-600"} 
      />
    ));
  };

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'APPROVED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">Approved</span>;
      case 'PENDING': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">Pending</span>;
      case 'REJECTED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Rejected</span>;
      case 'ARCHIVED': return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">Archived</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-gray-200">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 transition-all ${
          toast.type === 'success' ? 'bg-[#0d0d0d] border-green-500/30 text-green-400' : 'bg-[#0d0d0d] border-red-500/30 text-red-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Reviews & Testimonials</h1>
        <p className="text-sm text-gray-500 mt-1">Manage client reviews and website testimonials.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400 mb-2">
              <span className="text-xs font-medium">Total Reviews</span>
              <MessageSquare size={16} />
            </div>
            <span className="text-2xl font-bold text-white">{stats.total}</span>
          </div>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-amber-500/80 mb-2">
              <span className="text-xs font-medium text-gray-400">Pending</span>
              <Clock size={16} />
            </div>
            <span className="text-2xl font-bold text-amber-400">{stats.pending}</span>
          </div>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-green-500/80 mb-2">
              <span className="text-xs font-medium text-gray-400">Approved</span>
              <CheckCircle size={16} />
            </div>
            <span className="text-2xl font-bold text-green-400">{stats.approved}</span>
          </div>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[#e8a064] mb-2">
              <span className="text-xs font-medium text-gray-400">Featured</span>
              <Star size={16} />
            </div>
            <span className="text-2xl font-bold text-[#e8a064]">{stats.featured}</span>
          </div>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-blue-500/80 mb-2">
              <span className="text-xs font-medium text-gray-400">Avg Rating</span>
              <TrendingUp size={16} />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">{stats.averageRating.toFixed(1)}</span>
              <span className="text-xs text-gray-500">/ 5.0</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="w-full bg-[#141414] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[#141414] border border-white/10 rounded-lg px-2">
            <Filter size={14} className="text-gray-500" />
            <select 
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
              className="bg-transparent text-sm py-2 text-gray-300 focus:outline-none [&>option]:bg-[#141414]"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <select 
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
            className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-white/20 [&>option]:bg-[#141414]"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select 
            value={featuredFilter}
            onChange={(e) => { setFeaturedFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
            className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-white/20 [&>option]:bg-[#141414]"
          >
            <option value="ALL">All Display</option>
            <option value="FEATURED">Featured Only</option>
            <option value="UNFEATURED">Not Featured</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPagination(p => ({...p, page: 1})); }}
            className="bg-[#141414] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-white/20 [&>option]:bg-[#141414]"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_rating">Highest Rating</option>
            <option value="lowest_rating">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden">
        {loading && reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader2 size={32} className="animate-spin mb-4 text-white/20" />
            <p>Loading reviews...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-red-400">
            <AlertCircle size={32} className="mb-4 opacity-50" />
            <p>{error}</p>
            <button 
              onClick={() => fetchReviews()}
              className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <MessageSquare size={32} className="mb-4 opacity-20" />
            <p>No reviews found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#0d0d0d] border-b border-white/10 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Reviewer</th>
                  <th className="px-6 py-4 font-medium">Rating</th>
                  <th className="px-6 py-4 font-medium">Review</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Featured</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-200">{review.name}</span>
                        {(review.position || review.companyName) && (
                          <span className="text-xs text-gray-500">
                            {[review.position, review.companyName].filter(Boolean).join(' at ')}
                          </span>
                        )}
                        <span className="text-xs text-gray-600 hidden group-hover:block transition-all truncate max-w-[150px]">
                          {review.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-400 truncate max-w-[200px]" title={review.reviewText}>
                        {review.reviewText}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(review.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(review.id, review.isFeatured)}
                        disabled={review.status !== 'APPROVED'}
                        className={`p-1.5 rounded-lg transition-colors ${
                          review.isFeatured 
                            ? 'text-[#e8a064] bg-[#e8a064]/10 hover:bg-[#e8a064]/20' 
                            : 'text-gray-600 hover:text-gray-400 hover:bg-white/5'
                        } ${review.status !== 'APPROVED' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={review.status !== 'APPROVED' ? 'Only approved reviews can be featured' : 'Toggle Featured'}
                      >
                        <Star size={16} className={review.isFeatured ? 'fill-[#e8a064]' : ''} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {review.status !== 'APPROVED' && (
                          <button
                            onClick={() => handleStatusChange(review.id, 'APPROVED')}
                            className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <CheckSquare size={16} />
                          </button>
                        )}
                        {review.status !== 'REJECTED' && (
                          <button
                            onClick={() => handleStatusChange(review.id, 'REJECTED')}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <XSquare size={16} />
                          </button>
                        )}
                        {review.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => handleStatusChange(review.id, 'ARCHIVED')}
                            className="p-2 text-gray-500 hover:bg-gray-500/10 hover:text-gray-300 rounded-lg transition-colors"
                            title="Archive"
                          >
                            <Archive size={16} />
                          </button>
                        )}
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setReviewToEdit(review.reviewText);
                            setIsDetailModalOpen(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(review.id)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && reviews.length > 0 && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between text-sm text-gray-400">
            <span>Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPagination(p => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Delete Review?</h3>
            <p className="text-gray-400 text-sm mb-6">This action cannot be undone. This review will be permanently deleted from the database.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteConfirmId && deleteReview(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Detail & Edit Modal */}
      {isDetailModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Review Details</h2>
                <p className="text-sm text-gray-500">Review ID: {selectedReview.id}</p>
              </div>
              <button 
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</label>
                  <p className="font-medium text-gray-200">{selectedReview.name}</p>
                  <p className="text-sm text-gray-400">{selectedReview.email}</p>
                </div>
                {(selectedReview.companyName || selectedReview.position) && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company Info</label>
                    <p className="text-sm text-gray-300">
                      {[selectedReview.position, selectedReview.companyName].filter(Boolean).join(' at ')}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</label>
                  <div className="flex gap-1 mt-1">{renderStars(selectedReview.rating)}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</label>
                  <p className="text-sm text-gray-300">{formatDate(selectedReview.createdAt)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</label>
                  <p className="text-sm mt-1 flex items-center gap-2">
                    {selectedReview.isFeatured ? (
                      <span className="text-[#e8a064] flex items-center gap-1"><Star size={14} className="fill-[#e8a064]" /> Featured</span>
                    ) : (
                      <span className="text-gray-500">Not Featured</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Review Content</label>
              <textarea
                value={reviewToEdit}
                onChange={(e) => setReviewToEdit(e.target.value)}
                className="w-full h-32 bg-[#141414] border border-white/10 rounded-xl p-3 text-sm text-gray-300 focus:outline-none focus:border-white/30 transition-colors resize-none"
              />
              {reviewToEdit !== selectedReview.reviewText && (
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-4 py-2 text-sm font-medium bg-white/10 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStatusChange(selectedReview.id, 'APPROVED')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedReview.status === 'APPROVED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-transparent text-gray-400 border border-white/10 hover:bg-white/5'
                  }`}
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReview.id, 'REJECTED')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedReview.status === 'REJECTED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-transparent text-gray-400 border border-white/10 hover:bg-white/5'
                  }`}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReview.id, 'ARCHIVED')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    selectedReview.status === 'ARCHIVED' ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' : 'bg-transparent text-gray-400 border border-white/10 hover:bg-white/5'
                  }`}
                >
                  Archive
                </button>
              </div>
              
              <button
                onClick={() => setDeleteConfirmId(selectedReview.id)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
