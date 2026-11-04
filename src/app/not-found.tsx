import Link from 'next/link';

export default function NaoEncontrado() {
  return (
    <main>
      <div className="estado-vazio">
        <p>A página ou tarefa que você procura não existe.</p>
        <Link href="/" className="botao botao-primario">
          Voltar para a lista
        </Link>
      </div>
    </main>
  );
}
