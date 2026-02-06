import { Logo } from "@/components/logo"

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex justify-center items-start py-12 px-4">

      {/* CARD */}
      <div className="bg-background text-foreground max-w-3xl w-full rounded-2xl shadow-xl p-10 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-center gap-3">
          <Logo />
          <h1 className="text-2xl font-bold">JCSGO: SAN ISIDRO</h1>
        </div>

        <h1 className="text-3xl font-bold text-center">Privacy Policy</h1>
        <p className="text-sm text-center opacity-70">
          Last updated: February 6, 2026
        </p>

        <p>
          Welcome to our Discipleship System website. Your privacy is important to us.
          This Privacy Policy explains how we collect, use, and protect your information
          when you use our website and services.
        </p>

        {/* 1 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Information We Collect</h2>
          <p>When you use our website or sign in through Facebook Login, we may collect:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Profile picture (if provided by Facebook)</li>
            <li>Basic account information necessary for login</li>
            <li>Information you voluntarily provide</li>
          </ul>
        </section>

        {/* 2 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Create and manage your account</li>
            <li>Secure login</li>
            <li>Connect you with discipleship groups</li>
            <li>Provide communication features</li>
            <li>Improve services</li>
          </ul>
          <p>We do NOT sell, rent, or trade your personal data.</p>
        </section>

        {/* 3 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Facebook Login</h2>
          <p>
            We receive only the basic information you authorize and never post to your
            Facebook account without permission.
          </p>
        </section>

        {/* 4 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Data Sharing</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>When required by law</li>
            <li>To protect system security</li>
            <li>With trusted service providers (hosting/security)</li>
          </ul>
        </section>

        {/* 5 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">5. Data Security</h2>
          <p>
            We use secure servers and authentication controls. However, no system can
            guarantee 100% protection.
          </p>
        </section>

        {/* 6 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">6. Data Retention</h2>
          <p>
            Information is kept only while your account is active or as required to provide services.
          </p>
        </section>

        {/* 7 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">7. Your Rights & Data Deletion</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Access your data</li>
            <li>Update your information</li>
            <li>Request account deletion</li>
          </ul>
          <p>
            Contact us at: <strong>jcsgosanisidro@gmail.com</strong>
          </p>
        </section>

        {/* 8 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">8. Children's Privacy</h2>
          <p>We do not knowingly collect personal information from children under 13.</p>
        </section>

        {/* 9 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">9. Changes to This Policy</h2>
          <p>Updates will be posted on this page with the revised date.</p>
        </section>

        {/* 10 */}
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">10. Contact Us</h2>
          <p>Email: jcsgosanisidro@gmail.com</p>
        </section>

      </div>
    </div>
  )
}

export default PrivacyPolicy
