import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIInsightBadgeProps {
  confidence?: number;
  label?: string;
  className?: string;
}

export const AIInsightBadge: React.FC<AIInsightBadgeProps> = ({
  confidence,
  label = 'AI INSIGHT',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/90 text-emerald-900 border border-emerald-300/80 shadow-xs ${className}`}
    >
      <Sparkles className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
      <span>{label}</span>
      {confidence !== undefined && (
        <span className="ml-1 pl-1.5 border-l border-emerald-300 text-emerald-800 text-[11px] font-medium">
          {confidence}% Confidence
        </span>
      )}
    </span>
  );
};
