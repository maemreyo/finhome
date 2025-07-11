// Cookie Policy page

export const metadata = {
  title: 'Cookie Policy',
  description: 'Learn about how we use cookies and similar technologies.',
}

export default function CookiePolicyPage() {
  const lastUpdated = 'January 1, 2024'
  const contactEmail = process.env.CONTACT_EMAIL || 'privacy@company.com'

  return (
    <div className="py-24">
      <div className="container px-4 mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
              <p>
                Cookies are small text files that are stored on your device when you visit our 
                website. They help us provide you with a better experience by remembering your 
                preferences and analyzing how you use our site.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">How We Use Cookies</h2>
              <p className="mb-4">We use cookies for the following purposes:</p>
              
              <h3 className="text-xl font-semibold mb-3">Essential Cookies</h3>
              <p className="mb-4">
                These cookies are necessary for our website to function properly and cannot be 
                turned off. They include:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Authentication and security cookies</li>
                <li>Session management cookies</li>
                <li>Load balancing cookies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Analytics Cookies</h3>
              <p className="mb-4">
                These cookies help us understand how visitors interact with our website:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Page views and navigation patterns</li>
                <li>Time spent on different pages</li>
                <li>Error tracking and performance monitoring</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Preference Cookies</h3>
              <p className="mb-4">
                These cookies remember your choices and preferences:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Language and region settings</li>
                <li>Theme preferences (dark/light mode)</li>
                <li>Customization settings</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Managing Your Cookie Preferences</h2>
              <p className="mb-4">
                You can control and manage cookies in several ways:
              </p>
              
              <h3 className="text-xl font-semibold mb-3">Browser Settings</h3>
              <p className="mb-4">
                Most browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Block all cookies</li>
                <li>Accept only first-party cookies</li>
                <li>Delete existing cookies</li>
                <li>Set up notifications when cookies are created</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3">Impact of Disabling Cookies</h3>
              <p>
                Please note that disabling certain cookies may affect the functionality of our 
                website and limit your ability to use some features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
              <p className="mb-4">
                We may use third-party services that set their own cookies, including:
              </p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Vercel Analytics:</strong> For website performance monitoring</li>
                <li><strong>Stripe:</strong> For payment processing</li>
                <li><strong>Supabase:</strong> For authentication and data storage</li>
              </ul>
              <p>
                These third parties have their own privacy policies and cookie practices, 
                which we encourage you to review.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Any changes will be posted 
                on this page with an updated revision date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <p><strong>Email:</strong> {contactEmail}</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}