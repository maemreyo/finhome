// Pricing page

import { PricingSection } from '@/components/pricing/PricingSection'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - Choose Your Plan',
  description: 'Simple, transparent pricing that grows with you. Start free and scale as your business grows.',
}

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PricingSection />
      
      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Can I change my plan at any time?
                </h3>
                <p className="text-muted-foreground">
                  Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated 
                  and reflected in your next billing cycle.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  What happens if I cancel?
                </h3>
                <p className="text-muted-foreground">
                  You can cancel your subscription at any time. You&apos;ll continue to have access to 
                  all features until the end of your current billing period.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-muted-foreground">
                  We offer a 30-day money-back guarantee for all paid plans. If you&apos;re not satisfied, 
                  contact us for a full refund.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Is my data secure?
                </h3>
                <p className="text-muted-foreground">
                  Absolutely. We use industry-standard encryption and security measures to protect 
                  your data. We&apos;re SOC 2 Type II compliant and GDPR ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}