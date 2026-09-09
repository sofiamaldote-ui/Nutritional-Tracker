import { Router, type IRouter } from "express";
import { eq, desc, and, inArray } from "drizzle-orm";
import { db, publicationsTable, publicationGroupsTable, publicationPatientsTable, groupsTable } from "@workspace/db";
import {
  ListPublicationsQueryParams,
  CreatePublicationBody,
  GetPublicationParams,
  UpdatePublicationParams,
  UpdatePublicationBody,
  DeletePublicationParams,
  TogglePublicationStatusParams,
} from "@workspace/api-zod";
import { requireNutritionist } from "../lib/session";

const router: IRouter = Router();

async function getPublicationWithRelations(id: number) {
  const [pub] = await db.select().from(publicationsTable).where(eq(publicationsTable.id, id));
  if (!pub) return null;

  const pubGroups = await db
    .select({ id: publicationGroupsTable.groupId })
    .from(publicationGroupsTable)
    .where(eq(publicationGroupsTable.publicationId, id));

  const pubPatients = await db
    .select({ id: publicationPatientsTable.patientId })
    .from(publicationPatientsTable)
    .where(eq(publicationPatientsTable.publicationId, id));

  const groupIds = pubGroups.map(g => g.id);
  const groups = groupIds.length > 0
    ? await db.select({ id: groupsTable.id, name: groupsTable.name, color: groupsTable.color })
        .from(groupsTable)
        .where(inArray(groupsTable.id, groupIds))
    : [];

  return {
    id: pub.id,
    title: pub.title,
    description: pub.description ?? null,
    category: pub.category,
    status: pub.status,
    visibility: pub.visibility,
    videoUrl: pub.videoUrl ?? null,
    pdfPath: pub.pdfPath ?? null,
    linkUrl: pub.linkUrl ?? null,
    imagePath: pub.imagePath ?? null,
    groupIds,
    patientIds: pubPatients.map(p => p.id),
    groups,
    createdAt: pub.createdAt.toISOString(),
    publishedAt: pub.publishedAt?.toISOString() ?? null,
    isNew: false,
  };
}

// GET /biblioteca
router.get("/biblioteca", requireNutritionist, async (req, res): Promise<void> => {
  const params = ListPublicationsQueryParams.safeParse(req.query);
  const { status = "all", category = "all" } = params.success ? params.data : {};

  let publications = await db.select().from(publicationsTable).orderBy(desc(publicationsTable.createdAt));

  if (status && status !== "all") {
    const dbStatus = status === "published" ? "publicado" : status === "draft" ? "rascunho" : status;
    publications = publications.filter(p => p.status === dbStatus);
  }
  if (category && category !== "all") {
    publications = publications.filter(p => p.category === category);
  }

  const result = await Promise.all(publications.map(p => getPublicationWithRelations(p.id)));
  res.json(result.filter(Boolean));
});

// POST /biblioteca
router.post("/biblioteca", requireNutritionist, async (req, res): Promise<void> => {
  const parsed = CreatePublicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { groupIds, patientIds, status = "rascunho", ...rest } = parsed.data;

  const [pub] = await db.insert(publicationsTable).values({
    title: rest.title,
    description: rest.description ?? null,
    category: rest.category as any,
    status: status as any,
    visibility: rest.visibility as any,
    videoUrl: rest.videoUrl ?? null,
    pdfPath: rest.pdfPath ?? null,
    linkUrl: rest.linkUrl ?? null,
    imagePath: rest.imagePath ?? null,
    publishedAt: status === "publicado" ? new Date() : null,
  }).returning();

  if (groupIds && groupIds.length > 0) {
    await db.insert(publicationGroupsTable).values(
      groupIds.map(gid => ({ publicationId: pub.id, groupId: gid }))
    );
  }
  if (patientIds && patientIds.length > 0) {
    await db.insert(publicationPatientsTable).values(
      patientIds.map(pid => ({ publicationId: pub.id, patientId: pid }))
    );
  }

  const result = await getPublicationWithRelations(pub.id);
  res.status(201).json(result);
});

// GET /biblioteca/:id
router.get("/biblioteca/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = GetPublicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = await getPublicationWithRelations(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Publicação não encontrada" });
    return;
  }

  res.json(result);
});

// PATCH /biblioteca/:id
router.patch("/biblioteca/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = UpdatePublicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePublicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { groupIds, patientIds, status, ...rest } = parsed.data;

  const updateData: any = { ...rest };
  if (status !== undefined) {
    updateData.status = status;
    if (status === "publicado") {
      const existing = await db.select({ publishedAt: publicationsTable.publishedAt }).from(publicationsTable).where(eq(publicationsTable.id, params.data.id));
      if (existing[0] && !existing[0].publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
  }

  await db.update(publicationsTable).set(updateData).where(eq(publicationsTable.id, params.data.id));

  if (groupIds !== undefined) {
    await db.delete(publicationGroupsTable).where(eq(publicationGroupsTable.publicationId, params.data.id));
    if (groupIds.length > 0) {
      await db.insert(publicationGroupsTable).values(
        groupIds.map(gid => ({ publicationId: params.data.id, groupId: gid }))
      );
    }
  }
  if (patientIds !== undefined) {
    await db.delete(publicationPatientsTable).where(eq(publicationPatientsTable.publicationId, params.data.id));
    if (patientIds.length > 0) {
      await db.insert(publicationPatientsTable).values(
        patientIds.map(pid => ({ publicationId: params.data.id, patientId: pid }))
      );
    }
  }

  const result = await getPublicationWithRelations(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Publicação não encontrada" });
    return;
  }

  res.json(result);
});

// DELETE /biblioteca/:id
router.delete("/biblioteca/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = DeletePublicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(publicationGroupsTable).where(eq(publicationGroupsTable.publicationId, params.data.id));
  await db.delete(publicationPatientsTable).where(eq(publicationPatientsTable.publicationId, params.data.id));
  await db.delete(publicationsTable).where(eq(publicationsTable.id, params.data.id));

  res.sendStatus(204);
});

// PATCH /biblioteca/:id/toggle-status
router.patch("/biblioteca/:id/toggle-status", requireNutritionist, async (req, res): Promise<void> => {
  const params = TogglePublicationStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [pub] = await db.select().from(publicationsTable).where(eq(publicationsTable.id, params.data.id));
  if (!pub) {
    res.status(404).json({ error: "Publicação não encontrada" });
    return;
  }

  const newStatus = pub.status === "publicado" ? "rascunho" : "publicado";
  const updateData: any = { status: newStatus };
  if (newStatus === "publicado" && !pub.publishedAt) {
    updateData.publishedAt = new Date();
  }

  await db.update(publicationsTable).set(updateData).where(eq(publicationsTable.id, params.data.id));

  const result = await getPublicationWithRelations(params.data.id);
  res.json(result);
});

export default router;
