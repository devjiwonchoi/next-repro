#!/usr/bin/env node
import { join } from 'node:path'
import { readdir, mkdir, copyFile } from 'node:fs/promises'

async function initRepro({
  cwd,
  name,
  router,
}: {
  cwd: string
  name: string
  router: 'app' | 'pages'
}) {
  const templatePath = join(__dirname, '../templates', router)
  const targetPath = join(cwd, name)

  await copyPaste({
    source: templatePath,
    target: targetPath,
  })
}

async function copyPaste({
  source,
  target,
}: {
  source: string
  target: string
}) {
  const entries = await readdir(source, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.isDirectory()) {
        await mkdir(join(target, entry.name))

        return copyPaste({
          source: join(source, entry.name),
          target: join(target, entry.name),
        })
      }

      if (entry.isFile()) {
        return copyFile(join(source, entry.name), join(target, entry.name))
      }
    })
  )
}
