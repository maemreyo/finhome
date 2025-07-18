// src/app/api/plans/share/email/route.ts
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const emailShareSchema = z.object({
  planId: z.string().uuid(),
  recipients: z.array(z.string().email()),
  message: z.string().optional(),
  shareUrl: z.string().url()
})

// POST /api/plans/share/email - Share plan via email
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, recipients, message, shareUrl } = emailShareSchema.parse(body)

    const supabase = await createClient()

    // Verify user owns the plan
    const { data: plan, error: fetchError } = await supabase
      .from('financial_plans')
      .select('user_id, plan_name, description')
      .eq('id', planId)
      .single()

    if (fetchError || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    if (plan.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user profile for sender info
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    // For now, we'll just log the email details
    // In a real implementation, you would integrate with an email service like SendGrid, Resend, etc.
    console.log('Email share request:', {
      from: userProfile?.email || 'unknown',
      fromName: userProfile?.full_name || 'FinHome User',
      to: recipients,
      subject: `${userProfile?.full_name || 'Someone'} shared a financial plan with you`,
      planName: plan.plan_name,
      planDescription: plan.description,
      shareUrl,
      personalMessage: message,
      timestamp: new Date().toISOString()
    })

    // Create a simple email template
    const emailTemplate = `
      <h2>Financial Plan Shared with You</h2>
      <p><strong>${userProfile?.full_name || 'Someone'}</strong> has shared a financial plan with you.</p>
      
      <h3>Plan Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${plan.plan_name}</li>
        <li><strong>Description:</strong> ${plan.description || 'No description provided'}</li>
      </ul>
      
      ${message ? `<h3>Personal Message:</h3><p>${message}</p>` : ''}
      
      <p><a href="${shareUrl}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Plan</a></p>
      
      <p><small>This plan was shared via FinHome - Your Financial Planning Platform</small></p>
    `

    // TODO: Implement actual email sending
    // For now, we'll simulate success
    const emailResults = recipients.map(email => ({
      email,
      status: 'sent',
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }))

    // Log share activity (optional - for analytics)
    // TODO: Add plan_shares table to database schema
    // await supabase
    //   .from('plan_shares')
    //   .insert({
    //     plan_id: planId,
    //     shared_by: user.id,
    //     shared_with: recipients,
    //     share_method: 'email',
    //     share_url: shareUrl,
    //     personal_message: message,
    //     created_at: new Date().toISOString()
    //   })
      // .select()

    return NextResponse.json({ 
      success: true,
      message: 'Email share requests processed',
      results: emailResults
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Unexpected error in POST /api/plans/share/email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}