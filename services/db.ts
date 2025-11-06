import { SCPDB, Turma, Aluno, Prova, Gabarito, RespostaAluno, ID, Alt, AltGabarito } from "../domain/models";

const KEY = "scp_db";

function nowISO() { return new Date().toISOString(); }
function uid(prefix = "id"): ID {
  const r = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
  return `${prefix}_${r}`;
}

function readDB(): SCPDB {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    const empty: SCPDB = { turmas: [], alunos: [], provas: [], gabaritos: [], respostas: [], _meta: { version: 1 } };
    localStorage.setItem(KEY, JSON.stringify(empty)); try { window.dispatchEvent(new Event('scp:changed')); } catch{}
    return empty;
  }
  return JSON.parse(raw) as SCPDB;
}
function writeDB(db: any) { localStorage.setItem(KEY, JSON.stringify(db)); try { window.dispatchEvent(new Event('scp:changed')); } catch{} }

export function calcNota(gabarito: AltGabarito[], respostas: Alt[]): number {
  let acertos = 0;
  for (let i = 0; i < gabarito.length; i++) {
    const gab = gabarito[i]; const r = respostas[i];
    if (gab === 'N') continue;
    if (gab === r) acertos++;
  }
  return acertos;
}

export const DB = {
  reset() { localStorage.removeItem(KEY); },

  listTurmas(): Turma[] { return readDB().turmas; },
  createTurma(data: Omit<Turma, "id" | "criadaEm">): Turma {
    const db = readDB();
    const turma: Turma = { id: uid("turma"), criadaEm: nowISO(), ...data };
    db.turmas.push(turma); writeDB(db); return turma;
  },
  updateTurma(id: ID, patch: Partial<Omit<Turma, "id" | "criadaEm">>): Turma {
    const db = readDB(); const i = db.turmas.findIndex(t => t.id === id);
    if (i < 0) throw new Error("Turma não encontrada");
    db.turmas[i] = { ...db.turmas[i], ...patch }; writeDB(db); return db.turmas[i];
  },
  deleteTurma(id: ID): void {
    const db = readDB();
    if (db.provas.some(p => p.turmaId === id)) throw new Error("Exclusão bloqueada: existem provas associadas à turma.");
    db.alunos = db.alunos.filter(a => a.turmaId !== id);
    db.turmas = db.turmas.filter(t => t.id !== id);
    writeDB(db);
  },

  listAlunos(turmaId?: ID): Aluno[] {
    const a = readDB().alunos; return turmaId ? a.filter(x => x.turmaId === turmaId) : a;
  },
  createAluno(data: Omit<Aluno, "id" | "criadoEm">): Aluno {
    const db = readDB();
    const aluno: Aluno = { id: uid("aluno"), criadoEm: nowISO(), ...data };
    db.alunos.push(aluno); writeDB(db); return aluno;
  },
  updateAluno(id: ID, patch: Partial<Omit<Aluno, "id" | "criadoEm">>): Aluno {
    const db = readDB(); const i = db.alunos.findIndex(a => a.id === id);
    if (i < 0) throw new Error("Aluno não encontrado");
    db.alunos[i] = { ...db.alunos[i], ...patch }; writeDB(db); return db.alunos[i];
  },
  deleteAluno(id: ID, opts?: { isAdmin?: boolean }): void {
    const db = readDB();
    const temNota = db.respostas.some(r => r.alunoId === id && typeof r.nota === "number");
    if (temNota && !opts?.isAdmin) throw new Error("Exclusão bloqueada: aluno possui notas registradas.");
    db.respostas = db.respostas.filter(r => r.alunoId !== id);
    db.alunos = db.alunos.filter(a => a.id !== id);
    writeDB(db);
  },

  listProvas(turmaId?: ID): Prova[] {
    const p = readDB().provas; return turmaId ? p.filter(x => x.turmaId === turmaId) : p;
  },
  createProva(data: Omit<Prova, "id" | "criadoEm" | "corrigida">): Prova {
    const db = readDB();
    const prova: Prova = { id: uid("prova"), criadoEm: nowISO(), corrigida: false, ...data };
    db.provas.push(prova); writeDB(db); return prova;
  },
  updateProva(id: ID, patch: Partial<Omit<Prova, "id" | "criadoEm">>): Prova {
    const db = readDB(); const i = db.provas.findIndex(p => p.id === id);
    if (i < 0) throw new Error("Prova não encontrada");
    if (db.provas[i].corrigida) throw new Error("Edição bloqueada: prova já corrigida.");
    db.provas[i] = { ...db.provas[i], ...patch }; writeDB(db); return db.provas[i];
  },
  deleteProva(id: ID): void {
    const db = readDB();
    if (db.respostas.some(r => r.provaId === id)) throw new Error("Exclusão bloqueada: existem resultados associados.");
    db.gabaritos = db.gabaritos.filter(g => g.provaId !== id);
    db.provas = db.provas.filter(p => p.id !== id); writeDB(db);
  },

  getGabaritoByProva(provaId: ID): Gabarito | undefined {
    return readDB().gabaritos.find(g => g.provaId === provaId);
  },
  createOrReplaceGabarito(provaId: ID, respostas: AltGabarito[]): Gabarito {
    const db = readDB();
    const prova = db.provas.find(p => p.id === provaId);
    if (!prova) throw new Error("Prova não encontrada");
    if (respostas.length !== prova.qtdQuestoes) throw new Error(`Gabarito inválido: esperado ${prova.qtdQuestoes} respostas.`);
    const idx = db.gabaritos.findIndex(g => g.provaId === provaId);
    const g: Gabarito = {
      id: idx >= 0 ? db.gabaritos[idx].id : uid("gabarito"),
      provaId, respostas,
      criadoEm: idx >= 0 ? db.gabaritos[idx].criadoEm : nowISO(),
      atualizadoEm: idx >= 0 ? nowISO() : undefined
    };
    if (idx >= 0) db.gabaritos[idx] = g; else db.gabaritos.push(g);

    db.respostas.filter(r => r.provaId === provaId).forEach(r => r.nota = calcNota(respostas, r.respostas));
    if (db.respostas.some(r => r.provaId === provaId && typeof r.nota === "number")) {
      const pi = db.provas.findIndex(p => p.id === provaId); if (pi >= 0) db.provas[pi].corrigida = true;
    }
    writeDB(db); return g;
  },

  listRespostasByProva(provaId: ID): RespostaAluno[] {
    return readDB().respostas.filter(r => r.provaId === provaId);
  },
  createOrUpdateResposta(input: { provaId: ID; alunoId: ID; respostas: Alt[]; }): RespostaAluno {
    const db = readDB();
    const prova = db.provas.find(p => p.id === input.provaId);
    if (!prova) throw new Error("Prova não encontrada");
    if (input.respostas.length !== prova.qtdQuestoes) throw new Error(`Preenchimento incompleto: esperado ${prova.qtdQuestoes} respostas.`);
    const gabarito = db.gabaritos.find(g => g.provaId === input.provaId);
    const nota = gabarito ? calcNota(gabarito.respostas, input.respostas) : undefined;
    const idx = db.respostas.findIndex(r => r.provaId === input.provaId && r.alunoId === input.alunoId);
    if (idx >= 0) db.respostas[idx] = { ...db.respostas[idx], respostas: input.respostas, nota, atualizadoEm: nowISO() };
    else db.respostas.push({ id: uid("resp"), criadoEm: nowISO(), ...input, nota });
    if (typeof nota === "number") {
      const pi = db.provas.findIndex(p => p.id === input.provaId); if (pi >= 0) db.provas[pi].corrigida = true;
    }
    writeDB(db);
    return db.respostas.find(r => r.provaId === input.provaId && r.alunoId === input.alunoId)!;
  },

  getTotals() {
    const db = readDB();
    const totalTurmas = db.turmas.length;
    const totalProvas = db.provas.length;
    const mediasPorTurma = db.turmas.map(t => {
      const provasDaTurma = db.provas.filter(p => p.turmaId === t.id).map(p => p.id);
      const respostas = db.respostas.filter(r => provasDaTurma.includes(r.provaId) && typeof r.nota === "number");
      const soma = respostas.reduce((acc, r) => acc + (r.nota || 0), 0);
      const qtd = respostas.length;
      return { turmaId: t.id, media: qtd ? soma / qtd : 0 };
    });
    const mediaGeral = mediasPorTurma.reduce((a, x) => a + x.media, 0) / (mediasPorTurma.length || 1);
    return { totalTurmas, totalProvas, mediaGeral, mediasPorTurma };
  }
}
// Expor o serviço no window para depurar pelo Console

;(window as any).__scp = DB;
console.log('[SCP] window.__scp disponível');

