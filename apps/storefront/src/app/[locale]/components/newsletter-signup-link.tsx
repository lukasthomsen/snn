"use client";

import { Suspense, lazy, useCallback, useState, type ReactNode } from "react";

const NewsletterSignupModal = lazy(() => (
  import("./newsletter-signup-modal").then((mod) => ({
    default: mod.NewsletterSignupModal,
  }))
));

type NewsletterSignupLinkProps = {
  children: ReactNode;
  className?: string | undefined;
  locale: "da" | "en";
};

export function NewsletterSignupLink({
  children,
  className,
  locale,
}: NewsletterSignupLinkProps) {
  const [open, setOpen] = useState(false);
  const [hasRequestedModal, setHasRequestedModal] = useState(false);
  const openNewsletterSignup = useCallback(() => {
    setHasRequestedModal(true);
    setOpen(true);
  }, []);
  const closeNewsletterSignup = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <a
        className={className}
        href="#newsletter-signup"
        onClick={(event) => {
          event.preventDefault();
          openNewsletterSignup();
        }}
      >
        {children}
      </a>
      {hasRequestedModal ? (
        <Suspense fallback={null}>
          <NewsletterSignupModal
            locale={locale}
            onClose={closeNewsletterSignup}
            open={open}
          />
        </Suspense>
      ) : null}
    </>
  );
}
