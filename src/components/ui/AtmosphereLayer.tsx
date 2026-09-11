export function AtmosphereLayer({ tone }: { tone?: "cyan" | "iris" }) {
  return <div className="atmosphere" data-tone={tone} aria-hidden="true" />;
}
