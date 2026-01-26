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
import { Eye, EyeOff, CheckCircle, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { validatePassword } from '@/lib/utils/validation.utils';

const adminResetPasswordSchema = z.object({
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

type AdminResetPasswordFormData = z.infer<typeof adminResetPasswordSchema>;

export const Route = createFileRoute('/(auth)/_auth/admin/reset-password')({
  component: AdminResetPasswordPage,
  validateSearch: z.object({
    token: z.string().optional().catch(''),
  }),
});

function AdminResetPasswordPage() {
  const search = Route.useSearch()
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
  } = useForm<AdminResetPasswordFormData>({
    resolver: zodResolver(adminResetPasswordSchema),
    defaultValues: {
      token: search.token || '',
    },
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: AdminResetPasswordFormData) => {
    try {
      await resetPassword(data, {
        onSuccess: () => {
          setIsSubmitted(true);
          toast.success('Password reset successful');
        },
        onError: (error: any) => {
          toast.error(error.message || 'Reset failed');
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
        <Link
          to="/admin/login"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Back to Admin Login
        </Link>
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <AuthFormWrapper
        title={
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            <span>Password Updated</span>
          </div>
        }
        description="Your admin password has been successfully reset"
        footer={footer}
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-green-50 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Security Update Complete
            </h3>
            <p className="text-sm text-gray-600">
              Your admin password has been successfully reset. For security reasons, you'll need to sign in again with your new password.
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Security Tip:</strong> Consider using a password manager to securely store and generate strong passwords.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              asChild
              className="w-full bg-mmp-primary hover:bg-mmp-primary2"
            >
              <Link to="/admin/login">Sign In with New Password</Link>
            </Button>
          </div>
        </div>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title={
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6" />
          <span>Set New Password</span>
        </div>
      }
      description="Create a new secure password for your admin account"
      footer={footer}
    >
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Security Requirements:</strong> Business passwords must meet higher security standards.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="token" className="text-gray-700">
            Reset Token
          </Label>
          <Input
            id="token"
            type="text"
            placeholder="Paste the token from your email"
            {...register('token')}
            className={errors.token ? 'border-red-500' : 'border-gray-300'}
          />
          {errors.token && (
            <p className="text-sm text-red-500">{errors.token.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Found in the password reset email
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-gray-700">
              New Password *
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('newPassword')}
                className={
                  errors.newPassword
                    ? 'border-red-500 pr-10'
                    : 'border-gray-300 pr-10'
                }
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-500">{errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-700">
              Confirm Password *
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className={
                  errors.confirmPassword
                    ? 'border-red-500 pr-10'
                    : 'border-gray-300 pr-10'
                }
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>
        </div>

        {newPassword && (
          <div className="text-xs text-gray-500 p-3 bg-gray-50 border border-gray-200 rounded-md">
            <p className="font-medium mb-2 text-gray-700">Business Password Requirements:</p>
            <ul className="space-y-1">
              <li className="flex items-center">
                <span className={`h-1.5 w-1.5 rounded-full mr-2 ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                Minimum 8 characters
              </li>
              <li className="flex items-center">
                <span className={`h-1.5 w-1.5 rounded-full mr-2 ${/(?=.*[a-z])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                One lowercase letter
              </li>
              <li className="flex items-center">
                <span className={`h-1.5 w-1.5 rounded-full mr-2 ${/(?=.*[A-Z])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                One uppercase letter
              </li>
              <li className="flex items-center">
                <span className={`h-1.5 w-1.5 rounded-full mr-2 ${/(?=.*\d)/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                One number
              </li>
              <li className="flex items-center">
                <span className={`h-1.5 w-1.5 rounded-full mr-2 ${/(?=.*[@$!%*?&])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                One special character (@$!%*?&)
              </li>
            </ul>
          </div>
        )}

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-700">
            <strong>Important:</strong> After resetting your password, you'll be logged out of all other sessions for security.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-mmp-primary hover:bg-mmp-primary2 shadow-sm"
          disabled={isPending}
          size="lg"
        >
          {isPending ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
              Updating Password...
            </>
          ) : (
            'Reset Admin Password'
          )}
        </Button>
      </form>
    </AuthFormWrapper>
  )
}