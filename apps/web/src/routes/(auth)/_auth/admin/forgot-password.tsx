import React from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRequestPasswordReset } from '@/api/auth.query'
import { AuthFormWrapper } from '@/components/auth'
import { CheckCircle, Shield } from 'lucide-react'
import { toast } from 'react-toastify'

const adminForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type AdminForgotPasswordFormData = z.infer<typeof adminForgotPasswordSchema>

export const Route = createFileRoute('/(auth)/_auth/admin/forgot-password')({
  component: AdminForgotPasswordPage,
})

function AdminForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const { mutate: requestReset, isPending } = useRequestPasswordReset('admin')

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<AdminForgotPasswordFormData>({
    resolver: zodResolver(adminForgotPasswordSchema),
  })

  const onSubmit = async (data: AdminForgotPasswordFormData) => {
    try {
      await requestReset(data, {
        onSuccess: () => {
          setIsSubmitted(true)
          toast.success(
            'Reset link sent, Check your email for password reset instructions.',
          )
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to send reset link, Please try again.')
        },
      })
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message:
          error.message || 'Failed to send reset email. Please try again.',
      })
    }
  }

  const footer = (
    <div className="text-center space-y-3">
      <div className="text-sm text-gray-600">
        Remember your password?{' '}
        <Link
          to="/admin/login"
          className="font-medium text-mmp-primary hover:text-mmp-primary2 hover:underline"
        >
          Sign in
        </Link>
      </div>
      <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
        Customer password reset?{' '}
        <Link
          to="/forgot-password"
          className="font-medium text-mmp-secondary hover:text-mmp-accent hover:underline"
        >
          Customer Portal
        </Link>
      </div>
    </div>
  )

  if (isSubmitted) {
    return (
      <AuthFormWrapper
        title={
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            <span>Check Your Email</span>
          </div>
        }
        description="We've sent password reset instructions to your admin email"
        footer={footer}
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-green-50 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
          </div>https://open.spotify.com/album/3y6KnQqXjVz7lK5gi9CuRX
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-900">
              Reset Link Sent
            </h3>
            <p className="text-sm text-gray-600">
              For security reasons, password reset links are only sent to
              verified business email addresses.
            </p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Security Note:</strong> The reset link will expire in 1
                hour. If you don't see it in your inbox, please check your spam
                folder.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              asChild
              className="w-full bg-mmp-primary hover:bg-mmp-primary2"
            >
              <Link to="/admin/login">Return to Business Login</Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSubmitted(false)}
            >
              Resend Reset Link
            </Button>
          </div>
        </div>
      </AuthFormWrapper>
    )
  }

  return (
    <AuthFormWrapper
      title={
        <div className="flex items-center justify-center gap-2">
          <Shield className="h-6 w-6" />
          <span>Reset Admin Password</span>
        </div>
      }
      description="Enter your admin email to receive a password reset link"
      footer={footer}
    >
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-700">
          <strong>Security:</strong> Password reset links are only sent to
          verified admin email addresses.
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
            Admin Email Address
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
          <p className="text-xs text-gray-500 mt-1">
            Must be the email associated with your admin account
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
              Sending Reset Link...
            </>
          ) : (
            'Send Reset Instructions'
          )}
        </Button>
      </form>
    </AuthFormWrapper>
  )
}
