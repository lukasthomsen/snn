import type { ReactNode } from "react";

import "@snn/ui/styles/components.css";
import "./styles.css";

type CheckoutLayoutProps = {
  children: ReactNode;
};

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return children;
}
