import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import {
  createdAt,
  metadata,
  primaryUuid,
  privacyRequestStatusEnum,
  privacyRequestTypeEnum,
  updatedAt,
} from "./shared";
import { users } from "./auth";

export const auditLogs = pgTable(
  "audit_log",
  {
    id: primaryUuid("id"),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    actorType: text("actor_type").notNull().default("user"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: metadata("metadata"),
    createdAt: createdAt(),
  },
  (table) => [
    index("audit_log_actor_idx").on(table.actorUserId),
  ],
);

export const webhookEvents = pgTable(
  "webhook_event",
  {
    id: primaryUuid("id"),
    source: text("source").notNull(),
    externalEventId: text("external_event_id").notNull(),
    type: text("type").notNull(),
    payload: metadata("payload"),
    status: text("status").notNull().default("pending"),
    receivedAt: createdAt(),
    processedAt: text("processed_at"),
    updatedAt: updatedAt(),
  },
  (table) => [
    uniqueIndex("webhook_event_source_external_unique").on(table.source, table.externalEventId),
  ],
);

export const privacyRequests = pgTable(
  "privacy_request",
  {
    id: primaryUuid("id"),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    type: privacyRequestTypeEnum("type").notNull(),
    status: privacyRequestStatusEnum("status").notNull().default("pending"),
    notes: text("notes"),
    metadata: metadata("metadata"),
    requestedAt: createdAt(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    updatedAt: updatedAt(),
  },
  (table) => [
    index("privacy_request_user_idx").on(table.userId),
    index("privacy_request_email_idx").on(table.email),
    index("privacy_request_status_idx").on(table.status),
  ],
);
