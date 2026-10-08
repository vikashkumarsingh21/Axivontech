# PHASE 1 — DATABASE CONNECTION ARCHITECTURE

## Environment Variables
Server-side environment variables will be mapped to the four new databases. The existing `DATABASE_URL` will be retained as a fallback during the transition to ensure backward compatibility.

```env
# Existing Monolith DB
DATABASE_URL="postgres://..."
SESSION_SECRET="..."

# Phase 2 Multi-Database URLs
CORE_DATABASE_URL="postgres://..."
CLIENT_DATABASE_URL="postgres://..."
EMPLOYEE_DATABASE_URL="postgres://..."
BROKER_DATABASE_URL="postgres://..."
```

## Client Instantiation
To avoid Edge function connection exhaustion and memory limits, Prisma clients will be cached in `globalThis` using standard Next.js patterns, separated by domain.

Location: `src/lib/db/index.ts`

```typescript
import { PrismaClient as CoreClient } from "@prisma/client/core";
import { PrismaClient as ClientClient } from "@prisma/client/client";
import { PrismaClient as EmployeeClient } from "@prisma/client/employee";
import { PrismaClient as BrokerClient } from "@prisma/client/broker";

const globalForPrisma = globalThis as unknown as {
  coreDb: CoreClient | undefined;
  clientDb: ClientClient | undefined;
  employeeDb: EmployeeClient | undefined;
  brokerDb: BrokerClient | undefined;
};

export const coreDb = globalForPrisma.coreDb ?? new CoreClient({
    datasourceUrl: process.env.CORE_DATABASE_URL
});
export const clientDb = globalForPrisma.clientDb ?? new ClientClient({
    datasourceUrl: process.env.CLIENT_DATABASE_URL
});
export const employeeDb = globalForPrisma.employeeDb ?? new EmployeeClient({
    datasourceUrl: process.env.EMPLOYEE_DATABASE_URL
});
export const brokerDb = globalForPrisma.brokerDb ?? new BrokerClient({
    datasourceUrl: process.env.BROKER_DATABASE_URL
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.coreDb = coreDb;
  globalForPrisma.clientDb = clientDb;
  globalForPrisma.employeeDb = employeeDb;
  globalForPrisma.brokerDb = brokerDb;
}
```

## Backward Compatibility (Phase 1)
During Phase 1, `src/lib/db.ts` (the current monolith client) will remain exactly as it is, pointing to `DATABASE_URL`. This guarantees that ZERO production data or application logic breaks during the foundation stage. 

The new multi-db clients in `src/lib/db/index.ts` will only be used by new services testing the architecture in parallel.
