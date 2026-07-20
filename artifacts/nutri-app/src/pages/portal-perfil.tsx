import { useGetMyProfile, useChangeMyPassword } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { UserCircle, Mail, Phone, Calendar, Users, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const passSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function PortalPerfilPage() {
  const { data: profile, isLoading, isError } = useGetMyProfile();
  const { toast } = useToast();
  const changePassword = useChangeMyPassword();

  const form = useForm<z.infer<typeof passSchema>>({
    resolver: zodResolver(passSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof passSchema>) => {
    changePassword.mutate({
      data: {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      }
    }, {
      onSuccess: () => {
        toast({ title: "Senha alterada com sucesso" });
        form.reset();
      },
      onError: () => toast({ variant: "destructive", title: "Erro ao alterar senha", description: "Verifique sua senha atual." })
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="size-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex justify-center py-20">
        <p className="text-muted-foreground">Não foi possível carregar seu perfil. Tente novamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-4xl mx-auto">
      <div className="text-center md:text-left mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Meu Perfil</h1>
        <p className="text-muted-foreground mt-2">Visualize seus dados cadastrais.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 shadow-sm h-fit">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="size-32 border-4 border-muted">
                <AvatarFallback className="text-4xl font-bold bg-primary/10 text-primary">
                  {profile.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold font-display">{profile.name}</h2>
                <p className="text-muted-foreground text-sm">Paciente desde {format(new Date(profile.createdAt), "yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle className="size-5" /> Dados Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-y-6 gap-x-8">
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2"><Mail className="size-4" /> E-mail</Label>
                <p className="font-medium text-foreground">{profile.email}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2"><Phone className="size-4" /> Telefone</Label>
                <p className="font-medium text-foreground">{profile.phone || "Não informado"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2"><Calendar className="size-4" /> Nascimento</Label>
                <p className="font-medium text-foreground">{profile.birthDate ? format(new Date(profile.birthDate), "dd/MM/yyyy") : "Não informado"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground flex items-center gap-2"><Users className="size-4" /> Grupos de Acompanhamento</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {profile.groups && profile.groups.length > 0 ? (
                    profile.groups.map(g => (
                      <Badge key={g.id} variant="secondary" className="font-normal" style={{ color: g.color, borderColor: g.color, backgroundColor: `${g.color}15` }}>
                        {g.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm font-medium">Nenhum</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><KeyRound className="size-5" /> Segurança</CardTitle>
              <CardDescription>Alterar senha de acesso ao portal</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={changePassword.isPending}>
                    {changePassword.isPending ? "Alterando..." : "Salvar Nova Senha"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}