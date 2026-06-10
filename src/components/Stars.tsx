import React, { useState } from 'react';

interface StarsProps {
  value: number;
  size?: number;
  /** When provided, the stars become an interactive input. */
  onChange?: (value: number) => void;
}

/** Read-only or interactive star rating using Material Symbols. */
export default function Stars({ value, size = 16, onChange }: StarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const interactive = !!onChange;
  const shown = hover ?? value;

  return (
    <div className="inline-flex items-center" role={interactive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(shown);
        return (
          <span
            key={n}
            onClick={interactive ? () => onChange!(n) : undefined}
            onMouseEnter={interactive ? () => setHover(n) : undefined}
            onMouseLeave={interactive ? () => setHover(null) : undefined}
            className={`material-symbols-outlined ${filled ? 'text-amber-500' : 'text-slate-300'} ${
              interactive ? 'cursor-pointer hover:scale-110 transition' : ''
            }`}
            style={{ fontSize: size, fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
          >
            star
          </span>
        );
      })}
    </div>
  );
}
