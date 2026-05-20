import { and, count, desc, eq, gt, inArray, isNull, ne, or, sql } from "drizzle-orm";

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

type CustomerOrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  currencyCode: string | null;
  email: string;
  totalAmount: number;
  placedAt: Date;
};

type CustomerProfileRecord = typeof schema.customerProfiles.$inferSelect;
type CustomerAddressRecord = typeof schema.addresses.$inferSelect;

export type CustomerRewardTier = {
  id: string;
  label: string;
  threshold: number;
  benefits: string[];
};

export type CustomerPointsHistoryItem = {
  id: string;
  label: string;
  description: string;
  points: number;
  occurredAt: Date;
};

export type CustomerRewardsPreview = {
  benefits: string[];
  currentTier: CustomerRewardTier;
  currentXp: number;
  history: CustomerPointsHistoryItem[];
  isLocked: boolean;
  nextTier: CustomerRewardTier | null;
  progressPercent: number;
  tiers: CustomerRewardTier[];
  xpToNextTier: number;
};

export type CustomerOrderCard = CustomerOrderSummary & {
  itemCount: number;
  items: Array<{
    id: string;
    imageUrl: string | null;
    title: string;
  }>;
  overflowItemCount: number;
};

export type CustomerDashboardAddress = Pick<
  CustomerAddressRecord,
  | "city"
  | "countryCode"
  | "firstName"
  | "lastName"
  | "line1"
  | "postalCode"
  | "updatedAt"
>;

export type CustomerDashboardOrder = Pick<
  CustomerOrderSummary,
  | "currencyCode"
  | "id"
  | "orderNumber"
  | "placedAt"
  | "status"
  | "totalAmount"
>;

export type CustomerAccountDashboard = {
  addressCount: number;
  defaultAddress: CustomerDashboardAddress | null;
  likedProductCount: number;
  orderCount: number;
  profile: CustomerProfileRecord;
  recentOrderCards: CustomerOrderCard[];
  recentOrders: CustomerDashboardOrder[];
  rewards: CustomerRewardsPreview;
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
  dateOfBirth?: string | null | undefined;
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
const previewRewardTiers: CustomerRewardTier[] = [
  {
    id: "starter",
    label: "Starter",
    threshold: 0,
    benefits: ["Unlock XP & rewards", "Track points history", "Access member-only drops"],
  },
  {
    id: "tier-1",
    label: "Tier 1",
    threshold: 500,
    benefits: ["10% birthday reward", "Anniversary reward", "Exclusive offers"],
  },
  {
    id: "tier-2",
    label: "Tier 2",
    threshold: 1250,
    benefits: ["15% birthday reward", "Early product access", "Double XP moments"],
  },
  {
    id: "tier-3",
    label: "Tier 3",
    threshold: 2500,
    benefits: ["20% seasonal reward", "Priority restock access", "Free returns windows"],
  },
  {
    id: "elite",
    label: "Elite",
    threshold: 5000,
    benefits: ["Top-tier rewards", "VIP product previews", "Highest bonus events"],
  },
];

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

function getFallbackNameFromEmail(email: string) {
  return email.split("@")[0]?.replace(/[._-]+/g, " ").trim() || "Member";
}

export function getCustomerDisplayName(
  user: CustomerUser,
  profile?: Pick<CustomerProfileRecord, "firstName" | "lastName"> | null,
) {
  const profileName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ").trim();
  const userName = user.name?.trim();

  return profileName || userName || getFallbackNameFromEmail(user.email);
}

function nullableText(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

function nullableDateOfBirth(value: string | null | undefined) {
  const dateOfBirth = nullableText(value);

  if (!dateOfBirth) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)) {
    throw new Error("Date of birth must use YYYY-MM-DD.");
  }

  const [yearText, monthText, dayText] = dateOfBirth.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("Date of birth must be a valid date.");
  }

  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  if (date.getTime() >= todayUtc) {
    throw new Error("Date of birth must be in the past.");
  }

  return dateOfBirth;
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
  const orderVisibility = getCustomerOrderVisibility(user, profile);

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

