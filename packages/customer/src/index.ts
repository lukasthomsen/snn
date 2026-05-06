import { and, count, desc, eq, gt, isNull, ne, or, sql } from "drizzle-orm";

import { auth } from "@snn/auth/server";
import { getDb, schema } from "@snn/db";

type PrivacyRequestType = "access" | "portability" | "deletion" | "rectification";

type CustomerUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null | undefined;
  twoFactorEnabled?: boolean | undefined;
  banned?: boolean | undefined;
};

type CustomerSessionData = {
  session: {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null | undefined;
    userAgent?: string | null | undefined;
  };
  user: CustomerUser;
};

export type AddressInput = {
  label?: string | null | undefined;
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  company?: string | null | undefined;
  line1: string;
  line2?: string | null | undefined;
  postalCode: string;
  city: string;
  region?: string | null | undefined;
  countryCode: string;
  phone?: string | null | undefined;
  isDefaultShipping?: boolean | undefined;
  isDefaultBilling?: boolean | undefined;
};

export type ProfileInput = {
  firstName?: string | null | undefined;
  lastName?: string | null | undefined;
  phone?: string | null | undefined;
};

export class CustomerAuthError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "AUTH_REQUIRED"
      | "BANNED"
      | "EMAIL_UNVERIFIED"
      | "FRESH_SESSION_REQUIRED"
      | "STAFF_REQUIRED"
      | "MFA_REQUIRED",
  ) {
    super(message);
    this.name = "CustomerAuthError";
  }
}

const freshSessionMaxAgeMs = 15 * 60 * 1000;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const [firstName, ...rest] = parts;

  return {
    firstName: firstName ?? null,
    lastName: rest.length > 0 ? rest.join(" ") : null,
  };
}

function nullableText(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function assertCountryCode(value: string) {
  const countryCode = value.trim().toUpperCase();

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    throw new Error("Country code must be ISO 3166-1 alpha-2.");
  }

  return countryCode;
}

async function claimVerifiedEmailOrders(user: CustomerUser, profileId: string) {
  if (!user.emailVerified) {
    return;
  }

  const email = normalizeEmail(user.email);

  await getDb()
    .update(schema.orders)
    .set({
      customerId: profileId,
      updatedAt: new Date(),
    })
    .where(
      and(
        sql`lower(${schema.orders.email}) = ${email}`,
        isNull(schema.orders.customerId),
      ),
    );
}

export async function getCustomerSession(headers: Headers) {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    return null;
  }

  return session as CustomerSessionData;
}

export async function requireCustomerSession(headers: Headers) {
  const session = await getCustomerSession(headers);

  if (!session) {
    throw new CustomerAuthError("A signed-in customer session is required.", "AUTH_REQUIRED");
  }

  if (session.user.banned) {
    throw new CustomerAuthError("This customer account is unavailable.", "BANNED");
  }

  if (!session.user.emailVerified) {
    throw new CustomerAuthError(
      "A verified email address is required for customer account access.",
      "EMAIL_UNVERIFIED",
    );
  }

  return session;
}

export async function requireFreshCustomerSession(headers: Headers) {
  const session = await requireCustomerSession(headers);
  const createdAt = new Date(session.session.createdAt).getTime();

  if (!Number.isFinite(createdAt) || Date.now() - createdAt > freshSessionMaxAgeMs) {
    throw new CustomerAuthError(
      "A recent sign-in is required for this action.",
      "FRESH_SESSION_REQUIRED",
    );
  }

  return session;
}

export async function ensureCustomerProfile(user: CustomerUser) {
  const db = getDb();
  const email = normalizeEmail(user.email);
  const [profileByEmail] = await db
    .select()
    .from(schema.customerProfiles)
    .where(eq(schema.customerProfiles.email, email))
    .limit(1);

  if (profileByEmail) {
    if (profileByEmail.userId !== user.id) {
      const [updatedProfile] = await db
        .update(schema.customerProfiles)
        .set({
          userId: user.id,
          updatedAt: new Date(),
        })
        .where(eq(schema.customerProfiles.id, profileByEmail.id))
        .returning();

      const profile = updatedProfile ?? profileByEmail;

      await claimVerifiedEmailOrders(user, profile.id);

      return profile;
    }

    await claimVerifiedEmailOrders(user, profileByEmail.id);

    return profileByEmail;
  }

  const [profileByUser] = await db
    .select()
    .from(schema.customerProfiles)
    .where(eq(schema.customerProfiles.userId, user.id))
    .limit(1);

  if (profileByUser) {
    const [updatedProfile] = await db
      .update(schema.customerProfiles)
      .set({
        email,
        updatedAt: new Date(),
      })
      .where(eq(schema.customerProfiles.id, profileByUser.id))
      .returning();

    const profile = updatedProfile ?? profileByUser;

    await claimVerifiedEmailOrders(user, profile.id);

    return profile;
  }

  const { firstName, lastName } = splitName(user.name);
  const [createdProfile] = await db
    .insert(schema.customerProfiles)
    .values({
      email,
      firstName,
      lastName,
      userId: user.id,
    })
    .returning();

  if (!createdProfile) {
    throw new Error("Failed to create customer profile.");
  }

  await claimVerifiedEmailOrders(user, createdProfile.id);

  return createdProfile;
}

