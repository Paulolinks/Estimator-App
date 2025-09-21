import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // Add your auth providers here
    // For now, we'll use a placeholder
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user && user) {
        (session.user as any).id = user.id
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
}
