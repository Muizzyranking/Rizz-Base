import { useEffect, useState, type ReactNode } from "react";
import { DocsContent, } from "./Docs";
import { docs as docEntries } from "./docs";

type Page = "home" | "dashboard" | "lobby" | "editor" | "auth" | "pricing" | "docs";
type Theme = "light" | "dark";

const repositoryUrl = "https://github.com/pazti/Rizz-Base";

const Icon = ({ name }: { name: string }) => {
  const paths: Record<string, ReactNode> = {
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.2 15.6A9 9 0 0 1 8.4 3.8a9 9 0 1 0 11.8 11.8Z" />,
    github: <path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.9c-2.8.6-3.4-1.2-3.4-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.3-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.8 1a9.7 9.7 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.8-2.4 4.6-4.6 4.9.4.3.7.9.7 1.8V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" />,
    arrow: <path d="m7 17 10-10M8 7h9v9" />,
    data: <><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7" /></>,
    realtime: <path d="m13 2-9 12h7l-1 8 10-12h-7V2Z" />,
    rules: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    back: <path d="m15 18-6-6 6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    trash: <><path d="M3 6h18M8 6V3h8v3M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button className="logo" onClick={onClick} type="button">
      <span className="logo-mark"><i>R</i></span>
      <strong>RIZZBASE</strong>
    </button>
  );
}

function StarButton() {
  return <a className="star-button" href={repositoryUrl} target="_blank" rel="noreferrer"><Icon name="github" /> <b>GITHUB</b></a>;
}

function ThemeToggle({ theme, toggle }: { theme: Theme; toggle: () => void }) {
  return (
    <button className="theme-toggle" onClick={toggle} type="button" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
      <span className={theme === "light" ? "active" : ""}><Icon name="sun" /></span>
      <span className={theme === "dark" ? "active" : ""}><Icon name="moon" /></span>
      <i className={theme === "dark" ? "right" : ""} />
    </button>
  );
}

function Button({ children, tone = "yellow", onClick }: { children: ReactNode; tone?: "yellow" | "pink" | "plain" | "black"; onClick?: () => void }) {
  return <button className={`btn ${tone}`} type="button" onClick={onClick}>{children}</button>;
}

function Header({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <header className="site-header">
      <Logo onClick={() => go("home")} />
      <nav>
        <button onClick={() => go("home")}>FEATURES</button>
        <button onClick={() => go("docs")}>DOCS</button>
        <button onClick={() => go("pricing")}>PRICING</button>
      </nav>
      <div className="header-actions">
        <StarButton />
        <ThemeToggle theme={theme} toggle={toggle} />
      </div>
    </header>
  );
}

function Ticker() {
  return <div className="ticker"><div>NOW SERVING AURA <b>✦</b> RIZZBASE IS SO BACK <b>✦</b> NO CAP DATABASE <b>✦</b> NOW SERVING AURA <b>✦</b> RIZZBASE IS SO BACK <b>✦</b></div></div>;
}

function ComingSoonNotice({ message }: { message: string }) {
  return (
    <aside className="coming-soon-notice" role="status">
      <span>COMING SOON</span>
      <p>{message}</p>
    </aside>
  );
}

const lobbies = [
  { name: "hot-girl-deploy" },
  { name: "no-bugs-allowed" },
  { name: "ship-it-bestie" },
  { name: "main-character-api" },
  { name: "delulu-is-solulu" },
  { name: "touch-grass-prod" },
];

function MiniDashboard({ go }: { go: (p: Page) => void }) {
  return (
    <div className="mini-dashboard">
      <div className="mini-side">
        <Logo />
        <span className="active"><Icon name="data" /> Data</span>
        <span><Icon name="realtime" /> Realtime</span>
        <span><Icon name="rules" /> Rules</span>
      </div>
      <div className="mini-main">
        <div className="mini-head"><div><small>LOCAL PREVIEW</small><h3>lobbies</h3></div><Button tone="pink" onClick={() => go("dashboard")}><Icon name="plus" /> Add lobby</Button></div>
        <div className="mini-tabs"><b>Table</b><span>JSON</span><span>Vibes</span></div>
        <div className="mini-table">
          <div><b>TYPE</b><b>LOBBY</b><b>STORAGE</b></div>
          {lobbies.slice(0, 3).map((lobby) => <div key={lobby.name}><span>Sample</span><strong>{lobby.name}</strong><span>Local file</span></div>)}
        </div>
        <div className="code-strip"><span>await db</span>.createYap(lobby.id, <b>"welcome"</b>, data);</div>
      </div>
    </div>
  );
}

