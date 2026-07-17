import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, FolderHeart, Activity, ChevronRight, CalendarClock } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="size-4 bg-muted rounded-full"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded mt-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary font-display">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral do seu consultório.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/biblioteca">Nova Publicação</Link>
          </Button>
          <Button asChild>
            <Link href="/pacientes">Novo Paciente</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Consultas Realizadas</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalConsultations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Publicações na Biblioteca</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalPublications || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Grupos Ativos</CardTitle>
            <FolderHeart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{stats.totalGroups || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 border-t-4 border-t-primary shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Consultas Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground -mr-2">
                <Link href="/pacientes">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentConsultations.length === 0 ? (
              <EmptyState 
                icon={CalendarClock}
                title="Nenhuma consulta recente" 
                description="Suas consultas mais recentes aparecerão aqui."
              />
            ) : (
              <div className="space-y-4">
                {stats.recentConsultations.map((consultation) => (
                  <Link 
                    key={consultation.id} 
                    href={`/pacientes/${consultation.patientId}/consultas/${consultation.id}`}
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Activity className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{consultation.patientName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground capitalize">
                              {consultation.type.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] text-muted-foreground/50">•</span>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(consultation.date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pacientes Recentes</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground -mr-2">
                <Link href="/pacientes">Ver todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentPatients.length === 0 ? (
              <EmptyState 
                icon={Users}
                title="Nenhum paciente" 
                description="Cadastre seu primeiro paciente para começar."
                actionLabel="Novo Paciente"
                onAction={() => window.location.href = '/pacientes'}
              />
            ) : (
              <div className="space-y-4">
                {stats.recentPatients.map((patient) => (
                  <Link 
                    key={patient.id} 
                    href={`/pacientes/${patient.id}`}
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-semibold font-display">
                          {patient.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{patient.name}</p>
                          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">{patient.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
