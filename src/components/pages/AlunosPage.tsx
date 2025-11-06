import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Pencil, Trash2, Filter, AlertCircle } from "lucide-react";
import { useSCP } from "@/hooks/useSCP";
import type { Aluno } from "@/domain/models";

export function AlunosPage() {
  const { alunos, turmas, createAluno, updateAluno, deleteAluno, listAlunos } = useSCP();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [filterTurmaId, setFilterTurmaId] = useState<string>("todas");
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const filteredAlunos = useMemo(() => {
    if (filterTurmaId === "todas") {
      return alunos;
    }
    return listAlunos(filterTurmaId);
  }, [alunos, filterTurmaId, listAlunos]);

  const getTurmaName = (turmaId: string) => {
    return turmas.find(t => t.id === turmaId)?.nome || turmaId;
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setSelectedTurmaId(aluno.turmaId);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAluno(null);
    setSelectedTurmaId(turmas.length > 0 ? turmas[0].id : "");
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAluno(null);
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
    const nome = formData.get("nome") as string;
    const matricula = formData.get("matricula") as string;
    const turmaId = selectedTurmaId;

    if (!nome || !matricula || !turmaId) {
      setError("Preencha todos os campos");
      return;
    }

    try {
      if (editingAluno) {
        updateAluno(editingAluno.id, { nome, matricula, turmaId });
      } else {
        createAluno({ nome, matricula, turmaId });
      }
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar aluno");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este aluno?")) {
      return;
    }

    try {
      deleteAluno(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir aluno");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1>Gerenciamento de Alunos</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os alunos do sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Aluno
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAluno ? "Editar Aluno" : "Novo Aluno"}
              </DialogTitle>
              <DialogDescription>
                {editingAluno
                  ? "Edite as informações do aluno"
                  : "Preencha os dados para cadastrar um novo aluno"}
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
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Digite o nome completo"
                  defaultValue={editingAluno?.nome}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  name="matricula"
                  placeholder="000000"
                  defaultValue={editingAluno?.matricula}
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
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingAluno ? "Salvar Alterações" : "Cadastrar Aluno"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-muted-foreground" />
            <div className="flex-1">
              <Label htmlFor="filter-turma">Filtrar por Turma</Label>
              <Select value={filterTurmaId} onValueChange={setFilterTurmaId}>
                <SelectTrigger id="filter-turma" className="mt-2">
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Turmas</SelectItem>
                  {turmas.map((turma) => (
                    <SelectItem key={turma.id} value={turma.id}>
                      {turma.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            {filteredAlunos.length} aluno(s) encontrado(s)
            {filterTurmaId !== "todas" && ` na ${getTurmaName(filterTurmaId)}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlunos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    Nenhum aluno encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredAlunos.map((aluno) => (
                  <TableRow key={aluno.id}>
                    <TableCell>{aluno.matricula}</TableCell>
                    <TableCell>{aluno.nome}</TableCell>
                    <TableCell>{getTurmaName(aluno.turmaId)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(aluno)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(aluno.id)}
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
    </div>
  );
}
