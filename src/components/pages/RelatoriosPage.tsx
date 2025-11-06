import { useMemo, useCallback } from "react";
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
import { useSCP } from "@/hooks/useSCP";

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
  const { provas, turmas, alunos, totals, listRespostasByProva, getGabaritoByProva } = useSCP();

  const getTurmaName = useCallback((turmaId: string) => {
    return turmas.find(t => t.id === turmaId)?.nome || turmaId;
  }, [turmas]);

  // Get all respostas with notas
  const allRespostasComNotas = useMemo(() => {
    return provas.flatMap(prova => {
      const respostas = listRespostasByProva(prova.id);
      return respostas.filter(r => typeof r.nota === "number");
    });
  }, [provas, listRespostasByProva]);

  // Calculate taxa de aprovação (notas >= 6)
  const taxaAprovacao = useMemo(() => {
    if (allRespostasComNotas.length === 0) return 0;
    const aprovados = allRespostasComNotas.filter(r => (r.nota || 0) >= 6).length;
    return (aprovados / allRespostasComNotas.length) * 100;
  }, [allRespostasComNotas]);

  // Calculate alunos avaliados (unique alunos with notas)
  const alunosAvaliados = useMemo(() => {
    const alunoIds = new Set(allRespostasComNotas.map(r => r.alunoId));
    return alunoIds.size;
  }, [allRespostasComNotas]);

  // Média por turma
  const mediaPorTurma = useMemo(() => {
    return totals.mediasPorTurma.map(item => {
      const turma = turmas.find(t => t.id === item.turmaId);
      return {
        turma: turma ? turma.nome : item.turmaId,
        media: item.media
      };
    });
  }, [totals.mediasPorTurma, turmas]);

  // Distribuição de notas
  const distribuicaoNotas = useMemo(() => {
    const faixas = [
      { faixa: "0-2.9", min: 0, max: 2.9, color: "hsl(var(--destructive))" },
      { faixa: "3-5.9", min: 3, max: 5.9, color: "hsl(var(--warning))" },
      { faixa: "6-7.9", min: 6, max: 7.9, color: "hsl(var(--info))" },
      { faixa: "8-10", min: 8, max: 10, color: "hsl(var(--success))" },
    ];

    return faixas.map(faixa => ({
      ...faixa,
      quantidade: allRespostasComNotas.filter(
        r => (r.nota || 0) >= faixa.min && (r.nota || 0) <= faixa.max
      ).length
    }));
  }, [allRespostasComNotas]);

  // Acerto por questão (across all provas)
  const acertoPorQuestao = useMemo(() => {
    const questaoStats: Record<number, { acertos: number; total: number }> = {};

    provas.forEach(prova => {
      const gabarito = getGabaritoByProva(prova.id);
      if (!gabarito) return;

      const respostas = listRespostasByProva(prova.id);
      respostas.forEach(resp => {
        resp.respostas.forEach((respostaAluno, idx) => {
          const gabResp = gabarito.respostas[idx];
          if (gabResp === "N") return;

          if (!questaoStats[idx]) {
            questaoStats[idx] = { acertos: 0, total: 0 };
          }

          questaoStats[idx].total++;
          if (respostaAluno === gabResp) {
            questaoStats[idx].acertos++;
          }
        });
      });
    });

    return Object.entries(questaoStats)
      .map(([idx, stats]) => ({
        questao: `Q${parseInt(idx) + 1}`,
        percentual: stats.total > 0 ? (stats.acertos / stats.total) * 100 : 0
      }))
      .sort((a, b) => parseInt(a.questao.slice(1)) - parseInt(b.questao.slice(1)));
  }, [provas, getGabaritoByProva, listRespostasByProva]);

  // Ranking de alunos
  const rankingAlunos = useMemo(() => {
    // Calculate average nota per aluno across all provas
    const alunoNotas: Record<string, { notas: number[]; alunoId: string }> = {};

    allRespostasComNotas.forEach(resp => {
      if (!alunoNotas[resp.alunoId]) {
        alunoNotas[resp.alunoId] = { notas: [], alunoId: resp.alunoId };
      }
      if (typeof resp.nota === "number") {
        alunoNotas[resp.alunoId].notas.push(resp.nota);
      }
    });

    const ranking = Object.values(alunoNotas)
      .map(({ alunoId, notas }) => {
        const aluno = alunos.find(a => a.id === alunoId);
        if (!aluno || notas.length === 0) return null;

        const mediaNota = notas.reduce((acc, n) => acc + n, 0) / notas.length;
        const percentual = (mediaNota / 10) * 100;

        return {
          alunoId,
          nome: aluno.nome,
          turma: getTurmaName(aluno.turmaId),
          nota: mediaNota,
          percentual
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => b.nota - a.nota)
      .slice(0, 8)
      .map((item, idx) => ({
        posicao: idx + 1,
        ...item
      }));

    return ranking;
  }, [allRespostasComNotas, alunos, getTurmaName]);

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
                    {turmas.map((turma) => (
                      <SelectItem key={turma.id} value={turma.id}>
                        {turma.nome}
                      </SelectItem>
                    ))}
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
                <p className="text-3xl">{totals.mediaGeral.toFixed(1)}</p>
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
                <p className="text-3xl">{taxaAprovacao.toFixed(0)}%</p>
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
                <p className="text-3xl">{totals.totalProvas}</p>
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
                <p className="text-3xl">{alunosAvaliados}</p>
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
            {mediaPorTurma.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum dado disponível
              </p>
            ) : (
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
            )}
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
            {distribuicaoNotas.every(d => d.quantidade === 0) ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum dado disponível
              </p>
            ) : (
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
            )}
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
          {acertoPorQuestao.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </p>
          ) : (
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
          )}
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
          {rankingAlunos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </p>
          ) : (
            <div className="space-y-3">
              {rankingAlunos.map((aluno) => (
                <div
                  key={aluno.alunoId}
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
                      {aluno.percentual.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
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
