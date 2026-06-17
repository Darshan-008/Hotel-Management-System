import React, { useState } from 'react';
import { Star, MessageSquare, Award, AlertTriangle } from 'lucide-react';
import type { Feedback, UserRole } from '../types';

interface FeedbackBoardProps {
  feedbacks: Feedback[];
  onSubmitFeedback: (feedbackData: { rating: number; comment: string }) => Promise<boolean>;
  isLoading: boolean;
  role: UserRole;
}

export const FeedbackBoard: React.FC<FeedbackBoardProps> = ({
  feedbacks,
  onSubmitFeedback,
  isLoading,
  role,
}) => {
  const isGuest = role === 'guest';

  // Submission Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute Statistics
  const totalReviews = feedbacks.length;
  const averageRating =
    totalReviews > 0
      ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalReviews).toFixed(1)
      : '0.0';

  // Calculate rating counts
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = feedbacks.filter((f) => f.rating === stars).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { stars, count, percentage };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (comment.trim().length < 5) {
      setError('Please write a review comment (minimum 5 characters).');
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmitFeedback({ rating, comment: comment.trim() });
    setIsSubmitting(false);

    if (success) {
      setComment('');
      setRating(5);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-serif text-[#f4ebd5]">Guest Testimonials</h2>
        <p className="text-xs text-slate-400 mt-1">Review verified guest feedback, ratings, and experiences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form (Guest) or Stats Summary (Admin) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Guest Feedback Form */}
          {isGuest ? (
            <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-6 shadow-md">
              <div className="border-b border-slate-800/80 pb-3 mb-5">
                <h3 className="text-lg font-serif text-[#f4ebd5]">Write a Review</h3>
                <p className="text-xs text-slate-400 mt-1">Share your experience during your stay at Grand Palace</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating selection (Stars) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Your Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform active:scale-95 cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            star <= (hoverRating || rating)
                              ? 'fill-gold-500 text-gold-500'
                              : 'text-slate-700'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-semibold text-gold-400 uppercase tracking-wider">
                      {rating} {rating === 1 ? 'Star' : 'Stars'}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Review Details
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write details about the rooms, hospitality, cleaniness, and what you liked..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={500}
                    className="w-full bg-[#1b2230] border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-gold-500 transition-colors resize-none"
                  ></textarea>
                  <div className="flex justify-between text-3xs text-slate-500 mt-1">
                    <span>Min 5 characters</span>
                    <span>{comment.length}/500 chars</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gold-600 hover:bg-gold-500 disabled:bg-gold-800 disabled:text-slate-500 active:bg-gold-700 text-slate-900 font-semibold rounded-lg shadow-md transition-all text-sm mt-4 cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4" /> Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Admin Review Stats Overview */
            <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-5 shadow-md space-y-6">
              <div className="border-b border-slate-800/80 pb-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Ratings Overview</h3>
              </div>

              {/* Average Dial Score */}
              <div className="flex items-center gap-4 py-2">
                <div className="p-4 bg-gold-950/30 rounded-xl border border-gold-500/10 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-serif font-bold text-gold-400">{averageRating}</span>
                  <span className="text-3xs text-slate-500 uppercase font-semibold mt-1">out of 5.0</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-gold-500 gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= Math.round(Number(averageRating)) ? 'fill-gold-500' : 'text-slate-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">Based on {totalReviews} guest reviews</p>
                </div>
              </div>

              {/* Progress Distribution bars */}
              <div className="space-y-2.5 text-xs text-slate-400 border-t border-slate-800/80 pt-4">
                {ratingCounts.map(({ stars, count, percentage }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 text-slate-500 text-3xs font-semibold uppercase tracking-wider">{stars} Stars</span>
                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gold-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right font-medium text-slate-350">{count} ({percentage}%)</span>
                  </div>
                ))}
              </div>

              {/* Award */}
              <div className="border-t border-slate-800/80 pt-4 flex items-center gap-3 text-3xs text-slate-500 uppercase tracking-widest leading-relaxed">
                <Award className="w-7 h-7 text-gold-500/30 flex-shrink-0" />
                <span>Verified Guest Review Moderation Shield Active</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2): Reviews List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-4 flex justify-between items-center shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Reviews Registry</h3>
            <span className="text-2xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
              {totalReviews} Total
            </span>
          </div>

          {isLoading ? (
            <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-8 text-center space-y-4">
              <div className="w-8 h-8 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-slate-400 text-sm">Loading testimonials board...</p>
            </div>
          ) : feedbacks.length === 0 ? (
            <div className="bg-[#121824] border border-slate-800/60 rounded-xl p-12 text-center flex flex-col items-center justify-center">
              <MessageSquare className="w-16 h-16 text-slate-700 mb-4" />
              <h4 className="text-lg font-serif text-[#f4ebd5] mb-1">No feedback yet</h4>
              <p className="text-slate-400 text-sm max-w-xs mx-auto">
                No guest has submitted feedback for the hotel. Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-1">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className="bg-[#121824] border border-slate-800/60 rounded-xl p-5 hover:border-gold-500/10 transition-colors shadow-sm space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {/* Initials Avatar */}
                      <div className="w-9 h-9 rounded-full bg-gold-950/20 border border-gold-500/10 flex items-center justify-center font-serif text-gold-400 font-bold uppercase text-xs flex-shrink-0">
                        {(f.user?.name || 'G').substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{f.user?.name || 'Anonymous Guest'}</h4>
                        <div className="flex items-center text-gold-500 gap-0.5 mt-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= f.rating ? 'fill-gold-500' : 'text-slate-800'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Timestamp */}
                    <span className="text-3xs text-slate-500 font-semibold uppercase tracking-wider">
                      {new Date(f.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-slate-350 leading-relaxed pl-12 font-light">
                    "{f.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
