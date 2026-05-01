export const roadmapPhases = [
  "Foundation",
  "Theme system",
  "Front page",
  "Header and footer",
  "Auth pages",
  "Continue feature delivery",
] as const;

export const staffPermissionGroups = {
  catalog: [
    "catalog:read",
    "catalog:write",
    "catalog:publish",
  ],
  inventory: [
    "inventory:read",
    "inventory:write",
    "inventory:adjust",
  ],
  orders: [
    "orders:read",
    "orders:write",
    "orders:fulfill",
    "orders:refund",
  ],
  customers: [
    "customers:read",
    "customers:write",
  ],
  settings: [
    "settings:read",
    "settings:write",
    "staff:manage",
  ],
} as const;

export type StaffPermission = (typeof staffPermissionGroups)[keyof typeof staffPermissionGroups][number];

