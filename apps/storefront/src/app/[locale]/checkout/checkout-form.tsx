"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import Image from "next/image";
import {
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import type { CartSnapshot } from "@snn/commerce";
import type { Locale } from "@snn/i18n";
import {
  Alert,
  Button,
  Checkbox,
  CircleHelpIcon,
  CreditCardIcon,
  InputGroup,
  LockKeyholeIcon,
  SearchIcon,
  Select,
  ShoppingBagIcon,
  TextField,
} from "@snn/ui";

import type { CheckoutPrefill } from "../cart-data";
import { formatCartMoney } from "../components/cart-shared";
import {
  finalizeCheckoutPayment,
  prepareCheckoutPayment,
} from "./actions";

type CheckoutFormProps = {
  cart: CartSnapshot;
  locale: Locale;
  prefill: CheckoutPrefill;
  publishableKey: string | null;
  signInHref: string;
};

type PreparedPayment = {
  clientSecret: string;
  orderId: string;
  orderNumber: string;
  paymentIntentId: string;
};

const stripeAppearance = {
  theme: "stripe",
  variables: {
    borderRadius: "4px",
    colorDanger: "#b42318",
    colorPrimary: "#5f8fdd",
    colorText: "#171717",
    fontFamily: "inherit",
    spacingUnit: "4px",
  },
} satisfies NonNullable<StripeElementsOptions["appearance"]>;

const checkoutCopy = {
  da: {
    addressLine1: "Adresse 1",
    addressLine2: "Adresse 2 eller virksomhed (valgfri)",
    apply: "Anvend",
    billing: "Brug leveringsadressen som faktureringsadresse",
    cardUnavailable: "Stripe sandbox er ikke konfigureret i dette miljo.",
    city: "By",
    contact: "Kontakt",
    continueToPayment: "Fortsat til betaling",
    country: "Land/region",
    delivery: "Levering",
    discount: "Rabatkode eller gavekort",
    discountPending: "Rabatkoder er klar i UI'et, men validering tilkobles senere.",
    email: "E-mail",
    firstName: "Fornavn",
    free: "Gratis",
    includingTaxes: "Inklusive moms",
    lastName: "Efternavn",
    legal: "Ved at placere din ordre accepterer du SNNs handelsbetingelser, privatlivsmeddelelse og cookiepolitik.",
    legalLinks: ["Returnering og refusion", "Privatlivsmeddelelse", "Handelsbetingelser"],
    marketing: "Tick here to receive emails about our products, apps, sales, exclusive content and more.",
    orderSummary: "Ordreoversigt",
    payNow: "Betal nu",
    payment: "Betaling",
    paymentCopy: "Kortoplysninger krypteres af Stripe og rammer aldrig SNNs servere.",
    paymentIntro: "Fuldfør kontakt og levering for at hente de sikre Stripe-felter.",
    paymentReady: "Sikker kortbetaling",
    phone: "Telefon",
    postalCode: "Postnummer",
    preparing: "Henter betaling",
    privacy: "Se vores privatlivspolitik.",
    secure: "Stripe sandbox",
    shipping: "Fragt",
    shippingAddressShort: "Bekræftes efter betaling",
    shippingReady: "Gratis standardfragt er valgt for denne ordre.",
    signIn: "Log ind",
    subtotal: "Subtotal",
    total: "Total",
  },
  en: {
    addressLine1: "Address line 1",
    addressLine2: "Address line 2 or company (optional)",
    apply: "Apply",
    billing: "Use shipping address as billing address",
    cardUnavailable: "Stripe sandbox is not configured in this environment.",
    city: "City",
    contact: "Contact",
    continueToPayment: "Continue to payment",
    country: "Country/region",
    delivery: "Delivery",
    discount: "Discount code or gift card",
    discountPending: "Discount codes are ready in the UI, but validation will be connected later.",
    email: "Email",
    firstName: "First name",
    free: "Free",
    includingTaxes: "Including taxes",
    lastName: "Last name",
    legal: "By placing your order you agree to SNN's Terms & Conditions, Privacy Notice and Cookie Policy.",
    legalLinks: ["Returns & Refunds", "Privacy Notice", "Terms & Conditions"],
    marketing: "Tick here to receive emails about our products, apps, sales, exclusive content and more.",
    orderSummary: "Order summary",
    payNow: "Pay now",
    payment: "Payment",
    paymentCopy: "Card details are encrypted by Stripe and never touch SNN servers.",
    paymentIntro: "Complete contact and delivery to load secure Stripe fields.",
    paymentReady: "Secure card payment",
    phone: "Phone",
    postalCode: "Postal code",
    preparing: "Preparing payment",
    privacy: "View our Privacy Policy.",
    secure: "Stripe sandbox",
    shipping: "Shipping",
    shippingAddressShort: "Confirmed after payment",
    shippingReady: "Free standard shipping is selected for this order.",
    signIn: "Sign in",
    subtotal: "Subtotal",
    total: "Total",
  },
} as const;

function getFormString(formData: FormData, name: string) {
  return String(formData.get(name) ?? "");
}

function collectCheckoutContact(form: HTMLFormElement) {
  const formData = new FormData(form);

  return {
    addressLine1: getFormString(formData, "line1"),
    addressLine2: getFormString(formData, "line2"),
    city: getFormString(formData, "city"),
    countryCode: getFormString(formData, "countryCode") || "DK",
    email: getFormString(formData, "email"),
    firstName: getFormString(formData, "firstName"),
    lastName: getFormString(formData, "lastName"),
    phone: getFormString(formData, "phone"),
    postalCode: getFormString(formData, "postalCode"),
  };
}

function CheckoutPaymentElement({
  copy,
  locale,
  onError,
  orderId,
  paymentIntentId,
}: {
  copy: (typeof checkoutCopy)[Locale];
  locale: Locale;
  onError: (message: string) => void;
  orderId: string;
  paymentIntentId: string;
}) {
  const elements = useElements();
  const stripe = useStripe();
  const [isPaying, setIsPaying] = useState(false);

  async function handlePayment() {
    if (!stripe || !elements) {
      onError("Stripe is still loading. Please try again in a moment.");
      return;
    }

    setIsPaying(true);
    onError("");

    const { error: submitError } = await elements.submit();

    if (submitError) {
      onError(submitError.message ?? "Please check your payment details.");
      setIsPaying(false);
      return;
    }

    const successUrl = `${window.location.origin}/${locale}/checkout/success?order=${orderId}`;
    const { error, paymentIntent } = await stripe.confirmPayment({
      confirmParams: {
        return_url: successUrl,
      },
      elements,
      redirect: "if_required",
    });

    if (error) {
      const failedIntentId = error.payment_intent?.id ?? paymentIntentId;

      if (failedIntentId) {
        await finalizeCheckoutPayment(failedIntentId);
      }

      onError(error.message ?? "Stripe could not confirm the payment.");
      setIsPaying(false);
      return;
    }

    if (!paymentIntent) {
      onError("Stripe did not return a payment status. Please try again.");
      setIsPaying(false);
      return;
    }

    const finalized = await finalizeCheckoutPayment(paymentIntent.id);

    if (!finalized.ok || finalized.paymentStatus !== "captured") {
      onError(finalized.ok ? "Payment is still pending. Please try again." : finalized.error);
      setIsPaying(false);
      return;
    }

    window.location.assign(successUrl);
  }

  return (
    <div className="checkoutStripe__root__SW6e0">
      <PaymentElement />
      <Button
        disabled={!stripe || !elements || isPaying}
        fullWidth
        loading={isPaying}
        onPress={handlePayment}
        size="lg"
        type="button"
      >
        {copy.payNow}
      </Button>
    </div>
  );
}

export function CheckoutForm({
  cart,
  locale,
  prefill,
  publishableKey,
  signInHref,
}: CheckoutFormProps) {
  const copy = checkoutCopy[locale];
  const formRef = useRef<HTMLFormElement | null>(null);
  const paymentSectionRef = useRef<HTMLElement | null>(null);
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<PreparedPayment | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const stripePromise = useMemo(
    () => (publishableKey ? loadStripe(publishableKey) : null),
    [publishableKey],
  );
  const stripeOptions = useMemo<StripeElementsOptions | undefined>(
    () => (payment
      ? {
          appearance: stripeAppearance,
          clientSecret: payment.clientSecret,
          loader: "auto",
        }
      : undefined),
    [payment],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (payment || isPreparing) {
      return;
    }

    const form = event.currentTarget;

    if (!form.reportValidity()) {
      return;
    }

    if (!publishableKey) {
      setMessage(copy.cardUnavailable);
      return;
    }

    setIsPreparing(true);
    setMessage(null);

    const result = await prepareCheckoutPayment(locale, collectCheckoutContact(form), cart.total);

    if (!result.ok) {
      setMessage(result.error);
      setIsPreparing(false);
      return;
    }

    setPayment({
      clientSecret: result.clientSecret,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
      paymentIntentId: result.paymentIntentId,
    });
    setIsPreparing(false);

    window.requestAnimationFrame(() => {
      paymentSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <main
      className="checkout__root__SW5i0"
      data-perf-ready="true"
      data-perf-surface="checkout"
      data-perf-updating={isPreparing ? "true" : "false"}
    >
      <form className="checkout__form__SW6b0" onSubmit={handleSubmit} ref={formRef}>
        <section className="checkoutPanel__root__SW6e1">
          <div className="checkoutPanel__heading__SW6e2">
            <div>
              <h2>{copy.contact}</h2>
            </div>
            {prefill.signedIn ? null : <a href={signInHref}>{copy.signIn}</a>}
          </div>
          <TextField
            autoComplete="email"
            defaultValue={prefill.email}
            fullWidth
            name="email"
            placeholder={copy.email}
            required
            type="email"
          />
          <Checkbox label={copy.marketing} name="acceptsMarketing" />
          <p className="checkoutSection__copy__SW6b6">
            <a href={`/${locale}/privacy`}>{copy.privacy}</a>
          </p>
        </section>

        <section className="checkoutPanel__root__SW6e1">
          <div className="checkoutPanel__heading__SW6e2">
            <h2>{copy.delivery}</h2>
          </div>
          <Select
            defaultValue={prefill.countryCode}
            fullWidth
            label={copy.country}
            name="countryCode"
            required
          >
            <option value="DK">Denmark</option>
          </Select>
          <div className="checkoutGrid__root__SW6b8">
            <TextField
              autoComplete="given-name"
              defaultValue={prefill.firstName}
              fullWidth
              name="firstName"
              placeholder={copy.firstName}
              required
            />
            <TextField
              autoComplete="family-name"
              defaultValue={prefill.lastName}
              fullWidth
              name="lastName"
              placeholder={copy.lastName}
              required
            />
          </div>
          <InputGroup
            autoComplete="address-line1"
            defaultValue={prefill.line1}
            fullWidth
            name="line1"
            placeholder={copy.addressLine1}
            required
            suffix={<SearchIcon />}
          />
          <TextField
            autoComplete="address-line2"
            defaultValue={prefill.line2}
            fullWidth
            name="line2"
            placeholder={copy.addressLine2}
          />
          <div className="checkoutGrid__root__SW6b8">
            <TextField
              autoComplete="postal-code"
              defaultValue={prefill.postalCode}
              fullWidth
              name="postalCode"
              placeholder={copy.postalCode}
              required
            />
            <TextField
              autoComplete="address-level2"
              defaultValue={prefill.city}
              fullWidth
              name="city"
              placeholder={copy.city}
              required
            />
          </div>
          <InputGroup
            autoComplete="tel"
            defaultValue={prefill.phone}
            fullWidth
            name="phone"
            placeholder={copy.phone}
            required
            suffix={<CircleHelpIcon />}
            type="tel"
          />
        </section>

        <section className="checkoutPanel__root__SW6e1">
          <div className="checkoutPanel__heading__SW6e2">
            <h2>{copy.shipping}</h2>
          </div>
          <div className="checkoutShipping__root__SW6e3">
            <span>{copy.free}</span>
            <p>{copy.shippingReady}</p>
          </div>
        </section>

        <section className="checkoutPanel__root__SW6e1" ref={paymentSectionRef}>
          <div className="checkoutPanel__heading__SW6e2">
            <div>
              <h2>{copy.payment}</h2>
              <p>{copy.paymentCopy}</p>
            </div>
            <span className="checkoutBadge__root__SW6e4">
              <LockKeyholeIcon />
              {copy.secure}
            </span>
          </div>
          <div
            className="checkoutPayment__root__SW6c1"
            data-perf-ready={payment ? "true" : "false"}
            data-perf-surface="checkout-payment"
            data-ready={payment ? "true" : undefined}
          >
            <div className="checkoutPayment__summary__SW6e5">
              <CreditCardIcon />
              <div>
                <strong>{payment ? copy.paymentReady : copy.payment}</strong>
                <p>{payment ? payment.orderNumber : copy.paymentIntro}</p>
              </div>
            </div>
            {payment && stripePromise && stripeOptions ? (
              <Elements key={payment.clientSecret} options={stripeOptions} stripe={stripePromise}>
                <CheckoutPaymentElement
                  copy={copy}
                  locale={locale}
                  onError={setMessage}
                  orderId={payment.orderId}
                  paymentIntentId={payment.paymentIntentId}
                />
              </Elements>
            ) : null}
          </div>
        </section>

        <section className="checkoutLegal__root__SW6c4">
          <Checkbox defaultChecked label={copy.billing} />
          <p>{copy.legal}</p>
          {message || !publishableKey ? (
            <Alert>{message ?? copy.cardUnavailable}</Alert>
          ) : null}
          {!payment ? (
            <Button
              disabled={isPreparing || !publishableKey}
              fullWidth
              loading={isPreparing}
              size="lg"
              type="submit"
            >
              {isPreparing ? copy.preparing : copy.continueToPayment}
            </Button>
          ) : null}
          <div>
            {copy.legalLinks.map((link) => (
              <a
                href={/privacy|privatliv/i.test(link) ? `/${locale}/privacy` : `/${locale}#footer`}
                key={link}
              >
                {link}
              </a>
            ))}
          </div>
        </section>
      </form>

      <aside className="checkoutSummary__root__SW6c6" aria-label={copy.orderSummary}>
        <div className="checkoutSummary__inner__SW6e6">
          <div className="checkoutSummary__heading__SW6e7">
            <h2>{copy.orderSummary}</h2>
            <span>{cart.itemCount}</span>
          </div>

          <div className="checkoutSummary__lines__SW6c7">
            {cart.lines.map((line) => (
              <article className="checkoutSummary__line__SW6c8" key={line.id}>
                <span className="checkoutSummary__media__SW6c9">
                  {line.imageUrl ? (
                    <Image
                      alt=""
                      fill
                      sizes="70px"
                      src={line.imageUrl}
                      unoptimized
                    />
                  ) : (
                    <ShoppingBagIcon size={20} />
                  )}
                  <small>{line.quantity}</small>
                </span>
                <span>
                  <strong>{line.title}</strong>
                  {line.variantTitle ? <small>{line.variantTitle}</small> : null}
                  {line.sku ? <small>{line.sku}</small> : null}
                </span>
                <strong>{formatCartMoney(line.lineTotal, locale)}</strong>
              </article>
            ))}
          </div>

          <div className="checkoutSummary__discount__SW6d0">
            <TextField fullWidth placeholder={copy.discount} size="md" />
            <Button
              onPress={() => {
                setDiscountMessage(copy.discountPending);
              }}
              shape="field"
              size="md"
              type="button"
            >
              {copy.apply}
            </Button>
          </div>
          {discountMessage ? <p className="checkoutSummary__note__SW6e8">{discountMessage}</p> : null}

          <dl className="checkoutSummary__totals__SW6d1">
            <div>
              <dt>{copy.subtotal}</dt>
              <dd>{formatCartMoney(cart.subtotal, locale)}</dd>
            </div>
            <div>
              <dt>{copy.shipping}</dt>
              <dd>
                {cart.shipping.qualifiedForFreeShipping
                  ? copy.free
                  : copy.shippingAddressShort}
              </dd>
            </div>
            <div>
              <dt>{copy.total}</dt>
              <dd>
                <span>{cart.currencyCode}</span>
                {formatCartMoney(cart.total, locale)}
              </dd>
            </div>
          </dl>
          <p>{copy.includingTaxes}</p>
        </div>
      </aside>
    </main>
  );
}
