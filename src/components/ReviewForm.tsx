'use client';

import { useState, FormEvent, FocusEvent } from 'react';
import { motion } from 'framer-motion';
import { Star, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ReviewFormProps {
  id?: string;
}

const SERVICES = [
  'Website Development',
  'Web Application',
  'Mobile Application',
  'AI/ML Solutions',
  'UI/UX Design',
  'Cloud Solutions',
  'SEO & SEM',
  'Digital Marketing',
  'Custom Software'
];

export default function ReviewForm({ id }: ReviewFormProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formData, setFormData] = useState({
    review: '',
    name: '',
    email: '',
    company: '',
    designation: '',
    service: '',
    consent: false,
    website: '' // honeypot
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [globalError, setGlobalError] = useState<string>('');

  const errors: Record<string, string> = {};
  if (touched.rating && rating === 0) errors.rating = 'Please select a rating.';
  if (touched.review && formData.review.length > 0 && formData.review.length < 20) errors.review = 'Review must be at least 20 characters.';
  if (touched.review && formData.review.length === 0) errors.review = 'Review is required.';
  if (touched.name && !formData.name.trim()) errors.name = 'Name is required.';
  if (touched.consent && !formData.consent) errors.consent = 'You must agree to public display.';
  if (touched.email && formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Invalid email address.';

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (status === 'idle') setGlobalError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Mark all required as touched
    setTouched({
      rating: true,
      review: true,
      name: true,
      consent: true,
      email: !!formData.email
    });

    if (formData.website) {
      // Honeypot caught
      setStatus('success');
      return;
    }

    if (rating === 0 || formData.review.length < 20 || formData.review.length > 1000 || !formData.name.trim() || !formData.consent || (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email))) {
      setGlobalError('Please fix the errors in the form.');
      return;
    }

    setStatus('submitting');
    setGlobalError('');

    try {
      const response = await fetch('/api/v1/public/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          reviewText: formData.review,
          reviewerName: formData.name,
          email: formData.email || undefined,
          companyName: formData.company || undefined,
          designation: formData.designation || undefined,
          service: formData.service || undefined,
          publicConsent: formData.consent,
          website: formData.website || undefined,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit review');
      }

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setGlobalError('An error occurred while submitting your review. Please try again later.');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        id={id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#262626] bg-[#141414] p-8 sm:p-12 text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#e8a064]/10 text-[#e8a064]">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h3 className="mb-2 text-2xl font-bold text-[#f4f4f5]">Thank You for Sharing Your Experience</h3>
        <p className="text-[#a1a1aa] mx-auto max-w-md">
          Your review has been successfully submitted. We appreciate your feedback and it will be published after a quick moderation review.
        </p>
      </motion.div>
    );
  }

  return (
    <div id={id} className="rounded-2xl border border-[#262626] bg-[#141414] p-6 sm:p-8 lg:p-10">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {globalError && (
          <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{globalError}</p>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#d4d4d4]">Your Rating <span className="text-[#e8a064]">*</span></label>
          <div 
            className="flex items-center gap-1"
            onMouseLeave={() => setHoverRating(0)}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a064]/50 rounded-md transition-colors"
                onMouseEnter={() => setHoverRating(star)}
                onClick={() => {
                  setRating(star);
                  setTouched(prev => ({ ...prev, rating: true }));
                }}
                aria-label={`Rate ${star} out of 5 stars`}
              >
                <Star 
                  className={`h-8 w-8 transition-colors ${
                    (hoverRating || rating) >= star 
                      ? 'fill-[#e8a064] text-[#e8a064]' 
                      : 'text-[#303030] hover:text-[#52525b]'
                  }`} 
                />
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-xs text-red-400">{errors.rating}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="review" className="block text-sm font-medium text-[#d4d4d4]">Your Review <span className="text-[#e8a064]">*</span></label>
            <span className={`text-xs ${formData.review.length > 1000 ? 'text-red-400' : 'text-[#71717a]'}`}>
              {formData.review.length}/1000
            </span>
          </div>
          <textarea
            id="review"
            name="review"
            value={formData.review}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Tell us about your experience working with AXIVON..."
            rows={5}
            className={`w-full rounded-xl bg-[#0f0f0f] px-4 py-3 text-[#f4f4f5] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/30 transition-colors resize-y ${
              errors.review ? 'border-red-500/50 focus:border-red-500' : 'border-[#262626] focus:border-[#e8a064]'
            }`}
          />
          {errors.review && <p className="text-xs text-red-400">{errors.review}</p>}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-[#d4d4d4]">Full Name <span className="text-[#e8a064]">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
              className={`w-full rounded-xl bg-[#0f0f0f] px-4 py-3 text-[#f4f4f5] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/30 transition-colors ${
                errors.name ? 'border-red-500/50 focus:border-red-500' : 'border-[#262626] focus:border-[#e8a064]'
              }`}
            />
            {errors.name && <p className="text-xs text-red-400">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#d4d4d4]">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="john@example.com"
              className={`w-full rounded-xl bg-[#0f0f0f] px-4 py-3 text-[#f4f4f5] placeholder:text-[#52525b] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/30 transition-colors ${
                errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-[#262626] focus:border-[#e8a064]'
              }`}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium text-[#d4d4d4]">Company</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Company Name"
              className="w-full rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-3 text-[#f4f4f5] placeholder:text-[#52525b] focus:border-[#e8a064] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/30 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="designation" className="block text-sm font-medium text-[#d4d4d4]">Designation/Role</label>
            <input
              type="text"
              id="designation"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="CEO, Founder, etc."
              className="w-full rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-3 text-[#f4f4f5] placeholder:text-[#52525b] focus:border-[#e8a064] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/30 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="service" className="block text-sm font-medium text-[#d4d4d4]">Service Used</label>
          <select
            id="service"
            name="service"
            value={formData.service}
            onChange={handleChange}
            className="w-full appearance-none rounded-xl border border-[#262626] bg-[#0f0f0f] px-4 py-3 text-[#f4f4f5] focus:border-[#e8a064] focus:outline-none focus:ring-1 focus:ring-[#e8a064]/30 transition-colors"
          >
            <option value="" disabled className="text-[#52525b]">Select a service...</option>
            {SERVICES.map(svc => (
              <option key={svc} value={svc} className="bg-[#141414] text-[#f4f4f5]">{svc}</option>
            ))}
          </select>
        </div>

        {/* Honeypot */}
        <input 
          type="text" 
          name="website" 
          value={formData.website} 
          onChange={handleChange} 
          tabIndex={-1} 
          autoComplete="off"
          aria-hidden="true"
          style={{ display: 'none' }} 
        />

        <div className="space-y-2 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-1">
              <input
                type="checkbox"
                name="consent"
                checked={formData.consent}
                onChange={handleChange}
                onBlur={() => setTouched(prev => ({ ...prev, consent: true }))}
                className="peer sr-only"
              />
              <div className={`h-5 w-5 rounded border bg-[#0f0f0f] transition-colors flex items-center justify-center ${
                errors.consent ? 'border-red-500/50' : 'border-[#262626] group-hover:border-[#e8a064]/50 peer-focus-visible:ring-2 peer-focus-visible:ring-[#e8a064]/50'
              } ${formData.consent ? '!border-[#e8a064] !bg-[#e8a064]' : ''}`}>
                <CheckCircle className={`h-3.5 w-3.5 text-[#0f0f0f] transition-opacity ${formData.consent ? 'opacity-100' : 'opacity-0'}`} strokeWidth={3} />
              </div>
            </div>
            <span className="text-sm text-[#a1a1aa] leading-relaxed">
              I agree that my review, name, and the information I provide may be displayed publicly on the AXIVON website. <span className="text-[#e8a064]">*</span>
            </span>
          </label>
          {errors.consent && <p className="text-xs text-red-400 pl-8">{errors.consent}</p>}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="flex items-center justify-center w-full sm:w-auto rounded-full bg-[#e8a064] px-8 py-4 text-sm font-semibold text-[#0f0f0f] hover:bg-[#f0b07a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting Review...
              </>
            ) : (
              'Submit Review'
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
