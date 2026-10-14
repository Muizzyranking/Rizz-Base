import { useEffect, useState, type ReactNode } from "react";

type Page = "home" | "dashboard" | "lobby" | "editor" | "auth" | "pricing";
type Theme = "light" | "dark";

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
        <button onClick={() => go("dashboard")}>DOCS</button>
        <button onClick={() => go("pricing")}>PRICING</button>
      </nav>
      <div className="header-actions">
        <button className="star-button" type="button"><Icon name="github" /> <b>12.4K</b></button>
        <ThemeToggle theme={theme} toggle={toggle} />
      </div>
    </header>
  );
}

function Ticker() {
  return <div className="ticker"><div>NOW SERVING AURA <b>✦</b> RIZZBASE IS SO BACK <b>✦</b> NO CAP DATABASE <b>✦</b> NOW SERVING AURA <b>✦</b> RIZZBASE IS SO BACK <b>✦</b></div></div>;
}

const lobbies = [
  { name: "hot-girl-deploy", players: "8 / 10", time: "just now", status: "LIVE", tone: "pink" },
  { name: "no-bugs-allowed", players: "4 / 8", time: "2 sec ago", status: "LIVE", tone: "yellow" },
  { name: "ship-it-bestie", players: "2 / 6", time: "1 min ago", status: "IDLE", tone: "cream" },
  { name: "main-character-api", players: "12 / 12", time: "4 min ago", status: "FULL", tone: "pink" },
  { name: "delulu-is-solulu", players: "3 / 10", time: "8 min ago", status: "LIVE", tone: "yellow" },
  { name: "touch-grass-prod", players: "0 / 4", time: "1 hr ago", status: "SLEEPY", tone: "cream" },
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
        <div className="mini-head"><div><small>DATABASE / PROD</small><h3>lobbies</h3></div><Button tone="pink" onClick={() => go("dashboard")}><Icon name="plus" /> Add lobby</Button></div>
        <div className="mini-tabs"><b>Table</b><span>JSON</span><span>Vibes</span></div>
        <div className="mini-table">
          <div><b>STATUS</b><b>LOBBY</b><b>PLAYERS</b><b>LAST YAP</b></div>
          {lobbies.slice(0, 3).map((lobby) => <div key={lobby.name}><span><i /> live</span><strong>{lobby.name}</strong><span>{lobby.players}</span><span>{lobby.time}</span></div>)}
        </div>
        <div className="code-strip"><span>rizzbase</span>.collection(<b>"lobbies"</b>).onYap(lockIn);</div>
      </div>
    </div>
  );
}

function Landing({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <>
      <Ticker />
      <Header theme={theme} toggle={toggle} go={go} />
      <main className="landing">
        <section className="hero">
          <div className="hero-copy">
            <div className="label"><i /> FIRESTORE’S UNHINGED COUSIN</div>
            <h1>RIZZ <span>BASE</span></h1>
            <p>The database that<br />actually has <mark>aura.</mark></p>
            <div className="button-row">
              <Button onClick={() => go("auth")}>GET RIZZ <Icon name="arrow" /></Button>
              <Button tone="plain"><Icon name="github" /> STAR ON GITHUB</Button>
            </div>
            <div className="proof"><div><i>J</i><i>M</i><i>K</i><i>+9K</i></div><span><b>9,001 devs</b><br />already locked in</span></div>
          </div>
          <div className="hero-product">
            <div className="burst">✦</div>
            <div className="live-sticker">● LIVE RN</div>
            <MiniDashboard go={go} />
            <div className="install">npm i rizzbase <b>COPY</b></div>
          </div>
        </section>

        <section className="loud-strip"><small>BUILT FOR DEVELOPERS WHO ARE</small><h2>TIRED OF BORING <span>DATABASES.</span></h2></section>

        <section className="feature-section">
          <div className="section-title"><span>[ THE SAUCE ]</span><h2>ALL GAS.<br />NO BOILERPLATE.</h2></div>
          <div className="feature-grid">
            {[
              ["realtime", "01", "STUPID FAST", "Reads so quick your data is already there before you even asked. Literally no thoughts, just speed.", "yellow"],
              ["data", "02", "REALTIME YAPS", "Every update hits different. Subscribe once and watch your app lock in with zero refresh drama.", "pink"],
              ["rules", "03", "LOWKEY SECURE", "Rules that actually make sense. Your data stays yours. No sus behavior in the server room.", "cream"],
            ].map(([icon, num, title, copy, tone]) => (
              <article className={`feature-card ${tone}`} key={title}>
                <div><span><Icon name={icon} /></span><b>{num}</b></div>
                <h3>{title}</h3><p>{copy}</p><button onClick={() => go("dashboard")}>SEE THE RECEIPTS <Icon name="arrow" /></button>
              </article>
            ))}
          </div>
        </section>
        <BigBanner go={go} />
      </main>
      <Footer go={go} />
    </>
  );
}

