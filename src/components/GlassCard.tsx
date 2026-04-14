import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverLift?: boolean;
}

export default function GlassCard({
  children,
  className = '',
  onClick,
  hoverLift = true,
}: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={`glass-card ${hoverLift ? 'card-hover' : ''} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
