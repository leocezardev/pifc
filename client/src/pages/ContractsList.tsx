import { Sidebar } from "@/components/Sidebar";
import { useContracts } from "@/hooks/use-contracts";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateContractDialog } from "@/components/CreateContractDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useState } from "react";

export default function ContractsList() {
  const { data: contracts, isLoading } = useContracts();
  const [search, setSearch] = useState("");

  const filteredContracts = contracts?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.supplierName.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 space-y-8">
        <div className="flex justify-between items-center animate-enter">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contracts Management</h1>
            <p className="text-muted-foreground mt-1">View and manage all auditing contracts.</p>
          </div>
          <CreateContractDialog />
        </div>

        <Card className="shadow-sm animate-enter" style={{ animationDelay: "100ms" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Contracts</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search contracts..." 
                  className="pl-9" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                    <tr>
                      <th className="px-6 py-3 rounded-l-lg">Contract Title</th>
                      <th className="px-6 py-3">Supplier</th>
                      <th className="px-6 py-3">Date</th>
                      <th className="px-6 py-3">Value</th>
                      <th className="px-6 py-3 rounded-r-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="bg-white border-b hover:bg-muted/20 transition-colors group">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <Link href={`/contracts/${contract.id}`} className="text-primary hover:underline font-semibold">
                            {contract.title}
                          </Link>
                        </td>
                        <td className="px-6 py-4">{contract.supplierName}</td>
                        <td className="px-6 py-4">{format(new Date(contract.contractDate), "MMM d, yyyy")}</td>
                        <td className="px-6 py-4 font-mono text-xs">R$ {Number(contract.value).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <StatusBadge status={contract.status as any} />
                        </td>
                      </tr>
                    ))}
                    {filteredContracts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No contracts found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
