import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "draft" | "analyzing" | "completed" | "failed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    analyzing: "bg-blue-100 text-blue-700 border-blue-200 animate-pulse",
    completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    failed: "bg-red-100 text-red-700 border-red-200",
  };

  const labels = {
    draft: "Draft",
    analyzing: "Analyzing...",
    completed: "Analysis Ready",
    failed: "Failed",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        styles[status],
        className
      )}
    >
      {labels[status]}
    </span>
  );
}
