import { useMemo } from 'react'
import {
  AppWindow,
  ChartLineUp,
  FileText,
  GearSix,
  Lightning,
  Notebook,
  Presentation,
  type Icon,
} from '@phosphor-icons/react'

// A few example work tasks shown under the Home composer, so a new user immediately sees the kind
// of thing they can ask for. Picking one drops a starter prompt into the composer (it does not
// auto-send) so the user can tweak it before running.
type TaskSuggestion = {
  id: string
  label: string
  description: string
  prompt: string
  icon: Icon
}

// Formats are advertised by example rather than by a row of "Start with Docs" buttons, so the
// first move isn't "pick a file type". The formats themselves are in the composer's `+` menu.
const SUGGESTIONS: TaskSuggestion[] = [
  {
    id: 'madtrader-desk',
    label: 'Open a MadTrader desk',
    description: 'Chat left · MadTrader tab right — stay on :8788',
    icon: FileText,
    prompt:
      'SHELL RULE: Cloudflare OS at http://127.0.0.1:8788/ never leaves the screen. Modules are right-pane tabs under MADX chrome — never open :8000/:3000/:8888 as separate branded apps.\n\nIMMUTABLE: Do NOT build, invent, mock, or Accept any MadTrader / trading-desk UI or gadget. Click the MadTrader tab inside :8788 (iframe to the live engine). App/Gadget tab is NOT MadTrader.\n\nLeft chat = Ask/Make only. Strategy canon = HGTFC 28-algo option-native. Reply: (1) click MadTrader tab, (2) ask session + account size if needed, (3) SHORT text desk brief as CHAT TEXT ONLY.',
  },
  {
    id: 'open-lse',
    label: 'Open LSE Terminal',
    description: 'LSE tab inside the shell — not a separate site',
    icon: AppWindow,
    prompt:
      'SHELL RULE: stay on http://127.0.0.1:8788/. IMMUTABLE: Do NOT invent an LSE UI and do NOT tell me to open :7788 in a new browser tab.\n\nTell me: (1) click the LSE tab in CF OS, (2) confirm Tool Port mount ws_lse_terminal, (3) charts + Python backtester. Call launch_madtrades_workspace workspace_id=ws_lse_terminal if useful. No fake gadgets.',
  },
  {
    id: 'open-forks',
    label: 'Show modules in the shell',
    description: 'MadTrader · LSE · Quant · Journal · Edge · Vela — tabs only',
    icon: ChartLineUp,
    prompt:
      'SHELL RULE: one door = http://127.0.0.1:8788/. List LIVE modules as CF OS right-pane tabs only (MADX chrome, kumo orange) — never as separate brands or browser tabs:\n1) MadTrader  2) LSE  3) Quant  4) ENRICH  5) Journal  6) Edge Stats  7) Vela  8) Academy  9) Algo Hub\nUpstream ports are engines under the iframe, not destinations. Chat: analyze_trade_journal + list_suite_engines. Plain English: which tabs to click. Do NOT build substitute UIs. Do NOT say open :3000/:8888/:7788.',
  },
  {
    id: 'algo-nodes',
    label: 'Open Algo Hub node graphs',
    description: 'Every algo as truncated SOURCE→SIGNAL→DECISION nodes',
    icon: ChartLineUp,
    prompt:
      'SHELL RULE: stay on :8788. IMMUTABLE: click the Algo Hub tab inside CF OS (iframe to :7790/algo_hub) — do NOT open a separate branded window.\n\nThen: (1) call algo_nodes_status, (2) if DATA_GAP call algo_nodes_rebuild limit=40, (3) open a sleeve drawer and confirm truncated node SVG loads. Chat text only after that — no fake graph gadget.',
  },
  {
    id: 'journal-edge-vela',
    label: 'Journal · Edge Stats · Vela',
    description: 'Shell tabs + chat tools — dual surface',
    icon: Notebook,
    prompt:
      'SHELL RULE: stay on :8788. IMMUTABLE: keep the real LuxAlgo engines as Journal / Edge Stats / Vela tabs inside CF OS. Do NOT invent fake dashboards. Do NOT open :3000/:3343/:5190 as separate apps.\n\nDual surface:\n1) Click Journal / Edge Stats / Vela tabs in the shell.\n2) Chat: list_suite_engines; offer analyze_trade_journal.\n3) If down: bash tools/ensure_suite_ui_forks.sh then refresh the shell tab.\nPlain English only.',
  },
  {
    id: 'academy',
    label: 'Open Academy (training wiki)',
    description: 'Academy tab in CF OS — same MADX chrome',
    icon: Presentation,
    prompt:
      'SHELL RULE: stay on :8788. IMMUTABLE: click the Academy tab inside Cloudflare OS (not a raw :7790/academy browser tab). Primary pages match shell tabs (MadTrader, LSE, Quant, ENRICH, Journal, Edge Stats, Vela, Academy). Read SHELL_ONE_DOOR first. Lab = research that is NOT a tab. Do NOT invent a fake docs gadget.',
  },
  {
    id: 'engines-cleaner',
    label: 'Bring engines out of the garage',
    description: 'List suite engines + cleaner + Jetset — Tool Port desk mounts',
    icon: GearSix,
    prompt:
      'IMMUTABLE: Do NOT invent, mock, or Accept any MadTrader / trading-desk UI or gadget. Chat text + real Tool Port tools only.\n\nBring my garage engines onto the desk:\n1) Call madx_data_status (or madx_data_sources_status) FIRST — never pitch stooq/Yahoo.\n2) Call list_suite_engines — summarize OK vs fail in plain English (these are LIVE on Tool Port).\n3) Call run_data_cleaner_joiner_verifier (dry_run).\n4) Call jetset_v14_dry_run (status) and run_simons_pipeline_status.\n5) Offer inspect_system_health_cockpit and tos_candles_preview if useful.\nNo broker keys. No Vibecode skins.',
  },
  {
    id: 'jetset-immune',
    label: 'Jetset + immune health',
    description: 'Sizing dry-run + 5-layer immune cockpit — no orders',
    icon: Lightning,
    prompt:
      'IMMUTABLE: chat + Tool Port only. Call madx_data_status first. Then jetset_v14_dry_run (status) and inspect_system_health_cockpit. Plain English: what state Jetset is in and whether immune layers are green. No live orders. No fake desk UI.',
  },
  {
    id: 'backtober-review',
    label: 'Run a Backtober review',
    description: 'Backtest readout with PF, drawdown, and next tests',
    icon: ChartLineUp,
    prompt:
      'Turn my latest Backtober / MADX / HGTFC backtest results into a review: headline stats (PF, win rate, max DD), what looks real vs fragile, and the next 2–3 tests. Prefer option-native P&L (contract series) over equity-proxy. Do NOT build a dashboard UI — chat text + Tool Port visuals only. Ask which run or CSV.',
  },
  {
    id: 'sigma-forge',
    label: 'Forge a small calculator',
    description: 'Tiny gadget only — never a fake MadTrader desk',
    icon: AppWindow,
    prompt:
      'HARD BAN: Do not recreate MadTrader, a trading desk, SPY/QQQ “live” dashboards, or simulated market UIs. MadTrader is the immutable iframe on the MadTrader tab.\n\nIf I still want a gadget, build ONLY a tiny calculator (position size, R-multiple, or contract math) with clearly labeled FAKE/DEMO numbers — never as a desk substitute. Ask what formula I need first.',
  },
  {
    id: 'agent-alert',
    label: 'Wire a trade alert agent',
    description: 'Agent that watches levels and drafts the action',
    icon: Lightning,
    prompt:
      'Plan an alert workflow (level hit → draft action for MadTrader). Chat/text only unless I explicitly ask for a tiny non-desk gadget. Ask symbol, level, channel. Do not invent a live desk UI.',
  },
  {
    id: 'session-deck',
    label: 'Build a session recap deck',
    description: 'Slides: what printed, what failed, what to decide',
    icon: Presentation,
    prompt:
      'Create a short session recap deck from my real runs/notes: what printed, what failed, open risk, decisions before next open. Ask which session. Do not replace MadTrader with a simulated desk.',
  },
]

