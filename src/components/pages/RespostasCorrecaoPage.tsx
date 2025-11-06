import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSCP } from "@/hooks/useSCP";
import type { Aluno, Alt } from "@/domain/models";

interface Resposta {
  questao: number;
  resposta: Alt | "";
  correta: boolean;
}

interface Resultado {
  aluno: Aluno;
  respostas: Resposta[];
  nota: number;
  percentualAcertos: number;
}

const alternativas: Alt[] = ["A", "B", "C", "D", "E"];

export function RespostasCorrecaoPage() {
  const { provas, listAlunos, getGabaritoByProva, listRespostasByProva, saveRespostas } = useSCP();
  const [selectedProvaId, setSelectedProvaId] = useState<string>("");
  const [respostas, setRespostas] = useState<Record<string, (Alt | "")[]>>({});

  const selectedProva = useMemo(() => {
    return provas.find(p => p.id === selectedProvaId);
  }, [provas, selectedProvaId]);

  const alunos = useMemo(() => {
    if (!selectedProva) return [];
    return listAlunos(selectedProva.turmaId);
  }, [selectedProva, listAlunos]);

  const gabarito = useMemo(() => {
    if (!selectedProvaId) return null;
    const gab = getGabaritoByProva(selectedProvaId);
    return gab ? gab.respostas : null;
  }, [selectedProvaId, getGabaritoByProva]);

  // Load existing respostas when prova changes
  useEffect(() => {
    if (!selectedProvaId || !selectedProva) {
      setRespostas({});
      return;
    }

    const existingRespostas = listRespostasByProva(selectedProvaId);
    const respostasMap: Record<string, (Alt | "")[]> = {};

    existingRespostas.forEach(resp => {
      respostasMap[resp.alunoId] = resp.respostas;
    });

    // Initialize empty respostas for alunos without respostas
    const alunosList = listAlunos(selectedProva.turmaId);
    alunosList.forEach(aluno => {
      if (!respostasMap[aluno.id]) {
        respostasMap[aluno.id] = new Array(selectedProva.qtdQuestoes).fill("") as (Alt | "")[];
      }
    });

    setRespostas(respostasMap);
  }, [selectedProvaId, selectedProva, listRespostasByProva, listAlunos]);

  const handleSelectResposta = async (alunoId: string, questaoIndex: number, alternativa: Alt) => {
    if (!selectedProvaId || !selectedProva) return;

    const alunoRespostas = respostas[alunoId] || new Array(selectedProva.qtdQuestoes).fill("") as (Alt | "")[];
    const novasRespostas = [...alunoRespostas];
    novasRespostas[questaoIndex] = alternativa;

    // Update local state immediately
    setRespostas(prev => ({
      ...prev,
      [alunoId]: novasRespostas
    }));

    // Save to database - filter out empty strings before saving
    try {
      const respostasParaSalvar = novasRespostas.filter(r => r !== "") as Alt[];
      if (respostasParaSalvar.length === selectedProva.qtdQuestoes) {
        saveRespostas(selectedProvaId, alunoId, respostasParaSalvar);
      }
    } catch (err) {
      console.error("Erro ao salvar resposta:", err);
      // Revert on error
      setRespostas(prev => ({
        ...prev,
        [alunoId]: alunoRespostas
      }));
    }
  };

  // Calculate resultados for correction tab
  const resultados = useMemo((): Resultado[] => {
    if (!gabarito || !selectedProva) return [];

    return alunos.map(aluno => {
      const respostasAluno = respostas[aluno.id] || new Array(selectedProva.qtdQuestoes).fill("") as (Alt | "")[];
      const respostasDetalhadas: Resposta[] = respostasAluno.map((resp, idx) => {
        const gabResp = gabarito[idx];
        return {
          questao: idx + 1,
          resposta: resp as Alt | "",
          correta: resp !== "" && gabResp !== "N" && resp === gabResp
        };
      });

      const acertos = respostasDetalhadas.filter(r => r.correta).length;
      // Count only valid questions (excluding 'N' from gabarito)
      const totalQuestoesValidas = gabarito.filter(g => g !== "N").length;
      const percentualAcertos = respostasAluno.filter(r => r !== "").length > 0 && totalQuestoesValidas > 0
        ? (acertos / totalQuestoesValidas) * 100
        : 0;

      // Use nota from DB if available, otherwise calculate (scaled to 10)
      const existingResposta = listRespostasByProva(selectedProvaId).find(r => r.alunoId === aluno.id);
      const nota = existingResposta?.nota !== undefined
        ? existingResposta.nota
        : totalQuestoesValidas > 0
          ? (acertos / totalQuestoesValidas) * 10
          : 0;

      return {
        aluno,
        respostas: respostasDetalhadas,
        nota: parseFloat(nota.toFixed(2)),
        percentualAcertos: parseFloat(percentualAcertos.toFixed(1))
      };
    });
  }, [alunos, respostas, gabarito, selectedProva, selectedProvaId, listRespostasByProva]);

  const mediaGeral = useMemo(() => {
    if (resultados.length === 0) return 0;
    return resultados.reduce((acc, r) => acc + r.nota, 0) / resultados.length;
  }, [resultados]);

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
                <Select value={selectedProvaId} onValueChange={setSelectedProvaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma prova" />
                  </SelectTrigger>
                  <SelectContent>
                    {provas.length === 0 ? (
                      <SelectItem value="" disabled>Nenhuma prova cadastrada</SelectItem>
                    ) : (
                      provas.map((prova) => (
                        <SelectItem key={prova.id} value={prova.id}>
                          {prova.titulo} - {new Date(prova.data).toLocaleDateString("pt-BR")}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              {selectedProva && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Questões
                  </p>
                  <p className="text-2xl">{selectedProva.qtdQuestoes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {!selectedProvaId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Selecione uma prova para começar
            </p>
          </CardContent>
        </Card>
      )}

      {selectedProvaId && !gabarito && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Esta prova ainda não possui gabarito cadastrado. Configure o gabarito na página de Provas.
            </p>
          </CardContent>
        </Card>
      )}

      {selectedProvaId && gabarito && (
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
            {/* Planilha de Respostas */}
            <Card>
              <CardHeader>
                <CardTitle>Planilha de Respostas</CardTitle>
                <CardDescription>
                  Clique nas células para selecionar as respostas de cada aluno
                </CardDescription>
              </CardHeader>
              <CardContent>
                {alunos.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum aluno cadastrado nesta turma
                  </p>
                ) : (
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
                        {alunos.map((aluno) => {
                          const alunoRespostas = respostas[aluno.id] || new Array(gabarito.length).fill("") as (Alt | "")[];

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
                                  const respostaAluno = alunoRespostas[questaoIdx] || "";
                                  const temResposta = respostaAluno !== "";
                                  const isCorreta = temResposta && gabaritoResp !== "N" && respostaAluno === gabaritoResp;
                                  const isErrada = temResposta && gabaritoResp !== "N" && respostaAluno !== gabaritoResp;

                                  return (
                                    <DropdownMenu key={questaoIdx}>
                                      <DropdownMenuTrigger asChild>
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
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="start" className="w-20">
                                        {alternativas.map((alt) => (
                                          <DropdownMenuItem
                                            key={alt}
                                            onClick={() => handleSelectResposta(aluno.id, questaoIdx, alt)}
                                            className="justify-center w-full"
                                          >
                                            {alt}
                                          </DropdownMenuItem>
                                        ))}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </ScrollArea>
                )}
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
                {resultados.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum resultado disponível
                  </p>
                ) : (
                  resultados.map((resultado) => {
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
                              <p className="text-2xl">{resultado.nota.toFixed(2)}</p>
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
                  })
                )}
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
      )}
    </div>
  );
}
