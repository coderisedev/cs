import { getServerSession } from 'next-auth'
import Link from 'next/link'

export default async function AuthStatusPage() {
  const session = (await getServerSession()) as {
    user?: { email?: string; name?: string }
  } | null
  const authed = !!(session && session.user)
  return (
    <main className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-semibold mb-4">Auth Status</h1>
      {authed ? (
        <>
          <p className="mb-6">Signed in as {session?.user?.email || session?.user?.name}</p>
          <Link className="text-blue-600 underline" href="/api/auth/signout">Sign out</Link>
        </>
      ) : (
        <>
          <p className="mb-6">You are not signed in.</p>
          <Link className="text-blue-600 underline" href="/api/auth/signin">Sign in with Google</Link>
        </>
      )}
      <p className="mt-8"><Link className="text-blue-600 underline" href="/shop">Back to shop</Link></p>
    </main>
  )
}
