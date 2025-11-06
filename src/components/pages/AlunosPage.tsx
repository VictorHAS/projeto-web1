import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Aluno {
  id: number;
  nome: string;
  matricula: string;
  turma: string;
  status: "ativo" | "inativo";
}

const alunosData: Aluno[] = [
  { id: 1, nome: "João Silva", matricula: "202301", turma: "Turma A", status: "ativo" },
  { id: 2, nome: "Maria Santos", matricula: "202302", turma: "Turma A", status: "ativo" },
  { id: 3, nome: "Pedro Costa", matricula: "202303", turma: "Turma B", status: "ativo" },
  { id: 4, nome: "Ana Paula", matricula: "202304", turma: "Turma B", status: "ativo" },
  { id: 5, nome: "Carlos Eduardo", matricula: "202305", turma: "Turma C", status: "ativo" },
  { id: 6, nome: "Juliana Oliveira", matricula: "202306", turma: "Turma C", status: "inativo" },
  { id: 7, nome: "Roberto Alves", matricula: "202307", turma: "Turma A", status: "ativo" },
  { id: 8, nome: "Fernanda Lima", matricula: "202308", turma: "Turma D", status: "ativo" },
];

export function AlunosPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [filterTurma, setFilterTurma] = useState<string>("todas");

  const filteredAlunos = filterTurma === "todas"
    ? alunosData
    : alunosData.filter(aluno => aluno.turma === filterTurma);

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAluno(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAluno(null);
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
            <form className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Digite o nome completo"
                  defaultValue={editingAluno?.nome}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricula">Matrícula</Label>
                <Input
                  id="matricula"
                  placeholder="000000"
                  defaultValue={editingAluno?.matricula}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="turma">Turma</Label>
                <Select defaultValue={editingAluno?.turma}>
                  <SelectTrigger id="turma">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Turma A">Turma A</SelectItem>
                    <SelectItem value="Turma B">Turma B</SelectItem>
                    <SelectItem value="Turma C">Turma C</SelectItem>
                    <SelectItem value="Turma D">Turma D</SelectItem>
                    <SelectItem value="Turma E">Turma E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue={editingAluno?.status || "ativo"}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
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
                <Button type="submit" onClick={handleCloseDialog}>
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
              <Select value={filterTurma} onValueChange={setFilterTurma}>
                <SelectTrigger id="filter-turma" className="mt-2">
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Turmas</SelectItem>
                  <SelectItem value="Turma A">Turma A</SelectItem>
                  <SelectItem value="Turma B">Turma B</SelectItem>
                  <SelectItem value="Turma C">Turma C</SelectItem>
                  <SelectItem value="Turma D">Turma D</SelectItem>
                  <SelectItem value="Turma E">Turma E</SelectItem>
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
            {filterTurma !== "todas" && ` na ${filterTurma}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAlunos.map((aluno) => (
                <TableRow key={aluno.id}>
                  <TableCell>{aluno.matricula}</TableCell>
                  <TableCell>{aluno.nome}</TableCell>
                  <TableCell>{aluno.turma}</TableCell>
                  <TableCell>
                    <Badge variant={aluno.status === "ativo" ? "default" : "secondary"}>
                      {aluno.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(aluno)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
