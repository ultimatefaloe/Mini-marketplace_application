import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface ErrorStateProps {
  title?: string
  message?: string
  error?: any
  retryText?: string
  onRetry?: () => void
  showHomeButton?: boolean
  fullScreen?: boolean
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred.',
  error,
  retryText = 'Try Again',
  onRetry,
  showHomeButton = true,
  fullScreen = true,
}: ErrorStateProps) {
  const errorMessage = error?.message || message

  const content = (
    <div className="text-center p-8 max-w-md mx-auto">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
        <AlertCircle className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">{title}</h1>
      <p className="text-gray-600 mb-6">{errorMessage}</p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onRetry && (
          <Button
            onClick={onRetry}
            className="bg-mmp-primary hover:bg-mmp-primary2"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            {retryText}
          </Button>
        )}
        
        {showHomeButton && (
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="mr-2 h-5 w-5" />
              Go Home
            </Link>
          </Button>
        )}
      </div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        {content}
      </div>
    )
  }

  return content
}