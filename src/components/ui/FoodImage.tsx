import React, { useState } from 'react';
import { Flame } from 'lucide-react';

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  fallbackTitle?: string;
}

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  priority = false,
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#241313] via-[#1C1C1C] to-[#111111] text-[#FFF4E8] p-4 text-center ${className}`}
      >
        <Flame className="w-8 h-8 text-[#D71920] mb-2" aria-hidden="true" />
        <span className="font-display text-sm tracking-wider uppercase text-[#FFF4E8]/90">
          {fallbackTitle || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
