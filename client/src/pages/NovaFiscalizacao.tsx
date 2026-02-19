import { useState, useRef, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useCreateSession } from "@/hooks/use-chat";

// Chat suggestion chips
const chatSuggestions = [
    { icon: "calculate", label: "Contar Pontos de Função" },
    { icon: "fact_check", label: "Validar Requisitos" },
    { icon: "scoreboard", label: "Gerar Score de Fornecedor" },
    { icon: "palette", label: "Checklist Design System" },
];

// Types for chat
interface ChatStep {
    label: string;
    detail: string;
    status: "done" | "loading" | "pending";
    time?: string;
}

interface ChatMessage {
    role: "user" | "assistant";
    text: string;
    steps?: ChatStep[];
    stepsProgress?: string; // e.g., "3 de 5 passos"
}

export default function NovaFiscalizacao() {
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const [repoUrl, setRepoUrl] = useState("");
    const [activeTab, setActiveTab] = useState<"repo" | "upload">("repo");
    const [showChat, setShowChat] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [location, navigate] = useLocation();
    const createSession = useCreateSession();

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    const handleSendMessage = async () => {
        if (!message.trim() || createSession.isPending) return;
        const userMsg = message.trim();
        setMessage("");

        try {
            const session = await createSession.mutateAsync({
                sessionType: "chat",
                title: userMsg.length > 40 ? userMsg.substring(0, 40) + "..." : userMsg,
                initialMessage: userMsg,
            });
            navigate(`/chat/${session.id}`);
        } catch (err) {
            console.error("Failed to create session:", err);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        setUploadedFiles((prev) => [...prev, ...files]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setUploadedFiles((prev) => [...prev, ...files]);
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
    };



    return (
        <DashboardLayout noPadding>
            {/* Main Content */}
            <div className="flex-1 overflow-hidden bg-gray-50/50 flex flex-col relative h-full">
                {/* Top Header Bar */}
                <header className="flex items-center justify-between px-8 py-4 bg-transparent z-10 flex-shrink-0">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link href="/" className="hover:text-pifc-primary transition-colors">
                            PIFC 2.0
                        </Link>
                        <span className="material-icons-outlined text-xs">chevron_right</span>
                        <span className="font-medium text-gray-800">
                            {showChat ? "Novo Chat" : "Selecionar Fonte de Dados"}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">

                        <div className="flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm">
                            <span className="material-icons-outlined text-yellow-500 text-sm">bolt</span>
                            <span className="text-gray-800">300 créditos</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-8 pb-48 flex flex-col items-center">
                    <div className="w-full max-w-4xl">
                        {/* Hero Title */}
                        <div className="text-center mb-10 animate-enter">
                            <h1 className="text-3xl font-bold text-gray-800 mb-3 tracking-tight">
                                {showChat
                                    ? "Como posso auxiliar na fiscalização hoje?"
                                    : "O que você deseja analisar hoje?"}
                            </h1>
                            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                                {showChat
                                    ? "Seu assistente especializado em normas do SISP e análise técnica contratual."
                                    : "Selecione a fonte dos artefatos ou conecte um repositório para iniciar a auditoria com o Agente de Fiscalização."}
                            </p>
                        </div>

                        {/* Tabbed Card - Stitch Style (Integração de Repositório / Importação de Arquivos) */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden w-full mx-auto max-w-3xl animate-enter" style={{ animationDelay: "100ms" }}>
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 bg-gray-50/50">
                                <button
                                    onClick={() => setActiveTab("repo")}
                                    className={cn(
                                        "flex-1 py-4 text-sm font-semibold text-center transition-colors flex items-center justify-center gap-2",
                                        activeTab === "repo"
                                            ? "border-b-2 border-pifc-primary text-pifc-primary"
                                            : "border-b border-transparent text-gray-500 hover:text-gray-700 hover:bg-white"
                                    )}
                                >
                                    <span className="material-icons-outlined text-lg">deployed_code</span>
                                    Integração de Repositório
                                </button>
                                <button
                                    onClick={() => setActiveTab("upload")}
                                    className={cn(
                                        "flex-1 py-4 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2",
                                        activeTab === "upload"
                                            ? "border-b-2 border-pifc-primary text-pifc-primary"
                                            : "border-b border-transparent text-gray-500 hover:text-gray-700 hover:bg-white"
                                    )}
                                >
                                    <span className="material-icons-outlined text-lg">upload_file</span>
                                    Importação de Arquivos
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="p-8">
                                {activeTab === "repo" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                                        {/* Left Column - Info */}
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Conecte sua fonte de código</h3>
                                                <p className="text-sm text-gray-500 leading-relaxed">
                                                    Vincule repositórios Git ou projetos de gestão para que a IA analise commits, pull requests e tickets em tempo real. Ideal para auditoria contínua de contratos de software.
                                                </p>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Provedores Suportados</label>
                                                <div className="flex gap-4">
                                                    {[
                                                        { name: "GitHub", icon: "code", color: "text-gray-800" },
                                                        { name: "GitLab", icon: "merge_type", color: "text-orange-500" },
                                                        { name: "Jira", icon: "assignment", color: "text-blue-600" },
                                                    ].map((repo) => (
                                                        <button
                                                            key={repo.name}
                                                            onClick={() =>
                                                                setSelectedRepo(selectedRepo === repo.name ? null : repo.name)
                                                            }
                                                            className={cn(
                                                                "flex flex-col items-center justify-center w-20 h-20 rounded-lg border transition-all group bg-gray-50",
                                                                selectedRepo === repo.name
                                                                    ? "border-pifc-primary bg-blue-50 shadow-sm"
                                                                    : "border-gray-200 hover:border-pifc-primary hover:bg-blue-50/50"
                                                            )}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    "material-icons-outlined text-2xl mb-1 opacity-80 group-hover:opacity-100 transition-opacity",
                                                                    selectedRepo === repo.name ? "text-pifc-primary" : repo.color
                                                                )}
                                                            >
                                                                {repo.icon}
                                                            </span>
                                                            <span className="text-[10px] font-medium text-gray-700">{repo.name}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - URL Input */}
                                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 h-full flex flex-col">
                                            <label className="block text-sm font-medium text-gray-800 mb-2">URL do Repositório</label>
                                            <div className="relative mb-4">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                                    <span className="material-icons-outlined text-lg">link</span>
                                                </span>
                                                <input
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pifc-primary focus:border-pifc-primary outline-none transition-all placeholder-gray-400 text-gray-800"
                                                    placeholder="https://github.com/organizacao/projeto..."
                                                    type="text"
                                                    value={repoUrl}
                                                    onChange={(e) => setRepoUrl(e.target.value)}
                                                />
                                            </div>
                                            <div className="mt-auto pt-4 border-t border-gray-200/50 flex justify-end">
                                                <button
                                                    disabled={!repoUrl.trim() || createSession.isPending}
                                                    onClick={async () => {
                                                        try {
                                                            const session = await createSession.mutateAsync({
                                                                sessionType: "repo",
                                                                title: `Repo: ${repoUrl.split('/').pop() || repoUrl}`,
                                                                repoUrl: repoUrl.trim(),
                                                            });
                                                            navigate(`/chat/${session.id}`);
                                                        } catch (err) {
                                                            console.error("Failed to create repo session:", err);
                                                        }
                                                    }}
                                                    className="px-5 py-2.5 bg-pifc-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                                >
                                                    <span>Conectar e Analisar</span>
                                                    <span className="material-icons-outlined text-sm">arrow_forward</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Upload Tab Content */
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Importe seus documentos</h3>
                                            <p className="text-sm text-gray-500 leading-relaxed">
                                                Carregue Termos de Referência, Planilhas de Custos, relatórios ou qualquer documento relevante para a fiscalização.
                                            </p>
                                        </div>

                                        {/* Drop zone */}
                                        <div
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setDragOver(true);
                                            }}
                                            onDragLeave={() => setDragOver(false)}
                                            onDrop={handleFileDrop}
                                            onClick={() => fileInputRef.current?.click()}
                                            className={cn(
                                                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
                                                dragOver
                                                    ? "border-pifc-primary bg-pifc-primary/5"
                                                    : "border-gray-300 hover:border-pifc-primary/50 hover:bg-gray-50"
                                            )}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                accept=".zip,.pdf,.png,.txt,.md"
                                                className="hidden"
                                                onChange={handleFileSelect}
                                            />
                                            <span className="material-icons-outlined text-4xl text-gray-400 mb-3 block">
                                                cloud_upload
                                            </span>
                                            <p className="text-sm font-medium text-gray-600">
                                                Clique ou arraste arquivos aqui
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wide">
                                                ZIP, PDF, PNG, TXT, MD (MAX 50MB)
                                            </p>
                                        </div>

                                        {/* Uploaded files list */}
                                        {uploadedFiles.length > 0 && (
                                            <div className="space-y-2">
                                                {uploadedFiles.map((file, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="material-icons-outlined text-pifc-primary text-base">
                                                                description
                                                            </span>
                                                            <span className="text-gray-700 font-medium truncate max-w-[250px]">
                                                                {file.name}
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() =>
                                                                setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
                                                            }
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <span className="material-icons-outlined text-base">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Upload button */}
                                        <div className="flex justify-end">
                                            <button
                                                disabled={uploadedFiles.length === 0 || createSession.isPending}
                                                onClick={async () => {
                                                    try {
                                                        const session = await createSession.mutateAsync({
                                                            sessionType: "upload",
                                                            title: `Upload: ${uploadedFiles.map(f => f.name).join(', ')}`.substring(0, 60),
                                                        });
                                                        navigate(`/chat/${session.id}`);
                                                    } catch (err) {
                                                        console.error("Failed to create upload session:", err);
                                                    }
                                                }}
                                                className="px-5 py-2.5 bg-pifc-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                <span>Analisar Documentos</span>
                                                <span className="material-icons-outlined text-sm">arrow_forward</span>
                                            </button>
                                        </div>

                                        {/* Security badge */}
                                        <div className="flex items-center gap-2 justify-center pt-2">
                                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                                Segurança de Dados Garantida
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== CHAT SECTION - Below the tabs ===== */}
                        <div className="mt-8 w-full max-w-3xl mx-auto animate-enter" style={{ animationDelay: "150ms" }}>
                            {/* Chat Messages Area */}
                            {chatMessages.length > 0 && (
                                <div className="space-y-6 mb-6">
                                    {chatMessages.map((msg, i) => (
                                        <div key={i}>
                                            {msg.role === "user" ? (
                                                /* User Message */
                                                <div className="flex justify-end">
                                                    <div className="bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl rounded-br-none max-w-2xl shadow-sm border border-gray-200">
                                                        <p className="text-sm leading-relaxed">{msg.text}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* Assistant Message with Steps */
                                                <div className="flex gap-4 items-start w-full">
                                                    <div className="w-8 h-8 rounded-full bg-pifc-primary flex items-center justify-center text-white flex-shrink-0 mt-1 shadow-md">
                                                        <span className="material-icons-outlined text-sm">smart_toy</span>
                                                    </div>
                                                    <div className="flex-1 space-y-3 min-w-0">
                                                        {/* Agent header */}
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-sm text-gray-800">Agente de Fiscalização</span>
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-500">LITE</span>
                                                        </div>

                                                        {/* Text response */}
                                                        {msg.text && (
                                                            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                                                <p className="text-sm text-gray-700 leading-relaxed">{msg.text}</p>
                                                            </div>
                                                        )}

                                                        {/* Processing Steps Card */}
                                                        {msg.steps && msg.steps.length > 0 && (
                                                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                                                {/* Steps header */}
                                                                <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors">
                                                                    <span className="text-sm font-medium text-gray-500">Processando solicitação...</span>
                                                                    {msg.stepsProgress && (
                                                                        <span className="text-xs text-gray-400">{msg.stepsProgress}</span>
                                                                    )}
                                                                </div>

                                                                {/* Steps list */}
                                                                <div className="divide-y divide-gray-100">
                                                                    {msg.steps.map((step, si) => (
                                                                        <div
                                                                            key={si}
                                                                            className={cn(
                                                                                "p-3 flex items-start gap-3",
                                                                                step.status === "done" && "bg-green-50/50",
                                                                                step.status === "loading" && "bg-pifc-primary/5",
                                                                                step.status === "pending" && "opacity-50"
                                                                            )}
                                                                        >
                                                                            {/* Step icon */}
                                                                            {step.status === "done" && (
                                                                                <span className="material-icons-outlined text-green-600 text-lg mt-0.5">check_circle</span>
                                                                            )}
                                                                            {step.status === "loading" && (
                                                                                <span className="material-icons-outlined text-pifc-primary text-lg mt-0.5 animate-spin">progress_activity</span>
                                                                            )}
                                                                            {step.status === "pending" && (
                                                                                <span className="material-icons-outlined text-gray-400 text-lg mt-0.5">radio_button_unchecked</span>
                                                                            )}

                                                                            <div className="flex-1 min-w-0">
                                                                                <p className={cn(
                                                                                    "text-sm",
                                                                                    step.status === "pending" ? "text-gray-600" : "text-gray-800 font-medium"
                                                                                )}>
                                                                                    {step.label}
                                                                                </p>
                                                                                {step.detail && (
                                                                                    <p className="text-xs text-gray-400 mt-0.5">{step.detail}</p>
                                                                                )}
                                                                            </div>

                                                                            {step.time && (
                                                                                <span className="text-xs text-gray-400 font-mono flex-shrink-0">{step.time}</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                            )}
                        </div>

                        {/* Quick Templates - shown only when no chat */}
                        {chatMessages.length === 0 && (
                            <div className="mt-12 text-center flex flex-col items-center animate-enter" style={{ animationDelay: "200ms" }}>
                                <p className="text-sm text-gray-500 mb-4">Ou comece com um modelo padrão</p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-200 rounded-full text-xs font-medium text-gray-500 hover:border-pifc-primary hover:text-pifc-primary transition-colors">
                                        <span className="material-icons-outlined text-[16px]">description</span>
                                        Edital de Fábrica de Software
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 bg-transparent border border-gray-200 rounded-full text-xs font-medium text-gray-500 hover:border-pifc-primary hover:text-pifc-primary transition-colors">
                                        <span className="material-icons-outlined text-[16px]">security</span>
                                        Relatório de Vulnerabilidade
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Chat Input - Fixed at bottom with gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-50 via-gray-50 to-transparent pt-12 pb-6 px-4 sm:px-8 flex flex-col items-center justify-end z-20">
                    <div className="w-full max-w-3xl">
                        {/* Chat Input Box - Stitch Design Style */}
                        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 ring-1 ring-black/5 group focus-within:ring-2 focus-within:ring-pifc-primary focus-within:border-pifc-primary transition-all duration-300">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full bg-transparent border-none text-gray-800 placeholder-gray-400 p-4 resize-none h-14 focus:ring-0 text-base outline-none"
                                placeholder="Descreva a tarefa de fiscalização ou cole trechos do contrato..."
                                rows={1}
                            />
                            <div className="flex items-center justify-between px-3 pb-3 pt-1">
                                <div className="flex items-center gap-1">
                                    <button
                                        className="p-2 text-gray-400 hover:text-pifc-primary hover:bg-pifc-primary/10 rounded-lg transition-colors"
                                        title="Adicionar"
                                    >
                                        <span className="material-icons-outlined text-[20px]">add</span>
                                    </button>
                                    <button
                                        className="p-2 text-gray-400 hover:text-pifc-primary hover:bg-pifc-primary/10 rounded-lg transition-colors flex items-center gap-2 group/btn"
                                        title="Repositório"
                                    >
                                        <span className="material-icons-outlined text-[20px]">deployed_code</span>
                                        <span className="text-xs font-medium hidden group-hover/btn:inline-block">Repositório</span>
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-2 text-gray-400 hover:text-pifc-primary hover:bg-pifc-primary/10 rounded-lg transition-colors flex items-center gap-2 group/btn"
                                        title="Documento"
                                    >
                                        <span className="material-icons-outlined text-[20px]">upload_file</span>
                                        <span className="text-xs font-medium hidden group-hover/btn:inline-block">Documento</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-px bg-gray-200 mx-1"></div>
                                    <button
                                        className="p-2 text-gray-400 hover:text-pifc-primary hover:bg-pifc-primary/10 rounded-full transition-colors"
                                        title="Gravar áudio"
                                    >
                                        <span className="material-icons-outlined text-[20px]">mic</span>
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!message.trim()}
                                        className="w-8 h-8 flex items-center justify-center bg-pifc-primary hover:bg-pifc-primary-dark text-white rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        <span className="material-icons-outlined text-[18px]">arrow_upward</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Suggestion Chips */}
                        <div className="flex flex-wrap justify-center gap-2 mt-4">
                            {chatSuggestions.map((s) => (
                                <button
                                    key={s.label}
                                    onClick={() => handleSuggestionClick(s.label)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500 hover:border-pifc-primary hover:text-pifc-primary transition-colors shadow-sm"
                                >
                                    <span className="material-icons-outlined text-[16px]">{s.icon}</span>
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        {/* Disclaimer */}
                        <div className="mt-4 text-center">
                            <p className="text-[10px] text-gray-400 opacity-70">
                                O agente pode cometer erros. Verifique informações importantes. Baseado no modelo PIFC-v2.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
