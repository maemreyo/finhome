"use client";

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PricingSection } from '@/components/pricing/PricingSection'
import { ArrowRight, Check, Star, Zap, Shield, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl';

// Hero Section
function HeroSection() {
  const t = useTranslations('LandingPage.HeroSection');
  const locale = useLocale();
  return (
    <section className="py-24 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            {t('badge')}
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            {t('heading1')}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {" "}{t('heading2')}
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href={`/${locale}/auth/signup`}>
                {t('getStartedButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={`/${locale}/demo`}>
                {t('viewDemoButton')}
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              {t('noCreditCard')}
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              {t('freeTrial')}
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              {t('cancelAnytime')}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const t = useTranslations('LandingPage.FeaturesSection');
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: t('feature1Title'),
      description: t('feature1Description'),
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: t('feature2Title'),
      description: t('feature2Description'),
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: t('feature3Title'),
      description: t('feature3Description'),
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: t('feature4Title'),
      description: t('feature4Description'),
    },
  ]

  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('heading')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// Social Proof Section
function SocialProofSection() {
  const t = useTranslations('LandingPage.SocialProofSection');
  const testimonials = [
    {
      content: t('testimonial1Content'),
      author: t('testimonial1Author'),
      role: t('testimonial1Role'),
      avatar: "SC",
    },
    {
      content: t('testimonial2Content'),
      author: t('testimonial2Author'),
      role: t('testimonial2Role'),
      avatar: "MJ",
    },
    {
      content: t('testimonial3Content'),
      author: t('testimonial3Author'),
      role: t('testimonial3Role'),
      avatar: "ER",
    },
  ]

  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('heading')}
          </h2>
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-muted-foreground">{t('reviews')}</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">&quot;{testimonial.content}&quot;</p>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// CTA Section
function CTASection() {
  const t = useTranslations('LandingPage.CTASection');
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container px-4 mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          {t('heading')}
        </h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          {t('description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link href={`/${locale}/auth/signup`}>
              {t('startButton')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
            <Link href={`/${locale}/contact`}>
              {t('talkToSalesButton')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <SocialProofSection />
      <PricingSection />
      <CTASection />
    </div>
  )
}