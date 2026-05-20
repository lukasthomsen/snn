import { isLocale, type Locale } from "@snn/i18n";

import { cartCopy } from "../components/cart-copy";

type CartPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  const safeLocale: Locale = isLocale(locale) ? locale : "da";
  const copy = cartCopy[safeLocale];
  const pageCopy = cartPageCopy[safeLocale];

  return (
    <main
      className="cartPage__root__SW6a0"
      data-perf-ready="true"
      data-perf-surface="cart-page"
      data-perf-updating="false"
    >
      <BagMark className="cartPage__image__SW6a6" />
      <section className="cartPage__header__SW6a1">
        <h1>{pageCopy.title}</h1>
        <p>{pageCopy.itemCount.replace("{count}", "0")}</p>
      </section>
      <section className="cartPage__empty__SW6a7">
        <div>
          <h2>{copy.emptyBag}</h2>
          <p>{copy.emptyBagLong}</p>
        </div>
        <a href={`/${safeLocale}/products`}>{copy.continueShopping}</a>
      </section>
    </main>
  );
}

function BagMark({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 112 112"
    >
      <rect fill="#F4F4F4" height="104" rx="22" width="104" x="4" y="4" />
      <path
        d="M31 46C31.5 42.6 34.4 40 37.9 40H74.1C77.6 40 80.5 42.6 81 46L85.1 78.2C85.7 82.4 82.4 86 78.2 86H33.8C29.6 86 26.3 82.4 26.9 78.2L31 46Z"
        fill="#131313"
      />
      <path
        d="M44 46V39.5C44 32.9 49.4 27.5 56 27.5C62.6 27.5 68 32.9 68 39.5V46"
        stroke="#131313"
        strokeLinecap="round"
        strokeWidth="7"
      />
      <path
        d="M42 55H70"
        opacity="0.78"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="4"
      />
    </svg>
  );
}

const cartPageCopy = {
  da: {
    itemCount: "{count} varer",
    title: "Your bag",
  },
  en: {
    itemCount: "{count} items",
    title: "Your bag",
  },
} as const;
