import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Target, Award, Heart } from 'lucide-react'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AboutPage.metadata' });
  return {
    title: t('title'),
    description: t('description'),
  }
}

async function StatsSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'AboutPage.StatsSection' });
  const stats = [
    { label: t('happyCustomers'), value: '10,000+' },
    { label: t('productsLaunched'), value: '500+' },
    { label: t('countriesReached'), value: '50+' },
    { label: t('teamMembers'), value: '25+' },
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

async function ValuesSection({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'AboutPage.ValuesSection' });
  const values = [
    {
      icon: <Users className="h-8 w-8" />,
      title: t('customerFirstTitle'),
      description: t('customerFirstDescription'),
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: t('focusOnQualityTitle'),
      description: t('focusOnQualityDescription'),
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: t('continuousInnovationTitle'),
      description: t('continuousInnovationDescription'),
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('openTransparentTitle'),
      description: t('openTransparentDescription'),
    },
  ]

  return (
    <section className="py-24">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('heading')}</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
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

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  const tHero = await getTranslations({ locale, namespace: 'AboutPage.HeroSection' });
  const tStory = await getTranslations({ locale, namespace: 'AboutPage.StorySection' });
  const tCTA = await getTranslations({ locale, namespace: 'AboutPage.CTASection' });

  return (
    <div>
      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              {tHero('heading1')}
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                {" "}{tHero('heading2')}
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {tHero('description')}
            </p>
          </div>
        </div>
      </section>

      <StatsSection locale={locale} />

      {/* Story Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">{tStory('heading')}</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    {tStory('paragraph1')}
                  </p>
                  <p>
                    {tStory('paragraph2')}
                  </p>
                  <p>
                    {tStory('paragraph3')}
                  </p>
                </div>
              </div>
              <div className="bg-muted/20 rounded-lg aspect-square flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🚀</div>
                  <p className="text-muted-foreground">{tStory('journeyBegins')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ValuesSection locale={locale} />

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {tCTA('heading')}
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            {tCTA('description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signup">{tCTA('startButton')}</Link>
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <Link href="/contact">{tCTA('getInTouchButton')}</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}