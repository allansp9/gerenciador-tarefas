import Link from 'next/link';

import { getQueryClient, HydrateClient, trpc } from '@/trpc/server';
import { ListaTarefas } from './_components/lista-tarefas';

// Força a renderização a cada requisição
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Busca as tarefas no servidor antes de responder.
  // O await garante que o HTML já saia com a lista preenchida.
  await getQueryClient().prefetchQuery(trpc.tarefa.listar.queryOptions());
  return (
    <main>
      <div className="cabecalho">
        <h1>Minhas tarefas</h1>
        <Link href="/tarefas/nova" className="botao botao-primario">
          + Nova tarefa
        </Link>
      </div>
      <HydrateClient>
        <ListaTarefas />
      </HydrateClient>
    </main>
  );
}
