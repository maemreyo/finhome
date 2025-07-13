// Contact page with form

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Mail, Phone, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('ContactPage');
  const tForm = useTranslations('ContactPage.Form');
  const tContactInfo = useTranslations('ContactPage.ContactInfo');

  const contactSchema = z.object({
    name: z.string().min(2, tForm('nameMinLength')),
    email: z.string().email(tForm('emailInvalid')),
    subject: z.string().min(5, tForm('subjectMinLength')),
    message: z.string().min(10, tForm('messageMinLength')),
  })
  
  type ContactForm = z.infer<typeof contactSchema>

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSubmitted(true)
        reset()
        toast.success(tForm('successMessage'))
      } else {
        throw new Error('Failed to send message')
      }
    } catch {
      toast.error(tForm('failedToSend'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: tContactInfo('emailTitle'),
      details: 'hello@yoursaas.com',
      description: tContactInfo('emailDescription'),
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: tContactInfo('phoneTitle'),
      details: '+1 (555) 123-4567',
      description: tContactInfo('phoneDescription'),
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: tContactInfo('officeTitle'),
      details: 'San Francisco, CA',
      description: tContactInfo('officeDescription'),
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: tContactInfo('supportTitle'),
      details: '24/7 Online',
      description: tContactInfo('supportDescription'),
    },
  ]

  return (
    <div className="py-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('HeroSection.heading')}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('HeroSection.description')}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>{tForm('cardTitle')}</CardTitle>
                <CardDescription>
                  {tForm('cardDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isSubmitted && (
                  <Alert className="mb-6">
                    <AlertDescription>
                      {tForm('successMessage')}
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{tForm('nameLabel')}</Label>
                      <Input
                        id="name"
                        placeholder={tForm('namePlaceholder')}
                        {...register('name')}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">{tForm('emailLabel')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={tForm('emailPlaceholder')}
                        {...register('email')}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">{tForm('subjectLabel')}</Label>
                    <Input
                      id="subject"
                      placeholder={tForm('subjectPlaceholder')}
                      {...register('subject')}
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">{tForm('messageLabel')}</Label>
                    <Textarea
                      id="message"
                      placeholder={tForm('messagePlaceholder')}
                      rows={5}
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? tForm('sending') : tForm('sendMessage')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">{tContactInfo('heading')}</h2>
                <p className="text-muted-foreground mb-8">
                  {tContactInfo('description')}
                </p>
              </div>

              <div className="grid gap-6">
                {contactInfo.map((info, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {info.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{info.title}</h3>
                          <p className="text-primary font-medium mb-1">{info.details}</p>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">{tContactInfo('needHelpHeading')}</h3>
                  <p className="text-sm opacity-90 mb-4">
                    {tContactInfo('needHelpDescription')}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href="/docs">{tContactInfo('viewDocs')}</Link>
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                      <Link href="/community">{tContactInfo('joinCommunity')}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}