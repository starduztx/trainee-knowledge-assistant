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
      <header className="border-b border-neutral-200 bg-[#fbfbfa]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-3">
          <h1 className="text-lg font-semibold tracking-normal text-neutral-950">
            Knowledge Assistant
          </h1>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-sm text-neutral-600">
              {session.user?.email}
            </span>
            <form action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}>
              <button
                type="submit"
                className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
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
