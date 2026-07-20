import { pgTable, text, serial, timestamp, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const consultationTypeEnum = pgEnum("consultation_type", ["avaliacao_inicial", "cardapio", "reavaliacao"]);
export const attachmentSectionEnum = pgEnum("attachment_section", ["exames", "cardapios"]);

export const consultationsTable = pgTable("consultations", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  type: consultationTypeEnum("type").notNull(),
  date: text("date").notNull(),
  // Avaliação Inicial / Reavaliação
  weight: real("weight"),
  height: real("height"),
  bmi: real("bmi"),
  waistCm: real("waist_cm"),
  hipCm: real("hip_cm"),
  abdomenCm: real("abdomen_cm"),
  armCm: real("arm_cm"),
  thighCm: real("thigh_cm"),
  calfCm: real("calf_cm"),
  bioimpedancePdfPath: text("bioimpedance_pdf_path"),
  notes: text("notes"),
  // Cardápio
  objective: text("objective"),
  vetKcal: real("vet_kcal"),
  menuPdfPath: text("menu_pdf_path"),
  restrictions: text("restrictions"),
  additionalGuidance: text("additional_guidance"),
  // Reavaliação
  baselineConsultationId: integer("baseline_consultation_id"),
  evolutionNotes: text("evolution_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertConsultationSchema = createInsertSchema(consultationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultationsTable.$inferSelect;

export const consultationAttachmentsTable = pgTable("consultation_attachments", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").notNull(),
  section: attachmentSectionEnum("section").notNull(),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  mimeType: text("mime_type"),
  sizeBytes: integer("size_bytes"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertConsultationAttachmentSchema = createInsertSchema(consultationAttachmentsTable).omit({ id: true, uploadedAt: true });
export type InsertConsultationAttachment = z.infer<typeof insertConsultationAttachmentSchema>;
export type ConsultationAttachment = typeof consultationAttachmentsTable.$inferSelect;
