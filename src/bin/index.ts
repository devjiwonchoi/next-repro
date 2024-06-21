#!/usr/bin/env node
import { join } from 'node:path'
import { mkdir, writeFile } from 'node:fs/promises'
import { copyPaste } from '../utils'
import { name } from '../../package.json'

async function resolvePackageJson({
  targetPath,
  reproName,
}: {
  targetPath: string
  reproName: string
}) {
  const targetPkgPath = join(targetPath, 'package.json')
  const pkgData = {
    reproName,
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
      'next-repro': 'latest',
      typescript: 'latest',
    },
  }

  await writeFile(targetPkgPath, JSON.stringify(pkgData, null, 2))
}

async function resolveTestFile({
  targetPath,
  reproName,
}: {
  targetPath: string
  reproName: string
}) {
  const testFileText = `import { nextTestSetup } from '${name}'

describe('${reproName}', () => {
  const { next } = nextTestSetup({
    files: __dirname,
  })

  // Recommended for tests that check HTML. Cheerio is a HTML parser that has a jQuery like API.
  it('should work using cheerio', async () => {
    const $ = await next.render$('/')
    expect($('p').text()).toBe('hello world')
  })

  // Recommended for tests that need a full browser
  it('should work using browser', async () => {
    const browser = await next.browser('/')
    expect(await browser.elementByCss('p').text()).toBe('hello world')
  })

  // In case you need the full HTML. Can also use $.html() with cheerio.
  it('should work with html', async () => {
    const html = await next.render('/')
    expect(html).toContain('hello world')
  })

  // In case you need to test the response object
  it('should work with fetch', async () => {
    const res = await next.fetch('/')
    const html = await res.text()
    expect(html).toContain('hello world')
  })
})
`

  const testFilePath = join(targetPath, 'index.test.ts')
  await writeFile(testFilePath, testFileText)
}

async function initRepro({
  cwd,
  reproName,
  router,
}: {
  cwd: string
  reproName: string
  router: 'app' | 'pages'
}) {
  const targetPath = join(cwd, reproName)
  await mkdir(targetPath)

  const fixturesDir = join(__dirname, 'fixtures')
  await copyPaste({
    source: fixturesDir,
    target: targetPath,
    options: { router },
  })

  await resolvePackageJson({ targetPath, reproName })
  await resolveTestFile({ targetPath, reproName })
}

initRepro({
  cwd: process.cwd(),
  reproName: 'repro',
  router: 'app',
})
