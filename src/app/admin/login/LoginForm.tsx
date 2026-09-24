'use client'

import { useActionState } from 'react'
import { login } from '../actions'

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)
  return (
    <form action={action} className="mt-5 space-y-4">
      <label className="block">
        <span className="font-label text-sm">Senha</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          className="mt-2 w-full rounded-xl border border-cartola/20 bg-white/70 px-4 py-3 focus:border-veludo focus:outline-none focus:ring-2 focus:ring-veludo/15"
        />
      </label>
      {state?.error && (
        <p className="text-sm text-veludo" role="alert">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="w-full rounded-full bg-veludo py-3 font-label text-palco-claro transition hover:bg-veludo-escuro disabled:opacity-60"
      >
        {pending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
