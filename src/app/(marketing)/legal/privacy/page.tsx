// Privacy Policy page

export const metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'January 1, 2024'
  const companyName = process.env.NEXT_PUBLIC_APP_NAME || 'SaaS Company'
  const contactEmail = process.env.CONTACT_EMAIL || 'privacy@company.com'
  const websiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourcompany.com'

  return (
    <div className="py-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Introduction</h2>
              <p className="mb-4">
                {companyName} ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you visit our website {websiteUrl} and use our services.
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with the terms 
                of this Privacy Policy, please do not access our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
              <p className="mb-4">
                We may collect personally identifiable information that you provide to us, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Name and contact information (email address, phone number)</li>
                <li>Account credentials (username, password)</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Profile information (company name, job title, profile picture)</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Usage Data</h3>
              <p className="mb-4">
                We automatically collect certain information when you use our services:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage patterns (pages visited, features used, time spent)</li>
                <li>Log data (access times, error logs, performance metrics)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative information and updates</li>
                <li>Respond to customer service requests and support needs</li>
                <li>Personalize your experience and deliver targeted content</li>
                <li>Monitor and analyze usage patterns and trends</li>
                <li>Detect, prevent, and address fraud and security issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
              <p className="mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third 
                parties without your consent, except in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Service Providers</h3>
              <p className="mb-4">
                We may share your information with trusted third-party service providers who 
                assist us in operating our website and services, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Payment processors (Stripe)</li>
                <li>Email service providers (Resend)</li>
                <li>Analytics providers (Vercel Analytics)</li>
                <li>Cloud infrastructure providers (Supabase, Vercel)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information if required to do so by law or if we believe 
                that such disclosure is necessary to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Protect the rights, property, or safety of our users</li>
                <li>Prevent fraud or other illegal activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational security measures to protect 
                your personal information against unauthorized access, alteration, disclosure, or 
                destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Employee training on data protection practices</li>
              </ul>
              <p>
                However, no method of transmission over the internet or electronic storage is 
                100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Your Rights and Choices</h2>
              <p className="mb-4">You have the following rights regarding your personal information:</p>
              
              <h3 className="text-xl font-semibold mb-3">Access and Portability</h3>
              <p className="mb-4">
                You can access and download your personal data through your account settings.
              </p>

              <h3 className="text-xl font-semibold mb-3">Correction</h3>
              <p className="mb-4">
                You can update your personal information through your account settings or by 
                contacting us.
              </p>

              <h3 className="text-xl font-semibold mb-3">Deletion</h3>
              <p className="mb-4">
                You can delete your account and personal data by contacting us. Some information 
                may be retained for legal or business purposes.
              </p>

              <h3 className="text-xl font-semibold mb-3">Marketing Communications</h3>
              <p className="mb-4">
                You can opt out of marketing communications by using the unsubscribe link in 
                emails or updating your preferences in your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to enhance your experience. 
                You can control cookie settings through your browser preferences, but disabling 
                cookies may affect the functionality of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your 
                country of residence. We ensure appropriate safeguards are in place to protect 
                your data in accordance with applicable laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Children&apos;s Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 13. We do not 
                knowingly collect personal information from children under 13. If we become 
                aware that we have collected such information, we will take steps to delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any 
                changes by posting the new Privacy Policy on this page and updating the "Last 
                updated" date. Your continued use of our services after any changes constitutes 
                acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our data practices, 
                please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> {contactEmail}</p>
                <p><strong>Website:</strong> {websiteUrl}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}