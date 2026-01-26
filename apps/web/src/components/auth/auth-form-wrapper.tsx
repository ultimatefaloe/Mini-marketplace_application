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
import { ArrowLeft } from 'lucide-react'

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
    <div className="min-h-screen bg-gradient-to-br from-mmp-neutral to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {backLink && (
          <Button variant="ghost" className="mb-6" asChild>
            <Link to={backLink}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {backText}
            </Link>
          </Button>
        )}

        <Card className="border-mmp-primary/10 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-mmp-primary2">
              {title}
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
