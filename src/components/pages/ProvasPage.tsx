import { useState, useRef, useMemo } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, Pencil, Trash2, FileCheck, AlertCircle, CheckCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { useSCP } from "@/hooks/useSCP";
import type { Prova, AltGabarito } from "@/domain/models";

const alternativas: AltGabarito[] = ["A", "B", "C", "D", "E", "N"];

export function ProvasPage() {
  const { provas, turmas, createProva, updateProva, deleteProva, saveGabarito, getGabaritoByProva } = useSCP();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGabaritoOpen, setIsGabaritoOpen] = useState(false);
  const [editingProva, setEditingProva] = useState<Prova | null>(null);
  const [currentProva, setCurrentProva] = useState<Prova | null>(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");
  const [gabarito, setGabarito] = useState<AltGabarito[]>([]);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const getTurmaName = (turmaId: string) => {
    return turmas.find(t => t.id === turmaId)?.nome || turmaId;
  };

  const handleEdit = (prova: Prova) => {
    setEditingProva(prova);
    setSelectedTurmaId(prova.turmaId);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProva(null);
    setSelectedTurmaId(turmas.length > 0 ? turmas[0].id : "");
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProva(null);
    setSelectedTurmaId("");
    setError(null);
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const titulo = formData.get("titulo") as string;
    const data = formData.get("data") as string;
    const qtdQuestoes = parseInt(formData.get("questoes") as string);
    const turmaId = selectedTurmaId;

    if (!titulo || !data || !qtdQuestoes || !turmaId) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      if (editingProva) {
        updateProva(editingProva.id, { titulo, data, qtdQuestoes, turmaId });
      } else {
        createProva({ titulo, data, qtdQuestoes, turmaId });
      }
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar prova");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta prova?")) {
      return;
    }

    try {
      deleteProva(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir prova");
    }
  };

  const handleOpenGabarito = (prova: Prova) => {
    setCurrentProva(prova);
    setError(null);

    // Load existing gabarito or initialize empty
    const existingGabarito = getGabaritoByProva(prova.id);
    if (existingGabarito && existingGabarito.respostas.length === prova.qtdQuestoes) {
      setGabarito(existingGabarito.respostas);
    } else {
      setGabarito(new Array(prova.qtdQuestoes).fill("N") as AltGabarito[]);
    }

    setIsGabaritoOpen(true);
  };

  const handleCloseGabarito = () => {
    setIsGabaritoOpen(false);
    setCurrentProva(null);
    setGabarito([]);
    setError(null);
  };

  const handleSelectResposta = (questaoIndex: number, alternativa: AltGabarito) => {
    const novoGabarito = [...gabarito];
    novoGabarito[questaoIndex] = alternativa;
    setGabarito(novoGabarito);
  };

  const handleSaveGabarito = () => {
    if (!currentProva) return;

    // Check if all questions are filled (not 'N')
    const questoesPreenchidas = gabarito.filter(r => r !== "N").length;
    if (questoesPreenchidas !== currentProva.qtdQuestoes) {
      setError("Preencha todas as questões");
      return;
    }

    try {
      saveGabarito(currentProva.id, gabarito);
      handleCloseGabarito();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar gabarito");
    }
  };

  const questoesPreenchidas = gabarito.filter(r => r !== "N").length;
  const gabaritoCompleto = currentProva ? questoesPreenchidas === currentProva.qtdQuestoes : false;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gerenciamento de Provas</h1>
          <p className="text-muted-foreground">
            Cadastre provas e configure seus gabaritos
          </p>
        </div>

        {/* Nova Prova Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Prova
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProva ? "Editar Prova" : "Nova Prova"}
              </DialogTitle>
              <DialogDescription>
                {editingProva
                  ? "Edite as informações da prova"
                  : "Preencha os dados para cadastrar uma nova prova"}
              </DialogDescription>
            </DialogHeader>
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="titulo">Título da Prova</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  placeholder="Ex: Prova de Matemática - 1º Bimestre"
                  defaultValue={editingProva?.titulo}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data da Aplicação</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  defaultValue={editingProva?.data}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Select value={selectedTurmaId} onValueChange={setSelectedTurmaId} required>
                  <SelectTrigger id="turma">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    {turmas.length === 0 ? (
                      <SelectItem value="" disabled>Nenhuma turma cadastrada</SelectItem>
                    ) : (
                      turmas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="questoes">Número de Questões</Label>
                <Input
                  id="questoes"
                  name="questoes"
                  type="number"
                  min="1"
                  max="50"
                  placeholder="10"
                  defaultValue={editingProva?.qtdQuestoes}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProva ? "Salvar Alterações" : "Cadastrar Prova"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Provas</CardTitle>
          <CardDescription>
            {provas.length} prova(s) cadastrada(s) no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Questões</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {provas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma prova cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                provas.map((prova) => (
                  <TableRow key={prova.id}>
                    <TableCell>{prova.titulo}</TableCell>
                    <TableCell>
                      {new Date(prova.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell>{getTurmaName(prova.turmaId)}</TableCell>
                    <TableCell>{prova.qtdQuestoes}</TableCell>
                    <TableCell>
                      <Badge
                        variant={prova.corrigida ? "default" : "secondary"}
                      >
                        {prova.corrigida ? "Concluída" : "Pendente"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenGabarito(prova)}
                          title="Configurar Gabarito"
                        >
                          <FileCheck className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(prova)}
                          disabled={prova.corrigida}
                          title={prova.corrigida ? "Prova já corrigida" : "Editar"}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(prova.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Gabarito Dialog */}
      <Dialog open={isGabaritoOpen} onOpenChange={setIsGabaritoOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Gabarito</DialogTitle>
            <DialogDescription>
              {currentProva?.titulo} - {currentProva ? getTurmaName(currentProva.turmaId) : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Status do Gabarito */}
            {!gabaritoCompleto ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Preencha todas as {currentProva?.qtdQuestoes || 0} questões.
                  Atualmente {questoesPreenchidas} de {currentProva?.qtdQuestoes || 0} questões preenchidas.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-success bg-success/10">
                <CheckCircle className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  Gabarito completo! Todas as {currentProva?.qtdQuestoes || 0} questões foram preenchidas.
                </AlertDescription>
              </Alert>
            )}

            {/* Grid de Questões */}
            {currentProva && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: currentProva.qtdQuestoes }, (_, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <span>Questão {index + 1}</span>
                        {gabarito[index] && gabarito[index] !== "N" && (
                          <Badge variant="default">
                            Resposta: {gabarito[index]}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap">
                        {alternativas.map((alt) => (
                          <Button
                            key={alt}
                            variant={gabarito[index] === alt ? "default" : "outline"}
                            size="lg"
                            className="flex-1 min-w-[60px]"
                            onClick={() => handleSelectResposta(index, alt)}
                          >
                            {alt === "N" ? "N/A" : alt}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseGabarito}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveGabarito}
                disabled={!gabaritoCompleto}
              >
                Salvar Gabarito
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
