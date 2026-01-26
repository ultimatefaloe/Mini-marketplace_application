import React from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useUserGoogleAuth } from '@/api/auth.query';

interface GoogleAuthButtonProps {
  variant?: 'user' | 'admin';
  disabled?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  variant = 'user',
  disabled = false,
}) => {
  const { mutate: googleAuth, isPending } = useUserGoogleAuth();

  const handleGoogleAuth = () => {
    const authUrl = variant === 'admin' 
      ? `${import.meta.env.VITE_API_URL}/auth/admin/google`
      : `${import.meta.env.VITE_API_URL}/auth/user/google`;
    
    window.location.href = authUrl;
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full border-gray-300 hover:bg-gray-50"
      onClick={handleGoogleAuth}
      disabled={disabled || isPending}
    >
      <FcGoogle className="h-5 w-5 mr-2" />
      {isPending ? 'Redirecting...' : `Continue with Google`}
    </Button>
  );
};