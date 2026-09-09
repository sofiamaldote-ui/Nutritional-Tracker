import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, consultationAttachmentsTable, consultationsTable } from "@workspace/db";
import { requireAuth } from "../lib/session";
import {
  ListAttachmentsParams,
  CreateAttachmentParams,
  CreateAttachmentBody,
  DeleteAttachmentParams,
} from "@workspace/api-zod";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

function formatAttachment(a: typeof consultationAttachmentsTable.$inferSelect) {
  return {
    id: a.id,
    consultationId: a.consultationId,
    section: a.section,
    fileName: a.fileName,
    filePath: a.filePath,
    mimeType: a.mimeType ?? null,
    sizeBytes: a.sizeBytes ?? null,
    uploadedAt: a.uploadedAt.toISOString(),
  };
}

// GET /patients/:patientId/consultations/:consultationId/attachments
router.get(
  "/patients/:patientId/consultations/:consultationId/attachments",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = ListAttachmentsParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    // Patients can only see their own consultations
    if (req.session.role === "paciente" && req.session.patientId !== params.data.patientId) {
      res.status(403).json({ error: "Acesso negado" });
      return;
    }

    // Verify consultation belongs to patient
    const [consultation] = await db
      .select()
      .from(consultationsTable)
      .where(
        and(
          eq(consultationsTable.id, params.data.consultationId),
          eq(consultationsTable.patientId, params.data.patientId)
        )
      );
    if (!consultation) {
      res.status(404).json({ error: "Consulta não encontrada" });
      return;
    }

    const attachments = await db
      .select()
      .from(consultationAttachmentsTable)
      .where(eq(consultationAttachmentsTable.consultationId, params.data.consultationId));

    res.json(attachments.map(formatAttachment));
  }
);

// POST /patients/:patientId/consultations/:consultationId/attachments
router.post(
  "/patients/:patientId/consultations/:consultationId/attachments",
  requireAuth,
  async (req, res): Promise<void> => {
    if (req.session.role !== "nutricionista") {
      res.status(403).json({ error: "Acesso negado" });
      return;
    }

    const params = CreateAttachmentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    const parsed = CreateAttachmentBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    // Verify consultation belongs to patient
    const [consultation] = await db
      .select()
      .from(consultationsTable)
      .where(
        and(
          eq(consultationsTable.id, params.data.consultationId),
          eq(consultationsTable.patientId, params.data.patientId)
        )
      );
    if (!consultation) {
      res.status(404).json({ error: "Consulta não encontrada" });
      return;
    }

    const [attachment] = await db
      .insert(consultationAttachmentsTable)
      .values({
        consultationId: params.data.consultationId,
        section: parsed.data.section as any,
        fileName: parsed.data.fileName,
        filePath: parsed.data.filePath,
        mimeType: parsed.data.mimeType ?? null,
        sizeBytes: parsed.data.sizeBytes ?? null,
      })
      .returning();

    res.status(201).json(formatAttachment(attachment));
  }
);

// DELETE /patients/:patientId/consultations/:consultationId/attachments/:attachmentId
router.delete(
  "/patients/:patientId/consultations/:consultationId/attachments/:attachmentId",
  requireAuth,
  async (req, res): Promise<void> => {
    if (req.session.role !== "nutricionista") {
      res.status(403).json({ error: "Acesso negado" });
      return;
    }

    const params = DeleteAttachmentParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }

    // Verify consultation belongs to this patient (ownership check)
    const [consultation] = await db
      .select()
      .from(consultationsTable)
      .where(
        and(
          eq(consultationsTable.id, params.data.consultationId),
          eq(consultationsTable.patientId, params.data.patientId)
        )
      );
    if (!consultation) {
      res.status(404).json({ error: "Consulta não encontrada" });
      return;
    }

    // Find attachment and verify it belongs to this consultation
    const [attachment] = await db
      .select()
      .from(consultationAttachmentsTable)
      .where(
        and(
          eq(consultationAttachmentsTable.id, params.data.attachmentId),
          eq(consultationAttachmentsTable.consultationId, params.data.consultationId)
        )
      );

    if (!attachment) {
      res.status(404).json({ error: "Arquivo não encontrado" });
      return;
    }

    // Delete from storage (best effort — don't fail if file already gone)
    try {
      await objectStorageService.deleteObject(attachment.filePath);
    } catch (err) {
      req.log.warn({ err }, "Could not delete file from storage, proceeding with DB delete");
    }

    await db
      .delete(consultationAttachmentsTable)
      .where(eq(consultationAttachmentsTable.id, params.data.attachmentId));

    res.sendStatus(204);
  }
);

export default router;
