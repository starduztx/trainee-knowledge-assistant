// filepath: src/lib/auth.config.ts
import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
  providers: [], // we configure providers in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login'
  },
  session: {
    strategy: 'jwt'
  }
} satisfies NextAuthConfig
