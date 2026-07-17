import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { 
  useGetGroup, 
  useUpdateGroup, 
  useDeleteGroup,
  useAddGroupMember,
  useRemoveGroupMember,
  useListPatients,
  getGetGroupQueryKey,
  getListPatientsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Trash2, Users, UserPlus, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { EmptyState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function GrupoDetailPage() {
  const { id } = useParams();
  const groupId = Number(id);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [search, setSearch] = useState("");

  const { data: group, isLoading: isGroupLoading } = useGetGroup(groupId);
  const { data: allPatients = [] } = useListPatients(
    { search: search || undefined },
    { query: { enabled: isAddMemberOpen, queryKey: getListPatientsQueryKey({ search: search || undefined }) } }
  );
  
  const updateGroup = useUpdateGroup();
  const deleteGroup = useDeleteGroup();
  const addMember = useAddGroupMember();
  const removeMember = useRemoveGroupMember();

  const [editForm, setEditForm] = useState({ name: "", color: "", description: "" });

  const handleEditOpen = () => {
    if (group) {
      setEditForm({ name: group.name, color: group.color, description: group.description || "" });
      setIsEditOpen(true);
    }
  };

  const handleEditSubmit = () => {
    updateGroup.mutate({ id: groupId, data: editForm }, {
      onSuccess: () => {
        toast({ title: "Grupo atualizado" });
        queryClient.invalidateQueries({ queryKey: getGetGroupQueryKey(groupId) });
        setIsEditOpen(false);
      }
    });
  };

  const handleDelete = () => {
    deleteGroup.mutate({ id: groupId }, {
      onSuccess: () => {
        toast({ title: "Grupo removido" });
        setLocation("/grupos");
      }
    });
  };

  const handleAddMember = (patientId: number) => {
    addMember.mutate({ id: groupId, data: { patientId } }, {
      onSuccess: () => {
        toast({ title: "Paciente adicionado" });
        queryClient.invalidateQueries({ queryKey: getGetGroupQueryKey(groupId) });
      }
    });
  };

  const handleRemoveMember = (patientId: number) => {
    removeMember.mutate({ id: groupId, patientId }, {
      onSuccess: () => {
        toast({ title: "Paciente removido" });
        queryClient.invalidateQueries({ queryKey: getGetGroupQueryKey(groupId) });
      }
    });
  };

  if (isGroupLoading || !group) {
    return <div className="h-32 flex items-center justify-center"><div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" /></div>;
  }

  const memberIds = new Set(group.members.map(m => m.id));
  const availablePatients = allPatients.filter(p => !memberIds.has(p.id));

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link href="/grupos"><ArrowLeft className="size-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <div className="size-4 rounded-full" style={{ backgroundColor: group.color }} />
              <h1 className="text-3xl font-bold tracking-tight text-primary font-display">{group.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1 ml-7">{group.description || "Nenhuma descrição."}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditOpen}>
            <Edit2 className="size-4 mr-2" /> Editar
          </Button>
          <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
            <Trash2 className="size-4 mr-2" /> Excluir
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <div className="space-y-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Users className="size-5 text-primary" /> 
              Membros do Grupo
            </CardTitle>
            <CardDescription>{group.members.length} pacientes vinculados</CardDescription>
          </div>
          <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-9">
                <UserPlus className="size-4 mr-2" /> Adicionar Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Vincular Paciente</DialogTitle>
                <DialogDescription>Selecione os pacientes para adicionar a este grupo.</DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="relative mb-4">
                  <Input 
                    placeholder="Buscar paciente..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {availablePatients.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">Nenhum paciente disponível.</p>
                  ) : (
                    availablePatients.map(patient => (
                      <div key={patient.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">{patient.name.substring(0,2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{patient.name}</span>
                        </div>
                        <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10" onClick={() => handleAddMember(patient.id)}>
                          <Plus className="size-4 mr-1" /> Adicionar
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          {group.members.length === 0 ? (
            <div className="p-10 border-t-0">
              <EmptyState 
                icon={Users}
                title="Grupo vazio"
                description="Este grupo ainda não possui pacientes vinculados."
              />
            </div>
          ) : (
            <div className="divide-y">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-10 border border-muted">
                      <AvatarFallback className="bg-background text-foreground font-semibold">{member.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/pacientes/${member.id}`}>Ver Perfil</Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleRemoveMember(member.id)}>
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Grupo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Grupo</Label>
              <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                <Input type="color" className="w-12 h-10 p-1" value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})} />
                <Input type="text" className="flex-1 uppercase font-mono" value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={handleEditSubmit} disabled={updateGroup.isPending}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Grupo</DialogTitle>
            <DialogDescription>
              Tem certeza? Esta ação não pode ser desfeita. Os pacientes <strong>não</strong> serão excluídos, apenas desvinculados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteGroup.isPending}>Sim, Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