function BigBanner({ go }: { go: (p: Page) => void }) {
  return <section className="big-banner"><div><small>FREE TIER GOES CRAZY</small><h2>YOUR APP CALLED.<br /><span>IT WANTS MORE RIZZ.</span></h2></div><Button tone="pink" onClick={() => go("auth")}>START COOKING <Icon name="arrow" /></Button></section>;
}

function Footer({ go }: { go: (p: Page) => void }) {
  return <footer><Logo onClick={() => go("home")} /><p>© 2025 Rizzbase. Made with zero chill.</p><div><button onClick={() => go("dashboard")}>Docs</button><button>GitHub</button><span>● STATUS: VIBING</span></div></footer>;
}

function Sidebar({ active, go }: { active: string; go: (p: Page) => void }) {
  return (
    <aside className="app-sidebar">
      <Logo onClick={() => go("home")} />
      <div className="workspace"><i>RB</i><span><b>Main character</b><small>PRO ERA</small></span><b>⌄</b></div>
      <nav>
        <small>WORKSPACE</small>
        <button className={active === "data" ? "active" : ""} onClick={() => go("dashboard")}><Icon name="data" /> Data <kbd>6</kbd></button>
        <button className={active === "realtime" ? "active" : ""}><Icon name="realtime" /> Realtime <i>●</i></button>
        <button className={active === "rules" ? "active" : ""}><Icon name="rules" /> Rules</button>
      </nav>
      <div className="side-bottom"><button>? <span>Need help, bestie?</span></button><div><i>MC</i><span><b>main@rizz.dev</b><small>Certified yapper</small></span></div></div>
    </aside>
  );
}

function AppShell({ children, page, theme, toggle, go }: { children: ReactNode; page: string; theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <div className="app-shell">
      <Sidebar active="data" go={go} />
      <div className="app-area">
        <header className="app-topbar"><div><button onClick={() => go("dashboard")}>PROD</button><span>/</span><b>{page}</b></div><div><span className="sync">● ALL SYNCED</span><ThemeToggle theme={theme} toggle={toggle} /></div></header>
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
        <div className="collection-tools"><div className="search">⌕ <span>Search lobbies...</span><kbd>⌘ K</kbd></div><div><Button tone="plain">FILTERS <b>2</b></Button><Button tone="black">▦ GRID</Button></div></div>
        <div className="lobby-grid">
          {lobbies.map((lobby, index) => (
            <article className={`lobby-card ${index === 1 ? "hovered" : ""}`} key={lobby.name} onClick={() => go("lobby")}>
              <div><span className={`status ${lobby.status.toLowerCase()}`}>● {lobby.status}</span><button>•••</button></div>
              <h2>{lobby.name}</h2>
              <p>Production lobby for shipping absolute cinema.</p>
              <div className="card-meta"><span><Icon name="users" /><b>{lobby.players}</b> players</span><span><Icon name="clock" />{lobby.time}</span></div>
              <div className="card-foot"><div><i>JR</i><i>MK</i><i>+3</i></div><Icon name="arrow" /></div>
            </article>
          ))}
          <button className="add-lobby" type="button"><span><Icon name="plus" /></span><b>CREATE NEW LOBBY</b><small>Go make something unhinged.</small></button>
        </div>
      </main>
    </AppShell>
  );
}

const yapRows = [
  ["yap_001", "mika", "just shipped auth. we are so back", "98", "just now"],
  ["yap_002", "jules", "prod is giving main character energy", "87", "12 sec ago"],
  ["yap_003", "kai", "zero bugs (do not fact check this)", "76", "1 min ago"],
  ["yap_004", "sasha", "the schema is lowkey eating", "92", "4 min ago"],
];

