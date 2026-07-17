import { Request } from "express";

// Augment express-session types
declare module "express-session" {
  interface SessionData {
    userId: number;
    role: string;
    patientId: number | null;
  }
}

export function isAuthenticated(req: Request): boolean {
  return !!req.session?.userId;
}

export function requireAuth(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
): void {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  next();
}

export function requireNutritionist(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
): void {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  if (req.session.role !== "nutricionista") {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }
  next();
}

export function requirePatient(
  req: import("express").Request,
  res: import("express").Response,
  next: import("express").NextFunction,
): void {
  if (!req.session?.userId) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  if (req.session.role !== "paciente") {
    res.status(403).json({ error: "Acesso negado" });
    return;
  }
  next();
}
