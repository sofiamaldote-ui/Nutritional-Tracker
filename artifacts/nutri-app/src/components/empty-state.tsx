import { FolderHeart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ 
  icon: Icon = FolderHeart, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center animate-in fade-in-50">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Icon className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight font-display">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground mb-6">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
