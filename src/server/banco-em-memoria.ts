export type Tarefa = {
  id: string;
  titulo: string;
  descricao?: string;
  // Timestamp em milissegundos (Date.now()) em vez de Date: o JSON não tem tipo
  // de data, então um Date chegaria ao cliente como string. Guardar como número
  // evita isso sem depender de bibliotecas como o superjson.
  dataCriacao: number;
};

const globalComTarefas = globalThis as unknown as { tarefas?: Tarefa[] };

if (!globalComTarefas.tarefas) {
  globalComTarefas.tarefas = [];
}

// Atenção: nunca reatribua este array (ex.: tarefas = [...]).
// Use apenas métodos que o modificam no lugar (push, splice), para manter
// a mesma referência guardada no globalThis.
export const tarefas = globalComTarefas.tarefas;
