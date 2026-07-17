import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChangeMyPassword, useGetMe } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { KeyRound, Mail, User } from "lucide-react";

const passSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function ConfiguracoesPage() {
  const { data: user } = useGetMe();
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

  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie os dados da sua conta.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Informações básicas da conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                {user.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{user.name}</p>
              <p className="text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2"><User className="size-4" /> Nome</Label>
              <p className="font-medium bg-muted/50 p-2 rounded-md">{user.name}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground flex items-center gap-2"><Mail className="size-4" /> E-mail</Label>
              <p className="font-medium bg-muted/50 p-2 rounded-md">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="size-5" /> Alterar Senha</CardTitle>
          <CardDescription>Mantenha sua conta segura atualizando sua senha regularmente.</CardDescription>
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
  );
}

// Needed imports missed initially
import { Label } from "@/components/ui/label";