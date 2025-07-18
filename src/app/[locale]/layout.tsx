import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";
import { getTranslations } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Layout.metadata" });

  return {
    title: {
      default: process.env.NEXT_PUBLIC_APP_NAME || t('titleDefault'),
      template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME || t('titleTemplate')}`,
    },
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || t('description'),
    keywords: ['saas', 'template', 'nextjs', 'stripe', 'supabase'],
    authors: [{ name: 'Your Name' }],
    creator: 'Your Name',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: process.env.NEXT_PUBLIC_APP_URL,
      title: process.env.NEXT_PUBLIC_APP_NAME || t('openGraphTitle'),
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || t('openGraphDescription'),
      siteName: process.env.NEXT_PUBLIC_APP_NAME || t('openGraphSiteName'),
    },
    twitter: {
      card: 'summary_large_image',
      title: process.env.NEXT_PUBLIC_APP_NAME || t('twitterTitle'),
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || t('twitterDescription'),
      creator: '@yourusername',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps) {
  const { locale } = await params;
  
  // Validate that the locale is supported
  const supportedLocales = ['en', 'vi'];
  if (!supportedLocales.includes(locale)) {
    notFound();
  }
  
  let messages;
  try {
    messages = (await import(`../../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Vercel Analytics */}
        {process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID && (
          <script
            defer
            src="https://unpkg.com/@vercel/analytics@1/dist/index.js"
            data-mode="auto"
          />
        )}
        
        {/* Plausible Analytics */}
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
            storageKey="finhome-theme"
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}