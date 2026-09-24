import type { Metadata, Viewport } from 'next'
import { Palanquin, Palanquin_Dark, Shrikhand } from 'next/font/google'
import './globals.css'

const display = Shrikhand({
  variable: '--nf-display',
  subsets: ['latin'],
  weight: '400',
})

const body = Palanquin({
  variable: '--nf-body',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const label = Palanquin_Dark({
  variable: '--nf-label',
  subsets: ['latin'],
  weight: ['500', '600'],
})

// Esconde a abertura até a animação começar, sem piscar. Se o JS falhar, tudo aparece em 2,5s.
const ANIMA_ESPERA = `if(!matchMedia("(prefers-reduced-motion: reduce)").matches){var d=document.documentElement;d.classList.add("anima-espera");setTimeout(function(){d.classList.remove("anima-espera")},2500)}`

export const metadata: Metadata = {
  title: 'Espaço Festas Saraiva | Salão de festas em Volta Redonda',
  description:
    'Salão climatizado para até 150 convidados, com área gourmet e churrasqueira, em Volta Redonda (RJ). Veja as datas livres e reserve online.',
  icons: { icon: '/saraivaFesta.svg' },
}

export const viewport: Viewport = {
  themeColor: '#C8262C',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${label.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ANIMA_ESPERA }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
