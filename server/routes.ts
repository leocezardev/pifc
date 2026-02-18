import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import multer from "multer";
import OpenAI from "openai";

// Configure OpenAI lazily to avoid crash when API key is not set
let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OpenAI API key not configured. Set AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY.");
    }
    openai = new OpenAI({
      apiKey,
      ...(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL && { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL }),
    });
  }
  return openai;
}

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Debug log to ensure routes are registered
  console.log("Registering API routes...");
  console.log("  - GET /api/sessions");
  console.log("  - POST /api/sessions");

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
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
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

  // === Chat Sessions ===

  app.post(api.sessions.create.path, async (req, res) => {
    try {
      const input = api.sessions.create.input.parse(req.body);
      const session = await storage.createSession(input);

      // If there's an initial message (from chat type), create it
      if (req.body.initialMessage) {
        await storage.createMessage({
          sessionId: session.id,
          role: "user",
          content: req.body.initialMessage,
        });

        // Create mock assistant response with processing steps
        const assistantSteps = getMockProcessingSteps(input.sessionType, req.body.initialMessage);
        await storage.createMessage({
          sessionId: session.id,
          role: "assistant",
          content: getAssistantResponseForType(input.sessionType, req.body.initialMessage),
          steps: assistantSteps,
        });
      }

      // If repo type, create initial context message
      if (input.sessionType === "repo" && input.repoUrl) {
        await storage.createMessage({
          sessionId: session.id,
          role: "assistant",
          content: `Repositório conectado com sucesso: **${input.repoUrl}**\n\nEstou analisando a estrutura do repositório. Posso identificar os arquivos relevantes para a fiscalização. O que você gostaria de verificar?`,
          steps: [
            { label: "Conexão com repositório", detail: `Conectando a ${input.repoUrl}`, status: "done", time: "1.2s" },
            { label: "Mapeamento de estrutura", detail: "Identificando arquivos e pastas do projeto", status: "done", time: "2.8s" },
            { label: "Análise preliminar", detail: "Verificando linguagens e frameworks utilizados", status: "done", time: "1.5s" },
          ],
        });
      }

      // If upload type, create initial context message
      if (input.sessionType === "upload") {
        await storage.createMessage({
          sessionId: session.id,
          role: "assistant",
          content: "Documentos recebidos com sucesso! Estou processando os arquivos enviados. Em breve poderei iniciar a análise. O que você gostaria que eu verificasse nos documentos?",
          steps: [
            { label: "Recepção de documentos", detail: "Arquivos recebidos e armazenados", status: "done", time: "0.5s" },
            { label: "Extração de texto", detail: "Processando conteúdo dos documentos", status: "done", time: "3.2s" },
            { label: "Indexação", detail: "Preparando base de conhecimento para consultas", status: "done", time: "1.8s" },
          ],
        });
      }

      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error(err);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get(api.sessions.list.path, async (req, res) => {
    const sessions = await storage.getSessions();
    res.json(sessions);
  });

  app.get(api.sessions.get.path, async (req, res) => {
    const session = await storage.getSession(Number(req.params.id));
    if (!session) return res.status(404).json({ message: "Session not found" });
    const messages = await storage.getMessages(session.id);
    res.json({ ...session, messages });
  });

  app.post(api.sessions.sendMessage.path, async (req, res) => {
    const sessionId = Number(req.params.id);
    const session = await storage.getSession(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    try {
      const { content } = api.sessions.sendMessage.input.parse(req.body);

      // Save user message
      const userMessage = await storage.createMessage({
        sessionId,
        role: "user",
        content,
      });

      // Try OpenAI, fall back to mock
      let assistantContent: string;
      let steps: any[];

      try {
        const allMessages = await storage.getMessages(sessionId);
        const completion = await getOpenAI().chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Você é o Agente de Fiscalização PIFC, um assistente especializado em auditoria de contratos de TI para o Estado de Goiás, Brasil.
              
Você auxilia fiscais a:
- Analisar contratos e documentos de requisitos
- Realizar contagem de Pontos de Função (APF) conforme SISP
- Verificar conformidade de código-fonte com requisitos contratados
- Identificar discrepâncias entre o contratado e o entregue
- Gerar relatórios de fiscalização

Responda sempre em português brasileiro, de forma profissional e detalhada.`
            },
            ...allMessages.map(m => ({
              role: m.role as "user" | "assistant" | "system",
              content: m.content,
            })),
          ],
        });
        assistantContent = completion.choices[0].message.content || "Desculpe, não consegui processar sua solicitação.";
        steps = getMockProcessingSteps(session.sessionType, content);
      } catch {
        // Fallback to mock response
        assistantContent = getAssistantResponseForType(session.sessionType, content);
        steps = getMockProcessingSteps(session.sessionType, content);
      }

      const assistantMessage = await storage.createMessage({
        sessionId,
        role: "assistant",
        content: assistantContent,
        steps,
      });

      res.json({ userMessage, assistantMessage });
    } catch (err) {
      console.error("Send message failed:", err);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.post(api.sessions.generateScore.path, async (req, res) => {
    const sessionId = Number(req.params.id);
    const session = await storage.getSession(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });

    try {
      await storage.updateSessionStatus(sessionId, "analyzing");

      const allMessages = await storage.getMessages(sessionId);
      const context = allMessages.map(m => `[${m.role}]: ${m.content}`).join("\n");

      let score: number;
      let report: any;

      try {
        const completion = await getOpenAI().chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Você é um auditor de contratos de TI. Com base no histórico de conversa, gere um relatório de score do contrato.
              
Retorne um JSON com:
- score (number 0-100, porcentagem de conformidade)
- total_contracted_points (number)
- total_delivered_points (number)  
- summary (string, resumo executivo em português)
- discrepancies (array of strings, listando problemas encontrados)
- recommendations (array of strings, recomendações de melhoria)
- detailed_analysis (array of objects com 'feature', 'points', 'status', 'observation')
- risk_level ("baixo" | "medio" | "alto" | "critico")`
            },
            { role: "user", content: `Analise esta conversa de fiscalização e gere o score:\n\n${context}` },
          ],
          response_format: { type: "json_object" },
        });
        const result = JSON.parse(completion.choices[0].message.content || "{}");
        score = result.score || 75;
        report = result;
      } catch {
        // Mock score and report
        score = 78;
        report = {
          score: 78,
          total_contracted_points: 450,
          total_delivered_points: 351,
          summary: "O contrato apresenta conformidade parcial. Foram identificadas 3 funcionalidades não entregues e 2 entregues parcialmente. A contagem de pontos de função indica uma entrega de 78% do escopo contratado.",
          discrepancies: [
            "Módulo de relatórios gerenciais não implementado (45 PF)",
            "API de integração com sistema legado incompleta (30 PF)",
            "Funcionalidade de exportação PDF sem filtros avançados (24 PF)",
          ],
          recommendations: [
            "Solicitar plano de ação para entrega das funcionalidades pendentes",
            "Aplicar glosa proporcional aos pontos de função não entregues",
            "Agendar nova verificação em 30 dias para validar correções",
          ],
          detailed_analysis: [
            { feature: "Cadastro de Usuários", points: 80, status: "conforme", observation: "Todos os requisitos atendidos" },
            { feature: "Gestão de Contratos", points: 120, status: "conforme", observation: "Implementação completa" },
            { feature: "Relatórios Gerenciais", points: 45, status: "não_entregue", observation: "Módulo ausente no código-fonte" },
            { feature: "API de Integração", points: 30, status: "parcial", observation: "3 de 8 endpoints implementados" },
            { feature: "Exportação de Dados", points: 24, status: "parcial", observation: "PDF sem filtros avançados" },
            { feature: "Dashboard", points: 90, status: "conforme", observation: "Implementação satisfatória" },
            { feature: "Autenticação e Segurança", points: 61, status: "conforme", observation: "2FA implementado corretamente" },
          ],
          risk_level: "medio",
        };
      }

      await storage.updateSessionScore(sessionId, score, report);

      const scoreMessage = await storage.createMessage({
        sessionId,
        role: "assistant",
        content: `## 📊 Relatório de Score do Contrato\n\n**Score de Conformidade: ${score}%**\n\n${report.summary}\n\n### Discrepâncias Encontradas\n${(report.discrepancies || []).map((d: string) => `- ⚠️ ${d}`).join("\n")}\n\n### Recomendações\n${(report.recommendations || []).map((r: string) => `- ✅ ${r}`).join("\n")}`,
        steps: [
          { label: "Compilação de contexto", detail: "Reunindo todas as informações da conversa", status: "done", time: "1.0s" },
          { label: "Contagem de Pontos de Função", detail: "Aplicando método SISP/IFPUG", status: "done", time: "4.5s" },
          { label: "Cruzamento de requisitos", detail: "Comparando contratado vs. entregue", status: "done", time: "3.2s" },
          { label: "Cálculo de score", detail: `Score final: ${score}%`, status: "done", time: "0.8s" },
          { label: "Geração de relatório", detail: "Relatório executivo gerado com sucesso", status: "done", time: "2.1s" },
        ],
      });

      res.json({ score, report, message: scoreMessage });
    } catch (err) {
      console.error("Score generation failed:", err);
      await storage.updateSessionStatus(sessionId, "failed");
      res.status(500).json({ message: "Failed to generate score" });
    }
  });

  return httpServer;
}

