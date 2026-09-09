import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "CatchZone Ltd privacy policy.",
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="shell max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-ink md:text-4xl">
          CatchZone – Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink-muted">Effective Date: 1 January 2026</p>

        <div className="prose-privacy mt-10 space-y-6 text-sm leading-relaxed text-ink-muted [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink">
          <p>
            CatchZone Ltd (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or
            &ldquo;us&rdquo;) values your privacy. This Privacy Policy
            explains what information we collect, how it is used, how it is
            stored, and your rights regarding your data when using CatchZone
            mobile applications and services.
          </p>
          <p>
            This policy applies to CatchZone applications including{" "}
            <strong>IslamQuest</strong>, <strong>Lumi</strong>, and any other
            applications developed by CatchZone Ltd.
          </p>

          <h2>1. Information We Collect</h2>
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

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To create and manage your account</li>
            <li>To save and sync your progress within apps</li>
            <li>To provide app features and premium functionality</li>
            <li>To maintain security and prevent abuse</li>
            <li>To improve app performance and reliability</li>
          </ul>

          <h2>3. Authentication and Data Storage</h2>
          <p>
            Some CatchZone applications use Supabase (a third-party backend
            service provider) for authentication and secure data storage.
          </p>
          <p>
            Account credentials are securely processed by Supabase.
            Passwords are encrypted and never visible to CatchZone.
          </p>
          <p>User data is stored in secure cloud databases managed by Supabase.</p>

          <h2>4. Data Sharing</h2>
          <p>We do not sell, rent, or trade your personal information.</p>
          <p>
            Data may be shared only with service providers required to
            operate the apps (such as Supabase for backend services or app
            stores for payments), or if required by law.
          </p>
          <p>CatchZone applications do not use third-party advertising networks.</p>

          <h2>5. Data Retention</h2>
          <p>
            Account data is retained for as long as your account remains
            active. If you delete your account, associated personal data
            will be permanently removed from active systems except where
            retention is required by law.
          </p>

          <h2>6. Account Deletion</h2>
          <p>
            You may delete your account at any time within supported
            applications. Deleting your account permanently removes your
            authentication record and associated app data such as progress
            and profile information.
          </p>

          <h2>7. Children&rsquo;s Privacy</h2>
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

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. Continued use of
            CatchZone applications after updates constitutes acceptance of
            the revised policy.
          </p>

          <h2>9. Contact</h2>
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
