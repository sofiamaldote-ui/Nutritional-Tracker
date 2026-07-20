/**
 * Idempotent startup migration for consultation_attachments.
 *
 * Runs on every server start and is safe to execute multiple times:
 *   1. Creates the `attachment_section` enum if absent.
 *   2. Creates the `consultation_attachments` table if absent.
 *   3. Backfills legacy bioimpedancePdfPath / menuPdfPath fields into the new
 *      table (section = exames / cardapios), skipping paths already present.
 *
 * Failure throws — caller should treat this as a hard error.
 */
import { pool } from "@workspace/db";

export async function runStartupMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Create enum (idempotent)
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE attachment_section AS ENUM ('exames', 'cardapios');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    // 2. Create table (idempotent)
    await client.query(`
      CREATE TABLE IF NOT EXISTS consultation_attachments (
        id          SERIAL PRIMARY KEY,
        consultation_id INTEGER NOT NULL,
        section     attachment_section NOT NULL,
        file_name   TEXT NOT NULL,
        file_path   TEXT NOT NULL,
        mime_type   TEXT,
        size_bytes  INTEGER,
        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Recreate session table if missing (drizzle-kit push wipes it)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid"    varchar        NOT NULL COLLATE "default",
        "sess"   json           NOT NULL,
        "expire" timestamp(6)   NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
      CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
    `);

    // 4. Backfill bioimpedance PDF → section 'exames'
    await client.query(`
      INSERT INTO consultation_attachments
             (consultation_id, section, file_name, file_path, mime_type)
      SELECT c.id,
             'exames',
             'bioimpedancia.pdf',
             c.bioimpedance_pdf_path,
             'application/pdf'
      FROM   consultations c
      WHERE  c.bioimpedance_pdf_path IS NOT NULL
        AND  c.bioimpedance_pdf_path <> ''
        AND  NOT EXISTS (
               SELECT 1
               FROM   consultation_attachments a
               WHERE  a.consultation_id = c.id
                 AND  a.file_path = c.bioimpedance_pdf_path
             );
    `);

    // 5. Backfill menu PDF → section 'cardapios'
    await client.query(`
      INSERT INTO consultation_attachments
             (consultation_id, section, file_name, file_path, mime_type)
      SELECT c.id,
             'cardapios',
             'cardapio.pdf',
             c.menu_pdf_path,
             'application/pdf'
      FROM   consultations c
      WHERE  c.menu_pdf_path IS NOT NULL
        AND  c.menu_pdf_path <> ''
        AND  NOT EXISTS (
               SELECT 1
               FROM   consultation_attachments a
               WHERE  a.consultation_id = c.id
                 AND  a.file_path = c.menu_pdf_path
             );
    `);

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