export async function getCustomerOrders(user: CustomerUser) {
  const db = getDb();
  const profile = await ensureCustomerProfile(user);
  const orderVisibility = user.emailVerified
    ? or(
        eq(schema.orders.customerId, profile.id),
        sql`lower(${schema.orders.email}) = ${normalizeEmail(user.email)}`,
      )
    : eq(schema.orders.customerId, profile.id);

  return db
    .select({
      id: schema.orders.id,
      orderNumber: schema.orders.orderNumber,
      status: schema.orders.status,
      currencyCode: schema.orders.currencyCode,
      email: schema.orders.email,
      totalAmount: schema.orders.totalAmount,
      placedAt: schema.orders.placedAt,
    })
    .from(schema.orders)
    .where(orderVisibility)
    .orderBy(desc(schema.orders.placedAt))
    .limit(50);
}

export async function getCustomerAddresses(user: CustomerUser) {
  const db = getDb();
  const profile = await ensureCustomerProfile(user);

  return db
    .select()
    .from(schema.addresses)
    .where(eq(schema.addresses.customerId, profile.id))
    .orderBy(desc(schema.addresses.updatedAt));
}

async function clearDefaultAddressFlags(
  customerId: string,
  flags: {
    billing?: boolean | undefined;
    shipping?: boolean | undefined;
  },
  exceptAddressId: string,
) {
  if (!flags.billing && !flags.shipping) {
    return;
  }

  await getDb()
    .update(schema.addresses)
    .set({
      ...(flags.billing ? { isDefaultBilling: false } : {}),
      ...(flags.shipping ? { isDefaultShipping: false } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(schema.addresses.customerId, customerId),
        ne(schema.addresses.id, exceptAddressId),
      ),
    );
}

export async function upsertCustomerAddress(
  user: CustomerUser,
  input: AddressInput,
  addressId?: string | undefined,
) {
  const db = getDb();
  const profile = await ensureCustomerProfile(user);
  const values = {
    customerId: profile.id,
    label: nullableText(input.label),
    firstName: nullableText(input.firstName),
    lastName: nullableText(input.lastName),
    company: nullableText(input.company),
    line1: input.line1.trim(),
    line2: nullableText(input.line2),
    postalCode: input.postalCode.trim(),
    city: input.city.trim(),
    region: nullableText(input.region),
    countryCode: assertCountryCode(input.countryCode),
    phone: nullableText(input.phone),
    isDefaultShipping: input.isDefaultShipping ?? false,
    isDefaultBilling: input.isDefaultBilling ?? false,
    updatedAt: new Date(),
  };

  if (!values.line1 || !values.postalCode || !values.city) {
    throw new Error("Address line, postal code, and city are required.");
  }

  if (addressId) {
    const [updatedAddress] = await db
      .update(schema.addresses)
      .set(values)
      .where(and(eq(schema.addresses.id, addressId), eq(schema.addresses.customerId, profile.id)))
      .returning();

    if (updatedAddress) {
      await clearDefaultAddressFlags(
        profile.id,
        {
          billing: updatedAddress.isDefaultBilling,
          shipping: updatedAddress.isDefaultShipping,
        },
        updatedAddress.id,
      );
    }

    return updatedAddress;
  }

  const [createdAddress] = await db
    .insert(schema.addresses)
    .values(values)
    .returning();

  if (createdAddress) {
    await clearDefaultAddressFlags(
      profile.id,
      {
        billing: createdAddress.isDefaultBilling,
        shipping: createdAddress.isDefaultShipping,
      },
      createdAddress.id,
    );
  }

  return createdAddress;
}

export async function deleteCustomerAddress(user: CustomerUser, addressId: string) {
  const db = getDb();
  const profile = await ensureCustomerProfile(user);

  await db
    .delete(schema.addresses)
    .where(and(eq(schema.addresses.id, addressId), eq(schema.addresses.customerId, profile.id)));
}

export async function updateCustomerProfile(user: CustomerUser, input: ProfileInput) {
  const db = getDb();
  const profile = await ensureCustomerProfile(user);
  const [updatedProfile] = await db
    .update(schema.customerProfiles)
    .set({
      firstName: nullableText(input.firstName),
      lastName: nullableText(input.lastName),
      phone: nullableText(input.phone),
      updatedAt: new Date(),
    })
    .where(eq(schema.customerProfiles.id, profile.id))
    .returning();

  return updatedProfile ?? profile;
}

export async function getCustomerLikedProducts(user: CustomerUser, locale: string) {
  const db = getDb();

  return db
    .select({
      likeId: schema.customerProductLikes.id,
      productId: schema.products.id,
      slug: schema.products.slug,
      name: schema.productTranslations.name,
      imageUrl: schema.products.featuredImageUrl,
      likedAt: schema.customerProductLikes.createdAt,
    })
    .from(schema.customerProductLikes)
    .innerJoin(schema.products, eq(schema.customerProductLikes.productId, schema.products.id))
    .leftJoin(
      schema.productTranslations,
      and(
        eq(schema.productTranslations.productId, schema.products.id),
        eq(schema.productTranslations.locale, locale),
      ),
    )
    .where(eq(schema.customerProductLikes.userId, user.id))
    .orderBy(desc(schema.customerProductLikes.createdAt))
    .limit(100);
}

export async function likeCustomerProduct(user: CustomerUser, productId: string) {
  await getDb()
    .insert(schema.customerProductLikes)
    .values({
      productId,
      userId: user.id,
    })
    .onConflictDoNothing({
      target: [
        schema.customerProductLikes.userId,
        schema.customerProductLikes.productId,
      ],
    });
}

export async function unlikeCustomerProduct(user: CustomerUser, productId: string) {
  await getDb()
    .delete(schema.customerProductLikes)
    .where(
      and(
        eq(schema.customerProductLikes.userId, user.id),
        eq(schema.customerProductLikes.productId, productId),
      ),
    );
}

export async function createPrivacyRequest(
  user: CustomerUser,
  type: PrivacyRequestType,
  notes?: string | null | undefined,
) {
  const db = getDb();
  const [request] = await db
    .insert(schema.privacyRequests)
    .values({
      email: normalizeEmail(user.email),
      notes: nullableText(notes),
      type,
      userId: user.id,
    })
    .returning();

  await db.insert(schema.auditLogs).values({
    action: "privacy_request.created",
    actorType: "customer",
    actorUserId: user.id,
    entityId: request?.id ?? user.id,
    entityType: "privacy_request",
    metadata: {
      requestType: type,
    },
  });

  return request;
}

export async function getCustomerSecurityState(user: CustomerUser) {
  const db = getDb();
  const [passkeyCount] = await db
    .select({ value: count() })
    .from(schema.passkeys)
    .where(eq(schema.passkeys.userId, user.id));
  const activeSessions = await db
    .select({
      id: schema.sessions.id,
      token: schema.sessions.token,
      ipAddress: schema.sessions.ipAddress,
      userAgent: schema.sessions.userAgent,
      createdAt: schema.sessions.createdAt,
      expiresAt: schema.sessions.expiresAt,
    })
    .from(schema.sessions)
    .where(and(eq(schema.sessions.userId, user.id), gt(schema.sessions.expiresAt, new Date())))
    .orderBy(desc(schema.sessions.updatedAt))
    .limit(10);

  return {
    activeSessions,
    emailVerified: user.emailVerified,
    passkeyCount: passkeyCount?.value ?? 0,
    twoFactorEnabled: user.twoFactorEnabled === true,
  };
}

export async function revokeCustomerSession(user: CustomerUser, token: string) {
  await getDb()
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.userId, user.id), eq(schema.sessions.token, token)));
}

