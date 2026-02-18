import { db } from "./db";
import {
    contracts,
    contractFiles,
    analyses,
    type InsertContract,
    type InsertContractFile,
    type Contract,
    type ContractFile,
    type Analysis,
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
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
}
