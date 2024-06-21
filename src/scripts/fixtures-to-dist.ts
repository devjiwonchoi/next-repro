import { join } from 'node:path'
import { copyPaste } from '../utils'
import { mkdir } from 'node:fs/promises'

async function copyFixturesToDist() {
  const target = join(process.cwd(), 'dist', 'fixtures')
  await mkdir(target)
  await copyPaste({
    source: join(__dirname, '../fixtures'),
    target,
  })
}

copyFixturesToDist().catch(console.error)
