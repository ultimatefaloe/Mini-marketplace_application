import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';
import { 
  Clock, 
  RefreshCw, 
  Truck, 
  CheckCircle, 
  XCircle,
  AlertCircle 
} from 'lucide-react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  className: string;
}> = {
  PENDING_PAYMENT: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  },
  PROCESSING: {
    label: 'Processing',
    icon: RefreshCw,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  SHIPPED: {
    label: 'Shipped',
    icon: Truck,
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  REFUNDED: {
    label: 'Refunded',
    icon: AlertCircle,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  },
  PAID: {
    label: 'Failed',
    icon: XCircle,
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const config = statusConfig[status] || statusConfig.PENDING_PAYMENT;
  const Icon = config.icon;

  return (
    <Badge className={cn(config.className, className)}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label}
    </Badge>
  );
};