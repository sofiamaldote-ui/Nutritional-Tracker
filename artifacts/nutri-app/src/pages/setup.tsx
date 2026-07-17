import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterNutritionist } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NutriSpaceLogo } from "@/components/nutrispace-logo";
import { Link } from "wouter";

const formSchema = z.object({
  name: z.string().min(2, "O nome deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export default function SetupPage() {
  const { refetch } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const register = useRegisterNutritionist();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    register.mutate({ data: { name: values.name, email: values.email, password: values.password } }, {
      onSuccess: () => {
        toast({
          title: "Conta criada com sucesso",
          description: "Bem-vindo(a) ao NutriSpace!",
        });
        refetch();
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        if (err?.status === 409) {
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: "Já existe um nutricionista cadastrado. Faça login.",
          });
          setLocation("/login");
        } else {
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: "Ocorreu um erro ao criar a conta.",
          });
        }
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-[450px]">
        <div className="mb-8 flex flex-col items-center justify-center">
          <NutriSpaceLogo size={96} className="mb-2" />
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">NutriSpace</h1>
          <p className="text-muted-foreground mt-2 text-center">Configuração inicial da conta do Nutricionista</p>
        </div>

        <Card className="border-border shadow-lg">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
            <CardDescription>
              Preencha seus dados para configurar a plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Dra. Maria Silva" {...field} />
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={register.isPending}>
                  {register.isPending ? "Criando conta..." : "Criar conta"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Já possui conta?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
