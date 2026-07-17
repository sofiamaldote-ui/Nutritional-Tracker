import { Router, type IRouter } from "express";
import { eq, desc, or, inArray } from "drizzle-orm";
import { db, publicationsTable, publicationGroupsTable, publicationPatientsTable, consultationsTable, patientsTable, patientGroupsTable, groupsTable, patientPublicationViewsTable } from "@workspace/db";
import { GetPatientFeedQueryParams, GetMyConsultationParams } from "@workspace/api-zod";
import { requirePatient } from "../lib/session";

const router: IRouter = Router();

// GET /portal/feed — patient's content feed (backend-filtered)
router.get("/portal/feed", requirePatient, async (req, res): Promise<void> => {
  const patientId = req.session.patientId!;
  const params = GetPatientFeedQueryParams.safeParse(req.query);
  const category = params.success ? params.data.category : undefined;

  // Get patient's group IDs
  const patientGroups = await db
    .select({ groupId: patientGroupsTable.groupId })
    .from(patientGroupsTable)
    .where(eq(patientGroupsTable.patientId, patientId));
  const groupIds = patientGroups.map(g => g.groupId);

  // Get publications the patient can see:
  // 1. Geral (todos)
  // 2. Their groups
  // 3. Individual (this patient)
  let allPublications = await db
    .select()
    .from(publicationsTable)
    .where(eq(publicationsTable.status, "publicado"))
    .orderBy(desc(publicationsTable.publishedAt));

  // Filter by visibility
  const visibleIds: number[] = [];
  for (const pub of allPublications) {
    if (pub.visibility === "geral") {
      visibleIds.push(pub.id);
    } else if (pub.visibility === "grupos" && groupIds.length > 0) {
      const pubGroups = await db
        .select({ groupId: publicationGroupsTable.groupId })
        .from(publicationGroupsTable)
        .where(eq(publicationGroupsTable.publicationId, pub.id));
      const overlap = pubGroups.some(pg => groupIds.includes(pg.groupId));
      if (overlap) visibleIds.push(pub.id);
    } else if (pub.visibility === "pacientes") {
      const pubPatients = await db
        .select({ patientId: publicationPatientsTable.patientId })
        .from(publicationPatientsTable)
        .where(eq(publicationPatientsTable.publicationId, pub.id));
      if (pubPatients.some(pp => pp.patientId === patientId)) visibleIds.push(pub.id);
    }
  }

  let visible = allPublications.filter(p => visibleIds.includes(p.id));
  if (category && category !== "all") {
    visible = visible.filter(p => p.category === category);
  }

  // Get viewed publication IDs
  const viewed = await db
    .select({ publicationId: patientPublicationViewsTable.publicationId })
    .from(patientPublicationViewsTable)
    .where(eq(patientPublicationViewsTable.patientId, patientId));
  const viewedIds = new Set(viewed.map(v => v.publicationId));

  // Mark new items (published in last 7 days and not viewed)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  res.json(visible.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description ?? null,
    category: p.category,
    status: p.status,
    visibility: p.visibility,
    videoUrl: p.videoUrl ?? null,
    pdfPath: p.pdfPath ?? null,
    imagePath: p.imagePath ?? null,
    groupIds: [],
    patientIds: [],
    groups: [],
    createdAt: p.createdAt.toISOString(),
    publishedAt: p.publishedAt?.toISOString() ?? null,
    isNew: !viewedIds.has(p.id) && p.publishedAt != null && p.publishedAt > sevenDaysAgo,
  })));
});

// GET /portal/consultations
router.get("/portal/consultations", requirePatient, async (req, res): Promise<void> => {
  const patientId = req.session.patientId!;

  const consultations = await db
    .select()
    .from(consultationsTable)
    .where(eq(consultationsTable.patientId, patientId))
    .orderBy(desc(consultationsTable.date));

  res.json(consultations.map(c => ({
    id: c.id,
    patientId: c.patientId,
    type: c.type,
    date: c.date,
    weight: c.weight ?? null,
    height: c.height ?? null,
    bmi: c.bmi ?? null,
    createdAt: c.createdAt.toISOString(),
  })));
});

// GET /portal/consultations/:consultationId
router.get("/portal/consultations/:consultationId", requirePatient, async (req, res): Promise<void> => {
  const patientId = req.session.patientId!;
  const params = GetMyConsultationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [c] = await db
    .select()
    .from(consultationsTable)
    .where(eq(consultationsTable.id, params.data.consultationId));

  if (!c || c.patientId !== patientId) {
    res.status(404).json({ error: "Consulta não encontrada" });
    return;
  }

  res.json({
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
    comparison: null,
  });
});

// GET /portal/profile
router.get("/portal/profile", requirePatient, async (req, res): Promise<void> => {
  const patientId = req.session.patientId!;

  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, patientId));
  if (!patient) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }

  const memberGroups = await db
    .select({ id: groupsTable.id, name: groupsTable.name, color: groupsTable.color })
    .from(patientGroupsTable)
    .innerJoin(groupsTable, eq(patientGroupsTable.groupId, groupsTable.id))
    .where(eq(patientGroupsTable.patientId, patientId));

  const consultationCount = (await db.select().from(consultationsTable).where(eq(consultationsTable.patientId, patientId))).length;

  res.json({
    id: patient.id,
    name: patient.name,
    email: patient.email,
    phone: patient.phone ?? null,
    birthDate: patient.birthDate ?? null,
    sex: patient.sex ?? null,
    hasAccess: true,
    createdAt: patient.createdAt.toISOString(),
    groups: memberGroups,
    consultationCount,
  });
});

export default router;
