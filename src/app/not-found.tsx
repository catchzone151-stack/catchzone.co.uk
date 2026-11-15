import Link from "next/link";

/** Branded 404 (served with HTTP 404; Next adds noindex automatically). */
export default function NotFound() {
  const links = [
    { href: "/services", label: "Services", body: "Apps, web platforms and business systems" },
    { href: "/products", label: "Products", body: "CatchZone Voice and CatchZone School HR" },
    { href: "/work", label: "Work", body: "Case studies and showcase systems" },
  ];
  return (
    <section className="product-contrast pb-24 pt-36 md:pt-44">
      <div className="shell max-w-3xl">
        <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">404 · Page not found</p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-ink md:text-5xl">
          This page doesn’t exist — but plenty else does.
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
          The link may be out of date, or the address may have a typo. Try one of these instead.
        </p>
        <ul className="mt-10 grid gap-3 sm:grid-cols-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block h-full rounded-2xl border border-white/10 bg-surface p-5 transition-colors hover:border-accent-cyan/40"
              >
                <span className="block font-semibold text-ink">{l.label} →</span>
                <span className="mt-1 block text-sm text-ink-muted">{l.body}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-ink-muted">
          <Link href="/" className="font-semibold text-ink hover:text-accent-cyan">
            Back to the homepage
          </Link>{" "}
          ·{" "}
          <Link href="/start-a-project" className="font-semibold text-ink hover:text-accent-cyan">
            Start a project
          </Link>
        </p>
      </div>
    </section>
  );
}
