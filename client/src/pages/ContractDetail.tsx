import { Sidebar } from "@/components/Sidebar";
import { useContract, useRunAnalysis, useAnalysis } from "@/hooks/use-contracts";
import { StatusBadge } from "@/components/StatusBadge";
import { FileUpload } from "@/components/FileUpload";
import { AnalysisReport } from "@/components/AnalysisReport";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, Play, AlertCircle, Loader2 } from "lucide-react";
import { Link, useRoute } from "wouter";

export default function ContractDetail() {
  const [, params] = useRoute("/contracts/:id");
  const id = parseInt(params?.id || "0");
  const { data: contract, isLoading, error } = useContract(id);
  const runAnalysis = useRunAnalysis();
  
  // Try to fetch analysis if status is completed
  const { data: analysis } = useAnalysis(contract?.analyses?.[0]?.id);

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (error || !contract) return <div className="flex h-screen items-center justify-center">Contract not found</div>;

  const hasContractFile = contract.files?.some(f => f.fileType === "contract");
  const hasRequirementsFile = contract.files?.some(f => f.fileType === "requirements");
  const hasCodeFile = contract.files?.some(f => f.fileType === "code");
  const allFilesUploaded = hasContractFile && hasRequirementsFile && hasCodeFile;

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 p-8 space-y-8">
        {/* Header */}
        <div className="space-y-4 animate-enter">
          <Link href="/contracts" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Contracts
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{contract.title}</h1>
                <StatusBadge status={contract.status as any} className="text-sm px-3 py-1" />
              </div>
              <p className="text-muted-foreground mt-1">
                {contract.supplierName} • {format(new Date(contract.contractDate), "MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold font-mono text-primary">R$ {Number(contract.value).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="overview" className="rounded-lg">Overview</TabsTrigger>
            <TabsTrigger value="files" className="rounded-lg">Files & Documents</TabsTrigger>
            <TabsTrigger value="analysis" className="rounded-lg">Analysis Report</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="animate-enter">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {contract.description || "No description provided."}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="animate-enter">
            <div className="grid md:grid-cols-3 gap-6">
              <FileUpload 
                contractId={contract.id} 
                fileType="contract" 
                label="Contract PDF" 
                accept=".pdf"
                isUploaded={hasContractFile} 
              />
              <FileUpload 
                contractId={contract.id} 
                fileType="requirements" 
                label="Requirements Doc" 
                accept=".pdf,.doc,.docx"
                isUploaded={hasRequirementsFile} 
              />
              <FileUpload 
                contractId={contract.id} 
                fileType="code" 
                label="Source Code" 
                accept=".zip,.rar,.tar.gz"
                isUploaded={hasCodeFile} 
              />
            </div>
            
            {contract.files && contract.files.length > 0 && (
              <Card className="mt-8 shadow-sm">
                <CardHeader><CardTitle>Uploaded Files History</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {contract.files.map(file => (
                      <li key={file.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg text-sm">
                        <span className="font-medium text-foreground">{file.filename}</span>
                        <span className="text-muted-foreground uppercase text-xs tracking-wider">{file.fileType}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis" className="animate-enter">
            {contract.status === 'draft' && (
              <Card className="border-dashed border-2 shadow-none bg-muted/10">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Play className="w-8 h-8 text-primary ml-1" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Ready to Analyze?</h3>
                  <p className="text-muted-foreground max-w-md mb-6">
                    Ensure all required documents (Contract, Requirements, and Source Code) are uploaded before starting the AI analysis.
                  </p>
                  <Button 
                    size="lg" 
                    disabled={!allFilesUploaded || runAnalysis.isPending}
                    onClick={() => runAnalysis.mutate(contract.id)}
                    className="shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {runAnalysis.isPending ? "Starting..." : "Start AI Analysis"}
                  </Button>
                  {!allFilesUploaded && (
                    <p className="mt-4 text-sm text-destructive flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Missing required files. Please upload them in the Files tab.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {contract.status === 'analyzing' && (
              <Card className="border-none shadow-lg bg-white/50 backdrop-blur">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mt-6 mb-2">Analyzing Contract...</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Our AI is reviewing the contract terms, requirements, and codebase to verify function points. This may take a few minutes.
                  </p>
                </CardContent>
              </Card>
            )}

            {contract.status === 'completed' && analysis && (
              <AnalysisReport analysis={analysis} />
            )}
            
            {contract.status === 'failed' && (
              <div className="p-8 border border-destructive/20 bg-destructive/5 rounded-xl text-center">
                <h3 className="text-lg font-bold text-destructive mb-2">Analysis Failed</h3>
                <p className="text-muted-foreground">Something went wrong during the analysis process. Please try again or check the files.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
