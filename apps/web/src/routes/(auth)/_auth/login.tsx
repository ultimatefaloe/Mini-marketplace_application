import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUserLogin } from '@/api/auth.query'
import { useAuth } from '@/hooks'
import { AuthFormWrapper, GoogleAuthButton } from '@/components/auth'
import { Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const Route = createFileRoute('/(auth)/_auth/login')({
  component: LoginPage,
})

function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const { mutate: login, isPending } = useUserLogin()
  const { setAuth } = useAuth()

  console.log(isPending)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
       await login(data, {
        onSuccess: (data) => {
          if (data.user) {
            setAuth(data.user)
          }
          // TanStack Router will handle redirect via beforeLoad
        },
      })
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Login failed. Please try again.',
      })
    }
  }

  const footer = (
    <div className="text-center space-y-2">
      <div className="text-sm text-gray-600">
        Don't have an account?{' '}
        <Link
          to="/signup"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Sign up
        </Link>
      </div>
      <div className="text-sm text-gray-600">
        <Link
          to="/forgot-password"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
      <div className="text-sm text-gray-600">
        Are you an admin?{' '}
        <Link
          to="/admin/login"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Admin Login
        </Link>
      </div>
    </div>
  )

  return (
    <AuthFormWrapper
      title="Welcome back"
      description="Sign in to your account to continue shopping"
      footer={footer}
    >
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              {...register('password')}
              className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-mmp-primary hover:bg-mmp-primary2"
          disabled={isPending}
        >
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <GoogleAuthButton disabled={isPending} />
    </AuthFormWrapper>
  )
}
