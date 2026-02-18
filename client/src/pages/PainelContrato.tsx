import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Link } from "wouter";

// ────── Health Score Ring ──────
function HealthScoreRing({ score }: { score: number }) {
    const circumference = 2 * Math.PI * 45; // r=45
    const offset = circumference - (score / 100) * circumference;
    const label = score >= 80 ? "Saudável" : score >= 60 ? "Atenção" : "Crítico";
    const color = score >= 80 ? "text-ds-success" : score >= 60 ? "text-ds-warning" : "text-ds-error";

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-48 h-48 mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                        cx="50" cy="50" r="45"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        className="text-gray-100"
                    />
                    <circle
                        cx="50" cy="50" r="45"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className={color}
                    />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">{score}%</span>
                    <span className={`text-xs font-semibold uppercase tracking-wider mt-1 ${color}`}>
                        {label}
                    </span>
                </div>
            </div>
            <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-1">Score Geral de Execução</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Calculado com base em entregas, qualidade técnica e cumprimento de prazos (SLA).
                </p>
            </div>
        </div>
    );
}

// ────── Metric Card ──────
function MetricCard({
    icon,
    title,
    value,
    subtitle,
    progress,
    progressColor,
    badge,
    badgeColor,
    footnote,
}: {
    icon: string;
    title: string;
    value: string;
    subtitle?: string;
    progress?: number;
    progressColor?: string;
    badge?: string;
    badgeColor?: string;
    footnote?: string;
}) {
    return (
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-gray-400">{icon}</span>
                    <span className="text-sm font-semibold text-gray-700">{title}</span>
                </div>
                {badge && (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badgeColor}`}>
                        {badge}
                    </span>
                )}
            </div>
            <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {subtitle && <span className="text-xs text-gray-500">{subtitle}</span>}
            </div>
            {progress !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                        className={`h-1.5 rounded-full transition-all duration-1000 ${progressColor || "bg-pifc-primary"}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
            {footnote && <p className="text-[10px] text-gray-400 mt-2">{footnote}</p>}
        </div>
    );
}

// ────── Quick Access Card ──────
function QuickAccessCard({
    icon,
    iconBg,
    iconColor,
    title,
    description,
    badgeText,
    badgeStyle,
}: {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    badgeText: string;
    badgeStyle: string;
}) {
    return (
        <a
            href="#"
            className="group relative bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-pifc-primary/50 transition-all duration-200 cursor-pointer"
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-icons text-pifc-primary text-xl">arrow_forward</span>
            </div>
            <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className={`material-symbols-outlined ${iconColor} text-2xl`}>{icon}</span>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">{description}</p>
            <div className="flex items-center gap-2 mt-auto">
                <span className={`text-[10px] font-medium px-2 py-1 rounded ${badgeStyle}`}>
                    {badgeText}
                </span>
            </div>
        </a>
    );
}

// ────── AI Chat Bubble ──────
function AIChatBubble() {
    const [open, setOpen] = useState(false);
    const [msg, setMsg] = useState("");

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            {/* Chat Window */}
            {open && (
                <div className="bg-white w-80 rounded-xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col mb-2 animate-enter">
                    <div className="bg-pifc-primary p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined">smart_toy</span>
                            <span className="font-medium">Assistente PIFC</span>
                        </div>
                        <button onClick={() => setOpen(false)} className="hover:bg-pifc-primary-dark rounded p-1">
                            <span className="material-icons text-sm">close</span>
                        </button>
                    </div>
                    <div className="h-64 p-4 bg-gray-50 overflow-y-auto text-sm space-y-3 custom-scrollbar">
                        <div className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-pifc-primary/20 flex-shrink-0 flex items-center justify-center text-pifc-primary text-xs font-bold">
                                IA
                            </div>
                            <div className="bg-white p-2.5 rounded-lg rounded-tl-none shadow-sm border border-gray-200 text-gray-700 max-w-[85%]">
                                Olá! Analisei o contrato e identifiquei 2 riscos novos na entrega de hoje. Deseja ver os detalhes?
                            </div>
                        </div>
                    </div>
                    <div className="p-3 border-t border-gray-200 bg-white">
                        <div className="relative">
                            <input
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                className="w-full text-sm rounded-md border border-gray-300 pr-10 py-2 px-3 focus:ring-pifc-primary focus:border-pifc-primary bg-gray-50"
                                placeholder="Digite sua pergunta..."
                                type="text"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-pifc-primary hover:text-pifc-primary-dark">
                                <span className="material-icons text-sm">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Float Button */}
            <button
                onClick={() => setOpen(!open)}
                className="group flex items-center justify-center w-14 h-14 bg-pifc-primary hover:bg-pifc-primary-dark text-white rounded-full shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-pifc-primary/30 relative"
            >
                <span className="material-symbols-outlined text-3xl">
                    {open ? "close" : "chat"}
                </span>
                {!open && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-ds-error border-2 border-white text-[9px] font-bold text-white items-center justify-center">
                            1
                        </span>
                    </span>
                )}
                <span className="absolute right-full mr-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    Falar com a IA
                </span>
            </button>
        </div>
    );
}

