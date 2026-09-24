import Image from 'next/image'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth'
import LoginForm from './LoginForm'

export const metadata = { title: 'Entrar | Painel Saraiva', robots: { index: false } }

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin')
  return (
    <main className="flex min-h-svh items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <Image src="/saraivaFesta.svg" alt="Espaço Festas Saraiva" width={200} height={124} className="mx-auto h-auto w-44" />
        <div className="mt-8 rounded-[28px] bg-palco-claro p-7 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.35)]">
          <h1 className="font-display text-2xl">Painel da agenda</h1>
          <LoginForm />
        </div>
      </div>
    </main>
  )
}
