import Link from "next/link";

import { SITE_CONTACT_EMAIL } from "@/lib/site-config";

export function CookieNoticeContent() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted-foreground">
      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          What we use
        </h2>
        <p>
          BASE Malaya Club uses a small set of essential technologies so the
          site works when you sign in and browse. We do not use advertising,
          analytics, or social-media tracking cookies.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Cookies
        </h2>
        <p className="mb-3">
          Cookies are small files stored by your browser. We only set cookies
          that are strictly necessary:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-foreground">Sign-in session</span>{" "}
            — keeps you logged in after you enter your email and password.
            Removed when you sign out or when the session expires.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Local storage
        </h2>
        <p className="mb-3">
          Some preferences are saved in your browser&apos;s local storage (not
          sent to our servers on every request):
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium text-foreground">Theme</span> — light,
            dark, or system appearance if you change it in the header.
          </li>
          <li>
            <span className="font-medium text-foreground">Cookie notice</span> —
            remembers that you dismissed the cookie banner.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          What we do not use
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Third-party advertising or retargeting cookies</li>
          <li>Analytics or behaviour-tracking cookies</li>
          <li>Social network embed trackers</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Your choices
        </h2>
        <p>
          Click <span className="font-medium text-foreground">Accept</span> on
          the cookie banner to acknowledge use of essential cookies. You can
          clear cookies and local storage at any time in your browser settings;
          signing in again may require accepting the notice once more.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-semibold text-foreground">
          Personal data
        </h2>
        <p>
          Cookies and local storage on this site are separate from how we handle
          membership and profile information. For that, see our{" "}
          <Link href="/privacy" className="text-primary underline">
            privacy notice
          </Link>
          . Questions? Email{" "}
          <a
            href={`mailto:${SITE_CONTACT_EMAIL}`}
            className="text-primary underline"
          >
            {SITE_CONTACT_EMAIL}
          </a>
          .
        </p>
      </section>
    </div>
  );
}
