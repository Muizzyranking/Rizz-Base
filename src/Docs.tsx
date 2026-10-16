import { useEffect, useMemo, useRef, useState } from "react";
import { docs, renderDoc } from "./docs";
import hljs from "./highlight";

export function DocsContent({
  slug,
  onSelect,
}: {
  slug: string;
  onSelect: (slug: string) => void;
}) {
  const active = docs.find((d) => d.slug === slug) ?? docs[0];
  const [open, setOpen] = useState(false);
  const articleRef = useRef<HTMLElement>(null);

  const select = (next: string) => {
    setOpen(false);
    onSelect(next);
  };

  const { heading, body } = useMemo(() => {
    const match = active.markdown.match(/^#[ \t]+(.+?)[ \t]*\r?$/m);
    if (!match) return { heading: active.title, body: active.markdown };
    return {
      heading: match[1].trim(),
      body: active.markdown.replace(match[0], "").trimStart(),
    };
  }, [active]);

  const displayTitle = heading.toUpperCase();
  const punctuated = /[!?]$/.test(displayTitle) ? displayTitle : `${displayTitle}.`;

  const html = useMemo(() => renderDoc(body), [body]);

  useEffect(() => {
    articleRef.current?.scrollIntoView({ block: "start" });
  }, [slug]);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;
    root.querySelectorAll("pre code").forEach((el) => {
      const code = el as HTMLElement;
      if (code.dataset.highlighted) return;
      try {
        hljs.highlightElement(code);
      } catch {
        /* leave plain on unknown languages */
      }
    });
    const blocks = root.querySelectorAll("pre");
    blocks.forEach((pre) => {
      if (pre.parentElement?.hasAttribute("data-code-wrap")) return;
      const wrap = document.createElement("div");
      wrap.setAttribute("data-code-wrap", "");
      pre.replaceWith(wrap);
      wrap.appendChild(pre);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "COPY";
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(pre.innerText);
          btn.textContent = "COPIED ✓";
        } catch {
          btn.textContent = "FAILED";
        }
        setTimeout(() => {
          btn.textContent = "COPY";
        }, 1400);
      });
      wrap.appendChild(btn);
    });
  }, [html]);

  const index = docs.findIndex((d) => d.slug === active.slug);
  const prev = docs[index - 1];
  const next = docs[index + 1];

  return (
    <div className="docs-layout">
      <aside className={open ? "docs-nav open" : "docs-nav"}>
        <div className="docs-nav-head">
          <small>GUIDES · {docs.length}</small>
          <button
            className="docs-menu-btn"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label="Toggle guides menu"
            type="button"
          >
            <i />
            <i />
            <i />
          </button>
        </div>
        <nav>
          {docs.map((d, i) => (
            <button
              key={d.slug}
              className={d.slug === active.slug ? "active" : ""}
              onClick={() => select(d.slug)}
              type="button"
            >
              <b>{String(i + 1).padStart(2, "0")}</b>
              <strong>{d.title}</strong>
              <em>{d.badge}</em>
            </button>
          ))}
        </nav>
        <div className="docs-note">
          <b>EDIT ME, BESTIE</b>
          <p>Spot something off? Go ahead and edit this guide.</p>
        </div>
      </aside>
      <article className="docs-article" ref={articleRef}>
        <div className="docs-crumb">
          <span>DOCS</span> / <b>{active.kicker}</b>
        </div>
        <h1>
          {punctuated.slice(0, -1)}
          <span>{punctuated.slice(-1)}</span>
        </h1>
        <p className="docs-lede">{active.blurb}</p>
        <div
          className="docs-markdown"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="docs-pager">
          {prev ? (
            <button type="button" onClick={() => onSelect(prev.slug)}>
              ← {prev.title}
            </button>
          ) : (
            <span />
          )}
          {next && (
            <button type="button" onClick={() => onSelect(next.slug)}>
              {next.title} →
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

export default DocsContent;
