import React from "react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  className = "",
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  const starSizes = {
    sm: { width: 12, height: 12 },
    md: { width: 16, height: 16 },
    lg: { width: 20, height: 20 },
  };

  const { width, height } = starSizes[size];

  return (
    <div className={`flex items-center ${className}`}>
      {/* Full stars */}
      {Array.from({ length: fullStars }).map((_, i) => (
        <StarIcon key={`full-${i}`} filled width={width} height={height} />
      ))}

      {/* Half star */}
      {hasHalfStar && <HalfStarIcon key="half" width={width} height={height} />}

      {/* Empty stars */}
      {Array.from({ length: emptyStars }).map((_, i) => (
        <StarIcon key={`empty-${i}`} filled={false} width={width} height={height} />
      ))}
    </div>
  );
}

function StarIcon({ filled = true, width = 16, height = 16 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="star-filled"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function HalfStarIcon({ width = 16, height = 16 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="star-filled"
    >
      <defs>
        <linearGradient id="halfGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="50%" stopColor="currentColor" />
          <stop offset="50%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="url(#halfGradient)"
      />
    </svg>
  );
}
