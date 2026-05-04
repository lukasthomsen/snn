import type { HTMLAttributes } from "react";

import { cx } from "../cx";
import type { SpinnerSize } from "../types";

type SpinnerProps = HTMLAttributes<HTMLSpanElement> & {
  size?: SpinnerSize;
};

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <span
      {...props}
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cx("spinner__root__SW0cp", className)}
      data-size={size}
    />
  );
}