function Landing({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <>
      <Ticker />
      <ComingSoonNotice message="The dashboard screens below are a mockup and are not connected to your local files. Use the Go engine or TypeScript SDK for real V1 data." />
      <Header theme={theme} toggle={toggle} go={go} />
      <main className="landing">
        <section className="hero">
          <div className="hero-copy">
            <div className="label"><i /> FIRESTORE’S UNHINGED COUSIN</div>
            <h1>RIZZ <span>BASE</span></h1>
            <p>The database that<br />actually has <mark>aura.</mark></p>
            <div className="button-row">
              <a className="btn" href="https://www.npmjs.com/package/rizzbase" target="_blank" rel="noreferrer">INSTALL SDK <Icon name="arrow" /></a>
              <a className="btn plain" href={repositoryUrl} target="_blank" rel="noreferrer"><Icon name="github" /> VIEW ON GITHUB</a>
            </div>
          </div>
          <div className="hero-product">
            <div className="burst">✦</div>
            <div className="live-sticker">● UI PREVIEW</div>
            <MiniDashboard go={go} />
    <div className="install">LOCAL V1 <b>GO + TS SDK</b></div>
          </div>
        </section>

        <section className="loud-strip"><small>BUILT FOR DEVELOPERS WHO ARE</small><h2>TIRED OF BORING <span>DATABASES.</span></h2></section>

        <section className="feature-section">
          <div className="section-title"><span>[ THE SAUCE ]</span><h2>ALL GAS.<br />NO BOILERPLATE.</h2></div>
          <div className="feature-grid">
            {[
              ["data", "LOCAL FIRST", "One encrypted .rizz Project file lives on your device. No hosted database or network service.", "yellow"],
              ["data", "YAPS THAT FIT", "Store regular JSON documents in a Lobby, then filter them with simple local queries.", "pink"],
              ["rules", "ENCRYPTED BY DEFAULT", "AES-256-GCM protects your local Project. Keep your passphrase private and keep a backup.", "cream"],
            ].map(([icon, title, copy, tone]) => (
              <article className={`feature-card ${tone}`} key={title}>
                <div><span><Icon name={icon} /></span></div>
                <h3>{title}</h3><p>{copy}</p><button onClick={() => go("dashboard")}>SEE THE RECEIPTS <Icon name="arrow" /></button>
              </article>
            ))}
          </div>
        </section>
        <BigBanner />
      </main>
      <Footer go={go} />
    </>
  );
}

function BigBanner() {
  return <section className="big-banner"><div><small>LOCAL-FIRST V1</small><h2>YOUR PROJECT.<br /><span>YOUR DEVICE.</span></h2></div><a className="btn pink" href="https://www.npmjs.com/package/rizzbase" target="_blank" rel="noreferrer">GET THE SDK <Icon name="arrow" /></a></section>;
}

function Footer({ go }: { go: (p: Page) => void }) {
  return <footer><Logo onClick={() => go("home")} /><p>© 2026 Rizzbase. Made with zero chill.</p><div><button onClick={() => go("docs")}>Docs</button><a href={repositoryUrl} target="_blank" rel="noreferrer">GitHub</a><span>LOCAL-FIRST V1</span></div></footer>;
}

function Sidebar({ active, go }: { active: string; go: (p: Page) => void }) {
  return (
    <aside className="app-sidebar">
      <Logo onClick={() => go("home")} />
      <div className="workspace"><i>RB</i><span><b>Local Project</b><small>PRIVATE FILE</small></span><b>⌄</b></div>
      <nav>
        <small>WORKSPACE</small>
        <button className={active === "data" ? "active" : ""} onClick={() => go("dashboard")}><Icon name="data" /> Data</button>
        <button onClick={() => { window.location.hash = "/docs/cli"; }}><Icon name="data" /> Queries</button>
        <button onClick={() => { window.location.hash = "/docs/security"; }}><Icon name="rules" /> Encryption</button>
        <button onClick={() => go("docs")}><Icon name="rules" /> Docs</button>
      </nav>
      <div className="side-bottom"><button onClick={() => go("docs")}>? <span>Need help, bestie?</span></button><div><i>RB</i><span><b>Rizzbase</b><small>Local preview</small></span></div></div>
    </aside>
  );
}

function AppShell({ children, page, theme, toggle, go }: { children: ReactNode; page: string; theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <div className="app-shell">
      <Sidebar active="data" go={go} />
      <div className="app-area">
        <header className="app-topbar"><div><button onClick={() => go("dashboard")}>PREVIEW</button><span>/</span><b>{page}</b></div><div><span className="sync">SAMPLE DATA</span><ThemeToggle theme={theme} toggle={toggle} /></div></header>
        <ComingSoonNotice message="This dashboard is a mockup using sample data; it is not connected to your .rizz files. Use the Go CLI or TypeScript SDK to work with real V1 data." />
        {children}
      </div>
    </div>
  );
}