// ────── Activity data ──────
const activities = [
    {
        icon: "upload_file",
        iconBg: "bg-blue-50",
        iconColor: "text-pifc-primary",
        title: "Upload de Nota Técnica 04/23",
        responsible: "Maria Souza (Fiscal)",
        status: "Concluído",
        statusStyle: "bg-green-100 text-green-800",
        date: "Hoje, 14:30",
    },
    {
        icon: "warning_amber",
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
        title: "Alerta de Atraso: Entrega Sprint 15",
        responsible: "Sistema (Automático)",
        status: "Pendente",
        statusStyle: "bg-amber-100 text-amber-800",
        date: "Ontem, 09:15",
    },
    {
        icon: "verified",
        iconBg: "bg-green-50",
        iconColor: "text-ds-success",
        title: "Aprovação de Medição #12",
        responsible: "João Silva (Gestor)",
        status: "Concluído",
        statusStyle: "bg-green-100 text-green-800",
        date: "12/10, 16:45",
    },
    {
        icon: "code",
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600",
        title: "Análise de Código - Sprint 14",
        responsible: "PIFC (Automático)",
        status: "Em análise",
        statusStyle: "bg-blue-100 text-blue-800",
        date: "11/10, 10:00",
    },
];

// ────── Main Page Component ──────
export default function PainelContrato() {
    return (
        <DashboardLayout>
            <AIChatBubble />

            {/* Breadcrumb + Title */}
            <div className="md:flex md:items-center md:justify-between mb-6 animate-enter">
                <div className="min-w-0 flex-1">
                    <nav className="flex mb-2">
                        <ol className="flex items-center space-x-2">
                            <li>
                                <Link href="/">
                                    <a className="text-gray-400 hover:text-gray-500">
                                        <span className="material-icons text-sm">home</span>
                                    </a>
                                </Link>
                            </li>
                            <li className="flex items-center">
                                <span className="material-icons text-gray-300 text-sm">chevron_right</span>
                                <span className="ml-2 text-sm font-medium text-gray-500">Contratos Ativos</span>
                            </li>
                            <li className="flex items-center">
                                <span className="material-icons text-gray-300 text-sm">chevron_right</span>
                                <span className="ml-2 text-sm font-medium text-gray-900">
                                    Contrato 01/2023 - Fábrica de Software
                                </span>
                            </li>
                        </ol>
                    </nav>
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Painel de Controle
                    </h2>
                </div>
                <div className="mt-4 flex flex-wrap gap-3 md:ml-4 md:mt-0">
                    <Link href="/nova-fiscalizacao">
                        <a className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-pifc-primary shadow-sm ring-1 ring-inset ring-pifc-primary hover:bg-blue-50 transition-colors">
                            <span className="material-icons text-sm mr-2">add_chart</span>
                            Nova Análise
                        </a>
                    </Link>
                    <span className="inline-flex items-center rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300">
                        <span className="w-2 h-2 rounded-full bg-ds-success mr-2" />
                        Vigente
                    </span>
                    <button className="inline-flex items-center rounded-lg bg-pifc-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-pifc-primary-dark transition-colors">
                        <span className="material-icons text-sm mr-2">edit_document</span>
                        Novo Registro de Fiscalização
                    </button>
                </div>
            </div>

            {/* ═══════════════ Contract Health Panel ═══════════════ */}
            <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 animate-enter"
                style={{ animationDelay: "50ms" }}
            >
                {/* Section header */}
                <div className="border-b border-gray-200 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-pifc-primary">health_metrics</span>
                            Saúde do Contrato
                        </h3>
                        <p className="text-sm text-gray-500">
                            Indicadores de conformidade e alertas de execução em tempo real.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span className="material-icons text-xs">update</span>
                        Atualizado há 25 minutos
                    </div>
                </div>

                {/* Health Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Score Ring */}
                    <div className="flex flex-col items-center justify-center border-r-0 lg:border-r border-gray-200">
                        <HealthScoreRing score={90} />
                    </div>

                    {/* Metric Cards (2x2) */}
                    <div className="col-span-1 lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <MetricCard
                            icon="timer"
                            title="Cumprimento de SLA"
                            value="99.2%"
                            badge="Meta: 98%"
                            badgeColor="bg-ds-success-light text-ds-success"
                            progress={99.2}
                            progressColor="bg-ds-success"
                        />
                        <MetricCard
                            icon="bug_report"
                            title="Qualidade de Código"
                            value="B+"
                            subtitle="SonarQube Rating"
                            badge="Atenção"
                            badgeColor="bg-ds-alert-light text-yellow-700"
                            progress={75}
                            progressColor="bg-ds-warning"
                        />
                        <MetricCard
                            icon="attach_money"
                            title="Execução Financeira"
                            value="R$ 1.4M"
                            subtitle="de R$ 5.2M"
                            progress={27}
                            progressColor="bg-pifc-primary"
                            footnote="Dentro do cronograma financeiro."
                        />

                        {/* Critical Alerts Card */}
                        <div className="bg-ds-error-light/30 rounded-lg p-5 border border-ds-error-light">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-ds-error">warning</span>
                                    <span className="text-sm font-semibold text-ds-error">Alertas Críticos</span>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-white px-2 py-0.5 text-xs font-bold text-ds-error border border-ds-error/20">
                                    2 Novos
                                </span>
                            </div>
                            <div className="space-y-2 mt-3">
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-ds-error mt-1.5 flex-shrink-0" />
                                    <p className="text-xs text-gray-700 font-medium leading-tight">
                                        Vulnerabilidade crítica detectada na API Gateway.
                                    </p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-ds-error mt-1.5 flex-shrink-0" />
                                    <p className="text-xs text-gray-700 font-medium leading-tight">
                                        Atraso na entrega da Sprint 14 superior a 3 dias.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ Quick Access ═══════════════ */}
            <h3
                className="text-lg font-bold text-gray-900 mb-4 px-1 animate-enter"
                style={{ animationDelay: "100ms" }}
            >
                Acesso Rápido
            </h3>
            <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-enter"
                style={{ animationDelay: "150ms" }}
            >
                <QuickAccessCard
                    icon="folder_open"
                    iconBg="bg-blue-50"
                    iconColor="text-pifc-primary"
                    title="Documentação"
                    description="Acesse editais, contratos, aditivos e especificações técnicas."
                    badgeText="12 Arquivos"
                    badgeStyle="bg-gray-100 text-gray-600"
                />
                <QuickAccessCard
                    icon="code"
                    iconBg="bg-indigo-50"
                    iconColor="text-indigo-600"
                    title="Código Fonte"
                    description="Repositórios Git, histórico de commits e análise estática."
                    badgeText="95% Score"
                    badgeStyle="bg-green-50 text-green-700 border border-green-100"
                />
                <QuickAccessCard
                    icon="payments"
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                    title="Financeiro"
                    description="Pagamentos, notas fiscais, medições e saldo contratual."
                    badgeText="Próx: 15/Out"
                    badgeStyle="bg-gray-100 text-gray-600"
                />
                <QuickAccessCard
                    icon="gavel"
                    iconBg="bg-amber-50"
                    iconColor="text-amber-600"
                    title="Riscos & Sanções"
                    description="Mapa de riscos, notificações e processos administrativos."
                    badgeText="2 Alertas"
                    badgeStyle="bg-ds-alert-light text-amber-700 border border-amber-100"
                />
            </div>

            {/* ═══════════════ Recent Activity Table ═══════════════ */}
            <div
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-enter"
                style={{ animationDelay: "200ms" }}
            >
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Atividades Recentes</h3>
                    <button className="text-sm text-pifc-primary hover:text-pifc-primary-dark font-medium">
                        Ver todas
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="uppercase tracking-wider border-b border-gray-200 text-gray-500">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Evento</th>
                                <th className="px-4 py-3 font-semibold">Responsável</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {activities.map((act, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded ${act.iconBg} flex items-center justify-center ${act.iconColor}`}>
                                                <span className="material-icons text-sm">{act.icon}</span>
                                            </div>
                                            <span className="font-medium">{act.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{act.responsible}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${act.statusStyle}`}>
                                            {act.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-gray-500">{act.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}
