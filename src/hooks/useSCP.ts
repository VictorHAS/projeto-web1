import { useCallback, useEffect, useMemo, useState } from "react";
import { DB, KEY_DB } from "@/services/db";
import type { Turma, Aluno, Prova, Professor, Alt, AltGabarito } from "@/domain/models";

export function useSCP() {
  const [turmas, setTurmas] = useState<Turma[]>(() => DB.listTurmas());
  const [alunos, setAlunos] = useState<Aluno[]>(() => DB.listAlunos());
  const [provas, setProvas] = useState<Prova[]>(() => DB.listProvas());
  const [professores, setProfessores] = useState<Professor[]>(() => DB.listProfessores());

  const refresh = useCallback(() => {
    setTurmas(DB.listTurmas());
    setAlunos(DB.listAlunos());
    setProvas(DB.listProvas());
    setProfessores(DB.listProfessores());
  }, []);

  // Listen for custom scp:changed event (same tab)
  useEffect(() => {
    const handleChange = () => refresh();
    window.addEventListener('scp:changed', handleChange);
    return () => window.removeEventListener('scp:changed', handleChange);
  }, [refresh]);

  // Listen for storage event (cross-tab sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === KEY_DB && e.newValue !== e.oldValue) {
        refresh();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refresh]);

  const createTurma = useCallback((d: Omit<Turma,'id'|'criadaEm'>) => { DB.createTurma(d); refresh(); }, [refresh]);
  const updateTurma = useCallback((id: string, p: Partial<Turma>) => { DB.updateTurma(id, p); refresh(); }, [refresh]);
  const deleteTurma = useCallback((id: string) => { DB.deleteTurma(id); refresh(); }, [refresh]);

  const createAluno = useCallback((d: Omit<Aluno,'id'|'criadoEm'>) => { DB.createAluno(d); refresh(); }, [refresh]);
  const updateAluno = useCallback((id: string, p: Partial<Aluno>) => { DB.updateAluno(id, p); refresh(); }, [refresh]);
  const deleteAluno = useCallback((id: string, isAdmin=false) => { DB.deleteAluno(id, {isAdmin}); refresh(); }, [refresh]);

  const createProva = useCallback((d: Omit<Prova,'id'|'criadoEm'|'corrigida'>) => { DB.createProva(d); refresh(); }, [refresh]);
  const updateProva = useCallback((id: string, p: Partial<Prova>) => { DB.updateProva(id, p); refresh(); }, [refresh]);
  const deleteProva = useCallback((id: string) => { DB.deleteProva(id); refresh(); }, [refresh]);

  const createProfessor = useCallback((d: Omit<Professor,'id'|'criadoEm'>) => { DB.createProfessor(d); refresh(); }, [refresh]);
  const updateProfessor = useCallback((id: string, p: Partial<Professor>) => { DB.updateProfessor(id, p); refresh(); }, [refresh]);
  const deleteProfessor = useCallback((id: string) => { DB.deleteProfessor(id); refresh(); }, [refresh]);

  const saveGabarito = useCallback((provaId: string, resp: AltGabarito[]) => { DB.createOrReplaceGabarito(provaId, resp); refresh(); }, [refresh]);
  const saveRespostas = useCallback((provaId: string, alunoId: string, resp: Alt[]) => { DB.createOrUpdateResposta({ provaId, alunoId, respostas: resp }); refresh(); }, [refresh]);

  const totals = useMemo(() => DB.getTotals(), []);

  const listTurmas = useCallback(() => DB.listTurmas(), []);
  const listAlunos = useCallback((turmaId?: string) => DB.listAlunos(turmaId), []);
  const listProvas = useCallback((turmaId?: string) => DB.listProvas(turmaId), []);
  const listRespostasByProva = useCallback((provaId: string) => DB.listRespostasByProva(provaId), []);
  const getGabaritoByProva = useCallback((provaId: string) => DB.getGabaritoByProva(provaId), []);

  return {
    turmas, alunos, provas, professores, totals,
    listTurmas,
    listAlunos,
    listProvas,
    listRespostasByProva,
    getGabaritoByProva,
    createTurma, updateTurma, deleteTurma,
    createAluno, updateAluno, deleteAluno,
    createProva, updateProva, deleteProva,
    createProfessor, updateProfessor, deleteProfessor,
    saveGabarito, saveRespostas,
    refresh,
  };
}
