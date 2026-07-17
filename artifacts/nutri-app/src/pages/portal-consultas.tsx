import { useState } from "react";
import { useGetMyConsultations, useGetMyConsultation, getGetMyConsultationQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, Calendar, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

function ConsultationDetails({ consultationId }: { consultationId: number }) {
  const { data: detail, isLoading } = useGetMyConsultation(consultationId, {
    query: { queryKey: getGetMyConsultationQueryKey(consultationId) }
  });

  if (isLoading) {
    return <div className="h-16 flex items-center justify-center"><div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;
  }
  if (!detail) return null;

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-6">
        {(detail.objective || detail.vetKcal || detail.additionalGuidance) && (
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-primary flex items-center gap-2">
              <Activity className="size-4" /> Diretrizes do Plano
            </h4>
            <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm">
              {detail.objective && (
                <div><span className="text-muted-foreground block text-xs">Objetivo</span><span className="font-medium">{detail.objective}</span></div>
              )}
              {detail.vetKcal && (
                <div><span className="text-muted-foreground block text-xs">Meta Calórica</span><span className="font-medium">{detail.vetKcal} kcal/dia</span></div>
              )}
              {detail.additionalGuidance && (
                <div><span className="text-muted-foreground block text-xs">Orientações Gerais</span><span className="font-medium whitespace-pre-wrap">{detail.additionalGuidance}</span></div>
              )}
            </div>
          </div>
        )}

        {(detail.weight || detail.bmi) && (
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-primary flex items-center gap-2">
              <Activity className="size-4" /> Evolução Física
            </h4>
            <div className="flex gap-4">
              {detail.weight && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex-1 text-center">
                  <span className="text-xs text-muted-foreground block mb-1">Peso</span>
                  <span className="text-xl font-bold text-primary">{detail.weight} kg</span>
                </div>
              )}
              {detail.bmi && (
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex-1 text-center">
                  <span className="text-xs text-muted-foreground block mb-1">IMC</span>
                  <span className="text-xl font-bold text-primary">{detail.bmi}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {detail.notes && (
          <div className="space-y-3">
            <h4 className="font-display font-semibold text-primary">Anotações</h4>
            <p className="text-sm bg-yellow-50/50 border border-yellow-100 rounded-lg p-3 whitespace-pre-wrap">{detail.notes}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {detail.menuPdfPath && (
          <Card className="border-primary/20 bg-primary/5 shadow-none">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-primary">Plano Alimentar</p>
                  <p className="text-xs text-primary/70">Arquivo PDF</p>
                </div>
              </div>
              <Button size="sm" asChild>
                <a href={`/api/storage${detail.menuPdfPath}`} target="_blank" rel="noreferrer">
                  Abrir <ChevronRight className="size-4 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}

        {detail.bioimpedancePdfPath && (
          <Card className="shadow-none bg-muted/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-muted text-muted-foreground rounded-lg flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Exames / Bioimpedância</p>
                  <p className="text-xs text-muted-foreground">Arquivo PDF</p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href={`/api/storage${detail.bioimpedancePdfPath}`} target="_blank" rel="noreferrer">
                  Abrir <ChevronRight className="size-4 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PortalConsultasPage() {
  const { data: consultations = [], isLoading } = useGetMyConsultations();
  const [openItem, setOpenItem] = useState<string | undefined>(undefined);

  const formatType = (type: string) => {
    switch(type) {
      case 'avaliacao_inicial': return 'Avaliação Inicial';
      case 'reavaliacao': return 'Reavaliação';
      case 'cardapio': return 'Plano Alimentar';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-4xl mx-auto">
      <div className="text-center md:text-left mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Minhas Consultas</h1>
        <p className="text-muted-foreground mt-2">Acompanhe seu histórico, metas e planos alimentares.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted/50 rounded-xl animate-pulse" />)}
        </div>
      ) : consultations.length === 0 ? (
        <EmptyState 
          icon={Calendar}
          title="Nenhuma consulta"
          description="Seu histórico de consultas aparecerá aqui."
        />
      ) : (
        <Accordion type="single" collapsible value={openItem} onValueChange={setOpenItem} className="space-y-4">
          {consultations.map((consultation, idx) => (
            <AccordionItem value={`item-${consultation.id}`} key={consultation.id} className="border bg-card rounded-xl shadow-sm px-2 overflow-hidden data-[state=open]:border-primary/50">
              <AccordionTrigger className="hover:no-underline px-4 py-4 data-[state=open]:pb-2">
                <div className="flex items-center text-left gap-4 w-full pr-4">
                  <div className="hidden sm:flex size-12 rounded-full bg-primary/10 text-primary items-center justify-center shrink-0">
                    <Activity className="size-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg">{format(new Date(consultation.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}</h3>
                      {idx === 0 && <Badge className="bg-primary font-normal">Mais recente</Badge>}
                    </div>
                    <p className="text-muted-foreground text-sm capitalize flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-primary/50" />
                      {formatType(consultation.type)}
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6 pt-2">
                <Separator className="mb-6" />
                {openItem === `item-${consultation.id}` && (
                  <ConsultationDetails consultationId={consultation.id} />
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
