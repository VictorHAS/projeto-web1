import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Upload,
  Edit3,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
}

interface Resposta {
  questao: number;
  resposta: string;
  correta: boolean;
}

interface Resultado {
  aluno: Aluno;
  respostas: Resposta[];
  nota: number;
  percentualAcertos: number;
}

// Mock data
const alunosData: Aluno[] = [
  { id: 1, nome: "João Silva", matricula: "202301" },
  { id: 2, nome: "Maria Santos", matricula: "202302" },
  { id: 3, nome: "Pedro Costa", matricula: "202303" },
  { id: 4, nome: "Ana Paula", matricula: "202304" },
  { id: 5, nome: "Carlos Eduardo", matricula: "202305" },
  { id: 6, nome: "Juliana Oliveira", matricula: "202306" },
];

const gabarito = ["A", "B", "C", "D", "E", "A", "B", "C", "D", "E"];

// Mock respostas já preenchidas para alguns alunos
const respostasIniciais: Record<number, string[]> = {
  1: ["A", "B", "C", "D", "E", "A", "B", "C", "D", "E"], // 100%
  2: ["A", "B", "C", "D", "E", "B", "B", "C", "D", "E"], // 90%
  3: ["A", "A", "C", "D", "E", "A", "C", "C", "D", "E"], // 80%
  4: ["B", "B", "C", "D", "E", "A", "B", "D", "D", "E"], // 70%
};

const alternativas = ["A", "B", "C", "D", "E"];