function getCustomerOrderVisibility(user: CustomerUser, profile: CustomerProfileRecord) {
  return user.emailVerified
    ? or(
        eq(schema.orders.customerId, profile.id),
        sql`lower(${schema.orders.email}) = ${normalizeEmail(user.email)}`,
      )
    : eq(schema.orders.customerId, profile.id);
}

async function getOrderCardsFromSummaries(orders: CustomerOrderSummary[]) {
  const orderIds = orders.map((order) => order.id);

  if (orderIds.length === 0) {
    return [];
  }

  const items = await getDb()
    .select({
      id: schema.orderItems.id,
      orderId: schema.orderItems.orderId,
      title: schema.orderItems.titleSnapshot,
      imageUrl: schema.products.featuredImageUrl,
      createdAt: schema.orderItems.createdAt,
    })
    .from(schema.orderItems)
    .leftJoin(schema.productVariants, eq(schema.orderItems.variantId, schema.productVariants.id))
    .leftJoin(schema.products, eq(schema.productVariants.productId, schema.products.id))
    .where(inArray(schema.orderItems.orderId, orderIds))
    .orderBy(schema.orderItems.createdAt);
  const itemsByOrder = new Map<string, typeof items>();

  for (const item of items) {
    const currentItems = itemsByOrder.get(item.orderId) ?? [];

    currentItems.push(item);
    itemsByOrder.set(item.orderId, currentItems);
  }

  return orders.map<CustomerOrderCard>((order) => {
    const orderItems = itemsByOrder.get(order.id) ?? [];
    const visibleItems = orderItems.slice(0, 3);

    return {
      ...order,
      itemCount: orderItems.length,
      items: visibleItems.map((item) => ({
        id: item.id,
        imageUrl: item.imageUrl,
        title: item.title,
      })),
      overflowItemCount: Math.max(0, orderItems.length - visibleItems.length),
    };
  });
}

export async function getCustomerOrderCards(user: CustomerUser, limit = 50) {
  const orders = await getCustomerOrders(user);

  return getOrderCardsFromSummaries(orders.slice(0, limit));
}

function buildCustomerRewardsPreviewFromStats(input: {
  addressCount: number;
  addressUpdatedAt?: Date | null | undefined;
  likedProductCount: number;
  likedProductUpdatedAt?: Date | null | undefined;
  orderCount: number;
  orderHistory: CustomerDashboardOrder[];
  profile: CustomerProfileRecord;
  security: {
    passkeyCount: number;
    twoFactorEnabled: boolean;
  };
  totalOrderAmount: number;
}) {
  const totalOrderAmount = Number(input.totalOrderAmount) || 0;
  const orderXp = input.orderCount > 0
    ? input.orderCount * 280 + Math.floor(totalOrderAmount / 100)
    : 0;
  const profileXp = 100;
  const addressXp = Math.min(input.addressCount * 50, 150);
  const likedXp = Math.min(input.likedProductCount * 20, 200);
  const securityXp =
    (input.security.passkeyCount > 0 ? 80 : 0) +
    (input.security.twoFactorEnabled ? 120 : 0);
  const currentXp = profileXp + orderXp + addressXp + likedXp + securityXp;
  const currentTier = [...previewRewardTiers]
    .reverse()
    .find((tier) => currentXp >= tier.threshold) ?? previewRewardTiers[0]!;
  const nextTier =
    previewRewardTiers.find((tier) => tier.threshold > currentXp) ?? null;
  const xpToNextTier = nextTier ? Math.max(0, nextTier.threshold - currentXp) : 0;
  const tierRange = nextTier
    ? Math.max(1, nextTier.threshold - currentTier.threshold)
    : 1;
  const progressPercent = nextTier
    ? Math.min(100, Math.max(0, ((currentXp - currentTier.threshold) / tierRange) * 100))
    : 100;
  const orderHistory = input.orderHistory.slice(0, 6).map((order) => ({
    id: `order-${order.id}`,
    label: `Order ${order.orderNumber}`,
    description: "Purchase activity",
    points: 280 + Math.floor(order.totalAmount / 100),
    occurredAt: order.placedAt,
  }));
  const history: CustomerPointsHistoryItem[] = [
    {
      id: "welcome",
      label: "Welcome XP",
      description: "Account created",
      points: profileXp,
      occurredAt: input.profile.createdAt,
    },
    ...orderHistory,
    ...(addressXp > 0
      ? [
          {
            id: "addresses",
            label: "Address book",
            description: "Saved checkout details",
            points: addressXp,
            occurredAt: input.addressUpdatedAt ?? input.profile.updatedAt,
          },
        ]
      : []),
    ...(likedXp > 0
      ? [
          {
            id: "liked-products",
            label: "Liked items",
            description: "Saved products for later",
            points: likedXp,
            occurredAt: input.likedProductUpdatedAt ?? input.profile.updatedAt,
          },
        ]
      : []),
  ].sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());

  return {
    benefits: currentTier.benefits,
    currentTier,
    currentXp,
    history,
    isLocked: currentXp < previewRewardTiers[1]!.threshold,
    nextTier,
    progressPercent,
    tiers: previewRewardTiers,
    xpToNextTier,
  } satisfies CustomerRewardsPreview;
}

