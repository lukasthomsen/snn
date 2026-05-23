"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  BadgePercentIcon,
  Button,
  Heading,
  HeartIcon,
  Modal,
  PackageOpenIcon,
  ShieldCheckIcon,
} from "@snn/ui";
import type { Locale } from "@snn/i18n";

type WelcomeAccountModalProps = {
  locale: Locale;
  open: boolean;
  userId: string;
};

const welcomeCopy = {
  da: {
    close: "Luk velkomst",
    features: [
      ["Ordrer", "Følg køb, levering og retur fra kontoen."],
      ["Gemte produkter", "Hold dine favoritter klar til næste rutine."],
      ["Rewards", "Se point, niveauer og fordele ét sted."],
      ["Sikkerhed", "Administrer login, adgangskode og passkeys."],
    ],
    getStarted: "Kom i gang",
    kicker: "Kontoen er klar",
    notNow: "Ikke nu",
    subtitle: "Din SNN-konto samler ordrer, gemte produkter, rewards og sikkerhed ét sted.",
    title: "Velkommen til SNN",
  },
  en: {
    close: "Close welcome",
    features: [
      ["Orders", "Track purchases, delivery, and returns from your account."],
      ["Saved products", "Keep favourites ready for your next routine."],
      ["Rewards", "See points, tiers, and benefits in one place."],
      ["Security", "Manage sign-in, password access, and passkeys."],
    ],
    getStarted: "Get started",
    kicker: "Account ready",
    notNow: "Not now",
    subtitle: "Your SNN account brings orders, saved products, rewards, and security into one place.",
    title: "Welcome to SNN",
  },
} as const;

const featureIcons = [PackageOpenIcon, HeartIcon, BadgePercentIcon, ShieldCheckIcon];

export function WelcomeAccountModal({
  locale,
  open,
  userId,
}: WelcomeAccountModalProps) {
  const copy = welcomeCopy[locale];
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storageKey = useMemo(() => `snn:account-welcome:${userId}`, [userId]);
  const [visible, setVisible] = useState(false);

  const removeWelcomeParam = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("welcome");
    const query = nextParams.toString();

    router.replace((query ? `${pathname}?${query}` : pathname) as Route, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    let isActive = true;

    queueMicrotask(() => {
      if (!isActive) {
        return;
      }

      if (!open) {
        setVisible(false);
        return;
      }

      if (globalThis.localStorage?.getItem(storageKey) === "seen") {
        removeWelcomeParam();
        return;
      }

      setVisible(true);
    });

    return () => {
      isActive = false;
    };
  }, [open, removeWelcomeParam, storageKey]);

  function dismiss() {
    globalThis.localStorage?.setItem(storageKey, "seen");
    setVisible(false);
    removeWelcomeParam();
  }

  return (
    <Modal
      bodyClassName="accountWelcome__body__SW9w1"
      className="accountWelcome__dialog__SW9w0"
      closeLabel={copy.close}
      hideHeader
      onClose={dismiss}
      open={visible}
      scroll="inside"
      showCloseButton
      size="cover"
      title={copy.title}
    >
      <div className="accountWelcome__visual__SW9w2" aria-hidden="true">
        <div className="accountWelcome__media__SW9w3">
          <span>SNN</span>
          <strong>Member</strong>
          <small>Orders · Rewards · Security</small>
        </div>
      </div>

      <section className="accountWelcome__content__SW9w5">
        <p className="accountWelcome__kicker__SW9w6">{copy.kicker}</p>
        <Heading as="h2" className="accountWelcome__title__SW9w7">
          {copy.title}
        </Heading>
        <p className="accountWelcome__subtitle__SW9w8">{copy.subtitle}</p>

        <div className="accountWelcome__features__SW9w9">
          {copy.features.map(([title, description], index) => {
            const FeatureIcon = featureIcons[index] ?? BadgePercentIcon;

            return (
              <article className="accountWelcome__feature__SW9wa" key={title}>
                <span>
                  <FeatureIcon aria-hidden="true" size={21} strokeWidth={1.8} />
                </span>
                <div>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="accountWelcome__actions__SW9wb">
          <Button
            className="accountWelcome__primary__SW9wc"
            fullWidth
            onClick={dismiss}
            size="lg"
            tone="secondary"
            type="button"
          >
            {copy.getStarted}
          </Button>
          <button
            className="accountWelcome__dismiss__SW9wd"
            onClick={dismiss}
            type="button"
          >
            {copy.notNow}
          </button>
        </div>
      </section>
    </Modal>
  );
}
