import { useEffect, useState } from 'react'

export type VendorLiveSpec = {
  id: string
  /** Short CF OS tab / module name (MADX language — not upstream product marketing). */
  title: string
  url: string
  healthUrl?: string
  blurb: string
}

function isTrycloudHost(hostname: string): boolean {
  return hostname.endsWith('.trycloudflare.com') || hostname.endsWith('.cloudflare.com')
}

function isLocalHost(hostname: string): boolean {
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]'
}

/**
 * Module pane inside MADX SIGMA6 / Cloudflare OS.
 * The shell never leaves — upstream SPAs are stolen as iframes under MADX chrome (kumo orange),
 * not opened as independent branded apps in new browser tabs.
 */
export default function VendorLiveSurface({
  spec,
  height = '100%',
}: {
  spec: VendorLiveSpec
  height?: string | number
}) {
  const [host, setHost] = useState(() =>
    typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1',
  )
  const [probe, setProbe] = useState<'idle' | 'ok' | 'down'>('idle')

  useEffect(() => {
    setHost(window.location.hostname)
  }, [])

  const publicContext = isTrycloudHost(host)
  const localContext = isLocalHost(host)

  useEffect(() => {
    if (!localContext) return
    let cancelled = false
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 2500)
    const probeUrl = spec.healthUrl || spec.url
    // no-cors: vendor apps send no CORS headers, so an opaque reply still proves the port is up.
    fetch(probeUrl, { signal: ctrl.signal, mode: 'no-cors' })
      .then((r) => {
        if (!cancelled) setProbe(r.type === 'opaque' || r.ok || r.status === 404 ? 'ok' : 'down')
      })
      .catch(() => {
        if (!cancelled) setProbe('down')
      })
      .finally(() => window.clearTimeout(timer))
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [localContext, spec.healthUrl, spec.url])

  if (publicContext) {
    return (
      <div
        className="flex h-full min-h-0 flex-col gap-3 overflow-auto bg-kumo-base p-6 text-kumo-default"
        style={{ height }}
      >
        <p className="text-[11px] font-semibold tracking-[0.12em] text-kumo-brand uppercase">
          MADX SIGMA6
        </p>
        <h2 className="text-lg font-semibold tracking-tight">{spec.title} — open the shell</h2>
        <p className="max-w-lg text-[14px] leading-5 text-kumo-subtle">
          Modules only load inside the Cloudflare OS frame on your Mac. Do not treat upstream
          login pages as separate products.
        </p>
        <a
          className="w-fit text-[14px] font-medium text-kumo-brand underline-offset-2 hover:underline"
          href="http://127.0.0.1:8788/"
          rel="noreferrer"
        >
          http://127.0.0.1:8788/
        </a>
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-kumo-base" style={{ height }}>
      {/* MADX chrome — steals CF OS kumo brand orange; shell identity stays on screen */}
      <div className="flex shrink-0 items-center gap-2 border-b border-kumo-line bg-kumo-tint px-3 py-1.5">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-kumo-brand uppercase">
          MADX
        </span>
        <span className="text-[11px] text-kumo-subtle">·</span>
        <span className="text-[12px] font-semibold tracking-tight text-kumo-default">{spec.title}</span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-kumo-subtle">
          {spec.blurb}
        </span>
        <span
          className={
            probe === 'ok'
              ? 'text-[10px] font-medium uppercase tracking-wide text-kumo-success'
              : probe === 'down'
                ? 'text-[10px] font-medium uppercase tracking-wide text-kumo-danger'
                : 'text-[10px] font-medium uppercase tracking-wide text-kumo-subtle'
          }
        >
          {probe === 'ok' ? 'in shell' : probe === 'down' ? 'module down' : '…'}
        </span>
      </div>
      {probe === 'down' && (
        <div className="shrink-0 border-b border-kumo-line bg-kumo-tint px-3 py-2 text-[12px] text-kumo-subtle">
          Module not answering inside the shell — start its LaunchAgent, stay on{' '}
          <span className="text-kumo-default">:8788</span>, then refresh this tab. Do not open a
          separate branded browser window as a workaround.
        </div>
      )}
      <iframe
        title={`MADX · ${spec.title}`}
        src={spec.url}
        className="min-h-0 w-full flex-1 border-0 bg-kumo-base"
        allow="clipboard-read; clipboard-write"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}

export const LSE_TERMINAL_SPEC: VendorLiveSpec = {
  id: 'lse',
  title: 'LSE',
  url: 'http://127.0.0.1:7788/?madx=1',
  blurb: 'charts + Python backtester — module inside the shell',
}

export const QUANTDINGER_SPEC: VendorLiveSpec = {
  id: 'quantdinger',
  title: 'Quant',
  url: 'http://127.0.0.1:8888/?madx=1',
  blurb: 'strategy / backtest / paper module — use shell tab, not a separate login site',
}

export const ENRICH_SPEC: VendorLiveSpec = {
  id: 'enrich',
  title: 'ENRICH',
  url: 'http://127.0.0.1:7790/enrich/?madx=1',
  blurb: 'enrichment explorer via Tool Port',
}

export const TRADE_JOURNAL_SPEC: VendorLiveSpec = {
  id: 'journal',
  title: 'Journal',
  url: 'http://127.0.0.1:3000/?madx=1',
  blurb: 'trade journal module — chat stays MadTrader',
}

export const EDGE_STATS_SPEC: VendorLiveSpec = {
  id: 'edge-stats',
  title: 'Edge Stats',
  url: 'http://127.0.0.1:3343/?madx=1',
  blurb: 'edge dashboard module',
}

export const VELA_SPEC: VendorLiveSpec = {
  id: 'vela',
  title: 'Vela',
  url: 'http://127.0.0.1:5190/?madx=1',
  blurb: 'charts playground module',
}

export const ACADEMY_SPEC: VendorLiveSpec = {
  id: 'academy',
  title: 'Academy',
  url: 'http://127.0.0.1:7790/academy/?madx=1',
  blurb: 'operator docs inside the shell — same MADX chrome',
}

export const ALGO_HUB_SPEC: VendorLiveSpec = {
  id: 'algo-hub',
  title: 'Algo Hub',
  url: 'http://127.0.0.1:7790/algo_hub/?madx=1',
  healthUrl: 'http://127.0.0.1:7790/api/v1/health',
  blurb: 'immutable sleeve cards + truncated node graphs — not a chat prompt',
}

export const DATA_FABRIC_SPEC: VendorLiveSpec = {
  id: 'data-fabric',
  title: 'Data APIs',
  url: 'http://127.0.0.1:7790/data_fabric/?madx=1',
  healthUrl: 'http://127.0.0.1:7790/api/v1/data_fabric',
  blurb: 'UW · FA · TD · AM · OptionHUD · institutional endpoints — immutable registry',
}

export const RESEARCH_LOOP_SPEC: VendorLiveSpec = {
  id: 'research-loop',
  title: 'Research',
  url: 'http://127.0.0.1:7790/research_loop/?madx=1',
  healthUrl: 'http://127.0.0.1:7790/api/v1/health',
  blurb: 'IS/OOS cells · luck bar · ResearchRun — immutable workspace',
}

export const QC_MIRROR_SPEC: VendorLiveSpec = {
  id: 'qc-mirror',
  title: 'QC Mirror',
  url: 'http://127.0.0.1:7790/qc_mirror/?madx=1',
  healthUrl: 'http://127.0.0.1:7790/api/v1/health',
  blurb: 'QuantConnect mirror — paper/sim only',
}

export const RUNS_SPEC: VendorLiveSpec = {
  id: 'runs',
  title: 'Runs',
  url: 'http://127.0.0.1:7790/runs/?madx=1',
  healthUrl: 'http://127.0.0.1:7790/api/v1/health',
  blurb: 'RUN bundle v1 lake — provenance-tagged results',
}

export const ENG_WIKI_SPEC: VendorLiveSpec = {
  id: 'eng-wiki',
  title: 'Wiki',
  url: 'http://127.0.0.1:7790/eng_wiki/?madx=1',
  healthUrl: 'http://127.0.0.1:7790/api/v1/health',
  blurb: 'Engineering wiki (Devin pack) — immutable diagrams + subsystem pages',
}
