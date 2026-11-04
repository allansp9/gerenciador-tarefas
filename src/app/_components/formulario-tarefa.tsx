'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { tarefaSchema } from '@/schemas/tarefa';
import type { Tarefa } from '@/server/banco-em-memoria';
import { useTRPC } from '@/trpc/client';

type ErrosFormulario = { titulo?: string; descricao?: string };

// Formulário compartilhado entre criação e edição.
// Se receber uma tarefa, está em modo de edição; caso contrário, criação.
export function FormularioTarefa({ tarefa }: { tarefa?: Tarefa }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [titulo, setTitulo] = useState(tarefa?.titulo ?? '');
  const [descricao, setDescricao] = useState(tarefa?.descricao ?? '');
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [erroServidor, setErroServidor] = useState('');
  const [sucesso, setSucesso] = useState('');

  async function aoSalvarComSucesso() {
    // Marca a lista como desatualizada para que seja buscada de novo.
    await queryClient.invalidateQueries({
      queryKey: trpc.tarefa.listar.queryKey(),
    });
    setSucesso('Tarefa salva com sucesso! Voltando para a lista...');
    setTimeout(() => router.push('/'), 1000);
  }

  function aoFalhar(error: { message: string }) {
    setErroServidor(error.message);
  }

  const criar = useMutation(
    trpc.tarefa.criar.mutationOptions({
      onSuccess: aoSalvarComSucesso,
      onError: aoFalhar,
    }),
  );

  const atualizar = useMutation(
    trpc.tarefa.atualizar.mutationOptions({
      onSuccess: aoSalvarComSucesso,
      onError: aoFalhar,
    }),
  );

  // Bloqueia novos envios durante a requisição e após o sucesso.
  const salvando = criar.isPending || atualizar.isPending || sucesso !== '';

  function salvar() {
    setErroServidor('');

    // Validação no frontend com o mesmo schema usado no backend.
    // Melhora a experiência, mas não substitui a validação do servidor.
    const resultado = tarefaSchema.safeParse({ titulo, descricao });

    if (!resultado.success) {
      const { fieldErrors } = z.flattenError(resultado.error);
      setErros({
        titulo: fieldErrors.titulo?.[0],
        descricao: fieldErrors.descricao?.[0],
      });
      return;
    }

    setErros({});

    if (tarefa) {
      atualizar.mutate({ id: tarefa.id, ...resultado.data });
    } else {
      criar.mutate(resultado.data);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
    >
      <div>
        <label htmlFor="titulo">Título:</label>
        <input
          type="text"
          id="titulo"
          name="titulo"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          disabled={salvando}
        />
        {erros.titulo && <p>{erros.titulo}</p>}
      </div>

      <div>
        <label htmlFor="descricao">Descrição:</label>
        <textarea
          id="descricao"
          name="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          disabled={salvando}
        />
        {erros.descricao && <p>{erros.descricao}</p>}
      </div>

      {erroServidor && <p>{erroServidor}</p>}
      {sucesso && <p>{sucesso}</p>}

      <button type="submit" disabled={salvando}>
        {criar.isPending || atualizar.isPending ? 'Salvando...' : 'Salvar'}
      </button>
      <Link href="/">Cancelar</Link>
    </form>
  );
}
