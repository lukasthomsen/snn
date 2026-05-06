import Image from "next/image";

import { isLocale } from "@snn/i18n";
import { getCustomerLikedProducts } from "@snn/customer";

import { unlikeProductAction } from "../actions";
import { requireAccountSession } from "../account-auth";

type LikedPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function LikedPage({ params }: LikedPageProps) {
  const { locale } = await params;
  const safeLocale = isLocale(locale) ? locale : "da";
  const { user } = await requireAccountSession(safeLocale, `/${safeLocale}/account/liked`);
  const likedProducts = await getCustomerLikedProducts(user, safeLocale);

  return (
    <div className="account__stack__SW1a8">
      <header className="account__section-header__SW1a9">
        <h2>Liked items</h2>
        <p className="account__muted__SW1aa">Product-only likes for v1.</p>
      </header>

      <section className="account__panel__SW1ad">
        {likedProducts.length > 0 ? (
          <div className="account__grid__SW1ag">
            {likedProducts.map((product) => (
              <article className="account__product__SW1ah" key={product.likeId}>
                <div className="account__product-media__SW1ai">
                  {product.imageUrl ? (
                    <Image
                      alt=""
                      fill
                      sizes="(max-width: 760px) 100vw, 16rem"
                      src={product.imageUrl}
                      unoptimized
                    />
                  ) : null}
                </div>
                <strong>{product.name ?? product.slug}</strong>
                <form action={unlikeProductAction.bind(null, safeLocale, product.productId)}>
                  <button className="account__text-button__SW1aj" type="submit">
                    Remove
                  </button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <p className="account__muted__SW1aa">No liked products yet.</p>
        )}
      </section>
    </div>
  );
}
