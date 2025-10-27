declare module 'next-auth' {
  // Minimal declarations to satisfy TS in CI; runtime types come from the package
  export function getServerSession(...args: any[]): any
  const _default: any
  export default _default
}

declare module 'next-auth/providers/google' {
  const GoogleProvider: any
  export default GoogleProvider
}

