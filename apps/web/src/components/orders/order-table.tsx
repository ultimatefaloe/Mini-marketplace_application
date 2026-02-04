import React from 'react';
import { Link } from '@tanstack/react-router';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Eye } from 'lucide-react';
import type { IOrderListItem, OrderStatus } from '@/types';
import { format } from 'date-fns';

interface OrdersTableProps {
  orders: IOrderListItem[];
  showActions?: boolean;
}

const getStatusColor = (status: OrderStatus): string => {
  const statusColors: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PENDING_PAYMENT: 'bg-blue-100 text-blue-800',
    PROCESSING: 'bg-purple-100 text-purple-800',
    PAID: 'bg-green-100 text-green-800',
    SHIPPED: 'bg-indigo-100 text-indigo-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders, showActions = true }) => {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order Number</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id.toString()}>
              <TableCell className="font-medium">{order.orderNumber}</TableCell>
              <TableCell>
                {format(new Date(order.createdAt), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{order.itemCount} items</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(order.totalAmount)}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)} variant="outline">
                  {order.status}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="hover:bg-mmp-primary/10"
                  >
                    <Link
                      to="/vendor/orders/$orderId"
                      params={{ orderId: order._id.toString() }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};