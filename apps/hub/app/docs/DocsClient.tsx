'use client'

import { useEffect, useState } from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

interface OpenApiOperation {
  operationId?: string
  summary?: string
  description?: string
  tags?: string[]
  security?: Array<Record<string, string[]>>
}

type HttpMethodKey = 'get' | 'post' | 'put' | 'patch' | 'delete'

type PathItem = Partial<Record<HttpMethodKey, OpenApiOperation>>

interface OpenApiSpec {
  openapi: string
  info: {
    title: string
    version: string
    description?: string
  }
  paths: Record<string, PathItem>
}

interface FlatOperation extends OpenApiOperation {
  path: string
  method: string
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const METHOD_BADGE: Record<string, string> = {
  get: 'bg-emerald-700 text-white',
  post: 'bg-blue-700 text-white',
  put: 'bg-amber-700 text-white',
  patch: 'bg-orange-700 text-white',
  delete: 'bg-red-700 text-white',
}

const HTTP_METHODS: HttpMethodKey[] = ['get', 'post', 'put', 'patch', 'delete']

function flattenPaths(paths: Record<string, PathItem>): FlatOperation[] {
  return Object.entries(paths).flatMap(([path, pathItem]) =>
    HTTP_METHODS.flatMap((method) => {
      const op = pathItem[method]
      if (!op) return []
      return [{ path, method, ...op }]
    }),
  )
}

function securityLabel(op: OpenApiOperation): string {
  if (!op.security || op.security.length === 0) return 'open'
  const schemes = op.security.flatMap((req) => Object.keys(req))
  if (schemes.includes('hmacAuth')) return 'hmac'
  if (schemes.includes('tokenAuth')) return 'token'
  if (schemes.includes('cronAuth')) return 'cron'
  return schemes[0] ?? 'auth'
}

const SECURITY_BADGE: Record<string, string> = {
  hmac: 'bg-violet-900 text-violet-300',
  token: 'bg-sky-900 text-sky-300',
  cron: 'bg-yellow-900 text-yellow-300',
  open: 'bg-zinc-800 text-zinc-500',
}

// ── Component ────────────────────────────────────────────────────────────────

export function DocsClient() {
  const [spec, setSpec] = useState<OpenApiSpec | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/openapi.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<OpenApiSpec>
      })
      .then(setSpec)
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : 'Failed to load spec'),
      )
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 text-red-400">
        Failed to load API spec: {error}
      </div>
    )
  }

  if (!spec) {
    return (
      <div className="min-h-screen bg-zinc-950 p-8 text-zinc-400">
        Loading API spec…
      </div>
    )
  }

  const operations = flattenPaths(spec.paths)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 px-6 py-10 max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          {spec.info.title}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          OpenAPI {spec.openapi} &nbsp;·&nbsp; v{spec.info.version}
        </p>
        {spec.info.description && (
          <p className="mt-3 text-sm text-zinc-400 max-w-prose leading-relaxed">
            {spec.info.description}
          </p>
        )}
        <p className="mt-4 text-xs text-zinc-600">
          {operations.length} endpoints &nbsp;·&nbsp; spec at{' '}
          <a
            href="/api/openapi.json"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline font-mono"
          >
            /api/openapi.json
          </a>
        </p>
      </header>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-widest text-zinc-500">
              <th className="py-2 pr-3 font-medium w-20">Method</th>
              <th className="py-2 pr-3 font-medium">Path</th>
              <th className="py-2 pr-3 font-medium hidden md:table-cell">Summary</th>
              <th className="py-2 pr-3 font-medium hidden lg:table-cell">Auth</th>
              <th className="py-2 font-medium hidden lg:table-cell">Tags</th>
            </tr>
          </thead>
          <tbody>
            {operations.map((op) => {
              const sec = securityLabel(op)
              return (
                <tr
                  key={`${op.method}:${op.path}`}
                  className="border-b border-zinc-800/40 hover:bg-zinc-900/60 transition-colors"
                >
                  <td className="py-2 pr-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold uppercase ${METHOD_BADGE[op.method] ?? 'bg-zinc-700 text-white'}`}
                    >
                      {op.method}
                    </span>
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-zinc-300 break-all">
                    {op.path}
                  </td>
                  <td className="py-2 pr-3 text-zinc-300 hidden md:table-cell">
                    {op.summary ?? '—'}
                  </td>
                  <td className="py-2 pr-3 hidden lg:table-cell">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-xs font-mono ${SECURITY_BADGE[sec] ?? 'bg-zinc-800 text-zinc-400'}`}
                    >
                      {sec}
                    </span>
                  </td>
                  <td className="py-2 hidden lg:table-cell">
                    {op.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="mr-1 inline-block rounded bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
