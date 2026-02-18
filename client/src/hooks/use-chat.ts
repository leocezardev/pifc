import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ChatSession, ChatSessionResponse, ChatMessage } from "@shared/schema";

export function useCreateSession() {
    return useMutation({
        mutationFn: async (data: {
            sessionType: "chat" | "repo" | "upload";
            title?: string;
            repoUrl?: string;
            initialMessage?: string;
        }) => {
            const res = await apiRequest("POST", "/api/sessions", data);
            return (await res.json()) as ChatSession;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
        },
    });
}

export function useChatSession(id: number | undefined) {
    return useQuery<ChatSessionResponse>({
        queryKey: ["/api/sessions", id],
        queryFn: async () => {
            const res = await fetch(`/api/sessions/${id}`, { credentials: "include" });
            if (!res.ok) throw new Error("Session not found");
            return res.json();
        },
        enabled: !!id,
        refetchInterval: false,
    });
}

export function useSendMessage() {
    return useMutation({
        mutationFn: async ({ sessionId, content }: { sessionId: number; content: string }) => {
            const res = await apiRequest("POST", `/api/sessions/${sessionId}/messages`, { content });
            return (await res.json()) as { userMessage: ChatMessage; assistantMessage: ChatMessage };
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["/api/sessions", variables.sessionId] });
        },
    });
}

export function useGenerateScore() {
    return useMutation({
        mutationFn: async (sessionId: number) => {
            const res = await apiRequest("POST", `/api/sessions/${sessionId}/generate-score`);
            return (await res.json()) as { score: number; report: any; message: ChatMessage };
        },
        onSuccess: (_, sessionId) => {
            queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId] });
        },
    });
}

export function useSessions() {
    return useQuery<ChatSession[]>({
        queryKey: ["/api/sessions"],
        queryFn: async () => {
            const res = await fetch("/api/sessions", { credentials: "include" });
            if (!res.ok) throw new Error("Failed to fetch sessions");
            return res.json();
        },
    });
}
