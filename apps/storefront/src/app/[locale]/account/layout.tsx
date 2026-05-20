import type { ReactNode } from "react";

import "@snn/ui/styles/components.css";

import "./styles.css";

type AccountLayoutProps = {
  children: ReactNode;
  params: Promise<unknown>;
};

export const dynamic = "force-dynamic";

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <main className="account__shell__SW1a0">
      {children}
    </main>
  );
}
