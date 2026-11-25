import React from 'react';
import { Flame } from 'lucide-react';
import { SpiceLevel } from '../../types';

interface SpiceIndicatorProps {
  level: SpiceLevel;
  showText?: boolean;
}

export const SpiceIndicator: React.FC<SpiceIndicatorProps> = ({
  level,
  showText = true,
}) => {
  const levelLabel =
    level === 0
      ? 'Original'
      : level <= 2
      ? `Sedang (${level}/5)`
      : level <= 4
      ? `Pedas (${level}/5)`
      : `Ekstra (${level}/5)`;

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#A7A7A7] tabular-nums whitespace-nowrap">
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((idx) => (
          <Flame
            key={idx}
            className={`w-3.5 h-3.5 ${
              idx <= level ? 'text-[#F15A24] fill-[#F15A24]' : 'text-[#3A3A3A]'
            }`}
          />
        ))}
      </span>
      {showText && <span>{levelLabel}</span>}
    </span>
  );
};
