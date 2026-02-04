
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, TrendingDown, Wallet as WalletIcon, CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Pagination } from '@/components/ui/pagination';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { StatsCard } from '@/components/ui/stats-card';

export const Route = createFileRoute('/(vendor)/vendor/_vendorLayout/wallet/')({
  component: VendorWallet,
});

// Mock withdrawal data
const mockWithdrawals = [
  { id: '1', amount: 150000, status: 'completed', date: new Date('2024-01-15'), method: 'Bank Transfer' },
  { id: '2', amount: 200000, status: 'pending', date: new Date('2024-01-20'), method: 'Bank Transfer' },
  { id: '3', amount: 180000, status: 'completed', date: new Date('2024-01-10'), method: 'Bank Transfer' },
];

const withdrawalSchema = z.object({
  accountHolderName: z.string().min(3, 'Account holder name is required'),
  bankName: z.string().min(3, 'Bank name is required'),
  accountNumber: z.string().min(10, 'Account number must be at least 10 digits'),
  amount: z.number().min(1000, 'Minimum withdrawal is ₦1,000'),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

function VendorWallet() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      amount: 0,
    },
  });

  // Mock data
  const netProfit = 5240000;
  const balance = 3500000;
  const totalWithdrawals = 1740000;
  const platformCharges = 524000; // 10%

  const onSubmit = async (data: WithdrawalFormData) => {
    try {
      // In real app, call API here
      console.log('Withdrawal request:', data);
      toast.success('Withdrawal request submitted successfully');
      setOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit withdrawal request');
    }
  };

  const totalPages = Math.ceil(mockWithdrawals.length / limit);
  const paginatedWithdrawals = mockWithdrawals.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-mmp-primary2">Wallet</h1>
          <p className="text-gray-600 mt-1">Manage your earnings and withdrawals</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-mmp-primary hover:bg-mmp-primary2">
              Request Withdrawal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Withdrawal Request</DialogTitle>
              <DialogDescription>
                Enter your bank details and amount to withdraw
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="accountHolderName">Account Holder Name</Label>
                <Input
                  id="accountHolderName"
                  {...register('accountHolderName')}
                  placeholder="John Doe"
                />
                {errors.accountHolderName && (
                  <p className="text-sm text-red-600 mt-1">{errors.accountHolderName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  {...register('bankName')}
                  placeholder="Access Bank"
                />
                {errors.bankName && (
                  <p className="text-sm text-red-600 mt-1">{errors.bankName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  {...register('accountNumber')}
                  placeholder="0123456789"
                />
                {errors.accountNumber && (
                  <p className="text-sm text-red-600 mt-1">{errors.accountNumber.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="amount">Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  {...register('amount', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.amount && (
                  <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                )}
                <p className="text-sm text-gray-600 mt-1">
                  Available balance: {formatCurrency(balance)}
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-mmp-primary hover:bg-mmp-primary2">
                  Submit Request
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Available Balance"
          value={formatCurrency(balance)}
          icon={WalletIcon}
        />
        <StatsCard
          title="Total Withdrawals"
          value={formatCurrency(totalWithdrawals)}
          icon={TrendingDown}
        />
        <StatsCard
          title="Platform Charges"
          value={formatCurrency(platformCharges)}
          icon={CreditCard}
        />
      </div>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paginatedWithdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{formatCurrency(withdrawal.amount)}</p>
                  <p className="text-sm text-gray-600">{withdrawal.method}</p>
                  <p className="text-xs text-gray-500">
                    {format(withdrawal.date, 'PPP')}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      withdrawal.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {withdrawal.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                meta={{ page, limit, total: mockWithdrawals.length, totalPages }}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}