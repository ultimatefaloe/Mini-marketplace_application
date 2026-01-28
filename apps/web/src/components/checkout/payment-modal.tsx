import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentUrl: string | null;
  orderId: string | null;
  onPaymentSuccess: () => void;
  onPaymentFailure: (error: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  paymentUrl,
  orderId,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const [paymentStatus, setPaymentStatus] = React.useState<'pending' | 'success' | 'failed'>('pending');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string>('');

  const handleOpenPayment = () => {
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
      startPaymentVerification();
    }
  };

  const startPaymentVerification = () => {
    setIsVerifying(true);
    setPaymentStatus('pending');
    
    // Poll for payment status
    const pollInterval = setInterval(async () => {
      try {
        const reference = localStorage.getItem('payment_reference');
        const storedOrderId = localStorage.getItem('order_id');
        
        if (!reference || !storedOrderId) {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          setErrorMessage('Payment reference not found');
          setIsVerifying(false);
          return;
        }

        const response = await fetch(`/api/payments/verify/${reference}`);
        const data = await response.json();

        if (data.status === 'success') {
          clearInterval(pollInterval);
          setPaymentStatus('success');
          setIsVerifying(false);
          
          // Clear local storage
          localStorage.removeItem('payment_reference');
          localStorage.removeItem('order_id');
          
          // Call success callback
          setTimeout(() => {
            onPaymentSuccess();
            onClose();
          }, 2000);
        } else if (data.status === 'failed') {
          clearInterval(pollInterval);
          setPaymentStatus('failed');
          setErrorMessage(data.message || 'Payment failed');
          setIsVerifying(false);
        }
        // If still pending, continue polling
      } catch (error) {
        console.error('Payment verification error:', error);
      }
    }, 3000); // Poll every 3 seconds

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (paymentStatus === 'pending') {
        setPaymentStatus('failed');
        setErrorMessage('Payment verification timeout');
        setIsVerifying(false);
      }
    }, 300000); // 5 minutes
  };

  const handleRetryPayment = () => {
    setPaymentStatus('pending');
    setErrorMessage('');
    handleOpenPayment();
  };

  const handleCancelPayment = () => {
    setPaymentStatus('failed');
    setErrorMessage('Payment was cancelled');
    onPaymentFailure('Payment was cancelled');
    onClose();
  };

  React.useEffect(() => {
    if (isOpen && paymentUrl) {
      startPaymentVerification();
    }
  }, [isOpen, paymentUrl]);

  const renderContent = () => {
    switch (paymentStatus) {
      case 'success':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your order has been confirmed and is being processed.
            </p>
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Order ID: <span className="font-mono">{orderId?.slice(-8)}</span>
              </div>
              <div className="text-sm text-gray-600">
                A confirmation email has been sent to your registered email address.
              </div>
            </div>
            <Button 
              className="mt-6 bg-green-600 hover:bg-green-700"
              onClick={onClose}
            >
              View Order
            </Button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Failed
            </h3>
            <p className="text-gray-600 mb-4">
              {errorMessage || 'We encountered an issue processing your payment.'}
            </p>
            <div className="space-y-3">
              <Button 
                className="w-full bg-mmp-primary hover:bg-mmp-primary2"
                onClick={handleRetryPayment}
              >
                Retry Payment
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCancelPayment}
              >
                Cancel Payment
              </Button>
            </div>
          </div>
        );

      default: // pending
        return (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-6">
              {isVerifying ? (
                <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              ) : (
                <ExternalLink className="h-10 w-10 text-blue-600" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {isVerifying ? 'Verifying Payment' : 'Complete Payment'}
            </h3>
            <p className="text-gray-600 mb-6">
              {isVerifying 
                ? 'Please wait while we verify your payment...' 
                : 'Click the button below to complete your payment on Paystack.'}
            </p>
            
            {!isVerifying && paymentUrl && (
              <div className="space-y-4">
                <Button 
                  className="w-full bg-mmp-primary hover:bg-mmp-primary2"
                  onClick={handleOpenPayment}
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Complete Payment on Paystack
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleCancelPayment}
                >
                  Cancel Payment
                </Button>
              </div>
            )}

            {isVerifying && (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  This may take a few moments. Please don't close this window.
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-600">Verifying...</span>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Secure Payment
          </DialogTitle>
          <DialogDescription className="text-center">
            Powered by Paystack
          </DialogDescription>
        </DialogHeader>
        
        {renderContent()}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-xs text-gray-500">
            <p>Your payment is secured with 256-bit SSL encryption</p>
            <p className="mt-1">All transactions are protected by Paystack</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};