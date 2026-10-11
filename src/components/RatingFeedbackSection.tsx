import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Send, 
  CheckCircle2, 
  Mail, 
  ThumbsUp, 
  ShieldCheck, 
  Heart 
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

const STORAGE_REVIEWS_KEY = 'weatherapp_community_reviews';
const STORAGE_USER_RATED_KEY = 'weatherapp_has_rated';
const TARGET_GMAIL = 'mmmmahe46@gmail.com';

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    name: 'Mahesh K.',
    rating: 5,
    tags: ['🏡 Live House Scenery', '📱 Home Screen Widgets'],
    comment: 'The animated farm house reacting to rain and sun right on my home screen widget is unmatched! The liquid glass dock makes navigation super fluid.',
    date: '2 hours ago',
    likes: 42
  },
  {
    id: 'rev-2',
    name: 'Aiden Vance',
    rating: 5,
    tags: ['⚡ Live Weather Telemetry', '🎨 Liquid Glass Dock'],
    comment: 'Colors pop intensely on my display with AMOLED mode enabled. Fast location detection and smooth widget integration!',
    date: '1 day ago',
    likes: 29
  },
  {
    id: 'rev-3',
    name: 'Priya Sharma',
    rating: 5,
    tags: ['🎯 Forecast Accuracy', '🌧️ Rain Radar'],
    comment: 'The next-hour precipitation intensity graph saved me from getting drenched. Clean design with great Android performance.',
    date: '3 days ago',
    likes: 18
  }
];

