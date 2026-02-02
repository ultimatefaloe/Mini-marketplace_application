import React from 'react'
import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShoppingBag,
  Home,
  ArrowLeft,
  Package,
  CreditCard,
  Shield,
  Clock,
  Wallet,
  RefreshCw,
} from 'lucide-react'
import { PaymentStatus } from '@/types'
import { toast } from 'react-toastify'
import { z } from 'zod'
import { formatCurrency } from '@/lib/utils'
import { useOrderQuery } from '@/api/hooks'
import { apiClient } from '@/api/client'

export const Route = createFileRoute(
  '/(root)/_rootLayout/_authenticated/cart/payment-status',
)({
  component: PaymentStatusPage,
  validateSearch: z.object({
    reference: z.string().optional(),
    trxref: z.string().optional(),
    orderId: z.string().optional(),
  }),
})

// Types
interface PaymentVerificationResult {
  status: PaymentStatus
  message?: string
  order?: any
  reference?: string
}

// Constants
const VERIFICATION_TIMEOUT = 5 * 60 * 1000 // 5 minutes in milliseconds
const POLL_INTERVAL = 3000 // 3 seconds
const MAX_POLL_ATTEMPTS = Math.ceil(VERIFICATION_TIMEOUT / POLL_INTERVAL) // ~100 attempts

