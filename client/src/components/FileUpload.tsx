import { useRef, useState } from "react";
import { Upload, File, CheckCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUploadFile } from "@/hooks/use-contracts";

interface FileUploadProps {
  contractId: number;
  fileType: "contract" | "requirements" | "code";
  label: string;
  accept: string;
  isUploaded?: boolean;
}

export function FileUpload({ contractId, fileType, label, accept, isUploaded }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFile = useUploadFile();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    uploadFile.mutate({ contractId, file, fileType });
  };

  if (isUploaded) {
    return (
      <div className="relative group border rounded-xl p-4 flex items-center gap-3 bg-emerald-50/50 border-emerald-100">
        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-emerald-900">{label}</p>
          <p className="text-xs text-emerald-600">Uploaded successfully</p>
        </div>
        {/* Re-upload button could go here */}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative group border-2 border-dashed rounded-xl p-6 transition-all duration-200 text-center cursor-pointer",
        dragActive
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
        uploadFile.isPending && "opacity-50 pointer-events-none"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleChange}
      />
      
      <div className="flex flex-col items-center gap-2">
        <div className="p-3 bg-primary/10 rounded-full text-primary group-hover:scale-110 transition-transform">
          {uploadFile.isPending ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-5 h-5" />
          )}
        </div>
        <div>
          <p className="font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag & drop or click to upload
          </p>
        </div>
      </div>
    </div>
  );
}
