import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  supplierName: text("supplier_name").notNull(),
  contractDate: timestamp("contract_date").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  status: text("status", { enum: ["draft", "analyzing", "completed", "failed"] }).default("draft").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contractFiles = pgTable("contract_files", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  filename: text("filename").notNull(),
  fileType: text("file_type", { enum: ["contract", "requirements", "code"] }).notNull(),
  fileSize: integer("file_size").notNull(),
  content: text("content"), // For text files (extracted content)
  createdAt: timestamp("created_at").defaultNow(),
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  totalPoints: integer("total_points").notNull(),
  deliveredPoints: integer("delivered_points").notNull(),
  summary: text("summary").notNull(),
  rawJson: jsonb("raw_json").notNull(), // Stores the full AI response
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const contractsRelations = relations(contracts, ({ many }) => ({
  files: many(contractFiles),
  analyses: many(analyses),
}));

export const contractFilesRelations = relations(contractFiles, ({ one }) => ({
  contract: one(contracts, {
    fields: [contractFiles.contractId],
    references: [contracts.id],
  }),
}));

export const analysesRelations = relations(analyses, ({ one }) => ({
  contract: one(contracts, {
    fields: [analyses.contractId],
    references: [contracts.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, status: true });
export const insertContractFileSchema = createInsertSchema(contractFiles).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type ContractFile = typeof contractFiles.$inferSelect;
export type InsertContractFile = z.infer<typeof insertContractFileSchema>;
export type Analysis = typeof analyses.$inferSelect;

// Request Types
export type CreateContractRequest = InsertContract;
export type FileUploadMetadata = {
  contractId: number;
  fileType: "contract" | "requirements" | "code";
};

// Response Types
export type ContractResponse = Contract & {
  files?: ContractFile[];
  analyses?: Analysis[];
};
export type ContractsListResponse = Contract[];
export type AnalysisResponse = Analysis;

export type FileUploadResponse = {
  id: number;
  filename: string;
  fileType: string;
};
