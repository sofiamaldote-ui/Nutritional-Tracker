import { useState, useRef } from "react";
import { useRequestUploadUrl } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";

interface FileUploadProps {
  onUploadSuccess: (path: string) => void;
  accept?: string;
  label?: string;
  currentPath?: string | null;
  onRemove?: () => void;
}

export function FileUpload({ onUploadSuccess, accept = "*/*", label = "Fazer upload", currentPath, onRemove }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestUploadUrl = useRequestUploadUrl();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
        data: {
          name: file.name,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        }
      });

      const response = await fetch(uploadURL, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file to GCS");
      }

      onUploadSuccess(objectPath);
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  if (currentPath) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg border bg-muted/30">
        <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
          <FileIcon className="size-5" />
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">Arquivo anexado</p>
          <a href={`/api/storage${currentPath}`} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
            Ver arquivo
          </a>
        </div>
        {onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove} className="text-muted-foreground hover:text-destructive shrink-0">
            <X className="size-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div>
      <input 
        type="file" 
        className="hidden" 
        ref={inputRef} 
        onChange={handleFileChange} 
        accept={accept} 
      />
      <Button 
        type="button" 
        variant="outline" 
        className="w-full h-24 border-dashed bg-muted/10 hover:bg-muted/30" 
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin text-primary" />
            <span className="text-sm font-medium">Enviando...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <UploadCloud className="size-6 text-primary/70" />
            <span className="text-sm font-medium">{label}</span>
          </div>
        )}
      </Button>
    </div>
  );
}
