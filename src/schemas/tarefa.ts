import { z } from 'zod';

// Schemas compartilhados entre backend e frontend
// (validação do formulário). Fica fora da pasta server para poder ser
// importado pelo navegador, por isso não deve importar nada exclusivo do servidor.

export const tarefaSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, 'O título é obrigatório')
    .max(100, 'O título deve ter no máximo 100 caracteres'),
  descricao: z
    .string()
    .trim()
    .max(500, 'A descrição deve ter no máximo 500 caracteres')
    .optional(),
});

// Separado do tarefaSchema porque o id não é preenchido pelo usuário:
// é gerado pelo servidor e só é usado para identificar a tarefa.
export const idTarefaSchema = z.object({
  id: z.string().uuid('O ID da tarefa deve ser um UUID válido'),
});
