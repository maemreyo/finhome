// Marketing website footer

import Link from 'next/link'

export function MarketingFooter() {
  const footerNavigation = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Security', href: '/security' },
      { name: 'Roadmap', href: '/roadmap' },
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Community', href: '/community' },
      { name: 'API Docs', href: '/docs' },
      { name: 'Status', href: '/status' },
    ],
    legal: [
      { name: 'Privacy', href: '/legal/privacy' },
      { name: 'Terms', href: '/legal/terms' },
      { name: 'Cookies', href: '/legal/cookies' },
      { name: 'GDPR', href: '/legal/gdpr' },
    ],
  }

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        <div className="grid grid-cols-2 gap-8 xl:col-span-2 xl:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold leading-6">Product</h3>
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
            <h3 className="text-sm font-semibold leading-6">Company</h3>
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
            <h3 className="text-sm font-semibold leading-6">Support</h3>
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
            <h3 className="text-sm font-semibold leading-6">Legal</h3>
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
            &copy; 2024 {process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Template'}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}