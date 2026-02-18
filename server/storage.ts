import {
  type InsertContract,
  type InsertContractFile,
  type Contract,
  type ContractFile,
  type Analysis,
} from "@shared/schema";

export interface IStorage {
  // Contracts
  getContracts(): Promise<Contract[]>;
  getContract(id: number): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContractStatus(id: number, status: string): Promise<Contract>;

  // Files
  createContractFile(file: InsertContractFile): Promise<ContractFile>;
  getContractFiles(contractId: number): Promise<ContractFile[]>;

  // Analyses
  createAnalysis(analysis: any): Promise<Analysis>;
  getAnalyses(contractId: number): Promise<Analysis[]>;
  getAnalysis(id: number): Promise<Analysis | undefined>;
}

export class MemoryStorage implements IStorage {
  private contracts: Contract[] = [];
  private contractFiles: ContractFile[] = [];
  private analyses: Analysis[] = [];
  private nextContractId = 1;
  private nextFileId = 1;
  private nextAnalysisId = 1;

  async getContracts(): Promise<Contract[]> {
    return [...this.contracts].sort(
      (a, b) =>
        (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.find((c) => c.id === id);
  }

  async createContract(input: InsertContract): Promise<Contract> {
    const contract: Contract = {
      id: this.nextContractId++,
      title: input.title,
      supplierName: input.supplierName,
      contractDate: input.contractDate instanceof Date ? input.contractDate : new Date(input.contractDate),
      value: input.value,
      description: input.description ?? null,
      status: "draft",
      createdAt: new Date(),
    };
    this.contracts.push(contract);
    return contract;
  }

  async updateContractStatus(id: number, status: string): Promise<Contract> {
    const contract = this.contracts.find((c) => c.id === id);
    if (!contract) throw new Error("Contract not found");
    (contract as any).status = status;
    return contract;
  }

  async createContractFile(file: InsertContractFile): Promise<ContractFile> {
    const contractFile: ContractFile = {
      id: this.nextFileId++,
      contractId: file.contractId,
      filename: file.filename,
      fileType: file.fileType,
      fileSize: file.fileSize,
      content: file.content ?? null,
      createdAt: new Date(),
    };
    this.contractFiles.push(contractFile);
    return contractFile;
  }

  async getContractFiles(contractId: number): Promise<ContractFile[]> {
    return this.contractFiles.filter((f) => f.contractId === contractId);
  }

  async createAnalysis(analysis: any): Promise<Analysis> {
    const newAnalysis: Analysis = {
      id: this.nextAnalysisId++,
      contractId: analysis.contractId,
      totalPoints: analysis.totalPoints,
      deliveredPoints: analysis.deliveredPoints,
      summary: analysis.summary,
      rawJson: analysis.rawJson,
      createdAt: new Date(),
    };
    this.analyses.push(newAnalysis);
    return newAnalysis;
  }

  async getAnalyses(contractId: number): Promise<Analysis[]> {
    return this.analyses
      .filter((a) => a.contractId === contractId)
      .sort(
        (a, b) =>
          (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
      );
  }

  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.find((a) => a.id === id);
  }
}

// Use database storage if DATABASE_URL is set, otherwise use memory storage
let storage: IStorage;

if (process.env.DATABASE_URL) {
  // Dynamic import to avoid crash when DATABASE_URL is not set
  const { DatabaseStorage } = await import("./database-storage.js");
  storage = new DatabaseStorage();
  console.log("[storage] Using PostgreSQL database storage");
} else {
  storage = new MemoryStorage();
  console.log("[storage] Using in-memory storage (no DATABASE_URL set)");
}

export { storage };
