/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { AsyncLocalStorage } from "node:async_hooks";
import { performance } from "node:perf_hooks";

import type { Pool } from "pg";

type PerformanceMetadataValue = boolean | number | string | null | undefined;
type PerformanceMetadata = Record<string, PerformanceMetadataValue>;

type PerformanceTraceContext = {
  queryCount: number;
  queryDurationMs: number;
};

const traceStore = new AsyncLocalStorage<PerformanceTraceContext>();
const enabledValues = new Set(["1", "true", "yes"]);
const maxMetadataStringLength = 96;

function isEnabledValue(value: string | undefined) {
  return value ? enabledValues.has(value.toLowerCase()) : false;
}

export function isPerformanceTraceEnabled() {
  return (
    isEnabledValue(process.env.ENABLE_PERFORMANCE_TRACE) &&
    process.env.VERCEL_ENV === "preview"
  );
}

function roundDuration(durationMs: number) {
  return Math.round(durationMs * 10) / 10;
}

function normalizeMetadata(metadata: PerformanceMetadata = {}) {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === "string"
          ? value.slice(0, maxMetadataStringLength)
          : value,
      ]),
  );
}

function logPerformanceEvent(input: {
  durationMs: number;
  error?: unknown;
  metadata?: PerformanceMetadata | undefined;
  name: string;
  queryCount: number;
  queryDurationMs: number;
  status: "error" | "ok";
}) {
  const error = input.error instanceof Error
    ? input.error.name
    : input.error
      ? "UnknownError"
      : undefined;

  const payload = {
    durationMs: roundDuration(input.durationMs),
    error,
    event: "performance.trace",
    level: input.status === "ok" ? "info" : "error",
    name: input.name,
    queryCount: input.queryCount,
    queryDurationMs: roundDuration(input.queryDurationMs),
    source: "snn",
    status: input.status,
    ...normalizeMetadata(input.metadata),
  };
  const line = JSON.stringify(payload);

  if (input.status === "ok") {
    console.log(line);
  } else {
    console.error(line);
  }
}

export async function tracePerformance<T>(
  name: string,
  metadata: PerformanceMetadata,
  operation: () => Promise<T>,
) {
  if (!isPerformanceTraceEnabled()) {
    return operation();
  }

  const startedAt = performance.now();
  const context: PerformanceTraceContext = {
    queryCount: 0,
    queryDurationMs: 0,
  };

  return traceStore.run(context, async () => {
    try {
      const result = await operation();

      logPerformanceEvent({
        durationMs: performance.now() - startedAt,
        metadata,
        name,
        queryCount: context.queryCount,
        queryDurationMs: context.queryDurationMs,
        status: "ok",
      });

      return result;
    } catch (error) {
      logPerformanceEvent({
        durationMs: performance.now() - startedAt,
        error,
        metadata,
        name,
        queryCount: context.queryCount,
        queryDurationMs: context.queryDurationMs,
        status: "error",
      });

      throw error;
    }
  });
}

function recordQuery(durationMs: number) {
  const context = traceStore.getStore();

  if (!context) {
    return;
  }

  context.queryCount += 1;
  context.queryDurationMs += durationMs;
}

export function instrumentPoolForPerformance(pool: Pool) {
  const originalQuery = pool.query.bind(pool) as (...args: any[]) => any;

  pool.query = ((...args: any[]) => {
    if (!isPerformanceTraceEnabled()) {
      return originalQuery(...args);
    }

    const callbackIndex = args.findIndex((arg) => typeof arg === "function");
    const startedAt = performance.now();

    if (callbackIndex >= 0) {
      const callback = args[callbackIndex];

      args[callbackIndex] = (...callbackArgs: any[]) => {
        recordQuery(performance.now() - startedAt);

        return callback(...callbackArgs);
      };

      return originalQuery(...args);
    }

    const result = originalQuery(...args);

    if (result && typeof result.then === "function") {
      return result.finally(() => {
        recordQuery(performance.now() - startedAt);
      });
    }

    recordQuery(performance.now() - startedAt);

    return result;
  }) as typeof pool.query;

  return pool;
}
