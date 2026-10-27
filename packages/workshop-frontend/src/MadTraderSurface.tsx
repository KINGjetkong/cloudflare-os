import { useEffect, useState } from 'react'

/** Live MadTrader (Vibe-Trading) SPA — primary RIGHT surface for MADX SIGMA6. */
export const MADTRADER_LOCAL_URL = 'http://127.0.0.1:8000/'

function isTrycloudHost(hostname: string): boolean {
  return hostname.endsWith('.trycloudflare.com') || hostname.endsWith('.cloudflare.com')
}

function isLocalHost(hostname: string): boolean {
  return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '[::1]'
}

/**
 * Parent-Workshop iframe for MadTrader. Gadget sandboxes set `frame-src 'none'`, so the live
 * :8000 SPA cannot live inside a gadget — it must sit in the Workshop right pane (this component).
 *
 * Local `:8788` → iframe hits loopback MadTrader.
 * Public trycloud → browser cannot reach the Mac's :8000; show the limitation card instead.
 */
export default function MadTraderSurface({ height = '100%' }: { height?: string | number }) {
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
    fetch('http://127.0.0.1:8000/health', { signal: ctrl.signal, mode: 'cors' })
      .then((r) => {
        if (!cancelled) setProbe(r.ok ? 'ok' : 'down')
      })
      .catch(() => {
        if (!cancelled) setProbe('down')
      })
      .finally(() => window.clearTimeout(timer))
    return () => {
      cancelled = true
      ctrl.abort()
    }
  }, [localContext])

  if (publicContext) {
    return (
      <div
        className="flex h-full min-h-0 flex-col gap-3 overflow-auto bg-kumo-base p-6 text-kumo-default"
        style={{ height }}
      >
        <h2 className="text-lg font-semibold tracking-tight">MadTrader — local only</h2>
        <p className="max-w-lg text-[14px] leading-5 text-kumo-subtle">
          This trycloud tab cannot iframe <code className="text-kumo-default">127.0.0.1:8000</code> on
          your Mac. Open MADX SIGMA6 locally for the live right pane:
        </p>
        <a
          className="w-fit text-[14px] font-medium text-kumo-brand underline-offset-2 hover:underline"
          href="http://127.0.0.1:8788/"
          target="_blank"
          rel="noreferrer"
        >
          http://127.0.0.1:8788/
        </a>
        <p className="max-w-lg text-[13px] leading-5 text-kumo-subtle">
          Left chat (Ask/Make + Accept/Discard) still works here. Exercise strategies on the Mac at{' '}
          <code className="text-kumo-default">{MADTRADER_LOCAL_URL}</code> or via the local SIGMA6 split.
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-kumo-base" style={{ height }}>
      <div className="flex shrink-0 items-center gap-2 border-b border-kumo-line bg-kumo-tint px-3 py-1.5">
        <span className="text-[11px] font-semibold tracking-[0.14em] text-kumo-brand uppercase">
          MADX
        </span>
        <span className="text-[11px] text-kumo-subtle">·</span>
        <span className="text-[12px] font-semibold tracking-tight text-kumo-default">MadTrader</span>
        <span className="min-w-0 flex-1 truncate text-[11px] text-kumo-subtle">
          research chat leaf inside the shell — never a separate branded desk
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
          MadTrader not answering on :8000 — start Vibe-Trading, then refresh this tab. Chat on the
          left still works. Do not Accept a fake desk in the App tab as a substitute.
        </div>
      )}
      <iframe
        title="MadTrader — immutable live Vibe"
        src={MADTRADER_LOCAL_URL}
        className="min-h-0 w-full flex-1 border-0 bg-white"
        // Parent Workshop frame (not gadget sandbox) — allow scripts/forms for the live SPA.
        allow="clipboard-read; clipboard-write"
        referrerPolicy="no-referrer"
      />
    </div>
  )
}
