import React from 'react'
import { Link } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ShoppingBag } from 'lucide-react'

interface AuthFormWrapperProps {
  title: React.ReactNode
  description: string
  children: React.ReactNode
  backLink?: string
  backText?: string
  footer?: React.ReactNode
}

export const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({
  title,
  description,
  children,
  backLink = '/',
  backText = 'Back to home',
  footer,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mmp-accent mid-gray-50  to-mmp-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {backLink && (
          <Button variant="ghost" className="mb-6" asChild>
            <Link to={backLink}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backText}
            </Link>
          </Button>
        )}

        <Card className="border-mmp-primary/10 shadow-lg py-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-mmp-primary2">
              <Link
                to="/"
                className="flex items-center justify-center gap-3 group text-center p-2"
              >
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-mmp-accent to-mmp-secondary rounded-lg blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200" />
                  <div className="relative p-2 bg-mmp-primary2 rounded-lg">
                    <ShoppingBag className="h-6 w-6 text-mmp-secondary" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-mmp-neutral via-mmp-secondary to-mmp-accent bg-clip-text text-transparent">
                    FashionKet
                  </span>
                  <span className="text-xs text-mmp-secondary font-medium hidden md:block">
                    Curated Excellence
                  </span>
                </div>
              </Link>
              <div>{title}</div>
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
            {footer && (
              <div className="mt-6 pt-4 border-t border-gray-200">{footer}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
