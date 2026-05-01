import { boolean, index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, foreignUuid, metadata, primaryUuid, staffAssignmentStatusEnum, updatedAt } from "./shared";
import { users } from "./auth";

export const staffRoles = pgTable(
  "staff_role",
  {
    id: primaryUuid("id"),
    code: text("code").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    system: boolean("system").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("staff_role_code_unique").on(table.code),
  ],
);

export const staffPermissions = pgTable(
  "staff_permission",
  {
    id: primaryUuid("id"),
    code: text("code").notNull(),
    group: text("group").notNull(),
    description: text("description"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("staff_permission_code_unique").on(table.code),
  ],
);

export const staffRolePermissions = pgTable(
  "staff_role_permission",
  {
    id: primaryUuid("id"),
    roleId: foreignUuid("role_id")
      .notNull()
      .references(() => staffRoles.id, { onDelete: "cascade" }),
    permissionId: foreignUuid("permission_id")
      .notNull()
      .references(() => staffPermissions.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    uniqueIndex("staff_role_permission_unique").on(table.roleId, table.permissionId),
  ],
);

export const staffAssignments = pgTable(
  "staff_assignment",
  {
    id: primaryUuid("id"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: foreignUuid("role_id")
      .notNull()
      .references(() => staffRoles.id, { onDelete: "cascade" }),
    status: staffAssignmentStatusEnum("status").notNull().default("active"),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("staff_assignment_unique").on(table.userId, table.roleId),
    index("staff_assignment_user_idx").on(table.userId),
  ],
);
