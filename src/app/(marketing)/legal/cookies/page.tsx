// Cookie Policy page

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CookiePolicyPage.metadata' });
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function CookiePolicyPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'CookiePolicyPage' });
  const lastUpdated = 'January 1, 2024' // This could also be translated or fetched dynamically
  const contactEmail = process.env.CONTACT_EMAIL || 'privacy@company.com'

  return (
    <div className="py-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('heading')}</h1>
            <p className="text-lg text-muted-foreground">
              {t('lastUpdated', { date: lastUpdated })}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('whatAreCookiesHeading')}</h2>
              <p>
                {t('whatAreCookiesParagraph')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('howWeUseCookiesHeading')}</h2>
              <p className="mb-4">{t('howWeUseCookiesParagraph')}</p>
              
              <h3 className="text-xl font-semibold mb-3">{t('essentialCookiesHeading')}</h3>
              <p className="mb-4">
                {t('essentialCookiesParagraph')}
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>{t('essentialCookiesList1')}</li>
                <li>{t('essentialCookiesList2')}</li>
                <li>{t('essentialCookiesList3')}</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">{t('analyticsCookiesHeading')}</h3>
              <p className="mb-4">
                {t('analyticsCookiesParagraph')}
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>{t('analyticsCookiesList1')}</li>
                <li>{t('analyticsCookiesList2')}</li>
                <li>{t('analyticsCookiesList3')}</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">{t('preferenceCookiesHeading')}</h3>
              <p className="mb-4">
                {t('preferenceCookiesParagraph')}
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>{t('preferenceCookiesList1')}</li>
                <li>{t('preferenceCookiesList2')}</li>
                <li>{t('preferenceCookiesList3')}</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('managingPreferencesHeading')}</h2>
              <p className="mb-4">
                {t('managingPreferencesParagraph')}
              </p>
              
              <h3 className="text-xl font-semibold mb-3">{t('browserSettingsHeading')}</h3>
              <p className="mb-4">
                {t('browserSettingsParagraph')}
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>{t('browserSettingsList1')}</li>
                <li>{t('browserSettingsList2')}</li>
                <li>{t('browserSettingsList3')}</li>
                <li>{t('browserSettingsList4')}</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">{t('impactOfDisablingHeading')}</h3>
              <p>
                {t('impactOfDisablingParagraph')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('thirdPartyCookiesHeading')}</h2>
              <p className="mb-4">
                {t('thirdPartyCookiesParagraph')}
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>{t('thirdPartyCookiesList1')}</strong></li>
                <li><strong>{t('thirdPartyCookiesList2')}</strong></li>
                <li><strong>{t('thirdPartyCookiesList3')}</strong></li>
              </ul>
              <p>
                {t('thirdPartyCookiesReview')}
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">{t('updatesToPolicyHeading')}</h2>
              <p>
                {t('updatesToPolicyParagraph')}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{t('contactUsHeading')}</h2>
              <p className="mb-4">
                {t('contactUsParagraph')}
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> {contactEmail}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}