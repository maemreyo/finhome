// Subscription confirmation email template

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Link,
  Button,
  Hr,
} from '@react-email/components'

interface SubscriptionEmailProps {
  userName: string
  planName: string
  amount: number
  currency?: string
  billingInterval?: string
  nextBillingDate?: string
}

export function SubscriptionEmail({ 
  userName, 
  planName, 
  amount, 
  currency = 'USD',
  billingInterval = 'month',
  nextBillingDate 
}: SubscriptionEmailProps) {
  const formattedAmount = (amount / 100).toFixed(2)

  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={title}>Subscription Confirmed! 🎉</Text>
            
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Thank you for subscribing to the <strong>{planName}</strong> plan. 
              Your subscription is now active and you have access to all premium features.
            </Text>

            {/* Subscription Details */}
            <Section style={detailsBox}>
              <Text style={detailsTitle}>Subscription Details</Text>
              <Text style={detailsText}>
                <strong>Plan:</strong> {planName}
              </Text>
              <Text style={detailsText}>
                <strong>Amount:</strong> ${formattedAmount} {currency.toUpperCase()} / {billingInterval}
              </Text>
              {nextBillingDate && (
                <Text style={detailsText}>
                  <strong>Next billing date:</strong> {nextBillingDate}
                </Text>
              )}
            </Section>

            <Section style={buttonContainer}>
              <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`}>
                Access Dashboard
              </Button>
            </Section>

            <Text style={paragraph}>
              You can manage your subscription anytime from your billing dashboard, 
              including updating payment methods, changing plans, or canceling.
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              If you have any questions about your subscription, don&apos;t hesitate to contact our support team.
            </Text>

            <Text style={paragraph}>
              Best regards,<br />
              The {process.env.NEXT_PUBLIC_APP_NAME} Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2024 {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`} style={link}>
                Manage Subscription
              </Link>
              {' | '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/contact`} style={link}>
                Contact Support
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const detailsBox = {
  backgroundColor: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '6px',
  padding: '24px',
  margin: '24px 0',
}

const detailsTitle = {
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  color: '#1a1a1a',
}

const detailsText = {
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
  color: '#525252',
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
};

const content = {
  border: '1px solid #eaeaea',
  borderRadius: '4px',
  margin: '20px 0',
  padding: '20px',
};

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  color: '#333',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#333',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
};

const button = {
  backgroundColor: '#007bff',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#eaeaea',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#8898aa',
};

const link = {
  color: '#007bff',
  textDecoration: 'underline',
};
