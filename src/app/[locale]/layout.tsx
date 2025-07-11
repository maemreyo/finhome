// Updated root layout with analytics and error boundary

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { ErrorBoundary } from "@/components/monitoring/ErrorBoundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Template',
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Template'}`,
  },
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'The complete SaaS template for indie hackers',
  keywords: ['saas', 'template', 'nextjs', 'stripe', 'supabase'],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    siteName: process.env.NEXT_PUBLIC_APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: process.env.NEXT_PUBLIC_APP_NAME,
    description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    creator: '@yourusername',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AnalyticsProvider>
              {children}
            </AnalyticsProvider>
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}