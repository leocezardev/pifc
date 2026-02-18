import { ReactNode } from "react";
import { GovHeader } from "@/components/GovHeader";
import { Sidebar } from "@/components/Sidebar";

interface DashboardLayoutProps {
    children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="font-display bg-bg-light text-gray-800 antialiased min-h-screen flex flex-col">
            <GovHeader />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto bg-bg-light p-6 lg:p-10">
                    {children}
                    {/* Footer */}
                    <footer className="mt-8 border-t border-gray-200 pt-6 pb-10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gov-blue rounded-full flex items-center justify-center">
                                    <span className="material-icons-outlined text-white text-lg">account_balance</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    <p className="font-bold">Ministério da Gestão e da Inovação em Serviços Públicos</p>
                                    <p>Secretaria de Gestão e Inovação</p>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 text-center md:text-right">
                                <p>© 2024 PIFC - Plataforma de Inteligência.</p>
                                <p>Versão 2.1.0 (DSGOV Compliant)</p>
                            </div>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
