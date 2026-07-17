import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq, ilike, or } from "drizzle-orm";
import { db, patientsTable, usersTable, patientGroupsTable, groupsTable } from "@workspace/db";
import {
  CreatePatientBody,
  GetPatientParams,
  UpdatePatientParams,
  UpdatePatientBody,
  DeletePatientParams,
  ResetPatientPasswordParams,
  ResetPatientPasswordBody,
  ListPatientsQueryParams,
} from "@workspace/api-zod";
import { requireNutritionist } from "../lib/session";

const router: IRouter = Router();

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

async function getPatientWithGroups(patientId: number) {
  const patient = await db.select().from(patientsTable).where(eq(patientsTable.id, patientId));
  if (!patient[0]) return null;

  const memberGroups = await db
    .select({ id: groupsTable.id, name: groupsTable.name, color: groupsTable.color })
    .from(patientGroupsTable)
    .innerJoin(groupsTable, eq(patientGroupsTable.groupId, groupsTable.id))
    .where(eq(patientGroupsTable.patientId, patientId));

  const user = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.id, patient[0].userId));

  return {
    id: patient[0].id,
    name: patient[0].name,
    email: patient[0].email,
    phone: patient[0].phone ?? null,
    birthDate: patient[0].birthDate ?? null,
    sex: patient[0].sex ?? null,
    hasAccess: user.length > 0,
    createdAt: patient[0].createdAt.toISOString(),
    groups: memberGroups,
  };
}

// GET /patients
router.get("/patients", requireNutritionist, async (req, res): Promise<void> => {
  const params = ListPatientsQueryParams.safeParse(req.query);
  const search = params.success ? params.data.search : undefined;

  let query = db.select().from(patientsTable);

  const patients = search
    ? await db.select().from(patientsTable).where(
        or(ilike(patientsTable.name, `%${search}%`), ilike(patientsTable.email, `%${search}%`))
      )
    : await db.select().from(patientsTable);

  const result = await Promise.all(patients.map(p => getPatientWithGroups(p.id)));
  res.json(result.filter(Boolean));
});

// POST /patients
router.post("/patients", requireNutritionist, async (req, res): Promise<void> => {
  const parsed = CreatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, phone, birthDate, sex, groupIds } = parsed.data;

  const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
  if (existing.length > 0) {
    res.status(409).json({ error: "Já existe um acesso com este e-mail" });
    return;
  }

  const provisionalPassword = generatePassword();
  const passwordHash = await bcrypt.hash(provisionalPassword, 10);

  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    role: "paciente",
    patientId: null,
  }).returning();

  const [patient] = await db.insert(patientsTable).values({
    name,
    email,
    phone: phone ?? null,
    birthDate: birthDate ?? null,
    sex: (sex as any) ?? null,
    userId: user.id,
  }).returning();

  await db.update(usersTable).set({ patientId: String(patient.id) }).where(eq(usersTable.id, user.id));

  if (groupIds && groupIds.length > 0) {
    await db.insert(patientGroupsTable).values(
      groupIds.map(gid => ({ patientId: patient.id, groupId: gid }))
    );
  }

  const patientData = await getPatientWithGroups(patient.id);

  res.status(201).json({
    patient: patientData,
    provisionalPassword,
  });
});

// GET /patients/:id
router.get("/patients/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = GetPatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const patientData = await getPatientWithGroups(params.data.id);
  if (!patientData) {
    res.status(404).json({ error: "Paciente não encontrado" });
    return;
  }

  const consultationCount = await db
    .select({ count: (await import("drizzle-orm")).count() })
    .from((await import("@workspace/db")).consultationsTable)
    .where(eq((await import("@workspace/db")).consultationsTable.patientId, params.data.id));

  res.json({
    ...patientData,
    consultationCount: consultationCount[0]?.count ?? 0,
  });
});

// PATCH /patients/:id
router.patch("/patients/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = UpdatePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePatientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { groupIds, ...rest } = parsed.data;

  const updateData: any = {};
  if (rest.name !== undefined) updateData.name = rest.name;
  if (rest.phone !== undefined) updateData.phone = rest.phone;
  if (rest.birthDate !== undefined) updateData.birthDate = rest.birthDate;
  if (rest.sex !== undefined) updateData.sex = rest.sex;

  if (Object.keys(updateData).length > 0) {
    await db.update(patientsTable).set(updateData).where(eq(patientsTable.id, params.data.id));
    if (updateData.name) {
      const patient = await db.select({ userId: patientsTable.userId }).from(patientsTable).where(eq(patientsTable.id, params.data.id));
      if (patient[0]) {
        await db.update(usersTable).set({ name: updateData.name }).where(eq(usersTable.id, patient[0].userId));
      }
    }
  }

  if (groupIds !== undefined) {
    await db.delete(patientGroupsTable).where(eq(patientGroupsTable.patientId, params.data.id));
    if (groupIds.length > 0) {
      await db.insert(patientGroupsTable).values(
        groupIds.map(gid => ({ patientId: params.data.id, groupId: gid }))
      );
    }
  }

  const patientData = await getPatientWithGroups(params.data.id);
  if (!patientData) {
    res.status(404).json({ error: "Paciente não encontrado" });
    return;
  }

  res.json(patientData);
});

// DELETE /patients/:id
router.delete("/patients/:id", requireNutritionist, async (req, res): Promise<void> => {
  const params = DeletePatientParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const patient = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient[0]) {
    res.status(404).json({ error: "Paciente não encontrado" });
    return;
  }

  await db.delete(patientGroupsTable).where(eq(patientGroupsTable.patientId, params.data.id));
  await db.delete(patientsTable).where(eq(patientsTable.id, params.data.id));
  await db.delete(usersTable).where(eq(usersTable.id, patient[0].userId));

  res.sendStatus(204);
});

// POST /patients/:id/reset-password
router.post("/patients/:id/reset-password", requireNutritionist, async (req, res): Promise<void> => {
  const params = ResetPatientPasswordParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = ResetPatientPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const patient = await db.select().from(patientsTable).where(eq(patientsTable.id, params.data.id));
  if (!patient[0]) {
    res.status(404).json({ error: "Paciente não encontrado" });
    return;
  }

  let provisionalPassword: string | null = null;
  let newPassword: string;

  if (parsed.data.mode === "generate") {
    provisionalPassword = generatePassword();
    newPassword = provisionalPassword;
  } else {
    if (!parsed.data.newPassword) {
      res.status(400).json({ error: "Senha obrigatória no modo manual" });
      return;
    }
    newPassword = parsed.data.newPassword;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, patient[0].userId));

  res.json({
    message: "Senha redefinida com sucesso",
    provisionalPassword,
  });
});

export default router;
