import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  RegisterNutritionistBody,
  LoginBody,
  ChangeMyPasswordBody,
  RegisterNutritionistResponse,
  GetMeResponse,
  ChangeMyPasswordResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../lib/session";

const router: IRouter = Router();

// POST /auth/register — first-time nutritionist setup
router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterNutritionistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { name, email, password } = parsed.data;

  // Only allow one nutritionist
  const existing = await db.select().from(usersTable).where(eq(usersTable.role, "nutricionista"));
  if (existing.length > 0) {
    res.status(409).json({ error: "Conta da nutricionista já criada" });
    return;
  }

  const emailExists = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email));
  if (emailExists.length > 0) {
    res.status(409).json({ error: "E-mail já cadastrado" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash,
    role: "nutricionista",
    patientId: null,
  }).returning();

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.patientId = null;

  res.status(201).json(RegisterNutritionistResponse.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    patientId: null,
  }));
});

// POST /auth/login
router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user) {
    res.status(401).json({ error: "E-mail ou senha inválidos" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "E-mail ou senha inválidos" });
    return;
  }

  req.session.userId = user.id;
  req.session.role = user.role;
  req.session.patientId = user.patientId ? parseInt(user.patientId) : null;

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    patientId: user.patientId ? parseInt(user.patientId) : null,
  });
});

// POST /auth/logout
router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.sendStatus(204);
  });
});

// GET /auth/me
router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const userId = req.session.userId!;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "Usuário não encontrado" });
    return;
  }

  res.json(GetMeResponse.parse({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    patientId: user.patientId ? parseInt(user.patientId) : null,
  }));
});

// PATCH /auth/me/password
router.patch("/auth/me/password", requireAuth, async (req, res): Promise<void> => {
  const parsed = ChangeMyPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { currentPassword, newPassword } = parsed.data;
  const userId = req.session.userId!;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado" });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "Senha atual incorreta" });
    return;
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash }).where(eq(usersTable.id, userId));

  res.json(ChangeMyPasswordResponse.parse({ message: "Senha alterada com sucesso" }));
});

export default router;
