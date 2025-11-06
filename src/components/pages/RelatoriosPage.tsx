import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileDown, FileText, Trophy, TrendingUp, Target, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Mock data para gráficos
const mediaPorTurma = [
  { turma: "Turma A", media: 8.2 },
  { turma: "Turma B", media: 7.5 },
  { turma: "Turma C", media: 6.8 },
  { turma: "Turma D", media: 7.9 },
  { turma: "Turma E", media: 8.5 },
];

const distribuicaoNotas = [
  { faixa: "0-2.9", quantidade: 2, color: "hsl(var(--destructive))" },
  { faixa: "3-5.9", quantidade: 5, color: "hsl(var(--warning))" },
  { faixa: "6-7.9", quantidade: 8, color: "hsl(var(--info))" },
  { faixa: "8-10", quantidade: 12, color: "hsl(var(--success))" },
];

const acertoPorQuestao = [
  { questao: "Q1", percentual: 85 },
  { questao: "Q2", percentual: 92 },
  { questao: "Q3", percentual: 78 },
  { questao: "Q4", percentual: 65 },
  { questao: "Q5", percentual: 88 },
  { questao: "Q6", percentual: 70 },
  { questao: "Q7", percentual: 95 },
  { questao: "Q8", percentual: 82 },
  { questao: "Q9", percentual: 76 },
  { questao: "Q10", percentual: 90 },
];

const rankingAlunos = [
  { posicao: 1, nome: "João Silva", turma: "Turma A", nota: 10.0, percentual: 100 },
  { posicao: 2, nome: "Maria Santos", turma: "Turma E", nota: 9.5, percentual: 95 },
  { posicao: 3, nome: "Pedro Costa", turma: "Turma A", nota: 9.2, percentual: 92 },
  { posicao: 4, nome: "Ana Paula", turma: "Turma B", nota: 9.0, percentual: 90 },
  { posicao: 5, nome: "Carlos Eduardo", turma: "Turma D", nota: 8.8, percentual: 88 },
  { posicao: 6, nome: "Juliana Oliveira", turma: "Turma C", nota: 8.5, percentual: 85 },
  { posicao: 7, nome: "Rafael Mendes", turma: "Turma E", nota: 8.2, percentual: 82 },
  { posicao: 8, nome: "Beatriz Lima", turma: "Turma B", nota: 8.0, percentual: 80 },
];

const chartConfig = {
  media: {
    label: "Média",
    color: "hsl(var(--primary))",
  },
  percentual: {
    label: "Percentual de Acerto",
    color: "hsl(var(--success))",
  },
};

export function RelatoriosPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1>Relatórios e Análises</h1>
            <p className="text-muted-foreground">
              Visualize o desempenho geral e exporte dados
            </p>
          </div>

          {/* Botões de Exportação */}
          <div className="flex gap-3">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            <Button variant="outline">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Período
                </label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="1bim">1º Bimestre</SelectItem>
                    <SelectItem value="2bim">2º Bimestre</SelectItem>
                    <SelectItem value="3bim">3º Bimestre</SelectItem>
                    <SelectItem value="4bim">4º Bimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Turma
                </label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as turmas</SelectItem>
                    <SelectItem value="a">Turma A</SelectItem>
                    <SelectItem value="b">Turma B</SelectItem>
                    <SelectItem value="c">Turma C</SelectItem>
                    <SelectItem value="d">Turma D</SelectItem>
                    <SelectItem value="e">Turma E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Disciplina
                </label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a disciplina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as disciplinas</SelectItem>
                    <SelectItem value="mat">Matemática</SelectItem>
                    <SelectItem value="port">Português</SelectItem>
                    <SelectItem value="hist">História</SelectItem>
                    <SelectItem value="geo">Geografia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-muted-foreground">Média Geral</p>
                <p className="text-3xl">7.8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-muted-foreground">Taxa de Aprovação</p>
                <p className="text-3xl">86%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-muted-foreground">Provas Aplicadas</p>
                <p className="text-3xl">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-muted-foreground">Alunos Avaliados</p>
                <p className="text-3xl">156</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Primeira Linha */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Média por Turma */}
        <Card>
          <CardHeader>
            <CardTitle>Média por Turma</CardTitle>
            <CardDescription>
              Desempenho médio de cada turma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={mediaPorTurma}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="turma"
                    className="text-muted-foreground"
                  />
                  <YAxis
                    domain={[0, 10]}
                    className="text-muted-foreground"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="media"
                    fill="hsl(var(--primary))"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Notas</CardTitle>
            <CardDescription>
              Quantidade de alunos por faixa de nota
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={distribuicaoNotas}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ faixa, quantidade }) => `${faixa}: ${quantidade}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="quantidade"
                  >
                    {distribuicaoNotas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico - Acerto por Questão */}
      <Card>
        <CardHeader>
          <CardTitle>Percentual de Acerto por Questão</CardTitle>
          <CardDescription>
            Análise de dificuldade de cada questão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={acertoPorQuestao}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="questao"
                  className="text-muted-foreground"
                />
                <YAxis
                  domain={[0, 100]}
                  className="text-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="percentual"
                  fill="hsl(var(--success))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Ranking de Alunos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            Ranking dos Melhores Alunos
          </CardTitle>
          <CardDescription>
            Top 8 alunos com melhor desempenho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rankingAlunos.map((aluno) => (
              <div
                key={aluno.posicao}
                className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                {/* Posição */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    aluno.posicao === 1
                      ? "bg-warning text-warning-foreground"
                      : aluno.posicao === 2
                      ? "bg-muted-foreground/20"
                      : aluno.posicao === 3
                      ? "bg-warning/30"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-xl">{aluno.posicao}º</p>
                </div>

                {/* Info do Aluno */}
                <div className="flex-1">
                  <p>{aluno.nome}</p>
                  <p className="text-muted-foreground">
                    {aluno.turma}
                  </p>
                </div>

                {/* Nota e Percentual */}
                <div className="text-right">
                  <p className="text-2xl">{aluno.nota.toFixed(1)}</p>
                  <Badge variant="default">
                    {aluno.percentual}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rodapé de Exportação */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p>Exportar dados completos</p>
              <p className="text-muted-foreground">
                Gere relatórios detalhados em PDF ou planilhas CSV
              </p>
            </div>
            <div className="flex gap-3">
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Gerar PDF Completo
              </Button>
              <Button variant="outline">
                <FileDown className="w-4 h-4 mr-2" />
                Baixar CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
