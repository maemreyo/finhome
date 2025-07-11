// Resend email configuration and utilities

import { Resend } from 'resend'
import { ReactElement } from 'react'

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY!)

// Email addresses configuration
export const EMAIL_CONFIG = {
  from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
  contact: process.env.CONTACT_EMAIL || 'contact@yourdomain.com',
  support: process.env.SUPPORT_EMAIL || 'support@yourdomain.com',
  noReply: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
} as const

// Email templates interface
export interface EmailTemplate {
  subject: string
  react?: ReactElement
  html?: string
  text?: string
}

// Email sending utility with error handling
export async function sendEmail({
  to,
  subject,
  react,
  html,
  text,
  from = EMAIL_CONFIG.from,
  cc,
  bcc,
  attachments,
}: {
  to: string | string[]
  subject: string
  react?: ReactElement
  html?: string
  text?: string
  from?: string
  cc?: string[]
  bcc?: string[]
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}) {
  try {
    const emailData = {
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      cc,
      bcc,
      attachments,
      ...(react && { react }),
      ...(html && { html }),
      ...(text && { text }),
    }

    const result = await resend.emails.send(emailData)
    
    if (result.error) {
      console.error('Resend email error:', result.error)
      throw new Error(`Failed to send email: ${result.error.message}`)
    }

    console.log('Email sent successfully:', result.data?.id)
    return result.data
  } catch (error) {
    console.error('Email sending failed:', error)
    throw error
  }
}

// Pre-defined email templates
export const EMAIL_TEMPLATES = {
  // Welcome email
  welcome: (userName: string): EmailTemplate => ({
    subject: `Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to ${process.env.NEXT_PUBLIC_APP_NAME}!</h1>
        <p>Hi ${userName},</p>
        <p>Thanks for signing up! We're excited to have you on board.</p>
        <p>You can now access your dashboard and start exploring all the features we have to offer.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br>The ${process.env.NEXT_PUBLIC_APP_NAME} Team</p>
      </div>
    `,
  }),

  // Email verification
  emailVerification: (verificationUrl: string): EmailTemplate => ({
    subject: 'Please verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Verify Your Email Address</h1>
        <p>Please click the button below to verify your email address:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
      </div>
    `,
  }),

  // Password reset
  passwordReset: (resetUrl: string): EmailTemplate => ({
    subject: 'Reset your password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>You recently requested to reset your password. Click the button below to reset it:</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>If the button doesn't work, copy and paste this URL into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  }),

  // Subscription confirmation
  subscriptionConfirmed: (planName: string, amount: number): EmailTemplate => ({
    subject: 'Subscription Confirmed',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Subscription Confirmed!</h1>
        <p>Thank you for subscribing to the ${planName} plan.</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)} / month</p>
        <p>Your subscription is now active and you have access to all premium features.</p>
        <p>You can manage your subscription anytime from your billing dashboard.</p>
        <p>Best regards,<br>The ${process.env.NEXT_PUBLIC_APP_NAME} Team</p>
      </div>
    `,
  }),

  // Payment failed
  paymentFailed: (planName: string): EmailTemplate => ({
    subject: 'Payment Failed - Action Required',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Payment Failed</h1>
        <p>We were unable to process your payment for the ${planName} plan.</p>
        <p>Please update your payment method to continue using our service without interruption.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/billing" style="background-color: #007cba; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Update Payment Method
          </a>
        </p>
        <p>If you have any questions, please contact our support team.</p>
      </div>
    `,
  }),

  // Contact form submission
  contactForm: (name: string, email: string, message: string): EmailTemplate => ({
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>New Contact Form Submission</h1>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 6px; margin: 20px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p>Reply to this message by responding to ${email}</p>
      </div>
    `,
  }),
}

// Convenience functions for common emails
export async function sendWelcomeEmail(to: string, userName: string) {
  const template = EMAIL_TEMPLATES.welcome(userName)
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendEmailVerification(to: string, verificationUrl: string) {
  const template = EMAIL_TEMPLATES.emailVerification(verificationUrl)
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendPasswordReset(to: string, resetUrl: string) {
  const template = EMAIL_TEMPLATES.passwordReset(resetUrl)
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendSubscriptionConfirmation(
  to: string,
  planName: string,
  amount: number
) {
  const template = EMAIL_TEMPLATES.subscriptionConfirmed(planName, amount)
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendPaymentFailedNotification(to: string, planName: string) {
  const template = EMAIL_TEMPLATES.paymentFailed(planName)
  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendContactFormSubmission(
  name: string,
  email: string,
  message: string
) {
  const template = EMAIL_TEMPLATES.contactForm(name, email, message)
  return sendEmail({
    to: EMAIL_CONFIG.contact,
    subject: template.subject,
    html: template.html,
  })
}