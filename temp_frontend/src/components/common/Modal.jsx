import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cx } from '../../utils/helpers';

export default function Modal({ open, onClose, children, className = '', showClose = true }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fadeIn p-4"
      onClick={onClose}
    >
      <div
        className={cx(
          'relative bg-ig-surface border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-slideUp shadow-2xl',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {showClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 text-white/80 hover:text-white bg-black/40 rounded-full p-1"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
