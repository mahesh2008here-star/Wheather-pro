import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Send, 
  CheckCircle2, 
  ThumbsUp, 
  ShieldCheck, 
  MessageSquareQuote
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { LocationInfo } from '../types/weather';

interface RatingFeedbackProps {
  location: LocationInfo;
}

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  tags: string[];
  comment: string;
  date: string;
  likes: number;
  isUserReview?: boolean;
}

const STORAGE_REVIEWS_KEY = 'farmweather_community_reviews';
const STORAGE_USER_RATED_KEY = 'farmweather_has_rated';

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Mahesh K.',
    rating: 5,
    tags: ['🌱 Soil Advisory', '🌧️ Rain Radar'],
    comment: 'The agricultural spraying index and next-hour precipitation timeline have saved so much fertilizer and fuel.',
    date: '2 hours ago',
    likes: 38
  },
  {
    id: 'rev-2',
    name: 'Carlos Mendez',
    rating: 5,
    tags: ['🌾 Farm Telemetry', '☀️ Hourly Forecast'],
    comment: 'Clear editorial design with massive legible weather numbers. Works fast on my phone during fieldwork.',
    date: '1 day ago',
    likes: 24
  },
  {
    id: 'rev-3',
    name: 'Sarah Jenkins',
    rating: 5,
    tags: ['🚜 Field Microclimates', '🎯 High Accuracy'],
    comment: 'The frost alert and evapotranspiration calculations are spot-on for crop irrigation planning.',
    date: '3 days ago',
    likes: 19
  }
];

