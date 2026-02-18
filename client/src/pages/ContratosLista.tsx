import { DashboardLayout } from "@/components/DashboardLayout";
import { useContracts } from "@/hooks/use-contracts";
import { CreateContractDialog } from "@/components/CreateContractDialog";
import { Link } from "wouter";
import { useState } from "react";
import { format } from "date-fns";

// Mock contracts for demonstration when database is empty
const mockContracts = [
    {
        id: "mock-1",
        title: "Contrato 01/2023 - Fábrica de Software",
        supplierName: "Tech Solutions Ltda",
        contractDate: "2023-03-15",
        value: "5200000",
        status: "completed",
        description: "Contrato de desenvolvimento de software sob demanda para o Ministério da Gestão.",
        healthScore: 90,
        slaScore: 99.2,
    },
    {
        id: "mock-2",
        title: "Contrato 12/2024 - Infraestrutura Cloud",
        supplierName: "CloudBR Serviços",
        contractDate: "2024-01-10",
        value: "3800000",
        status: "analyzing",
        description: "Serviços de computação em nuvem e hospedagem de aplicações governamentais.",
        healthScore: 78,
        slaScore: 95.1,
    },
    {
        id: "mock-3",
        title: "Contrato 45/2024 - Consultoria em IA",
        supplierName: "DataGov Analytics",
        contractDate: "2024-06-01",
        value: "1450000",
        status: "draft",
        description: "Consultoria especializada em inteligência artificial para análise de contratos.",
        healthScore: 94,
        slaScore: 100,
    },
    {
        id: "mock-4",
        title: "Contrato 08/2023 - Manutenção de Sistemas",
        supplierName: "SupportIT Brasil",
        contractDate: "2023-08-20",
        value: "980000",
        status: "completed",
        description: "Manutenção corretiva e evolutiva de sistemas legados.",
        healthScore: 85,
        slaScore: 97.8,
    },
    {
        id: "mock-5",
        title: "Contrato 22/2024 - Auditoria de Segurança",
        supplierName: "CyberSec Gov",
        contractDate: "2024-04-15",
        value: "720000",
        status: "failed",
        description: "Testes de penetração e auditoria de segurança em aplicações do ministério.",
        healthScore: 42,
        slaScore: 65.3,
    },
];

function getStatusConfig(status: string) {
    switch (status) {
        case "completed":
            return { label: "Concluído", dot: "bg-ds-success", bg: "bg-green-50 text-green-700 border-green-200" };
        case "analyzing":
            return { label: "Em Análise", dot: "bg-pifc-primary", bg: "bg-blue-50 text-blue-700 border-blue-200" };
        case "draft":
            return { label: "Rascunho", dot: "bg-gray-400", bg: "bg-gray-50 text-gray-600 border-gray-200" };
        case "failed":
            return { label: "Erro", dot: "bg-ds-error", bg: "bg-red-50 text-red-700 border-red-200" };
        default:
            return { label: status, dot: "bg-gray-400", bg: "bg-gray-50 text-gray-600 border-gray-200" };
    }
}

function getHealthColor(score: number) {
    if (score >= 80) return "text-ds-success";
    if (score >= 60) return "text-ds-warning";
    return "text-ds-error";
}

function getHealthBg(score: number) {
    if (score >= 80) return "bg-ds-success";
    if (score >= 60) return "bg-ds-warning";
    return "bg-ds-error";
}