function buildCustomerRewardsPreview(input: {
  addresses: CustomerAddressRecord[];
  likedProducts: Array<{ likedAt: Date }>;
  orderCards: CustomerOrderCard[];
  profile: CustomerProfileRecord;
  security: {
    passkeyCount: number;
    twoFactorEnabled: boolean;
  };
}) {
  return buildCustomerRewardsPreviewFromStats({
    addressCount: input.addresses.length,
    addressUpdatedAt: input.addresses[0]?.updatedAt,
    likedProductCount: input.likedProducts.length,
    likedProductUpdatedAt: input.likedProducts[0]?.likedAt,
    orderCount: input.orderCards.length,
    orderHistory: input.orderCards,
    profile: input.profile,
    security: input.security,
    totalOrderAmount: input.orderCards.reduce((sum, order) => sum + order.totalAmount, 0),
  });
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
  addressId?: string,
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

export async function setCustomerMainAddress(user: CustomerUser, addressId: string) {
  const db = getDb();
  const profile = await ensureCustomerProfile(user);

  await db
    .update(schema.addresses)
    .set({
      isDefaultBilling: false,
      isDefaultShipping: false,
      updatedAt: new Date(),
    })
    .where(eq(schema.addresses.customerId, profile.id));

  return db
    .update(schema.addresses)
    .set({
      isDefaultBilling: true,
      isDefaultShipping: true,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.addresses.id, addressId), eq(schema.addresses.customerId, profile.id)))
    .returning();
}

