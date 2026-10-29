import { useEffect, useRef } from "react";

// Sigma Bridge owns the widget contract and the one renderer shared with wiki, cards and run
// reports, so chat checks each block there and draws it with that renderer rather than its own.
const BRIDGE_URL = "http://127.0.0.1:7790";
const RENDERER_URL = `${BRIDGE_URL}/madx-shell/widgets.js`;

type MadxWidgetRenderer = { render: (target: HTMLElement, spec: unknown) => HTMLElement };

declare global {
  interface Window {
    MadxWidgets?: MadxWidgetRenderer;
  }
}

let rendererPromise: Promise<MadxWidgetRenderer> | null = null;

const loadRenderer = (): Promise<MadxWidgetRenderer> => {
  if (window.MadxWidgets) return Promise.resolve(window.MadxWidgets);
  rendererPromise ??= new Promise<MadxWidgetRenderer>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RENDERER_URL;
    script.async = true;
    script.onload = () =>
      window.MadxWidgets ? resolve(window.MadxWidgets) : reject(new Error("renderer missing"));
    script.onerror = () => {
      rendererPromise = null;
      script.remove();
      reject(new Error("renderer unreachable"));
    };
    document.head.appendChild(script);
  });
  return rendererPromise;
};

const checkSpec = async (spec: unknown): Promise<unknown> => {
  try {
    const response = await fetch(`${BRIDGE_URL}/api/v1/widgets/validate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(spec),
    });
    const verdict: unknown = await response.json();
    const passed = typeof verdict === "object" && verdict !== null && "ok" in verdict && verdict.ok === true;
    return passed ? spec : { ok: false, unavailable: "failed contract check" };
  } catch {
    return { ok: false, unavailable: "could not check widget" };
  }
};

/** Parses a fenced `madx-widget` block, or returns undefined while it is incomplete or not JSON. */
export const parseWidgetSource = (source: string): unknown => {
  try {
    return JSON.parse(source);
  } catch {
    return undefined;
  }
};

export const MadxWidgetBlock = ({ spec }: { spec: unknown }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const specKey = JSON.stringify(spec);

  useEffect(() => {
    let cancelled = false;
    const parsed: unknown = JSON.parse(specKey);
    Promise.all([loadRenderer(), checkSpec(parsed)])
      .then(([renderer, checked]) => {
        if (!cancelled && hostRef.current) renderer.render(hostRef.current, checked);
      })
      .catch(() => {
        if (!cancelled && hostRef.current) {
          hostRef.current.textContent = "Widget unavailable: Sigma Bridge renderer unreachable";
        }
      });
    return () => {
      cancelled = true;
    };
  }, [specKey]);

  // Children are owned by the shared renderer, never by React.
  return <div ref={hostRef} className="my-2 max-w-full overflow-x-auto" />;
};
