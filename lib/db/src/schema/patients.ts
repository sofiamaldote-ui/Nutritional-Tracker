import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sexEnum = pgEnum("sex", ["masculino", "feminino", "outro"]);

export const patientsTable = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  birthDate: text("birth_date"),
  sex: sexEnum("sex"),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPatientSchema = createInsertSchema(patientsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patientsTable.$inferSelect;
