'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useTRPC } from '@/trpc/client';

type Feedback = { tipo: 'sucesso' | 'erro'; texto: string } | null;

export function ListaTarefas() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Os dados já chegam prontos do servidor (via HydrateClient),
  // então esta consulta não dispara uma nova requisição ao carregar.
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
      onSuccess: () => {
        // Marca a listagem como desatualizada para que seja buscada de novo.
        queryClient.invalidateQueries({
          queryKey: trpc.tarefa.listar.queryKey(),
        });
        setFeedback({ tipo: 'sucesso', texto: 'Tarefa excluída com sucesso.' });
      },
      onError: (error) => {
        setFeedback({ tipo: 'erro', texto: error.message });
      },
    }),
  );

  function confirmarExclusao(id: string, titulo: string) {
    if (confirm(`Excluir a tarefa "${titulo}"?`)) {
      deletarTarefa({ id });
    }
  }

  let conteudo;

  if (isPending) {
    conteudo = <p className="estado-vazio">Carregando tarefas...</p>;
  } else if (isError) {
    conteudo = (
      <p className="mensagem mensagem-erro">
        Não foi possível carregar as tarefas.
      </p>
    );
  } else if (tarefas.length === 0) {
    conteudo = (
      <div className="estado-vazio">
        <p>Nenhuma tarefa cadastrada.</p>
        <Link href="/tarefas/nova" className="botao botao-primario">
          Criar a primeira tarefa
        </Link>
      </div>
    );
  } else {
    conteudo = (
      <ul className="lista">
        {tarefas.map((tarefa) => {
          // Desabilita apenas o botão da tarefa que está sendo excluída.
          const excluindo = isDeletando && variables?.id === tarefa.id;

          return (
            <li key={tarefa.id} className="cartao">
              <h2>{tarefa.titulo}</h2>
              {tarefa.descricao && <p>{tarefa.descricao}</p>}
              <div className="cartao-rodape">
                <span className="data">
                  Criada em {formatarData(tarefa.dataCriacao)}
                </span>
                <div className="acoes">
                  <Link
                    href={`/tarefas/${tarefa.id}/editar`}
                    className="botao botao-secundario"
                  >
                    Editar
                  </Link>
                  <button
                    className="botao botao-perigo"
                    onClick={() => confirmarExclusao(tarefa.id, tarefa.titulo)}
                    disabled={excluindo}
                  >
                    {excluindo ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <div>
      {feedback && (
        <p role="status" className={`mensagem mensagem-${feedback.tipo}`}>
          {feedback.texto}
        </p>
      )}
      {conteudo}
    </div>
  );
}

function formatarData(timestamp: number) {
  // O fuso fixo evita que servidor e navegador gerem textos diferentes
  // para a mesma data, o que quebraria a hidratação.
  return new Date(timestamp).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
