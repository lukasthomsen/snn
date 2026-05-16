import { createHash } from "node:crypto";
import { existsSync } from "node:fs";

import { and, eq, inArray, isNull, like, or, sql } from "drizzle-orm";

if (existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

const shouldApply = process.argv.includes("--apply");
const isProduction =
  process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";

type CommerceModule = typeof import("@snn/commerce");
type ConfigModule = typeof import("@snn/config");
type DbModule = typeof import("@snn/db");
type MediaModule = typeof import("@snn/media");
type CommerceDb = ReturnType<DbModule["getDb"]>;
type ProductStatus = DbModule["schema"]["products"]["$inferInsert"]["status"];
type DemoMediaInput = {
  key: string;
  mediaType: "image" | "video";
  slot: number;
  slotLabel: string;
  title: string;
  tone: string;
};
type CloudflareDemoMedia = {
  byteSize: number;
  deliveryUrl: string;
  filename: string;
  height: number;
  metadata: Record<string, unknown>;
  providerAssetId: string;
  uploadedAt: string;
  width: number;
};

let buildCloudflareImageUrl: MediaModule["buildCloudflareImageUrl"];
let getCatalogHealthReport: CommerceModule["getCatalogHealthReport"];
let getCloudflareImageDetails: MediaModule["getCloudflareImageDetails"];
let getCloudflareImagesConfig: ConfigModule["getCloudflareImagesConfig"];
let recordCommerceAuditEvent: CommerceModule["recordCommerceAuditEvent"];
let closeDb: DbModule["closeDb"] | undefined;
let getDb: DbModule["getDb"];
let schema: DbModule["schema"];
let uploadCloudflareImage: MediaModule["uploadCloudflareImage"];
const cloudflareDemoMediaCache = new Map<string, Promise<CloudflareDemoMedia | null>>();

async function loadRuntimeModules() {
  const [commerceModule, configModule, dbModule, mediaModule] = await Promise.all([
    import("@snn/commerce"),
    import("@snn/config"),
    import("@snn/db"),
    import("@snn/media"),
  ]);

  buildCloudflareImageUrl = mediaModule.buildCloudflareImageUrl;
  getCatalogHealthReport = commerceModule.getCatalogHealthReport;
  getCloudflareImageDetails = mediaModule.getCloudflareImageDetails;
  getCloudflareImagesConfig = configModule.getCloudflareImagesConfig;
  recordCommerceAuditEvent = commerceModule.recordCommerceAuditEvent;
  closeDb = dbModule.closeDb;
  getDb = dbModule.getDb;
  schema = dbModule.schema;
  uploadCloudflareImage = mediaModule.uploadCloudflareImage;
}

type VariantSeed = {
  compareAtAmount?: number | null | undefined;
  inventoryItems?: Array<{
    onHand: number;
    requiredQuantity?: number | undefined;
    sku: string;
    title: string;
  }> | undefined;
  isDefault?: boolean | undefined;
  optionValues: Record<string, string>;
  priceAmount?: number | undefined;
  saleAmount?: number | undefined;
  sku: string;
  title: string;
};

type ProductSeed = {
  attributes?: Array<{
    code: string;
    name: string;
    type?: "text" | "number" | "boolean" | "select" | "multi_select" | undefined;
    value: string | number | boolean | string[];
  }> | undefined;
  categories: string[];
  collections: string[];
  mediaTone: string;
  media?: {
    sharedSlots?: number | undefined;
    sharedVideoSlots?: number[] | undefined;
    variantSlots?: number | undefined;
    variantVideoSlots?: number[] | undefined;
  } | undefined;
  options: Array<{
    code: string;
    name: string;
    values: string[];
  }>;
  productType: string;
  slug: string;
  status?: ProductStatus | undefined;
  translations: {
    da: {
      description: string;
      name: string;
      shortDescription: string;
    };
    en: {
      description: string;
      name: string;
      shortDescription: string;
    };
  };
  variants: VariantSeed[];
};

const categories = [
  {
    slug: "daily-blends",
    translations: {
      da: "Daily blends",
      en: "Daily blends",
    },
  },
  {
    slug: "hydration",
    translations: {
      da: "Hydration",
      en: "Hydration",
    },
  },
  {
    slug: "recovery",
    translations: {
      da: "Recovery",
      en: "Recovery",
    },
  },
  {
    slug: "greens",
    translations: {
      da: "Greens",
      en: "Greens",
    },
  },
  {
    slug: "sleep",
    translations: {
      da: "Sleep",
      en: "Sleep",
    },
  },
  {
    slug: "snacks",
    translations: {
      da: "Snacks",
      en: "Snacks",
    },
  },
  {
    slug: "accessories",
    translations: {
      da: "Accessories",
      en: "Accessories",
    },
  },
  {
    slug: "apparel",
    translations: {
      da: "Apparel",
      en: "Apparel",
    },
  },
] as const;

const collections = [
  {
    slug: "daily-stack",
    translations: {
      da: "Daily stack",
      en: "Daily stack",
    },
  },
  {
    slug: "performance-ready",
    translations: {
      da: "Performance ready",
      en: "Performance ready",
    },
  },
  {
    slug: "intro-sale",
    translations: {
      da: "Intro sale",
      en: "Intro sale",
    },
  },
  {
    slug: "new-season",
    translations: {
      da: "New season",
      en: "New season",
    },
  },
  {
    slug: "travel-ready",
    translations: {
      da: "Travel ready",
      en: "Travel ready",
    },
  },
  {
    slug: "tester-favorites",
    translations: {
      da: "Tester favorites",
      en: "Tester favorites",
    },
  },
] as const;

const productSeeds: ProductSeed[] = [
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Focus" },
      { code: "servings", name: "Servings", type: "number", value: 30 },
    ],
    categories: ["daily-blends"],
    collections: ["daily-stack"],
    media: {
      sharedSlots: 1,
      variantSlots: 3,
    },
    mediaTone: "#dce5df",
    options: [
      { code: "size", name: "Size", values: ["300g", "900g"] },
      { code: "flavor", name: "Flavor", values: ["Cacao", "Vanilla"] },
    ],
    productType: "supplement",
    slug: "steady-energy-blend",
    translations: {
      da: {
        description:
          "En ren daglig blend til stabilt fokus, roligere energi og en nem rutine.",
        name: "Stabil Energy Blend",
        shortDescription: "Daglig støtte til fokus, bevægelse og restitution.",
      },
      en: {
        description:
          "A clean daily blend for steady focus, calmer energy, and an easy routine.",
        name: "Steady Energy Blend",
        shortDescription: "Daily focus, movement, and recovery support.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { flavor: "Cacao", size: "300g" },
        priceAmount: 22900,
        sku: "SNN-STEADY-ENERGY-CACAO-300G",
        title: "Cacao / 300g",
      },
      {
        optionValues: { flavor: "Cacao", size: "900g" },
        priceAmount: 54900,
        sku: "SNN-STEADY-ENERGY-CACAO-900G",
        title: "Cacao / 900g",
      },
      {
        optionValues: { flavor: "Vanilla", size: "300g" },
        priceAmount: 22900,
        sku: "SNN-STEADY-ENERGY-VANILLA-300G",
        title: "Vanilla / 300g",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Hydration" },
      { code: "electrolytes", name: "Electrolytes", type: "boolean", value: true },
    ],
    categories: ["hydration"],
    collections: ["performance-ready"],
    mediaTone: "#d9e8ec",
    options: [
      { code: "size", name: "Size", values: ["30 servings"] },
      { code: "flavor", name: "Flavor", values: ["Citrus", "Berry"] },
    ],
    productType: "supplement",
    slug: "mineral-hydration-mix",
    translations: {
      da: {
        description:
          "Elektrolyt-mix til lange dage, varme træninger og stabil hydrering.",
        name: "Mineral Hydration Mix",
        shortDescription: "Elektrolytter til træning, rejser og hverdagsrytme.",
      },
      en: {
        description:
          "An electrolyte mix for long days, warm training sessions, and steady hydration.",
        name: "Mineral Hydration Mix",
        shortDescription: "Electrolytes for training, travel, and daily rhythm.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { flavor: "Citrus", size: "30 servings" },
        priceAmount: 18900,
        sku: "SNN-MINERAL-HYDRATION-CITRUS-30",
        title: "Citrus / 30 servings",
      },
      {
        inventoryItems: [
          {
            onHand: 0,
            sku: "INV-SNN-MINERAL-HYDRATION-BERRY-30",
            title: "Mineral Hydration Berry 30 servings",
          },
        ],
        optionValues: { flavor: "Berry", size: "30 servings" },
        priceAmount: 18900,
        sku: "SNN-MINERAL-HYDRATION-BERRY-30",
        title: "Berry / 30 servings",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Recovery" },
      { code: "protein", name: "Protein", type: "number", value: 24 },
    ],
    categories: ["recovery"],
    collections: ["daily-stack"],
    media: {
      sharedSlots: 0,
      variantSlots: 2,
    },
    mediaTone: "#ebe3d7",
    options: [
      { code: "size", name: "Size", values: ["750g"] },
      { code: "flavor", name: "Flavor", values: ["Vanilla", "Chocolate"] },
    ],
    productType: "supplement",
    slug: "overnight-recovery-protein",
    translations: {
      da: {
        description:
          "Protein og mineraler til en roligere aftenrutine og bedre restitutionsvaner.",
        name: "Overnight Recovery Protein",
        shortDescription: "Protein til aftenrutine og restitution.",
      },
      en: {
        description:
          "Protein and minerals for calmer evening routines and better recovery habits.",
        name: "Overnight Recovery Protein",
        shortDescription: "Protein for evening routine and recovery.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { flavor: "Vanilla", size: "750g" },
        priceAmount: 32900,
        sku: "SNN-OVERNIGHT-RECOVERY-VANILLA-750G",
        title: "Vanilla / 750g",
      },
      {
        optionValues: { flavor: "Chocolate", size: "750g" },
        priceAmount: 32900,
        sku: "SNN-OVERNIGHT-RECOVERY-CHOCOLATE-750G",
        title: "Chocolate / 750g",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Strength" },
      { code: "vegan", name: "Vegan", type: "boolean", value: true },
    ],
    categories: ["daily-blends"],
    collections: ["intro-sale", "performance-ready"],
    media: {
      sharedSlots: 0,
      variantSlots: 1,
    },
    mediaTone: "#e8e8e1",
    options: [
      { code: "size", name: "Size", values: ["300g", "600g"] },
    ],
    productType: "supplement",
    slug: "essential-creatine-monohydrate",
    translations: {
      da: {
        description:
          "Ren creatine monohydrate med simple priser, salgspris og lagerstatus til test.",
        name: "Essential Creatine Monohydrate",
        shortDescription: "Ren creatine med intropris.",
      },
      en: {
        description:
          "Pure creatine monohydrate with base pricing, sale pricing, and stock states for testing.",
        name: "Essential Creatine Monohydrate",
        shortDescription: "Pure creatine with intro pricing.",
      },
    },
    variants: [
      {
        compareAtAmount: 19900,
        isDefault: true,
        optionValues: { size: "300g" },
        priceAmount: 19900,
        saleAmount: 16900,
        sku: "SNN-CREATINE-300G",
        title: "300g",
      },
      {
        compareAtAmount: 32900,
        optionValues: { size: "600g" },
        priceAmount: 32900,
        saleAmount: 27900,
        sku: "SNN-CREATINE-600G",
        title: "600g",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Routine" },
    ],
    categories: ["daily-blends", "hydration"],
    collections: ["daily-stack"],
    mediaTone: "#e4e1ec",
    options: [
      { code: "bundle", name: "Bundle", values: ["Starter kit"] },
    ],
    productType: "supplement-kit",
    slug: "morning-routine-kit",
    translations: {
      da: {
        description:
          "Et kit der deler flere inventory items, så vi kan teste fremtidige bundles uden bundle-UI.",
        name: "Morning Routine Kit",
        shortDescription: "Bundle-klar inventory-test til daglig rutine.",
      },
      en: {
        description:
          "A kit linked to multiple inventory items so future bundle behavior is ready without bundle UI.",
        name: "Morning Routine Kit",
        shortDescription: "Bundle-ready inventory test for daily routine.",
      },
    },
    variants: [
      {
        inventoryItems: [
          {
            onHand: 45,
            requiredQuantity: 1,
            sku: "INV-SNN-KIT-ENERGY-SACHET",
            title: "Energy sachet component",
          },
          {
            onHand: 30,
            requiredQuantity: 1,
            sku: "INV-SNN-KIT-HYDRATION-SACHET",
            title: "Hydration sachet component",
          },
        ],
        isDefault: true,
        optionValues: { bundle: "Starter kit" },
        priceAmount: 14900,
        sku: "SNN-MORNING-ROUTINE-KIT",
        title: "Starter kit",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Wellness" },
      { code: "servings", name: "Servings", type: "number", value: 30 },
      { code: "caffeine", name: "Caffeine", type: "boolean", value: false },
    ],
    categories: ["greens", "daily-blends"],
    collections: ["daily-stack", "new-season", "tester-favorites"],
    media: {
      sharedSlots: 1,
      variantSlots: 3,
    },
    mediaTone: "#d8e6d4",
    options: [
      { code: "size", name: "Size", values: ["300g", "600g"] },
      { code: "flavor", name: "Flavor", values: ["Apple Mint", "Pineapple Lime", "Unflavored"] },
    ],
    productType: "supplement",
    slug: "daily-greens-complex",
    translations: {
      da: {
        description:
          "Greens blend med flere smags- og storrelsesvarianter til filter, variantvalg og anbefalingstest.",
        name: "Daily Greens Complex",
        shortDescription: "Greens blend med friske smage og to storrelser.",
      },
      en: {
        description:
          "Greens blend with multiple flavor and size variants for filters, variant selection, and recommendation tests.",
        name: "Daily Greens Complex",
        shortDescription: "Greens blend with fresh flavors and two sizes.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { flavor: "Apple Mint", size: "300g" },
        priceAmount: 24900,
        sku: "SNN-GREENS-APPLE-MINT-300G",
        title: "Apple Mint / 300g",
      },
      {
        optionValues: { flavor: "Apple Mint", size: "600g" },
        priceAmount: 44900,
        sku: "SNN-GREENS-APPLE-MINT-600G",
        title: "Apple Mint / 600g",
      },
      {
        optionValues: { flavor: "Pineapple Lime", size: "300g" },
        priceAmount: 24900,
        sku: "SNN-GREENS-PINEAPPLE-LIME-300G",
        title: "Pineapple Lime / 300g",
      },
      {
        compareAtAmount: 44900,
        optionValues: { flavor: "Pineapple Lime", size: "600g" },
        priceAmount: 44900,
        saleAmount: 39900,
        sku: "SNN-GREENS-PINEAPPLE-LIME-600G",
        title: "Pineapple Lime / 600g",
      },
      {
        optionValues: { flavor: "Unflavored", size: "300g" },
        priceAmount: 23900,
        sku: "SNN-GREENS-UNFLAVORED-300G",
        title: "Unflavored / 300g",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Focus" },
      { code: "vegan", name: "Vegan", type: "boolean", value: true },
    ],
    categories: ["daily-blends"],
    collections: ["performance-ready", "travel-ready"],
    mediaTone: "#e3e0f1",
    options: [
      { code: "strength", name: "Strength", values: ["Regular", "Extra"] },
      { code: "count", name: "Count", values: ["60 capsules", "120 capsules"] },
    ],
    productType: "capsules",
    slug: "adaptogen-focus-capsules",
    translations: {
      da: {
        description:
          "Kapsler til fokus med to styrker og to pakkestorrelser, sa produktdetaljen kan teste flere optioner.",
        name: "Adaptogen Focus Capsules",
        shortDescription: "Fokus-kapsler i flere styrker.",
      },
      en: {
        description:
          "Focus capsules with two strengths and two pack sizes, useful for testing richer option selection.",
        name: "Adaptogen Focus Capsules",
        shortDescription: "Focus capsules in multiple strengths.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { count: "60 capsules", strength: "Regular" },
        priceAmount: 17900,
        sku: "SNN-FOCUS-REGULAR-60",
        title: "Regular / 60 capsules",
      },
      {
        optionValues: { count: "120 capsules", strength: "Regular" },
        priceAmount: 29900,
        sku: "SNN-FOCUS-REGULAR-120",
        title: "Regular / 120 capsules",
      },
      {
        optionValues: { count: "60 capsules", strength: "Extra" },
        priceAmount: 20900,
        sku: "SNN-FOCUS-EXTRA-60",
        title: "Extra / 60 capsules",
      },
      {
        compareAtAmount: 34900,
        optionValues: { count: "120 capsules", strength: "Extra" },
        priceAmount: 34900,
        saleAmount: 31900,
        sku: "SNN-FOCUS-EXTRA-120",
        title: "Extra / 120 capsules",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Protein" },
      { code: "protein", name: "Protein", type: "number", value: 18 },
    ],
    categories: ["snacks", "recovery"],
    collections: ["performance-ready", "tester-favorites"],
    mediaTone: "#efe2d8",
    options: [
      { code: "flavor", name: "Flavor", values: ["Chocolate Sea Salt", "Peanut Crunch", "Red Berry"] },
      { code: "pack", name: "Pack", values: ["Single", "12 pack"] },
    ],
    productType: "protein-snack",
    slug: "protein-crisp-bar",
    translations: {
      da: {
        description:
          "Proteinbar med single- og 12-pack varianter, flere smage og et udsolgt scenarie.",
        name: "Protein Crisp Bar",
        shortDescription: "Proteinbar til snack- og pack-test.",
      },
      en: {
        description:
          "Protein bar with single and 12-pack variants, multiple flavors, and one sold-out scenario.",
        name: "Protein Crisp Bar",
        shortDescription: "Protein bar for snack and pack testing.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { flavor: "Chocolate Sea Salt", pack: "Single" },
        priceAmount: 2900,
        sku: "SNN-BAR-CHOCOLATE-SEA-SALT-SINGLE",
        title: "Chocolate Sea Salt / Single",
      },
      {
        optionValues: { flavor: "Chocolate Sea Salt", pack: "12 pack" },
        priceAmount: 29900,
        sku: "SNN-BAR-CHOCOLATE-SEA-SALT-12",
        title: "Chocolate Sea Salt / 12 pack",
      },
      {
        optionValues: { flavor: "Peanut Crunch", pack: "Single" },
        priceAmount: 2900,
        sku: "SNN-BAR-PEANUT-CRUNCH-SINGLE",
        title: "Peanut Crunch / Single",
      },
      {
        optionValues: { flavor: "Peanut Crunch", pack: "12 pack" },
        priceAmount: 29900,
        sku: "SNN-BAR-PEANUT-CRUNCH-12",
        title: "Peanut Crunch / 12 pack",
      },
      {
        inventoryItems: [
          {
            onHand: 0,
            sku: "INV-SNN-BAR-RED-BERRY-SINGLE",
            title: "Protein Crisp Bar Red Berry Single",
          },
        ],
        optionValues: { flavor: "Red Berry", pack: "Single" },
        priceAmount: 2900,
        sku: "SNN-BAR-RED-BERRY-SINGLE",
        title: "Red Berry / Single",
      },
      {
        inventoryItems: [
          {
            onHand: 42,
            sku: "INV-SNN-BAR-RED-BERRY-12",
            title: "Protein Crisp Bar Red Berry 12 pack",
          },
        ],
        optionValues: { flavor: "Red Berry", pack: "12 pack" },
        priceAmount: 29900,
        sku: "SNN-BAR-RED-BERRY-12",
        title: "Red Berry / 12 pack",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Hydration" },
      { code: "dishwasher_safe", name: "Dishwasher safe", type: "boolean", value: true },
    ],
    categories: ["accessories", "hydration"],
    collections: ["travel-ready", "tester-favorites"],
    media: {
      sharedSlots: 1,
      variantSlots: 4,
      variantVideoSlots: [2],
    },
    mediaTone: "#e1e4e6",
    options: [
      { code: "color", name: "Color", values: ["Black", "Smoke", "Clear"] },
      { code: "size", name: "Size", values: ["600ml", "900ml"] },
    ],
    productType: "accessory",
    slug: "daily-training-shaker",
    translations: {
      da: {
        description:
          "Shaker med farve- og storrelsesvarianter til at teste ikke-supplement produkter i kurven.",
        name: "Daily Training Shaker",
        shortDescription: "Shaker i flere farver og storrelser.",
      },
      en: {
        description:
          "Shaker with color and size variants for testing non-supplement products in the bag.",
        name: "Daily Training Shaker",
        shortDescription: "Shaker in multiple colors and sizes.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { color: "Black", size: "600ml" },
        priceAmount: 8900,
        sku: "SNN-SHAKER-BLACK-600ML",
        title: "Black / 600ml",
      },
      {
        optionValues: { color: "Black", size: "900ml" },
        priceAmount: 10900,
        sku: "SNN-SHAKER-BLACK-900ML",
        title: "Black / 900ml",
      },
      {
        optionValues: { color: "Smoke", size: "600ml" },
        priceAmount: 8900,
        sku: "SNN-SHAKER-SMOKE-600ML",
        title: "Smoke / 600ml",
      },
      {
        inventoryItems: [
          {
            onHand: 0,
            sku: "INV-SNN-SHAKER-SMOKE-900ML",
            title: "Daily Training Shaker Smoke 900ml",
          },
        ],
        optionValues: { color: "Smoke", size: "900ml" },
        priceAmount: 10900,
        sku: "SNN-SHAKER-SMOKE-900ML",
        title: "Smoke / 900ml",
      },
      {
        optionValues: { color: "Clear", size: "600ml" },
        priceAmount: 8900,
        sku: "SNN-SHAKER-CLEAR-600ML",
        title: "Clear / 600ml",
      },
      {
        optionValues: { color: "Clear", size: "900ml" },
        priceAmount: 10900,
        sku: "SNN-SHAKER-CLEAR-900ML",
        title: "Clear / 900ml",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Training" },
      { code: "material", name: "Material", type: "select", value: "Cotton blend" },
    ],
    categories: ["apparel"],
    collections: ["new-season", "tester-favorites"],
    media: {
      sharedSlots: 1,
      variantSlots: 5,
      variantVideoSlots: [3],
    },
    mediaTone: "#e7e2d9",
    options: [
      { code: "color", name: "Color", values: ["Black", "Bone"] },
      { code: "size", name: "Size", values: ["S", "M", "L", "XL"] },
    ],
    productType: "apparel",
    slug: "club-training-tee",
    translations: {
      da: {
        description:
          "T-shirt med klassisk apparel-variantmatrix, brugbar til at teste size og color optioner.",
        name: "Club Training Tee",
        shortDescription: "Training tee i to farver og fire storrelser.",
      },
      en: {
        description:
          "T-shirt with a classic apparel variant matrix, useful for testing size and color options.",
        name: "Club Training Tee",
        shortDescription: "Training tee in two colors and four sizes.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { color: "Black", size: "S" },
        priceAmount: 24900,
        sku: "SNN-TEE-BLACK-S",
        title: "Black / S",
      },
      {
        optionValues: { color: "Black", size: "M" },
        priceAmount: 24900,
        sku: "SNN-TEE-BLACK-M",
        title: "Black / M",
      },
      {
        optionValues: { color: "Black", size: "L" },
        priceAmount: 24900,
        sku: "SNN-TEE-BLACK-L",
        title: "Black / L",
      },
      {
        inventoryItems: [
          {
            onHand: 0,
            sku: "INV-SNN-TEE-BLACK-XL",
            title: "Club Training Tee Black XL",
          },
        ],
        optionValues: { color: "Black", size: "XL" },
        priceAmount: 24900,
        sku: "SNN-TEE-BLACK-XL",
        title: "Black / XL",
      },
      {
        optionValues: { color: "Bone", size: "S" },
        priceAmount: 24900,
        sku: "SNN-TEE-BONE-S",
        title: "Bone / S",
      },
      {
        optionValues: { color: "Bone", size: "M" },
        priceAmount: 24900,
        sku: "SNN-TEE-BONE-M",
        title: "Bone / M",
      },
      {
        optionValues: { color: "Bone", size: "L" },
        priceAmount: 24900,
        sku: "SNN-TEE-BONE-L",
        title: "Bone / L",
      },
      {
        optionValues: { color: "Bone", size: "XL" },
        priceAmount: 24900,
        sku: "SNN-TEE-BONE-XL",
        title: "Bone / XL",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Sleep" },
      { code: "vegan", name: "Vegan", type: "boolean", value: true },
    ],
    categories: ["sleep", "recovery"],
    collections: ["daily-stack", "travel-ready"],
    mediaTone: "#dedff0",
    options: [
      { code: "strength", name: "Strength", values: ["Regular", "Extra"] },
      { code: "count", name: "Count", values: ["60 capsules", "120 capsules"] },
    ],
    productType: "capsules",
    slug: "sleep-magnesium-capsules",
    translations: {
      da: {
        description:
          "Magnesiumprodukt med fire varianter til at teste kapsler, styrker og storrelsesfiltre.",
        name: "Sleep Magnesium Capsules",
        shortDescription: "Magnesium til aftenrutinen.",
      },
      en: {
        description:
          "Magnesium product with four variants for testing capsule, strength, and size filters.",
        name: "Sleep Magnesium Capsules",
        shortDescription: "Magnesium for the evening routine.",
      },
    },
    variants: [
      {
        isDefault: true,
        optionValues: { count: "60 capsules", strength: "Regular" },
        priceAmount: 15900,
        sku: "SNN-MAGNESIUM-REGULAR-60",
        title: "Regular / 60 capsules",
      },
      {
        optionValues: { count: "120 capsules", strength: "Regular" },
        priceAmount: 26900,
        sku: "SNN-MAGNESIUM-REGULAR-120",
        title: "Regular / 120 capsules",
      },
      {
        optionValues: { count: "60 capsules", strength: "Extra" },
        priceAmount: 18900,
        sku: "SNN-MAGNESIUM-EXTRA-60",
        title: "Extra / 60 capsules",
      },
      {
        optionValues: { count: "120 capsules", strength: "Extra" },
        priceAmount: 31900,
        sku: "SNN-MAGNESIUM-EXTRA-120",
        title: "Extra / 120 capsules",
      },
    ],
  },
  {
    attributes: [
      { code: "goal", name: "Goal", type: "select", value: "Trial" },
      { code: "servings", name: "Servings", type: "number", value: 14 },
    ],
    categories: ["daily-blends", "hydration", "recovery", "snacks"],
    collections: ["intro-sale", "tester-favorites"],
    media: {
      sharedSlots: 1,
      variantSlots: 9,
      variantVideoSlots: [4],
    },
    mediaTone: "#eaded4",
    options: [
      { code: "bundle", name: "Bundle", values: ["Sampler", "Training week", "Recovery week"] },
      { code: "flavor", name: "Flavor", values: ["Mixed", "Chocolate", "Citrus"] },
    ],
    productType: "supplement-kit",
    slug: "performance-trial-box",
    translations: {
      da: {
        description:
          "Testbox med bundles, blandede komponenter og salgspris til checkout- og anbefalingsflows.",
        name: "Performance Trial Box",
        shortDescription: "Sampler box med flere bundle-varianter.",
      },
      en: {
        description:
          "Trial box with bundles, mixed components, and sale pricing for checkout and recommendation flows.",
        name: "Performance Trial Box",
        shortDescription: "Sampler box with multiple bundle variants.",
      },
    },
    variants: [
      {
        compareAtAmount: 22900,
        inventoryItems: [
          {
            onHand: 60,
            requiredQuantity: 2,
            sku: "INV-SNN-TRIAL-ENERGY-SACHET",
            title: "Trial energy sachet",
          },
          {
            onHand: 70,
            requiredQuantity: 2,
            sku: "INV-SNN-TRIAL-HYDRATION-SACHET",
            title: "Trial hydration sachet",
          },
        ],
        isDefault: true,
        optionValues: { bundle: "Sampler", flavor: "Mixed" },
        priceAmount: 22900,
        saleAmount: 19900,
        sku: "SNN-TRIAL-SAMPLER-MIXED",
        title: "Sampler / Mixed",
      },
      {
        inventoryItems: [
          {
            onHand: 48,
            requiredQuantity: 3,
            sku: "INV-SNN-TRIAL-ENERGY-SACHET",
            title: "Trial energy sachet",
          },
          {
            onHand: 54,
            requiredQuantity: 1,
            sku: "INV-SNN-TRIAL-BAR",
            title: "Trial protein bar",
          },
        ],
        optionValues: { bundle: "Training week", flavor: "Chocolate" },
        priceAmount: 28900,
        sku: "SNN-TRIAL-TRAINING-CHOCOLATE",
        title: "Training week / Chocolate",
      },
      {
        inventoryItems: [
          {
            onHand: 45,
            requiredQuantity: 2,
            sku: "INV-SNN-TRIAL-HYDRATION-SACHET",
            title: "Trial hydration sachet",
          },
          {
            onHand: 38,
            requiredQuantity: 2,
            sku: "INV-SNN-TRIAL-RECOVERY-SACHET",
            title: "Trial recovery sachet",
          },
        ],
        optionValues: { bundle: "Recovery week", flavor: "Citrus" },
        priceAmount: 28900,
        sku: "SNN-TRIAL-RECOVERY-CITRUS",
        title: "Recovery week / Citrus",
      },
    ],
  },
  {
    categories: ["daily-blends"],
    collections: ["daily-stack"],
    mediaTone: "#ececec",
    options: [
      { code: "size", name: "Size", values: ["300g"] },
    ],
    productType: "supplement",
    slug: "admin-price-check-blend",
    status: "draft",
    translations: {
      da: {
        description: "Admin-only produkt uden pris til health check og preview.",
        name: "Admin Price Check Blend",
        shortDescription: "Skal forblive skjult indtil prisen er klar.",
      },
      en: {
        description: "Admin-only product without price for health check and preview states.",
        name: "Admin Price Check Blend",
        shortDescription: "Stays hidden until pricing is ready.",
      },
    },
    variants: [
      {
        optionValues: { size: "300g" },
        sku: "SNN-ADMIN-PRICE-CHECK-300G",
        title: "300g",
      },
    ],
  },
];

function getHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 100000;
  }

  return Math.abs(hash);
}

function getVariantTone(seed: ProductSeed, variant: VariantSeed, slot: number) {
  const hue = (getHash(`${seed.slug}-${variant.sku}-${slot}`) % 260) + 20;
  const saturation = slot === 0 ? 34 : 42;
  const lightness = slot === 0 ? 88 : 82;

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

function getSharedTone(seed: ProductSeed, slot: number) {
  if (slot === 0) {
    return seed.mediaTone;
  }

  const hue = (getHash(`${seed.slug}-shared-${slot}`) % 260) + 20;
  return `hsl(${hue} 30% 86%)`;
}

function getSlotLabel(slot: number, mediaType: "image" | "video") {
  if (mediaType === "video") {
    return "VIDEO";
  }

  return [
    "PRIMARY",
    "SECOND",
    "THIRD",
    "FOURTH",
    "FIFTH",
    "SIXTH",
    "SEVENTH",
    "EIGHTH",
    "NINTH",
    "TENTH",
  ][slot] ?? `MEDIA ${slot + 1}`;
}

function encodeSvgDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getImageSvg(title: string, tone: string, slotLabel?: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400">
    <rect width="1200" height="1400" fill="${tone}"/>
    <circle cx="600" cy="620" r="310" fill="rgba(255,255,255,.45)"/>
    <rect x="430" y="390" width="340" height="520" rx="48" fill="rgba(255,255,255,.72)"/>
    <rect x="475" y="455" width="250" height="38" rx="19" fill="rgba(19,19,19,.16)"/>
    <rect x="490" y="540" width="220" height="220" rx="110" fill="rgba(19,19,19,.08)"/>
    ${slotLabel ? `<text x="600" y="330" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="8" fill="rgba(19,19,19,.38)">${slotLabel}</text>` : ""}
    <text x="600" y="1040" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="rgba(19,19,19,.72)">${title}</text>
  </svg>`;
}

function getSvgDataUrl(title: string, tone: string, slotLabel?: string) {
  return encodeSvgDataUrl(getImageSvg(title, tone, slotLabel));
}

function getVideoPosterSvg(title: string, tone: string, slotLabel = "VIDEO") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400">
    <rect width="1200" height="1400" fill="${tone}"/>
    <circle cx="600" cy="620" r="350" fill="rgba(255,255,255,.42)"/>
    <circle cx="600" cy="620" r="155" fill="rgba(19,19,19,.84)"/>
    <path d="M565 535v170l150-85z" fill="white"/>
    <text x="600" y="315" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="8" fill="rgba(19,19,19,.42)">${slotLabel}</text>
    <text x="600" y="1040" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="700" fill="rgba(19,19,19,.72)">${title}</text>
  </svg>`;
}

function getVideoPosterDataUrl(title: string, tone: string, slotLabel = "VIDEO") {
  return encodeSvgDataUrl(getVideoPosterSvg(title, tone, slotLabel));
}

function getMediaKey(seed: ProductSeed, variant: VariantSeed | undefined, slot: number) {
  if (variant) {
    if (slot === 0) {
      return `${seed.slug}-${variant.sku}`;
    }

    if (slot === 1) {
      return `${seed.slug}-${variant.sku}-secondary`;
    }

    return `${seed.slug}-${variant.sku}-media-${slot + 1}`;
  }

  return slot === 0 ? seed.slug : `${seed.slug}-shared-${slot + 1}`;
}

function getLegacyDemoProviderAssetId(key: string) {
  return `commerce-demo-${key}`;
}

function getCloudflareDemoProviderAssetId(key: string) {
  const digest = createHash("sha256").update(`snn-commerce-demo-media-v1:${key}`).digest("hex");

  return `snn-${digest.slice(0, 28)}`;
}

function getCloudflareDeliveryVariant(slot: number) {
  return slot === 0 ? "productcard" : "pdpgallery";
}

async function loadCloudflareDemoMedia(input: DemoMediaInput): Promise<CloudflareDemoMedia | null> {
  const config = getCloudflareImagesConfig();

  if (!config.enabled) {
    return null;
  }

  const providerAssetId = getCloudflareDemoProviderAssetId(input.key);
  const svg = input.mediaType === "video"
    ? getVideoPosterSvg(input.title, input.tone, input.slotLabel)
    : getImageSvg(input.title, input.tone, input.slotLabel);
  const deliveryVariant = getCloudflareDeliveryVariant(input.slot);
  const filename = input.mediaType === "video"
    ? `${input.key}-video-poster.svg`
    : `${input.key}.svg`;
  const metadata = {
    cloudflareDemoMedia: true,
    deliveryVariant,
    demoMediaKey: input.key,
    mediaType: input.mediaType,
    slot: input.slot,
    ...(input.mediaType === "video" ? { demoPlaceholderVideo: true } : {}),
  };

  let uploadedAt: string | undefined;

  try {
    const details = await getCloudflareImageDetails(providerAssetId);
    uploadedAt = details.uploadedAt;
  } catch {
    const details = await uploadCloudflareImage({
      bytes: svg,
      contentType: "image/svg+xml",
      customId: providerAssetId,
      filename,
      metadata,
      requireSignedUrls: false,
    });
    uploadedAt = details.uploadedAt;
  }

  return {
    byteSize: Buffer.byteLength(svg, "utf8"),
    deliveryUrl: buildCloudflareImageUrl(providerAssetId, deliveryVariant),
    filename,
    height: 1400,
    metadata,
    providerAssetId,
    uploadedAt: uploadedAt ?? new Date().toISOString(),
    width: 1200,
  };
}

async function getCloudflareDemoMedia(input: DemoMediaInput) {
  let cached = cloudflareDemoMediaCache.get(input.key);

  if (!cached) {
    cached = loadCloudflareDemoMedia(input);
    cloudflareDemoMediaCache.set(input.key, cached);
  }

  return cached;
}

function getSharedMediaInput(seed: ProductSeed, slot: number): DemoMediaInput {
  const mediaType = isVideoSlot(seed.media?.sharedVideoSlots, slot) ? "video" : "image";
  const title = seed.translations.en.name;
  const tone = getSharedTone(seed, slot);

  return {
    key: getMediaKey(seed, undefined, slot),
    mediaType,
    slot,
    slotLabel: getSlotLabel(slot, mediaType),
    title,
    tone,
  };
}

function getVariantMediaInput(seed: ProductSeed, variant: VariantSeed, slot: number): DemoMediaInput {
  const mediaType = isVideoSlot(seed.media?.variantVideoSlots, slot) ? "video" : "image";
  const tone = getVariantTone(seed, variant, slot);

  return {
    key: getMediaKey(seed, variant, slot),
    mediaType,
    slot,
    slotLabel: getSlotLabel(slot, mediaType),
    title: variant.title,
    tone,
  };
}

function getDemoMediaInputs(seed: ProductSeed) {
  const inputs: DemoMediaInput[] = [];

  for (let slot = 0; slot < (seed.media?.sharedSlots ?? 1); slot += 1) {
    inputs.push(getSharedMediaInput(seed, slot));
  }

  for (const variantSeed of seed.variants) {
    for (let slot = 0; slot < (seed.media?.variantSlots ?? 2); slot += 1) {
      inputs.push(getVariantMediaInput(seed, variantSeed, slot));
    }
  }

  return inputs;
}

async function ensureCloudflareDemoMedia() {
  const config = getCloudflareImagesConfig();

  if (!config.enabled) {
    return;
  }

  const inputs = productSeeds.flatMap((seed) => getDemoMediaInputs(seed));
  const concurrency = Number.parseInt(process.env.CLOUDFLARE_DEMO_MEDIA_CONCURRENCY ?? "8", 10);
  const workerCount = Math.max(1, Math.min(Number.isFinite(concurrency) ? concurrency : 8, 16));
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < inputs.length) {
      const input = inputs[nextIndex];
      nextIndex += 1;

      if (input) {
        await getCloudflareDemoMedia(input);
      }
    }
  }

  console.log(`Ensuring ${inputs.length} Cloudflare demo media assets with ${workerCount} workers.`);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
}

function isVideoSlot(slots: number[] | undefined, slot: number) {
  return slots?.includes(slot) ?? false;
}

async function ensureCurrency(db: CommerceDb) {
  await db
    .insert(schema.currencies)
    .values({
      code: "DKK",
      decimalDigits: 2,
      enabled: true,
      name: "Danish krone",
      symbol: "kr.",
    })
    .onConflictDoUpdate({
      target: schema.currencies.code,
      set: {
        decimalDigits: 2,
        enabled: true,
        name: "Danish krone",
        symbol: "kr.",
        updatedAt: new Date(),
      },
    });
}

async function ensureSalesChannel(db: CommerceDb) {
  await db
    .insert(schema.salesChannels)
    .values({
      code: "web",
      name: "Web storefront",
    })
    .onConflictDoUpdate({
      target: schema.salesChannels.code,
      set: {
        name: "Web storefront",
        updatedAt: new Date(),
      },
    });

  const [channel] = await db
    .select()
    .from(schema.salesChannels)
    .where(eq(schema.salesChannels.code, "web"))
    .limit(1);

  if (!channel) {
    throw new Error("Unable to ensure web sales channel.");
  }

  return channel;
}

async function ensureMarket(db: CommerceDb, salesChannelId: string) {
  await db
    .insert(schema.markets)
    .values({
      code: "dk",
      defaultCurrencyCode: "DKK",
      defaultLocale: "da",
      defaultSalesChannelId: salesChannelId,
      name: "Denmark",
      pricesIncludeTax: true,
      status: "active",
    })
    .onConflictDoUpdate({
      target: schema.markets.code,
      set: {
        defaultCurrencyCode: "DKK",
        defaultLocale: "da",
        defaultSalesChannelId: salesChannelId,
        name: "Denmark",
        pricesIncludeTax: true,
        status: "active",
        updatedAt: new Date(),
      },
    });

  const [market] = await db
    .select()
    .from(schema.markets)
    .where(eq(schema.markets.code, "dk"))
    .limit(1);

  if (!market) {
    throw new Error("Unable to ensure Denmark market.");
  }

  await db
    .insert(schema.marketCountries)
    .values({
      countryCode: "DK",
      marketId: market.id,
    })
    .onConflictDoNothing();

  return market;
}

async function ensureInventoryLocation(db: CommerceDb, salesChannelId: string) {
  await db
    .insert(schema.inventoryLocations)
    .values({
      code: "dk-main",
      countryCode: "DK",
      name: "Denmark main warehouse",
      status: "active",
      timezone: "Europe/Copenhagen",
    })
    .onConflictDoUpdate({
      target: schema.inventoryLocations.code,
      set: {
        countryCode: "DK",
        name: "Denmark main warehouse",
        status: "active",
        timezone: "Europe/Copenhagen",
        updatedAt: new Date(),
      },
    });

  const [location] = await db
    .select()
    .from(schema.inventoryLocations)
    .where(eq(schema.inventoryLocations.code, "dk-main"))
    .limit(1);

  if (!location) {
    throw new Error("Unable to ensure inventory location.");
  }

  await db
    .insert(schema.salesChannelInventoryLocations)
    .values({
      locationId: location.id,
      salesChannelId,
    })
    .onConflictDoNothing();

  return location;
}

async function ensurePriceList(db: CommerceDb) {
  const startsAt = new Date("2026-01-01T00:00:00.000Z");
  const endsAt = new Date("2027-01-01T00:00:00.000Z");

  await db
    .insert(schema.priceLists)
    .values({
      code: "intro-sale",
      endsAt,
      name: "Intro sale",
      startsAt,
      status: "active",
      type: "sale",
    })
    .onConflictDoUpdate({
      target: schema.priceLists.code,
      set: {
        endsAt,
        name: "Intro sale",
        startsAt,
        status: "active",
        type: "sale",
        updatedAt: new Date(),
      },
    });

  const [priceList] = await db
    .select()
    .from(schema.priceLists)
    .where(eq(schema.priceLists.code, "intro-sale"))
    .limit(1);

  if (!priceList) {
    throw new Error("Unable to ensure intro sale price list.");
  }

  return priceList;
}

async function ensureCategory(db: CommerceDb, slug: string) {
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    throw new Error(`Unknown category ${slug}.`);
  }

  await db
    .insert(schema.categories)
    .values({
      slug,
      status: "active",
    })
    .onConflictDoUpdate({
      target: schema.categories.slug,
      set: {
        status: "active",
        updatedAt: new Date(),
      },
    });

  const [record] = await db.select().from(schema.categories).where(eq(schema.categories.slug, slug)).limit(1);

  if (!record) {
    throw new Error(`Unable to ensure category ${slug}.`);
  }

  await db
    .insert(schema.categoryTranslations)
    .values([
      {
        categoryId: record.id,
        locale: "da",
        name: category.translations.da,
        slug,
      },
      {
        categoryId: record.id,
        locale: "en",
        name: category.translations.en,
        slug,
      },
    ])
    .onConflictDoUpdate({
      target: [schema.categoryTranslations.categoryId, schema.categoryTranslations.locale],
      set: {
        name: sql`excluded.name`,
        slug: sql`excluded.slug`,
        updatedAt: new Date(),
      },
    });

  return record;
}

async function ensureCollection(db: CommerceDb, slug: string) {
  const collection = collections.find((item) => item.slug === slug);

  if (!collection) {
    throw new Error(`Unknown collection ${slug}.`);
  }

  await db
    .insert(schema.collections)
    .values({
      slug,
      status: "active",
    })
    .onConflictDoUpdate({
      target: schema.collections.slug,
      set: {
        status: "active",
        updatedAt: new Date(),
      },
    });

  const [record] = await db.select().from(schema.collections).where(eq(schema.collections.slug, slug)).limit(1);

  if (!record) {
    throw new Error(`Unable to ensure collection ${slug}.`);
  }

  await db
    .insert(schema.collectionTranslations)
    .values([
      {
        collectionId: record.id,
        locale: "da",
        name: collection.translations.da,
      },
      {
        collectionId: record.id,
        locale: "en",
        name: collection.translations.en,
      },
    ])
    .onConflictDoUpdate({
      target: [schema.collectionTranslations.collectionId, schema.collectionTranslations.locale],
      set: {
        name: sql`excluded.name`,
        updatedAt: new Date(),
      },
    });

  return record;
}

async function ensureProduct(db: CommerceDb, seed: ProductSeed) {
  await db
    .insert(schema.products)
    .values({
      currencyCode: "DKK",
      defaultCountryCode: "DK",
      productType: seed.productType,
      slug: seed.slug,
      status: seed.status ?? "published",
      vendor: "SNN",
    })
    .onConflictDoUpdate({
      target: schema.products.slug,
      set: {
        currencyCode: "DKK",
        defaultCountryCode: "DK",
        productType: seed.productType,
        status: seed.status ?? "published",
        updatedAt: new Date(),
        vendor: "SNN",
      },
    });

  const [product] = await db.select().from(schema.products).where(eq(schema.products.slug, seed.slug)).limit(1);

  if (!product) {
    throw new Error(`Unable to ensure product ${seed.slug}.`);
  }

  await db
    .insert(schema.productTranslations)
    .values([
      {
        description: seed.translations.da.description,
        locale: "da",
        name: seed.translations.da.name,
        productId: product.id,
        shortDescription: seed.translations.da.shortDescription,
        slug: seed.slug,
      },
      {
        description: seed.translations.en.description,
        locale: "en",
        name: seed.translations.en.name,
        productId: product.id,
        shortDescription: seed.translations.en.shortDescription,
        slug: seed.slug,
      },
    ])
    .onConflictDoUpdate({
      target: [schema.productTranslations.productId, schema.productTranslations.locale],
      set: {
        description: sql`excluded.description`,
        name: sql`excluded.name`,
        shortDescription: sql`excluded.short_description`,
        slug: sql`excluded.slug`,
        updatedAt: new Date(),
      },
    });

  return product;
}

async function ensureProductOption(db: CommerceDb, productId: string, code: string, name: string, position: number) {
  await db
    .insert(schema.productOptions)
    .values({
      code,
      name,
      position,
      productId,
    })
    .onConflictDoUpdate({
      target: [schema.productOptions.productId, schema.productOptions.code],
      set: {
        name,
        position,
        updatedAt: new Date(),
      },
    });

  const [option] = await db
    .select()
    .from(schema.productOptions)
    .where(and(eq(schema.productOptions.productId, productId), eq(schema.productOptions.code, code)))
    .limit(1);

  if (!option) {
    throw new Error(`Unable to ensure ${code} option.`);
  }

  return option;
}

async function ensureProductOptionValue(db: CommerceDb, optionId: string, value: string, position: number) {
  await db
    .insert(schema.productOptionValues)
    .values({
      optionId,
      position,
      value,
    })
    .onConflictDoNothing();

  const [optionValue] = await db
    .select()
    .from(schema.productOptionValues)
    .where(and(eq(schema.productOptionValues.optionId, optionId), eq(schema.productOptionValues.value, value)))
    .limit(1);

  if (!optionValue) {
    throw new Error(`Unable to ensure ${value} option value.`);
  }

  return optionValue;
}

async function ensurePriceSet(db: CommerceDb, name: string) {
  const [priceSet] = await db.insert(schema.priceSets).values({ name }).returning();

  if (!priceSet) {
    throw new Error(`Unable to create ${name} price set.`);
  }

  return priceSet;
}

async function ensureVariant(db: CommerceDb, productId: string, input: VariantSeed) {
  const [existingVariant] = await db
    .select()
    .from(schema.productVariants)
    .where(eq(schema.productVariants.sku, input.sku))
    .limit(1);
  let variant = existingVariant;

  if (!variant) {
    const priceSet = await ensurePriceSet(db, `${input.sku} price set`);
    const [createdVariant] = await db
      .insert(schema.productVariants)
      .values({
        compareAtAmount: input.compareAtAmount ?? null,
        currencyCode: "DKK",
        isDefault: input.isDefault ?? false,
        priceAmount: input.priceAmount ?? 0,
        priceSetId: priceSet.id,
        productId,
        sku: input.sku,
        title: input.title,
      })
      .returning();

    if (!createdVariant) {
      throw new Error(`Unable to create ${input.sku} variant.`);
    }

    variant = createdVariant;
  }

  if (!variant.priceSetId) {
    const priceSet = await ensurePriceSet(db, `${input.sku} price set`);
    const [updatedVariant] = await db
      .update(schema.productVariants)
      .set({
        priceSetId: priceSet.id,
        updatedAt: new Date(),
      })
      .where(eq(schema.productVariants.id, variant.id))
      .returning();

    if (!updatedVariant) {
      throw new Error(`Unable to attach price set to ${input.sku}.`);
    }

    variant = updatedVariant;
  }

  const [updatedVariant] = await db
    .update(schema.productVariants)
    .set({
      compareAtAmount: input.compareAtAmount ?? null,
      isDefault: input.isDefault ?? false,
      priceAmount: input.priceAmount ?? variant.priceAmount,
      title: input.title,
      updatedAt: new Date(),
    })
    .where(eq(schema.productVariants.id, variant.id))
    .returning();

  return updatedVariant ?? variant;
}

async function ensureBasePrice(
  db: CommerceDb,
  priceSetId: string,
  marketId: string,
  amount: number,
  compareAtAmount?: number | null,
) {
  const [existingPrice] = await db
    .select()
    .from(schema.prices)
    .where(
      and(
        eq(schema.prices.priceSetId, priceSetId),
        eq(schema.prices.marketId, marketId),
        eq(schema.prices.currencyCode, "DKK"),
        isNull(schema.prices.priceListId),
      ),
    )
    .limit(1);

  if (existingPrice) {
    const [updatedPrice] = await db
      .update(schema.prices)
      .set({
        amount,
        compareAtAmount: compareAtAmount ?? null,
        includesTax: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.prices.id, existingPrice.id))
      .returning();

    return updatedPrice ?? existingPrice;
  }

  const [price] = await db
    .insert(schema.prices)
    .values({
      amount,
      compareAtAmount: compareAtAmount ?? null,
      currencyCode: "DKK",
      includesTax: true,
      marketId,
      priceSetId,
    })
    .returning();

  if (!price) {
    throw new Error("Unable to create base price.");
  }

  return price;
}

async function ensureSalePrice(
  db: CommerceDb,
  priceListId: string,
  priceSetId: string,
  marketId: string,
  amount: number,
  compareAtAmount: number,
) {
  const [existingPrice] = await db
    .select()
    .from(schema.prices)
    .where(
      and(
        eq(schema.prices.priceListId, priceListId),
        eq(schema.prices.priceSetId, priceSetId),
        eq(schema.prices.marketId, marketId),
        eq(schema.prices.currencyCode, "DKK"),
      ),
    )
    .limit(1);

  if (existingPrice) {
    await db
      .update(schema.prices)
      .set({
        amount,
        compareAtAmount,
        includesTax: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.prices.id, existingPrice.id));

    return;
  }

  await db.insert(schema.prices).values({
    amount,
    compareAtAmount,
    currencyCode: "DKK",
    includesTax: true,
    marketId,
    priceListId,
    priceSetId,
  });
}

async function ensureInventoryItem(
  db: CommerceDb,
  input: {
    sku: string;
    title: string;
  },
) {
  await db
    .insert(schema.inventoryItems)
    .values({
      sku: input.sku,
      title: input.title,
    })
    .onConflictDoUpdate({
      target: schema.inventoryItems.sku,
      set: {
        title: input.title,
        updatedAt: new Date(),
      },
    });

  const [item] = await db.select().from(schema.inventoryItems).where(eq(schema.inventoryItems.sku, input.sku)).limit(1);

  if (!item) {
    throw new Error(`Unable to ensure inventory item ${input.sku}.`);
  }

  return item;
}

async function ensureInventoryForVariant(
  db: CommerceDb,
  input: {
    inventoryItems?: VariantSeed["inventoryItems"];
    locationId: string;
    onHand: number;
    sku: string;
    title: string;
    variantId: string;
  },
) {
  const inventoryItems = input.inventoryItems ?? [
    {
      onHand: input.onHand,
      sku: input.sku,
      title: input.title,
    },
  ];

  for (const inventoryInput of inventoryItems) {
    const item = await ensureInventoryItem(db, {
      sku: inventoryInput.sku,
      title: inventoryInput.title,
    });

    await db
      .insert(schema.variantInventoryItems)
      .values({
        inventoryItemId: item.id,
        requiredQuantity: inventoryInput.requiredQuantity ?? 1,
        variantId: input.variantId,
      })
      .onConflictDoNothing();

    const [existingLevel] = await db
      .select()
      .from(schema.inventoryLevels)
      .where(
        and(
          eq(schema.inventoryLevels.inventoryItemId, item.id),
          eq(schema.inventoryLevels.locationId, input.locationId),
        ),
      )
      .limit(1);

    if (existingLevel) {
      await db
        .update(schema.inventoryLevels)
        .set({
          available: Math.max(inventoryInput.onHand - existingLevel.reserved, 0),
          onHand: inventoryInput.onHand,
          updatedAt: new Date(),
        })
        .where(eq(schema.inventoryLevels.id, existingLevel.id));
    } else {
      await db.insert(schema.inventoryLevels).values({
        available: inventoryInput.onHand,
        inventoryItemId: item.id,
        locationId: input.locationId,
        onHand: inventoryInput.onHand,
        reserved: 0,
        variantId: inventoryItems.length === 1 ? input.variantId : null,
      });
    }
  }
}

async function ensureMedia(
  db: CommerceDb,
  productId: string,
  seed: ProductSeed,
  variant?: VariantSeed,
  variantId?: string,
  slot = 0,
  mediaType: "image" | "video" = "image",
) {
  const key = getMediaKey(seed, variant, slot);
  const title = variant?.title ?? seed.translations.en.name;
  const tone = variant ? getVariantTone(seed, variant, slot) : getSharedTone(seed, slot);
  const slotLabel = getSlotLabel(slot, mediaType);
  const cloudflareMedia = await getCloudflareDemoMedia({
    key,
    mediaType,
    slot,
    slotLabel,
    title,
    tone,
  });
  const deliveryUrl = cloudflareMedia?.deliveryUrl ?? (
    mediaType === "video"
      ? getVideoPosterDataUrl(title, tone, slotLabel)
      : getSvgDataUrl(title, tone, slotLabel)
  );
  const mimeType = mediaType === "video" ? "video/mp4" : "image/svg+xml";
  const filename = cloudflareMedia?.filename ?? `${key}.${mediaType === "video" ? "mp4" : "svg"}`;
  const metadata = cloudflareMedia?.metadata ?? (
    mediaType === "video" ? { demoPlaceholderVideo: true } : {}
  );
  const providerAssetId = cloudflareMedia?.providerAssetId ?? getLegacyDemoProviderAssetId(key);
  const uploadedAt = cloudflareMedia?.uploadedAt ?? new Date().toISOString();

  await db
    .insert(schema.mediaAssets)
    .values({
      altText: title,
      ...(cloudflareMedia?.byteSize ? { byteSize: cloudflareMedia.byteSize } : {}),
      deliveryUrl,
      filename,
      ...(cloudflareMedia?.height ? { height: cloudflareMedia.height } : {}),
      metadata,
      mimeType,
      providerAssetId,
      status: "ready",
      uploadedAt,
      ...(cloudflareMedia?.width ? { width: cloudflareMedia.width } : {}),
    })
    .onConflictDoUpdate({
      target: [schema.mediaAssets.provider, schema.mediaAssets.providerAssetId],
      set: {
        altText: title,
        ...(cloudflareMedia?.byteSize ? { byteSize: cloudflareMedia.byteSize } : {}),
        deliveryUrl,
        filename,
        ...(cloudflareMedia?.height ? { height: cloudflareMedia.height } : {}),
        metadata,
        mimeType,
        status: "ready",
        updatedAt: new Date(),
        uploadedAt,
        ...(cloudflareMedia?.width ? { width: cloudflareMedia.width } : {}),
      },
    });

  const [asset] = await db
    .select()
    .from(schema.mediaAssets)
    .where(eq(schema.mediaAssets.providerAssetId, providerAssetId))
    .limit(1);

  if (!asset) {
    throw new Error(`Unable to ensure media ${providerAssetId}.`);
  }

  await db
    .insert(schema.productMedia)
    .values({
      mediaAssetId: asset.id,
      position: variant ? 10 + slot : slot,
      productId,
      role: variant || slot > 0 ? "gallery" : "featured",
      variantId: variantId ?? null,
    })
    .onConflictDoUpdate({
      target: [schema.productMedia.productId, schema.productMedia.mediaAssetId],
      set: {
        position: variant ? 10 + slot : slot,
        role: variant || slot > 0 ? "gallery" : "featured",
        updatedAt: new Date(),
        variantId: variantId ?? null,
      },
    });

  return asset;
}

function getDemoMediaProviderAssetIds(seed: ProductSeed) {
  const providerAssetIds = new Set<string>();

  function add(key: string) {
    providerAssetIds.add(getLegacyDemoProviderAssetId(key));
    providerAssetIds.add(getCloudflareDemoProviderAssetId(key));
  }

  for (let slot = 0; slot < (seed.media?.sharedSlots ?? 1); slot += 1) {
    add(getMediaKey(seed, undefined, slot));
  }

  for (const variantSeed of seed.variants) {
    for (let slot = 0; slot < (seed.media?.variantSlots ?? 2); slot += 1) {
      add(getMediaKey(seed, variantSeed, slot));
    }
  }

  return [...providerAssetIds];
}

async function clearDemoMediaForProduct(db: CommerceDb, productId: string, seed: ProductSeed) {
  const providerAssetIds = getDemoMediaProviderAssetIds(seed);
  const assets = await db
    .select({ id: schema.mediaAssets.id })
    .from(schema.mediaAssets)
    .where(
      or(
        like(schema.mediaAssets.providerAssetId, `commerce-demo-${seed.slug}%`),
        inArray(schema.mediaAssets.providerAssetId, providerAssetIds),
      ),
    );
  const assetIds = assets.map((asset) => asset.id);

  if (assetIds.length === 0) {
    return;
  }

  await db
    .delete(schema.productMedia)
    .where(
      and(
        eq(schema.productMedia.productId, productId),
        inArray(schema.productMedia.mediaAssetId, assetIds),
      ),
    );
}

async function ensureSharedMedia(db: CommerceDb, productId: string, seed: ProductSeed) {
  const sharedSlots = seed.media?.sharedSlots ?? 1;

  for (let slot = 0; slot < sharedSlots; slot += 1) {
    await ensureMedia(
      db,
      productId,
      seed,
      undefined,
      undefined,
      slot,
      isVideoSlot(seed.media?.sharedVideoSlots, slot) ? "video" : "image",
    );
  }
}

async function ensureVariantMedia(
  db: CommerceDb,
  productId: string,
  seed: ProductSeed,
  variantSeed: VariantSeed,
  variantId: string,
) {
  const variantSlots = seed.media?.variantSlots ?? 2;

  for (let slot = 0; slot < variantSlots; slot += 1) {
    await ensureMedia(
      db,
      productId,
      seed,
      variantSeed,
      variantId,
      slot,
      isVideoSlot(seed.media?.variantVideoSlots, slot) ? "video" : "image",
    );
  }
}

async function ensureAttribute(db: CommerceDb, productId: string, input: NonNullable<ProductSeed["attributes"]>[number]) {
  await db
    .insert(schema.productAttributes)
    .values({
      code: input.code,
      filterable: true,
      name: input.name,
      searchable: true,
      type: input.type ?? "text",
    })
    .onConflictDoNothing();

  const [attribute] = await db
    .select()
    .from(schema.productAttributes)
    .where(eq(schema.productAttributes.code, input.code))
    .limit(1);

  if (!attribute) {
    throw new Error(`Unable to ensure attribute ${input.code}.`);
  }

  const value = {
    valueBoolean: typeof input.value === "boolean" ? input.value : null,
    valueJson: Array.isArray(input.value) ? input.value : null,
    valueNumber: typeof input.value === "number" ? input.value : null,
    valueText: typeof input.value === "string" ? input.value : null,
  };

  await db
    .insert(schema.productAttributeValues)
    .values({
      attributeId: attribute.id,
      locale: "da",
      productId,
      ...value,
    })
    .onConflictDoNothing();
}

const reviewFixtures = [
  {
    body: "Clean taste and easy to keep in the morning routine. I bought the larger cacao size afterwards because the smaller tub went quickly.",
    comfortScore: 5,
    customer: {
      email: "mads.reviewer@snn.test",
      firstName: "Mads",
      lastName: "Kristensen",
    },
    orderNumber: "SNN-DEMO-REVIEW-1001",
    productSlug: "steady-energy-blend",
    qualityScore: 5,
    rating: 5,
    routineFitScore: 5,
    title: "Easy daily staple",
    valueScore: 4,
    variantSku: "SNN-STEADY-ENERGY-CACAO-300G",
    wouldRecommend: true,
  },
  {
    body: "Good value and mixes better than expected. The sale price made it a no-brainer, but I would like a flavoured option later.",
    comfortScore: 4,
    customer: {
      email: "sofia.reviewer@snn.test",
      firstName: "Sofia",
      lastName: "Moller",
    },
    orderNumber: "SNN-DEMO-REVIEW-1002",
    productSlug: "essential-creatine-monohydrate",
    qualityScore: 4,
    rating: 4,
    routineFitScore: 5,
    title: "Simple and reliable",
    valueScore: 5,
    variantSku: "SNN-CREATINE-300G",
    wouldRecommend: true,
  },
  {
    body: "The vanilla recovery protein sits well before bed and does not feel heavy. I use it on training days and travel days.",
    comfortScore: 5,
    customer: {
      email: "jonas.reviewer@snn.test",
      firstName: "Jonas",
      lastName: "Larsen",
    },
    orderNumber: "SNN-DEMO-REVIEW-1003",
    productSlug: "overnight-recovery-protein",
    qualityScore: 5,
    rating: 5,
    routineFitScore: 4,
    title: "Feels premium at night",
    valueScore: 4,
    variantSku: "SNN-OVERNIGHT-RECOVERY-VANILLA-750G",
    wouldRecommend: true,
  },
  {
    body: "Nice shaker and the colour options make it feel less generic. The 900ml size is the useful one for me.",
    comfortScore: 4,
    customer: {
      email: "freja.reviewer@snn.test",
      firstName: "Freja",
      lastName: "Nielsen",
    },
    orderNumber: "SNN-DEMO-REVIEW-1004",
    productSlug: "daily-training-shaker",
    qualityScore: 4,
    rating: 4,
    routineFitScore: 4,
    title: "Solid everyday shaker",
    valueScore: 4,
    variantSku: "SNN-SHAKER-BLACK-900ML",
    wouldRecommend: true,
  },
  {
    body: "The fit is good through the shoulders, but I would prefer the fabric slightly heavier. Still works well for training.",
    comfortScore: 4,
    customer: {
      email: "emil.reviewer@snn.test",
      firstName: "Emil",
      lastName: "Hansen",
    },
    orderNumber: "SNN-DEMO-REVIEW-1005",
    productSlug: "club-training-tee",
    qualityScore: 3,
    rating: 3,
    routineFitScore: 4,
    title: "Good fit, lighter fabric",
    valueScore: 3,
    variantSku: "SNN-TEE-BLACK-M",
    wouldRecommend: true,
  },
] as const;

async function ensureDemoReviewFixtures(
  db: CommerceDb,
  input: {
    salesChannelId: string;
  },
) {
  for (const fixture of reviewFixtures) {
    const [product] = await db
      .select()
      .from(schema.products)
      .where(eq(schema.products.slug, fixture.productSlug))
      .limit(1);
    const [variant] = await db
      .select()
      .from(schema.productVariants)
      .where(eq(schema.productVariants.sku, fixture.variantSku))
      .limit(1);

    if (!product || !variant) {
      continue;
    }

    await db
      .insert(schema.customerProfiles)
      .values({
        email: fixture.customer.email,
        firstName: fixture.customer.firstName,
        lastName: fixture.customer.lastName,
      })
      .onConflictDoUpdate({
        target: schema.customerProfiles.email,
        set: {
          firstName: fixture.customer.firstName,
          lastName: fixture.customer.lastName,
          updatedAt: new Date(),
        },
      });

    const [customer] = await db
      .select()
      .from(schema.customerProfiles)
      .where(eq(schema.customerProfiles.email, fixture.customer.email))
      .limit(1);

    if (!customer) {
      continue;
    }

    const totalAmount = variant.priceAmount || 10000;

    await db
      .insert(schema.orders)
      .values({
        currencyCode: "DKK",
        customerId: customer.id,
        email: customer.email,
        locale: "da",
        orderNumber: fixture.orderNumber,
        placedAt: new Date("2026-05-01T10:00:00.000Z"),
        salesChannelId: input.salesChannelId,
        shippingAmount: 0,
        status: "fulfilled",
        subtotalAmount: totalAmount,
        taxAmount: Math.round(totalAmount * 0.2),
        totalAmount,
      })
      .onConflictDoUpdate({
        target: schema.orders.orderNumber,
        set: {
          customerId: customer.id,
          email: customer.email,
          status: "fulfilled",
          subtotalAmount: totalAmount,
          taxAmount: Math.round(totalAmount * 0.2),
          totalAmount,
          updatedAt: new Date(),
        },
      });

    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.orderNumber, fixture.orderNumber))
      .limit(1);

    if (!order) {
      continue;
    }

    const [existingItem] = await db
      .select()
      .from(schema.orderItems)
      .where(and(eq(schema.orderItems.orderId, order.id), eq(schema.orderItems.variantId, variant.id)))
      .limit(1);
    const [orderItem] = existingItem
      ? await db
        .update(schema.orderItems)
        .set({
          quantity: 1,
          skuSnapshot: variant.sku,
          titleSnapshot: variant.title,
          totalAmount,
          unitPriceAmount: totalAmount,
          updatedAt: new Date(),
        })
        .where(eq(schema.orderItems.id, existingItem.id))
        .returning()
      : await db
        .insert(schema.orderItems)
        .values({
          orderId: order.id,
          quantity: 1,
          skuSnapshot: variant.sku,
          titleSnapshot: variant.title,
          totalAmount,
          unitPriceAmount: totalAmount,
          variantId: variant.id,
        })
        .returning();

    if (!orderItem) {
      continue;
    }

    await db
      .insert(schema.payments)
      .values({
        amount: totalAmount,
        capturedAmount: totalAmount,
        currencyCode: "DKK",
        externalReference: `seed-${fixture.orderNumber}`,
        orderId: order.id,
        provider: "seed",
        status: "captured",
      })
      .onConflictDoUpdate({
        target: [schema.payments.provider, schema.payments.externalReference],
        set: {
          amount: totalAmount,
          capturedAmount: totalAmount,
          status: "captured",
          updatedAt: new Date(),
        },
      });

    await db
      .insert(schema.productReviews)
      .values({
        body: fixture.body,
        comfortScore: fixture.comfortScore,
        customerId: customer.id,
        orderItemId: orderItem.id,
        productId: product.id,
        qualityScore: fixture.qualityScore,
        rating: fixture.rating,
        routineFitScore: fixture.routineFitScore,
        title: fixture.title,
        valueScore: fixture.valueScore,
        variantId: variant.id,
        wouldRecommend: fixture.wouldRecommend,
      })
      .onConflictDoUpdate({
        target: [schema.productReviews.customerId, schema.productReviews.productId],
        set: {
          body: fixture.body,
          comfortScore: fixture.comfortScore,
          orderItemId: orderItem.id,
          qualityScore: fixture.qualityScore,
          rating: fixture.rating,
          routineFitScore: fixture.routineFitScore,
          status: "published",
          title: fixture.title,
          updatedAt: new Date(),
          valueScore: fixture.valueScore,
          variantId: variant.id,
          wouldRecommend: fixture.wouldRecommend,
        },
      });
  }
}

async function main() {
  await loadRuntimeModules();

  try {
    if (!shouldApply) {
      console.log("Commerce demo seed is in dry-run mode.");
      console.log("Run `pnpm db:seed:commerce -- --apply` to seed the connected database.");
      return;
    }

    if (isProduction && process.env.ALLOW_PRODUCTION_COMMERCE_SEED !== "true") {
      throw new Error("Refusing to seed commerce demo data in production.");
    }

    const db = getDb();

    await ensureCurrency(db);
    const salesChannel = await ensureSalesChannel(db);
    const market = await ensureMarket(db, salesChannel.id);
    const location = await ensureInventoryLocation(db, salesChannel.id);
    const priceList = await ensurePriceList(db);
    const categoryRecords = new Map<string, Awaited<ReturnType<typeof ensureCategory>>>();
    const collectionRecords = new Map<string, Awaited<ReturnType<typeof ensureCollection>>>();
    const seededProductSlugs: string[] = [];

    for (const category of categories) {
      categoryRecords.set(category.slug, await ensureCategory(db, category.slug));
    }

    for (const collection of collections) {
      collectionRecords.set(collection.slug, await ensureCollection(db, collection.slug));
    }

    await ensureCloudflareDemoMedia();

    for (const seed of productSeeds) {
      const product = await ensureProduct(db, seed);
      const optionValueIds = new Map<string, string>();

      seededProductSlugs.push(product.slug);

      await clearDemoMediaForProduct(db, product.id, seed);

      await db
        .insert(schema.productSalesChannels)
        .values({
          productId: product.id,
          salesChannelId: salesChannel.id,
        })
        .onConflictDoNothing();

      for (const slug of seed.categories) {
        const category = categoryRecords.get(slug);

        if (category) {
          await db
            .insert(schema.productCategories)
            .values({
              categoryId: category.id,
              productId: product.id,
            })
            .onConflictDoNothing();
        }
      }

      for (const slug of seed.collections) {
        const collection = collectionRecords.get(slug);

        if (collection) {
          await db
            .insert(schema.collectionProducts)
            .values({
              collectionId: collection.id,
              productId: product.id,
            })
            .onConflictDoNothing();
        }
      }

      for (const [optionIndex, optionSeed] of seed.options.entries()) {
        const option = await ensureProductOption(
          db,
          product.id,
          optionSeed.code,
          optionSeed.name,
          optionIndex,
        );

        for (const [valueIndex, value] of optionSeed.values.entries()) {
          const optionValue = await ensureProductOptionValue(db, option.id, value, valueIndex);

          optionValueIds.set(`${optionSeed.code}:${value}`, optionValue.id);
        }
      }

      await ensureSharedMedia(db, product.id, seed);

      for (const attribute of seed.attributes ?? []) {
        await ensureAttribute(db, product.id, attribute);
      }

      for (const [variantIndex, variantSeed] of seed.variants.entries()) {
        const variant = await ensureVariant(db, product.id, {
          ...variantSeed,
          isDefault: variantSeed.isDefault ?? variantIndex === 0,
        });

        await ensureVariantMedia(db, product.id, seed, variantSeed, variant.id);

        for (const [code, value] of Object.entries(variantSeed.optionValues)) {
          const optionValueId = optionValueIds.get(`${code}:${value}`);

          if (!optionValueId) {
            throw new Error(`Missing option value ${code}:${value} for ${variant.sku}.`);
          }

          await db
            .insert(schema.productVariantOptionValues)
            .values({
              optionValueId,
              variantId: variant.id,
            })
            .onConflictDoNothing();
        }

        if (variant.priceSetId && typeof variantSeed.priceAmount === "number") {
          await ensureBasePrice(
            db,
            variant.priceSetId,
            market.id,
            variantSeed.priceAmount,
            variantSeed.compareAtAmount ?? null,
          );

          if (typeof variantSeed.saleAmount === "number") {
            await ensureSalePrice(
              db,
              priceList.id,
              variant.priceSetId,
              market.id,
              variantSeed.saleAmount,
              variantSeed.compareAtAmount ?? variantSeed.priceAmount,
            );
          }
        }

        await ensureInventoryForVariant(db, {
          inventoryItems: variantSeed.inventoryItems,
          locationId: location.id,
          onHand: variantSeed.sku.includes("BERRY") ? 0 : 96 - variantIndex * 12,
          sku: variantSeed.sku,
          title: variantSeed.title,
          variantId: variant.id,
        });
      }

      await recordCommerceAuditEvent({
        action: product.status === "draft" ? "catalog.product.updated" : "catalog.product.created",
        actorType: "system",
        entityId: product.id,
        entityType: "product",
        metadata: {
          seed: "commerce-demo",
          slug: product.slug,
        },
      }, db);
    }

    await ensureDemoReviewFixtures(db, {
      salesChannelId: salesChannel.id,
    });

    const health = await getCatalogHealthReport({ countryCode: "DK", locale: "da" }, db);

    console.log("Commerce demo seed complete.");
    console.log(`Market: ${market.code}`);
    console.log(`Products: ${seededProductSlugs.join(", ")}`);
    console.log(`Health issues: ${health.issues.length}`);
  } finally {
    await closeDb?.();
  }
}

main().catch((error) => {
  console.error("Commerce demo seed failed.");
  console.error(error);
  process.exitCode = 1;
});
