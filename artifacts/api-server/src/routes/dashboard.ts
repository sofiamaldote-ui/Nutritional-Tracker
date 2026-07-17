import { Router, type IRouter } from "express";
import { desc, count, eq } from "drizzle-orm";
import { db, patientsTable, consultationsTable, publicationsTable, groupsTable } from "@workspace/db";
import { requireNutritionist } from "../lib/session";

const router: IRouter = Router();

router.get("/dashboard/stats", requireNutritionist, async (_req, res): Promise<void> => {
  const [patientCount, consultationCount, publicationCount, groupCount] = await Promise.all([
    db.select({ count: count() }).from(patientsTable),
    db.select({ count: count() }).from(consultationsTable),
    db.select({ count: count() }).from(publicationsTable),
    db.select({ count: count() }).from(groupsTable),
  ]);

  const recentConsultations = await db
    .select({
      id: consultationsTable.id,
      patientId: consultationsTable.patientId,
      patientName: patientsTable.name,
      type: consultationsTable.type,
      date: consultationsTable.date,
    })
    .from(consultationsTable)
    .innerJoin(patientsTable, eq(consultationsTable.patientId, patientsTable.id))
    .orderBy(desc(consultationsTable.createdAt))
    .limit(5);

  const recentPatients = await db
    .select()
    .from(patientsTable)
    .orderBy(desc(patientsTable.createdAt))
    .limit(5);

  res.json({
    totalPatients: patientCount[0]?.count ?? 0,
    totalConsultations: consultationCount[0]?.count ?? 0,
    totalPublications: publicationCount[0]?.count ?? 0,
    totalGroups: groupCount[0]?.count ?? 0,
    recentConsultations: recentConsultations.map(c => ({
      id: c.id,
      patientId: c.patientId,
      patientName: c.patientName ?? "Paciente",
      type: c.type,
      date: c.date,
    })),
    recentPatients: recentPatients.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone ?? null,
      birthDate: p.birthDate ?? null,
      sex: p.sex ?? null,
      hasAccess: true,
      createdAt: p.createdAt.toISOString(),
      groups: [],
    })),
  });
});

export default router;
