import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRequestPasswordReset } from '@/api/auth.query';
import { AuthFormWrapper } from '@/components/auth';
import { CheckCircle } from 'lucide-react';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute('/(auth)/_auth/forgot-password')({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { mutate: requestReset, isPending } = useRequestPasswordReset('user');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await requestReset(data, {
        onSuccess: () => {
          setIsSubmitted(true);
        },
      });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Failed to send reset email. Please try again.',
      });
    }
  };

  const footer = (
    <div className="text-center space-y-2">
      <div className="text-sm text-gray-600">
        Remember your password?{' '}
        <Link
          to="/login"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Sign in
        </Link>
      </div>
      <div className="text-sm text-gray-600">
        Need to reset admin password?{' '}
        <Link
          to="/admin/forgot-password"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Admin Password Reset
        </Link>
      </div>
    </div>
  );

  return (
    <AuthFormWrapper
      title="Reset your password"
      description="Enter your email address and we'll send you a link to reset your password."
      footer={footer}
    >
      {isSubmitted ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Check your email
            </h3>
            <p className="text-sm text-gray-600">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-mmp-primary hover:bg-mmp-primary2"
          >
            <Link to="/login">Back to Sign In</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errors.root && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-mmp-primary hover:bg-mmp-primary2"
            disabled={isPending}
          >
            {isPending ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
      )}
    </AuthFormWrapper>
  );
}