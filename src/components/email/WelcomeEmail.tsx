// Welcome email template using React Email

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
  Img,
} from '@react-email/components'

interface WelcomeEmailProps {
  userName: string
  loginUrl?: string
}

export function WelcomeEmail({ 
  userName, 
  loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/login` 
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="32"
              height="32"
              alt={process.env.NEXT_PUBLIC_APP_NAME}
              style={logo}
            />
            <Text style={headerText}>
              {process.env.NEXT_PUBLIC_APP_NAME}
            </Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Text style={title}>Welcome to {process.env.NEXT_PUBLIC_APP_NAME}!</Text>
            
            <Text style={paragraph}>Hi {userName},</Text>
            
            <Text style={paragraph}>
              Thanks for signing up! We're excited to have you on board. 
              You can now access your dashboard and start exploring all the 
              features we have to offer.
            </Text>

            <Section style={buttonContainer}>
              <Button style={button} href={loginUrl}>
                Get Started
              </Button>
            </Section>

            <Text style={paragraph}>
              If you have any questions, feel free to reach out to our support team. 
              We&apos;re here to help!
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              Best regards,<br />
              The {process.env.NEXT_PUBLIC_APP_NAME} Team
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              © 2024 {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
            </Text>
            <Text style={footerText}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/legal/privacy`} style={link}>
                Privacy Policy
              </Link>
              {' | '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/legal/terms`} style={link}>
                Terms of Service
              </Link>
              {' | '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/contact`} style={link}>
                Contact Us
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '32px 24px',
  borderBottom: '1px solid #f0f0f0',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
}

const logo = {
  borderRadius: '6px',
}

const headerText = {
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
  color: '#1a1a1a',
}

const content = {
  padding: '32px 24px',
}

const title = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '0 0 24px',
  color: '#1a1a1a',
}

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
  color: '#525252',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const button = {
  backgroundColor: '#007cba',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
}

const footer = {
  padding: '0 24px',
  borderTop: '1px solid #f0f0f0',
  paddingTop: '24px',
}

const footerText = {
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  color: '#8898aa',
  margin: '8px 0',
}

const link = {
  color: '#007cba',
  textDecoration: 'none',
}