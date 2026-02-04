import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  className,
}) => {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-mmp-primary2 mt-2">{value}</p>
            {trend && (
              <p
                className={cn(
                  'text-sm mt-2 flex items-center gap-1',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
                <span className="text-gray-500">vs last month</span>
              </p>
            )}
          </div>
          <div className="h-12 w-12 rounded-full bg-mmp-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-mmp-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};