import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { useChatSession } from "@/hooks/use-chat";
import { cn } from "@/lib/utils";

export default function RelatorioPDF() {
    const [, params] = useRoute("/chat/:sessionId/report");
    const sessionId = parseInt(params?.sessionId || "0");
    const { data: session, isLoading } = useChatSession(sessionId);
    const [isPrinting, setIsPrinting] = useState(false);

    useEffect(() => {
        if (session && !isLoading) {
            document.title = `Relatorio_PIFC_Sessao_${sessionId}.pdf`;
        }
    }, [session, isLoading, sessionId]);

    const handlePrint = () => {
        setIsPrinting(true);
        setTimeout(() => {
            window.print();
            setIsPrinting(false);
        }, 100);
    };

    if (isLoading || !session) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-pifc-primary/20 border-t-pifc-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm">Carregando relatório...</p>
                </div>
            </div>
        );
    }

    const report = session.scoreReport as any;

    if (!report) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">Relatório não disponível para esta sessão.</p>
            </div>
        );
    }

    const scoreColor = session.score! >= 80 ? "text-emerald-600" : session.score! >= 60 ? "text-amber-600" : "text-red-600";
    const statusColor = session.score! >= 80 ? "bg-emerald-100 text-emerald-800" : session.score! >= 60 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";

    return (
        <div className="min-h-screen bg-gray-50 print:bg-white p-8 print:p-0 font-sans">
            {/* Print Controls - Hidden when printing */}
            <div className="max-w-[210mm] mx-auto mb-8 print:hidden flex justify-between items-center">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <span className="material-icons-outlined">arrow_back</span>
                    Voltar ao Chat
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-pifc-primary text-white rounded-lg hover:bg-pifc-primary-dark transition-colors shadow-sm"
                >
                    <span className="material-icons-outlined">print</span>
                    Imprimir / Salvar PDF
                </button>
            </div>

            {/* A4 Page Container */}
            <div className="max-w-[210mm] mx-auto bg-white shadow-lg print:shadow-none p-[20mm] min-h-[297mm] relative">

                {/* Header Institucional */}
                <header className="border-b-2 border-gray-100 pb-6 mb-8 flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                            GO
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 uppercase tracking-tight">Estado de Goiás</h1>
                            <p className="text-xs text-gray-500 uppercase tracking-wider">Plataforma Inteligente de Fiscalização de Contratos (PIFC)</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Relatório de Conformidade Técnica</p>
                        <p className="text-xs text-gray-500 mt-1">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {session.id}-{new Date().getTime().toString().slice(-6)}</p>
                    </div>
                </header>

                {/* Info do Contrato / Sessão */}
                <section className="mb-8 grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-xl print:bg-transparent print:p-0 print:border print:border-gray-100">
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Objeto da Análise</h3>
                        <p className="text-base font-semibold text-gray-900">{session.title}</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Tipo: {session.sessionType === "repo" ? "Repositório Git" : session.sessionType === "upload" ? "Documentos" : "Chat Interativo"}
                        </p>
                        {session.repoUrl && (
                            <p className="text-xs text-blue-600 mt-1 font-mono truncate">{session.repoUrl}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Score Final</h3>
                        <div className="flex items-center justify-end gap-3">
                            <span className={cn("text-4xl font-bold", scoreColor)}>{session.score}%</span>
                            <span className={cn("px-2 py-1 rounded text-xs font-bold uppercase", statusColor)}>
                                {session.score! >= 80 ? "Conforme" : session.score! >= 60 ? "Parcial" : "Crítico"}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Baseado em métricas SISP</p>
                    </div>
                </section>

                {/* Resumo Executivo */}
                <section className="mb-8">
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-l-4 border-pifc-primary pl-3 mb-4">
                        Resumo Executivo
                    </h2>
                    <p className="text-sm text-gray-700 leading-relaxed text-justify">
                        {report.summary}
                    </p>
                </section>

                {/* Métricas Principais */}
                {report.total_contracted_points && (
                    <section className="mb-8">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-l-4 border-pifc-primary pl-3 mb-4">
                            Métricas de Pontos de Função
                        </h2>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 border border-gray-100 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-900">{report.total_contracted_points}</p>
                                <p className="text-xs text-gray-500 uppercase mt-1">PF Contratados</p>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-lg text-center">
                                <p className={cn("text-2xl font-bold", scoreColor)}>{report.total_delivered_points}</p>
                                <p className="text-xs text-gray-500 uppercase mt-1">PF Entregues</p>
                            </div>
                            <div className="p-4 border border-gray-100 rounded-lg text-center">
                                <p className="text-2xl font-bold text-gray-900">
                                    {Math.round((report.total_delivered_points / report.total_contracted_points) * 100)}%
                                </p>
                                <p className="text-xs text-gray-500 uppercase mt-1">Aderência</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Discrepâncias e Recomendações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 break-inside-avoid">
                    {report.discrepancies && (
                        <section>
                            <h2 className="text-sm font-bold text-amber-600 uppercase tracking-wider border-l-4 border-amber-500 pl-3 mb-4">
                                Discrepâncias Identificadas
                            </h2>
                            <ul className="space-y-2">
                                {report.discrepancies.map((d: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="material-icons-outlined text-amber-500 text-sm mt-0.5">warning</span>
                                        <span>{d}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {report.recommendations && (
                        <section>
                            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-wider border-l-4 border-blue-500 pl-3 mb-4">
                                Recomendações
                            </h2>
                            <ul className="space-y-2">
                                {report.recommendations.map((r: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                        <span className="material-icons-outlined text-blue-500 text-sm mt-0.5">lightbulb</span>
                                        <span>{r}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                {/* Análise Detalhada (Tabela) */}
                {report.detailed_analysis && (
                    <section className="mb-8 break-inside-avoid">
                        <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-l-4 border-pifc-primary pl-3 mb-4">
                            Detalhamento Técnico
                        </h2>
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="py-2 font-semibold text-gray-600 w-1/3">Funcionalidade / Requisito</th>
                                    <th className="py-2 font-semibold text-gray-600 text-center w-24">Pontos</th>
                                    <th className="py-2 font-semibold text-gray-600 text-center w-24">Status</th>
                                    <th className="py-2 font-semibold text-gray-600">Observação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {report.detailed_analysis.map((item: any, i: number) => (
                                    <tr key={i} className="group">
                                        <td className="py-3 pr-4 font-medium text-gray-800">{item.feature}</td>
                                        <td className="py-3 text-center text-gray-600 font-mono">{item.points}</td>
                                        <td className="py-3 text-center">
                                            <span className={cn(
                                                "inline-block w-2.5 h-2.5 rounded-full",
                                                item.status === "conforme" ? "bg-emerald-500" :
                                                    item.status === "parcial" ? "bg-amber-500" : "bg-red-500"
                                            )}></span>
                                        </td>
                                        <td className="py-3 text-gray-600 text-xs">{item.observation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                )}

                {/* Footer */}
                <footer className="mt-auto pt-8 border-t border-gray-100 flex justify-between items-end text-xs text-gray-400 print:fixed print:bottom-8 print:left-20 print:right-20">
                    <div>
                        <p>PIFC - Plataforma Inteligente de Fiscalização de Contratos</p>
                        <p>Documento gerado automaticamente por IA. Sujeito a revisão humana.</p>
                    </div>
                    <div className="text-right">
                        <p>Página 1 de 1</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
