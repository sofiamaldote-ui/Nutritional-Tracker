---
name: Session table manual creation
description: The "session" table for connect-pg-simple is NOT managed by Drizzle — must be recreated manually after any drizzle-kit push that resets the schema.
---

## Rule

The `"session"` table is used by `connect-pg-simple` for session persistence. It is NOT defined in the Drizzle schema, so **every `drizzle-kit push` that recreates the DB will drop it**.

**Why:** Drizzle only manages tables defined in its schema files. The session table is an external operational table that must exist independently.

**How to apply:** After any `drizzle-kit push`, run:

```sql
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
```

Use the `executeSql` CodeExecution callback to run this. Without it, every API request returns 500 with `relation "session" does not exist`.
