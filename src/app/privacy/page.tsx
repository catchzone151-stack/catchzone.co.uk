import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CatchZone Ltd collects, uses and protects personal data in its apps, website enquiries and the CatchZone Voice live demo.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="shell max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          CatchZone – Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink-muted">
          Effective Date: 1 January 2026 · Last updated: 14 November 2026
        </p>

        <div className="prose-privacy mt-10 space-y-6 text-sm leading-relaxed text-ink-muted [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
          <p>
            CatchZone Ltd (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
            &ldquo;us&rdquo;) values your privacy. This Privacy Policy
            explains what information we collect, how it is used, how it is
            stored, and your rights regarding your data when using CatchZone
            mobile applications and services.
          </p>
          <p>
            This policy applies to CatchZone applications — including{" "}
            <strong>IslamQuest</strong>, <strong>Lumi</strong>,{" "}
            <strong>Rawdah Cycle</strong> and <strong>IEH: CSCS Test Prep</strong>,
            and any other applications developed by CatchZone Ltd — and to
            this website, including its enquiry forms and the CatchZone Voice
            live demo.
          </p>

          <h2>1. Information We Collect — Applications</h2>
          <p>
            When you create an account and use a CatchZone application, we
            may collect:
          </p>
          <ul>
            <li>Email address (used for account authentication)</li>
            <li>Display name (handle) and optional avatar</li>
            <li>
              App activity data such as lessons completed, quiz results,
              streaks, XP, progress or similar feature data
            </li>
            <li>
              Technical data required for app performance and stability
              (such as device type and crash logs)
            </li>
          </ul>
          <p>We do not collect:</p>
          <ul>
            <li>
              Your real name (unless you choose to use it as your display
              name)
            </li>
            <li>Precise location data</li>
            <li>Contacts or address book information</li>
            <li>Payment card information</li>
          </ul>

          <h2>2. How We Use Application Information</h2>
          <ul>
            <li>To create and manage your account</li>
            <li>To save and sync your progress within apps</li>
            <li>To provide app features and premium functionality</li>
            <li>To maintain security and prevent abuse</li>
            <li>To improve app performance and reliability</li>
          </ul>

          <h2>3. Website Enquiries</h2>
          <p>
            When you submit the project enquiry form on this website (the
            &ldquo;Start a Project&rdquo; configurator), we collect the
            information you provide: your name, email address, optional
            company name, optional phone number, and the details you share
            about your project — including the build type, starting point,
            priorities and budget range you select.
          </p>
          <p>
            When you submit the CatchZone Voice enquiry form, we collect your
            name, business email address, company name, your message and
            whether you asked for a private demonstration or to discuss your
            requirements.
          </p>
          <p>
            We use this information solely to respond to your enquiry and
            discuss your project. We do not use it for marketing, and we do
            not sell, rent or trade it.
          </p>
          <p>
            To deliver enquiries to our inbox, this form may send your
            submission through a transactional email provider (Resend). The
            provider processes the message only to deliver it to CatchZone
            and does not use it for any other purpose.
          </p>
          <p>
            Enquiry submissions are retained only as long as needed to
            respond to and, where relevant, follow up on your project — after
            which they are deleted or archived in line with normal business
            record-keeping.
          </p>

          <h2 id="voice-demo" className="scroll-mt-28">4. CatchZone Voice Live Demo</h2>
          <p>
            The CatchZone Voice pages include an optional live translation
            demo. It only starts after you agree to the on-screen notice and
            your browser grants microphone permission. You can stop it at any
            time, and it stops automatically when the short trial ends.
          </p>
          <p>
            <strong>Microphone audio.</strong> While a trial is running, your
            browser streams your microphone audio directly to Soniox, the
            speech technology provider behind CatchZone Voice, for real-time
            speech recognition, translation and speech synthesis. The resulting
            text and spoken audio are returned to your browser. Microphone
            audio is paused while a translation is being played back.
          </p>
          <p>
            <strong>What CatchZone stores.</strong> CatchZone does not record,
            receive or store your demo audio, transcript or translation on our
            servers. The transcript is held only in your open browser tab and
            is discarded when you leave or reload the page.
          </p>
          <p>
            <strong>What Soniox states.</strong> Soniox&rsquo;s published{" "}
            <a
              href="https://docs.soniox.com/security-and-privacy"
              className="underline underline-offset-2"
              rel="noopener"
            >
              security and privacy information
            </a>{" "}
            says that it does not store real-time audio or transcripts, does
            not use customer audio or transcripts to train its models, and
            keeps per-request usage metadata (such as model, audio duration and
            a session reference) for billing and debugging. These are
            Soniox&rsquo;s own statements about its service. Depending on how
            the service is configured, this processing may take place outside
            the United Kingdom, for example in the United States or the
            European Union.
          </p>
          <p>
            <strong>Fair-use and abuse prevention.</strong> To keep the free
            demo available and to limit misuse, our server keeps a short-lived
            usage record for each trial: a random session identifier, the
            date, the length of the trial, and one-way keyed hashes of your IP
            address and of a random identifier held in a cookie
            (<code>cz_voice_vid</code>). The cookie is set only when you start a
            trial, is used only by the demo, and expires after two days. The
            hashes are salted per day, cannot be reversed to reveal your IP
            address, and contain no audio or conversation content. These
            records are stored with our database provider (Supabase) and
            deleted automatically by a daily clean-up once they are more than
            two days old.
          </p>
          <p>
            We rely on your consent for processing your microphone audio in the
            demo, and on our legitimate interest in preventing abuse for the
            usage records. Please do not share sensitive personal information
            during a demo.
          </p>

          <h2>5. Authentication and Data Storage</h2>
          <p>
            Some CatchZone applications use Supabase (a third-party backend
            service provider) for authentication and secure data storage.
          </p>
          <p>
            Account credentials are securely processed by Supabase. Passwords
            are never stored in plain text or visible to CatchZone — they are
            securely hashed using industry-standard methods, which is
            stronger than reversible encryption because even Supabase cannot
            recover your original password from it.
          </p>
          <p>User data is stored in secure cloud databases managed by Supabase.</p>

          <h2>6. Data Sharing</h2>
          <p>We do not sell, rent, or trade your personal information.</p>
          <p>
            Data may be shared only with service providers required to
            operate the apps and this website (such as Supabase for backend
            services, Resend for delivering website enquiries, Soniox for the
            CatchZone Voice live demo, or app stores for payments), or if
            required by law.
          </p>
          <p>CatchZone applications do not use third-party advertising networks.</p>

          <h2>7. Data Retention</h2>
          <p>
            Account data is retained for as long as your account remains
            active. If you delete your account, associated personal data
            will be permanently removed from active systems except where
            retention is required by law.
          </p>

          <h2>8. Account Deletion</h2>
          <p>
            You may delete your account at any time within supported
            applications. Deleting your account permanently removes your
            authentication record and associated app data such as progress
            and profile information.
          </p>

          <h2>9. Children&rsquo;s Privacy</h2>
          <p>
            Some CatchZone applications, such as IslamQuest, may be used by
            children under the age of 13. We minimise data collection and
            only collect information necessary to provide the service (such
            as authentication and progress tracking).
          </p>
          <p>
            If a parent or guardian believes their child has provided
            personal information without consent, please contact us and we
            will promptly remove the information.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Continued use of
            CatchZone applications and this website after updates constitutes
            acceptance of the revised policy.
          </p>

          <h2>11. Contact</h2>
          <p>For privacy-related inquiries, please contact:</p>
          <p>
            <strong>info@catchzone.co.uk</strong>
          </p>
          <p>
            <strong>CATCHZONE LTD</strong>
            <br />
            124-128 City Road
            <br />
            London EC1V 2NX
            <br />
            United Kingdom
          </p>
        </div>
      </div>
    </div>
  );
}
