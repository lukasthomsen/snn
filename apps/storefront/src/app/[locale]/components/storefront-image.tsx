/* eslint-disable @next/next/no-img-element */

import type { ImgHTMLAttributes } from "react";

type ImageFetchPriority = "auto" | "high" | "low";

type StorefrontImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "fetchPriority"> & {
  eager?: boolean | undefined;
  fetchPriority?: ImageFetchPriority | undefined;
  priority?: boolean | undefined;
};

export function StorefrontImage({
  alt,
  decoding = "async",
  eager = false,
  fetchPriority,
  loading,
  priority = false,
  ...props
}: StorefrontImageProps) {
  const isPriority = eager || priority;
  const resolvedFetchPriority = fetchPriority ?? (priority ? "high" : null);

  return (
    <img
      {...props}
      {...(resolvedFetchPriority ? { fetchPriority: resolvedFetchPriority } : {})}
      alt={alt}
      decoding={decoding}
      loading={loading ?? (isPriority ? "eager" : "lazy")}
    />
  );
}
