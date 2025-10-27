/* eslint-disable @typescript-eslint/no-explicit-any */
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = (NextAuth as any)({
  providers: [
    (GoogleProvider as any)({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async session({ session }: { session: any }) {
      return session
    },
  },
})

export { handler as GET, handler as POST }
