import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, Calendar, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSCP } from "@/hooks/useSCP";

export function DashboardPage() {
  const { provas, turmas, totals } = useSCP();

  const getTurmaName = (turmaId: string) => {
    return turmas.find(t => t.id === turmaId)?.nome || turmaId;
  };

  const recentProvas = useMemo(() => {
    return [...provas]
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      .slice(0, 3);
  }, [provas]);

  const upcomingProvas = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...provas]
      .filter(p => {
        const provaDate = new Date(p.data);
        provaDate.setHours(0, 0, 0, 0);
        return provaDate >= today;
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
      .slice(0, 3);
  }, [provas]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCalendarDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("pt-BR", { month: "short" }).toUpperCase();
    return { day, month };
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1>Bem-vindo ao Sistema</h1>
        <p className="text-muted-foreground">
          Visão geral das atividades e estatísticas do sistema
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1 - Total de Turmas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total de Turmas</CardTitle>
            <Users className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-4xl">{totals.totalTurmas}</p>
              <p className="text-muted-foreground">
                turmas ativas no sistema
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 - Total de Provas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total de Provas</CardTitle>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-4xl">{totals.totalProvas}</p>
              <p className="text-muted-foreground">
                provas cadastradas no sistema
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 - Média Geral */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Média Geral</CardTitle>
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-4xl">{totals.mediaGeral.toFixed(1)}</p>
              <p className="text-muted-foreground">
                média de todas as turmas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provas Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Provas Recentes</CardTitle>
            <CardDescription>Últimas provas cadastradas no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProvas.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma prova cadastrada
              </p>
            ) : (
              recentProvas.map((prova) => (
                <div key={prova.id} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    prova.corrigida ? "bg-success/10" : "bg-warning/10"
                  }`}>
                    {prova.corrigida ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <Clock className="w-5 h-5 text-warning" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p>{prova.titulo} - {getTurmaName(prova.turmaId)}</p>
                    <p className="text-muted-foreground">
                      {prova.corrigida
                        ? `Aplicada em ${formatDate(prova.data)}`
                        : "Pendente de correção"
                      }
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Estatísticas por Turma */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Turma</CardTitle>
            <CardDescription>Média de notas das turmas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {totals.mediasPorTurma.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Nenhuma média disponível
              </p>
            ) : (
              totals.mediasPorTurma.map((item) => {
                const turma = turmas.find(t => t.id === item.turmaId);
                if (!turma) return null;
                const progressValue = (item.media / 10) * 100;
                return (
                  <div key={item.turmaId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p>{turma.nome} - {turma.ano}</p>
                      <p className="text-muted-foreground">{item.media.toFixed(1)}</p>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Provas Agendadas</CardTitle>
          <CardDescription>Calendário de provas para os próximos dias</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingProvas.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Nenhuma prova agendada
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingProvas.map((prova) => {
                const { day, month } = formatCalendarDate(prova.data);
                return (
                  <div key={prova.id} className="flex gap-4 p-4 rounded-lg border border-border items-center">
                    <div className="flex items-center justify-center w-20 h-20 bg-primary/10 rounded-lg">
                      <Calendar className="w-6 h-6 text-primary" />
                      <div className="flex flex-col items-center justify-center ml-2">
                        <p className="text-primary text-2xl">{day}</p>
                        <p className="text-muted-foreground text-sm">{month}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p>{prova.titulo}</p>
                      <p className="text-muted-foreground">
                        {getTurmaName(prova.turmaId)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
