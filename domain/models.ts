export type ID = string;
export type Alt = 'A' | 'B' | 'C' | 'D' | 'E';
export type AltGabarito = Alt | 'N';

export interface Turma { id: ID; nome: string; ano: number; curso: string; criadaEm: string; }
export interface Aluno { id: ID; nome: string; matricula: string; turmaId: ID; criadoEm: string; }
export interface Prova { id: ID; turmaId: ID; titulo: string; data: string; qtdQuestoes: number; corrigida: boolean; criadoEm: string; }
export interface Gabarito { id: ID; provaId: ID; respostas: AltGabarito[]; criadoEm: string; atualizadoEm?: string; }
export interface RespostaAluno { id: ID; provaId: ID; alunoId: ID; respostas: Alt[]; nota?: number; criadoEm: string; atualizadoEm?: string; }
export interface SCPDB {
  turmas: Turma[]; alunos: Aluno[]; provas: Prova[]; gabaritos: Gabarito[]; respostas: RespostaAluno[];
  _meta: { version: number };
}
