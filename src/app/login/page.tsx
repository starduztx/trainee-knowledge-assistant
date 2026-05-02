// filepath: src/app/login/page.tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: username,
        password,
        redirect: false
      })

      if (result?.error) {
        setError('Invalid username or password')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <header className="border-b border-neutral-800 bg-neutral-950 text-white shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4">
          <h1 className="text-lg font-semibold tracking-normal text-white">
            Knowledge Assistant
          </h1>
          <span className="text-sm text-white/70">Assessment Login</span>
        </div>
      </header>

      <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 rounded-xl border border-neutral-200 bg-[#fbfbfa] p-8 shadow-sm">
        <div>
          <h2 className="text-center text-2xl font-semibold text-neutral-950">Knowledge Assistant</h2>
          <p className="mt-2 text-center text-sm text-neutral-600">
            Use a mock assessment account
          </p>
          <p className="mt-3 text-center text-sm text-neutral-500">
            <span className="font-mono">admin/admin123</span> or{' '}
            <span className="font-mono">admin1/admin123</span>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-950 shadow-sm outline-none focus:border-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-950 shadow-sm outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded-md border border-transparent bg-neutral-950 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        </div>
      </main>
    </div>
  )
}
