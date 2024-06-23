import { join } from 'node:path'
import { mkdir } from 'node:fs/promises'
import { copyPaste } from '../src/utils'

async function copyFixturesToDist() {
  const target = join(process.cwd(), 'dist', 'fixtures')
  await mkdir(target)
  await copyPaste({
    source: join(process.cwd(), 'fixtures'),
    target,
  })
}

copyFixturesToDist().catch(console.error)