function Dashboard({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <AppShell page="lobbies" theme={theme} toggle={toggle} go={go}>
      <main className="product-page">
        <div className="product-heading"><div><span className="kicker">DATABASE / COLLECTIONS</span><h1>LOBBIES<span>.</span></h1><p>Your chaotic little corners of the internet.</p></div><Button tone="pink"><Icon name="plus" /> NEW LOBBY</Button></div>
        <div className="collection-tools"><div className="search">⌕ <span>Search lobbies...</span></div><div><Button tone="plain">FILTERS</Button><Button tone="black">▦ GRID</Button></div></div>
        <div className="lobby-grid">
          {lobbies.map((lobby) => (
            <article className="lobby-card" key={lobby.name} onClick={() => go("lobby")}>
              <div><span className="status">SAMPLE</span><button>•••</button></div>
              <h2>{lobby.name}</h2>
              <p>Example Lobby for the local-first preview.</p>
                  <div className="card-foot"><span>Not connected to a Project</span><Icon name="arrow" /></div>
            </article>
          ))}
          <button className="add-lobby" type="button"><span><Icon name="plus" /></span><b>CREATE NEW LOBBY</b><small>Go make something unhinged.</small></button>
        </div>
      </main>
    </AppShell>
  );
}

const yapRows = [
  ["welcome", "mika", "just shipped auth. we are so back"],
  ["release-note", "jules", "prod is giving main character energy"],
  ["status", "kai", "zero bugs (do not fact check this)"],
  ["schema", "sasha", "the schema is lowkey eating"],
];

function Lobby({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <AppShell page="hot-girl-deploy" theme={theme} toggle={toggle} go={go}>
      <main className="product-page">
        <button className="back-link" onClick={() => go("dashboard")}><Icon name="back" /> ALL LOBBIES</button>
        <div className="product-heading compact"><div><div className="live-line"><span>SAMPLE</span></div><h1>HOT-GIRL-DEPLOY<span>.</span></h1><p>Example data for the interface preview.</p></div><Button tone="pink" onClick={() => go("editor")}><Icon name="plus" /> ADD YAP</Button></div>
          <div className="content-tabs"><button className="active">TABLE</button><button>JSON</button><button>VIBES</button></div>
        <div className="lobby-layout">
          <div className="data-panel">
            <div className="table-tools"><div>⌕ <span>Find a yap...</span></div><Button tone="plain">↕ SORT</Button></div>
            <div className="brutal-table">
              <div className="tr th"><span>ID</span><span>AUTHOR</span><span>CONTENT</span></div>
              {yapRows.map((row) => <button className="tr" key={row[0]} onClick={() => go("editor")}><code>{row[0]}</code><span><i>{row[1][0].toUpperCase()}</i>{row[1]}</span><b>{row[2]}</b></button>)}
            </div>
          </div>
          <aside className="json-float"><div><span>SAMPLE JSON</span></div><pre>{`{
  "lobby": "hot-girl-deploy",
  "author": `}<em>"mika"</em>{`,
  "content": `}<b>"just shipped auth"</b>{`
}`}</pre><button>COPY RAW JSON</button></aside>
        </div>
      </main>
    </AppShell>
  );
}

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={wide ? "wide" : ""}><span>{label}</span>{children}</label>;
}

function Editor({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <AppShell page="welcome" theme={theme} toggle={toggle} go={go}>
      <main className="product-page editor">
        <div className="editor-head"><div><button className="back-link" onClick={() => go("lobby")}><Icon name="back" /> HOT-GIRL-DEPLOY</button><h1>EDIT YAP<span>.</span></h1><p>welcome · Example record</p></div><div><Button tone="plain"><Icon name="trash" /> DELETE</Button><Button><Icon name="check" /> SAVE CHANGES</Button></div></div>
        <div className="editor-grid">
          <section className="form-card">
            <div className="card-title"><span>YAP DETAILS</span><b>REQUIRED-ish</b></div>
            <div className="form-grid">
              <Field label="CONTENT" wide><textarea defaultValue="just shipped auth. we are so back" /></Field>
              <Field label="TAGS" wide><div className="tag-input"><b>shipping ×</b><b>auth ×</b><span>Add a tag...</span></div></Field>
              <Field label="AUTHOR"><input defaultValue="mika" /></Field>
              <Field label="VISIBILITY"><select defaultValue="lobby"><option value="lobby">Whole lobby</option></select></Field>
            </div>
          </section>
          <aside className="json-editor">
            <div className="card-title"><span>EXAMPLE JSON</span><b>SAMPLE DATA</b></div>
            <pre>{`{
  "id": `}<b>"welcome"</b>{`,
  "author": `}<b>"mika"</b>{`,
  "content": `}<b>"just shipped auth. we are so back"</b>{`,
  "tags": [`}<b>"shipping"</b>{`, `}<b>"auth"</b>{`]
}`}</pre>
            <div><span>Example only. Not connected.</span><button>COPY</button></div>
          </aside>
        </div>
        <section className="history">
          <div className="card-title"><span>EXAMPLE HISTORY</span></div>
          <div className="timeline"><div><i className="hot">✦</i><span><b>Example Yap created</b></span></div><div><i>✓</i><span><b>Example content updated</b></span></div></div>
        </section>
      </main>
    </AppShell>
  );
}

