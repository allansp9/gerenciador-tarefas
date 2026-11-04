import { createTRPCRouter } from '../init';
import { tarefaRouter } from './tarefa';

export const appRouter = createTRPCRouter({
  tarefa: tarefaRouter,
});

export type AppRouter = typeof appRouter;
