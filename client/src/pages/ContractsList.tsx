import { DashboardLayout } from "@/components/DashboardLayout";
import { useContracts } from "@/hooks/use-contracts";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateContractDialog } from "@/components/CreateContractDialog";
import { format } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";

export default function ContractsList() {
  const { data: contracts, isLoading } = useContracts();
  const [search, setSearch] = useState("");

  const filteredContracts =
    contracts?.filter(
      (c) =>
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.supplierName.toLowerCase().includes(search.toLowerCase())
    ) || [];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 animate-enter">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Contratos</h2>
          <p className="text-sm text-gray-600 mt-1">Visualize e gerencie todos os contratos de auditoria.</p>
        </div>
        <CreateContractDialog />
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-enter" style={{ animationDelay: "100ms" }}>
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-gray-800">Todos os Contratos</h3>
          <div className="relative">
            <input
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-800 focus:ring-2 focus:ring-pifc-primary focus:border-pifc-primary w-full sm:w-72"
              placeholder="Buscar contratos..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="material-icons-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                  <th className="px-6 py-4 border-b border-gray-200">Título do Contrato</th>
                  <th className="px-6 py-4 border-b border-gray-200">Fornecedor</th>
                  <th className="px-6 py-4 border-b border-gray-200">Data</th>
                  <th className="px-6 py-4 border-b border-gray-200">Valor</th>
                  <th className="px-6 py-4 border-b border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 font-medium">
                      <Link
                        href={`/contracts/${contract.id}`}
                        className="text-pifc-primary hover:underline font-semibold"
                      >
                        {contract.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{contract.supplierName}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {format(new Date(contract.contractDate), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-700">
                      R$ {Number(contract.value).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={contract.status as any} />
                    </td>
                  </tr>
                ))}
                {filteredContracts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      Nenhum contrato encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
