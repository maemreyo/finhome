// Password reset email template

import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'

interface PasswordResetEmailProps {
  resetUrl: string
  userName?: string
}

export function PasswordResetEmail({ resetUrl, userName }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section style={content}>
            <Text style={title}>Reset Your Password</Text>
            
            {userName && <Text style={paragraph}>Hi {userName},</Text>}
            
            <Text style={paragraph}>
              You recently requested to reset your password for your {process.env.NEXT_PUBLIC_APP_NAME} account. 
              Click the button below to reset it:
            </Text>

            <Section style={buttonContainer}>
              <Button style={resetButton} href={resetUrl}>
                Reset Password
              </Button>
            </Section>

            <Text style={paragraph}>
              This link will expire in 1 hour for security reasons.
            </Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              If you didn&apos;t request this password reset, please ignore this email. 
              Your password will remain unchanged.
            </Text>

            <Text style={paragraph}>
              If you&apos;re having trouble clicking the button, copy and paste the URL below into your browser:
            </Text>

            <Text style={urlText}>{resetUrl}</Text>

            <Hr style={hr} />

            <Text style={paragraph}>
              Best regards,<br />
              The {process.env.NEXT_PUBLIC_APP_NAME} Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              © 2024 {process.env.NEXT_PUBLIC_APP_NAME}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const resetButton = {
  backgroundColor: '#dc3545',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
}

const urlText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#525252',
  wordBreak: 'break-all' as const,
  padding: '12px',
  backgroundColor: '#f8f9fa',
  borderRadius: '4px',
  fontFamily: 'monospace',
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