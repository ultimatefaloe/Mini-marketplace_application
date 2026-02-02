import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  fullScreen?: boolean
}

export function LoadingState({ 
  message = 'Loading...', 
  fullScreen = true 
}: LoadingStateProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping" />
        <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      </div>
      <p className="mt-4 text-lg font-medium text-gray-700">{message}</p>
      <p className="text-sm text-gray-500 mt-2">Please wait...</p>
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