// About page

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, Award, Heart } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'About Us',
  description: 'Learn about our mission to help entrepreneurs build amazing SaaS products.',
}

function StatsSection() {
  const stats = [
    { label: 'Happy Customers', value: '10,000+' },
    { label: 'Products Launched', value: '500+' },
    { label: 'Countries Reached', value: '50+' },
    { label: 'Team Members', value: '25+' },
  ]

  return (
    <section className="py-16 bg-muted/20">
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Customer First',
      description: 'Everything we do is designed to help our customers succeed and grow their businesses.',
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: 'Focus on Quality',
      description: 'We believe in building products that are reliable, secure, and performant from day one.',
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Continuous Innovation',
      description: 'We constantly push the boundaries of what\'s possible to deliver cutting-edge solutions.',
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: 'Open & Transparent',
      description: 'We build in the open, share our learnings, and believe in honest communication.',
    },
  ]

  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The principles that guide everything we do and help us serve our customers better.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  {value.icon}
                </div>
                <CardTitle className="text-xl">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{value.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Building the Future of
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {" "}SaaS Development
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              We're on a mission to democratize SaaS development by providing entrepreneurs 
              and developers with the tools they need to build world-class products.
            </p>
          </div>
        </div>
      </section>

      <StatsSection />

      {/* Story Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Founded in 2023, we started with a simple observation: building a SaaS product 
                    shouldn't require months of boilerplate code and infrastructure setup.
                  </p>
                  <p>
                    After launching multiple successful SaaS products ourselves, we noticed we were 
                    rebuilding the same components over and over again - authentication, billing, 
                    user management, and analytics.
                  </p>
                  <p>
                    That's when we decided to create the ultimate SaaS template that would allow 
                    entrepreneurs to focus on what matters most: building amazing products that 
                    solve real problems.
                  </p>
                </div>
              </div>
              <div className="bg-muted/20 rounded-lg aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-muted-foreground">Our journey begins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ValuesSection />

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join Our Mission?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Whether you're building your first SaaS or your tenth, we're here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">Start Building Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}