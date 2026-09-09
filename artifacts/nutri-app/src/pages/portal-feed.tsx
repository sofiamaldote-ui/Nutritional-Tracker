import { useState } from "react";
import { 
  useGetPatientFeed, 
  GetPatientFeedCategory
} from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BookOpen, PlayCircle, FileCode2, FileText, Search, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Linkify } from "@/components/linkify";

export default function PortalFeedPage() {
  const [categoryFilter, setCategoryFilter] = useState<GetPatientFeedCategory>(GetPatientFeedCategory.all);
  
  const { data: feed = [], isLoading } = useGetPatientFeed({
    category: categoryFilter,
  });

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
    <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-4xl mx-auto">
      <div className="text-center md:text-left mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Materiais e Recomendações</h1>
        <p className="text-muted-foreground mt-2">Conteúdos selecionados especialmente para o seu acompanhamento.</p>
      </div>

      <div className="flex justify-center md:justify-start">
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as GetPatientFeedCategory)} className="w-full max-w-2xl">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value={GetPatientFeedCategory.all} className="py-2 text-xs md:text-sm">Todos</TabsTrigger>
            <TabsTrigger value={GetPatientFeedCategory.ebook} className="py-2 text-xs md:text-sm">E-books</TabsTrigger>
            <TabsTrigger value={GetPatientFeedCategory.receita} className="py-2 text-xs md:text-sm">Receitas</TabsTrigger>
            <TabsTrigger value={GetPatientFeedCategory.video} className="py-2 text-xs md:text-sm">Vídeos</TabsTrigger>
            <TabsTrigger value={GetPatientFeedCategory.artigo} className="py-2 text-xs md:text-sm">Artigos</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => <div key={i} className="h-64 bg-muted/50 rounded-2xl animate-pulse" />)}
        </div>
      ) : feed.length === 0 ? (
        <EmptyState 
          icon={Search}
          title="Nenhum conteúdo disponível"
          description="Sua nutricionista ainda não disponibilizou materiais nesta categoria."
        />
      ) : (
        <div className="space-y-8">
          {feed.map((pub) => (
            <Card key={pub.id} className="overflow-hidden shadow-md border-border/60 hover:shadow-lg transition-all duration-300">
              {pub.imagePath && (
                <div className="w-full h-48 sm:h-64 bg-muted relative">
                  <img src={`/api/storage${pub.imagePath}`} alt={pub.title} className="w-full h-full object-cover" />
                  {pub.isNew && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-0 shadow-lg px-3 py-1">Novo!</Badge>
                    </div>
                  )}
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="outline" className={`shadow-sm ${getCategoryColor(pub.category)}`}>
                    <span className="flex items-center gap-1.5 capitalize font-medium">{getCategoryIcon(pub.category)}{pub.category}</span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {pub.publishedAt && format(new Date(pub.publishedAt), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                  {!pub.imagePath && pub.isNew && (
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-0 px-2 py-0.5 ml-auto">Novo</Badge>
                  )}
                </div>
                
                <h2 className="text-2xl font-bold font-display text-foreground mb-3">{pub.title}</h2>
                {pub.description && (
                  <Linkify text={pub.description} className="block text-muted-foreground leading-relaxed mb-6" />
                )}

                {pub.linkUrl && (
                  <Button variant="outline" size="sm" asChild className="mb-6">
                    <a href={pub.linkUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="size-3.5 mr-1.5" /> Acessar link
                    </a>
                  </Button>
                )}

                {/* PDF Viewer Inline */}
                {pub.pdfPath && (
                  <div className="mt-6 border rounded-xl overflow-hidden bg-muted/20">
                    <div className="bg-muted p-3 border-b flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-sm font-medium flex items-center gap-2"><FileText className="size-4 text-primary" /> Visualizador PDF</span>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild className="h-8">
                          <a
                            href={`/api/storage${pub.pdfPath}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="size-3.5 mr-1.5" /> Abrir em nova aba
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild className="h-8">
                          <a
                            href={`/api/storage${pub.pdfPath}?download=${encodeURIComponent(`${pub.title || "documento"}.pdf`)}`}
                            download
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="size-3.5 mr-1.5" /> Baixar
                          </a>
                        </Button>
                      </div>
                    </div>
                    {/* <object> renderiza o PDF inline nos navegadores que suportam;
                        quando nao suportam (Safari/Chrome no celular, PDF desativado
                        no desktop) o conteudo de fallback abaixo aparece no lugar de
                        um quadro em branco. */}
                    <object
                      data={`/api/storage${pub.pdfPath}#toolbar=0&view=FitH`}
                      type="application/pdf"
                      className="w-full h-[400px] block"
                      aria-label={pub.title}
                    >
                      <div className="flex flex-col items-center justify-center gap-3 h-[400px] p-6 text-center">
                        <FileText className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Seu navegador não abriu o PDF aqui dentro.
                        </p>
                        <Button size="sm" asChild>
                          <a href={`/api/storage${pub.pdfPath}`} target="_blank" rel="noreferrer">
                            <ExternalLink className="size-3.5 mr-1.5" /> Abrir PDF
                          </a>
                        </Button>
                      </div>
                    </object>
                  </div>
                )}

                {/* Video Embed */}
                {pub.videoUrl && pub.category === 'video' && (
                  <div className="mt-6 aspect-video rounded-xl overflow-hidden border shadow-sm">
                    <iframe 
                      src={pub.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} 
                      className="w-full h-full border-0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      title={pub.title}
                    />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
