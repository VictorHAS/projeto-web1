import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, TrendingUp, Calendar, CheckCircle, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function DashboardPage() {
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
              <p className="text-4xl">12</p>
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
              <p className="text-4xl">48</p>
              <p className="text-muted-foreground">
                provas aplicadas este mês
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
              <p className="text-4xl">7.5</p>
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
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p>Prova de Matemática - Turma A</p>
                <p className="text-muted-foreground">
                  Aplicada em 28/10/2025
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success" />
              </div>
              <div className="flex-1">
                <p>Prova de Português - Turma B</p>
                <p className="text-muted-foreground">
                  Aplicada em 25/10/2025
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <p>Prova de História - Turma C</p>
                <p className="text-muted-foreground">
                  Pendente de correção
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas por Turma */}
        <Card>
          <CardHeader>
            <CardTitle>Desempenho por Turma</CardTitle>
            <CardDescription>Média de notas das turmas principais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p>Turma A - 2025</p>
                <p className="text-muted-foreground">8.2</p>
              </div>
              <Progress value={82} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p>Turma B - 2025</p>
                <p className="text-muted-foreground">7.5</p>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p>Turma C - 2025</p>
                <p className="text-muted-foreground">6.8</p>
              </div>
              <Progress value={68} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p>Turma D - 2025</p>
                <p className="text-muted-foreground">7.9</p>
              </div>
              <Progress value={79} className="h-2" />
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex gap-4 p-4 rounded-lg border border-border">
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary mb-1" />
                <p className="text-primary">06</p>
                <p className="text-muted-foreground">NOV</p>
              </div>
              <div className="flex-1">
                <p>Prova de Química</p>
                <p className="text-muted-foreground">Turma A • 14:00</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg border border-border">
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary mb-1" />
                <p className="text-primary">08</p>
                <p className="text-muted-foreground">NOV</p>
              </div>
              <div className="flex-1">
                <p>Prova de Física</p>
                <p className="text-muted-foreground">Turma B • 10:00</p>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-lg border border-border">
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary mb-1" />
                <p className="text-primary">10</p>
                <p className="text-muted-foreground">NOV</p>
              </div>
              <div className="flex-1">
                <p>Prova de Geografia</p>
                <p className="text-muted-foreground">Turma C • 16:00</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
