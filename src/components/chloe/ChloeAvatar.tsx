import Image from "next/image";

/**
 * Chloe's existing team portrait (public/team/chloe-portrait-*), cropped to
 * head and shoulders for small circular use. Dark/light artwork swaps with the
 * site theme via `.theme-only-*`; the hidden variant is never downloaded.
 */
export function ChloeAvatar({ size, className = "" }: { size: number; className?: string }) {
  const common = {
    width: size,
    height: size,
    sizes: `${size}px`,
    draggable: false,
    loading: "lazy" as const,
  };
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full bg-surface-raised ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image src="/team/chloe-avatar-dark.webp" alt="" {...common} className="theme-only-dark h-full w-full object-cover" />
      <Image src="/team/chloe-avatar-light.webp" alt="" {...common} className="theme-only-light h-full w-full object-cover" />
    </span>
  );
}