function PaymentStatusPage() {
  const { reference: urlReference, trxref, orderId: urlOrderId } = Route.useSearch()
  const navigate = useNavigate()
  
  // State
  const [paymentStatus, setPaymentStatus] = React.useState<PaymentStatus>(PaymentStatus.PENDING)
  const [verificationError, setVerificationError] = React.useState<string>('')
  const [isPolling, setIsPolling] = React.useState(false)
  const [pollAttempt, setPollAttempt] = React.useState(0)
  const [verificationStartTime, setVerificationStartTime] = React.useState<number | null>(null)
  const [showManualVerification, setShowManualVerification] = React.useState(false)
  const [manualVerificationLoading, setManualVerificationLoading] = React.useState(false)
  
  // Refs
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const verificationTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  
  // Derived state
  const reference = urlReference || trxref
  const orderId = urlOrderId || localStorage.getItem('last_order_id')
  
  // Fetch order details if we have orderId
  const { data: orderData, isLoading: orderLoading } = useOrderQuery(orderId || '')
  
  // Utility function to clear all timeouts/intervals
  const clearAllTimers = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    if (verificationTimeoutRef.current) {
      clearTimeout(verificationTimeoutRef.current)
      verificationTimeoutRef.current = null
    }
  }
  
  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      clearAllTimers()
    }
  }, [])
  
  // Payment verification function
  const verifyPayment = async (paymentRef: string): Promise<PaymentVerificationResult> => {
    try {
      const response = await apiClient.get<PaymentVerificationResult>(`/payments/verify/${paymentRef}`)
      
      if (!response.success) {
        throw new Error(response.error?.message || 'Failed to verify payment')
      }
      
      return response.data
    } catch (error: any) {
      console.error('Payment verification error:', error)
      throw new Error(error.message || 'Network error while verifying payment')
    }
  }
  
  // Start automatic verification on component mount
  React.useEffect(() => {
    if (!reference) {
      const storedReference = localStorage.getItem('last_payment_reference')
      if (storedReference) {
        startPaymentVerification(storedReference)
      } else {
        toast.error('No payment reference found')
        navigate({ to: '/cart/checkout' })
      }
    } else {
      startPaymentVerification(reference)
    }
  }, [reference])
  
  // Check if verification has timed out
  React.useEffect(() => {
    if (verificationStartTime && isPolling) {
      const elapsedTime = Date.now() - verificationStartTime
      const timeRemaining = VERIFICATION_TIMEOUT - elapsedTime
      
      if (timeRemaining <= 0) {
        handleVerificationTimeout()
      }
    }
  }, [pollAttempt, verificationStartTime, isPolling])
  
  const startPaymentVerification = async (paymentRef: string) => {
    if (!paymentRef) {
      setVerificationError('Payment reference is required')
      setPaymentStatus(PaymentStatus.FAILED)
      return
    }
    
    clearAllTimers()
    
    setVerificationStartTime(Date.now())
    setPaymentStatus(PaymentStatus.PENDING)
    setVerificationError('')
    setIsPolling(true)
    setPollAttempt(0)
    setShowManualVerification(false)
    
    // Set verification timeout (5 minutes)
    verificationTimeoutRef.current = setTimeout(() => {
      handleVerificationTimeout()
    }, VERIFICATION_TIMEOUT)
    
    // Start polling
    let attempts = 0
    pollingIntervalRef.current = setInterval(async () => {
      attempts++
      setPollAttempt(attempts)
      
      console.log(`🔍 Payment verification attempt ${attempts}/${MAX_POLL_ATTEMPTS}`)
      
      try {
        const result = await verifyPayment(paymentRef)
        
        if (result.status === PaymentStatus.SUCCESS) {
          handleVerificationSuccess(result)
          return
        } else if (result.status === PaymentStatus.FAILED) {
          handleVerificationFailure(result.message || 'Payment failed')
          return
        }
        
        // Still pending, continue polling
        if (attempts >= MAX_POLL_ATTEMPTS) {
          handleVerificationTimeout()
        }
      } catch (error: any) {
        console.error('Polling error:', error)
        
        if (attempts >= MAX_POLL_ATTEMPTS) {
          handleVerificationFailure(error.message || 'Verification failed after multiple attempts')
        }
      }
    }, POLL_INTERVAL)
    
    // Immediately make first verification attempt
    try {
      const result = await verifyPayment(paymentRef)
      
      if (result.status === PaymentStatus.SUCCESS) {
        handleVerificationSuccess(result)
        return
      } else if (result.status === PaymentStatus.FAILED) {
        handleVerificationFailure(result.message || 'Payment failed')
        return
      }
    } catch (error: any) {
      console.error('Initial verification error:', error)
      // Continue with polling
    }
  }
  
  const handleVerificationSuccess = (result: PaymentVerificationResult) => {
    clearAllTimers()
    
    setPaymentStatus(PaymentStatus.SUCCESS)
    setIsPolling(false)
    
    // Clear localStorage
    localStorage.removeItem('last_payment_reference')
    localStorage.removeItem('last_order_id')
    
    toast.success(result.message || 'Payment verified successfully!')
    
    // Auto-redirect after 5 seconds
    setTimeout(() => {
      navigate({ to: '/orders' })
    }, 5000)
  }
  
  const handleVerificationFailure = (errorMessage: string) => {
    clearAllTimers()
    
    setPaymentStatus(PaymentStatus.FAILED)
    setVerificationError(errorMessage)
    setIsPolling(false)
    setShowManualVerification(true)
    
    toast.error(errorMessage)
  }
  
  const handleVerificationTimeout = () => {
    clearAllTimers()
    
    setPaymentStatus(PaymentStatus.FAILED)
    setVerificationError('Payment verification timeout. Please verify your payment manually.')
    setIsPolling(false)
    setShowManualVerification(true)
    
    toast.error('Verification timeout after 5 minutes')
  }
  
  const handleManualVerification = async () => {
    if (!reference) return
    
    setManualVerificationLoading(true)
    
    try {
      const result = await verifyPayment(reference)
      
      if (result.status === PaymentStatus.SUCCESS) {
        handleVerificationSuccess(result)
      } else {
        setVerificationError(result.message || 'Payment verification failed')
        toast.error('Payment verification failed. Please check your payment status.')
      }
    } catch (error: any) {
      setVerificationError(error.message || 'Manual verification failed')
      toast.error('Failed to verify payment. Please try again later.')
    } finally {
      setManualVerificationLoading(false)
    }
  }
  
  const handleRetryCheckout = () => {
    // Navigate back to checkout
    navigate({ to: '/cart/checkout' })
  }
  
  const handleViewOrder = () => {
    if (orderId) {
      navigate({
        to: '/orders/$orderId',
        params: { orderId: orderId },
      })
    } else {
      navigate({ to: '/orders' })
    }
  }
  
  const handleContinueShopping = () => {
    navigate({ to: '/products' })
  }
  
  // Calculate remaining time for verification
  const getRemainingTime = () => {
    if (!verificationStartTime) return VERIFICATION_TIMEOUT
    
    const elapsed = Date.now() - verificationStartTime
    const remaining = VERIFICATION_TIMEOUT - elapsed
    
    return Math.max(0, Math.floor(remaining / 1000)) // Return in seconds
  }
  
  const remainingSeconds = getRemainingTime()
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  
  const renderContent = () => {
    switch (paymentStatus) {
      case PaymentStatus.SUCCESS:
        return (
          <>
            {/* Success Animation */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-75" />
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100">
                  <CheckCircle2 className="h-12 w-12 text-green-600 animate-in zoom-in duration-500" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Payment Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Thank you for your order!
              </p>
              <p className="text-gray-500 mb-6">
                We've sent a confirmation email to your registered email address.
              </p>
              
              <div className="flex items-center justify-center gap-2 text-green-600 animate-pulse">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">
                  Redirecting to orders page in 5 seconds...
                </span>
              </div>
            </div>

            {/* Order Details */}
            {orderData && !orderLoading && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Number:</span>
                    <span className="font-medium">
                      {orderData.orderNumber || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium text-mmp-primary2">
                      {formatCurrency(orderData.totalAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">Paystack</span>
                  </div>
                  {reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payment Reference:</span>
                      <span className="font-mono text-sm">
                        {reference.slice(-12)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleViewOrder}
                className="w-full bg-mmp-primary hover:bg-mmp-primary2"
                size="lg"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                View My Orders
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                onClick={handleContinueShopping}
              >
                <Home className="mr-2 h-5 w-5" />
                Continue Shopping
              </Button>
            </div>
          </>
        )

      case PaymentStatus.FAILED:
        return (
          <>
            {/* Error State */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Payment Verification Failed
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {verificationError || "We couldn't verify your payment."}
              </p>
              
              {/* Show manual verification option */}
              {showManualVerification && (
                <div className="mt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                      <div className="text-left">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          Verify Payment Manually
                        </h4>
                        <p className="text-sm text-yellow-800 mb-4">
                          If you've already sent money but verification failed, click the button below to check your payment status manually.
                        </p>
                        
                        <Button
                          onClick={handleManualVerification}
                          disabled={manualVerificationLoading}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          {manualVerificationLoading ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Wallet className="mr-2 h-5 w-5" />
                              I've Sent Money - Verify Now
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Details */}
            {!showManualVerification && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h4 className="font-semibold text-yellow-900 mb-2">
                      What could have happened?
                    </h4>
                    <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
                      <li>Payment was declined by your bank</li>
                      <li>Insufficient funds in your account</li>
                      <li>Payment was cancelled</li>
                      <li>Network or technical issues</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Reference Info */}
            {reference && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Payment Reference:</p>
                <p className="font-mono text-sm">{reference}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRetryCheckout}
                className="w-full bg-mmp-primary hover:bg-mmp-primary2"
                size="lg"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Try Payment Again
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                asChild
              >
                <Link to="/contact">
                  Contact Support
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                size="lg"
                onClick={handleContinueShopping}
              >
                <Home className="mr-2 h-5 w-5" />
                Continue Shopping
              </Button>
            </div>
          </>
        )

      default: // PENDING
        return (
          <>
            {/* Loading State */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping" />
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Verifying Your Payment
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Please wait while we confirm your payment...
              </p>
              <p className="text-gray-500">
                This usually takes 10-30 seconds.
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Verification in progress
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Live
                  </Badge>
                </div>
                
                {/* Time Remaining */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">Time remaining:</span>
                  <span className="font-semibold text-blue-900">
                    {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((VERIFICATION_TIMEOUT - (remainingSeconds * 1000)) / VERIFICATION_TIMEOUT) * 100}%`
                    }}
                  />
                </div>
                
                {/* Polling Info */}
                <div className="flex items-center justify-between text-xs text-blue-600">
                  <span>Polling attempt: {pollAttempt}</span>
                  <span>Interval: {POLL_INTERVAL / 1000}s</span>
                </div>
                
                <p className="text-xs text-blue-600 text-center">
                  Don't close or refresh this page
                </p>
              </div>
            </div>

            {/* Payment Info */}
            {reference && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Payment Reference:</p>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {reference.slice(-12)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4" />
                  <span>Processing via Paystack</span>
                </div>
              </div>
            )}

            {/* Manual Verification Option */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="font-semibold text-yellow-900 mb-2">
                    Taking too long?
                  </h4>
                  <p className="text-sm text-yellow-800 mb-4">
                    Verification will timeout after 5 minutes. If you've already sent money and want to check status immediately:
                  </p>
                  
                  <Button
                    onClick={handleManualVerification}
                    disabled={manualVerificationLoading}
                    variant="outline"
                    className="w-full border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                  >
                    {manualVerificationLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Check Status Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* What's happening */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4">
                What's happening?
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Verifying Transaction
                    </p>
                    <p className="text-sm text-gray-600">
                      Confirming payment details with your bank
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Updating Order Status
                    </p>
                    <p className="text-sm text-gray-600">
                      Preparing your order for processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Status
            </h1>
            <p className="text-gray-600">
              Track your payment and order status in real-time
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
            {/* Status Banner */}
            <div className={`px-6 py-4 ${
              paymentStatus === PaymentStatus.SUCCESS
                ? 'bg-green-50 border-b border-green-200'
                : paymentStatus === PaymentStatus.FAILED
                ? 'bg-red-50 border-b border-red-200'
                : 'bg-blue-50 border-b border-blue-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {paymentStatus === PaymentStatus.SUCCESS ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : paymentStatus === PaymentStatus.FAILED ? (
                    <XCircle className="h-6 w-6 text-red-600" />
                  ) : (
                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                  )}
                  <span className="font-semibold">
                    {paymentStatus === PaymentStatus.SUCCESS
                      ? 'Payment Verified'
                      : paymentStatus === PaymentStatus.FAILED
                      ? 'Payment Failed'
                      : 'Verifying Payment'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      paymentStatus === PaymentStatus.SUCCESS
                        ? 'default'
                        : paymentStatus === PaymentStatus.FAILED
                        ? 'destructive'
                        : 'outline'
                    }
                    className={
                      paymentStatus === PaymentStatus.SUCCESS
                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                        : ''
                    }
                  >
                    {paymentStatus}
                  </Badge>
                  {isPolling && (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Polling...
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8">
              {renderContent()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure Payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Powered by</span>
                  <span className="font-semibold">Paystack</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Fast Processing
              </p>
              <p className="text-xs text-gray-500">
                Orders processed within 24 hours
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Shield className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Secure Payment
              </p>
              <p className="text-xs text-gray-500">256-bit SSL encryption</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <Home className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Easy Returns</p>
              <p className="text-xs text-gray-500">30-day return policy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}