export async function updateCustomerProfile(user: CustomerUser, input: ProfileInput) {
  const db = getDb();
  const profile = await ensureCustomerProfile(user);
  const [updatedProfile] = await db
    .update(schema.customerProfiles)
    .set({
      dateOfBirth: nullableDateOfBirth(input.dateOfBirth),
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
      variantId: schema.productVariants.id,
      variantTitle: schema.productVariants.title,
      slug: schema.products.slug,
      name: schema.productTranslations.name,
      imageUrl: schema.products.featuredImageUrl,
      likedAt: schema.customerProductLikes.createdAt,
    })
    .from(schema.customerProductLikes)
    .innerJoin(schema.products, eq(schema.customerProductLikes.productId, schema.products.id))
    .innerJoin(schema.productVariants, eq(schema.customerProductLikes.variantId, schema.productVariants.id))
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

export async function getCustomerLikedProductVariantIds(user: CustomerUser, productId: string) {
  const likes = await getDb()
    .select({ variantId: schema.customerProductLikes.variantId })
    .from(schema.customerProductLikes)
    .where(
      and(
        eq(schema.customerProductLikes.userId, user.id),
        eq(schema.customerProductLikes.productId, productId),
      ),
    );

  return likes.map((like) => like.variantId);
}

export async function likeCustomerProduct(user: CustomerUser, productId: string, variantId: string) {
  await getDb()
    .insert(schema.customerProductLikes)
    .values({
      productId,
      userId: user.id,
      variantId,
    })
    .onConflictDoNothing({
      target: [
        schema.customerProductLikes.userId,
        schema.customerProductLikes.variantId,
      ],
    });
}

export async function isCustomerProductLiked(user: CustomerUser, productId: string, variantId: string) {
  const [like] = await getDb()
    .select({ id: schema.customerProductLikes.id })
    .from(schema.customerProductLikes)
    .where(
      and(
        eq(schema.customerProductLikes.userId, user.id),
        eq(schema.customerProductLikes.productId, productId),
        eq(schema.customerProductLikes.variantId, variantId),
      ),
    )
    .limit(1);

  return Boolean(like);
}

export async function unlikeCustomerProduct(user: CustomerUser, productId: string, variantId?: string) {
  const where = variantId
    ? and(
      eq(schema.customerProductLikes.userId, user.id),
      eq(schema.customerProductLikes.productId, productId),
      eq(schema.customerProductLikes.variantId, variantId),
    )
    : and(
      eq(schema.customerProductLikes.userId, user.id),
      eq(schema.customerProductLikes.productId, productId),
    );

  await getDb()
    .delete(schema.customerProductLikes)
    .where(where);
}

export async function createPrivacyRequest(
  user: CustomerUser,
  type: PrivacyRequestType,
  notes?: string | null,
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
  const passkeyCountRows = await db
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
  const linkedAccounts = await db
    .select({
      providerId: schema.accounts.providerId,
      hasPassword: sql<boolean>`${schema.accounts.password} is not null`,
    })
    .from(schema.accounts)
    .where(eq(schema.accounts.userId, user.id))
    .orderBy(schema.accounts.createdAt);
  const linkedProviders = Array.from(
    new Set(linkedAccounts.map((account) => account.providerId)),
  );
  const hasPassword = linkedAccounts.some((account) =>
    account.hasPassword ||
    account.providerId === "credential" ||
    account.providerId === "email-password",
  );
  const emailManagedByProviderIds = linkedProviders.filter((providerId) =>
    providerId === "apple" || providerId === "google",
  );
  const emailManagedByProvider = emailManagedByProviderIds.length > 0;
  const googleLinked = linkedProviders.includes("google");

  return {
    activeSessions,
    canChangeEmail: !emailManagedByProvider,
    email: user.email,
    emailManagedByProvider,
    emailManagedByProviderIds,
    emailVerified: user.emailVerified,
    googleLinked,
    hasPassword,
    linkedProviders,
    passkeyCount: passkeyCountRows[0]?.value ?? 0,
    twoFactorEnabled: user.twoFactorEnabled === true,
  };
}

export async function getCustomerAccountDashboard(user: CustomerUser) {
  const db = getDb();
  const profile = await ensureCustomerProfile(user);
  const orderVisibility = getCustomerOrderVisibility(user, profile);

  const [
    defaultAddressRows,
    recentOrderRows,
    likedProductCountRows,
    passkeyCountRows,
  ] = await Promise.all([
    db
      .select({
        addressCount: sql<number>`(count(*) over())::int`,
        city: schema.addresses.city,
        countryCode: schema.addresses.countryCode,
        firstName: schema.addresses.firstName,
        lastName: schema.addresses.lastName,
        line1: schema.addresses.line1,
        postalCode: schema.addresses.postalCode,
        updatedAt: schema.addresses.updatedAt,
      })
      .from(schema.addresses)
      .where(eq(schema.addresses.customerId, profile.id))
      .orderBy(desc(schema.addresses.isDefaultShipping), desc(schema.addresses.updatedAt))
      .limit(1),
    db
      .select({
        currencyCode: schema.orders.currencyCode,
        email: schema.orders.email,
        id: schema.orders.id,
        orderCount: sql<number>`(count(*) over())::int`,
        orderNumber: schema.orders.orderNumber,
        placedAt: schema.orders.placedAt,
        status: schema.orders.status,
        totalAmount: schema.orders.totalAmount,
        totalOrderAmount: sql<number>`coalesce(sum(${schema.orders.totalAmount}) over(), 0)::int`,
      })
      .from(schema.orders)
      .where(orderVisibility)
      .orderBy(desc(schema.orders.placedAt))
      .limit(2),
    db
      .select({ value: count() })
      .from(schema.customerProductLikes)
      .where(eq(schema.customerProductLikes.userId, user.id)),
    db
      .select({ value: count() })
      .from(schema.passkeys)
      .where(eq(schema.passkeys.userId, user.id)),
  ]);

  const [defaultAddressWithCount] = defaultAddressRows;
  const addressCount = Number(defaultAddressWithCount?.addressCount ?? 0);
  const orderCount = Number(recentOrderRows[0]?.orderCount ?? 0);
  const likedProductCount = Number(likedProductCountRows[0]?.value ?? 0);
  const totalOrderAmount = Number(recentOrderRows[0]?.totalOrderAmount ?? 0);
  const recentOrderSummaries = recentOrderRows.map((order) => ({
    currencyCode: order.currencyCode,
    email: order.email,
    id: order.id,
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    status: order.status,
    totalAmount: order.totalAmount,
  }));
  const recentOrders = recentOrderSummaries.map((order) => ({
    currencyCode: order.currencyCode,
    id: order.id,
    orderNumber: order.orderNumber,
    placedAt: order.placedAt,
    status: order.status,
    totalAmount: order.totalAmount,
  }));
  const recentOrderCards = await getOrderCardsFromSummaries(recentOrderSummaries);
  const rewards = buildCustomerRewardsPreviewFromStats({
    addressCount,
    addressUpdatedAt: defaultAddressWithCount?.updatedAt,
    likedProductCount,
    orderCount,
    orderHistory: recentOrders,
    profile,
    security: {
      passkeyCount: Number(passkeyCountRows[0]?.value ?? 0),
      twoFactorEnabled: user.twoFactorEnabled === true,
    },
    totalOrderAmount,
  });

  return {
    addressCount,
    defaultAddress: defaultAddressWithCount
      ? {
          city: defaultAddressWithCount.city,
          countryCode: defaultAddressWithCount.countryCode,
          firstName: defaultAddressWithCount.firstName,
          lastName: defaultAddressWithCount.lastName,
          line1: defaultAddressWithCount.line1,
          postalCode: defaultAddressWithCount.postalCode,
          updatedAt: defaultAddressWithCount.updatedAt,
        }
      : null,
    likedProductCount,
    orderCount,
    profile,
    recentOrderCards,
    recentOrders,
    rewards,
  } satisfies CustomerAccountDashboard;
}

export async function revokeCustomerSession(user: CustomerUser, token: string) {
  await getDb()
    .delete(schema.sessions)
    .where(and(eq(schema.sessions.userId, user.id), eq(schema.sessions.token, token)));
}

export async function getCustomerAccountOverview(user: CustomerUser, locale: string) {
  const profile = await ensureCustomerProfile(user);
  const addresses = await getCustomerAddresses(user);
  const orders = await getCustomerOrders(user);
  const likedProducts = await getCustomerLikedProducts(user, locale);
  const security = await getCustomerSecurityState(user);
  const orderCards = await getOrderCardsFromSummaries(orders);
  const rewards = buildCustomerRewardsPreview({
    addresses,
    likedProducts,
    orderCards,
    profile,
    security,
  });

  return {
    addresses,
    likedProducts,
    orderCards,
    orders,
    profile,
    rewards,
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
