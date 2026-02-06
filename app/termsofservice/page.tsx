import { Logo } from "@/components/logo"

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background flex justify-center items-start py-12 px-4">
      <div className="bg-background text-foreground max-w-3xl w-full rounded-2xl shadow-xl p-10 space-y-6">

        <div className="flex items-center justify-center gap-3">
          <Logo />
          <h1 className="text-2xl font-bold">JCSGO: SAN ISIDRO</h1>
        </div>

        <h1 className="text-3xl font-bold text-center">Terms of Service</h1>
        <p className="text-sm text-center opacity-70">
          Last updated: February 6, 2026
        </p>

        <p>
          Welcome to our Discipleship System website. By accessing or using our website,
          you agree to these Terms of Service.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Use of Service</h2>
          <p>
            This platform is provided to support Christian discipleship, communication,
            and community building. You agree to use the service respectfully and lawfully.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Accounts</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Maintain your account security</li>
            <li>Provide accurate information</li>
            <li>Responsible for all activities under your account</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Acceptable Behavior</h2>
          <p>You agree NOT to:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Post harmful or illegal content</li>
            <li>Harass other users</li>
            <li>Attempt to hack or disrupt the system</li>
            <li>Misuse personal information</li>
          </ul>
          <p>We may suspend accounts that violate these rules.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Intellectual Property</h2>
          <p>All website content and materials belong to the Discipleship System unless otherwise stated.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Privacy</h2>
          <p>Your use of the service is also governed by our Privacy Policy.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms or misuse the service.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Disclaimer</h2>
          <p>The service is provided "as is" without warranties. We are not liable for damages resulting from use of the website.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Changes</h2>
          <p>We may update these Terms at any time. Continued use means you accept changes.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p>For questions, contact: <strong>jcsgosanisidro@gmail.com</strong></p>
        </section>

      </div>
    </div>
  )
}

export default TermsOfService
