// src/app/[locale]/dashboard/plans/new/page.tsx
import { getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreatePlanForm } from '@/components/plans/CreatePlanForm'
import { getTranslations } from 'next-intl/server'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function NewPlanPage({ params }: PageProps) {
  const { locale } = await params
  const user = await getUser()
  
  if (!user) {
    redirect(`/${locale}/auth/login`)
  }

  const t = await getTranslations({ locale, namespace: 'NewPlanPage' })

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <CreatePlanForm userId={user.id} />
    </div>
  )
}