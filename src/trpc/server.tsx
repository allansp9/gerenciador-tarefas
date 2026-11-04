import 'server-only'; // Gera erro se este arquivo for importado no navegador.

import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { headers } from 'next/headers';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';

// cache() garante o mesmo QueryClient durante uma mesma requisição,
// e um novo a cada requisição diferente.
export const getQueryClient = cache(makeQueryClient);

const createContext = async () =>
  createTRPCContext({ headers: await headers() });

// Chama o router diretamente, sem passar por HTTP,
// já que o backend e frontend estão no mesmo servidor.
export const trpc = createTRPCOptionsProxy({
  ctx: createContext,
  router: appRouter,
  queryClient: getQueryClient,
});

// Para buscar dados no servidor sem envolver o cache do React Query.
export const caller = appRouter.createCaller(createContext);

// Empacota os dados buscados no servidor e os entrega aos componentes do navegador.
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
