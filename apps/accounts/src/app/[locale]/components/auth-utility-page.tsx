import type { ReactNode } from "react";

import { AuthBrandCarousel, type AuthBrandStatement } from "./auth-brand-carousel";

type AuthUtilityPageProps = {
  brandFooter: string;
  brandStatements: AuthBrandStatement[];
  brandTitle: string;
  children: ReactNode;
  helper: ReactNode;
  title: string;
};

export function AuthUtilityPage({
  brandFooter,
  brandStatements,
  brandTitle,
  children,
  helper,
  title,
}: AuthUtilityPageProps) {
  return (
    <main className="auth__shell__SW0fd">
      <aside className="brand__panel__SW0fe" aria-label={brandTitle}>
        <AuthBrandCarousel
          fallbackTitle={brandTitle}
          footer={brandFooter}
          statements={brandStatements}
        />
      </aside>

      <section className="auth__panel__SW0ff" aria-labelledby="auth-title">
        <div className="auth__card-frame__SW0fm">
          <div className="auth__card__SW0fn">
            <div className="auth__header__SW0fo">
              <p className="helper__copy__SW0fq">{helper}</p>
              <h3 id="auth-title">{title}</h3>
            </div>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
