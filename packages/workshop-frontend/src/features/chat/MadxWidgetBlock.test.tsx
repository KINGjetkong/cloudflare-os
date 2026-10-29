import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MarkdownMessage } from "../../ChatInterface";

const fence = (body: string) => "Result:\n\n```madx-widget\n" + body + "\n```\n";

describe("madx-widget fenced blocks", () => {
  it("hands a complete JSON block to the widget host instead of a code block", () => {
    const html = renderToStaticMarkup(
      <MarkdownMessage message={fence('{"v":1,"kind":"stat","title":"Findings"}')} />,
    );
    expect(html).toContain("overflow-x-auto");
    expect(html).not.toContain("<pre");
  });

  it("keeps an incomplete or non-JSON block as plain code", () => {
    const html = renderToStaticMarkup(<MarkdownMessage message={fence('{"v":1,"kind":')} />);
    expect(html).toContain("<pre");
  });
});