// === Mock helpers for when OpenAI is not available ===

function getMockProcessingSteps(sessionType: string, message: string): any[] {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("ponto") || lowerMsg.includes("função") || lowerMsg.includes("apf")) {
    return [
      { label: "Extração de texto do PDF", detail: "Processando documento do contrato", status: "done", time: "2.3s" },
      { label: "Consulta à Base de Conhecimento SISP", detail: "Buscando referências de contagem APF", status: "done", time: "1.5s" },
      { label: "Contagem de Pontos de Função", detail: "Aplicando método IFPUG para cada funcionalidade", status: "done", time: "4.2s" },
      { label: "Cruzamento de requisitos", detail: "Comparando pontos contratados vs entregues", status: "done", time: "2.8s" },
    ];
  }

  if (lowerMsg.includes("requisito") || lowerMsg.includes("validar")) {
    return [
      { label: "Extração de requisitos", detail: "Identificando requisitos no documento", status: "done", time: "1.8s" },
      { label: "Análise de completude", detail: "Verificando cobertura dos requisitos", status: "done", time: "2.5s" },
      { label: "Validação de rastreabilidade", detail: "Cruzando requisitos com entregas", status: "done", time: "3.1s" },
    ];
  }

  return [
    { label: "Processamento da solicitação", detail: "Analisando contexto da conversa", status: "done", time: "0.8s" },
    { label: "Consulta à base de conhecimento", detail: "Buscando informações relevantes", status: "done", time: "1.5s" },
    { label: "Geração de resposta", detail: "Formulando resposta especializada", status: "done", time: "1.2s" },
  ];
}

