import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertContract, type InsertContractFile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useContracts() {
  return useQuery({
    queryKey: [api.contracts.list.path],
    queryFn: async () => {
      const res = await fetch(api.contracts.list.path);
      if (!res.ok) throw new Error("Failed to fetch contracts");
      return api.contracts.list.responses[200].parse(await res.json());
    },
  });
}

export function useContract(id: number) {
  return useQuery({
    queryKey: [api.contracts.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.contracts.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch contract details");
      return api.contracts.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertContract) => {
      const res = await fetch(api.contracts.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create contract");
      }
      
      return api.contracts.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.contracts.list.path] });
      toast({ title: "Success", description: "Contract created successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error instanceof Error ? error.message : "Failed to create contract",
        variant: "destructive"
      });
    },
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ contractId, file, fileType }: { contractId: number, file: File, fileType: "contract" | "requirements" | "code" }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", fileType);

      const url = buildUrl(api.contracts.uploadFile.path, { id: contractId });
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to upload file");
      return api.contracts.uploadFile.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.contracts.get.path, variables.contractId] });
      toast({ title: "Uploaded", description: "File uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload file", variant: "destructive" });
    },
  });
}

export function useRunAnalysis() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (contractId: number) => {
      const url = buildUrl(api.contracts.analyze.path, { id: contractId });
      const res = await fetch(url, { method: "POST" });
      
      if (!res.ok) throw new Error("Failed to start analysis");
      return res.json();
    },
    onSuccess: (_, contractId) => {
      queryClient.invalidateQueries({ queryKey: [api.contracts.get.path, contractId] });
      toast({ title: "Analysis Started", description: "The AI is analyzing the contract files." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start analysis", variant: "destructive" });
    },
  });
}

export function useAnalysis(id: number | undefined) {
  return useQuery({
    queryKey: [api.contracts.getAnalysis.path, id],
    queryFn: async () => {
      if (!id) return null;
      const url = buildUrl(api.contracts.getAnalysis.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch analysis");
      return api.contracts.getAnalysis.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
