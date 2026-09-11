"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

interface MagneticLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
  external?: boolean;
}

/**
 * A CTA that leans gently toward the pointer. Disabled entirely for touch —
 * it has no meaning without a hovering cursor.
 */
export function MagneticLink({
  href,
  children,
  className,
  strength = 0.35,
  external = false,
}: MagneticLinkProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  function handleMouseMove(e: React.MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(relX * strength);
    y.set(relY * strength);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const content = (
    <motion.span
      style={{ x: springX, y: springY, display: "inline-block" }}
    >
      {children}
    </motion.span>
  );

  if (external) {
    return (
      <a
        ref={ref}
        href={href}
        className={className}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {content}
    </Link>
  );
}
