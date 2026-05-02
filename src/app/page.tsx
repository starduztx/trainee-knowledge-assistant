// filepath: src/app/page.tsx
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Dashboard } from '@/components/Dashboard'

export default async function Home() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <header className="border-b border-neutral-800 bg-neutral-950 text-white shadow-sm">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4">
          <h1 className="text-lg font-semibold tracking-normal text-white">
            Knowledge Assistant
          </h1>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-white">
              {session.user?.email}
            </span>
            <form action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm text-white/85 hover:bg-white/10 hover:text-white"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <Dashboard currentUser={session.user?.email || 'unknown'} />
    </div>
  )
}
