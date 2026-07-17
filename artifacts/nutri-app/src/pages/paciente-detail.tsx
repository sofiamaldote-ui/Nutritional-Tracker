import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetPatient, 
  useResetPatientPassword, 
  useListConsultations,
  useCreateConsultation,
  getGetPatientQueryKey,
  getListConsultationsQueryKey,
  ConsultationInputType,
  ResetPasswordInputMode
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowLeft, KeyRound, Plus, Activity, Check, Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

const consultationSchema = z.object({
  type: z.enum([ConsultationInputType.avaliacao_inicial, ConsultationInputType.cardapio, ConsultationInputType.reavaliacao]),
  date: z.string(),
});

export default function PacienteDetailPage() {
  const { id } = useParams();
  const patientId = Number(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isConsultationDialogOpen, setIsConsultationDialogOpen] = useState(false);
  const [resetData, setResetData] = useState<{ message: string, password?: string | null } | null>(null);

  const { data: patient, isLoading: isPatientLoading, isError: isPatientError } = useGetPatient(patientId, {
    query: { queryKey: getGetPatientQueryKey(patientId) }
  });
  const { data: consultations = [], isLoading: isConsultationsLoading } = useListConsultations(
    patientId,
    { query: { enabled: !!patientId, queryKey: getListConsultationsQueryKey(patientId) } }
  );

  const createConsultation = useCreateConsultation();
  const resetPassword = useResetPatientPassword();

  const consultationForm = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      type: ConsultationInputType.reavaliacao,
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onConsultationSubmit = (values: z.infer<typeof consultationSchema>) => {
    createConsultation.mutate({
      patientId,
      data: {
        type: values.type,
        date: values.date,
      }
    }, {
      onSuccess: () => {
        toast({ title: "Consulta registrada com sucesso!" });
        queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey(patientId) });
        queryClient.invalidateQueries({ queryKey: getGetPatientQueryKey(patientId) });
        setIsConsultationDialogOpen(false);
      },
      onError: () => toast({ variant: "destructive", title: "Erro ao registrar consulta" })
    });
  };

  const handleResetPassword = (mode: ResetPasswordInputMode) => {
    resetPassword.mutate({
      id: patientId,
      data: { mode }
    }, {
      onSuccess: (res) => {
        setResetData({ message: res.message, password: res.provisionalPassword });
        toast({ title: "Senha resetada com sucesso" });
      },
      onError: () => toast({ variant: "destructive", title: "Erro ao resetar senha" })
    });
  };

  if (isPatientLoading) {
    return <div className="h-32 flex items-center justify-center"><div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  if (isPatientError || !patient) {
    return (
      <div className="h-64 flex flex-col items-center justify-center gap-4 text-center">
        <p className="text-muted-foreground">Não foi possível carregar os dados do paciente.</p>
        <Button variant="outline" asChild>
          <Link href="/pacientes"><ArrowLeft className="size-4 mr-2" /> Voltar para Pacientes</Link>
        </Button>
      </div>
    );
  }

  const formatConsultationType = (type: string) => {
    switch(type) {
      case 'avaliacao_inicial': return 'Avaliação Inicial';
      case 'reavaliacao': return 'Reavaliação';
      case 'cardapio': return 'Entrega de Cardápio';
      default: return type;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/pacientes"><ArrowLeft className="size-5" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">{patient.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {patient.email}
            <span className="text-[10px]">•</span>
            {patient.hasAccess ? (
              <span className="text-green-600 font-medium">Acesso Ativo</span>
            ) : (
              <span className="text-red-600 font-medium">Sem Acesso</span>
            )}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm h-fit">
          <CardHeader>
            <CardTitle>Perfil do Paciente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="size-24 border-4 border-muted mb-4">
                <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                  {patient.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg leading-tight">{patient.name}</h3>
              <p className="text-sm text-muted-foreground">Paciente desde {format(new Date(patient.createdAt), "MM/yyyy")}</p>
            </div>

            <Separator />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Telefone</span>
                <span className="font-medium">{patient.phone || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nascimento</span>
                <span className="font-medium">{patient.birthDate ? format(new Date(patient.birthDate), "dd/MM/yyyy") : "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sexo</span>
                <span className="font-medium capitalize">{patient.sex || "-"}</span>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-3 font-medium">Grupos</p>
              <div className="flex flex-wrap gap-2">
                {patient.groups && patient.groups.length > 0 ? (
                  patient.groups.map((group) => (
                    <Badge key={group.id} variant="outline" style={{ borderColor: group.color, color: group.color, backgroundColor: `${group.color}10` }}>
                      {group.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground italic">Nenhum grupo</span>
                )}
              </div>
            </div>

            <Separator />
            
            <div>
              <p className="text-sm font-medium mb-2">Acesso ao Portal</p>
              {resetData ? (
                <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-sm mb-3">
                  <p className="font-semibold mb-1 flex items-center gap-1"><Check className="size-4" /> {resetData.message}</p>
                  {resetData.password && (
                    <p>Senha provisória: <strong className="font-mono text-base ml-1">{resetData.password}</strong></p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleResetPassword(ResetPasswordInputMode.generate)} disabled={resetPassword.isPending}>
                    <KeyRound className="size-4 mr-2" /> Gerar nova senha provisória
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Tabs defaultValue="consultas" className="w-full">
            <TabsList className="w-full justify-start bg-card border-b rounded-none p-0 h-auto">
              <TabsTrigger value="consultas" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:shadow-none px-6 py-3">
                Histórico de Consultas ({(patient as any).consultationCount ?? consultations.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="consultas" className="mt-6 space-y-4">
              <div className="flex justify-end">
                <Dialog open={isConsultationDialogOpen} onOpenChange={setIsConsultationDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="size-4 mr-2" />
                      Nova Consulta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar Consulta</DialogTitle>
                      <DialogDescription>
                        Crie um novo registro de consulta para {patient.name}.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...consultationForm}>
                      <form onSubmit={consultationForm.handleSubmit(onConsultationSubmit)} className="space-y-4">
                        <FormField
                          control={consultationForm.control}
                          name="type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Consulta</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo..." />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={ConsultationInputType.avaliacao_inicial}>Avaliação Inicial</SelectItem>
                                  <SelectItem value={ConsultationInputType.reavaliacao}>Reavaliação</SelectItem>
                                  <SelectItem value={ConsultationInputType.cardapio}>Entrega de Cardápio</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={consultationForm.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data da Consulta</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex justify-end pt-4">
                          <Button type="submit" disabled={createConsultation.isPending}>
                            {createConsultation.isPending ? "Criando..." : "Criar Registro"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {isConsultationsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => <div key={i} className="h-24 bg-muted/50 rounded-lg animate-pulse" />)}
                </div>
              ) : consultations.length === 0 ? (
                <EmptyState 
                  icon={Calendar} 
                  title="Nenhuma consulta" 
                  description="Este paciente ainda não possui histórico de consultas." 
                />
              ) : (
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted before:to-transparent">
                  {consultations.map((consultation) => (
                    <div key={consultation.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-primary text-primary-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <Activity className="size-4" />
                      </div>
                      
                      <Card className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className="capitalize">
                              {formatConsultationType(consultation.type)}
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                              <Calendar className="size-3" />
                              {format(new Date(consultation.date), "dd MMM yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="flex gap-4 text-sm mt-2">
                            {consultation.weight && (
                              <div>
                                <span className="text-muted-foreground block text-xs">Peso</span>
                                <span className="font-semibold">{consultation.weight} kg</span>
                              </div>
                            )}
                            {consultation.bmi && (
                              <div>
                                <span className="text-muted-foreground block text-xs">IMC</span>
                                <span className="font-semibold">{consultation.bmi}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 border-t bg-muted/20">
                          <Button variant="ghost" size="sm" className="w-full text-primary hover:text-primary" asChild>
                            <Link href={`/pacientes/${patientId}/consultas/${consultation.id}`}>
                              Abrir Prontuário <ArrowRight className="size-4 ml-2" />
                            </Link>
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
