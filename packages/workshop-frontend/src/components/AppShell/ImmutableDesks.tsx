import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useKumoToastManager } from '@cloudflare/kumo'
import { useAuthenticatedApi } from '../../AuthContext'
import { classifyRpcError, logRpcFailure, rpcFailureDescription } from '../../rpcErrors'

/** Immutable CF OS desks — real right-pane apps, NOT chat prompts. */
export type ImmutableDeskId =
  | 'madtrader'
  | 'lse'
  | 'quantdinger'
  | 'enrich'
  | 'journal'
  | 'edge-stats'
  | 'vela'
  | 'academy'
  | 'algo-hub'
  | 'data-fabric'
  | 'research-loop'
  | 'qc-mirror'
  | 'runs'
  | 'eng-wiki'

type DeskTile = {
  id: ImmutableDeskId
  label: string
  blurb: string
}

const DESKS: DeskTile[] = [
  { id: 'madtrader', label: 'MadTrader', blurb: 'Live desk iframe · :8000' },
  { id: 'data-fabric', label: 'Data APIs', blurb: 'UW · FA · TD · AM · OptionHUD' },
  { id: 'algo-hub', label: 'Algo Hub', blurb: 'Sleeve cards + truncated nodes' },
  { id: 'eng-wiki', label: 'Wiki', blurb: 'Engineering wiki · Devin pack' },
  { id: 'journal', label: 'Journal', blurb: 'Trade journal · :3000' },
  { id: 'edge-stats', label: 'Edge Stats', blurb: 'Edge dashboard · :3343' },
  { id: 'vela', label: 'Vela', blurb: 'Charts playground · :5190' },
  { id: 'lse', label: 'LSE', blurb: 'Charts + Python backtester' },
  { id: 'quantdinger', label: 'Quant', blurb: 'Strategy / paper module' },
  { id: 'enrich', label: 'ENRICH', blurb: 'Enrichment explorer' },
  { id: 'academy', label: 'Academy', blurb: 'Operator wiki' },
  { id: 'research-loop', label: 'Research', blurb: 'IS/OOS · luck bar · cells' },
  { id: 'qc-mirror', label: 'QC Mirror', blurb: 'QuantConnect mirror' },
  { id: 'runs', label: 'Runs', blurb: 'RUN bundle v1 lake' },
]

/**
 * Opens a Primary Hub workspace with the named immutable desk tab selected.
 * Does NOT seed a chat prompt — the app is the surface.
 */
export default function ImmutableDesks() {
  const { authenticatedApi } = useAuthenticatedApi()
  const navigate = useNavigate()
  const toasts = useKumoToastManager()

  const openDesk = useCallback(
    async (desk: ImmutableDeskId) => {
      try {
        const overseer = authenticatedApi.newGadget()
        try {
          const { id } = await overseer.getMetadata()
          navigate({
            to: '/workspace/$id',
            params: { id },
            search: { desk },
          })
        } finally {
          overseer[Symbol.dispose]()
        }
      } catch (err) {
        const transient = logRpcFailure('Failed to open immutable desk:', err, {
          reportSite: 'immutable.desk.open',
        })
        if (!transient && classifyRpcError(err) !== 'connection') {
          toasts.add({
            title: 'Could not open desk',
            description: rpcFailureDescription(err),
            variant: 'error',
          })
        }
      }
    },
    [authenticatedApi, navigate, toasts],
  )

  return (
    <section aria-label="Immutable desks" className="w-full">
      <h3 className="mb-2 px-2 text-[12px] font-semibold tracking-[0.08em] text-kumo-subtle uppercase">
        Immutable desks
      </h3>
      <p className="mb-3 px-2 text-[12px] leading-4 text-kumo-subtle">
        Real shell tabs — not Get Started prompts. Opens chat left · desk right on :8788.
      </p>
      <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
        {DESKS.map(d => (
          <li key={d.id}>
            <button
              type="button"
              onClick={() => void openDesk(d.id)}
              className="press group flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-kumo-tint"
            >
              <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg bg-kumo-fill text-[10px] font-bold tracking-wide text-kumo-brand uppercase">
                APP
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] leading-[18px] font-medium tracking-[-0.25px] text-kumo-default">
                  {d.label}
                </span>
                <span className="block truncate text-[12px] leading-4 tracking-[-0.2px] text-kumo-subtle">
                  {d.blurb}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
