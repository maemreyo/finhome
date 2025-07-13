import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'ContactPage.metadata' });
  return {
    title: t('title'),
    description: t('description'),
  }
}