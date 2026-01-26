import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResetPassword } from '@/api/auth.query';
import { AuthFormWrapper } from '@/components/auth';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { validatePassword } from '@/lib/utils/validation.utils';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  const validation = validatePassword(data.newPassword);
  return validation.valid;
}, {
  message: "Password must contain uppercase, lowercase, number, and special character",
  path: ["newPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const Route = createFileRoute('/(auth)/_auth/reset-password')({
  component: ResetPasswordPage,
  validateSearch: z.object({
    token: z.string().optional().catch(''),
    redirect: z.string().optional().catch(''),
  }),
});

function ResetPasswordPage() {
  const search = Route.useSearch();
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: search.token || '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(data, {
        onSuccess: () => {
          setIsSubmitted(true);
        },
      });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Failed to reset password. Please try again.',
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
    </div>
  );

  if (isSubmitted) {
    return (
      <AuthFormWrapper
        title="Password Reset"
        description="Your password has been successfully reset."
        footer={footer}
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Success!
            </h3>
            <p className="text-sm text-gray-600">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
          </div>
          <Button
            asChild
            className="w-full bg-mmp-primary hover:bg-mmp-primary2"
          >
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Reset your password"
      description="Enter your new password below."
      footer={footer}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="token">Reset Token</Label>
          <Input
            id="token"
            type="text"
            placeholder="Enter reset token from email"
            {...register('token')}
            className={errors.token ? 'border-red-500' : ''}
          />
          {errors.token && (
            <p className="text-sm text-red-500">{errors.token.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('newPassword')}
              className={errors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-red-500">{errors.newPassword.message}</p>
          )}
          {newPassword && (
            <div className="text-xs text-gray-500 mt-1">
              Password must contain at least 8 characters with uppercase, lowercase, number, and special character
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('confirmPassword')}
              className={errors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-mmp-primary hover:bg-mmp-primary2"
          disabled={isPending}
        >
          {isPending ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}