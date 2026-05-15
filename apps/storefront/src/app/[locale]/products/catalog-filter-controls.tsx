"use client";

import { useOptimistic, useTransition } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";

import { Radio, RadioGroup } from "@snn/ui";

export type CatalogSortOption = {
  href: Route;
  label: string;
  value: string;
};

type CatalogSortControlProps = {
  label: string;
  options: CatalogSortOption[];
  value: string;
};

export function CatalogSortControl({
  label,
  options,
  value,
}: CatalogSortControlProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedValue, setSelectedValue] = useOptimistic(
    value,
    (_currentValue, nextValue: string) => nextValue,
  );

  return (
    <RadioGroup
      hideLabel
      label={label}
    >
      {options.map((option) => (
        <Radio
          checked={selectedValue === option.value}
          fullWidth
          key={option.value}
          label={option.label}
          name="sort"
          onChange={() => {
            startTransition(() => {
              setSelectedValue(option.value);
              router.push(option.href, { scroll: false });
            });
          }}
          value={option.value}
        />
      ))}
    </RadioGroup>
  );
}
