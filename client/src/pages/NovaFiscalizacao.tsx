import { useState, useRef } from "react";
import { GovHeader } from "@/components/GovHeader";
import { Link } from "wouter";

// Mock recent sessions
const recentSessions = [
    {
        id: 1,
        title: "Contrato TI #458/2023",
        time: "Há 2 horas",
        dotColor: "bg-ds-success",
    },
    {
        id: 2,
        title: "Revisão Cláusula 7 - Manutenção",
        time: "Ontem",
        dotColor: "bg-pifc-primary",
    },
    {
        id: 3,
        title: "Análise de Riscos Março/24",
        time: "3 dias atrás",
        dotColor: "bg-pifc-primary",
    },
];

// Suggestion chips from AI
const suggestions = [
    "Quais documentos são obrigatórios?",
    "Verificar cronograma",
];

export default function NovaFiscalizacao() {
    const [message, setMessage] = useState("");
    const [chatMessages, setChatMessages] = useState<
        { role: "user" | "assistant"; text: string }[]
    >([]);
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSendMessage = () => {
        if (!message.trim()) return;
        setChatMessages((prev) => [
            ...prev,
            { role: "user", text: message },
            {
                role: "assistant",
                text: `Entendido! Vou analisar sua solicitação sobre "${message}". Por favor, anexe os documentos do contrato para que eu possa iniciar a auditoria técnica.`,
            },
        ]);
        setMessage("");
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

    return (
        <div className="font-display bg-bg-light text-gray-800 antialiased min-h-screen flex flex-col">
            <GovHeader />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar - Analysis Sessions */}
                <aside className="w-72 bg-white border-r border-gray-200 flex-col hidden lg:flex shrink-0">
                    {/* New Analysis Button */}
                    <div className="p-4">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-pifc-primary hover:bg-pifc-primary-dark text-white rounded-xl shadow-sm hover:shadow transition-all text-sm font-semibold">
                            <span className="material-icons-outlined text-lg">add</span>
                            Nova Análise
                        </button>
                    </div>

                    {/* Recent Sessions */}
                    <div className="px-4 pt-2 pb-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Sessões Recentes
                        </h3>
                    </div>
                    <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
                        {recentSessions.map((session) => (
                            <button
                                key={session.id}
                                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <p className="text-sm font-medium text-gray-700 group-hover:text-pifc-primary transition-colors truncate">
                                    {session.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className={`w-1.5 h-1.5 rounded-full ${session.dotColor}`}></span>
                                    <span className="text-xs text-gray-400">{session.time}</span>
                                </div>
                            </button>
                        ))}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="p-4 border-t border-gray-200 space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-pifc-primary transition-colors">
                            <span className="material-icons-outlined text-[20px] text-gray-400">tune</span>
                            Configurações Avançadas
                        </button>
                        <Link href="/">
                            <a className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                                <span className="material-icons-outlined text-[20px]">logout</span>
                                Sair do sistema
                            </a>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-bg-light flex flex-col">
                    <div className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 mb-6 animate-enter">
                            <Link href="/">
                                <a className="text-sm text-gray-500 hover:text-pifc-primary transition-colors">
                                    Dashboard
                                </a>
                            </Link>
                            <span className="material-icons-outlined text-xs text-gray-400">
                                chevron_right
                            </span>
                            <span className="text-sm text-pifc-primary font-medium">
                                Nova Análise de Contrato
                            </span>
                        </div>

                        {/* Hero Title */}
                        <div className="text-center mb-10 animate-enter" style={{ animationDelay: "50ms" }}>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                                Olá! Como posso ajudar na fiscalização
                                <br />
                                do seu contrato hoje?
                            </h1>
                            <p className="text-base text-pifc-primary mt-4 max-w-xl mx-auto leading-relaxed">
                                Inicie uma nova análise inteligente ou carregue seus documentos para começar a
                                auditoria técnica.
                            </p>
                        </div>

                        {/* AI Assistant Message */}
                        <div
                            className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-8 animate-enter"
                            style={{ animationDelay: "100ms" }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-pifc-primary/10 flex items-center justify-center shrink-0">
                                    <span className="material-icons-outlined text-pifc-primary text-xl">
                                        smart_toy
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        Estou pronto para analisar seus arquivos. Você pode me enviar o{" "}
                                        <strong>Termo de Referência</strong>, a{" "}
                                        <strong>Planilha de Custos</strong> ou integrar com o repositório de
                                        desenvolvimento para verificar a entrega de artefatos.
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {suggestions.map((suggestion) => (
                                            <button
                                                key={suggestion}
                                                onClick={() => setMessage(suggestion)}
                                                className="px-4 py-2 text-sm font-medium text-pifc-primary bg-pifc-primary/5 border border-pifc-primary/20 rounded-full hover:bg-pifc-primary/10 transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat messages */}
                        {chatMessages.length > 0 && (
                            <div className="space-y-4 mb-8 animate-enter">
                                {chatMessages.map((msg, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user"
                                                    ? "bg-pifc-primary text-white"
                                                    : "bg-pifc-primary/10 text-pifc-primary"
                                                }`}
                                        >
                                            <span className="material-icons-outlined text-base">
                                                {msg.role === "user" ? "person" : "smart_toy"}
                                            </span>
                                        </div>
                                        <div
                                            className={`max-w-[80%] rounded-xl p-4 text-sm leading-relaxed ${msg.role === "user"
                                                    ? "bg-pifc-primary text-white rounded-tr-sm"
                                                    : "bg-white border border-gray-200 text-gray-700 shadow-sm rounded-tl-sm"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Integration Cards Grid */}
                        <div
                            className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-enter"
                            style={{ animationDelay: "150ms" }}
                        >
                            {/* Repository Integration Card */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-pifc-primary/30 transition-all hover:shadow-md group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-pifc-primary/10 rounded-lg">
                                        <span className="material-icons-outlined text-pifc-primary text-2xl">
                                            sync_alt
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Integração de Repositório</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                                    Conecte o PIFC diretamente ao controle de versão para auditoria automática de
                                    código e deploys.
                                </p>

                                {/* Repo icons */}
                                <div className="flex gap-3">
                                    {[
                                        { name: "GITHUB", icon: "code", color: "text-gray-800" },
                                        { name: "GITLAB", icon: "merge_type", color: "text-orange-500" },
                                        { name: "JIRA", icon: "assignment", color: "text-blue-600" },
                                    ].map((repo) => (
                                        <button
                                            key={repo.name}
                                            onClick={() =>
                                                setSelectedRepo(selectedRepo === repo.name ? null : repo.name)
                                            }
                                            className={`flex flex-col items-center gap-1.5 px-5 py-3 rounded-lg border transition-all ${selectedRepo === repo.name
                                                    ? "border-pifc-primary bg-pifc-primary/5 shadow-sm"
                                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <span
                                                className={`material-icons-outlined text-2xl ${selectedRepo === repo.name ? "text-pifc-primary" : repo.color
                                                    }`}
                                            >
                                                {repo.icon}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                {repo.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* File Upload Card */}
                            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:border-pifc-primary/30 transition-all hover:shadow-md">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-pifc-primary/10 rounded-lg">
                                        <span className="material-icons-outlined text-pifc-primary text-2xl">
                                            cloud_upload
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Importação de Arquivos</h3>
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
                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragOver
                                            ? "border-pifc-primary bg-pifc-primary/5"
                                            : "border-gray-300 hover:border-pifc-primary/50 hover:bg-gray-50"
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".zip,.pdf,.png,.txt,.md"
                                        className="hidden"
                                        onChange={handleFileSelect}
                                    />
                                    <span className="material-icons-outlined text-3xl text-gray-400 mb-2 block">
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
                                    <div className="mt-3 space-y-2">
                                        {uploadedFiles.map((file, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="material-icons-outlined text-pifc-primary text-base">
                                                        description
                                                    </span>
                                                    <span className="text-gray-700 font-medium truncate max-w-[180px]">
                                                        {file.name}
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))
                                                    }
                                                    className="text-gray-400 hover:text-ds-error transition-colors"
                                                >
                                                    <span className="material-icons-outlined text-base">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Security badge */}
                                <div className="flex items-center gap-2 mt-4 justify-center">
                                    <span className="w-2 h-2 rounded-full bg-ds-success"></span>
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        Segurança de Dados Garantida
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Input - Fixed at bottom */}
                    <div className="border-t border-gray-200 bg-white p-4 lg:px-10">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-end gap-3">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Escreva aqui sua dúvida sobre o contrato ou anexe dados acima..."
                                        rows={1}
                                        className="w-full resize-none border border-gray-300 rounded-xl px-4 py-3 pr-20 text-sm text-gray-800 bg-gray-50 focus:ring-2 focus:ring-pifc-primary focus:border-pifc-primary placeholder:text-gray-400 transition-colors"
                                        style={{ minHeight: "48px", maxHeight: "120px" }}
                                    />
                                    <div className="absolute right-3 bottom-3 flex items-center gap-1">
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-1 text-gray-400 hover:text-pifc-primary transition-colors"
                                            title="Anexar arquivo"
                                        >
                                            <span className="material-icons-outlined text-xl">attach_file</span>
                                        </button>
                                        <button
                                            className="p-1 text-gray-400 hover:text-pifc-primary transition-colors"
                                            title="Gravar áudio"
                                        >
                                            <span className="material-icons-outlined text-xl">mic</span>
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim()}
                                    className="p-3 bg-pifc-primary hover:bg-pifc-primary-dark text-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                >
                                    <span className="material-icons-outlined text-xl">send</span>
                                </button>
                            </div>
                            <p className="text-center text-xs text-gray-400 mt-2">
                                <span className="text-pifc-primary">O PIFC pode cometer erros.</span> Verifique
                                informações importantes com o setor jurídico.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
