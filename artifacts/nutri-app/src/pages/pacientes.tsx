import { useState } from "react";
import { useListPatients, useCreatePatient, useDeletePatient, useUpdatePatient, PatientInputSex, Patient, getListPatientsQueryKey } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, UserPlus, MoreHorizontal, Eye, Trash2, Pencil } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const patientSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  sex: z.enum([PatientInputSex.masculino, PatientInputSex.feminino, PatientInputSex.outro]).optional(),
});

const editPatientSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório"),
  phone: z.string().optional(),
  birthDate: z.string().optional(),
  sex: z.enum([PatientInputSex.masculino, PatientInputSex.feminino, PatientInputSex.outro]).optional(),
});

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [createdPatientData, setCreatedPatientData] = useState<{name: string, password: string} | null>(null);
  const [patientToDelete, setPatientToDelete] = useState<{id: number, name: string} | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: patients = [], isLoading } = useListPatients({ search: debouncedSearch || undefined });
  const createPatient = useCreatePatient();
  const deletePatient = useDeletePatient();
  const updatePatient = useUpdatePatient();

  const editForm = useForm<z.infer<typeof editPatientSchema>>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: { name: "", phone: "", birthDate: "", sex: undefined },
  });

  const openEditSheet = (patient: Patient) => {
    setPatientToEdit(patient);
    editForm.reset({
      name: patient.name,
      phone: patient.phone ?? "",
      birthDate: patient.birthDate ?? "",
      sex: (patient.sex as any) ?? undefined,
    });
  };

  const handleEditSubmit = (values: z.infer<typeof editPatientSchema>) => {
    if (!patientToEdit) return;
    updatePatient.mutate({
      id: patientToEdit.id,
      data: {
        name: values.name,
        phone: values.phone || null,
        birthDate: values.birthDate || null,
        sex: values.sex || null,
      },
    }, {
      onSuccess: () => {
        toast({ title: "Dados atualizados com sucesso!" });
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setPatientToEdit(null);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Erro ao atualizar paciente." });
      },
    });
  };

  const handleDelete = () => {
    if (!patientToDelete) return;
    deletePatient.mutate({ id: patientToDelete.id }, {
      onSuccess: () => {
        toast({ title: "Paciente removido com sucesso." });
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setPatientToDelete(null);
      },
      onError: () => {
        toast({ variant: "destructive", title: "Erro ao remover paciente." });
      },
    });
  };

  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birthDate: "",
      sex: undefined,
    },
  });

  const onSubmit = (values: z.infer<typeof patientSchema>) => {
    createPatient.mutate({
      data: {
        ...values,
        sex: values.sex || undefined,
      }
    }, {
      onSuccess: (res) => {
        toast({ title: "Paciente cadastrado com sucesso!" });
        queryClient.invalidateQueries({ queryKey: getListPatientsQueryKey() });
        setIsSheetOpen(false);
        form.reset();
        setCreatedPatientData({ name: res.patient.name, password: res.provisionalPassword });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Erro ao cadastrar paciente" });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Pacientes</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus pacientes e acessos.</p>
        </div>
        
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <Plus className="size-4" />
              Novo Paciente
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Cadastrar Paciente</SheetTitle>
              <SheetDescription>
                Preencha os dados do paciente. Uma senha provisória será gerada.
              </SheetDescription>
            </SheetHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: João da Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Ex: joao@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexo Biológico</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={PatientInputSex.masculino}>Masculino</SelectItem>
                          <SelectItem value={PatientInputSex.feminino}>Feminino</SelectItem>
                          <SelectItem value={PatientInputSex.outro}>Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4">
                  <Button type="submit" className="w-full" disabled={createPatient.isPending}>
                    {createPatient.isPending ? "Salvando..." : "Salvar e Gerar Acesso"}
                  </Button>
                </div>
              </form>
            </Form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : patients.length === 0 ? (
        <EmptyState 
          icon={UserPlus}
          title={search ? "Nenhum resultado" : "Nenhum paciente"}
          description={search ? "Tente buscar com outros termos." : "Você ainda não possui pacientes cadastrados."}
          actionLabel={search ? undefined : "Cadastrar Primeiro Paciente"}
          onAction={search ? undefined : () => setIsSheetOpen(true)}
        />
      ) : (
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Status de Acesso</TableHead>
                <TableHead>Grupos</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {patient.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{patient.name}</span>
                        <span className="text-xs text-muted-foreground">{patient.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {patient.hasAccess ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Sem acesso
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {patient.groups && patient.groups.length > 0 ? (
                        patient.groups.map(group => (
                          <Badge key={group.id} variant="outline" style={{ borderColor: group.color, color: group.color, backgroundColor: `${group.color}10` }}>
                            {group.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(patient.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/pacientes/${patient.id}`} className="flex items-center gap-2 cursor-pointer">
                            <Eye className="size-4" />
                            Ver detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 cursor-pointer"
                          onSelect={() => openEditSheet(patient)}
                        >
                          <Pencil className="size-4" />
                          Editar dados
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive flex items-center gap-2 cursor-pointer"
                          onSelect={() => setPatientToDelete({ id: patient.id, name: patient.name })}
                        >
                          <Trash2 className="size-4" />
                          Excluir paciente
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir paciente</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{patientToDelete?.name}</strong>? Esta ação removerá o paciente, seu acesso ao portal e todos os dados vinculados. Ela não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPatientToDelete(null)} disabled={deletePatient.isPending}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deletePatient.isPending}>
              {deletePatient.isPending ? "Removendo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Sheet */}
      <Sheet open={!!patientToEdit} onOpenChange={(open) => !open && setPatientToEdit(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Editar Paciente</SheetTitle>
            <SheetDescription>
              Atualize os dados de <strong>{patientToEdit?.name}</strong>. O e-mail de acesso não pode ser alterado.
            </SheetDescription>
          </SheetHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium">E-mail</FormLabel>
                <Input value={patientToEdit?.email ?? ""} disabled className="bg-muted text-muted-foreground" />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
              </div>
              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo Biológico</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value ?? ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={PatientInputSex.masculino}>Masculino</SelectItem>
                        <SelectItem value={PatientInputSex.feminino}>Feminino</SelectItem>
                        <SelectItem value={PatientInputSex.outro}>Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-4 flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setPatientToEdit(null)}>
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={updatePatient.isPending}>
                  {updatePatient.isPending ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Provisional Password Dialog */}
      <Dialog open={!!createdPatientData} onOpenChange={(open) => !open && setCreatedPatientData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paciente Cadastrado</DialogTitle>
            <DialogDescription>
              Acesso criado para {createdPatientData?.name}. Anote a senha provisória abaixo e repasse ao paciente. O paciente será solicitado a trocar a senha no primeiro acesso.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-4 rounded-lg flex items-center justify-center my-4">
            <span className="text-2xl font-mono tracking-widest font-bold text-foreground">
              {createdPatientData?.password}
            </span>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setCreatedPatientData(null)}>Concluir</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
