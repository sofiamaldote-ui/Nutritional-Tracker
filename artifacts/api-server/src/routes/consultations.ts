import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, consultationsTable, patientsTable } from "@workspace/db";
import {
  ListConsultationsParams,
  CreateConsultationParams,
  CreateConsultationBody,
  GetConsultationParams,
  UpdateConsultationParams,
  UpdateConsultationBody,
  DeleteConsultationParams,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();

function calcBmi(weight?: number | null, height?: number | null): number | null {
  if (!weight || !height || height <= 0) return null;
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 100) / 100;
}

function buildComparison(current: typeof consultationsTable.$inferSelect, baseline: typeof consultationsTable.$inferSelect) {
  const delta = (cur: number | null | undefined, base: number | null | undefined) =>
    cur != null && base != null ? Math.round((cur - base) * 100) / 100 : null;

  return {
    weightDelta: delta(current.weight, baseline.weight),
    bmiDelta: delta(current.bmi, baseline.bmi),
    waistDelta: delta(current.waistCm, baseline.waistCm),
    hipDelta: delta(current.hipCm, baseline.hipCm),
    abdomenDelta: delta(current.abdomenCm, baseline.abdomenCm),
    armDelta: delta(current.armCm, baseline.armCm),
    thighDelta: delta(current.thighCm, baseline.thighCm),
    calfDelta: delta(current.calfCm, baseline.calfCm),
  };
}

function formatConsultation(c: typeof consultationsTable.$inferSelect) {
  return {
    id: c.id,
    patientId: c.patientId,
    type: c.type,
    date: c.date,
    weight: c.weight ?? null,
    height: c.height ?? null,
    bmi: c.bmi ?? null,
    createdAt: c.createdAt.toISOString(),
  };
}

function formatConsultationDetail(c: typeof consultationsTable.$inferSelect, comparison?: ReturnType<typeof buildComparison> | null) {
  return {
    id: c.id,
    patientId: c.patientId,
    type: c.type,
    date: c.date,
    createdAt: c.createdAt.toISOString(),
    weight: c.weight ?? null,
    height: c.height ?? null,
    bmi: c.bmi ?? null,
    waistCm: c.waistCm ?? null,
    hipCm: c.hipCm ?? null,
    abdomenCm: c.abdomenCm ?? null,
    armCm: c.armCm ?? null,
    thighCm: c.thighCm ?? null,
    calfCm: c.calfCm ?? null,
    bioimpedancePdfPath: c.bioimpedancePdfPath ?? null,
    notes: c.notes ?? null,
    objective: c.objective ?? null,
    vetKcal: c.vetKcal ?? null,
    menuPdfPath: c.menuPdfPath ?? null,
    restrictions: c.restrictions ?? null,
    additionalGuidance: c.additionalGuidance ?? null,
    baselineConsultationId: c.baselineConsultationId ?? null,
    evolutionNotes: c.evolutionNotes ?? null,
    comparison: comparison ?? null,
  };
}

// GET /patients/:patientId/consultations
router.get("/patients/:patientId/consultations", requireAuth, async (req, res): Promise<void> => {
  const params = ListConsultationsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // If patient role, check ownership
  if (req.session.role === "paciente" && req.session.patientId !== params.data.patientId) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const consultations = await db
    .select()
    .from(consultationsTable)
    .where(eq(consultationsTable.patientId, params.data.patientId))
    .orderBy(desc(consultationsTable.date));

  res.json(consultations.map(formatConsultation));
});

// POST /patients/:patientId/consultations
router.post("/patients/:patientId/consultations", requireAuth, async (req, res): Promise<void> => {
  if (req.session.role !== "nutricionista") {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const params = CreateConsultationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateConsultationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { type, date, weight, height, ...rest } = parsed.data;
  const bmi = calcBmi(weight, height);

  const [consultation] = await db.insert(consultationsTable).values({
    patientId: params.data.patientId,
    type: type as any,
    date,
    weight: weight ?? null,
    height: height ?? null,
    bmi,
    waistCm: rest.waistCm ?? null,
    hipCm: rest.hipCm ?? null,
    abdomenCm: rest.abdomenCm ?? null,
    armCm: rest.armCm ?? null,
    thighCm: rest.thighCm ?? null,
    calfCm: rest.calfCm ?? null,
    bioimpedancePdfPath: rest.bioimpedancePdfPath ?? null,
    notes: rest.notes ?? null,
    objective: rest.objective ?? null,
    vetKcal: rest.vetKcal ?? null,
    menuPdfPath: rest.menuPdfPath ?? null,
    restrictions: rest.restrictions ?? null,
    additionalGuidance: rest.additionalGuidance ?? null,
    baselineConsultationId: rest.baselineConsultationId ?? null,
    evolutionNotes: rest.evolutionNotes ?? null,
  }).returning();

  res.status(201).json(formatConsultation(consultation));
});

// GET /patients/:patientId/consultations/:consultationId
router.get("/patients/:patientId/consultations/:consultationId", requireAuth, async (req, res): Promise<void> => {
  const params = GetConsultationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (req.session.role === "paciente" && req.session.patientId !== params.data.patientId) {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const [consultation] = await db
    .select()
    .from(consultationsTable)
    .where(and(
      eq(consultationsTable.id, params.data.consultationId),
      eq(consultationsTable.patientId, params.data.patientId)
    ));

  if (!consultation) {
    res.status(404).json({ error: "Consulta não encontrada" });
    return;
  }

  let comparison = null;
  if (consultation.type === "reavaliacao" && consultation.baselineConsultationId) {
    const [baseline] = await db
      .select()
      .from(consultationsTable)
      .where(eq(consultationsTable.id, consultation.baselineConsultationId));
    if (baseline) {
      comparison = buildComparison(consultation, baseline);
    }
  }

  res.json(formatConsultationDetail(consultation, comparison));
});

// PATCH /patients/:patientId/consultations/:consultationId
router.patch("/patients/:patientId/consultations/:consultationId", requireAuth, async (req, res): Promise<void> => {
  if (req.session.role !== "nutricionista") {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const params = UpdateConsultationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateConsultationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { weight, height, ...rest } = parsed.data;
  const bmi = weight !== undefined || height !== undefined
    ? calcBmi(weight, height)
    : undefined;

  const updateData: any = { ...rest };
  if (weight !== undefined) updateData.weight = weight;
  if (height !== undefined) updateData.height = height;
  if (bmi !== undefined) updateData.bmi = bmi;

  const [updated] = await db
    .update(consultationsTable)
    .set(updateData)
    .where(and(
      eq(consultationsTable.id, params.data.consultationId),
      eq(consultationsTable.patientId, params.data.patientId)
    ))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Consulta não encontrada" });
    return;
  }

  let comparison = null;
  if (updated.type === "reavaliacao" && updated.baselineConsultationId) {
    const [baseline] = await db
      .select()
      .from(consultationsTable)
      .where(eq(consultationsTable.id, updated.baselineConsultationId));
    if (baseline) comparison = buildComparison(updated, baseline);
  }

  res.json(formatConsultationDetail(updated, comparison));
});

// DELETE /patients/:patientId/consultations/:consultationId
router.delete("/patients/:patientId/consultations/:consultationId", requireAuth, async (req, res): Promise<void> => {
  if (req.session.role !== "nutricionista") {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }

  const params = DeleteConsultationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(consultationsTable)
    .where(and(
      eq(consultationsTable.id, params.data.consultationId),
      eq(consultationsTable.patientId, params.data.patientId)
    ));

  res.sendStatus(204);
});

export default router;
