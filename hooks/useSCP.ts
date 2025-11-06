import { useCallback, useMemo, useState } from "react";
import { DB } from "../services/db";
import type { Turma, Aluno, Prova, Alt, AltGabarito } from "../domain/models";

export function useSCP() {
  const [turmas, setTurmas] = useState<Turma[]>(() => DB.listTurmas());
  const [alunos, setAlunos] = useState<Aluno[]>(() => DB.listAlunos());
  const [provas, setProvas] = useState<Prova[]>(() => DB.listProvas());

  const refresh = useCallback(() => {
    setTurmas(DB.listTurmas());
    setAlunos(DB.listAlunos());
    setProvas(DB.listProvas());
  }, []);

  const createTurma = useCallback((d: Omit<Turma,'id'|'criadaEm'>) => { DB.createTurma(d); refresh(); }, [refresh]);
  const updateTurma = useCallback((id: string, p: Partial<Turma>) => { DB.updateTurma(id, p); refresh(); }, [refresh]);
  const deleteTurma = useCallback((id: string) => { DB.deleteTurma(id); refresh(); }, [refresh]);

  const createAluno = useCallback((d: Omit<Aluno,'id'|'criadoEm'>) => { DB.createAluno(d); refresh(); }, [refresh]);
  const updateAluno = useCallback((id: string, p: Partial<Aluno>) => { DB.updateAluno(id, p); refresh(); }, [refresh]);
  const deleteAluno = useCallback((id: string, isAdmin=false) => { DB.deleteAluno(id, {isAdmin}); refresh(); }, [refresh]);

  const createProva = useCallback((d: Omit<Prova,'id'|'criadoEm'|'corrigida'>) => { DB.createProva(d); refresh(); }, [refresh]);
  const updateProva = useCallback((id: string, p: Partial<Prova>) => { DB.updateProva(id, p); refresh(); }, [refresh]);
  const deleteProva = useCallback((id: string) => { DB.deleteProva(id); refresh(); }, [refresh]);

  const saveGabarito = useCallback((provaId: string, resp: AltGabarito[]) => { DB.createOrReplaceGabarito(provaId, resp); refresh(); }, [refresh]);
  const saveRespostas = useCallback((provaId: string, alunoId: string, resp: Alt[]) => { DB.createOrUpdateResposta({ provaId, alunoId, respostas: resp }); refresh(); }, [refresh]);

  const totals = useMemo(() => DB.getTotals(), [turmas, alunos, provas]);

  return {
    turmas, alunos, provas, totals,
    listTurmas: () => DB.listTurmas(),
    listAlunos: (turmaId?: string) => DB.listAlunos(turmaId),
    listProvas: (turmaId?: string) => DB.listProvas(turmaId),
    listRespostasByProva: (provaId: string) => DB.listRespostasByProva(provaId),
    getGabaritoByProva: (provaId: string) => DB.getGabaritoByProva(provaId),
    createTurma, updateTurma, deleteTurma,
    createAluno, updateAluno, deleteAluno,
    createProva, updateProva, deleteProva,
    saveGabarito, saveRespostas,
    refresh,
  };
}
