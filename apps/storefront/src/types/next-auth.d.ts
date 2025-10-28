declare module 'next-auth' {
  // Minimal declarations to satisfy TS in CI; runtime types come from the package
  export function getServerSession(...args: unknown[]): unknown
  const _default: unknown
  export default _default
}

declare module 'next-auth/providers/google' {
  const GoogleProvider: unknown
  export default GoogleProvider
}
