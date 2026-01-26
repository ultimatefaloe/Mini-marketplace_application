import React from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { useAdminSignup } from '@/api/auth.query';
import { useAuth } from '@/hooks';
import { AuthFormWrapper, GoogleAuthButton } from '@/components/auth';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { validatePassword } from '@/lib/utils/validation.utils';

const adminSignupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  storeName: z.string().min(2, 'Store name is required'),
  businessType: z.enum(['boutique', 'brand', 'retailer', 'other']),
  businessDescription: z.string().optional(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
  requestPermissions: z.boolean().default(false),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  const validation = validatePassword(data.password);
  return validation.valid;
}, {
  message: "Password must contain uppercase, lowercase, number, and special character",
  path: ["password"],
});

type AdminSignupFormData = z.infer<typeof adminSignupSchema>;

export const Route = createFileRoute('/(auth)/_auth/admin/register')({
  component: AdminSignupPage,
});

function AdminSignupPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const { mutate: signup, isPending } = useAdminSignup();
  const { setAuth } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<AdminSignupFormData>({
    resolver: zodResolver(adminSignupSchema as any),
    defaultValues: {
      businessType: 'boutique',
      acceptTerms: false,
      requestPermissions: false,
    },
  });

  const password = watch('password');
  const businessType = watch('businessType');

  const onSubmit = async (data: AdminSignupFormData) => {
    try {
      const { confirmPassword, acceptTerms, requestPermissions, ...signupData } = data;
      await signup(signupData, {
        onSuccess: (response) => {
          if (response.admin) {
            setAuth(response.admin);
            toast.success('Account created successfully!');
            navigate({ to: '/admin' });
          }
        },
        onError: (error: any) => {
          toast.error(error.message || 'Registration failed, Please try again.');
        },
      });
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Registration failed. Please try again.',
      });
    }
  };

  const footer = (
    <div className="text-center space-y-3">
      <div className="text-sm text-gray-600">
        Already have an business account?{' '}
        <Link
          to="/admin/login"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Sign in
        </Link>
      </div>
      <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
        Are you a customer?{' '}
        <Link
          to="/signup"
          className="font-medium text-mmp-secondary hover:text-mmp-accent hover:underline"
        >
          Customer Sign Up
        </Link>
      </div>
    </div>
  );

  return (
    <AuthFormWrapper
      title={
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6" />
          <span>Business Registration</span>
        </div>
      }
      description="Request access to manage your store on FashionKet"
      backLink="/"
      backText="Back to store"
      footer={footer}
    >
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Business accounts require approval. You'll receive an email once your account is activated.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-gray-700">
              Full Name *
            </Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register('fullName')}
              className={errors.fullName ? 'border-red-500' : 'border-gray-300'}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeName" className="text-gray-700">
              Store Name *
            </Label>
            <Input
              id="storeName"
              placeholder="Your Store Name"
              {...register('storeName')}
              className={errors.storeName ? 'border-red-500' : 'border-gray-300'}
            />
            {errors.storeName && (
              <p className="text-sm text-red-500">{errors.storeName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Business Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@yourstore.com"
            {...register('email')}
            className={errors.email ? 'border-red-500' : 'border-gray-300'}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-700">
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            {...register('phone')}
            className={errors.phone ? 'border-red-500' : 'border-gray-300'}
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType" className="text-gray-700">
            Business Type *
          </Label>
          <select
            id="businessType"
            {...register('businessType')}
            className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-mmp-primary focus:ring-offset-2"
          >
            <option value="boutique">Boutique</option>
            <option value="brand">Brand</option>
            <option value="retailer">Retailer</option>
            <option value="other">Other</option>
          </select>
        </div>

        {businessType === 'other' && (
          <div className="space-y-2">
            <Label htmlFor="businessDescription" className="text-gray-700">
              Describe your business
            </Label>
            <Textarea
              id="businessDescription"
              placeholder="Tell us about your business..."
              {...register('businessDescription')}
              className="border-gray-300 min-h-[80px]"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700">
              Password *
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

        {password && (
          <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
            <p className="font-medium mb-1">Password requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>At least 8 characters long</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
              <li>One special character (@$!%*?&)</li>
            </ul>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="requestPermissions"
              {...register('requestPermissions')}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label
                htmlFor="requestPermissions"
                className="text-sm font-normal text-gray-600 cursor-pointer"
              >
                Request special permissions
              </Label>
              <p className="text-xs text-gray-500">
                Check if you need advanced permissions (bulk operations, analytics access, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="acceptTerms"
              {...register('acceptTerms')}
              className="mt-1"
            />
            <div className="space-y-1">
              <Label
                htmlFor="acceptTerms"
                className="text-sm font-normal text-gray-600 cursor-pointer"
              >
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="text-mmp-primary hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="text-mmp-primary hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </Label>
              {errors.acceptTerms && (
                <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
              )}
            </div>
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
              Submitting Request...
            </>
          ) : (
            'Request Admin Access'
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