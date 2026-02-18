import { DashboardLayout } from "@/components/DashboardLayout";
import { useContracts } from "@/hooks/use-contracts";
import { useState } from "react";

// Mock UST data for the dashboard
const mockUSTs = [
  {
    id: "UST-2024-045",
    description: "Refatoração Módulo de Pagamentos",
    sprint: "Sprint 12 - Backend",
    date: "22 Out 2024",
    responsible: "Empresa Tech Solutions",
    score: 98,
    status: "conforme" as const,
  },
  {
    id: "UST-2024-046",
    description: "Integração API Gov.br",
    sprint: "Sprint 12 - Integração",
    date: "23 Out 2024",
    responsible: "Empresa Tech Solutions",
    score: 75,
    status: "atencao" as const,
  },
  {
    id: "UST-2024-047",
    description: "Atualização de Segurança - Core",
    sprint: "Hotfix - Segurança",
    date: "24 Out 2024",
    responsible: "Empresa Tech Solutions",
    score: 42,
    status: "erro" as const,
  },
  {
    id: "UST-2024-048",
    description: "Documentação Técnica V2",
    sprint: "Sprint 13 - Documentação",
    date: "25 Out 2024",
    responsible: "Empresa Tech Solutions",
    score: 100,
    status: "conforme" as const,
  },
];

function ScoreBadge({ score }: { score: number }) {
  let classes = "";
  if (score >= 80) classes = "bg-green-100 text-green-800";
  else if (score >= 60) classes = "bg-yellow-100 text-yellow-800";
  else classes = "bg-red-100 text-red-800";

  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${classes}`}>
      {score}
    </span>
  );
}

function StatusBadgePIFC({ status }: { status: "conforme" | "atencao" | "erro" }) {
  const config = {
    conforme: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-700",
      dot: "bg-green-600",
      label: "Conforme",
    },
    atencao: {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
      label: "Atenção",
    },
    erro: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      dot: "bg-red-600",
      label: "Erro Crítico",
    },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text} border`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`}></span>
      {c.label}
    </span>
  );
}

export default function Dashboard() {
  const { data: contracts, isLoading } = useContracts();
  const [search, setSearch] = useState("");

  const filteredUSTs = mockUSTs.filter(
    (u) =>
      u.id.toLowerCase().includes(search.toLowerCase()) ||
      u.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-enter">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-gray-500">Contratos</span>
            <span className="material-icons-outlined text-xs text-gray-400">chevron_right</span>
            <span className="text-sm text-pifc-primary font-medium">Contrato 45/2024</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Visão Geral da Conformidade</h2>
          <p className="text-sm text-gray-600 mt-1">
            Monitoramento em tempo real do Contrato de Desenvolvimento de Software (Fábrica de Software).
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium shadow-sm">
            <span className="material-icons-outlined text-lg">file_download</span>
            Exportar PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-pifc-primary hover:bg-pifc-primary-dark text-white rounded-lg shadow-sm hover:shadow transition text-sm font-medium">
            <span className="material-icons-outlined text-lg">add</span>
            Nova Fiscalização
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Score Card (Hero KPI) */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group animate-enter" style={{ animationDelay: "50ms" }}>
          <div className="absolute right-0 top-0 w-32 h-32 bg-pifc-primary/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Score Geral</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">94/100</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg text-ds-success">
              <span className="material-icons-outlined text-2xl">verified</span>
            </div>
          </div>
          <div className="relative pt-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600 font-medium">Índice de Qualidade</span>
              <span className="text-ds-success font-bold">+2.4%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-ds-success h-2 rounded-full transition-all duration-1000"
                style={{ width: "94%" }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Baseado nas últimas 50 entregas de USTs.</p>
          </div>
        </div>

        {/* Active USTs Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-pifc-primary/30 transition-colors animate-enter" style={{ animationDelay: "100ms" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">USTs em Análise</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">12</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg text-pifc-primary">
              <span className="material-icons-outlined text-2xl">pending_actions</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="block text-xs text-gray-500 mb-1">Prazo &lt; 5 dias</span>
              <span className="font-bold text-gray-800 text-lg">8</span>
            </div>
            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
              <span className="block text-xs text-red-600 mb-1">Atrasadas</span>
              <span className="font-bold text-red-700 text-lg">1</span>
            </div>
          </div>
        </div>

        {/* Alert Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-ds-warning/30 transition-colors animate-enter" style={{ animationDelay: "150ms" }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Alertas de Conformidade</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">3</h3>
            </div>
            <div className="p-2 bg-yellow-50 rounded-lg text-ds-warning">
              <span className="material-icons-outlined text-2xl">warning_amber</span>
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-ds-warning"></span>
              <span>Documentação incompleta (UST-098)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-ds-warning"></span>
              <span>Métrica de complexidade divergente</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 rounded-full bg-ds-error"></span>
              <span>SLA excedido em UST crítica</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Deliveries Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-enter" style={{ animationDelay: "200ms" }}>
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Entregas de UST Recentes</h3>
            <p className="text-sm text-gray-500">Listagem das últimas ordens de serviço fiscalizadas.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-800 focus:ring-2 focus:ring-pifc-primary focus:border-pifc-primary w-full sm:w-64"
                placeholder="Buscar UST ou ID..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
            </div>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
              <span className="material-icons-outlined">filter_list</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                <th className="px-6 py-4 border-b border-gray-200">ID da UST</th>
                <th className="px-6 py-4 border-b border-gray-200">Descrição</th>
                <th className="px-6 py-4 border-b border-gray-200">Data Entrega</th>
                <th className="px-6 py-4 border-b border-gray-200">Responsável</th>
                <th className="px-6 py-4 border-b border-gray-200 text-center">Score</th>
                <th className="px-6 py-4 border-b border-gray-200">Status</th>
                <th className="px-6 py-4 border-b border-gray-200 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUSTs.map((ust) => (
                <tr key={ust.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-pifc-primary">{ust.id}</td>
                  <td className="px-6 py-4 text-gray-700">
                    <div className="font-medium">{ust.description}</div>
                    <div className="text-xs text-gray-500">{ust.sprint}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{ust.date}</td>
                  <td className="px-6 py-4 text-gray-600">{ust.responsible}</td>
                  <td className="px-6 py-4 text-center">
                    <ScoreBadge score={ust.score} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadgePIFC status={ust.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-pifc-primary transition-colors">
                      <span className="material-icons-outlined">visibility</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUSTs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Nenhuma UST encontrada para a busca realizada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm text-gray-500">Mostrando 1-{filteredUSTs.length} de 42 entregas</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
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
