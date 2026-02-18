import { useState } from "react";
import { Link } from "wouter";

export function GovHeader() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            {/* Barra Brasil (Gov Standard) */}
            <div className="bg-gov-blue text-white py-1 px-4 flex justify-between items-center text-xs font-semibold z-50 relative">
                <div className="flex items-center space-x-4">
                    <span className="uppercase tracking-wide">Brasil</span>
                    <a className="hover:underline opacity-80 hover:opacity-100 hidden sm:inline-block" href="#">
                        Acesso à informação
                    </a>
                    <a className="hover:underline opacity-80 hover:opacity-100 hidden sm:inline-block" href="#">
                        Participe
                    </a>
                    <a className="hover:underline opacity-80 hover:opacity-100 hidden sm:inline-block" href="#">
                        Legislação
                    </a>
                    <a className="hover:underline opacity-80 hover:opacity-100 hidden sm:inline-block" href="#">
                        Órgãos do Governo
                    </a>
                </div>
            </div>

            {/* Main Header */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40 shadow-sm">
                <div className="flex items-center space-x-3">
                    <Link href="/">
                        <a className="cursor-pointer transition-opacity hover:opacity-80">
                            <img
                                src="/image.png"
                                alt="PIFC - Plataforma de Inteligência de Fiscalização Contratual"
                                className="h-10 w-auto object-contain"
                            />
                        </a>
                    </Link>
                    <div className="h-8 w-px bg-gray-300 mx-4 hidden md:block"></div>
                    <span className="text-sm font-medium text-gray-600 hidden md:block">
                        Ministério da Gestão e Inovação
                    </span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Mobile sidebar toggle */}
                    <button
                        className="lg:hidden p-2 text-gray-500 hover:text-pifc-primary transition-colors rounded-full hover:bg-pifc-primary/10"
                        onClick={() => {
                            const sidebar = document.getElementById("pifc-sidebar");
                            if (sidebar) sidebar.classList.toggle("!flex");
                        }}
                    >
                        <span className="material-icons-outlined">menu</span>
                    </button>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-500 hover:text-pifc-primary transition-colors rounded-full hover:bg-pifc-primary/10">
                        <span className="material-icons-outlined">notifications</span>
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                    </button>

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-700">João Silva</p>
                            <p className="text-xs text-gray-500">Fiscal de Contrato</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-pifc-primary/20 flex items-center justify-center text-pifc-primary font-bold border-2 border-white shadow-sm">
                            JS
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
