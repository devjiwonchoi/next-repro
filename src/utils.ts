import { join } from 'node:path'
import { readdir, mkdir, copyFile } from 'node:fs/promises'

export async function copyPaste({
  source,
  target,
  options,
}: {
  source: string
  target: string
  options?: {
    router: 'app' | 'pages'
  }
}) {
  const entries = await readdir(source, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.isDirectory()) {
        if (options?.router && options.router !== entry.name) {
          return
        }

        await mkdir(join(target, entry.name))

        return copyPaste({
          source: join(source, entry.name),
          target: join(target, entry.name),
        })
      }

      if (entry.isFile()) {
        if (entry.name === 'gitignore') {
          return copyFile(join(source, entry.name), join(target, '.gitignore'))
        }
        if (entry.name === 'index.test') {
          return copyFile(join(source, entry.name), join(target, '.gitignore'))
        }
        return copyFile(join(source, entry.name), join(target, entry.name))
      }
    })
  )
}
