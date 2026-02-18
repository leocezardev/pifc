import { db } from "./db";
import {
    contracts,
    contractFiles,
    analyses,
    chatSessions,
    chatMessages,
    type InsertContract,
    type InsertContractFile,
    type InsertChatSession,
    type InsertChatMessage,
    type Contract,
    type ContractFile,
    type Analysis,
    type ChatSession,
    type ChatMessage,
} from "@shared/schema";
import { eq, desc, asc } from "drizzle-orm";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
    async getContracts(): Promise<Contract[]> {
        return await db.select().from(contracts).orderBy(desc(contracts.createdAt));
    }

    async getContract(id: number): Promise<Contract | undefined> {
        const [contract] = await db.select().from(contracts).where(eq(contracts.id, id));
        return contract;
    }

    async createContract(insertContract: InsertContract): Promise<Contract> {
        const [contract] = await db.insert(contracts).values(insertContract).returning();
        return contract;
    }

    async updateContractStatus(id: number, status: string): Promise<Contract> {
        const [contract] = await db
            .update(contracts)
            .set({ status })
            .where(eq(contracts.id, id))
            .returning();
        return contract;
    }

    async createContractFile(file: InsertContractFile): Promise<ContractFile> {
        const [contractFile] = await db.insert(contractFiles).values(file).returning();
        return contractFile;
    }

    async getContractFiles(contractId: number): Promise<ContractFile[]> {
        return await db.select().from(contractFiles).where(eq(contractFiles.contractId, contractId));
    }

    async createAnalysis(analysis: any): Promise<Analysis> {
        const [newAnalysis] = await db.insert(analyses).values(analysis).returning();
        return newAnalysis;
    }

    async getAnalyses(contractId: number): Promise<Analysis[]> {
        return await db.select().from(analyses).where(eq(analyses.contractId, contractId)).orderBy(desc(analyses.createdAt));
    }

    async getAnalysis(id: number): Promise<Analysis | undefined> {
        const [analysis] = await db.select().from(analyses).where(eq(analyses.id, id));
        return analysis;
    }

    // === Chat Sessions ===

    async createSession(input: InsertChatSession): Promise<ChatSession> {
        const [session] = await db.insert(chatSessions).values(input).returning();
        return session;
    }

    async getSession(id: number): Promise<ChatSession | undefined> {
        const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
        return session;
    }

    async getSessions(): Promise<ChatSession[]> {
        return await db.select().from(chatSessions).orderBy(desc(chatSessions.createdAt));
    }

    async updateSessionStatus(id: number, status: string): Promise<ChatSession> {
        const [session] = await db
            .update(chatSessions)
            .set({ status })
            .where(eq(chatSessions.id, id))
            .returning();
        return session;
    }

    async updateSessionScore(id: number, score: number, report: any): Promise<ChatSession> {
        const [session] = await db
            .update(chatSessions)
            .set({ score, scoreReport: report, status: "completed" })
            .where(eq(chatSessions.id, id))
            .returning();
        return session;
    }

    // === Chat Messages ===

    async createMessage(input: InsertChatMessage): Promise<ChatMessage> {
        const [message] = await db.insert(chatMessages).values(input).returning();
        return message;
    }

    async getMessages(sessionId: number): Promise<ChatMessage[]> {
        return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(asc(chatMessages.createdAt));
    }
}

