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

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionType: text("session_type", { enum: ["chat", "repo", "upload"] }).notNull(),
  title: text("title").default("Nova Análise"),
  repoUrl: text("repo_url"),
  contractId: integer("contract_id"),
  status: text("status", { enum: ["active", "analyzing", "completed", "failed"] }).default("active").notNull(),
  score: integer("score"),
  scoreReport: jsonb("score_report"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  steps: jsonb("steps"), // Array of processing steps: { label, detail, status, time }
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

export const chatSessionsRelations = relations(chatSessions, ({ many }) => ({
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, status: true });
export const insertContractFileSchema = createInsertSchema(contractFiles).omit({ id: true, createdAt: true });
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({ id: true, createdAt: true, status: true, score: true, scoreReport: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type ContractFile = typeof contractFiles.$inferSelect;
export type InsertContractFile = z.infer<typeof insertContractFileSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

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

export type ChatSessionResponse = ChatSession & {
  messages?: ChatMessage[];
};

export type ProcessingStep = {
  label: string;
  detail: string;
  status: "done" | "loading" | "pending";
  time?: string;
};
