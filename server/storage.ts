import {
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

  // Chat Sessions
  createSession(session: InsertChatSession): Promise<ChatSession>;
  getSession(id: number): Promise<ChatSession | undefined>;
  getSessions(): Promise<ChatSession[]>;
  updateSessionStatus(id: number, status: string): Promise<ChatSession>;
  updateSessionScore(id: number, score: number, report: any): Promise<ChatSession>;

  // Chat Messages
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getMessages(sessionId: number): Promise<ChatMessage[]>;
}

export class MemoryStorage implements IStorage {
  private contracts: Contract[] = [];
  private contractFiles: ContractFile[] = [];
  private analyses: Analysis[] = [];
  private chatSessions: ChatSession[] = [];
  private chatMessagesStore: ChatMessage[] = [];
  private nextContractId = 1;
  private nextFileId = 1;
  private nextAnalysisId = 1;
  private nextSessionId = 1;
  private nextMessageId = 1;

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

  // === Chat Sessions ===

  async createSession(input: InsertChatSession): Promise<ChatSession> {
    const session: ChatSession = {
      id: this.nextSessionId++,
      sessionType: input.sessionType,
      title: input.title ?? "Nova Análise",
      repoUrl: input.repoUrl ?? null,
      contractId: input.contractId ?? null,
      status: "active",
      score: null,
      scoreReport: null,
      createdAt: new Date(),
    };
    this.chatSessions.push(session);
    return session;
  }

  async getSession(id: number): Promise<ChatSession | undefined> {
    return this.chatSessions.find((s) => s.id === id);
  }

  async getSessions(): Promise<ChatSession[]> {
    return [...this.chatSessions].sort(
      (a, b) =>
        (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
    );
  }

  async updateSessionStatus(id: number, status: string): Promise<ChatSession> {
    const session = this.chatSessions.find((s) => s.id === id);
    if (!session) throw new Error("Session not found");
    (session as any).status = status;
    return session;
  }

  async updateSessionScore(id: number, score: number, report: any): Promise<ChatSession> {
    const session = this.chatSessions.find((s) => s.id === id);
    if (!session) throw new Error("Session not found");
    (session as any).score = score;
    (session as any).scoreReport = report;
    (session as any).status = "completed";
    return session;
  }

  // === Chat Messages ===

  async createMessage(input: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.nextMessageId++,
      sessionId: input.sessionId,
      role: input.role,
      content: input.content,
      steps: input.steps ?? null,
      createdAt: new Date(),
    };
    this.chatMessagesStore.push(message);
    return message;
  }

  async getMessages(sessionId: number): Promise<ChatMessage[]> {
    return this.chatMessagesStore
      .filter((m) => m.sessionId === sessionId)
      .sort(
        (a, b) =>
          (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0)
      );
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

