// Marketing website footer

import Link from 'next/link'
import { useTranslations } from 'next-intl';

export function MarketingFooter() {
  const t = useTranslations('Marketing.Footer');

  const footerNavigation = {
    product: [
      { name: t('features'), href: '#features' },
      { name: t('pricing'), href: '/pricing' },
      { name: t('security'), href: '/security' },
      { name: t('roadmap'), href: '/roadmap' },
    ],
    company: [
      { name: t('about'), href: '/about' },
      { name: t('blog'), href: '/blog' },
      { name: t('careers'), href: '/careers' },
      { name: t('contact'), href: '/contact' },
    ],
    support: [
      { name: t('helpCenter'), href: '/help' },
      { name: t('community'), href: '/community' },
      { name: t('apiDocs'), href: '/docs' },
      { name: t('status'), href: '/status' },
    ],
    legal: [
      { name: t('privacy'), href: '/legal/privacy' },
      { name: t('terms'), href: '/legal/terms' },
      { name: t('cookies'), href: '/legal/cookies' },
      { name: t('gdpr'), href: '/legal/gdpr' },
    ],
  }

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="grid grid-cols-2 gap-8 xl:col-span-2 xl:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold leading-6">{t('product')}</h3>
            <ul className="mt-6 space-y-4">
              {footerNavigation.product.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6">{t('company')}</h3>
            <ul className="mt-6 space-y-4">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6">{t('support')}</h3>
            <ul className="mt-6 space-y-4">
              {footerNavigation.support.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold leading-6">{t('legal')}</h3>
            <ul className="mt-6 space-y-4">
              {footerNavigation.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm leading-6 text-muted-foreground hover:text-foreground">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 md:mt-0">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {process.env.NEXT_PUBLIC_APP_NAME?.[0] || 'S'}
              </span>
            </div>
            <span className="font-bold text-xl">
              {process.env.NEXT_PUBLIC_APP_NAME || 'SaaS'}
            </span>
          </div>
          <p className="mt-4 text-xs leading-5 text-muted-foreground">
            {t('copyright', { appName: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Template' })}
          </p>
        </div>
      </div>
    </footer>
  )
}