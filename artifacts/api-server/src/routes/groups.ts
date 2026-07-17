import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, groupsTable, patientGroupsTable, patientsTable, usersTable } from "@workspace/db";
import {
  CreateGroupBody,
  GetGroupParams,
  UpdateGroupParams,
  UpdateGroupBody,
  DeleteGroupParams,
  AddGroupMemberParams,
  AddGroupMemberBody,
  RemoveGroupMemberParams,
} from "@workspace/api-zod";
import { requireNutritionist } from "../lib/session";

const router: IRouter = Router();

// GET /groups
router.get("/groups", requireNutritionist, async (_req, res): Promise<void> => {
  const groups = await db.select().from(groupsTable);

  const result = await Promise.all(
    groups.map(async (g) => {
      const memberCount = await db
        .select({ count: count() })
        .from(patientGroupsTable)
        .where(eq(patientGroupsTable.groupId, g.id));
      return {
        id: g.id,
        name: g.name,
        color: g.color,
        description: g.description ?? null,
        createdAt: g.createdAt.toISOString(),
        memberCount: memberCount[0]?.count ?? 0,
      };
    })
  );

  res.json(result);
});

// POST /groups
router.post("/groups", requireNutritionist, async (req, res): Promise<void> => {
  const parsed = CreateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [group] = await db.insert(groupsTable).values({
    name: parsed.data.name,
    color: parsed.data.color,
    description: parsed.data.description ?? null,
  }).returning();

  res.status(201).json({
    id: group.id,
    name: group.name,
    color: group.color,
    description: group.description ?? null,
    createdAt: group.createdAt.toISOString(),
    memberCount: 0,
  });
});

// GET /groups/:id
router.get("/groups/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = GetGroupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const group = await db.select().from(groupsTable).where(eq(groupsTable.id, params.data.id));
  if (!group[0]) {
    res.status(404).json({ error: "Grupo não encontrado" });
    return;
  }

  const members = await db
    .select()
    .from(patientGroupsTable)
    .innerJoin(patientsTable, eq(patientGroupsTable.patientId, patientsTable.id))
    .where(eq(patientGroupsTable.groupId, params.data.id));

  res.json({
    id: group[0].id,
    name: group[0].name,
    color: group[0].color,
    description: group[0].description ?? null,
    createdAt: group[0].createdAt.toISOString(),
    members: members.map(m => ({
      id: m.patients.id,
      name: m.patients.name,
      email: m.patients.email,
      phone: m.patients.phone ?? null,
      birthDate: m.patients.birthDate ?? null,
      sex: m.patients.sex ?? null,
      hasAccess: true,
      createdAt: m.patients.createdAt.toISOString(),
      groups: [],
    })),
  });
});

// PATCH /groups/:id
router.patch("/groups/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = UpdateGroupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateGroupBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: any = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.color !== undefined) updateData.color = parsed.data.color;
  if ("description" in parsed.data) updateData.description = parsed.data.description;

  const [updated] = await db.update(groupsTable).set(updateData).where(eq(groupsTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Grupo não encontrado" });
    return;
  }

  const memberCount = await db.select({ count: count() }).from(patientGroupsTable).where(eq(patientGroupsTable.groupId, params.data.id));

  res.json({
    id: updated.id,
    name: updated.name,
    color: updated.color,
    description: updated.description ?? null,
    createdAt: updated.createdAt.toISOString(),
    memberCount: memberCount[0]?.count ?? 0,
  });
});

// DELETE /groups/:id
router.delete("/groups/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = DeleteGroupParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db.delete(patientGroupsTable).where(eq(patientGroupsTable.groupId, params.data.id));
  await db.delete(groupsTable).where(eq(groupsTable.id, params.data.id));

  res.sendStatus(204);
});

// POST /groups/:id/members
router.post("/groups/:id/members", requireNutritionist, async (req, res): Promise<void> => {
  const params = AddGroupMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AddGroupMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Check if already a member
  const existing = await db
    .select()
    .from(patientGroupsTable)
    .where(eq(patientGroupsTable.groupId, params.data.id));

  const alreadyMember = existing.some(m => m.patientId === parsed.data.patientId);
  if (!alreadyMember) {
    await db.insert(patientGroupsTable).values({
      patientId: parsed.data.patientId,
      groupId: params.data.id,
    });
  }

  res.status(201).json({ message: "Paciente adicionado ao grupo" });
});

// DELETE /groups/:id/members/:patientId
router.delete("/groups/:id/members/:patientId", requireNutritionist, async (req, res): Promise<void> => {
  const params = RemoveGroupMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  await db
    .delete(patientGroupsTable)
    .where(eq(patientGroupsTable.groupId, params.data.id));

  res.sendStatus(204);
});

export default router;
