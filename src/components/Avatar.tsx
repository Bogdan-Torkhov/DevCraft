"use client";

import { useState } from "react";

interface AvatarProps {
  src?: string | null;
  name: string;
  className?: string;
  textClassName?: string;
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials || "?";
}

/**
 * Decorative avatar with a graceful gradient + initials fallback when the
 * remote image is missing or fails to load.
 */
export default function Avatar({
  src,
  name,
  className = "",
  textClassName = "",
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = Boolean(src) && failedSrc === src;

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`flex select-none items-center justify-center bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 font-bold uppercase leading-none text-white ${className} ${textClassName}`}
      >
        {getInitials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      aria-hidden="true"
      onError={() => setFailedSrc(src)}
      className={`block ${className}`}
    />
  );
}