// One row, shared by every suggestion so the list reads as one kind of offer.
function SuggestionRow({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  description: string
  onClick: () => void
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="press group flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-kumo-tint"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kumo-fill text-kumo-subtle transition-colors group-hover:text-kumo-default">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] leading-[18px] font-medium tracking-[-0.25px] text-kumo-default">
            {label}
          </span>
          <span className="block truncate text-[12px] leading-4 tracking-[-0.2px] text-kumo-subtle">
            {description}
          </span>
        </span>
      </button>
    </li>
  )
}

// How many of the suggestions above to show at once. The list is longer than the page should be:
// four rows is inspiration, seven is a menu to read. Which three appear is chosen per visit, so the
// ones below the fold still get seen -- and so Home doesn't look like it only does one thing.
const VISIBLE_SUGGESTIONS = 4

function pickSuggestions(): TaskSuggestion[] {
  // Always lead with MadTrader desk so Home launches the Primary Hub split UX.
  // Pin garage→desk mounts next so engines stay one click from Home.
  const pinnedIds = ['madtrader-desk', 'algo-nodes', 'academy', 'engines-cleaner']
  const pinned = pinnedIds
    .map((id) => SUGGESTIONS.find((s) => s.id === id))
    .filter((s): s is TaskSuggestion => Boolean(s))
  const rest = SUGGESTIONS.filter((s) => !pinnedIds.includes(s.id))
  for (let i = rest.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    ;[rest[i], rest[j]] = [rest[j], rest[i]]
  }
  const out: TaskSuggestion[] = [...pinned]
  for (const s of rest) {
    if (out.length >= VISIBLE_SUGGESTIONS) break
    out.push(s)
  }
  return out
}

export default function HomeTaskSuggestions({
  onPick,
}: {
  onPick: (prompt: string) => void
}) {
  // Chosen once per mount: re-rolling on every render would shuffle the list under the pointer.
  const visible = useMemo(pickSuggestions, [])

  return (
    <section aria-label="Example tasks" className="flex flex-col gap-1">
      <h3 className="px-1 pb-1 text-[12px] font-medium uppercase tracking-[0.06em] text-kumo-inactive">
        Get started
      </h3>
      <ul className="flex flex-col gap-0.5">
        {visible.map((suggestion) => (
          <SuggestionRow
            key={suggestion.id}
            icon={<suggestion.icon size={16} />}
            label={suggestion.label}
            description={suggestion.description}
            onClick={() => onPick(suggestion.prompt)}
          />
        ))}
      </ul>
    </section>
  )
}
