import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { PaymentStatus } from '@/types'
import { useVerifyPaymentQuery } from '@/api/hooks'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentReference: string
  orderId: string
  onPaymentSuccess: () => void
  onPaymentFailure: (errorMessage?: string) => void
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentReference,
  orderId,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>(
    PaymentStatus.PENDING,
  )
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [errorMessage, setErrorMessage] = React.useState<string>('')
  const [isPolling, setIsPolling] = React.useState(false)
  const [pollAttempt, setPollAttempt] = React.useState(0)
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  // Clear polling on unmount
  React.useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [])

  // Reset state when modal opens
  React.useEffect(() => {
    console.log('💳 Payment Modal State:', {
      isOpen,
      paymentReference,
      paymentStatus,
      orderId,
      isPolling,
    })

    if (isOpen && paymentReference) {
      console.log('🔓 Modal opened with reference:', paymentReference)
      // Reset to idle state when modal opens
      setPaymentStatus(PaymentStatus.PENDING)
      setErrorMessage('')
      setIsPolling(false)
      setPollAttempt(0)
      
      // Start verification after a short delay
      const timer = setTimeout(() => {
        handleVerifyPayment()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isOpen, paymentReference])

  // Function to verify payment directly (without React Query hook)
  const verifyPayment = (reference: string) => {
    try {
      const response = useVerifyPaymentQuery(reference)
      return response
    } catch (error) {
      console.error('Payment verification error:', error)
      throw error
    }
  }

  const handleVerifyPayment = async () => {
    if (!paymentReference) {
      console.error('❌ Payment verification failed: No payment reference')
      setPaymentStatus(PaymentStatus.FAILED)
      setErrorMessage('Payment reference not found')
      toast.error('Payment reference not found', {
        position: 'top-right',
        autoClose: 3000,
      })
      return
    }

    console.log(
      '🚀 Starting payment verification for reference:',
      paymentReference,
    )
    setPaymentStatus(PaymentStatus.PENDING)
    setErrorMessage('')
    setIsPolling(true)
    setPollAttempt(0)

    // Start polling for verification
    startPaymentPolling()
  }

  const startPaymentPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }

    let pollCount = 0
    const maxPolls = 30 // 30 polls × 2 seconds = 1 minute total

    console.log('🔄 Starting payment polling...')

    pollingIntervalRef.current = setInterval(async () => {
      pollCount++
      setPollAttempt(pollCount)
      console.log(`🔍 Payment verification attempt ${pollCount}/${maxPolls}`)

      try {
        const result = verifyPayment(paymentReference)

        console.log('📊 Verification result:', result)

        if (result?.data?.status === PaymentStatus.SUCCESS) {
          // Payment successful
          console.log('✅ Payment verified successfully!')
          clearPolling()
          handlePaymentSuccess()
        } else if (result?.data?.status === PaymentStatus.FAILED) {
          // Payment failed
          console.error('❌ Payment verification failed')
          clearPolling()
          setPaymentStatus(PaymentStatus.FAILED)
          setErrorMessage(result.error?.message || 'Payment verification failed')
          setIsPolling(false)
        } else if (pollCount >= maxPolls) {
          // Timeout
          console.warn('⏱️ Payment verification timeout reached')
          clearPolling()
          setPaymentStatus(PaymentStatus.FAILED)
          setErrorMessage(
            'Payment verification timeout. Please contact support.',
          )
          setIsPolling(false)
        }
        // Continue polling if still pending
      } catch (error: any) {
        console.error('❌ Payment verification error:', error)

        if (pollCount >= maxPolls) {
          clearPolling()
          setPaymentStatus(PaymentStatus.FAILED)
          setErrorMessage('Unable to verify payment. Please contact support.')
          setIsPolling(false)
        }
      } finally {
        setIsLoading(false)
      }
    }, 2000) // Poll every 2 seconds
  }

  const clearPolling = () => {
    if (pollingIntervalRef.current) {
      console.log('🛑 Clearing payment polling interval')
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
  }

  const handlePaymentSuccess = () => {
    setIsPolling(false)

    // Animate from verifying to success
    setTimeout(() => {
      setPaymentStatus(PaymentStatus.SUCCESS)

      toast.success('Payment verified successfully!', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      // Call success callback after animation
      setTimeout(() => {
        onPaymentSuccess()
      }, 2000)
    }, 500)
  }

  const handleRetry = () => {
    console.log('🔄 Retrying payment verification')
    setPaymentStatus(PaymentStatus.PENDING)
    setErrorMessage('')
    setPollAttempt(0)

    // Clear localStorage and try again
    localStorage.removeItem('payment_reference')
    localStorage.removeItem('order_id')
    sessionStorage.removeItem('payment_reference')
    sessionStorage.removeItem('order_id')

    // Close modal and redirect back to checkout
    onPaymentFailure('Please try the payment again')
    onClose()
  }

  const handleOpenPaymentPage = () => {
    if (paymentReference) {
      // In production, this would be the Paystack payment page URL
      // For now, we'll simulate by showing a message
      toast.info('Opening payment page...', {
        position: 'top-center',
        autoClose: 2000,
      })

      // In a real implementation, you would redirect to Paystack
      // window.location.href = `https://paystack.com/pay/${paymentReference}`
    }
  }

  const handleCancel = () => {
    console.log('🚫 Cancelling payment verification')
    clearPolling()
    onPaymentFailure('Payment verification cancelled')
    onClose()
  }

  const renderContent = () => {
    switch (paymentStatus) {
      case PaymentStatus.SUCCESS:
        return (
          <div className="text-center py-6">
            <div className="relative inline-flex items-center justify-center mb-6">
              {/* Animated success circle */}
              <div className="absolute inset-0 rounded-full bg-green-100 animate-ping" />
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                <CheckCircle2 className="h-10 w-10 text-green-600 animate-in zoom-in duration-300" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3 animate-in slide-in-from-bottom duration-300">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-6 animate-in slide-in-from-bottom duration-300 delay-75">
              Your order has been confirmed and is being processed.
            </p>

            <div className="space-y-3 animate-in slide-in-from-bottom duration-300 delay-150 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-sm text-gray-700">
                  <div className="font-semibold mb-1">Order Details:</div>
                  <div className="font-mono text-xs">
                    Reference: {paymentReference?.slice(-12)}
                  </div>
                  {orderId && (
                    <div className="font-mono text-xs mt-1">
                      Order ID: {orderId.slice(-8)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-600 animate-pulse">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Redirecting to your orders...</span>
            </div>
          </div>
        )

      case PaymentStatus.FAILED:
        return (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Payment Verification Failed
            </h3>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'We could not verify your payment.'}
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-left text-yellow-800">
                  <p className="font-semibold mb-1">What should I do?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Check if the payment was deducted from your account</li>
                    <li>Try verifying the payment again</li>
                    <li>Contact support if the issue persists</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-mmp-primary hover:bg-mmp-primary2"
                onClick={handleRetry}
                size="lg"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCancel}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        )

      case PaymentStatus.PENDING:
        return (
          <div className="text-center py-6">
            <div className="relative inline-flex items-center justify-center mb-6">
              {/* Animated loader circle */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 animate-spin" />
              <div className="relative inline-flex items-center justify-center w-20 h-20">
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Verifying Payment
            </h3>
            <p className="text-gray-600 mb-6">
              Please wait while we confirm your payment...
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-center justify-between">
                  <span>Verification attempt:</span>
                  <span className="font-semibold">{pollAttempt}</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(pollAttempt / 30) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  This may take a few moments. Please don't close this window.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancel}
              disabled={isPolling}
              size="lg"
            >
              Cancel Verification
            </Button>
          </div>
        )

      default: // idle
        return (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
              <CheckCircle2 className="h-10 w-10 text-blue-600" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Complete Your Payment
            </h3>
            <p className="text-gray-600 mb-6">
              Please complete your payment on the Paystack page, then verify it
              here.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800 space-y-2">
                <p className="font-semibold">Payment Instructions:</p>
                <ol className="list-decimal list-inside text-left space-y-2">
                  <li>Complete payment on the Paystack payment page</li>
                  <li>Return to this page after successful payment</li>
                  <li>Verification will start automatically</li>
                  <li>If verification doesn't start, click the button below</li>
                </ol>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-mmp-primary hover:bg-mmp-primary2"
                size="lg"
                onClick={handleVerifyPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Starting Verification...
                  </>
                ) : (
                  'Verify Payment Now'
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleOpenPaymentPage}
                size="lg"
              >
                <ExternalLink className="mr-2 h-5 w-5" />
                Open Payment Page
              </Button>
              <Button
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-900"
                onClick={handleCancel}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        )
    }
  }


  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        console.log('🔄 Dialog onOpenChange:', open)
        // Only allow closing when not verifying
        if (
          !open &&
          paymentStatus !== PaymentStatus.PENDING &&
          paymentStatus !== PaymentStatus.SUCCESS
        ) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          // Prevent closing while verifying or on success
          if (
            paymentStatus === PaymentStatus.PENDING ||
            paymentStatus === PaymentStatus.SUCCESS
          ) {
            e.preventDefault()
          }
        }}
        onEscapeKeyDown={(e) => {
          // Prevent closing with Escape while verifying or on success
          if (
            paymentStatus === PaymentStatus.PENDING ||
            paymentStatus === PaymentStatus.SUCCESS
          ) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {paymentStatus === PaymentStatus.SUCCESS
              ? 'Payment Successful!'
              : paymentStatus === PaymentStatus.FAILED
                ? 'Payment Verification Failed'
                : paymentStatus === PaymentStatus.PENDING
                  ? 'Verifying Payment'
                  : 'Complete Payment'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {paymentStatus === PaymentStatus.PENDING
              ? 'Processing your payment...'
              : 'Powered by Paystack'}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}

        <DialogFooter className="mt-6 pt-6 border-t border-gray-200">
          <div className="w-full text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p>Your payment is secured with 256-bit SSL encryption</p>
              <p>All transactions are protected by Paystack</p>
              {paymentReference && (
                <p className="mt-2 font-mono text-xs">
                  Ref: {paymentReference.slice(-12)}
                </p>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}