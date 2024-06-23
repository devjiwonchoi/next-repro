import spawn from 'cross-spawn'
import { NextInstance } from './base'

export class NextDevInstance extends NextInstance {
  private _cliOutput: string = ''

  public override async start() {
    let startArgs = [
      'pnpm',
      'next',
      // useTurbo ? getTurbopackFlag() : undefined,
    ].filter(Boolean) as string[]

    if (process.env.NEXT_SKIP_ISOLATE) {
      // without isolation yarn can't be used and pnpm must be used instead
      if (startArgs[0] === 'yarn') {
        startArgs[0] = 'pnpm'
      }
    }

    console.log('running', startArgs.join(' '))
    await new Promise<void>((resolve, reject) => {
      try {
        this.childProcess = spawn(startArgs[0]!, startArgs.slice(1), {
          cwd: process.cwd(),
          stdio: ['ignore', 'pipe', 'pipe'],
          shell: false,
          env: {
            ...process.env,
          },
        })
      } catch (err) {
        require('console').error(`Failed to run ${startArgs.join(' ')}`, err)
        setTimeout(() => process.exit(1), 0)
      }
    })
  }
}
