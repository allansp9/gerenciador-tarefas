'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useState } from 'react';

export function ListaTarefas() {
  const trpc = useTRPC();
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const queryClient = useQueryClient();
  const {
    data: tarefas,
    isPending,
    isError,
  } = useQuery(trpc.tarefa.listar.queryOptions());

  const {
    mutate: deletarTarefa,
    isPending: isDeletando,
    variables,
  } = useMutation(
    trpc.tarefa.deletar.mutationOptions({
      // Invalida a query de listagem de tarefas para que ela seja recarregada.
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.tarefa.listar.queryKey(),
        });
        setFeedbackMsg('Tarefa deletada com sucesso.');
      },
      onError: (error) => {
        setFeedbackMsg(error.message);
      },
    }),
  );

  let conteudo;

  if (isPending) {
    conteudo = <p>Carregando tarefas...</p>;
  } else if (isError) {
    conteudo = <p>Não foi possível carregar as tarefas.</p>;
  } else if (tarefas.length === 0) {
    conteudo = <p>Nenhuma tarefa cadastrada.</p>;
  } else {
    conteudo = (
      <ul>
        {tarefas.map((tarefa) => {
          const deletando = isDeletando && variables?.id === tarefa.id;
          return (
            <li key={tarefa.id}>
              <h2>{tarefa.titulo}</h2>
              {tarefa.descricao && <p>{tarefa.descricao}</p>}
              <small>Criada em {formatarData(tarefa.dataCriacao)}</small>
              <Link href={`/tarefas/${tarefa.id}/editar`}>Editar</Link>
              <button
                onClick={() => deletarTarefa({ id: tarefa.id })}
                disabled={deletando}
              >
                {deletando ? 'Deletando...' : 'Deletar'}
              </button>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      {feedbackMsg && <p>{feedbackMsg}</p>}
      {conteudo}
    </div>
  );
}

function formatarData(timestamp: number) {
  // O fuso fixo evita que o servidor e navegador gerem textos diferentes para a mesma data,
  // o que quebraria a hidratação.
  return new Date(timestamp).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
