import { notFound } from 'next/navigation';

const locales = ['en', 'vi'];

export default function LocaleLayout({
  children,
  params: { locale }
}: LayoutProps) {
  if (!locales.includes(locale as any)) notFound();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}