function Lobby({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  return (
    <AppShell page="hot-girl-deploy" theme={theme} toggle={toggle} go={go}>
      <main className="product-page">
        <button className="back-link" onClick={() => go("dashboard")}><Icon name="back" /> ALL LOBBIES</button>
        <div className="product-heading compact"><div><div className="live-line"><span>● LIVE</span><b>8 YAPPERS ONLINE</b></div><h1>HOT-GIRL-DEPLOY<span>.</span></h1><p>Where commits get cute and code gets shipped.</p></div><Button tone="pink" onClick={() => go("editor")}><Icon name="plus" /> ADD YAP</Button></div>
        <div className="content-tabs"><button className="active">TABLE <b>124</b></button><button>JSON</button><button>VIBES <span>NEW</span></button></div>
        <div className="lobby-layout">
          <div className="data-panel">
            <div className="table-tools"><div>⌕ <span>Find a yap...</span></div><Button tone="plain">↕ SORT</Button></div>
            <div className="brutal-table">
              <div className="tr th"><span>ID</span><span>AUTHOR</span><span>CONTENT</span><span>RIZZ</span><span>UPDATED</span></div>
              {yapRows.map((row) => <button className="tr" key={row[0]} onClick={() => go("editor")}><code>{row[0]}</code><span><i>{row[1][0].toUpperCase()}</i>{row[1]}</span><b>{row[2]}</b><strong>{row[3]}</strong><small>{row[4]}</small></button>)}
            </div>
            <div className="pagination"><span>Showing 1–4 of 124 yaps</span><div><button>←</button><button>1</button><button>2</button><button>3</button><button>→</button></div></div>
          </div>
          <aside className="json-float"><div><span>LIVE JSON</span><i>● SYNCING</i></div><pre>{`{
  "lobby": "hot-girl-deploy",
  "status": `}<b>"serving"</b>{`,
  "players": 8,
  "latest_yap": {
    "author": `}<em>"mika"</em>{`,
    "rizz_score": `}<strong>98</strong>{`
  }
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
    <AppShell page="yap_001" theme={theme} toggle={toggle} go={go}>
      <main className="product-page editor">
        <div className="editor-head"><div><button className="back-link" onClick={() => go("lobby")}><Icon name="back" /> HOT-GIRL-DEPLOY</button><h1>EDIT YAP<span>.</span></h1><p>yap_001 · Last saved just now</p></div><div><Button tone="plain"><Icon name="trash" /> DELETE</Button><Button><Icon name="check" /> SAVE CHANGES</Button></div></div>
        <div className="editor-grid">
          <section className="form-card">
            <div className="card-title"><span>YAP DETAILS</span><b>REQUIRED-ish</b></div>
            <div className="form-grid">
              <Field label="AURA"><select defaultValue="immaculate"><option value="immaculate">Immaculate ✦</option></select></Field>
              <Field label="RIZZ SCORE"><div className="score-input"><input defaultValue="98" /><span>/ 100</span></div></Field>
              <Field label="CONTENT" wide><textarea defaultValue="just shipped auth. we are so back" /><small>38 / 280 characters · keep yapping</small></Field>
              <Field label="TAGS" wide><div className="tag-input"><b>shipping ×</b><b>auth ×</b><span>Add a tag...</span></div></Field>
              <Field label="AUTHOR"><input defaultValue="mika" /></Field>
              <Field label="VISIBILITY"><select defaultValue="lobby"><option value="lobby">Whole lobby</option></select></Field>
            </div>
          </section>
          <aside className="json-editor">
            <div className="card-title"><span>LIVE PREVIEW</span><b>● VALID JSON</b></div>
            <pre><i>01</i>  {`{`}
{`\n`}<i>02</i>    <em>"id"</em>: <b>"yap_001"</b>,
{`\n`}<i>03</i>    <em>"author"</em>: <b>"mika"</b>,
{`\n`}<i>04</i>    <em>"content"</em>: <b>"just shipped auth.</b>
{`\n`}<i>05</i>      <b>we are so back"</b>,
{`\n`}<i>06</i>    <em>"aura"</em>: <b>"immaculate"</b>,
{`\n`}<i>07</i>    <em>"rizz_score"</em>: <strong>98</strong>,
{`\n`}<i>08</i>    <em>"tags"</em>: [<b>"shipping"</b>, <b>"auth"</b>]
{`\n`}<i>09</i>  {`}`}</pre>
            <div><span>Schema valid. You ate.</span><button>COPY</button></div>
          </aside>
        </div>
        <section className="history">
          <div className="card-title"><span>VIBE HISTORY</span><b>4 EVENTS</b></div>
          <div className="timeline">
            {["Yap created by mika", "Rizz score changed 82 → 98", "Tag “auth” added", "Content updated"].map((item, i) => <div key={item}><i className={i === 0 ? "hot" : ""}>{i === 0 ? "✦" : "✓"}</i><span><b>{item}</b><small>{i === 0 ? "just now" : `${i * 3 + 1} min ago`}</small></span></div>)}
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function Auth({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  const [signup, setSignup] = useState(true);
  return (
    <main className="auth-page">
      <div className="auth-top"><Logo onClick={() => go("home")} /><ThemeToggle theme={theme} toggle={toggle} /></div>
      <div className="auth-scribble one">✦</div><div className="auth-scribble two">↗</div>
      <section className="auth-card">
        <div className="auth-badge">{signup ? "NEW MAIN CHARACTER" : "THEY’RE BACK"}</div>
        <h1>{signup ? <>GET YOUR<br /><span>RIZZ UP.</span></> : <>WELCOME BACK,<br /><span>SIGMA.</span></>}</h1>
        <p>{signup ? "Join the database with absolutely zero chill." : "Your lobbies missed you. Lock back in."}</p>
        <form onSubmit={(e) => e.preventDefault()}>
          {signup && <Field label="WHAT DO WE CALL YOU?"><input placeholder="main character" /></Field>}
          <Field label="EMAIL"><input type="email" placeholder="you@ate.com" /></Field>
          <Field label="PASSWORD"><input type="password" placeholder="••••••••••••" /></Field>
          <Button>START COOKING <Icon name="arrow" /></Button>
        </form>
        <div className="auth-divider"><span>OR BE NORMAL</span></div>
        <Button tone="plain"><Icon name="github" /> CONTINUE WITH GITHUB</Button>
        <p className="auth-switch">{signup ? "Already got aura?" : "New to the function?"} <button onClick={() => setSignup(!signup)}>{signup ? "LOG IN" : "SIGN UP"}</button></p>
        <small>🔒 No cap, we don’t sell your data.</small>
      </section>
      <div className="auth-quote">“the database is lowkey serving”<b>— every developer, probably</b></div>
    </main>
  );
}

function Pricing({ theme, toggle, go }: { theme: Theme; toggle: () => void; go: (p: Page) => void }) {
  const plans = [
    { name: "FREE", price: "$0", desc: "For side quests and tiny yaps.", features: ["3 active lobbies", "10K yaps / month", "Realtime vibes", "Community support"], tone: "plain" as const },
    { name: "PRO", price: "$19", desc: "For devs who stay shipping.", features: ["Unlimited lobbies", "1M yaps / month", "Advanced rules", "Priority yap support", "Custom domains"], tone: "yellow" as const, badge: "MOST RIZZ" },
    { name: "SIGMA", price: "$69", desc: "For teams doing numbers.", features: ["Everything in Pro", "Unlimited yaps", "Team permissions", "SLA that goes hard", "A human, instantly"], tone: "pink" as const },
  ];
  return (
    <>
      <Header theme={theme} toggle={toggle} go={go} />
      <main className="pricing-page">
        <div className="pricing-head"><span>PRICING WITHOUT THE JUMPSCARE</span><h1>PICK YOUR<br /><mark>AURA LEVEL.</mark></h1><p>No weird fees. No “contact sales.” Just vibes and databases.</p><div className="billing"><button className="active">MONTHLY</button><button>YEARLY <b>-20%</b></button></div></div>
        <div className="pricing-grid">
          {plans.map((plan) => <article className={`price-card ${plan.tone}`} key={plan.name}>{plan.badge && <div className="plan-badge">✦ {plan.badge} ✦</div>}<span className="plan-name">{plan.name}</span><div className="price"><b>{plan.price}</b><span>/ month<br />no cap</span></div><p>{plan.desc}</p><Button tone={plan.tone === "plain" ? "plain" : plan.tone} onClick={() => go("auth")}>{plan.name === "FREE" ? "START YAPPING" : plan.name === "PRO" ? "GET PRO RIZZ" : "GO FULL SIGMA"} <Icon name="arrow" /></Button><ul>{plan.features.map((feature) => <li key={feature}><i>✓</i>{feature}</li>)}</ul></article>)}
        </div>
        <BigBanner go={go} />
      </main>
      <Footer go={go} />
    </>
  );
}

export default function App() {
  const getPage = (): Page => {
    const hash = window.location.hash.replace("#/", "") as Page;
    return ["home", "dashboard", "lobby", "editor", "auth", "pricing"].includes(hash) ? hash : "home";
  };
  const [page, setPage] = useState<Page>(getPage);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("rizz-theme") as Theme) || "light");

  useEffect(() => {
    const sync = () => setPage(getPage());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("rizz-theme", theme);
  }, [theme]);

  const go = (next: Page) => {
    window.location.hash = `/${next}`;
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const toggle = () => setTheme(theme === "light" ? "dark" : "light");

  if (page === "dashboard") return <Dashboard theme={theme} toggle={toggle} go={go} />;
  if (page === "lobby") return <Lobby theme={theme} toggle={toggle} go={go} />;
  if (page === "editor") return <Editor theme={theme} toggle={toggle} go={go} />;
  if (page === "auth") return <Auth theme={theme} toggle={toggle} go={go} />;
  if (page === "pricing") return <Pricing theme={theme} toggle={toggle} go={go} />;
  return <Landing theme={theme} toggle={toggle} go={go} />;
}
