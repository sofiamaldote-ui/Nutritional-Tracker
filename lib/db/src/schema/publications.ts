import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const categoryEnum = pgEnum("category", ["ebook", "receita", "video", "artigo"]);
export const publicationStatusEnum = pgEnum("publication_status", ["rascunho", "publicado"]);
export const visibilityEnum = pgEnum("visibility", ["geral", "grupos", "pacientes"]);

export const publicationsTable = pgTable("publications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: categoryEnum("category").notNull(),
  status: publicationStatusEnum("status").notNull().default("rascunho"),
  visibility: visibilityEnum("visibility").notNull().default("geral"),
  videoUrl: text("video_url"),
  pdfPath: text("pdf_path"),
  imagePath: text("image_path"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const publicationGroupsTable = pgTable("publication_groups", {
  id: serial("id").primaryKey(),
  publicationId: integer("publication_id").notNull(),
  groupId: integer("group_id").notNull(),
});

export const publicationPatientsTable = pgTable("publication_patients", {
  id: serial("id").primaryKey(),
  publicationId: integer("publication_id").notNull(),
  patientId: integer("patient_id").notNull(),
});

export const patientPublicationViewsTable = pgTable("patient_publication_views", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  publicationId: integer("publication_id").notNull(),
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPublicationSchema = createInsertSchema(publicationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPublication = z.infer<typeof insertPublicationSchema>;
export type Publication = typeof publicationsTable.$inferSelect;
