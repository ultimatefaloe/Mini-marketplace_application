import { createFileRoute, useNavigate, Navigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useVendorLogin } from '@/api/queries'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/(auth)/_auth/vendor/login')({
  component: VendorLogin,
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

function VendorLogin() {
  const { isAuthenticated, isVendor, setAuthVendor } = useAuth()
  const navigate = useNavigate()
  const { mutateAsync: login, isPending } = useVendorLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  if (isAuthenticated && isVendor) {
    return <Navigate to="/vendor" />
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      login(data, {
        onSuccess: (response) => {
          console.log(response)
          if (response.success) {
            setAuthVendor(response.data)
            toast.success(response.message || 'Login Successfully!')
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
        message: error.message || 'Login failed. Please try again.',
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mmp-primary/5 via-mmp-secondary/5 to-mmp-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-mmp-primary flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-mmp-primary2">
            Vendor Login
          </CardTitle>
          <CardDescription>
            Sign in to your vendor account to manage your store
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errors.root && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vendor@example.com"
                {...register('email')}
                disabled={isPending}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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

            <Button
              type="submit"
              className="w-full bg-mmp-primary hover:bg-mmp-primary2"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account? </span>
              <Link
                to="/vendor/register"
                className="text-mmp-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
