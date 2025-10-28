import { logger } from '../../utils/logger'

describe('logger (JSON format)', () => {
  const originalLog = console.log
  let output: string[]

  beforeEach(() => {
    output = []
    // @ts-expect-error override for test
    console.log = (msg: string) => {
      output.push(msg)
    }
  })

  afterEach(() => {
    console.log = originalLog
  })

  it('emits parseable JSON with required fields', () => {
    logger.info('test-message', { requestId: 'abc123' })
    expect(output.length).toBeGreaterThan(0)
    const obj = JSON.parse(output[0])
    expect(obj.level).toBe('info')
    expect(obj.service).toBe('medusa')
    expect(obj.message).toBe('test-message')
    expect(typeof obj.ts).toBe('string')
    expect(obj.requestId).toBe('abc123')
  })
})

