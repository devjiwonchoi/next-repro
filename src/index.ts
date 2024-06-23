import type { NextInstance } from './next-modes/base'
import { NextDevInstance } from './next-modes/next-dev'

let nextInstance: NextInstance | undefined = undefined

if (typeof afterAll === 'function') {
  afterAll(async () => {
    if (nextInstance) {
      process.exit(0)
    }
  })
}

async function createNext(opts: any) {
  try {
    nextInstance = new NextDevInstance()

    if (!opts.skipStart) {
      await nextInstance.start()
    }

    return nextInstance!
  } catch (err) {
    require('console').error('Failed to create next instance', err)
    try {
      process.exit(1)
    } catch (_) {}

    nextInstance = undefined
    // Throw instead of process exit to ensure that Jest reports the tests as failed.
    throw err
  }
}

export function nextTestSetup(options: any): {
  next: any
} {
  let skipped = false

  let next: any | undefined
  if (!skipped) {
    beforeAll(async () => {
      next = await createNext(options)
    })
    afterAll(async () => {
      // Gracefully destroy the instance if `createNext` success.
      // If next instance is not available, it's likely beforeAll hook failed and unnecessarily throws another error
      // by attempting to destroy on undefined.
      await next?.destroy()
    })
  }

  const nextProxy = new Proxy<any>({} as any, {
    get: function (_target, property) {
      if (!next) {
        throw new Error(
          'next instance is not initialized yet, make sure you call methods on next instance in test body.'
        )
      }
      const prop = next[property]
      return typeof prop === 'function' ? prop.bind(next) : prop
    },
  })

  return {
    get next() {
      return nextProxy
    },
  }
}

nextTestSetup({})
