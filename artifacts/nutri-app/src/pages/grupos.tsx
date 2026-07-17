import { useState } from "react";
import { useListGroups, useCreateGroup, getListGroupsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Plus, FolderHeart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const groupSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  color: z.string().min(4, "Cor é obrigatória"),
  description: z.string().optional(),
});

export default function GruposPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: groups = [], isLoading } = useListGroups();
  const createGroup = useCreateGroup();

  const form = useForm<z.infer<typeof groupSchema>>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      color: "#2E5E4E",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof groupSchema>) => {
    createGroup.mutate({ data: values }, {
      onSuccess: () => {
        toast({ title: "Grupo criado com sucesso" });
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
        setIsDialogOpen(false);
        form.reset();
      },
      onError: () => toast({ variant: "destructive", title: "Erro ao criar grupo" })
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Grupos</h1>
          <p className="text-muted-foreground mt-1">Organize pacientes para enviar conteúdos em massa.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Novo Grupo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Grupo</DialogTitle>
              <DialogDescription>
                Grupos permitem classificar pacientes (ex: Desafio 30 Dias, Gestantes).
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Grupo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Desafio Verão" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor de identificação</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input type="color" className="w-12 h-10 p-1" {...field} />
                          <Input type="text" className="flex-1 uppercase font-mono" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input placeholder="Breve descrição do propósito..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={createGroup.isPending}>
                    {createGroup.isPending ? "Criando..." : "Criar Grupo"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState 
          icon={FolderHeart}
          title="Nenhum grupo criado"
          description="Crie grupos para organizar seus pacientes e segmentar conteúdos."
          actionLabel="Criar Primeiro Grupo"
          onAction={() => setIsDialogOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <Link key={group.id} href={`/grupos/${group.id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group/card border-transparent hover:border-border">
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <div className="size-3 rounded-full" style={{ backgroundColor: group.color }} />
                      {group.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {group.description || "Sem descrição"}
                    </CardDescription>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity -mr-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 w-fit px-3 py-1 rounded-full">
                    <Users className="size-4" />
                    <span className="font-medium">{group.memberCount} pacientes</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
