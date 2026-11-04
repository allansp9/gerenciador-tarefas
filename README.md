# Gerenciador de Tarefas

Aplicação simples de gerenciamento de tarefas feita com **Next.js 15 (App Router)** e **tRPC**, com as tarefas mantidas em memória no servidor.

## Como executar

Pré-requisito: Node.js 18.18 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

> Como os dados ficam em memória, as tarefas são apagadas sempre que o servidor é reiniciado.

## Funcionalidades

- Listagem de tarefas com **Server-Side Rendering**
- Criação e edição de tarefas por formulário com validação
- Exclusão direto na listagem, com mensagem de sucesso ou erro
- Tratamento de erros do backend (ex.: tarefa inexistente) exibido na interface
- Estados de carregamento, com botões desabilitados durante as requisições

## Estrutura

```
src/
├── app/
│   ├── page.tsx                      # Listagem (SSR)
│   ├── tarefas/nova/page.tsx         # Criação
│   ├── tarefas/[id]/editar/page.tsx  # Edição
│   ├── _components/                  # Componentes de cliente (lista e formulário)
│   └── api/trpc/[trpc]/route.ts      # Endpoint HTTP do tRPC
├── schemas/tarefa.ts                 # Schemas Zod compartilhados entre front e back
├── server/banco-em-memoria.ts        # Armazenamento em memória
└── trpc/
    ├── init.ts                       # Inicialização do tRPC
    ├── routers/                      # Routers e procedures (CRUD)
    ├── client.tsx                    # Cliente para componentes do navegador
    ├── server.tsx                    # Acesso direto ao router na SSR
    └── query-client.ts               # Configuração do React Query
```

## Principais decisões

- **Next.js 15**: o enunciado pede a v15 explicitamente; por isso foi usada essa versão, mesmo já existindo a 16.
- **SSR na listagem**: a página é renderizada a cada requisição (`dynamic = 'force-dynamic'`), pois a lista muda constantemente e não poderia ser gerada estaticamente. O servidor busca as tarefas chamando o router diretamente, sem HTTP, e envia os dados já carregados ao React Query do navegador.
- **Validação compartilhada**: o mesmo schema Zod valida o formulário no navegador (resposta imediata ao usuário) e as procedures no servidor (garantia de segurança, já que os tipos do TypeScript não existem em tempo de execução).
- **Códigos de erro**: ids com formato inválido retornam `BAD_REQUEST` (validação do Zod) e ids inexistentes retornam `NOT_FOUND`, separando "pedido mal formado" de "recurso inexistente".
- **id e data de criação gerados no servidor**: o cliente não pode definir esses valores.
- **Duas páginas, um formulário**: criação e edição têm URLs próprias e necessidades diferentes (a edição busca a tarefa no servidor), mas reaproveitam o mesmo componente de formulário.
- **Atualização completa**: a edição sempre envia título e descrição, evitando a ambiguidade de campos ausentes.
- **Armazenamento no `globalThis`**: garante uma única lista mesmo com o hot reload do modo de desenvolvimento e com os diferentes pacotes gerados pelo Next.
- **Data como número**: `dataCriacao` é um timestamp em milissegundos, já que o JSON não possui tipo de data. Uma alternativa seria usar a biblioteca **superjson** como transformer do tRPC, que serializa e reconstrói objetos `Date` automaticamente; optei pelo número para manter a configuração mais simples.

## Tecnologias

Next.js 15, React, TypeScript, tRPC v11, TanStack React Query, Zod.
