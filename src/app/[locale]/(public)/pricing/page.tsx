// src/app/[locale]/pricing/page.tsx
// Pricing page with i18n support

import { PricingSection } from '@/components/pricing/PricingSection'
import { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PricingPage.metadata' })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'PricingPage' })

  return (
    <div className="min-h-screen">
      <PricingSection />
      
      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              {t('faq.title')}
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {t('faq.questions.changePlan.question')}
                </h3>
                <p className="text-muted-foreground">
                  {t('faq.questions.changePlan.answer')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {t('faq.questions.freeTrial.question')}
                </h3>
                <p className="text-muted-foreground">
                  {t('faq.questions.freeTrial.answer')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {t('faq.questions.cancel.question')}
                </h3>
                <p className="text-muted-foreground">
                  {t('faq.questions.cancel.answer')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  {t('faq.questions.support.question')}
                </h3>
                <p className="text-muted-foreground">
                  {t('faq.questions.support.answer')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}