export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const SERVICE = 'medusa'

export function log(level: LogLevel, message: string, meta: Record<string, unknown> = {}) {
  const entry = {
    ts: new Date().toISOString(),
    level,
    service: SERVICE,
    message,
    ...meta,
  }
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry))
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
}

