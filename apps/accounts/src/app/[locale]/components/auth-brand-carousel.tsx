"use client";

import { startTransition, useEffect, useRef, useState } from "react";

import { PaginationDots } from "@snn/ui";

const rotationDelay = 8000;
const textTransitionDelay = 180;

export type AuthBrandStatement = {
  statement: string;
  substatement: string;
};

type AuthBrandCarouselProps = {
  fallbackTitle: string;
  footer: string;
  statements: AuthBrandStatement[];
};

export function AuthBrandCarousel({
  fallbackTitle,
  footer,
  statements,
}: AuthBrandCarouselProps) {
  const fallbackStatement = { statement: fallbackTitle, substatement: "" };
  const safeStatements =
    statements.length > 0 ? statements : [fallbackStatement];
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [transitionState, setTransitionState] = useState<"entered" | "exiting">(
    "entered",
  );
  const swapTimeoutRef = useRef<number | undefined>(undefined);
  const firstStatement = safeStatements[0] ?? fallbackStatement;
  const activeStatement =
    safeStatements[activeIndex % safeStatements.length] ?? firstStatement;
  const hasMultipleStatements = safeStatements.length > 1;
  const shouldRotate = hasMultipleStatements && !prefersReducedMotion;

  function showStatement(nextIndex: number) {
    const normalizedIndex = nextIndex % safeStatements.length;

    if (normalizedIndex === activeIndex) {
      return;
    }

    window.clearTimeout(swapTimeoutRef.current);

    if (prefersReducedMotion) {
      setActiveIndex(normalizedIndex);
      return;
    }

    setTransitionState("exiting");
    swapTimeoutRef.current = window.setTimeout(() => {
      startTransition(() => {
        setActiveIndex(normalizedIndex);
        setTransitionState("entered");
      });
    }, textTransitionDelay);
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);

    return () => mediaQuery.removeEventListener("change", syncReducedMotion);
  }, []);

  useEffect(() => {
    return () => window.clearTimeout(swapTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!shouldRotate) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      const normalizedIndex = (activeIndex + 1) % safeStatements.length;

      window.clearTimeout(swapTimeoutRef.current);
      setTransitionState("exiting");
      swapTimeoutRef.current = window.setTimeout(() => {
        startTransition(() => {
          setActiveIndex(normalizedIndex);
          setTransitionState("entered");
        });
      }, textTransitionDelay);
    }, rotationDelay);

    return () => window.clearTimeout(timeout);
  }, [activeIndex, safeStatements.length, shouldRotate]);

  return (
    <div className="brand__copy__SW0fg">
      <div
        className="brand__rotation__SW0hn"
        data-state={transitionState}
      >
        <h1>{activeStatement.statement}</h1>
        <div className="brand__carousel__SW0fh">
          <p className="brand__statement__SW0fi">{activeStatement.substatement}</p>
        </div>

        {hasMultipleStatements ? (
          <PaginationDots
            count={safeStatements.length}
            currentIndex={activeIndex}
            label="Brand statement"
            onChange={showStatement}
          />
        ) : null}
      </div>

      <p className="brand__footer__SW0fl">{footer}</p>
    </div>
  );
}
