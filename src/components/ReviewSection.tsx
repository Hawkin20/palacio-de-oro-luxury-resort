import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../lib/types';
import StarRating from './StarRating';
import GlassCard from './GlassCard';

interface ReviewSectionProps {
  roomId?: string;
  menuItemId?: string;
  userId?: string;
  isLoggedIn: boolean;
}

export default function ReviewSection({
  roomId,
  menuItemId,
  userId,
  isLoggedIn,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [roomId, menuItemId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let query = supabase.from('reviews').select('*');

      if (roomId) {
        query = query.eq('room_id', roomId);
      } else if (menuItemId) {
        query = query.eq('menu_item_id', menuItemId);
      }

      const { data, error } = await query.order('created_at', {
        ascending: false,
      });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isLoggedIn || !userId) {
      alert('Please log in to leave a review');
      return;
    }

    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      const { error } = await supabase.from('reviews').insert([
        {
          guest_id: userId,
          room_id: roomId || null,
          menu_item_id: menuItemId || null,
          rating,
          comment,
        },
      ]);

      if (error) throw error;

      setRating(0);
      setComment('');
      await fetchReviews();
    } catch (error: any) {
      alert(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-playfair text-2xl text-palacio-gold mb-4">
          Guest Reviews
        </h3>

        <div className="flex items-center gap-4 mb-6">
          <div>
            <div className="text-4xl font-playfair text-palacio-gold">
              {avgRating}
            </div>
            <p className="text-gray-400 text-sm">
              {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
          {avgRating > 0 && (
            <div>
              <StarRating rating={Math.round(avgRating)} interactive={false} />
            </div>
          )}
        </div>
      </div>

      {isLoggedIn && (
        <GlassCard className="p-4">
          <h4 className="font-cinzel text-palacio-gold mb-3">Leave a Review</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Rating
              </label>
              <StarRating
                rating={rating}
                onRate={setRating}
                interactive={true}
                size={24}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full px-3 py-2 bg-white/10 border border-palacio-gold/30 rounded text-white placeholder-gray-500 focus:border-palacio-gold focus:outline-none resize-none"
                rows={3}
              />
            </div>
            <button
              onClick={handleSubmitReview}
              disabled={submitting}
              className="w-full px-4 py-2 bg-palacio-gold/20 text-palacio-gold rounded hover:bg-palacio-gold/30 disabled:opacity-50 font-cinzel smooth-transition"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <p className="text-gray-400">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-sm">No reviews yet</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <GlassCard key={review.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <StarRating rating={review.rating} interactive={false} />
                <span className="text-gray-500 text-xs">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
              {review.comment && (
                <p className="text-gray-300 text-sm">{review.comment}</p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
