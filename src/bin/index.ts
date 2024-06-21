#!/usr/bin/env node
import { join } from 'node:path'
import { readdir, mkdir, copyFile, writeFile } from 'node:fs/promises'

async function copyPaste({
  source,
  target,
  options,
}: {
  source: string
  target: string
  options?: {
    isApp: boolean
  }
}) {
  const entries = await readdir(source, { withFileTypes: true })

  await Promise.all(
    entries.map(async (entry) => {
      if (entry.isDirectory()) {
        if (
          (options?.isApp && entry.name === 'pages') ||
          (!options?.isApp && entry.name === 'app')
        ) {
          return
        }

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

async function resolvePackageJson({
  targetPath,
  name,
}: {
  targetPath: string
  name: string
}) {
  const targetPkgPath = join(targetPath, 'package.json')
  const pkgData = {
    name,
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      test: '',
    },
    dependencies: {
      next: 'canary',
      react: 'rc',
      'react-dom': 'rc',
    },
    devDependencies: {
      '@types/node': 'latest',
      '@types/react': 'latest',
      '@types/react-dom': 'latest',
      typescript: 'latest',
    },
  }

  await writeFile(targetPkgPath, JSON.stringify(pkgData, null, 2))
}

async function initRepro({
  cwd,
  name,
  router,
}: {
  cwd: string
  name: string
  router: 'app' | 'pages'
}) {
  const targetPath = join(cwd, name)
  await mkdir(targetPath)

  const fixturesDir = join(__dirname, 'fixtures')
  await copyPaste({
    source: fixturesDir,
    target: targetPath,
    options: { isApp: router === 'app' },
  })

  await resolvePackageJson({ targetPath, name })
}

initRepro({
  cwd: process.cwd(),
  name: 'repro',
  router: 'app',
})