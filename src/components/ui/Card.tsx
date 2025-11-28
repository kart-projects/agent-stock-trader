interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-sky-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-sky-50 ${className}`}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`px-6 py-4 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div
      className={`px-6 py-4 border-t border-sky-50 ${className}`}
    >
      {children}
    </div>
  );
}
