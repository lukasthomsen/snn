"use client";

import Link from "next/link";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  BadgePercentIcon,
  Button,
  Clock3Icon,
  Modal,
  NotebookTextIcon,
  PackageOpenIcon,
  Select,
  TextField,
} from "@snn/ui";

import { StorefrontBrandLogo } from "./storefront-brand";
import { StorefrontCard } from "./storefront-card";

type SignupFormState = {
  day: string;
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  month: string;
  year: string;
};

const initialFormState: SignupFormState = {
  day: "",
  email: "",
  firstName: "",
  gender: "",
  lastName: "",
  month: "",
  year: "",
};

const newsletterContent = {
  da: {
    agreement:
      "Ved at tilmelde dig accepterer du at modtage SNN e-mails, tilbud og produktnyheder.",
    birthDay: "Dag",
    birthMonth: "Måned",
    birthYear: "År",
    close: "Luk e-mail tilmelding",
    email: "E-mailadresse",
    firstName: "Fornavn",
    gender: "Køn",
    genderPlaceholder: "Vælg køn",
    genderOptions: ["Kvinde", "Mand", "Non-binær", "Foretrækker ikke at sige"],
    lastName: "Efternavn",
    monthOptions: [
      "Januar",
      "Februar",
      "Marts",
      "April",
      "Maj",
      "Juni",
      "Juli",
      "August",
      "September",
      "Oktober",
      "November",
      "December",
    ],
    privacy: "Privatlivspolitik",
    submit: "Tilmeld dig",
    success: "Tak. Du er på listen.",
    subtitle:
      "Nyhedsbrevet er til tidlige lanceringer, bedre rutiner og små fordele før alle andre.",
    title: "Kom først ind. Få 10% rabat.",
    valueCards: [
      {
        copy: "Træning, restitution og ingrediensnoter med praktiske takeaways, ikke bare endnu en fuld inbox.",
        title: "Medlemsnoter",
      },
      {
        copy: "Tidlige alerts om begrænsede serier, restocks og lanceringer, så du kan nå dem først.",
        title: "Produktdrops",
      },
      {
        copy: "Din velkomstmail indeholder en kode til din første ordre og holder rabatten nem at finde.",
        title: "10% rabat",
      },
      {
        copy: "Profilfelterne hjælper os med at sende færre, skarpere opdateringer på de tidspunkter, der giver mening.",
        title: "Bedre timing",
      },
    ],
  },
  en: {
    agreement:
      "By submitting this form, you agree to receive SNN emails, offers, and product updates.",
    birthDay: "Day",
    birthMonth: "Month",
    birthYear: "Year",
    close: "Close email sign up",
    email: "Email address",
    firstName: "First name",
    gender: "Gender",
    genderPlaceholder: "Choose a gender",
    genderOptions: ["Woman", "Man", "Non-binary", "Prefer not to say"],
    lastName: "Last name",
    monthOptions: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    privacy: "Privacy Policy",
    submit: "Sign up",
    success: "Thanks. You are on the list.",
    subtitle:
      "The newsletter is for early launches, better routines, and small advantages before everyone else.",
    title: "Get in first. Take 10% off.",
    valueCards: [
      {
        copy: "Training, recovery, and ingredient notes with practical takeaways, not another crowded inbox.",
        title: "Member notes",
      },
      {
        copy: "Early alerts for limited runs, restocks, and launch windows, so you can move before they go.",
        title: "Product drops",
      },
      {
        copy: "Your welcome email includes a code for your first order and keeps the discount easy to find.",
        title: "10% off",
      },
      {
        copy: "Profile details help us send fewer, sharper updates at moments that make more sense.",
        title: "Better timing",
      },
    ],
  },
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const newsletterValueCardIcons = [
  NotebookTextIcon,
  PackageOpenIcon,
  BadgePercentIcon,
  Clock3Icon,
] as const;

function requiredLabel(label: string) {
  return `${label} *`;
}

function createDayOptions() {
  return Array.from({ length: 31 }, (_, index) => String(index + 1));
}

function createYearOptions() {
  const currentYear = new Date().getFullYear();

  return Array.from({ length: 100 }, (_, index) => String(currentYear - index));
}

type NewsletterSignupModalProps = {
  locale: "da" | "en";
  onClose: () => void;
  open: boolean;
};

export function NewsletterSignupModal({
  locale,
  onClose,
  open,
}: NewsletterSignupModalProps) {
  const content = newsletterContent[locale];
  const dayOptions = createDayOptions();
  const yearOptions = createYearOptions();
  const [formState, setFormState] = useState<SignupFormState>(initialFormState);
  const [submitted, setSubmitted] = useState(false);
  const isFormReady =
    emailPattern.test(formState.email.trim()) &&
    formState.firstName.trim().length > 0 &&
    formState.lastName.trim().length > 0 &&
    formState.gender.length > 0;

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.currentTarget;
    const field = name as keyof SignupFormState;

    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isFormReady) {
      return;
    }

    setSubmitted(true);
  }

  return (
    <Modal
      closeLabel={content.close}
      hideHeader
      id="newsletter-signup"
      onClose={onClose}
      open={open}
      scroll="inside"
      size="full"
      title={content.title}
    >
      <div className="newsletter-modal__body__SW2nk">
        <section className="newsletter-modal__visual__SW2n3">
          <StorefrontBrandLogo className="newsletter-modal__logo__SW2n4" />
          <div className="newsletter-modal__copy__SW2n6">
            <h2>{content.title}</h2>
            <p>{content.subtitle}</p>
            <div className="newsletter-modal__value-grid__SW2n7">
              {content.valueCards.map((card, index) => {
                const ValueCardIcon = newsletterValueCardIcons[index] ?? NotebookTextIcon;

                return (
                  <StorefrontCard
                    className="newsletter-modal__value-card__SW2n8"
                    description={card.copy}
                    key={card.title}
                    showChevron={false}
                    size="medium"
                    surface="primary"
                    title={
                      <span className="newsletter-modal__value-heading__SW2nh">
                        <ValueCardIcon
                          aria-hidden="true"
                          className="newsletter-modal__value-icon__SW2ni"
                        />
                        {card.title}
                      </span>
                    }
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section className="newsletter-modal__form-panel__SW2n9">
          <form
            className="newsletter-modal__form__SW2nb"
            noValidate
            onSubmit={handleSubmit}
          >
            <TextField
              autoComplete="email"
              fullWidth
              label={requiredLabel(content.email)}
              name="email"
              onChange={handleChange}
              placeholder={content.email}
              required
              type="email"
              value={formState.email}
            />
            <div className="newsletter-modal__name-grid__SW2nc">
              <TextField
                autoComplete="given-name"
                fullWidth
                label={requiredLabel(content.firstName)}
                name="firstName"
                onChange={handleChange}
                placeholder={content.firstName}
                required
                value={formState.firstName}
              />
              <TextField
                autoComplete="family-name"
                fullWidth
                label={requiredLabel(content.lastName)}
                name="lastName"
                onChange={handleChange}
                placeholder={content.lastName}
                required
                value={formState.lastName}
              />
            </div>
            <Select
              fullWidth
              label={requiredLabel(content.gender)}
              name="gender"
              onChange={handleChange}
              required
              value={formState.gender}
            >
              <option value="">{content.genderPlaceholder}</option>
              {content.genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <div className="newsletter-modal__birth-grid__SW2nd">
              <Select
                fullWidth
                label={content.birthDay}
                name="day"
                onChange={handleChange}
                value={formState.day}
              >
                <option value="">{content.birthDay}</option>
                {dayOptions.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </Select>
              <Select
                fullWidth
                label={content.birthMonth}
                name="month"
                onChange={handleChange}
                value={formState.month}
              >
                <option value="">{content.birthMonth}</option>
                {content.monthOptions.map((month, index) => (
                  <option key={month} value={String(index + 1)}>
                    {month}
                  </option>
                ))}
              </Select>
              <Select
                fullWidth
                label={content.birthYear}
                name="year"
                onChange={handleChange}
                value={formState.year}
              >
                <option value="">{content.birthYear}</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </div>
            <p className="newsletter-modal__agreement__SW2ne">
              {content.agreement}{" "}
              <Link href={`/${locale}#privacy-policy`}>{content.privacy}</Link>.
            </p>
            <Button disabled={!isFormReady} fullWidth size="lg" type="submit">
              {content.submit}
            </Button>
            <p
              aria-live="polite"
              className="newsletter-modal__success__SW2ng"
              data-visible={submitted ? "true" : undefined}
            >
              {content.success}
            </p>
          </form>
        </section>
      </div>
    </Modal>
  );
}
