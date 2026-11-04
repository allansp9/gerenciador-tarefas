import Link from 'next/link';

import { FormularioTarefa } from '@/app/_components/formulario-tarefa';

export default function NovaTarefaPage() {
  return (
    <main>
      <Link href="/" className="voltar">
        ← Voltar para a lista
      </Link>
      <h1 className="titulo-pagina">Nova tarefa</h1>
      <FormularioTarefa />
    </main>
  );
}
