import Link from 'next/link';

import { notFound } from 'next/navigation';
import { TRPCError } from '@trpc/server';
import { caller } from '@/trpc/server';
import { FormularioTarefa } from '@/app/_components/formulario-tarefa';

export default async function EditarTarefaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let tarefa;
  try {
    // caller em vez de prefetchQuery, já que não há cache envolvido na edição de uma tarefa
    tarefa = await caller.tarefa.obterPorId({ id });
  } catch (error) {
    if (
      error instanceof TRPCError &&
      (error.code === 'NOT_FOUND' || error.code === 'BAD_REQUEST')
    ) {
      notFound();
    }
    // Se for outro tipo de erro, podemos lançar novamente para que o Next.js trate como um erro de servidor
    throw error;
  }

  return (
    <main>
      <Link href="/" className="voltar">
        ← Voltar para a lista
      </Link>
      <h1 className="titulo-pagina">Editar tarefa</h1>
      <FormularioTarefa tarefa={tarefa} />
    </main>
  );
}
