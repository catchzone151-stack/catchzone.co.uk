import { Reveal } from "@/components/ui/Reveal";

interface SectionHeadingProps {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  return (
    <Reveal
      className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}
    >
      <div className="flex items-center gap-3">
        <span className="mono text-xs text-accent-cyan">{index}</span>
        <span className="mono text-xs uppercase tracking-[0.2em] text-ink-faint">
          {eyebrow}
        </span>
      </div>
      <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  );
}