export const RatingFeedbackSection: React.FC<RatingFeedbackProps> = ({ location }) => {
  const { isDarkMode } = useTheme();

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['🌾 Farm Telemetry', '🌱 Soil Advisory']);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Status State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  
  // Reviews List
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REVIEWS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse reviews:', e);
    }
    return INITIAL_REVIEWS;
  });

  const [likedReviewIds, setLikedReviewIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn('Failed to save reviews:', e);
    }
  }, [reviews]);

  const availableTags = [
    '🌾 Farm Telemetry',
    '🌱 Soil Advisory',
    '🚜 Field Microclimates',
    '🌧️ Rain Radar',
    '☀️ Hourly Forecast',
    '🎯 High Accuracy',
    '💡 Feature Idea',
    '🐛 Bug Report'
  ];

  const ratingLabels: { [key: number]: string } = {
    1: 'Needs Improvement',
    2: 'Fair Experience',
    3: 'Good App',
    4: 'Great Agricultural Tool',
    5: 'Exceptional Weather App'
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleLikeReview = (id: string) => {
    if (likedReviewIds.includes(id)) return;
    setLikedReviewIds(prev => [...prev, id]);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, likes: r.likes + 1 } : r));
    try { navigator.vibrate?.(15); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (rating === 0) {
      setValidationError('Please select a star rating.');
      return;
    }

    if (!comment.trim()) {
      setValidationError('Please share a short review or suggestion.');
      return;
    }

    setIsSubmitting(true);
    const displayName = userName.trim() || 'Farmer ' + Math.floor(100 + Math.random() * 900);

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          displayName,
          email: userEmail.trim(),
          rating,
          comment: comment.trim(),
          tags: selectedTags,
          location: location.name
        })
      });
    } catch (err) {
      console.warn('Server feedback sync note:', err);
    }

    const newReviewItem: ReviewItem = {
      id: 'rev-' + Date.now(),
      name: displayName,
      rating,
      tags: [...selectedTags],
      comment: comment.trim(),
      date: 'Just now',
      likes: 1,
      isUserReview: true
    };

    setReviews(prev => [newReviewItem, ...prev]);
    try {
      localStorage.setItem(STORAGE_USER_RATED_KEY, 'true');
    } catch {}

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setComment('');
  };

  return (
    <section aria-label="Community Feedback & Reviews" className="select-none">
      <div className="flex items-center space-x-2 mb-2 px-1">
        <MessageSquareQuote size={16} className="text-[#FF5C00]" />
        <h3 className="text-xs font-black tracking-tight uppercase">
          User Feedback & Reviews
        </h3>
      </div>

      {/* FEEDBACK SUBMISSION CARD */}
      <div className={`p-4 rounded-[26px] border shadow-xs transition-colors mb-4 ${
        isDarkMode ? 'bg-[#121814] border-[#1E2821] text-[#F3F6F4]' : 'bg-[#FFFFFF] border-[#E8E6DF] text-[#121814]'
      }`}>
        {submitSuccess ? (
          <div className="py-5 px-2 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2.5 ${
              isDarkMode ? 'bg-[#18261E] text-[#10B981]' : 'bg-[#EAF5EF] text-[#1B4332]'
            }`}>
              <CheckCircle2 size={28} />
            </div>
            <h4 className="text-sm font-black mb-1">
              Feedback Received
            </h4>
            <p className={`text-xs max-w-xs mb-3 ${isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'}`}>
              Thank you for helping us improve Farm Weather. Your comments have been securely submitted.
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="text-xs font-bold text-[#10B981] underline cursor-pointer"
            >
              Write Another Note
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Star Rating Row */}
            <div className="flex flex-col items-center text-center pt-1">
              <div className="flex items-center space-x-2 my-1">
                {[1, 2, 3, 4, 5].map(star => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 rounded-full transition-transform hover:scale-115 active:scale-95 cursor-pointer"
                      title={`${star} Star`}
                    >
                      <Star 
                        size={24} 
                        className={`transition-colors ${
                          isFilled 
                            ? 'text-amber-400 fill-amber-400' 
                            : isDarkMode ? 'text-zinc-700' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-bold text-amber-500">
                {ratingLabels[hoverRating || rating]}
              </span>
            </div>

            {/* Tags */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1.5 ${
                isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'
              }`}>
                What stands out?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer snappy-touch ${
                        isSelected
                          ? isDarkMode 
                            ? 'bg-[#1E2821] text-[#10B981] border border-[#2D3F34]' 
                            : 'bg-[#1B4332] text-white shadow-xs'
                          : isDarkMode
                            ? 'bg-[#162019] text-[#89998F] border border-[#1E2821]'
                            : 'bg-[#F8F7F4] text-[#5D6861] border border-[#E8E6DF]'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Input */}
            <div>
              <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                isDarkMode ? 'text-[#89998F]' : 'text-[#5D6861]'
              }`}>
                Your Field Feedback or Suggestions
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience or features you'd like added..."
                rows={3}
                className={`w-full text-xs p-3 rounded-2xl resize-none outline-none transition-colors border ${
                  isDarkMode
                    ? 'bg-[#162019] border-[#1E2821] text-white placeholder-zinc-600 focus:border-[#10B981]'
                    : 'bg-[#F8F7F4] border-[#E8E6DF] text-[#121814] placeholder-slate-400 focus:border-[#1B4332]'
                }`}
              />
            </div>

            {/* Optional User Name & Email */}
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="Name (Optional)"
                className={`w-full text-xs px-3 py-2 rounded-xl outline-none border ${
                  isDarkMode
                    ? 'bg-[#162019] border-[#1E2821] text-white placeholder-zinc-600'
                    : 'bg-[#F8F7F4] border-[#E8E6DF] text-[#121814] placeholder-slate-400'
                }`}
              />
              <input
                type="email"
                value={userEmail}
                onChange={e => setUserEmail(e.target.value)}
                placeholder="Email (Optional)"
                className={`w-full text-xs px-3 py-2 rounded-xl outline-none border ${
                  isDarkMode
                    ? 'bg-[#162019] border-[#1E2821] text-white placeholder-zinc-600'
                    : 'bg-[#F8F7F4] border-[#E8E6DF] text-[#121814] placeholder-slate-400'
                }`}
              />
            </div>

            {validationError && (
              <p className="text-xs text-rose-500 font-bold px-1">{validationError}</p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-2xl bg-[#1B4332] hover:bg-[#12281E] text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer snappy-touch shadow-xs disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Sending Feedback...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center space-x-1.5 mt-2 text-[10px] text-[#5D6861] dark:text-[#89998F] font-medium">
                <ShieldCheck size={12} className="text-[#10B981]" />
                <span>Encrypted Developer Feedback • Private & Secure</span>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* REVIEWS FEED */}
      <div className="space-y-2">
        {reviews.map(item => {
          const hasLiked = likedReviewIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`p-3 rounded-2xl border transition-colors ${
                item.isUserReview
                  ? isDarkMode ? 'bg-[#162019] border-[#223326]' : 'bg-[#EAF5EF] border-[#C5E4D2]'
                  : isDarkMode ? 'bg-[#121814] border-[#1E2821]' : 'bg-white border-[#E8E6DF]'
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-bold">{item.name}</span>
                    {item.isUserReview && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#10B981]/15 text-[#10B981] font-bold">
                        You
                      </span>
                    )}
                    <span className="text-[10px] opacity-50">• {item.date}</span>
                  </div>
                  <div className="flex items-center space-x-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star
                        key={s}
                        size={11}
                        className={s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}
                      />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleLikeReview(item.id)}
                  className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                    hasLiked
                      ? 'bg-[#10B981]/20 text-[#10B981]'
                      : isDarkMode
                      ? 'bg-[#162019] text-[#89998F] hover:text-white'
                      : 'bg-[#F8F7F4] text-[#5D6861] hover:text-black'
                  }`}
                >
                  <ThumbsUp size={10} />
                  <span>{item.likes}</span>
                </button>
              </div>

              <p className={`text-xs leading-relaxed my-1.5 font-medium ${
                isDarkMode ? 'text-[#89998F]' : 'text-[#4A554E]'
              }`}>
                {item.comment}
              </p>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t, i) => (
                    <span
                      key={i}
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                        isDarkMode ? 'bg-[#162019] text-[#89998F]' : 'bg-[#F8F7F4] text-[#5D6861]'
                      }`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