export function RespostasCorrecaoPage() {
  const [provaId, setProvaId] = useState<string>("1");
  const [respostas, setRespostas] = useState<Record<number, string[]>>(respostasIniciais);

  const handleSelectResposta = (alunoId: number, questaoIndex: number, alternativa: string) => {
    setRespostas(prev => {
      const alunoRespostas = prev[alunoId] || new Array(gabarito.length).fill("");
      const novasRespostas = [...alunoRespostas];
      novasRespostas[questaoIndex] = alternativa;
      return {
        ...prev,
        [alunoId]: novasRespostas
      };
    });
  };

  // Calcula resultados para a aba de correção
  const calcularResultados = (): Resultado[] => {
    return alunosData.map(aluno => {
      const respostasAluno = respostas[aluno.id] || new Array(gabarito.length).fill("");
      const respostasDetalhadas: Resposta[] = respostasAluno.map((resp, idx) => ({
        questao: idx + 1,
        resposta: resp,
        correta: resp !== "" && resp === gabarito[idx]
      }));

      const acertos = respostasDetalhadas.filter(r => r.correta).length;
      const percentualAcertos = respostasAluno.filter(r => r !== "").length > 0
        ? (acertos / gabarito.length) * 100
        : 0;
      const nota = (acertos / gabarito.length) * 10;

      return {
        aluno,
        respostas: respostasDetalhadas,
        nota: parseFloat(nota.toFixed(2)),
        percentualAcertos: parseFloat(percentualAcertos.toFixed(1))
      };
    });
  };

  const resultados = calcularResultados();
  const mediaGeral = resultados.reduce((acc, r) => acc + r.nota, 0) / resultados.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1>Respostas e Correção</h1>
          <p className="text-muted-foreground">
            Lance respostas e visualize a correção automática
          </p>
        </div>

        {/* Seletor de Prova */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Selecione a Prova
                </label>
                <Select value={provaId} onValueChange={setProvaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma prova" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">
                      Prova de Matemática - 1º Bimestre (Turma A)
                    </SelectItem>
                    <SelectItem value="2">
                      Prova de Português - 1º Bimestre (Turma B)
                    </SelectItem>
                    <SelectItem value="3">
                      Prova de História - 2º Bimestre (Turma C)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Questões
                </p>
                <p className="text-2xl">{gabarito.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="respostas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="respostas">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Respostas
          </TabsTrigger>
          <TabsTrigger value="correcao">
            <CheckCircle className="w-4 h-4 mr-2" />
            Correção
          </TabsTrigger>
        </TabsList>

        {/* Tab: Respostas */}
        <TabsContent value="respostas" className="space-y-6">
          {/* Ações */}
          <div className="flex gap-3">
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Importar CSV
            </Button>
            <Button variant="outline">
              <Edit3 className="w-4 h-4 mr-2" />
              Lançar Manualmente
            </Button>
          </div>

          {/* Planilha de Respostas */}
          <Card>
            <CardHeader>
              <CardTitle>Planilha de Respostas</CardTitle>
              <CardDescription>
                Clique nas células para selecionar as respostas de cada aluno
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="w-full">
                <div className="min-w-[800px]">
                  {/* Header */}
                  <div className="flex border-b border-border pb-2 mb-2">
                    <div className="w-48 pr-4">
                      <p className="text-muted-foreground">Aluno</p>
                    </div>
                    <div className="flex-1 flex gap-2">
                      {gabarito.map((_, idx) => (
                        <div key={idx} className="w-12 text-center">
                          <p className="text-muted-foreground">Q{idx + 1}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="space-y-2">
                    {alunosData.map((aluno) => {
                      const alunoRespostas = respostas[aluno.id] || new Array(gabarito.length).fill("");

                      return (
                        <div key={aluno.id} className="flex items-center py-2 border-b border-border">
                          <div className="w-48 pr-4">
                            <p>{aluno.nome}</p>
                            <p className="text-muted-foreground">
                              {aluno.matricula}
                            </p>
                          </div>
                          <div className="flex-1 flex gap-2">
                            {gabarito.map((gabaritoResp, questaoIdx) => {
                              const respostaAluno = alunoRespostas[questaoIdx];
                              const temResposta = respostaAluno !== "";
                              const isCorreta = temResposta && respostaAluno === gabaritoResp;
                              const isErrada = temResposta && respostaAluno !== gabaritoResp;

                              return (
                                <div key={questaoIdx} className="relative group">
                                  <div
                                    className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-colors ${
                                      isCorreta
                                        ? "bg-success/10 border-success text-success"
                                        : isErrada
                                        ? "bg-destructive/10 border-destructive text-destructive"
                                        : "border-border hover:border-primary"
                                    }`}
                                  >
                                    <p>
                                      {respostaAluno || "-"}
                                    </p>
                                  </div>

                                  {/* Dropdown de alternativas */}
                                  <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-1 z-10">
                                    {alternativas.map((alt) => (
                                      <button
                                        key={alt}
                                        onClick={() => handleSelectResposta(aluno.id, questaoIdx, alt)}
                                        className="w-10 h-10 hover:bg-accent rounded flex items-center justify-center"
                                      >
                                        {alt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Correção */}
        <TabsContent value="correcao" className="space-y-6">
          {/* Ações e Resumo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <Card className="flex-1 w-full sm:w-auto">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Média Geral</p>
                    <p className="text-3xl">{mediaGeral.toFixed(2)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reprocessar Notas
            </Button>
          </div>

          {/* Tabela de Resultados */}
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Correção</CardTitle>
              <CardDescription>
                Notas e percentuais de acerto de cada aluno
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {resultados.map((resultado) => {
                const acertos = resultado.respostas.filter(r => r.correta).length;
                const erros = resultado.respostas.filter(r => r.resposta !== "" && !r.correta).length;
                const semResposta = resultado.respostas.filter(r => r.resposta === "").length;

                return (
                  <div
                    key={resultado.aluno.id}
                    className="p-4 rounded-lg border border-border space-y-3"
                  >
                    {/* Header do Aluno */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p>{resultado.aluno.nome}</p>
                        <p className="text-muted-foreground">
                          {resultado.aluno.matricula}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-muted-foreground">Nota</p>
                          <p className="text-2xl">{resultado.nota}</p>
                        </div>
                        <Badge
                          variant={resultado.nota >= 6 ? "default" : "destructive"}
                          className="text-lg px-3 py-1"
                        >
                          {resultado.percentualAcertos}%
                        </Badge>
                      </div>
                    </div>

                    {/* Barra de Progresso */}
                    <Progress value={resultado.percentualAcertos} className="h-3" />

                    {/* Estatísticas */}
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        <span className="text-success">{acertos} acertos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-destructive" />
                        <span className="text-destructive">{erros} erros</span>
                      </div>
                      {semResposta > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">
                            {semResposta} sem resposta
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Distribuição de Notas */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Notas</CardTitle>
              <CardDescription>
                Quantidade de alunos por faixa de nota
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { faixa: "0-2.9", min: 0, max: 2.9, color: "bg-destructive" },
                  { faixa: "3-5.9", min: 3, max: 5.9, color: "bg-warning" },
                  { faixa: "6-7.9", min: 6, max: 7.9, color: "bg-info" },
                  { faixa: "8-10", min: 8, max: 10, color: "bg-success" },
                ].map((faixa) => {
                  const count = resultados.filter(
                    r => r.nota >= faixa.min && r.nota <= faixa.max
                  ).length;

                  return (
                    <div key={faixa.faixa} className="text-center p-4 rounded-lg border border-border">
                      <div className={`w-16 h-16 ${faixa.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white`}>
                        <p className="text-2xl">{count}</p>
                      </div>
                      <p className="text-muted-foreground">
                        Nota {faixa.faixa}
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
