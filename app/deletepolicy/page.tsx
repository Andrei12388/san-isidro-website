import { Logo } from "@/components/logo";

const DeletePolicy = () => {
  return (
    <div className="min-h-screen bg-background flex justify-center items-start py-12 px-4">
      <div className="bg-background text-foreground max-w-3xl w-full rounded-2xl shadow-xl p-10 space-y-6">
        <div className="flex items-center justify-center gap-3">
          <Logo />
          <h1 className="text-2xl font-bold">JCSGO: SAN ISIDRO</h1>
        </div>

        <h1 className="text-3xl font-bold text-center">
          Data Deletion Instructions
        </h1>

        <p>
          If you have created an account on our Discipleship System and would
          like your personal data deleted, you may request deletion at any time.
        </p>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">How to Request Deletion</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>
              Log in and delete your account inside the website settings, OR
            </li>
            <li>
              Send an email to: <strong>jcsgosanisidro@gmail.com</strong> with
              subject "Data Deletion Request"
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">
            After Receiving Your Request
          </h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Delete your account</li>
            <li>Remove all personal information</li>
            <li>Remove discipleship records associated with your account</li>
          </ul>
          <p>Processing time: within 7 days.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Facebook Users</h2>
          <p>
            If you logged in using Facebook Login, you may also remove our app
            from your Facebook settings:
            <br />
            <strong>
              Facebook → Settings → Apps and Websites → Remove this app
            </strong>
          </p>
        </section>

        <p>
          Contact us for questions at: <strong>jcsgosanisidro@gmail.com</strong>
        </p>
      </div>
    </div>
  );
};

export default DeletePolicy;
