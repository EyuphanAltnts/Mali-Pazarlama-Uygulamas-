import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table-row';
  height?: string | number;
  width?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'text',
  height,
  width,
  className = '',
  ...props
}) => {
  const baseStyles = 'animate-pulse bg-slate-200/70 rounded-lg';

  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full h-10 w-10',
    rectangular: 'h-24 w-full rounded-xl',
    card: 'h-32 w-full rounded-2xl border border-slate-100',
    'table-row': 'h-12 w-full rounded-lg',
  };

  const style: React.CSSProperties = {
    ...(height ? { height } : {}),
    ...(width ? { width } : {}),
  };

  return <div className={`${baseStyles} ${variants[variant]} ${className}`} style={style} {...props} />;
};

