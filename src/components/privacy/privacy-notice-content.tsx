import { SITE_CONTACT_EMAIL } from "@/lib/site-config";

export function PrivacyNoticeContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">Who we are</h2>
        <p>
          BASE Malaya Club (&quot;we&quot;, &quot;the club&quot;) operates this
          website for the BASE jumping community in Malaysia. For privacy
          questions contact us at{" "}
          <a
            href={`mailto:${SITE_CONTACT_EMAIL}`}
            className="text-primary underline"
          >
            {SITE_CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          What data we collect
        </h2>
        <p>When you apply for membership or use the site we may process:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Identity &amp; contact: name, email, country</li>
          <li>Profile: gender, date of birth, jump counts, bio, social links</li>
          <li>Account: password (stored hashed), sign-in sessions</li>
          <li>Application: voucher information, review status</li>
          <li>Media you upload (e.g. avatar, event photos)</li>
          <li>
            Technical: essential cookies for authentication and theme preference
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Why we use your data
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Review and manage membership applications</li>
          <li>Provide member accounts and club content</li>
          <li>Organise events and registrations</li>
          <li>
            Display the public members directory (only what you choose to show)
          </li>
          <li>Keep the site secure and functioning</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Legal basis
        </h2>
        <p>
          We process application and membership data based on your consent (given
          when submitting the application form) and our legitimate interest in
          running a private sports club. You may withdraw consent for optional
          public profile fields in your account settings.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Who sees your data
        </h2>
        <p>
          Club administrators can access application and member data. Approved
          members may see directory information according to your privacy
          settings. We do not sell personal data. Service providers (hosting,
          email) may process data on our behalf under contract.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Retention
        </h2>
        <p>
          We keep membership data while your account is active. Rejected
          applications may be retained for a reasonable period for audit
          purposes, then deleted or anonymised.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Your rights
        </h2>
        <p>
          Depending on applicable law you may request access, correction,
          deletion, or restriction of your personal data. Contact{" "}
          <a
            href={`mailto:${SITE_CONTACT_EMAIL}`}
            className="text-primary underline"
          >
            {SITE_CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">Cookies</h2>
        <p>
          We use essential cookies for sign-in (session) and, if you choose, a
          theme preference stored locally. We do not use third-party advertising
          cookies. By clicking &quot;Accept&quot; on the cookie notice you
          acknowledge use of these essential cookies.
        </p>
      </section>
    </div>
  );
}
