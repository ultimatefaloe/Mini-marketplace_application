import { createFileRoute, useNavigate, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/hooks'
import { Loader2, Package } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useVendorSignup } from '@/api/queries'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/(auth)/_auth/vendor/register')({
  component: VendorSignup,
})

const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters'),
    businessName: z
      .string()
      .min(3, 'Business name must be at least 3 characters'),
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
            toast.success(response.message || 'Welcome back!')
            navigate({ to: '/vendor' })
          }
        },
        onError: (error: any) => {
          console.error(error)
          toast.error(error.message || 'Login failed, Invalid credentials')
        },
      })
    } catch (error: any) {
      setError('root', {
        message: error.message || 'Signup failed. Please try again.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mmp-primary/5 via-mmp-secondary/5 to-mmp-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-mmp-primary flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-mmp-primary2">
            Vendor Registration
          </CardTitle>
          <CardDescription>
            Create your vendor account and start selling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {/* Business Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-mmp-primary2">
                Business Information
              </h3>

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  placeholder="Your Business Name"
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
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell us about your business"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="vendor@example.com"
                    {...register('email')}
                    disabled={isPending}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">
                      {errors.email.message}
                    </p>
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
                    <p className="text-sm text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="font-semibold text-mmp-primary2">
                Business Location
              </h3>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  placeholder="123 Business Street"
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
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    disabled={isPending}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    disabled={isPending}
                  />
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

            <div className="text-center text-sm">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                to="/vendor/login"
                className="text-mmp-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
