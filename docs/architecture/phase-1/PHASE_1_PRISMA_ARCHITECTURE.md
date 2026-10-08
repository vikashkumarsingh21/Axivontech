# PHASE 1 — PRISMA ARCHITECTURE

## Schema Splitting Strategy
The monolithic `prisma/schema.prisma` will be split into four distinct folders.

```text
prisma/
├── core/
│   └── schema.prisma
├── client/
│   └── schema.prisma
├── employee/
│   └── schema.prisma
└── broker/
    └── schema.prisma
```

## Generator Configurations
Each schema will generate its own Prisma Client into a separate `node_modules` path to prevent collisions.

**Core Schema (`prisma/core/schema.prisma`)**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/@prisma/client/core"
}
datasource db {
  provider = "postgresql"
  url      = env("CORE_DATABASE_URL")
}
```

**Client Schema (`prisma/client/schema.prisma`)**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/@prisma/client/client"
}
datasource db {
  provider = "postgresql"
  url      = env("CLIENT_DATABASE_URL")
}
```

**Employee Schema (`prisma/employee/schema.prisma`)**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/@prisma/client/employee"
}
datasource db {
  provider = "postgresql"
  url      = env("EMPLOYEE_DATABASE_URL")
}
```

**Broker Schema (`prisma/broker/schema.prisma`)**
```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/@prisma/client/broker"
}
datasource db {
  provider = "postgresql"
  url      = env("BROKER_DATABASE_URL")
}
```

## Relational Integrity Constraints
During the splitting process, cross-database relations must be removed from Prisma.

**Example Conversion (Before):**
```prisma
model Task {
  id               String          @id
  partnerProjectId String
  partnerProject   PartnerProject  @relation(fields: [partnerProjectId], references: [id])
}
```

**Example Conversion (After - Employee DB):**
```prisma
model Task {
  id               String  @id
  partnerProjectId String? @index // Soft link to Client DB
}
```

## Validation & Scripts
We will add standard scripts to `package.json` to handle multi-schema generation safely without destroying the default DB connection for Phase 1.

```json
{
  "scripts": {
    "prisma:generate:all": "prisma generate --schema=prisma/core/schema.prisma && prisma generate --schema=prisma/client/schema.prisma && prisma generate --schema=prisma/employee/schema.prisma && prisma generate --schema=prisma/broker/schema.prisma"
  }
}
```
