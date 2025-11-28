import type { Rating } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-white/10 text-slate-300 border-white/20',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface RatingBadgeProps {
  rating: Rating;
  className?: string;
}

export function RatingBadge({ rating, className = '' }: RatingBadgeProps) {
  const variant =
    rating === 'BUY' ? 'success' : rating === 'SELL' ? 'danger' : 'warning';

  return (
    <Badge variant={variant} className={`text-sm font-bold ${className}`}>
      {rating}
    </Badge>
  );
}
