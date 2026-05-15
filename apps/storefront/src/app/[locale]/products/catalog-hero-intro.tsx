"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

import { LinkAction } from "@snn/ui";

type CatalogHeroIntroProps = {
  seeLessLabel: string;
  seeMoreLabel: string;
  text: string;
};

const collapsedLineCount = 3;

export function CatalogHeroIntro({
  seeLessLabel,
  seeMoreLabel,
  text,
}: CatalogHeroIntroProps) {
  const descriptionId = useId();
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [canToggle, setCanToggle] = useState(false);

  const measureOverflow = useCallback(() => {
    const paragraph = paragraphRef.current;

    if (!paragraph) {
      return;
    }

    const computedStyle = window.getComputedStyle(paragraph);
    const lineHeight = Number.parseFloat(computedStyle.lineHeight);

    if (!Number.isFinite(lineHeight)) {
      setCanToggle(false);
      return;
    }

    setCanToggle(paragraph.scrollHeight > lineHeight * collapsedLineCount + 1);
  }, []);

  useEffect(() => {
    const paragraph = paragraphRef.current;

    if (!paragraph) {
      return undefined;
    }

    let frameId = window.requestAnimationFrame(measureOverflow);
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(measureOverflow);
    });

    observer.observe(paragraph);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [measureOverflow, text]);

  return (
    <div className="catalog-hero__intro__SW3au">
      <p
        className="catalog-hero__description__SW3av"
        data-expanded={expanded ? "true" : "false"}
        id={descriptionId}
        ref={paragraphRef}
      >
        {text}
      </p>
      {canToggle ? (
        <LinkAction
          aria-controls={descriptionId}
          aria-expanded={expanded}
          className="catalog-hero__toggle__SW3aw"
          onClick={() => {
            setExpanded((current) => !current);
          }}
          type="button"
          variant="underline"
        >
          {expanded ? seeLessLabel : seeMoreLabel}
        </LinkAction>
      ) : null}
    </div>
  );
}
