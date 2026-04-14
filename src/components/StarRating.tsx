import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRate?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
}

export default function StarRating({
  rating,
  onRate,
  interactive = false,
  size = 16,
}: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => interactive && onRate && onRate(star)}
          className={`smooth-transition ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
          disabled={!interactive}
        >
          <Star
            size={size}
            className={`${
              star <= rating
                ? 'fill-palacio-gold text-palacio-gold'
                : 'text-gray-500'
            } ${interactive ? 'hover:text-palacio-gold' : ''}`}
          />
        </button>
      ))}
    </div>
  );
}