function Docs({ theme, toggle, go, slug }: { theme: Theme; toggle: () => void; go: (p: Page) => void; slug: string }) {
  return (
    <>
      <header className="docs-topbar">
        <Logo onClick={() => go("home")} />
        <div>
          <StarButton />
          <ThemeToggle theme={theme} toggle={toggle} />
        </div>
      </header>
      <main className="docs-full">
        <DocsContent slug={slug} onSelect={(next) => { window.location.hash = `/docs/${next}`; }} />
      </main>
      <Footer go={go} />
    </>
  );
}

function Auth({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <main className="auth-page">
      <div className="auth-top"><Logo onClick={() => go("home")} /><ThemeToggle theme={theme} toggle={toggle} /></div>
      <div className="auth-scribble one">✦</div><div className="auth-scribble two">↗</div>
      <section className="auth-card coming-soon-card">
        <div className="auth-badge">LOCAL-ONLY V1</div>
        <h1>THE UI IS<br /><span>COMING SOON.</span></h1>
        <p>Accounts and sign-in are not part of Rizzbase V1. This product interface is still a preview and does not connect to the local engine.</p>
        <Button tone="plain" onClick={() => go("home")}>BACK TO HOME <Icon name="arrow" /></Button>
        <small>Use the Go engine or TypeScript SDK to work with local Project files.</small>
      </section>
      <div className="auth-quote">“local files. encrypted. no cloud drama.”<b>— Rizzbase V1</b></div>
    </main>
  );
}

function Pricing({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <>
      <Header theme={theme} toggle={toggle} go={go} />
      <ComingSoonNotice message="Rizzbase V1 is a local library, not a hosted service. There are no subscriptions, accounts, or hosted plans." />
      <main className="pricing-page">
        <div className="pricing-head"><span>LOCAL-FIRST V1</span><h1>NO HOSTED<br /><mark>PLANS OR FEES.</mark></h1><p>Use the published Node.js SDK to work with encrypted Project files on your device.</p><a className="btn pink" href="https://www.npmjs.com/package/rizzbase" target="_blank" rel="noreferrer">GET THE SDK <Icon name="arrow" /></a></div>
        <BigBanner />
      </main>
      <Footer go={go} />
    </>
  );
}

export default function App() {
  const getPage = (): Page => {
    const hash = window.location.hash.replace("#/", "");
    const root = hash.split("/")[0] as Page;
    return ["home", "dashboard", "lobby", "editor", "auth", "pricing", "docs"].includes(root) ? root : "home";
  };
  const getDocSlug = (): string => {
    const parts = window.location.hash.replace("#/", "").split("/");
    const slug = parts[1] ?? "";
    return docEntries.some((d) => d.slug === slug) ? slug : "overview";
  };
  const [page, setPage] = useState<Page>(getPage);
  const [docSlug, setDocSlug] = useState<string>(getDocSlug);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("rizz-theme") as Theme) || "light");

  useEffect(() => {
    const sync = () => { setPage(getPage()); setDocSlug(getDocSlug()); };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("rizz-theme", theme);
  }, [theme]);

  const go = (next: Page) => {
    window.location.hash = next === "docs" ? "/docs/overview" : `/${next}`;
    setPage(next);
    if (next === "docs") setDocSlug("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  if (page === "dashboard") return <Dashboard theme={theme} toggle={toggle} go={go} />;
  if (page === "lobby") return <Lobby theme={theme} toggle={toggle} go={go} />;
  if (page === "editor") return <Editor theme={theme} toggle={toggle} go={go} />;
  if (page === "auth") return <Auth theme={theme} toggle={toggle} go={go} />;
  if (page === "pricing") return <Pricing theme={theme} toggle={toggle} go={go} />;
  if (page === "docs") return <Docs theme={theme} toggle={toggle} go={go} slug={docSlug} />;
  return <Landing theme={theme} toggle={toggle} go={go} />;
}