export async function getCustomerAccountOverview(user: CustomerUser, locale: string) {
  const [profile, addresses, orders, likedProducts, security] = await Promise.all([
    ensureCustomerProfile(user),
    getCustomerAddresses(user),
    getCustomerOrders(user),
    getCustomerLikedProducts(user, locale),
    getCustomerSecurityState(user),
  ]);

  return {
    addresses,
    likedProducts,
    orders,
    profile,
    security,
  };
}

export async function getStaffAccess(headers: Headers) {
  const session = await requireCustomerSession(headers);

  const db = getDb();
  const [assignment] = await db
    .select({
      assignmentId: schema.staffAssignments.id,
      roleCode: schema.staffRoles.code,
      roleName: schema.staffRoles.name,
    })
    .from(schema.staffAssignments)
    .innerJoin(schema.staffRoles, eq(schema.staffAssignments.roleId, schema.staffRoles.id))
    .where(
      and(
        eq(schema.staffAssignments.userId, session.user.id),
        eq(schema.staffAssignments.status, "active"),
      ),
    )
    .limit(1);

  if (!assignment) {
    throw new CustomerAuthError("Admin access requires an active staff assignment.", "STAFF_REQUIRED");
  }

  if (session.user.twoFactorEnabled !== true) {
    throw new CustomerAuthError("Staff admin access requires MFA.", "MFA_REQUIRED");
  }

  return {
    assignment,
    session,
  };
}