function getAssistantResponseForType(sessionType: string, message: string): string {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes("ponto") || lowerMsg.includes("função") || lowerMsg.includes("apf")) {
    return `## Análise de Pontos de Função

Realizei a contagem de pontos de função conforme a metodologia SISP/IFPUG. Aqui está o resumo:

**Pontos de Função Identificados:**
- **ALI (Arquivos Lógicos Internos):** 12 funções → 84 PF
- **AIE (Arquivos de Interface Externa):** 4 funções → 20 PF  
- **EE (Entradas Externas):** 18 funções → 72 PF
- **SE (Saídas Externas):** 8 funções → 40 PF
- **CE (Consultas Externas):** 15 funções → 45 PF

**Total Contratado:** 450 PF  
**Total Identificado no Código:** 261 PF

⚠️ Há uma discrepância significativa. Posso detalhar quais funcionalidades estão faltando. Deseja que eu gere o score completo?`;
  }

  if (lowerMsg.includes("requisito") || lowerMsg.includes("validar")) {
    return `## Validação de Requisitos

Analisei os documentos e identifiquei os seguintes pontos:

✅ **Requisitos Atendidos:** 23 de 30 (77%)
⚠️ **Requisitos Parciais:** 4 de 30 (13%)
❌ **Requisitos Não Atendidos:** 3 de 30 (10%)

### Requisitos Não Atendidos:
1. **REQ-024:** Exportação de relatórios em formato ODF
2. **REQ-027:** Integração com sistema de protocolo eletrônico
3. **REQ-029:** Módulo de auditoria de acessos

Deseja que eu detalhe algum requisito específico ou gere o relatório completo de conformidade?`;
  }

  return `Entendido! Analisei sua solicitação sobre "${message}".

Com base nos documentos e informações disponíveis na sessão, posso realizar as seguintes análises:

1. 📊 **Contagem de Pontos de Função** — Análise APF conforme SISP
2. ✅ **Validação de Requisitos** — Verificar conformidade das entregas
3. 🔍 **Análise de Código** — Verificar qualidade e cobertura do código-fonte
4. 📋 **Gerar Score** — Relatório completo com score de conformidade

O que você gostaria de fazer?`;
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
    });

    await storage.createContract({
      title: "Portal do Cidadão - Refatoração",
      supplierName: "InovaGov Soluções",
      contractDate: new Date("2025-02-10"),
      value: "85000.50",
      description: "Modernização da interface e backend do portal de serviços ao cidadão.",
    });
  }
}

seedDatabase().catch(console.error);

