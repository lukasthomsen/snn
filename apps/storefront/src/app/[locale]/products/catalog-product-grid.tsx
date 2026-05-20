import type { ProductCard } from "@snn/commerce";
import type { Locale } from "@snn/i18n";

import { getAccountsHref } from "../auth-links";
import { StorefrontImage } from "../components/storefront-image";
import {
  CatalogLikeStateLoader,
  type CatalogGridCopy,
  ProductCardLikeControl,
} from "./catalog-like-button";

type CatalogProductCard = Pick<
  ProductCard,
  | "availability"
  | "description"
  | "displayId"
  | "id"
  | "imageUrl"
  | "isLiked"
  | "name"
  | "price"
  | "secondaryImageUrl"
  | "slug"
  | "status"
  | "variantId"
  | "variantTitle"
>;

type CatalogProductGridProps = {
  copy: CatalogGridCopy;
  isSignedIn: boolean;
  items: CatalogProductCard[];
  locale: Locale;
  removeOnUnlike?: boolean | undefined;
};

function formatMoney(amount: number, currencyCode: string, locale: Locale) {
  return new Intl.NumberFormat(locale === "da" ? "da-DK" : "en-DK", {
    currency: currencyCode,
    style: "currency",
  }).format(amount / 100);
}

function formatPrice(product: Pick<ProductCard, "price">, locale: Locale) {
  return formatMoney(product.price.amount, product.price.currencyCode, locale);
}

export function CatalogProductGrid({
  copy,
  isSignedIn,
  items,
  locale,
}: CatalogProductGridProps) {
  const variantIds = items.map((product) => product.variantId);

  return (
    <div className="catalog-grid__root__SW3a9">
      {isSignedIn ? <CatalogLikeStateLoader locale={locale} variantIds={variantIds} /> : null}
      {items.length === 0 ? (
        <div className="catalog-empty__root__SW3aa">
          <p>{copy.empty}</p>
        </div>
      ) : (
        items.map((product, index) => (
          <article className="product-card__root__SW3ab" key={product.displayId}>
            {isSignedIn ? (
              <ProductCardLikeControl
                copy={copy}
                initialLiked={product.isLiked}
                isSignedIn
                locale={locale}
                productId={product.id}
                variantId={product.variantId}
              />
            ) : (
              <a
                aria-label={copy.save}
                className="product-card__like-link__SW3ap"
                href={getAccountsHref(locale, "sign-in", `/${locale}/products/${product.slug}`)}
              >
                <HeartIcon />
              </a>
            )}
            <a className="product-card__link__SW3aj" href={`/${locale}/products/${product.slug}?variant=${product.variantId}`}>
              <span className="product-card__media__SW3ac">
                {product.price.isSale ? (
                  <span className="product-card__sale__SW3ah">{copy.sale}</span>
                ) : null}
                {product.imageUrl ? (
                  <StorefrontImage
                    alt=""
                    fetchPriority={index === 0 ? "high" : "auto"}
                    height={800}
                    loading={index === 0 ? "eager" : "lazy"}
                    sizes="(max-width: 42rem) calc(100vw - 2rem), (max-width: 72rem) calc(50vw - 1.5rem), 33vw"
                    src={product.imageUrl}
                    width={640}
                  />
                ) : (
                  <span aria-hidden="true" className="product-card__placeholder__SW3ai" />
                )}
                {product.secondaryImageUrl ? (
                  <StorefrontImage
                    alt=""
                    className="product-card__secondary-image__SW3ao"
                    fetchPriority="low"
                    height={800}
                    loading="lazy"
                    sizes="(max-width: 42rem) calc(100vw - 2rem), (max-width: 72rem) calc(50vw - 1.5rem), 33vw"
                    src={product.secondaryImageUrl}
                    width={640}
                  />
                ) : null}
              </span>
              <span className="product-card__copy__SW3ad">
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.variantTitle}</small>
                </span>
                <span>
                  <strong>
                    {product.price.compareAtAmount && product.price.compareAtAmount > product.price.amount ? (
                      <del>{formatMoney(product.price.compareAtAmount, product.price.currencyCode, locale)}</del>
                    ) : null}
                    {formatPrice(product, locale)}
                  </strong>
                  <small>{product.availability.isAvailable ? copy.available : copy.unavailable}</small>
                </span>
              </span>
            </a>
          </article>
        ))
      )}
    </div>
  );
}

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="M20.8 4.6c-2.1-2-5.4-1.8-7.3.5L12 6.8l-1.5-1.7c-1.9-2.3-5.2-2.5-7.3-.5-2.4 2.3-2.5 6.1-.2 8.5l8 8.1c.6.6 1.5.6 2.1 0l8-8.1c2.2-2.4 2.1-6.2-.3-8.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
