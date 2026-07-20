import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetConsultation, 
  useUpdateConsultation,
  useGetPatient,
  getGetConsultationQueryKey,
  ConsultationDetailType,
  ConsultationUpdate
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, Save, TrendingUp, TrendingDown, Minus, Activity, FileText, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import { FileUpload } from "@/components/file-upload";
import { Separator } from "@/components/ui/separator";

export default function ConsultaDetailPage() {
  const { id, consultationId } = useParams();
  const pId = Number(id);
  const cId = Number(consultationId);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patient, isError: isPatientError } = useGetPatient(pId);
  const { data: consultation, isLoading, isError: isConsultationError } = useGetConsultation(pId, cId);
  const updateConsultation = useUpdateConsultation();

  const [formData, setFormData] = useState<Partial<ConsultationUpdate>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const initializedForId = useRef<number | null>(null);
  const lastSaved = useRef<Partial<ConsultationUpdate>>({});

  const debouncedFormData = useDebounce(formData, 1000);

  useEffect(() => {
    if (consultation && initializedForId.current !== consultation.id) {
      initializedForId.current = consultation.id;
      const initialData: Partial<ConsultationUpdate> = {
        weight: consultation.weight ?? undefined,
        height: consultation.height ?? undefined,
        waistCm: consultation.waistCm ?? undefined,
        hipCm: consultation.hipCm ?? undefined,
        abdomenCm: consultation.abdomenCm ?? undefined,
        armCm: consultation.armCm ?? undefined,
        thighCm: consultation.thighCm ?? undefined,
        calfCm: consultation.calfCm ?? undefined,
        notes: consultation.notes ?? undefined,
        objective: consultation.objective ?? undefined,
        vetKcal: consultation.vetKcal ?? undefined,
        restrictions: consultation.restrictions ?? undefined,
        additionalGuidance: consultation.additionalGuidance ?? undefined,
        evolutionNotes: consultation.evolutionNotes ?? undefined,
      };
      setFormData(initialData);
      lastSaved.current = initialData;
    }
  }, [consultation]);

  useEffect(() => {
    if (initializedForId.current !== cId || !isDirty) return;

    const hasChanges = Object.keys(debouncedFormData).some(
      (key) => (debouncedFormData as any)[key] !== (lastSaved.current as any)[key]
    );

    if (hasChanges) {
      setIsSaving(true);
      updateConsultation.mutate({
        patientId: pId,
        consultationId: cId,
        data: debouncedFormData
      }, {
        onSuccess: (updated) => {
          setIsSaving(false);
          setIsDirty(false);
          lastSaved.current = { ...debouncedFormData };
          queryClient.setQueryData(getGetConsultationQueryKey(pId, cId), (old: any) => 
            old ? { ...old, ...updated } : old
          );
        },
        onError: () => {
          setIsSaving(false);
          toast({ variant: "destructive", title: "Erro no salvamento automático" });
        }
      });
    }
  }, [debouncedFormData, cId, pId, isDirty]);

  const handleInputChange = (field: keyof ConsultationUpdate, value: string | number | null | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleFileUpload = (field: 'bioimpedancePdfPath' | 'menuPdfPath', path: string) => {
    updateConsultation.mutate({
      patientId: pId,
      consultationId: cId,
      data: { [field]: path }
    }, {
      onSuccess: (updated) => {
        toast({ title: "Arquivo anexado com sucesso" });
        queryClient.setQueryData(getGetConsultationQueryKey(pId, cId), (old: any) => 
          old ? { ...old, ...updated } : old
        );
      }
    });
  };

  if (isLoading) {
    return <div className="h-32 flex items-center justify-center"><div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (isConsultationError || isPatientError || !consultation || !patient) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Não foi possível carregar os dados da consulta.</p>
        <Button variant="outline" asChild>
          <Link href={`/pacientes/${pId}`}><ArrowLeft className="size-4 mr-2" /> Voltar</Link>
        </Button>
      </div>
    );
  }

  const formatType = (type: string) => {
    switch(type) {
      case 'avaliacao_inicial': return 'Avaliação Inicial';
      case 'reavaliacao': return 'Reavaliação';
      case 'cardapio': return 'Entrega de Cardápio';
      default: return type;
    }
  };

  const DeltaIndicator = ({ delta, inverse = false }: { delta?: number | null, inverse?: boolean }) => {
    if (delta === null || delta === undefined) return null;
    
    const isPositive = delta > 0;
    const isNeutral = delta === 0;
    
    let colorClass = "text-muted-foreground";
    let Icon = Minus;

    if (!isNeutral) {
      if ((isPositive && !inverse) || (!isPositive && inverse)) {
        colorClass = "text-green-600 bg-green-50";
      } else {
        colorClass = "text-red-600 bg-red-50";
      }
      Icon = isPositive ? TrendingUp : TrendingDown;
    }

    return (
      <div className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-md ${colorClass}`}>
        <Icon className="size-3" />
        {Math.abs(delta).toFixed(1)}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 pb-20">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href={`/pacientes/${pId}`}><ArrowLeft className="size-5" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-primary font-display">{patient.name}</h1>
            <Badge variant="outline" className="capitalize font-normal text-xs">{formatType(consultation.type)}</Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Activity className="size-4" />
            Realizada em {format(new Date(consultation.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="text-sm font-medium flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground">
          {isSaving ? (
            <><div className="size-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" /> Salvando...</>
          ) : (
            <><Check className="size-3 text-green-500" /> Salvo</>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {(consultation.type === ConsultationDetailType.avaliacao_inicial || consultation.type === ConsultationDetailType.reavaliacao) && (
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Antropometria</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Peso (kg)</Label>
                    <div className="relative">
                      <Input 
                        type="number" step="0.1" 
                        value={formData.weight ?? ''} 
                        onChange={(e) => handleInputChange('weight', e.target.value ? Number(e.target.value) : undefined)} 
                      />
                      {consultation.comparison?.weightDelta !== undefined && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full pl-2">
                          <DeltaIndicator delta={consultation.comparison.weightDelta} inverse={true} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Altura (cm)</Label>
                    <Input 
                      type="number" step="1" 
                      value={formData.height ?? ''} 
                      onChange={(e) => handleInputChange('height', e.target.value ? Number(e.target.value) : undefined)} 
                    />
                  </div>
                </div>

                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">IMC Calculado</span>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary font-display">{consultation.bmi || '--'}</span>
                    {consultation.comparison?.bmiDelta !== undefined && (
                      <DeltaIndicator delta={consultation.comparison.bmiDelta} inverse={true} />
                    )}
                  </div>
                </div>

                <Separator />
                
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Circunferências (cm)</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {(["waistCm", "hipCm", "abdomenCm", "armCm", "thighCm", "calfCm"] as const).map((field) => {
                    const labels: Record<string, string> = {
                      waistCm: "Cintura", hipCm: "Quadril", abdomenCm: "Abdômen",
                      armCm: "Braço", thighCm: "Coxa", calfCm: "Panturrilha"
                    };
                    return (
                      <div key={field} className="space-y-2">
                        <Label>{labels[field]}</Label>
                        <Input 
                          type="number" step="0.1" 
                          value={(formData as any)[field] ?? ''} 
                          onChange={(e) => handleInputChange(field, e.target.value ? Number(e.target.value) : undefined)} 
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Exames / Bioimpedância</CardTitle>
                <CardDescription>PDF com resultados</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  label="Anexar PDF" 
                  accept="application/pdf"
                  currentPath={consultation.bioimpedancePdfPath}
                  onUploadSuccess={(path) => handleFileUpload('bioimpedancePdfPath', path)}
                  onRemove={() => handleFileUpload('bioimpedancePdfPath', "")}
                />
              </CardContent>
            </Card>
          </div>
        )}

        <div className={`space-y-6 ${consultation.type === 'cardapio' ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
          
          {consultation.type === ConsultationDetailType.reavaliacao && (
            <Card className="shadow-sm border-l-4 border-l-accent">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Evolução Clínica</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Relato do paciente, adesão ao plano, sintomas e queixas..." 
                  className="min-h-[150px] resize-y"
                  value={formData.evolutionNotes ?? ''}
                  onChange={(e) => handleInputChange('evolutionNotes', e.target.value)}
                />
              </CardContent>
            </Card>
          )}

          {consultation.type === ConsultationDetailType.cardapio && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Diretrizes do Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Objetivo</Label>
                    <Input 
                      placeholder="Ex: Hipertrofia, Emagrecimento..." 
                      value={formData.objective ?? ''}
                      onChange={(e) => handleInputChange('objective', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>VET (kcal/dia)</Label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 2500" 
                      value={formData.vetKcal ?? ''}
                      onChange={(e) => handleInputChange('vetKcal', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Restrições / Alergias</Label>
                  <Input 
                    placeholder="Ex: Intolerância à lactose, vegetariano..." 
                    value={formData.restrictions ?? ''}
                    onChange={(e) => handleInputChange('restrictions', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Orientações Adicionais</Label>
                  <Textarea 
                    placeholder="Suplementação, hidratação, horários..." 
                    className="min-h-[100px]"
                    value={formData.additionalGuidance ?? ''}
                    onChange={(e) => handleInputChange('additionalGuidance', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {consultation.type === ConsultationDetailType.cardapio && (
             <Card className="shadow-sm border-primary/20">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-lg">Cardápio em PDF</CardTitle>
                  <CardDescription>O paciente verá este arquivo no app</CardDescription>
                </div>
                <div className="size-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <FileText className="size-5" />
                </div>
              </CardHeader>
              <CardContent>
                <FileUpload 
                  label="Anexar Plano Alimentar PDF" 
                  accept="application/pdf"
                  currentPath={consultation.menuPdfPath}
                  onUploadSuccess={(path) => handleFileUpload('menuPdfPath', path)}
                  onRemove={() => handleFileUpload('menuPdfPath', "")}
                />
              </CardContent>
            </Card>
          )}

          {(consultation.type === ConsultationDetailType.avaliacao_inicial || consultation.type === ConsultationDetailType.reavaliacao) && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Anotações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="Informações relevantes, histórico, rotina..." 
                  className="min-h-[200px] resize-y bg-yellow-50/30 border-yellow-200 focus-visible:ring-yellow-400"
                  value={formData.notes ?? ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
