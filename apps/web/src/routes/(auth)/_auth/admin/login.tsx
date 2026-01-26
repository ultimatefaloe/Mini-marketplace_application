import React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminLogin } from '@/api/auth.query';
import { useAuth } from '@/hooks';
import { AuthFormWrapper, GoogleAuthButton } from '@/components/auth';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type AdminLoginFormData = z.infer<typeof adminLoginSchema>;

export const Route = createFileRoute('/(auth)/_auth/admin/login')({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const { mutate: login, isPending } = useAdminLogin();
  const { setAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<AdminLoginFormData>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    try {
      await login(data, {
        onSuccess: (response) => {
          if (response.admin) {
            setAuth(response.admin);
            toast.success('Welcome back!, Successfully logged in as admin.');
            navigate({ to: '/admin' });
          }
        },
        onError: (error: any) => {
          toast.error('Login failed, Invalid credentials');
        },
      });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Admin login failed. Please try again.',
      });
    }
  };

  const footer = (
    <div className="text-center space-y-3">
      <div className="text-sm text-gray-600">
        <Link
          to="/admin/forgot-password"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
      <div className="text-sm text-gray-600">
        Don't have an admin account?{' '}
        <Link
          to="/admin/register"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Request Access
        </Link>
      </div>
      <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
        Are you a customer?{' '}
        <Link
          to="/login"
          className="font-medium text-mmp-secondary hover:text-mmp-accent hover:underline"
        >
          Customer Login
        </Link>
      </div>
    </div>
  );

  return (
    <AuthFormWrapper
      title={
        <div className="flex items-center justify-center gap-2">
          <Building2 className="h-6 w-6" />
          <span>Admin Portal</span>
        </div>
      }
      description="Sign in to manage your FashionKet store"
      backLink="/"
      backText="Back to store"
      footer={footer}
    >
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> This portal is for store administrators only.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Admin Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@fashionket.com"
            {...register('email')}
            className={errors.email ? 'border-red-500' : 'border-gray-300'}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={
                errors.password
                  ? 'border-red-500 pr-10'
                  : 'border-gray-300 pr-10'
              }
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              {...register('rememberMe')}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-normal text-gray-600 cursor-pointer"
            >
              Remember me
            </Label>
          </div>
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
              Signing in...
            </>
          ) : (
            'Sign in as Admin'
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <GoogleAuthButton variant="admin" disabled={isPending} />
    </AuthFormWrapper>
  );
}