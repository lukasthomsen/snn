/* eslint-disable @next/next/no-img-element */

import type { ImgHTMLAttributes } from "react";

type StorefrontImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  eager?: boolean | undefined;
};

export function StorefrontImage({
  alt,
  decoding = "async",
  eager = false,
  loading,
  ...props
}: StorefrontImageProps) {
  return (
    <img
      {...props}
      alt={alt}
      decoding={decoding}
      loading={loading ?? (eager ? "eager" : "lazy")}
    />
  );
}
