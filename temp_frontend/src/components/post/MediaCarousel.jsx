import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../../utils/helpers';

export default function MediaCarousel({ media = [], onDoubleClick, showHeart, aspect = 'aspect-square' }) {
  const [index, setIndex] = useState(0);
  const hasMultiple = media.length > 1;
  const current = media[index];

  if (!current) return null;

  return (
    <div className={cx('relative w-full bg-black overflow-hidden select-none', aspect)}>
      <div onDoubleClick={onDoubleClick} className="w-full h-full flex items-center justify-center">
        {current.type === 'video' ? (
          <video
            src={current.url}
            className="w-full h-full object-contain bg-black"
            controls
            playsInline
            loop
            muted
          />
        ) : (
          <img
            src={current.url}
            alt="post media"
            className="w-full h-full object-contain bg-black"
            draggable={false}
          />
        )}
      </div>

      {showHeart && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="animate-heartPop"
            width="100"
            height="100"
            viewBox="0 0 24 24"
            fill="white"
            stroke="white"
          >
            <path d="M12 21s-6.7-4.35-9.3-8.1C.8 9.9 1.9 6.3 5.1 5.2c2-.7 3.9.1 5 1.7C11.1 5.3 13 4.5 15 5.2c3.2 1.1 4.3 4.7 2.4 7.7C18.7 16.65 12 21 12 21z" />
          </svg>
        </div>
      )}

      {hasMultiple && (
        <>
          {index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => i - 1);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-1"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {index < media.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIndex((i) => i + 1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full p-1"
            >
              <ChevronRight size={18} />
            </button>
          )}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
            {index + 1}/{media.length}
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {media.map((_, i) => (
              <span
                key={i}
                className={cx('w-1.5 h-1.5 rounded-full', i === index ? 'bg-ig-blue' : 'bg-white/50')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
