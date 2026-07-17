import { useState } from "react";
import { 
  useListPublications, 
  useCreatePublication, 
  useTogglePublicationStatus,
  getListPublicationsQueryKey,
  PublicationCategory,
  PublicationVisibility,
  PublicationStatus,
  ListPublicationsCategory,
  ListPublicationsStatus,
  useListGroups
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, BookOpen, FileVideo, FileText, Image as ImageIcon, Eye, EyeOff, FileCode2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/file-upload";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "recharts";

const pubSchema = z.object({
  title: z.string().min(3, "Título obrigatório"),
  description: z.string().optional(),
  category: z.enum([PublicationCategory.ebook, PublicationCategory.receita, PublicationCategory.video, PublicationCategory.artigo]),
  visibility: z.enum([PublicationVisibility.geral, PublicationVisibility.grupos, PublicationVisibility.pacientes]),
  groupIds: z.array(z.number()).optional(),
  videoUrl: z.string().url("URL inválida").optional().or(z.literal("")),
});

export default function BibliotecaPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<ListPublicationsStatus>(ListPublicationsStatus.all);
  const [categoryFilter, setCategoryFilter] = useState<ListPublicationsCategory>(ListPublicationsCategory.all);
  
  // File state for new pub
  const [pdfPath, setPdfPath] = useState<string>("");
  const [imagePath, setImagePath] = useState<string>("");

  const { data: publications = [], isLoading } = useListPublications({
    status: statusFilter,
    category: categoryFilter,
  });
  
  const { data: groups = [] } = useListGroups();
  const createPub = useCreatePublication();
  const toggleStatus = useTogglePublicationStatus();

  const form = useForm<z.infer<typeof pubSchema>>({
    resolver: zodResolver(pubSchema),
    defaultValues: {
      title: "",
      description: "",
      category: PublicationCategory.artigo,
      visibility: PublicationVisibility.geral,
      groupIds: [],
      videoUrl: "",
    },
  });

  const visibilityValue = form.watch("visibility");
  const categoryValue = form.watch("category");

  const onSubmit = (values: z.infer<typeof pubSchema>) => {
    createPub.mutate({
      data: {
        ...values,
        pdfPath: pdfPath || undefined,
        imagePath: imagePath || undefined,
        videoUrl: values.videoUrl || undefined,
        status: PublicationStatus.rascunho // Always draft initially
      }
    }, {
      onSuccess: () => {
        toast({ title: "Publicação criada (Rascunho)" });
        queryClient.invalidateQueries({ queryKey: getListPublicationsQueryKey() });
        setIsSheetOpen(false);
        form.reset();
        setPdfPath("");
        setImagePath("");
      },
      onError: () => toast({ variant: "destructive", title: "Erro ao criar" })
    });
  };

  const handleToggleStatus = (id: number, currentStatus: string) => {
    toggleStatus.mutate({ id }, {
      onSuccess: () => {
        toast({ title: currentStatus === 'publicado' ? "Movido para rascunho" : "Publicado com sucesso" });
        queryClient.invalidateQueries({ queryKey: getListPublicationsQueryKey() });
      }
    });
  };

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'ebook': return <BookOpen className="size-4" />;
      case 'video': return <PlayCircle className="size-4" />;
      case 'receita': return <FileCode2 className="size-4" />;
      default: return <FileText className="size-4" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch(cat) {
      case 'ebook': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'video': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'receita': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Biblioteca</h1>
          <p className="text-muted-foreground mt-1">Materiais e conteúdos para o portal do paciente.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Nova Publicação
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Criar Conteúdo</SheetTitle>
              <SheetDescription>
                Adicione um novo material. Ele será criado como Rascunho.
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: E-book Receitas Low Carb" {...field} />
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
                      <FormLabel>Descrição Curta</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Sobre o que é este material..." className="resize-none h-20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PublicationCategory.artigo}>Artigo/Texto</SelectItem>
                            <SelectItem value={PublicationCategory.receita}>Receita</SelectItem>
                            <SelectItem value={PublicationCategory.ebook}>E-book (PDF)</SelectItem>
                            <SelectItem value={PublicationCategory.video}>Vídeo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Visibilidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={PublicationVisibility.geral}>Geral (Todos)</SelectItem>
                            <SelectItem value={PublicationVisibility.grupos}>Por Grupo</SelectItem>
                            <SelectItem value={PublicationVisibility.pacientes}>Pacientes Específicos</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {visibilityValue === PublicationVisibility.grupos && (
                  <FormField
                    control={form.control}
                    name="groupIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Selecione os Grupos</FormLabel>
                        <div className="border rounded-md p-3 max-h-32 overflow-y-auto space-y-2 bg-muted/20">
                          {groups.map(g => (
                            <label key={g.id} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="rounded text-primary focus:ring-primary"
                                checked={field.value?.includes(g.id)}
                                onChange={(e) => {
                                  const val = field.value || [];
                                  if (e.target.checked) field.onChange([...val, g.id]);
                                  else field.onChange(val.filter(id => id !== g.id));
                                }}
                              />
                              <div className="size-3 rounded-full" style={{ backgroundColor: g.color }} />
                              {g.name}
                            </label>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                  <h4 className="text-sm font-medium">Mídia / Anexos</h4>
                  
                  {categoryValue === PublicationCategory.video ? (
                    <FormField
                      control={form.control}
                      name="videoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link do Vídeo (YouTube/Vimeo)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-2">
                      <Label>Arquivo PDF</Label>
                      <FileUpload 
                        label="Anexar PDF" 
                        accept="application/pdf"
                        currentPath={pdfPath}
                        onUploadSuccess={setPdfPath}
                        onRemove={() => setPdfPath("")}
                      />
                    </div>
                  )}

                  <div className="space-y-2 mt-4 pt-4 border-t border-border">
                    <Label>Capa / Imagem Destaque (Opcional)</Label>
                    <FileUpload 
                      label="Anexar Imagem" 
                      accept="image/*"
                      currentPath={imagePath}
                      onUploadSuccess={setImagePath}
                      onRemove={() => setImagePath("")}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={createPub.isPending}>
                    {createPub.isPending ? "Salvando..." : "Salvar Rascunho"}
                  </Button>
                </div>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-card p-2 rounded-lg border shadow-sm">
        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as ListPublicationsStatus)} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={ListPublicationsStatus.all}>Todos</TabsTrigger>
            <TabsTrigger value={ListPublicationsStatus.published}>Publicados</TabsTrigger>
            <TabsTrigger value={ListPublicationsStatus.draft}>Rascunhos</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="h-px sm:h-auto sm:w-px bg-border mx-2" />

        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as ListPublicationsCategory)} className="w-full overflow-x-auto">
          <TabsList className="flex w-max min-w-full justify-start">
            <TabsTrigger value={ListPublicationsCategory.all}>Todas Cats</TabsTrigger>
            <TabsTrigger value={ListPublicationsCategory.ebook}>E-books</TabsTrigger>
            <TabsTrigger value={ListPublicationsCategory.receita}>Receitas</TabsTrigger>
            <TabsTrigger value={ListPublicationsCategory.video}>Vídeos</TabsTrigger>
            <TabsTrigger value={ListPublicationsCategory.artigo}>Artigos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      ) : publications.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="Nenhum conteúdo encontrado"
          description="Ajuste os filtros ou crie uma nova publicação."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub) => (
            <Card key={pub.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {pub.imagePath ? (
                <div className="h-40 w-full bg-muted overflow-hidden relative">
                  <img src={`/api/storage${pub.imagePath}`} alt={pub.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 flex gap-2">
                    <Badge variant="outline" className={`shadow-sm backdrop-blur-md bg-background/80 ${getCategoryColor(pub.category)}`}>
                      <span className="flex items-center gap-1.5 capitalize">{getCategoryIcon(pub.category)}{pub.category}</span>
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="h-2 w-full bg-primary/20 relative">
                  <div className="absolute top-4 left-4">
                    <Badge variant="outline" className={getCategoryColor(pub.category)}>
                      <span className="flex items-center gap-1.5 capitalize">{getCategoryIcon(pub.category)}{pub.category}</span>
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardHeader className={`${pub.imagePath ? 'pt-4' : 'pt-12'} pb-2`}>
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="text-lg line-clamp-2 leading-tight">{pub.title}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2 text-xs mt-2">{pub.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1 pb-4">
                <div className="flex flex-wrap gap-2 text-xs mt-2">
                  <Badge variant="secondary" className="font-normal capitalize bg-muted/50 text-muted-foreground border-transparent">
                    {pub.visibility === 'geral' ? 'Visível para todos' : 
                     pub.visibility === 'grupos' ? 'Específico p/ Grupos' : 'Específico p/ Pacientes'}
                  </Badge>
                </div>
              </CardContent>
              
              <CardFooter className="border-t bg-muted/10 p-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium flex items-center gap-1.5 ${pub.status === 'publicado' ? 'text-green-600' : 'text-orange-500'}`}>
                    {pub.status === 'publicado' ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    <span className="capitalize">{pub.status}</span>
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={pub.status === 'rascunho' ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90 hover:text-primary-foreground" : ""}
                  onClick={() => handleToggleStatus(pub.id, pub.status)}
                  disabled={toggleStatus.isPending}
                >
                  {pub.status === 'publicado' ? 'Ocultar' : 'Publicar'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
