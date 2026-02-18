import { DashboardLayout } from "@/components/DashboardLayout";
import { useContract, useRunAnalysis, useAnalysis } from "@/hooks/use-contracts";
import { StatusBadge } from "@/components/StatusBadge";
import { FileUpload } from "@/components/FileUpload";
import { AnalysisReport } from "@/components/AnalysisReport";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Link, useRoute } from "wouter";

export default function ContractDetail() {
  const [, params] = useRoute("/contracts/:id");
  const id = parseInt(params?.id || "0");
  const { data: contract, isLoading, error } = useContract(id);
  const runAnalysis = useRunAnalysis();

  const { data: analysis } = useAnalysis(contract?.analyses?.[0]?.id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 border-4 border-pifc-primary/20 border-t-pifc-primary rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !contract) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24 text-gray-500">
          <span className="material-icons-outlined text-4xl mr-3">error_outline</span>
          Contrato não encontrado.
        </div>
      </DashboardLayout>
    );
  }

  const hasContractFile = contract.files?.some((f) => f.fileType === "contract");
  const hasRequirementsFile = contract.files?.some((f) => f.fileType === "requirements");
  const hasCodeFile = contract.files?.some((f) => f.fileType === "code");
  const allFilesUploaded = hasContractFile && hasRequirementsFile && hasCodeFile;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="space-y-4 animate-enter">
        <Link
          href="/contracts"
          className="inline-flex items-center text-sm text-gray-500 hover:text-pifc-primary transition-colors"
        >
          <span className="material-icons-outlined text-sm mr-1">arrow_back</span>
          Voltar para Contratos
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-gray-800">{contract.title}</h2>
              <StatusBadge status={contract.status as any} className="text-sm px-3 py-1" />
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {contract.supplierName} • {format(new Date(contract.contractDate), "dd MMMM yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Valor Total</p>
            <p className="text-2xl font-bold font-mono text-pifc-primary">
              R$ {Number(contract.value).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6 mt-8">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger value="overview" className="rounded-lg">
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="files" className="rounded-lg">
            Arquivos
          </TabsTrigger>
          <TabsTrigger value="analysis" className="rounded-lg">
            Relatório de Análise
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-enter">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Descrição</h3>
            <p className="text-gray-600 leading-relaxed">
              {contract.description || "Nenhuma descrição fornecida."}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="files" className="animate-enter">
          <div className="grid md:grid-cols-3 gap-6">
            <FileUpload
              contractId={contract.id}
              fileType="contract"
              label="Contrato PDF"
              accept=".pdf"
              isUploaded={hasContractFile}
            />
            <FileUpload
              contractId={contract.id}
              fileType="requirements"
              label="Documento de Requisitos"
              accept=".pdf,.doc,.docx"
              isUploaded={hasRequirementsFile}
            />
            <FileUpload
              contractId={contract.id}
              fileType="code"
              label="Código-fonte"
              accept=".zip,.rar,.tar.gz"
              isUploaded={hasCodeFile}
            />
          </div>

          {contract.files && contract.files.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mt-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Histórico de Uploads</h3>
              <ul className="space-y-2">
                {contract.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg text-sm"
                  >
                    <span className="font-medium text-gray-700">{file.filename}</span>
                    <span className="text-gray-500 uppercase text-xs tracking-wider">
                      {file.fileType}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="animate-enter">
          {contract.status === "draft" && (
            <div className="bg-white rounded-xl border-dashed border-2 border-gray-300 p-12 text-center">
              <div className="w-16 h-16 bg-pifc-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="material-icons-outlined text-pifc-primary text-3xl">play_arrow</span>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-800">Pronto para Analisar?</h3>
              <p className="text-gray-600 max-w-md mb-6 mx-auto">
                Certifique-se de que todos os documentos necessários (Contrato, Requisitos e Código-fonte) foram enviados antes de iniciar a análise por IA.
              </p>
              <Button
                size="lg"
                disabled={!allFilesUploaded || runAnalysis.isPending}
                onClick={() => runAnalysis.mutate(contract.id)}
                className="bg-pifc-primary hover:bg-pifc-primary-dark shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                {runAnalysis.isPending ? "Iniciando..." : "Iniciar Análise IA"}
              </Button>
              {!allFilesUploaded && (
                <p className="mt-4 text-sm text-ds-error flex items-center gap-2 justify-center">
                  <span className="material-icons-outlined text-base">error</span>
                  Arquivos obrigatórios ausentes. Faça upload na aba Arquivos.
                </p>
              )}
            </div>
          )}

          {contract.status === "analyzing" && (
            <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-200">
              <div className="relative inline-block">
                <div className="w-16 h-16 border-4 border-pifc-primary/20 border-t-pifc-primary rounded-full animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold mt-6 mb-2 text-gray-800">Analisando Contrato...</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Nossa IA está revisando os termos do contrato, requisitos e código-fonte. Isso pode levar alguns minutos.
              </p>
            </div>
          )}

          {contract.status === "completed" && analysis && <AnalysisReport analysis={analysis} />}

          {contract.status === "failed" && (
            <div className="p-8 border border-ds-error/20 bg-red-50 rounded-xl text-center">
              <h3 className="text-lg font-bold text-ds-error mb-2">Análise Falhou</h3>
              <p className="text-gray-600">
                Algo deu errado durante o processo de análise. Por favor, tente novamente ou verifique os arquivos.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
