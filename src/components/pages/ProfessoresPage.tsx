import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Mail, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSCP } from "@/hooks/useSCP";
import type { Professor } from "@/domain/models";

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function ProfessoresPage() {
  const { professores, createProfessor, updateProfessor, deleteProfessor } = useSCP();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProfessor(null);
    setError(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProfessor(null);
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
    const email = formData.get("email") as string;
    const especialidade = formData.get("especialidade") as string;

    if (!nome || !email || !especialidade) {
      setError("Preencha todos os campos");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("E-mail inválido");
      return;
    }

    try {
      if (editingProfessor) {
        updateProfessor(editingProfessor.id, { nome, email, especialidade });
      } else {
        createProfessor({ nome, email, especialidade });
      }
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar professor");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este professor?")) {
      return;
    }

    try {
      deleteProfessor(id);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao excluir professor");
    }
  };

  const especialidadesUnicas = useMemo(() => {
    return Array.from(new Set(professores.map(p => p.especialidade))).length;
  }, [professores]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Gerenciamento de Professores</h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie os professores do sistema
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Professor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingProfessor ? "Editar Professor" : "Novo Professor"}
              </DialogTitle>
              <DialogDescription>
                {editingProfessor
                  ? "Edite as informações do professor"
                  : "Preencha os dados para cadastrar um novo professor"}
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
                  defaultValue={editingProfessor?.nome}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="professor@escola.edu.br"
                  defaultValue={editingProfessor?.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input
                  id="especialidade"
                  name="especialidade"
                  placeholder="Ex: Matemática, Português"
                  defaultValue={editingProfessor?.especialidade}
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
                  {editingProfessor ? "Salvar Alterações" : "Cadastrar Professor"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Professors Grid */}
      {professores.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Nenhum professor cadastrado
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {professores.map((professor) => (
            <Card key={professor.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(professor.nome)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 space-y-1">
                    <h3>{professor.nome}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <p>{professor.email}</p>
                    </div>
                    <p className="text-muted-foreground">
                      Especialidade: {professor.especialidade}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(professor)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(professor.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
          <CardDescription>Estatísticas do corpo docente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground">Total de Professores</p>
              <p className="text-3xl">{professores.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Especialidades</p>
              <p className="text-3xl">{especialidadesUnicas}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Cadastros Ativos</p>
              <p className="text-3xl">{professores.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
