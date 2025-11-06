import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Mail, Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Professor {
  id: number;
  nome: string;
  email: string;
  especialidade: string;
}

const professoresData: Professor[] = [
  { id: 1, nome: "Prof. João Silva", email: "joao.silva@escola.edu.br", especialidade: "Matemática" },
  { id: 2, nome: "Profª. Maria Santos", email: "maria.santos@escola.edu.br", especialidade: "Português" },
  { id: 3, nome: "Prof. Carlos Eduardo", email: "carlos.eduardo@escola.edu.br", especialidade: "Física" },
  { id: 4, nome: "Profª. Ana Paula", email: "ana.paula@escola.edu.br", especialidade: "Química" },
  { id: 5, nome: "Prof. Roberto Alves", email: "roberto.alves@escola.edu.br", especialidade: "História" },
  { id: 6, nome: "Profª. Juliana Oliveira", email: "juliana.oliveira@escola.edu.br", especialidade: "Geografia" },
];

function getInitials(name: string): string {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function ProfessoresPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProfessor(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProfessor(null);
  };

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
            <form className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  placeholder="Digite o nome completo"
                  defaultValue={editingProfessor?.nome}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="professor@escola.edu.br"
                  defaultValue={editingProfessor?.email}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="especialidade">Especialidade</Label>
                <Input
                  id="especialidade"
                  placeholder="Ex: Matemática, Português"
                  defaultValue={editingProfessor?.especialidade}
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
                <Button type="submit" onClick={handleCloseDialog}>
                  {editingProfessor ? "Salvar Alterações" : "Cadastrar Professor"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Professors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {professoresData.map((professor) => (
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
                  <Button variant="ghost" size="icon">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
              <p className="text-3xl">{professoresData.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Especialidades</p>
              <p className="text-3xl">
                {new Set(professoresData.map(p => p.especialidade)).size}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">Cadastros Ativos</p>
              <p className="text-3xl">{professoresData.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
