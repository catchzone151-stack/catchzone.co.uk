import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { roadmapCategories } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticLink } from "@/components/ui/MagneticLink";

export function generateStaticParams() {
  return roadmapCategories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = roadmapCategories.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description,
    alternates: { canonical: `/work/product-lab/${category.slug}` },
  };
}

export default async function ProductLabCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = roadmapCategories.find((c) => c.slug === slug);
  if (!category) notFound();

  return (
    <div className="pt-32 pb-24">
      <section className="border-b border-line pb-16">
        <div className="shell">
          <p className="mono text-xs">
            <Link href="/work" className="text-ink-muted hover:text-ink">
              Work
            </Link>
            <span className="text-ink-faint"> / </span>
            <span className="text-ink-muted">{category.name}</span>
          </p>

          <div className="mt-6">
            <span className="mono inline-block rounded-full border border-line px-4 py-2 text-xs uppercase tracking-wider text-ink-faint">
              Product Lab · In development
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold text-ink md:text-5xl">
              {category.name}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
              {category.description}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="shell">
          <Reveal className="mx-auto max-w-2xl rounded-2xl border border-line bg-surface p-6 md:p-8">
            <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
              Roadmap status
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
              This category is on CatchZone&apos;s product roadmap. It
              represents an area we build in, rather than a single finished
              product — future apps in this space will follow the same
              connected, end-to-end approach used across the rest of
              CatchZone&apos;s work.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line py-16 text-center">
        <div className="shell">
          <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
            Have a project in this space?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <MagneticLink
              href="/start-a-project"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
            </MagneticLink>
            <Link
              href="/work"
              className="rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
            >
              ← Back to Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
