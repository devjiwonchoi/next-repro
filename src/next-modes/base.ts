import type { ChildProcess } from 'child_process'
import qs from 'querystring'
import { load } from 'cheerio'

export function withQuery(
  pathname: string,
  query: Record<string, any> | string
) {
  const querystring = typeof query === 'string' ? query : qs.stringify(query)
  if (querystring.length === 0) {
    return pathname
  }

  // If there's a `?` between the pathname and the querystring already, then
  // don't add another one.
  if (querystring.startsWith('?') || pathname.endsWith('?')) {
    return `${pathname}${querystring}`
  }

  return `${pathname}?${querystring}`
}

export function fetchViaHTTP(
  port: string | number,
  pathname: string,
  opts?: RequestInit
): Promise<Response> {
  return fetch(`http://localhost:${port}${pathname}`, opts)
}

export function renderViaHTTP(pathname: string, opts?: RequestInit) {
  return fetchViaHTTP(3000, pathname, opts).then((res) => res.text())
}

export class NextInstance {
  protected files: string | undefined
  protected _url!: string
  protected childProcess?: ChildProcess
  protected events: { [eventName: string]: Set<any> } = {}

  constructor() {}

  public async start(useDirArg: boolean = false): Promise<void> {}
  public async stop(): Promise<void> {
    process.exit(0)
  }

  public get url() {
    return `http://localhost:3000`
  }

  // public async browser(...args: any[]): Promise<BrowserInterface> {
  //   return webdriver(this.url, '', ...args)
  // }

  public async render$(...args: any): Promise<ReturnType<typeof load>> {
    const html = await renderViaHTTP(this.url, ...args)
    return load(html)
  }

  public async render(...args: any) {
    return renderViaHTTP(this.url, ...args)
  }

  public async fetch(
    pathname: string,
    opts?: import('node-fetch').RequestInit
  ) {
    return fetchViaHTTP(this.url, pathname, opts as any)
  }
}
