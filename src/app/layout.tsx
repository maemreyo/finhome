import { notFound } from 'next/navigation';

const locales = ['en', 'vi'];

export default async function LocaleLayout({
  children,
  params
}: LayoutProps) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) notFound();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}