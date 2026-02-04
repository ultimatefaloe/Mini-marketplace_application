import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  ArrowDownToLine,
  Package,
  ShoppingCart,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ordersQuery, productsQuery, orderStatsQuery } from '@/api/queries';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { StatsCard } from '@/components/ui/stats-card';
import { OrdersTable } from '@/components/orders/order-table';

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout/')({
  loader: async ({ context }) => {
    const queryClient = context.queryClient;
    
    // Prefetch data
    const [orders, products, stats] = await Promise.all([
      queryClient.ensureQueryData(ordersQuery({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })),
      queryClient.ensureQueryData(productsQuery({ page: 1, limit: 100 })),
      queryClient.ensureQueryData(orderStatsQuery()),
    ]);

    return { orders, products, stats };
  },
  component: VendorDashboard,
  pendingComponent: LoadingState,
  errorComponent: ErrorState,
});

// Mock data for charts
const salesData = [
  { name: 'Mon', products: 12, profit: 24000 },
  { name: 'Tue', products: 19, profit: 38000 },
  { name: 'Wed', products: 15, profit: 30000 },
  { name: 'Thu', products: 25, profit: 50000 },
  { name: 'Fri', products: 22, profit: 44000 },
  { name: 'Sat', products: 30, profit: 60000 },
  { name: 'Sun', products: 18, profit: 36000 },
];

const orderStatusData = [
  { name: 'Pending', value: 20, color: '#fbbf24' },
  { name: 'Processing', value: 15, color: '#a78bfa' },
  { name: 'Shipped', value: 25, color: '#60a5fa' },
  { name: 'Delivered', value: 35, color: '#34d399' },
  { name: 'Cancelled', value: 5, color: '#f87171' },
];

function VendorDashboard() {
  const { data: ordersData } = useQuery(ordersQuery({ page: 1, limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }));
  const { data: productsData } = useQuery(productsQuery({ page: 1, limit: 100 }));
  const { data: stats } = useQuery(orderStatsQuery());

  const recentOrders = ordersData?.data || [];
  const totalProducts = productsData?.pagination?.total || 0;
  const totalOrders = stats?.total || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  // Calculate mock values (in real app, these would come from API)
  const netProfit = totalRevenue * 0.7; // 70% of revenue
  const balance = netProfit * 0.6; // 60% available
  const withdrawals = netProfit - balance;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-mmp-primary2">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's your business overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={TrendingUp}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Balance"
          value={formatCurrency(balance)}
          icon={Wallet}
        />
        <StatsCard
          title="Net Withdrawal"
          value={formatCurrency(withdrawals)}
          icon={ArrowDownToLine}
          trend={{ value: 5.4, isPositive: false }}
        />
        <StatsCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
        />
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingCart}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="products"
                  stroke="#1e40af"
                  strokeWidth={2}
                  name="Products Sold"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="profit"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Net Profit (₦)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent! * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={recentOrders} />
        </CardContent>
      </Card>
    </div>
  );
}