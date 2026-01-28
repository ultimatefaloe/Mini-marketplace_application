import React from 'react';
import { cn } from '@/lib/utils';
import { OrderStatus, type IOrder } from '@/types';
import { 
  CheckCircle, 
  Clock, 
  CreditCard, 
  Package, 
  Truck, 
  Home,
  XCircle
} from 'lucide-react';

interface OrderTimelineProps {
  order: IOrder;
}

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const timelineSteps = [
    {
      id: 'order_placed',
      label: 'Order Placed',
      date: order.createdAt,
      icon: Package,
      completed: true,
      active: false,
    },
    {
      id: 'payment',
      label: 'Payment',
      date: order.paidAt,
      icon: CreditCard,
      completed: !!order.paidAt,
      active: !order.paidAt && !order.cancelledAt,
    },
    {
      id: 'processing',
      label: 'Processing',
      date: order.createdAt, // Updated when processing starts
      icon: Package,
      completed: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(order.status),
      active: order.status === OrderStatus.PROCESSING,
    },
    {
      id: 'shipped',
      label: 'Shipped',
      date: order.shippedAt,
      icon: Truck,
      completed: [OrderStatus.SHIPPED, OrderStatus.SHIPPED].includes(order.status),
      active: order.status === OrderStatus.SHIPPED,
    },
    {
      id: 'delivered',
      label: 'Delivered',
      date: order.deliveredAt,
      icon: Home,
      completed: order.status === OrderStatus.DELIVERED,
      active: order.status === OrderStatus.DELIVERED,
    },
    {
      id: 'cancelled',
      label: 'Cancelled',
      date: order.cancelledAt,
      icon: XCircle,
      completed: order.status === OrderStatus.CANCELLED,
      active: order.status === OrderStatus.CANCELLED,
    },
  ].filter(step => step.completed || step.active || step.id === 'order_placed');

  const getStepStatus = (step: typeof timelineSteps[0]) => {
    if (step.completed) return 'completed';
    if (step.active) return 'active';
    return 'pending';
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Timeline Steps */}
      <div className="relative space-y-8">
        {timelineSteps.map((step, index) => {
          const status = getStepStatus(step);
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="relative flex items-start gap-4">
              {/* Icon */}
              <div className={cn(
                'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2',
                status === 'completed' && 'bg-green-100 border-green-500',
                status === 'active' && 'bg-blue-100 border-blue-500 animate-pulse',
                status === 'pending' && 'bg-gray-100 border-gray-300',
              )}>
                <Icon className={cn(
                  'h-4 w-4',
                  status === 'completed' && 'text-green-600',
                  status === 'active' && 'text-blue-600',
                  status === 'pending' && 'text-gray-400',
                )} />
                {status === 'completed' && (
                  <CheckCircle className="absolute -right-1 -top-1 h-4 w-4 text-green-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className={cn(
                    'font-medium',
                    status === 'completed' && 'text-green-700',
                    status === 'active' && 'text-blue-700 font-semibold',
                    status === 'pending' && 'text-gray-600',
                  )}>
                    {step.label}
                  </h4>
                  {step.date && (
                    <span className="text-sm text-gray-500">
                      {formatDate(step.date)}
                    </span>
                  )}
                </div>
                
                {step.id === 'shipped' && order.trackingNumber && (
                  <p className="mt-1 text-sm text-gray-600">
                    Tracking: <span className="font-mono">{order.trackingNumber}</span>
                  </p>
                )}
                
                {step.id === 'cancelled' && order.cancellationReason && (
                  <p className="mt-1 text-sm text-gray-600">
                    Reason: {order.cancellationReason}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};