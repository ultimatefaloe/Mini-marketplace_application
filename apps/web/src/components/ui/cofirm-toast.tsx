import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

type ConfirmToastProps = {
  message: string
  onConfirm: () => void
  confirmText?: string
  cancelText?: string
}

export function ConfirmToast({
  message,
  onConfirm,
  confirmText = 'Yes',
  cancelText = 'Cancel',
}: ConfirmToastProps) {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-800">{message}</p>

      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => toast.dismiss()}
        >
          {cancelText}
        </Button>

        <Button
          size="sm"
          variant="destructive"
          disabled={loading}
          onClick={() => {
            try {
              setLoading(true)
              onConfirm()
              toast.dismiss()
              toast.success('Action completed successfully')
            } catch (err) {
              toast.error(
                err instanceof Error ? err.message : 'Something went wrong',
              )
            } finally {
              setLoading(false)
            }
          }}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </div>
    </div>
  )
}
