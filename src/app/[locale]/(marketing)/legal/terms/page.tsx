// Terms of Service page

export const metadata = {
  title: 'Terms of Service',
  description: 'Terms and conditions for using our services.',
}

export default function TermsOfServicePage() {
  const lastUpdated = 'January 1, 2024'
  const companyName = process.env.NEXT_PUBLIC_APP_NAME || 'FinHome'
  const contactEmail = process.env.CONTACT_EMAIL || 'legal@company.com'
  const websiteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourcompany.com'

  return (
    <div className="py-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Agreement to Terms</h2>
              <p className="mb-4">
                These Terms of Service (&quot;Terms&quot;) govern your use of {companyName}&apos;s website 
                located at {websiteUrl} and our services (collectively, the &quot;Service&quot;) 
                operated by {companyName} (&quot;us,&quot; &quot;we,&quot; or &quot;our&quot;).
              </p>
              <p>
                By accessing or using our Service, you agree to be bound by these Terms. 
                If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Description of Service</h2>
              <p className="mb-4">
                {companyName} provides a software-as-a-service platform that enables users to 
                [describe your main service functionality]. Our Service includes access to our 
                web application, mobile applications, and related services.
              </p>
              <p>
                We reserve the right to modify, suspend, or discontinue any part of our Service 
                at any time with or without notice.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
              
              <h3 className="text-xl font-semibold mb-3">Registration</h3>
              <p className="mb-4">
                To access certain features of our Service, you must create an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Account Termination</h3>
              <p>
                We may terminate or suspend your account at any time for violations of these 
                Terms or for any other reason at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Acceptable Use</h2>
              <p className="mb-4">You agree not to use our Service to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful, offensive, or inappropriate content</li>
                <li>Interfere with or disrupt our Service or servers</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use our Service for any fraudulent or illegal activities</li>
                <li>Spam, harass, or abuse other users</li>
                <li>Reverse engineer or attempt to extract source code</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Payment and Billing</h2>
              
              <h3 className="text-xl font-semibold mb-3">Subscription Plans</h3>
              <p className="mb-4">
                Our Service offers various subscription plans with different features and pricing. 
                Current pricing is available on our pricing page.
              </p>

              <h3 className="text-xl font-semibold mb-3">Payment Terms</h3>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Payment is due in advance for each billing period</li>
                <li>We accept major credit cards and other payment methods</li>
                <li>Prices are subject to change with 30 days notice</li>
                <li>All fees are non-refundable except as required by law</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Refund Policy</h3>
              <p>
                We offer a 30-day money-back guarantee for new subscriptions. Refund requests 
                must be submitted within 30 days of initial payment.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold mb-3">Our Rights</h3>
              <p className="mb-4">
                The Service and its original content, features, and functionality are owned by 
                {companyName} and are protected by international copyright, trademark, and 
                other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold mb-3">Your Content</h3>
              <p className="mb-4">
                You retain ownership of content you submit to our Service. By submitting content, 
                you grant us a non-exclusive, worldwide, royalty-free license to use, modify, 
                and distribute your content solely for providing our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also 
                governs your use of the Service, to understand our practices regarding your 
                personal information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Disclaimers and Limitations</h2>
              
              <h3 className="text-xl font-semibold mb-3">Service Availability</h3>
              <p className="mb-4">
                We strive to maintain high availability but do not guarantee uninterrupted access. 
                The Service is provided &quot;as is&quot; without warranties of any kind.
              </p>

              <h3 className="text-xl font-semibold mb-3">Limitation of Liability</h3>
              <p>
                To the maximum extent permitted by law, {companyName} shall not be liable for 
                any indirect, incidental, special, consequential, or punitive damages arising 
                from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Indemnification</h2>
              <p>
                You agree to indemnify and hold harmless {companyName} from any claims, damages, 
                or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              <p className="mb-4">
                Either party may terminate this agreement at any time. Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Your access to the Service will be discontinued</li>
                <li>You remain responsible for any outstanding fees</li>
                <li>We may delete your data after a reasonable period</li>
                <li>Provisions that should survive termination will remain in effect</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of 
                [Your Jurisdiction], without regard to conflict of law principles.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users 
                of material changes via email or through our Service. Continued use of the 
                Service after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="mb-4">
                If you have questions about these Terms, please contact us:
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