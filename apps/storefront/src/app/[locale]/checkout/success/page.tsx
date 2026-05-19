import { getCheckoutOrderStatus } from "@snn/commerce";
import { isLocale, type Locale } from "@snn/i18n";
import { LinkButton } from "@snn/ui";

import { StorefrontBrandLogo } from "../../components/storefront-brand";

type CheckoutSuccessPageProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    order?: string;
    redirect_status?: string;
  }>;
};

const successCopy = {
  da: {
    continueShopping: "Fortsat med at handle",
    errorBody: "Vi kunne ikke finde en bekraeftet Stripe-betaling for denne ordre endnu.",
    errorEyebrow: "Betaling ikke bekraeftet",
    errorTitle: "Vi tjekker betalingen",
    eyebrow: "Betaling modtaget",
    home: "Til forsiden",
    orderLabel: "Ordre",
    pendingBody: "Din betaling er modtaget hos Stripe og afventer endelig bekraeftelse.",
    pendingEyebrow: "Betaling afventer",
    pendingTitle: "Ordren bliver bekraeftet",
    title: "Tak for din ordre",
    body: "Din Stripe sandbox-betaling er gennemført, og ordren er sendt videre til behandling.",
  },
  en: {
    continueShopping: "Continue shopping",
    errorBody: "We could not find a confirmed Stripe payment for this order yet.",
    errorEyebrow: "Payment not confirmed",
    errorTitle: "We are checking the payment",
    eyebrow: "Payment received",
    home: "Back home",
    orderLabel: "Order",
    pendingBody: "Your payment was received by Stripe and is waiting for final confirmation.",
    pendingEyebrow: "Payment pending",
    pendingTitle: "The order is being confirmed",
    title: "Thank you for your order",
    body: "Your Stripe sandbox payment was completed, and the order has been sent for processing.",
  },
} as const;

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: CheckoutSuccessPageProps) {
  const { locale } = await params;
  const { order } = await searchParams;
  const safeLocale: Locale = isLocale(locale) ? locale : "da";
  const copy = successCopy[safeLocale];
  const status = order ? await getCheckoutOrderStatus(order) : null;
  const isConfirmed = status?.orderStatus === "confirmed" || status?.paymentStatus === "captured";
  const isPending = Boolean(status && !isConfirmed);
  const eyebrow = isConfirmed ? copy.eyebrow : isPending ? copy.pendingEyebrow : copy.errorEyebrow;
  const title = isConfirmed ? copy.title : isPending ? copy.pendingTitle : copy.errorTitle;
  const body = isConfirmed ? copy.body : isPending ? copy.pendingBody : copy.errorBody;

  return (
    <>
      <header className="checkoutHeader__root__SW6d2">
        <a href={`/${safeLocale}`}>
          <StorefrontBrandLogo className="checkoutHeader__logo__SW6d3" />
        </a>
      </header>
      <main className="checkoutSuccess__root__SW6f0">
        <section className="checkoutSuccess__panel__SW6f1">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>
            {body}
          </span>
          {status ? (
            <dl>
              <div>
                <dt>{copy.orderLabel}</dt>
                <dd>{status.orderNumber}</dd>
              </div>
            </dl>
          ) : null}
          <div>
            <LinkButton href={`/${safeLocale}/products`} size="lg">
              {copy.continueShopping}
            </LinkButton>
            <LinkButton href={`/${safeLocale}`} size="lg" tone="secondary">
              {copy.home}
            </LinkButton>
          </div>
        </section>
      </main>
    </>
  );
}
