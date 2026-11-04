import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { baseProcedure, createTRPCRouter } from '../init';
import { tarefas, type Tarefa } from '@/server/banco-em-memoria';
import { idTarefaSchema, tarefaSchema } from '@/schemas/tarefa';

// Centraliza a busca por id e o erro NOT_FOUND, garantindo que todas as
// procedures respondam da mesma forma quando a tarefa não existe.
function buscarTarefaOuErro(id: string): Tarefa {
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Tarefa não encontrada',
    });
  }
  return tarefa;
}

export const tarefaRouter = createTRPCRouter({
  listar: baseProcedure.query(() => {
    return [...tarefas].sort((a, b) => b.dataCriacao - a.dataCriacao);
  }),
  obterPorId: baseProcedure.input(idTarefaSchema).query(({ input }) => {
    return buscarTarefaOuErro(input.id);
  }),
  criar: baseProcedure.input(tarefaSchema).mutation(({ input }) => {
    const novaTarefa: Tarefa = {
      id: randomUUID(),
      titulo: input.titulo,
      descricao: input.descricao || undefined,
      dataCriacao: Date.now(),
    };
    tarefas.push(novaTarefa);
    return novaTarefa;
  }),
  atualizar: baseProcedure
    .input(tarefaSchema.extend(idTarefaSchema.shape))
    .mutation(({ input }) => {
      const tarefa = buscarTarefaOuErro(input.id);
      tarefa.titulo = input.titulo;
      tarefa.descricao = input.descricao || undefined;
      return tarefa;
    }),
  deletar: baseProcedure.input(idTarefaSchema).mutation(({ input }) => {
    const tarefa = buscarTarefaOuErro(input.id);
    const index = tarefas.indexOf(tarefa);
    tarefas.splice(index, 1);
    return tarefa;
  }),
});