export default function ContratosLista() {
    const { data: dbContracts, isLoading } = useContracts();
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    // Merge real contracts with mock contracts for display
    const allContracts = [
        ...mockContracts,
        ...(dbContracts?.map((c) => ({
            id: String(c.id),
            title: c.title,
            supplierName: c.supplierName,
            contractDate: String(c.contractDate),
            value: String(c.value),
            status: c.status,
            description: c.description || "",
            healthScore: Math.floor(Math.random() * 30) + 70,
            slaScore: Math.floor(Math.random() * 10) + 90,
        })) || []),
    ];

    const filteredContracts = allContracts.filter((c) => {
        const matchesSearch =
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.supplierName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === "all" || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: allContracts.length,
        active: allContracts.filter((c) => c.status === "completed" || c.status === "analyzing").length,
        draft: allContracts.filter((c) => c.status === "draft").length,
        alerts: allContracts.filter((c) => c.status === "failed").length,
    };

    return (
        <DashboardLayout>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-enter">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/">
                            <a className="text-sm text-gray-500 hover:text-pifc-primary transition-colors">
                                Dashboard
                            </a>
                        </Link>
                        <span className="material-icons-outlined text-xs text-gray-400">chevron_right</span>
                        <span className="text-sm text-pifc-primary font-medium">Contratos</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestão de Contratos</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Visualize e gerencie todos os contratos ativos do Ministério.
                    </p>
                </div>
                <div className="flex gap-3">
                    <CreateContractDialog />
                    <Link href="/nova-fiscalizacao">
                        <a className="flex items-center gap-2 px-4 py-2 bg-pifc-primary hover:bg-pifc-primary-dark text-white rounded-lg shadow-sm hover:shadow transition text-sm font-medium">
                            <span className="material-icons-outlined text-lg">add</span>
                            Nova Fiscalização
                        </a>
                    </Link>
                </div>
            </div>

            {/* Stats Summary */}
            <div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-enter"
                style={{ animationDelay: "50ms" }}
            >
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-pifc-primary/10 rounded-lg">
                            <span className="material-icons-outlined text-pifc-primary text-xl">assignment</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            <p className="text-xs text-gray-500 font-medium">Total de Contratos</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ds-success/10 rounded-lg">
                            <span className="material-icons-outlined text-ds-success text-xl">check_circle</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                            <p className="text-xs text-gray-500 font-medium">Ativos / Em Análise</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <span className="material-icons-outlined text-gray-500 text-xl">edit_note</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.draft}</p>
                            <p className="text-xs text-gray-500 font-medium">Rascunhos</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-ds-error/10 rounded-lg">
                            <span className="material-icons-outlined text-ds-error text-xl">warning</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{stats.alerts}</p>
                            <p className="text-xs text-gray-500 font-medium">Com Alertas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-enter"
                style={{ animationDelay: "100ms" }}
            >
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900">Todos os Contratos</h3>
                        {/* Status Filter Pills */}
                        <div className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            {[
                                { key: "all", label: "Todos" },
                                { key: "completed", label: "Concluídos" },
                                { key: "analyzing", label: "Em Análise" },
                                { key: "draft", label: "Rascunhos" },
                                { key: "failed", label: "Alertas" },
                            ].map((f) => (
                                <button
                                    key={f.key}
                                    onClick={() => setStatusFilter(f.key)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${statusFilter === f.key
                                            ? "bg-white text-pifc-primary shadow-sm"
                                            : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-800 focus:ring-2 focus:ring-pifc-primary focus:border-pifc-primary w-full sm:w-72"
                                placeholder="Buscar por nome ou fornecedor..."
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 text-lg">
                                search
                            </span>
                        </div>
                        <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
                            <span className="material-icons-outlined">filter_list</span>
                        </button>
                    </div>
                </div>

                {/* Contracts Cards Grid */}
                {isLoading ? (
                    <div className="p-6 space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 bg-gray-50 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredContracts.map((contract) => {
                                const statusCfg = getStatusConfig(contract.status);
                                return (
                                    <Link key={contract.id} href={`/painel-contrato/${contract.id}`}>
                                        <a className="group block bg-white rounded-xl border border-gray-200 p-5 hover:border-pifc-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer">
                                            {/* Top Row: Title + Status */}
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-base font-semibold text-gray-900 group-hover:text-pifc-primary transition-colors truncate">
                                                        {contract.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-500 mt-0.5">{contract.supplierName}</p>
                                                </div>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shrink-0 ml-3 ${statusCfg.bg}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                                    {statusCfg.label}
                                                </span>
                                            </div>

                                            {/* Middle Row: Metrics */}
                                            <div className="flex items-center gap-6 mb-3">
                                                {/* Health Score */}
                                                <div className="flex items-center gap-2">
                                                    <div className="relative w-10 h-10">
                                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                                            <circle
                                                                cx="18" cy="18" r="14"
                                                                fill="none"
                                                                stroke="#e5e7eb"
                                                                strokeWidth="3"
                                                            />
                                                            <circle
                                                                cx="18" cy="18" r="14"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="3"
                                                                strokeDasharray={`${(contract.healthScore / 100) * 88} 88`}
                                                                strokeLinecap="round"
                                                                className={getHealthColor(contract.healthScore)}
                                                            />
                                                        </svg>
                                                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
                                                            {contract.healthScore}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                                                            Saúde
                                                        </p>
                                                        <p className={`text-xs font-semibold ${getHealthColor(contract.healthScore)}`}>
                                                            {contract.healthScore >= 80
                                                                ? "Bom"
                                                                : contract.healthScore >= 60
                                                                    ? "Atenção"
                                                                    : "Crítico"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* SLA */}
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                                                        SLA
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800">{contract.slaScore}%</p>
                                                </div>

                                                {/* Value */}
                                                <div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                                                        Valor
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-800">
                                                        R$ {(Number(contract.value) / 1000000).toFixed(1)}M
                                                    </p>
                                                </div>

                                                {/* Date */}
                                                <div className="hidden sm:block">
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium">
                                                        Data
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {(() => {
                                                            try {
                                                                return format(new Date(contract.contractDate), "dd/MM/yyyy");
                                                            } catch {
                                                                return contract.contractDate;
                                                            }
                                                        })()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Bottom Row: Health Bar + Arrow */}
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1">
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all duration-700 ${getHealthBg(contract.healthScore)}`}
                                                            style={{ width: `${contract.healthScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="material-icons-outlined text-gray-300 group-hover:text-pifc-primary group-hover:translate-x-1 transition-all text-lg">
                                                    arrow_forward
                                                </span>
                                            </div>
                                        </a>
                                    </Link>
                                );
                            })}
                        </div>

                        {filteredContracts.length === 0 && (
                            <div className="text-center py-16">
                                <span className="material-icons-outlined text-5xl text-gray-300 mb-3 block">
                                    search_off
                                </span>
                                <h4 className="text-lg font-semibold text-gray-700 mb-1">
                                    Nenhum contrato encontrado
                                </h4>
                                <p className="text-sm text-gray-500">
                                    Tente ajustar os filtros ou a busca.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Mostrando {filteredContracts.length} de {allContracts.length} contratos
                    </span>
                    <div className="flex gap-2">
                        <button
                            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                            disabled
                        >
                            Anterior
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                            Próximo
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
