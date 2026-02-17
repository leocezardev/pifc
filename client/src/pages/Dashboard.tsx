import { Sidebar } from "@/components/Sidebar";
import { useContracts } from "@/hooks/use-contracts";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, FileCheck, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: contracts, isLoading } = useContracts();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-muted rounded-xl"></div>)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const stats = {
    total: contracts?.length || 0,
    analyzing: contracts?.filter(c => c.status === 'analyzing').length || 0,
    completed: contracts?.filter(c => c.status === 'completed').length || 0,
    failed: contracts?.filter(c => c.status === 'failed').length || 0,
  };

  const recentContracts = contracts?.slice(0, 5) || [];

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 space-y-8">
        <div className="flex justify-between items-center animate-enter">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">Welcome back, Auditor.</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-enter" style={{ animationDelay: "100ms" }}>
          <Card className="shadow-sm border-border/60 hover:border-primary/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60 hover:border-blue-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Analysis</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.analyzing}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60 hover:border-emerald-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Clock className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-border/60 hover:border-red-500/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attention Needed</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm animate-enter" style={{ animationDelay: "200ms" }}>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
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
                  {recentContracts.map((contract) => (
                    <tr key={contract.id} className="bg-white border-b hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        <Link href={`/contracts/${contract.id}`} className="hover:underline">
                          {contract.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{contract.supplierName}</td>
                      <td className="px-6 py-4">{format(new Date(contract.contractDate), "MMM d, yyyy")}</td>
                      <td className="px-6 py-4">R$ {Number(contract.value).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={contract.status as any} />
                      </td>
                    </tr>
                  ))}
                  {recentContracts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No contracts found. Create one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
