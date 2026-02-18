import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { cn } from "@/lib/utils";
import { useChatSession, useSendMessage, useGenerateScore, useSessions } from "@/hooks/use-chat";
import type { ChatMessage, ProcessingStep } from "@shared/schema";

const mainNavItems = [
    { icon: "chat_bubble", label: "Chat Fiscalização", href: "/nova-fiscalizacao", active: false },
    { icon: "history", label: "Histórico de Contratos", href: "/contracts" },
    { icon: "library_books", label: "Biblioteca SISP", href: "#" },
];

const managementNavItems = [
    { icon: "dashboard", label: "Dashboard", href: "/" },
    { icon: "description", label: "Relatórios", href: "/reports" },
    { icon: "settings", label: "Configurações", href: "/settings" },
];

const suggestions = [
    "Contar Pontos de Função",
    "Validar Requisitos",
    "Gerar Score de Fornecedor",
    "Checklist Design System",
];

export default function ChatSession() {
    const [, params] = useRoute("/chat/:sessionId");
    const sessionId = parseInt(params?.sessionId || "0");
    const [location] = useLocation();

    const { data: session, isLoading } = useChatSession(sessionId);
    const sendMessage = useSendMessage();
    const generateScore = useGenerateScore();
    const { data: allSessions } = useSessions();

    const [message, setMessage] = useState("");
    const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Sync server messages to local state
    useEffect(() => {
        if (session?.messages) {
            setLocalMessages(session.messages);
        }
    }, [session?.messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [localMessages, isThinking]);

    const handleSendMessage = async () => {
        if (!message.trim() || sendMessage.isPending) return;
        const userMsg = message.trim();
        setMessage("");

        // Optimistic: add user message locally
        const tempUserMsg: ChatMessage = {
            id: Date.now(),
            sessionId,
            role: "user",
            content: userMsg,
            steps: null,
            createdAt: new Date(),
        };
        setLocalMessages(prev => [...prev, tempUserMsg]);
        setIsThinking(true);

        try {
            const result = await sendMessage.mutateAsync({ sessionId, content: userMsg });
            // Replace temp with server data
            setLocalMessages(prev => {
                const filtered = prev.filter(m => m.id !== tempUserMsg.id);
                return [...filtered, result.userMessage, result.assistantMessage];
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsThinking(false);
        }
    };

    const handleGenerateScore = async () => {
        if (generateScore.isPending) return;
        setIsThinking(true);

        // Add temporary thinking message
        const thinkingMsg: ChatMessage = {
            id: Date.now(),
            sessionId,
            role: "assistant",
            content: "Gerando score e relatório de conformidade...",
            steps: [
                { label: "Compilação de contexto", detail: "Reunindo informações da conversa", status: "loading", time: "" },
                { label: "Contagem de Pontos de Função", detail: "Aguardando...", status: "pending" },
                { label: "Cruzamento de requisitos", detail: "Aguardando...", status: "pending" },
                { label: "Cálculo de score", detail: "Aguardando...", status: "pending" },
                { label: "Geração de relatório", detail: "Aguardando...", status: "pending" },
            ],
            createdAt: new Date(),
        };
        setLocalMessages(prev => [...prev, thinkingMsg]);

        try {
            const result = await generateScore.mutateAsync(sessionId);
            setLocalMessages(prev => {
                const filtered = prev.filter(m => m.id !== thinkingMsg.id);
                return [...filtered, result.message];
            });
        } catch (err) {
            console.error(err);
            setLocalMessages(prev => prev.filter(m => m.id !== thinkingMsg.id));
        } finally {
            setIsThinking(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setMessage(suggestion);
        textareaRef.current?.focus();
    };

    const isCompleted = session?.status === "completed";

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-pifc-primary/20 border-t-pifc-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Carregando sessão...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
                {/* Logo */}
                <div className="p-5 border-b border-gray-100">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="w-8 h-8 bg-pifc-primary rounded-lg flex items-center justify-center shadow-sm">
                            <span className="text-white font-bold text-sm">P</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-800 text-sm leading-tight group-hover:text-pifc-primary transition-colors">
                                PIFC Platform
                            </h1>
                            <p className="text-[10px] text-gray-400 leading-tight">Fiscalização Inteligente</p>
                        </div>
                    </Link>
                </div>

                {/* Main Nav */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                        Principal
                    </p>
                    <ul className="space-y-0.5">
                        {mainNavItems.map((item) => {
                            const isActive = item.href === "/nova-fiscalizacao" || location.startsWith("/chat");
                            return (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                                            isActive
                                                ? "bg-pifc-primary/10 text-pifc-primary font-medium"
                                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
                                        )}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Recent Sessions */}
                    <div className="mt-6">
                        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Análises Recentes
                        </p>
                        <ul className="space-y-0.5">
                            {(allSessions || []).slice(0, 5).map((s) => (
                                <li key={s.id}>
                                    <Link
                                        href={`/chat/${s.id}`}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all",
                                            s.id === sessionId
                                                ? "bg-pifc-primary/10 text-pifc-primary font-medium"
                                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        )}
                                    >
                                        <span className="material-symbols-outlined text-[14px]">
                                            {s.status === "completed" ? "check_circle" : "chat_bubble"}
                                        </span>
                                        <span className="truncate">{s.title || "Sessão " + s.id}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Management */}
                    <div className="mt-6">
                        <p className="px-3 mb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            Gerenciamento
                        </p>
                        <ul className="space-y-0.5">
                            {managementNavItems.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <Link href="/nova-fiscalizacao" className="text-gray-400 hover:text-pifc-primary transition-colors">
                            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                        </Link>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800">
                                {session?.title || "Chat de Fiscalização"}
                            </h2>
                            <p className="text-[11px] text-gray-400">
                                Sessão #{sessionId} •{" "}
                                {session?.sessionType === "repo" ? "Repositório" : session?.sessionType === "upload" ? "Upload" : "Chat"}
                                {isCompleted && (
                                    <span className="ml-2 text-emerald-500 font-medium">• Score: {session?.score}%</span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {!isCompleted && localMessages.length >= 2 && (
                            <button
                                onClick={handleGenerateScore}
                                disabled={generateScore.isPending || isThinking}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-all shadow-sm hover:shadow"
                            >
                                <span className="material-symbols-outlined text-[16px]">analytics</span>
                                Gerar Score
                            </button>
                        )}
                    </div>
                </header>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 pb-52">
                    {/* Welcome if no messages */}
                    {localMessages.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-pifc-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-pifc-primary text-3xl">smart_toy</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Como posso auxiliar na fiscalização hoje?
                            </h3>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                                Envie uma mensagem para começar a análise. Posso ajudar com contagem de pontos de função, validação de requisitos e geração de score.
                            </p>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {localMessages.map((msg) => (
                            <div key={msg.id}>
                                {msg.role === "user" ? (
                                    <UserMessage content={msg.content} />
                                ) : (
                                    <AssistantMessage content={msg.content} steps={msg.steps as ProcessingStep[] | null} />
                                )}
                            </div>
                        ))}

                        {/* Thinking indicator */}
                        {isThinking && !localMessages.some(m => m.steps && (m.steps as any[]).some((s: any) => s.status === "loading")) && (
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-pifc-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-pifc-primary text-[16px]">smart_toy</span>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-pifc-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                                        <div className="w-2 h-2 bg-pifc-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                                        <div className="w-2 h-2 bg-pifc-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                                    </div>
                                    <span className="text-xs text-gray-400">Processando...</span>
                                </div>
                            </div>
                        )}

                        {/* Score Report Card */}
                        {isCompleted && session?.scoreReport && (
                            <ScoreReport score={session.score!} report={session.scoreReport as any} />
                        )}

                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Chat Input - Fixed at bottom */}
                <div className="fixed bottom-0 right-0 left-64 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-8 pb-4 px-6 z-10">
                    <div className="max-w-4xl mx-auto">
                        {/* Input Container */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                            <div className="flex items-end gap-2 p-3">
                                {/* Action Buttons */}
                                <div className="flex items-center gap-1 pb-0.5">
                                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Adicionar">
                                        <span className="material-symbols-outlined text-[20px]">add</span>
                                    </button>
                                    <Link href="/nova-fiscalizacao" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Repositório">
                                        <span className="material-symbols-outlined text-[20px]">deployed_code</span>
                                    </Link>
                                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Documento">
                                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                    </button>
                                </div>

                                {/* Textarea */}
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isCompleted ? "Sessão finalizada. Inicie uma nova análise." : "Descreva o que você precisa analisar..."}
                                    disabled={isCompleted}
                                    className="flex-1 resize-none bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none min-h-[36px] max-h-32 py-2 disabled:opacity-50"
                                    style={{ height: "36px" }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = "36px";
                                        target.style.height = Math.min(target.scrollHeight, 128) + "px";
                                    }}
                                />

                                {/* Right buttons */}
                                <div className="flex items-center gap-1 pb-0.5">
                                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors" title="Microfone">
                                        <span className="material-symbols-outlined text-[20px]">mic</span>
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim() || sendMessage.isPending || isCompleted}
                                        className={cn(
                                            "p-1.5 rounded-lg transition-all",
                                            message.trim() && !isCompleted
                                                ? "bg-pifc-primary text-white hover:bg-pifc-primary-dark shadow-sm"
                                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                        )}
                                    >
                                        <span className="material-symbols-outlined text-[20px]">arrow_upward</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Suggestion Chips */}
                        {!isCompleted && localMessages.length <= 2 && (
                            <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-center">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleSuggestionClick(s)}
                                        className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-full hover:border-pifc-primary hover:text-pifc-primary hover:bg-pifc-primary/5 transition-all"
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Disclaimer */}
                        <p className="text-center text-[10px] text-gray-400 mt-2">
                            O agente pode cometer erros. Verifique informações importantes. Baseado no modelo PIFC-v2.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

// === Sub-components ===

function UserMessage({ content }: { content: string }) {
    return (
        <div className="flex justify-end">
            <div className="bg-pifc-primary text-white px-4 py-2.5 rounded-2xl rounded-br-md max-w-lg shadow-sm">
                <p className="text-sm leading-relaxed">{content}</p>
            </div>
        </div>
    );
}

function AssistantMessage({ content, steps }: { content: string; steps: ProcessingStep[] | null }) {
    return (
        <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-pifc-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-pifc-primary text-[16px]">smart_toy</span>
            </div>

            <div className="flex-1 min-w-0 space-y-2">
                {/* Header */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-700">Agente de Fiscalização</span>
                    <span className="px-1.5 py-0.5 bg-pifc-primary/10 text-pifc-primary text-[9px] font-bold rounded uppercase">LITE</span>
                </div>

                {/* Processing Steps */}
                {steps && steps.length > 0 && (
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 space-y-1.5">
                        {steps.map((step: ProcessingStep, i: number) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-center gap-2 text-xs",
                                    step.status === "pending" && "opacity-40"
                                )}
                            >
                                {step.status === "done" && (
                                    <span className="material-symbols-outlined text-emerald-500 text-[16px]">check_circle</span>
                                )}
                                {step.status === "loading" && (
                                    <span className="material-symbols-outlined text-pifc-primary text-[16px] animate-spin">progress_activity</span>
                                )}
                                {step.status === "pending" && (
                                    <span className="material-symbols-outlined text-gray-300 text-[16px]">radio_button_unchecked</span>
                                )}
                                <span className="font-medium text-gray-700">{step.label}</span>
                                <span className="text-gray-400 hidden sm:inline">— {step.detail}</span>
                                {step.time && step.status === "done" && (
                                    <span className="ml-auto text-gray-400 text-[10px] font-mono">{step.time}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Message Content */}
                <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none">
                    {content.split("\n").map((line, i) => {
                        if (line.startsWith("## ")) {
                            return <h3 key={i} className="text-base font-bold text-gray-800 mt-3 mb-1">{line.replace("## ", "")}</h3>;
                        }
                        if (line.startsWith("### ")) {
                            return <h4 key={i} className="text-sm font-bold text-gray-700 mt-2 mb-1">{line.replace("### ", "")}</h4>;
                        }
                        if (line.startsWith("- **")) {
                            const parts = line.replace("- **", "").split("**");
                            return (
                                <p key={i} className="ml-4 my-0.5">
                                    • <strong>{parts[0]}</strong>{parts.slice(1).join("")}
                                </p>
                            );
                        }
                        if (line.startsWith("- ⚠️") || line.startsWith("- ✅") || line.startsWith("- ❌")) {
                            return <p key={i} className="ml-4 my-0.5">{line.replace("- ", "• ")}</p>;
                        }
                        if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ") || line.startsWith("4. ")) {
                            return <p key={i} className="ml-4 my-0.5">{line}</p>;
                        }
                        if (line.startsWith("**") && line.endsWith("**")) {
                            return <p key={i} className="font-bold my-1">{line.replace(/\*\*/g, "")}</p>;
                        }
                        if (line.trim() === "") return <br key={i} />;
                        return <p key={i} className="my-0.5">{line.replace(/\*\*(.*?)\*\*/g, "").length < line.length
                            ? <>{renderBold(line)}</>
                            : line
                        }</p>;
                    })}
                </div>
            </div>
        </div>
    );
}

function renderBold(text: string): React.ReactNode[] {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        return <span key={i}>{part}</span>;
    });
}

function ScoreReport({ score, report }: { score: number; report: any }) {
    const riskColors: Record<string, string> = {
        baixo: "text-emerald-600 bg-emerald-50 border-emerald-200",
        medio: "text-amber-600 bg-amber-50 border-amber-200",
        alto: "text-orange-600 bg-orange-50 border-orange-200",
        critico: "text-red-600 bg-red-50 border-red-200",
    };

    const scoreColor = score >= 80 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
    const scoreGradient = score >= 80
        ? "from-emerald-500 to-emerald-600"
        : score >= 60
            ? "from-amber-500 to-amber-600"
            : "from-red-500 to-red-600";

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden mt-6">
            {/* Score Header */}
            <div className={cn("bg-gradient-to-r p-6 text-white", scoreGradient)}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium opacity-90">Score de Conformidade</p>
                        <p className="text-5xl font-bold mt-1">{score}%</p>
                    </div>
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl">analytics</span>
                    </div>
                </div>
                {report.risk_level && (
                    <div className="mt-3 inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                        Risco: {report.risk_level.charAt(0).toUpperCase() + report.risk_level.slice(1)}
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="p-6 border-b border-gray-100">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Resumo Executivo</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{report.summary}</p>
            </div>

            {/* Points */}
            {report.total_contracted_points && (
                <div className="p-6 border-b border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className="text-2xl font-bold text-gray-800">{report.total_contracted_points}</p>
                            <p className="text-xs text-gray-500 mt-1">PF Contratados</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4 text-center">
                            <p className={cn("text-2xl font-bold", scoreColor)}>{report.total_delivered_points}</p>
                            <p className="text-xs text-gray-500 mt-1">PF Entregues</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Analysis */}
            {report.detailed_analysis && (
                <div className="p-6 border-b border-gray-100">
                    <h4 className="text-sm font-bold text-gray-800 mb-3">Análise Detalhada</h4>
                    <div className="space-y-2">
                        {report.detailed_analysis.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "material-symbols-outlined text-[16px]",
                                        item.status === "conforme" ? "text-emerald-500" :
                                            item.status === "parcial" ? "text-amber-500" : "text-red-500"
                                    )}>
                                        {item.status === "conforme" ? "check_circle" :
                                            item.status === "parcial" ? "warning" : "cancel"}
                                    </span>
                                    <span className="text-sm text-gray-700">{item.feature}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-400 max-w-[200px] truncate hidden md:inline">{item.observation}</span>
                                    <span className="text-xs font-mono font-medium text-gray-600">{item.points} PF</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Discrepancies & Recommendations */}
            <div className="p-6 grid md:grid-cols-2 gap-6">
                {report.discrepancies && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-amber-500 text-[16px]">warning</span>
                            Discrepâncias
                        </h4>
                        <ul className="space-y-1.5">
                            {report.discrepancies.map((d: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                    <span className="text-amber-400 mt-0.5">•</span>
                                    {d}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {report.recommendations && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-pifc-primary text-[16px]">lightbulb</span>
                            Recomendações
                        </h4>
                        <ul className="space-y-1.5">
                            {report.recommendations.map((r: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                    <span className="text-pifc-primary mt-0.5">•</span>
                                    {r}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
