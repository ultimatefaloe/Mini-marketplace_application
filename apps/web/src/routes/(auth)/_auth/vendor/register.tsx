import { createFileRoute, useNavigate, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks'
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useVendorSignup } from '@/api/queries'
import { toast } from 'react-toastify'
import { AuthFormWrapper } from '@/components/auth'
import React from 'react'

export const Route = createFileRoute('/(auth)/_auth/vendor/register')({
  component: VendorSignup,
})

const signupSchema = z
  .object({
    fullName: z.string("Invalid name"),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    businessName: z.string().min(3, 'Store name must be at least 3 characters'),
    description: z.string().optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    location: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      country: z.string().min(1, 'Country is required'),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignupFormData = z.infer<typeof signupSchema>

function VendorSignup() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const { isAuthenticated, isVendor, setAuthVendor } = useAuth()
  const navigate = useNavigate()
  const { mutateAsync: signup, isPending } = useVendorSignup()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      location: {
        country: 'Nigeria',
      },
    },
  })

  if (isAuthenticated && isVendor) {
    return <Navigate to="/vendor" />
  }

  const onSubmit = async (data: SignupFormData) => {
    try {
      signup(data, {
        onSuccess: (response) => {
          console.log(response)
          if (response.success) {
            setAuthVendor(response.data)
            toast.success(response.message || 'Login successfully')
            navigate({ to: '/vendor' })
          }
        },
        onError: (error: any) => {
          console.error(error)
          toast.error(error.message || 'Registration failed. Please try again.')
        },
      })
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Something went wrong',
      })
    }
  }

  const showPasswordHandler = () => setShowPassword((p) => !p)
  const showConfirmPasswordHandler = () => setShowConfirmPassword((p) => !p)
  const footer = (
    <div className="text-center space-y-3">
      <div className="text-sm text-gray-600">
        Already have an store account?{' '}
        <Link
          to="/vendor/login"
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
  )

  return (
    <AuthFormWrapper
      title={
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6" />
          <span>Store Registration</span>
        </div>
      }
      description="Request access to manage your store on FashionKet"
      backLink="/"
      backText="Back to store"
      footer={footer}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{errors.root.message}</p>
          </div>
        )}

        {/* Store Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-mmp-primary2">Store Information</h3>

          <div className="space-y-2">
            <Label htmlFor="businessName">Store Name *</Label>
            <Input
              id="businessName"
              placeholder="Your Store Name"
              {...register('businessName')}
              disabled={isPending}
            />
            {errors.businessName && (
              <p className="text-sm text-red-600">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Store Description</Label>
            <Textarea
              id="description"
              placeholder="Tell us about your store"
              rows={3}
              {...register('description')}
              disabled={isPending}
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="font-semibold text-mmp-primary2">
            Contact Information
          </h3>

          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register('fullName')}
              className={errors.fullName ? 'border-red-500' : ''}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="store@example.com"
                {...register('email')}
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                {...register('phone')}
                disabled={isPending}
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h3 className="font-semibold text-mmp-primary2">Store Location</h3>

          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              placeholder="123 Store Street"
              {...register('location.street')}
              disabled={isPending}
            />
            {errors.location?.street && (
              <p className="text-sm text-red-600">
                {errors.location.street.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Lagos"
                {...register('location.city')}
                disabled={isPending}
              />
              {errors.location?.city && (
                <p className="text-sm text-red-600">
                  {errors.location.city.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="Lagos"
                {...register('location.state')}
                disabled={isPending}
              />
              {errors.location?.state && (
                <p className="text-sm text-red-600">
                  {errors.location.state.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                {...register('location.country')}
                disabled={isPending}
              />
              {errors.location?.country && (
                <p className="text-sm text-red-600">
                  {errors.location.country.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h3 className="font-semibold text-mmp-primary2">Security</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  disabled={isPending}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={showPasswordHandler}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isPending}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>

              {errors.password && (
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword')}
                  disabled={isPending}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={showConfirmPasswordHandler}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                  disabled={isPending}
                >
                  {showConfirmPassword ? (
                    <Eye size={18} />
                  ) : (
                    <EyeOff size={18} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p className="text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-mmp-primary hover:bg-mmp-primary2"
          disabled={isPending}
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </AuthFormWrapper>
  )
}
