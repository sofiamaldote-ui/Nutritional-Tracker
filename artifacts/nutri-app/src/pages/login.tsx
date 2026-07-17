import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin, AuthUserRole } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NutriSpaceLogo } from "@/components/nutrispace-logo";
import { Link } from "wouter";
import { useEffect } from "react";

const formSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export default function LoginPage() {
  const { user, refetch } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const login = useLogin();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      if (user.role === AuthUserRole.nutricionista) {
        setLocation("/dashboard");
      } else {
        setLocation("/portal");
      }
    }
  }, [user, setLocation]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    login.mutate({ data: values }, {
      onSuccess: (data) => {
        toast({
          title: "Login realizado com sucesso",
          description: `Bem-vindo(a), ${data.name}!`,
        });
        refetch();
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: "E-mail ou senha incorretos.",
        });
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 flex flex-col items-center justify-center">
          <NutriSpaceLogo size={96} className="mb-2" variant="light" />
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">NutriSpace</h1>
          <p className="text-muted-foreground mt-2">Acesso ao sistema</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Insira suas credenciais para acessar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="seu@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={login.isPending}>
                  {login.isPending ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Primeiro acesso como nutricionista?{" "}
                <Link href="/setup" className="font-semibold text-primary hover:underline">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
