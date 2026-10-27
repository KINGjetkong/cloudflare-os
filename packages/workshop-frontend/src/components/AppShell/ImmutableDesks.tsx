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

const PRIMARY_HUB_STORAGE_KEY = 'madx:primaryHubId'
const PRIMARY_HUB_TITLE = 'MADX SIGMA6 · Primary Hub'

type HubApi = ReturnType<typeof useAuthenticatedApi>['authenticatedApi']

function readStoredHubId(): string | null {
  try {
    return window.localStorage.getItem(PRIMARY_HUB_STORAGE_KEY)
  } catch {
    return null
  }
}

function storeHubId(id: string) {
  try {
    window.localStorage.setItem(PRIMARY_HUB_STORAGE_KEY, id)
  } catch {
    // private mode: the hub is found again by title next time
  }
}

// listGadgets() hides provisional workspaces (no chat yet), so probe the stored id directly.
async function workspaceExists(api: HubApi, id: string): Promise<boolean> {
  try {
    const overseer = await api.openGadget(id)
    try {
      await overseer.getMetadata()
      return true
    } finally {
      overseer[Symbol.dispose]()
    }
  } catch {
    return false
  }
}

/** Reuses one Primary Hub workspace instead of creating a blank workspace per desk click. */
async function resolvePrimaryHubId(api: HubApi): Promise<string> {
  const stored = readStoredHubId()
  if (stored && await workspaceExists(api, stored)) return stored
  const gadgets = await api.listGadgets()
  const byTitle = gadgets.find(g => g.title === PRIMARY_HUB_TITLE)
  if (byTitle) {
    storeHubId(byTitle.id)
    return byTitle.id
  }
  const overseer = api.newGadget()
  try {
    const { id } = await overseer.getMetadata()
    await overseer.setTitle(PRIMARY_HUB_TITLE)
    storeHubId(id)
    return id
  } finally {
    overseer[Symbol.dispose]()
  }
}

/**
 * Opens the Primary Hub workspace with the named immutable desk tab selected.
 * Does NOT seed a chat prompt — the app is the surface.
 */
export default function ImmutableDesks() {
  const { authenticatedApi } = useAuthenticatedApi()
  const navigate = useNavigate()
  const toasts = useKumoToastManager()

  const openDesk = useCallback(
    async (desk: ImmutableDeskId) => {
      try {
        const id = await resolvePrimaryHubId(authenticatedApi)
        navigate({
          to: '/workspace/$id',
          params: { id },
          search: { desk },
        })
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
