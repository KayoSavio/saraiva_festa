import Image from 'next/image'
import clsx from 'clsx'

/**
 * O mascote sozinho (recortado da logo). Por padrão aponta para a direita.
 * `noite`: versão com o corpo em vermelho acetinado, para fundos escuros.
 */
export default function Mascote({
  className,
  apontaEsquerda = false,
  acena = false,
  noite = false,
}: {
  className?: string
  apontaEsquerda?: boolean
  acena?: boolean
  noite?: boolean
}) {
  return (
    <div className={clsx('pointer-events-none select-none', className)} aria-hidden>
      <Image
        src={noite ? '/mascote-noite.svg' : '/mascote.svg'}
        alt=""
        width={172}
        height={226}
        className={clsx(
          'h-auto w-full',
          apontaEsquerda && '-scale-x-100',
          acena && 'mascote-acena',
          noite && 'drop-shadow-[0_0_1.5px_rgb(255_248_236/0.55)]',
        )}
      />
    </div>
  )
}
