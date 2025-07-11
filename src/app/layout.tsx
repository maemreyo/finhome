import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

const locales = ['en', 'vi'];

export default function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) notFound();

  unstable_setRequestLocale(locale);

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}