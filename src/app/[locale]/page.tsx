// Main landing page

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PricingSection } from '@/components/pricing/PricingSection'
import { ArrowRight, Check, Star, Zap, Shield, Users, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Hero Section
function HeroSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            🚀 New: Advanced Analytics Dashboard
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Build Your SaaS
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {" "}Faster Than Ever
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The complete SaaS template with authentication, billing, analytics, and more. 
            Launch your next big idea in days, not months.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/auth/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/demo">
                View Demo
              </Link>
            </Button>
          </div>
          
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Free 14-day trial
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: 'Lightning Fast',
      description: 'Built with Next.js 15 and optimized for performance. Your users will love the speed.',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Secure by Default',
      description: 'Authentication, authorization, and data protection built-in with industry best practices.',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Team Collaboration',
      description: 'Built-in team management, permissions, and collaboration tools for growing businesses.',
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Advanced Analytics',
      description: 'Comprehensive analytics and reporting to understand your users and grow your business.',
    },
  ]

  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you build, launch, and scale your SaaS business.
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
  const testimonials = [
    {
      content: "This template saved us months of development time. We were able to launch our SaaS in just 2 weeks!",
      author: "Sarah Chen",
      role: "CEO, TechStart",
      avatar: "SC",
    },
    {
      content: "The code quality is exceptional and the documentation is crystal clear. Highly recommended!",
      author: "Mike Johnson",
      role: "CTO, InnovateCorp",
      avatar: "MJ",
    },
    {
      content: "Finally, a SaaS template that includes everything we need. The billing integration works flawlessly.",
      author: "Emily Rodriguez",
      role: "Founder, StartupXYZ",
      avatar: "ER",
    },
  ]

  return (
    <section className="py-24 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Builders Worldwide
          </h2>
          <div className="flex items-center justify-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-muted-foreground">4.9/5 from 1,200+ reviews</span>
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
                <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
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
  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container px-4 mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Launch Your SaaS?
        </h2>
        <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
          Join thousands of entrepreneurs who have already built successful businesses with our template.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/auth/signup">
              Start Building Today
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
            <Link href="/contact">
              Talk to Sales
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