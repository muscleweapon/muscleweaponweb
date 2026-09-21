import React from 'react';
import { cn } from '@/lib/cn';
import { Inbox } from 'lucide-react';

export interface MWEmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const MWEmptyState: React.FC<MWEmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-[20px] border border-dashed border-[#DDE5EF] bg-white',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#F5F8FC] flex items-center justify-center text-[#667085] mb-4">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-[#0B1220]">{title}</h3>
      <p className="text-xs text-[#667085] max-w-md mt-1 mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
