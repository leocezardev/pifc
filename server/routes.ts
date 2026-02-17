import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import OpenAI from "openai";

// Configure OpenAI
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // === Contracts ===

  app.get(api.contracts.list.path, async (req, res) => {
    const contracts = await storage.getContracts();
    res.json(contracts);
  });

  app.get(api.contracts.get.path, async (req, res) => {
    const contract = await storage.getContract(Number(req.params.id));
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }
    const files = await storage.getContractFiles(contract.id);
    const analyses = await storage.getAnalyses(contract.id);
    res.json({ ...contract, files, analyses });
  });

  app.post(api.contracts.create.path, async (req, res) => {
    try {
      const input = api.contracts.create.input.parse(req.body);
      const contract = await storage.createContract(input);
      res.status(201).json(contract);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // === Files ===

  app.post(
    api.contracts.uploadFile.path,
    upload.single("file"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        
        const contractId = Number(req.params.id);
        const fileType = req.body.fileType as "contract" | "requirements" | "code";

        // Mock text extraction for prototype
        // In a real app, use pdf-parse or mammoth
        const content = req.file.buffer.toString("utf-8").slice(0, 5000); // Extract first 5000 chars as mock content

        const file = await storage.createContractFile({
          contractId,
          filename: req.file.originalname,
          fileType,
          fileSize: req.file.size,
          content: content, // Store partial content for AI analysis context
        });

        res.status(201).json(file);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to upload file" });
      }
    }
  );

  // === Analysis ===

  app.post(api.contracts.analyze.path, async (req, res) => {
    const contractId = Number(req.params.id);
    const contract = await storage.getContract(contractId);
    if (!contract) return res.status(404).json({ message: "Contract not found" });

    // Update status to analyzing
    await storage.updateContractStatus(contractId, "analyzing");

    // Gather context
    const files = await storage.getContractFiles(contractId);
    const context = files.map(f => `File: ${f.filename} (${f.fileType})\nContent Preview: ${f.content?.slice(0, 500)}...`).join("\n\n");

    try {
      // Call OpenAI to simulate analysis
      const completion = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [
          {
            role: "system",
            content: `You are an expert IT Contract Auditor for the State of Goias, Brazil.
            Your job is to analyze contract documents and code to perform a Function Point Analysis (APF).
            
            Compare the delivered code functionalities against the contracted requirements.
            
            Return a JSON object with:
            - total_contracted_points (number)
            - total_delivered_points (number)
            - summary (string, executive summary in Portuguese)
            - discrepancies (array of strings, listing missing or extra features)
            - detailed_analysis (array of objects with 'feature', 'points', 'status')
            
            Be strict but fair. Use the SISP guidelines.`
          },
          {
            role: "user",
            content: `Analyze this contract: ${contract.title} - ${contract.description}\n\nFiles Context:\n${context}`
          }
        ],
        response_format: { type: "json_object" },
      });

      const result = JSON.parse(completion.choices[0].message.content || "{}");

      // Save Analysis
      const analysis = await storage.createAnalysis({
        contractId,
        totalPoints: result.total_contracted_points || 100,
        deliveredPoints: result.total_delivered_points || 0,
        summary: result.summary || "Analysis completed.",
        rawJson: result,
      });

      await storage.updateContractStatus(contractId, "completed");
      
      res.json({ message: "Analysis completed", analysisId: analysis.id });
    } catch (err) {
      console.error("AI Analysis failed:", err);
      await storage.updateContractStatus(contractId, "failed");
      res.status(500).json({ message: "Analysis failed" });
    }
  });

  app.get(api.contracts.getAnalysis.path, async (req, res) => {
    const analysis = await storage.getAnalysis(Number(req.params.id));
    if (!analysis) return res.status(404).json({ message: "Analysis not found" });
    res.json(analysis);
  });

  return httpServer;
}

// Seed Data
async function seedDatabase() {
  const existingContracts = await storage.getContracts();
  if (existingContracts.length === 0) {
    await storage.createContract({
      title: "Sistema de Gestão de RH - Módulo Férias",
      supplierName: "TechGoias Ltda",
      contractDate: new Date("2025-01-15"),
      value: "150000.00",
      description: "Desenvolvimento do módulo de solicitação e aprovação de férias integrado ao ERP do estado.",
      status: "draft",
    });
    
    await storage.createContract({
      title: "Portal do Cidadão - Refatoração",
      supplierName: "InovaGov Soluções",
      contractDate: new Date("2025-02-10"),
      value: "85000.50",
      description: "Modernização da interface e backend do portal de serviços ao cidadão.",
      status: "completed",
    });
  }
}

seedDatabase().catch(console.error);
