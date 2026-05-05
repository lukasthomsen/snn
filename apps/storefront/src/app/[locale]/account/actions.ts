"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import {
  createPrivacyRequest,
  deleteCustomerAddress,
  requireFreshCustomerSession,
  revokeCustomerSession,
  unlikeCustomerProduct,
  updateCustomerProfile,
  upsertCustomerAddress,
} from "@snn/customer";
import type { Locale } from "@snn/i18n";

function getText(formData: FormData, name: string) {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}

function getOptionalText(formData: FormData, name: string) {
  const value = getText(formData, name).trim();

  return value ? value : null;
}

async function getActionSession() {
  return requireFreshCustomerSession(await headers());
}

export async function updateProfileAction(locale: Locale, formData: FormData) {
  const { user } = await getActionSession();

  await updateCustomerProfile(user, {
    firstName: getOptionalText(formData, "firstName"),
    lastName: getOptionalText(formData, "lastName"),
    phone: getOptionalText(formData, "phone"),
  });

  revalidatePath(`/${locale}/account/profile`);
  revalidatePath(`/${locale}/account`);
}

export async function createAddressAction(locale: Locale, formData: FormData) {
  const { user } = await getActionSession();

  await upsertCustomerAddress(user, {
    city: getText(formData, "city"),
    countryCode: getText(formData, "countryCode") || "DK",
    firstName: getOptionalText(formData, "firstName"),
    isDefaultBilling: getText(formData, "isDefaultBilling") === "on",
    isDefaultShipping: getText(formData, "isDefaultShipping") === "on",
    label: getOptionalText(formData, "label"),
    lastName: getOptionalText(formData, "lastName"),
    line1: getText(formData, "line1"),
    line2: getOptionalText(formData, "line2"),
    phone: getOptionalText(formData, "phone"),
    postalCode: getText(formData, "postalCode"),
    region: getOptionalText(formData, "region"),
  });

  revalidatePath(`/${locale}/account/addresses`);
  revalidatePath(`/${locale}/account`);
}

export async function deleteAddressAction(locale: Locale, addressId: string) {
  const { user } = await getActionSession();

  await deleteCustomerAddress(user, addressId);

  revalidatePath(`/${locale}/account/addresses`);
  revalidatePath(`/${locale}/account`);
}

export async function createPrivacyRequestAction(locale: Locale, formData: FormData) {
  const { user } = await getActionSession();
  const type = getText(formData, "type");

  if (!["access", "portability", "deletion", "rectification"].includes(type)) {
    throw new Error("Invalid privacy request type.");
  }

  await createPrivacyRequest(
    user,
    type as "access" | "portability" | "deletion" | "rectification",
    getOptionalText(formData, "notes"),
  );

  revalidatePath(`/${locale}/account/privacy`);
}

export async function revokeSessionAction(locale: Locale, token: string) {
  const { user } = await getActionSession();

  await revokeCustomerSession(user, token);

  revalidatePath(`/${locale}/account/security`);
}

export async function unlikeProductAction(locale: Locale, productId: string) {
  const { user } = await getActionSession();

  await unlikeCustomerProduct(user, productId);

  revalidatePath(`/${locale}/account/liked`);
  revalidatePath(`/${locale}/account`);
}
