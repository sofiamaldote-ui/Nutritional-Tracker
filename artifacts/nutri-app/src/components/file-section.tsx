import { useRef, useState } from "react";
import {
  useRequestUploadUrl,
  useListAttachments,
  useCreateAttachment,
  useDeleteAttachment,
  getListAttachmentsQueryKey,
  ConsultationAttachment,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UploadCloud, FileIcon, Loader2, X, FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_EXT = ".pdf,.jpg,.jpeg,.png";

interface FileSectionProps {
  patientId: number;
  consultationId: number;
  section: "exames" | "cardapios";
  title: string;
  description?: string;
}

function FileTypeIcon({ mimeType }: { mimeType?: string | null }) {
  if (mimeType?.startsWith("image/")) return <FileImage className="size-4 text-primary/70" />;
  return <FileText className="size-4 text-primary/70" />;
}

export function FileSection({ patientId, consultationId, section, title, description }: FileSectionProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const requestUploadUrl = useRequestUploadUrl();
  const createAttachment = useCreateAttachment();
  const deleteAttachment = useDeleteAttachment();

  const { data: allAttachments = [], isLoading } = useListAttachments(patientId, consultationId);
  const attachments = allAttachments.filter((a) => a.section === section);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getListAttachmentsQueryKey(patientId, consultationId) });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    // Validate
    for (const file of files) {
      if (file.size > MAX_SIZE_BYTES) {
        toast({ variant: "destructive", title: `"${file.name}" excede 20 MB` });
        return;
      }
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast({ variant: "destructive", title: `"${file.name}" não é PDF, JPG ou PNG` });
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of files) {
        // 1. Get presigned URL
        const { uploadURL, objectPath } = await requestUploadUrl.mutateAsync({
          data: { name: file.name, size: file.size, contentType: file.type || "application/octet-stream" },
        });

        // 2. Envia o arquivo direto para o R2 pela URL assinada
        const res = await fetch(uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!res.ok) throw new Error(`Falha no upload (HTTP ${res.status})`);

        // 3. Register in DB
        await createAttachment.mutateAsync({
          patientId,
          consultationId,
          data: {
            section,
            fileName: file.name,
            filePath: objectPath,
            mimeType: file.type,
            sizeBytes: file.size,
          },
        });
      }
      await invalidate();
      toast({ title: files.length > 1 ? `${files.length} arquivos anexados` : "Arquivo anexado" });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Erro ao enviar arquivo" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (attachment: ConsultationAttachment) => {
    try {
      await deleteAttachment.mutateAsync({
        patientId,
        consultationId,
        attachmentId: attachment.id,
      });
      await invalidate();
      toast({ title: "Arquivo removido" });
    } catch {
      toast({ variant: "destructive", title: "Erro ao remover arquivo" });
    }
  };

  return (
    <div className="space-y-3">
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      {/* File list */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" /> Carregando...
        </div>
      ) : attachments.length > 0 ? (
        <ul className="space-y-2">
          {attachments.map((att) => (
            <li key={att.id} className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20">
              <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 shrink-0">
                <FileTypeIcon mimeType={att.mimeType} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{att.fileName}</p>
                <div className="flex items-center gap-2">
                  <a
                    href={`/api/storage${att.filePath}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Ver arquivo
                  </a>
                  <span className="text-xs text-muted-foreground">
                    · {format(new Date(att.uploadedAt), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(att)}
                disabled={deleteAttachment.isPending}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground italic">Nenhum arquivo anexado.</p>
      )}

      {/* Upload button */}
      <div>
        <input
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={handleFileChange}
          accept={ACCEPTED_EXT}
          multiple
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-dashed w-full h-14 bg-muted/10 hover:bg-muted/30"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              Enviando...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-muted-foreground">
              <UploadCloud className="size-4 text-primary/70" />
              Adicionar arquivos (PDF, JPG, PNG · máx. 20 MB)
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