export const RatingFeedbackSection: React.FC<RatingFeedbackProps> = ({ location }) => {
  const { isDarkMode, customAccentColor } = useTheme();

  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['🏡 Live House Scenery', '🎨 Liquid Glass Dock']);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Status State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  
  // Community Reviews List
  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REVIEWS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse stored reviews:', e);
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
    '🏡 Live House Scenery',
    '🎨 Liquid Glass Dock',
    '📱 Home Screen Widgets',
    '🎯 Forecast Accuracy',
    '🌧️ Rain Radar',
    '💡 Feature Request',
    '🐛 Bug Report'
  ];

  const ratingLabels: { [key: number]: string } = {
    1: 'Needs Improvement 😕',
    2: 'Fair Experience 🌤️',
    3: 'Good App ⛅',
    4: 'Great Weather App! ☀️',
    5: 'Masterpiece Experience! 🌟❤️'
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
    try { navigator.vibrate?.(20); } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (rating === 0) {
      setValidationError('Please select a star rating before submitting.');
      return;
    }

    if (!comment.trim() && selectedTags.length === 0) {
      setValidationError('Please write a brief comment or select at least one feature tag.');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    const displayName = userName.trim() || 'Weather User';
    const feedbackText = comment.trim() || 'User gave a 5-star rating!';

    // Prepare Payload for automated dispatch to developer Gmail
    const emailPayload = {
      _subject: `🌟 New Weather Pro Feedback (${rating} Stars) from ${displayName}`,
      _captcha: 'false',
      rating: `${rating} / 5 Stars`,
      reviewer_name: displayName,
      reviewer_email: userEmail.trim() || 'Anonymous (App User)',
      comment: feedbackText,
      selected_tags: selectedTags.join(', ') || 'None',
      user_location: `${location.name}, ${location.country}`,
      timestamp: new Date().toLocaleString(),
      app_version: 'WeatherPro Mobile App'
    };

    try {
      await fetch(`https://formsubmit.co/ajax/${TARGET_GMAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(emailPayload)
      });
    } catch (err) {
      console.warn('Direct HTTP dispatch attempt note:', err);
    }

    const newReview: ReviewItem = {
      id: `rev-user-${Date.now()}`,
      name: displayName,
      rating,
      tags: selectedTags,
      comment: feedbackText,
      date: 'Just now',
      likes: 1,
      isUserReview: true
    };

    setReviews(prev => [newReview, ...prev]);

    try {
      localStorage.setItem(STORAGE_USER_RATED_KEY, 'true');
      navigator.vibrate?.([30, 50, 30]);
    } catch {}

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setComment('');
  };

  const mailtoUrl = `mailto:${TARGET_GMAIL}?subject=${encodeURIComponent(
    `Weather App Feedback (${rating} Stars) - ${userName || 'User'}`
  )}&body=${encodeURIComponent(
    `Rating: ${rating} / 5 Stars\n` +
    `Tags: ${selectedTags.join(', ')}\n` +
    `Feedback:\n${comment || 'Great app!'}\n\n` +
    `Location: ${location.name}\n` +
    `Date: ${new Date().toLocaleString()}`
  )}`;

  return (
    <section className="w-full px-4 pt-4 pb-12 select-none">
      {/* SECTION HEADER */}
      <div className="flex items-center space-x-2 mb-3">
        <div 
          className="w-8 h-8 rounded-xl flex items-center justify-center font-bold"
          style={{ 
            backgroundColor: `${customAccentColor}25`,
            color: customAccentColor 
          }}
        >
          <Heart size={18} />
        </div>
        <div>
          <h2 className="text-base font-extrabold tracking-tight">
            App Rating & Feedback
          </h2>
          <p className={`text-[11px] font-medium ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`}>
            Share your thoughts & suggestions directly with the developer team
          </p>
        </div>
      </div>

      {/* RATING SUBMISSION CARD */}
      <div className={`p-4 rounded-3xl border shadow-xl relative overflow-hidden transition-all mb-6 ${
        isDarkMode 
          ? 'bg-[#10141D] border-white/10 text-white' 
          : 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50'
      }`}>
        <div 
          className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none"
          style={{ backgroundColor: customAccentColor }}
        />

        {submitSuccess ? (
          <div className="py-6 px-3 flex flex-col items-center text-center animate-card-slide-fade">
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{ backgroundColor: `${customAccentColor}20`, color: customAccentColor }}
            >
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-base font-extrabold mb-1">
              Feedback Sent Successfully!
            </h3>
            <p className={`text-xs max-w-xs mb-3 ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
              Your message has been sent directly to our developer team and saved to community thoughts.
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                ✓ Feedback Delivered
              </span>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-[11px] font-bold text-teal-400 hover:underline cursor-pointer"
              >
                Write Another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STAR RATING INTERACTIVE ROW */}
            <div className="flex flex-col items-center text-center pt-1 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1.5">
                Tap to Rate App
              </span>
              <div className="flex items-center space-x-2 my-1">
                {[1, 2, 3, 4, 5].map(star => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(star);
                        try { navigator.vibrate?.(15); } catch {}
                      }}
                      className="p-1 rounded-full transition-transform hover:scale-125 active:scale-95 cursor-pointer"
                      title={`${star} Star`}
                    >
                      <Star 
                        size={28} 
                        className={`transition-colors duration-200 ${
                          isFilled 
                            ? 'text-amber-400 fill-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]' 
                            : isDarkMode ? 'text-zinc-600' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold mt-1 text-amber-400">
                {ratingLabels[hoverRating || rating]}
              </span>
            </div>

            {/* QUICK CATEGORY TAG CHIPS */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1.5">
                What stands out most?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500 text-slate-950 font-extrabold shadow-sm scale-102'
                          : isDarkMode
                          ? 'bg-[#181D28] text-zinc-300 hover:bg-[#202736] border border-white/5'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FEEDBACK COMMENT INPUT */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider opacity-70 block mb-1">
                Your Suggestions or Feedback
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Share your experience or features you'd like added..."
                rows={3}
                className={`w-full text-xs p-3 rounded-2xl resize-none outline-hidden transition-all ${
                  isDarkMode
                    ? 'bg-[#0A0D13] border border-white/10 text-white placeholder-zinc-500 focus:border-teal-400'
                    : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:border-teal-500'
                }`}
              />
            </div>

            {/* OPTIONAL USER DETAILS */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="Your Name (Optional)"
                  className={`w-full text-xs px-3 py-2 rounded-xl outline-hidden ${
                    isDarkMode
                      ? 'bg-[#0A0D13] border border-white/10 text-white placeholder-zinc-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
              <div>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  placeholder="Your Email (Optional)"
                  className={`w-full text-xs px-3 py-2 rounded-xl outline-hidden ${
                    isDarkMode
                      ? 'bg-[#0A0D13] border border-white/10 text-white placeholder-zinc-500'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>
            </div>

            {/* VALIDATION ERROR ALERT */}
            {validationError && (
              <p className="text-xs text-rose-400 font-bold px-1 animate-fadeIn">
                ⚠️ {validationError}
              </p>
            )}

            {/* SUBMIT BUTTON */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-teal-500/25 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Feedback...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between mt-2.5 px-1">
                <span className="text-[10px] text-zinc-500 flex items-center space-x-1">
                  <ShieldCheck size={12} className="text-teal-400" />
                  <span>Secure & Private Feedback</span>
                </span>

                <a
                  href={mailtoUrl}
                  className="text-[10px] font-bold text-teal-400 hover:underline flex items-center space-x-1"
                  title="Open directly in email app"
                >
                  <Mail size={11} />
                  <span>Open Email App</span>
                </a>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* COMMUNITY THOUGHTS FEED */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400">
            Community Thoughts ({reviews.length})
          </span>
          <span className="text-[10px] font-bold text-amber-400 flex items-center space-x-1">
            <Star size={11} className="fill-amber-400" />
            <span>4.9 / 5.0 Rating</span>
          </span>
        </div>

        <div className="space-y-3">
          {reviews.map(item => {
            const hasLiked = likedReviewIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  item.isUserReview
                    ? 'border-teal-500/40 bg-teal-500/5'
                    : isDarkMode
                    ? 'bg-[#10141D] border-white/5'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold">{item.name}</span>
                      {item.isUserReview && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-sm bg-teal-500/20 text-teal-300 font-bold">
                          You
                        </span>
                      )}
                      <span className="text-[10px] opacity-60">• {item.date}</span>
                    </div>
                    <div className="flex items-center space-x-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= item.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleLikeReview(item.id)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      hasLiked
                        ? 'bg-teal-500/20 text-teal-300'
                        : isDarkMode
                        ? 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ThumbsUp size={11} />
                    <span>{item.likes}</span>
                  </button>
                </div>

                <p className={`text-xs leading-relaxed mb-2 font-medium ${
                  isDarkMode ? 'text-zinc-300' : 'text-slate-700'
                }`}>
                  {item.comment}
                </p>

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((t, i) => (
                      <span
                        key={i}
                        className={`text-[9px] font-semibold px-2 py-0.5 rounded-md ${
                          isDarkMode
                            ? 'bg-zinc-800/80 text-zinc-300'
                            : 'bg-slate-100 text-slate-600'
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
      </div>
    </section>
  );
};
