// Sign up form component

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations, useLocale } from 'next-intl'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { useAuthActions } from '@/hooks/useAuth'
import { Loader2, Mail, Lock, User, Github } from 'lucide-react'

export function SignUpForm() {
  const t = useTranslations('Auth.SignUpForm');
  const locale = useLocale();

  const signUpSchema = z.object({
    fullName: z.string().min(2, t('form.fullNameMinLength')),
    email: z.string().email(t('form.emailInvalid')),
    password: z.string().min(8, t('form.passwordMinLength')),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: t('form.acceptTermsRequired'),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('form.passwordMismatch'),
    path: ["confirmPassword"],
  })
  
  type SignUpForm = z.infer<typeof signUpSchema>
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { signUp, signInWithProvider } = useAuthActions()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
  })

  const acceptTerms = watch('acceptTerms')

  const onSubmit = async (data: SignUpForm) => {
    setIsLoading(true)
    setError(null)

    const { error } = await signUp(data.email, data.password, {
      fullName: data.fullName,
    })
    
    if (error) {
      setError(error.message)
    }
    
    setIsLoading(false)
  }

  const handleProviderSignIn = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)
    
    const { error } = await signInWithProvider(provider)
    
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">{t('title')}</CardTitle>
        <CardDescription className="text-center">
          {t('description')}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={() => handleProviderSignIn('google')}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>
          
          <Button
            variant="outline"
            onClick={() => handleProviderSignIn('github')}
            disabled={isLoading}
          >
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              {t('orContinueWith')}
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t('form.fullNameLabel')}</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fullName"
                type="text"
                placeholder={t('form.fullNamePlaceholder')}
                className="pl-9"
                {...register('fullName')}
              />
            </div>
            {errors.fullName && (
              <p className="text-sm text-destructive">{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t('form.emailLabel')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={t('form.emailPlaceholder')}
                className="pl-9"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t('form.passwordLabel')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder={t('form.passwordPlaceholder')}
                className="pl-9"
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t('form.confirmPasswordLabel')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder={t('form.confirmPasswordPlaceholder')}
                className="pl-9"
                {...register('confirmPassword')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setValue('acceptTerms', checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {t('form.agreeTo')}{' '}
              <Link href={`/${locale}/legal/terms`} className="text-primary hover:underline">
                {t('form.termsOfService')}
              </Link>{' '}
              {t('form.and')}{' '}
              <Link href={`/${locale}/legal/privacy`} className="text-primary hover:underline">
                {t('form.privacyPolicy')}
              </Link>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isSubmitting}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('form.createAccount')}
          </Button>
        </form>
      </CardContent>

      <CardFooter>
        <p className="text-center text-sm text-muted-foreground w-full">
          {t('alreadyHaveAccount')}{' '}
          <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
            {t('signIn')}
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}