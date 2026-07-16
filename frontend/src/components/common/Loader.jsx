import { cx } from '../../utils/helpers';

export function Spinner({ size = 24, className = '' }) {
  return (
    <div
      className={cx('animate-spin rounded-full border-2 border-white/20 border-t-white', className)}
      style={{ width: size, height: size }}
    />
  );
}

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[60vh]">
      <Spinner size={32} />
    </div>
  );
}
