import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { createdAt, metadata, primaryUuid, updatedAt } from "./shared";
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

