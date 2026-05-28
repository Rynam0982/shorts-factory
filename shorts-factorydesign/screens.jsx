/* global React, Icon, Btn, Pill, ShortFrame, PlatformDot, PLATFORMS, Stat, SectionTitle, RECENT_VIDEOS, SERIES, FREQ_LABEL, QUALITIES, STATUS_MAP */
// screens.jsx — Dashboard, Séries AUTO, Historique
const { useState: useS, useEffect: useE } = React;

function StatusBadge({ status }) {
  const s = STATUS_MAP[status];
  const spin = ["PROCESSING_STORYBOARD", "GENERATING_SCENES", "ASSEMBLING"].includes(status);
  return <Pill tone={s.tone} ><Icon name={s.icon} size={12} style={spin ? { animation: "spin .9s linear infinite" } : {}} />{s.label}</Pill>;
}

function VideoRow({ v, onOpen }) {
  return (
    <button onClick={() => onOpen(v)} className="card" style={{ display: "flex", gap: 14, padding: 12, alignItems: "center", textAlign: "left", width: "100%", transition: "all .14s" }}>
      <ShortFrame seed={v.seed} w={46} caption={null} progress={0.5} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--tx-0)", marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Pill tone={QUALITIES[v.q].tone}>{QUALITIES[v.q].label}</Pill>
          <span className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>{v.dur}s</span>
          <div style={{ display: "flex", gap: 4 }}>{v.plats.map(p => <PlatformDot key={p} id={p} size={18} />)}</div>
        </div>
      </div>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 7, alignItems: "flex-end" }}>
        <StatusBadge status={v.status} />
        <span style={{ fontSize: 11.5, color: "var(--tx-3)" }}>{v.date}</span>
      </div>
    </button>
  );
}

function Dashboard({ balance, onOpenVideo, onNav }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {/* hero solde */}
      <div className="card glow-accent" style={{ padding: 26, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20,
        background: "linear-gradient(120deg, var(--accent-soft), transparent 60%), var(--panel)" }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.1em", marginBottom: 8 }}>BONJOUR, SOFIANE 👋</div>
          <h1 style={{ fontSize: 28, marginBottom: 6 }}>Prêt à produire ?</h1>
          <p style={{ fontSize: 14, color: "var(--tx-2)" }}>Tu as <b className="mono" style={{ color: "var(--accent-bright)" }}>{balance.toLocaleString("fr")} crédits</b> · soit ≈ {Math.floor(balance / 217)} vidéos Standard.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Btn size="lg" icon="player-play-filled" onClick={() => onNav("studio")}>Créer un short</Btn>
          <Btn size="lg" variant="ghost" icon="repeat" onClick={() => onNav("series")}>Nouvelle série</Btn>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        <Stat label="Vidéos générées" value="47" sub="+6 cette semaine" icon="movie" />
        <Stat label="Séries actives" value="2" sub="3 vidéos prévues" icon="repeat" />
        <Stat label="Vues cumulées" value="312k" sub="+18% vs sem. dern." icon="eye" />
        <Stat label="Crédits" value={balance.toLocaleString("fr")} sub="Plan Studio" icon="diamond" />
      </div>

      {/* récentes + en cours */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22, alignItems: "start" }}>
        <div>
          <SectionTitle kicker="Production" title="Vidéos récentes" action={<Btn size="sm" variant="ghost" iconRight="arrow-right" onClick={() => onNav("history")}>Tout voir</Btn>} />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {RECENT_VIDEOS.slice(0, 4).map(v => <VideoRow key={v.id} v={v} onOpen={onOpenVideo} />)}
          </div>
        </div>
        <div>
          <SectionTitle kicker="Mode auto" title="Prochaines séries" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SERIES.filter(s => s.active).map(s => (
              <div key={s.id} className="card" style={{ padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-soft)", color: "var(--accent-bright)", display: "grid", placeItems: "center", flex: "none" }}>
                    <Icon name="repeat" size={17} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--tx-0)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--tx-3)" }}>{FREQ_LABEL[s.freq]}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "var(--tx-2)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="clock" size={13} style={{ color: "var(--accent-bright)" }} />{s.next}</span>
                  <div style={{ display: "flex", gap: 4 }}>{s.plats.map(p => <PlatformDot key={p} id={p} size={20} />)}</div>
                </div>
              </div>
            ))}
            <button onClick={() => onNav("series")} className="card" style={{ padding: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--tx-2)", fontWeight: 600, fontSize: 13, borderStyle: "dashed" }}>
              <Icon name="plus" size={16} />Configurer une série
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Séries AUTO ----------
function Series({ onNav }) {
  const [creating, setCreating] = useS(false);
  if (creating) return <SeriesCreator onBack={() => setCreating(false)} />;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle kicker="Pilote automatique" title="Mes séries"
        action={<Btn icon="plus" onClick={() => setCreating(true)}>Nouvelle série</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {SERIES.map(s => (
          <div key={s.id} className="card" style={{ padding: 20, display: "flex", gap: 16 }}>
            <ShortFrame seed={s.seed} w={84} caption={null} progress={0.6} badge={<Pill tone="cinema" style={{ fontSize: 8, padding: "1px 5px" }}>AUTO</Pill>} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <h3 style={{ fontSize: 16 }}>{s.name}</h3>
                <Pill tone={s.active ? "ok" : "neutral"} icon={s.active ? "player-play" : "player-pause"}>{s.active ? "Active" : "Pause"}</Pill>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--tx-2)", margin: "7px 0 12px" }}>{s.topic}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, fontSize: 12, color: "var(--tx-3)", marginBottom: 14 }}>
                <span style={{ display: "flex", gap: 5, alignItems: "center" }}><Icon name="calendar-repeat" size={13} />{FREQ_LABEL[s.freq]} · {s.time}</span>
                {s.avatar && <span style={{ display: "flex", gap: 5, alignItems: "center" }}><Icon name="user-circle" size={13} />{s.avatar}</span>}
                <span style={{ display: "flex", gap: 5, alignItems: "center" }}><Icon name="movie" size={13} />{s.total} vidéos</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                <div style={{ display: "flex", gap: 5 }}>{s.plats.map(p => <PlatformDot key={p} id={p} size={22} />)}</div>
                <span style={{ fontSize: 12, color: s.active ? "var(--accent-bright)" : "var(--tx-3)", fontWeight: 600 }}>{s.next}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SeriesCreator({ onBack }) {
  const [step, setStep] = useS(1);
  const steps = ["Sujet & format", "Avatar & voix", "Programmation"];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "flex", gap: 7, alignItems: "center", color: "var(--tx-2)", fontSize: 13, marginBottom: 20, fontWeight: 600 }}>
        <Icon name="arrow-left" size={15} />Retour aux séries
      </button>
      <SectionTitle kicker="Nouvelle série" title="Configure ton pilote auto" />
      {/* stepper */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, padding: "10px 14px", borderRadius: 10,
            background: i + 1 === step ? "var(--accent-soft)" : "var(--bg-1)", border: `1px solid ${i + 1 === step ? "var(--accent-line)" : "var(--line)"}` }}>
            <div style={{ width: 22, height: 22, borderRadius: 99, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700,
              background: i + 1 <= step ? "var(--accent)" : "var(--bg-3)", color: i + 1 <= step ? "#fff" : "var(--tx-3)" }} className="mono">{i + 1}</div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: i + 1 === step ? "var(--tx-0)" : "var(--tx-3)" }}>{s}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: 26, display: "flex", flexDirection: "column", gap: 20 }}>
        {step === 1 && <>
          <Field label="Nom de la série"><input defaultValue="Faits Insolites avec Maya" style={inp} /></Field>
          <Field label="Sujet général" hint="L'IA piochera des angles différents à chaque épisode"><input defaultValue="Histoire mondiale & science" style={inp} /></Field>
          <Field label="Format narratif">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Top 5 Faits", "Mythe vs Réalité", "Histoire Vraie"].map((f, i) => (
                <button key={f} style={{ padding: "9px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, background: i === 0 ? "var(--bg-3)" : "var(--bg-1)", border: `1px solid ${i === 0 ? "var(--line-strong)" : "var(--line)"}`, color: i === 0 ? "var(--tx-0)" : "var(--tx-2)" }}>{f}</button>
              ))}
            </div>
          </Field>
        </>}
        {step === 2 && <>
          <Field label="Avatar récurrent" hint="Un personnage IA cohérent d'une vidéo à l'autre">
            <div style={{ display: "flex", gap: 12 }}>
              {["Maya", "Alex", "+ Créer"].map((a, i) => (
                <div key={a} style={{ width: 90, textAlign: "center" }}>
                  <div style={{ aspectRatio: "1", borderRadius: 14, background: i < 2 ? `radial-gradient(circle at 40% 30%, oklch(0.6 0.18 ${300 + i * 30}), var(--bg-3))` : "var(--bg-1)",
                    border: `1.5px solid ${i === 0 ? "var(--accent-line)" : "var(--line)"}`, display: "grid", placeItems: "center", color: "var(--tx-2)", marginBottom: 7 }}>
                    {i === 2 ? <Icon name="plus" size={22} /> : <Icon name="user" size={26} style={{ color: "#fff", opacity: 0.85 }} />}
                  </div>
                  <span style={{ fontSize: 12, color: i === 0 ? "var(--tx-0)" : "var(--tx-2)", fontWeight: 600 }}>{a}</span>
                </div>
              ))}
            </div>
          </Field>
          <Field label="Voix off"><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{["Maya (FR, douce)", "Léo (FR, dynamique)", "Cloner ma voix"].map((v, i) => (
            <button key={v} style={{ padding: "9px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, background: i === 0 ? "var(--bg-3)" : "var(--bg-1)", border: `1px solid ${i === 0 ? "var(--line-strong)" : "var(--line)"}`, color: i === 0 ? "var(--tx-0)" : "var(--tx-2)", display: "flex", gap: 7, alignItems: "center" }}>
              {i === 2 && <Icon name="microphone" size={14} style={{ color: "var(--accent-bright)" }} />}{v}</button>))}</div></Field>
        </>}
        {step === 3 && <>
          <Field label="Fréquence">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{Object.entries(FREQ_LABEL).map(([k, v], i) => (
              <button key={k} style={{ padding: "9px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, background: i === 0 ? "var(--bg-3)" : "var(--bg-1)", border: `1px solid ${i === 0 ? "var(--line-strong)" : "var(--line)"}`, color: i === 0 ? "var(--tx-0)" : "var(--tx-2)" }}>{v}</button>))}</div>
          </Field>
          <div style={{ display: "flex", gap: 16 }}>
            <Field label="Heure de publication" style={{ flex: 1 }}><input defaultValue="18:00" style={inp} /></Field>
            <Field label="Fuseau" style={{ flex: 1 }}><input defaultValue="Europe/Paris" style={inp} /></Field>
          </div>
          <Field label="Plateformes"><div style={{ display: "flex", gap: 9 }}>{["tiktok", "youtube", "instagram"].map((id, i) => (
            <button key={id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 13px", borderRadius: 10, background: i < 2 ? "var(--bg-3)" : "var(--bg-1)", border: `1px solid ${i < 2 ? "var(--line-strong)" : "var(--line)"}`, color: i < 2 ? "var(--tx-0)" : "var(--tx-3)", fontSize: 13, fontWeight: 600 }}>
              <PlatformDot id={id} size={20} />{PLATFORMS[id].label}</button>))}</div></Field>
        </>}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
        <Btn variant="ghost" icon="arrow-left" onClick={() => step > 1 ? setStep(step - 1) : onBack()}>{step > 1 ? "Précédent" : "Annuler"}</Btn>
        {step < 3 ? <Btn icon="arrow-right" iconRight onClick={() => setStep(step + 1)}>Continuer</Btn>
          : <Btn icon="rocket" onClick={onBack}>Activer la série</Btn>}
      </div>
    </div>
  );
}

const inp = { width: "100%", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 10, padding: "11px 13px", color: "var(--tx-0)", fontSize: 14, outline: "none" };
function Field({ label, hint, children, style }) {
  return (
    <div style={style}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-1)", marginBottom: hint ? 4 : 9 }}>{label}</div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--tx-3)", marginBottom: 9 }}>{hint}</div>}
      {children}
    </div>
  );
}

// ---------- Historique + lecteur ----------
function History({ onOpenVideo }) {
  const [filter, setFilter] = useS("all");
  const filters = [{ id: "all", l: "Toutes" }, { id: "standard", l: "Standard" }, { id: "premium", l: "Premium" }, { id: "cinema", l: "Cinema" }];
  const list = RECENT_VIDEOS.filter(v => filter === "all" || v.q === filter);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <SectionTitle kicker="Bibliothèque" title="Historique des vidéos"
        action={<div style={{ display: "flex", gap: 6 }}>{filters.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "7px 13px", borderRadius: 9, fontSize: 12.5, fontWeight: 600,
            background: filter === f.id ? "var(--bg-3)" : "var(--bg-1)", border: `1px solid ${filter === f.id ? "var(--line-strong)" : "var(--line)"}`, color: filter === f.id ? "var(--tx-0)" : "var(--tx-2)" }}>{f.l}</button>))}</div>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 18 }}>
        {list.map(v => (
          <button key={v.id} onClick={() => onOpenVideo(v)} className="card" style={{ padding: 12, textAlign: "left", transition: "all .14s" }}>
            <div style={{ display: "grid", placeItems: "center", marginBottom: 12, position: "relative" }}>
              <ShortFrame seed={v.seed} w={130} caption={v.cap} progress={v.status === "DONE" ? 1 : 0.4} badge={<StatusBadge status={v.status} />} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "var(--tx-0)", marginBottom: 8, lineHeight: 1.3, minHeight: 34 }}>{v.title}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 4 }}>{v.plats.map(p => <PlatformDot key={p} id={p} size={18} />)}</div>
              <span style={{ fontSize: 11.5, color: "var(--tx-3)", display: "flex", gap: 4, alignItems: "center" }}><Icon name="eye" size={13} />{v.views}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Lecteur (modal) ----------
function VideoPlayer({ v, onClose }) {
  const [playing, setPlaying] = useS(true);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 60, background: "oklch(0.1 0.01 280 / 0.8)", backdropFilter: "blur(12px)", display: "grid", placeItems: "center", padding: 30 }} className="fade-in">
      <div onClick={e => e.stopPropagation()} className="card" style={{ display: "flex", gap: 26, padding: 26, maxWidth: 760 }}>
        <ShortFrame seed={v.seed} w={230} caption={v.cap} playing={playing} progress={0.45} captionStyle="bold_center" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 280 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <StatusBadge status={v.status} />
            <button onClick={onClose} style={{ color: "var(--tx-2)" }}><Icon name="x" size={20} /></button>
          </div>
          <h2 style={{ fontSize: 21, margin: "14px 0 8px", lineHeight: 1.2 }}>{v.title}</h2>
          <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
            <Pill tone={QUALITIES[v.q].tone} icon={QUALITIES[v.q].icon}>{QUALITIES[v.q].label}</Pill>
            <Pill icon="clock">{v.dur}s</Pill>
            <Pill icon="eye">{v.views} vues</Pill>
          </div>
          {/* contrôles */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
            <button onClick={() => setPlaying(p => !p)} style={{ width: 44, height: 44, borderRadius: 99, background: "var(--accent)", color: "#fff", display: "grid", placeItems: "center" }}>
              <Icon name={playing ? "player-pause-filled" : "player-play-filled"} size={20} />
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ height: 4, borderRadius: 4, background: "var(--bg-3)" }}><div style={{ width: "45%", height: "100%", background: "var(--accent-bright)", borderRadius: 4 }} /></div>
              <div className="mono" style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--tx-3)", marginTop: 6 }}><span>0:13</span><span>0:{v.dur}</span></div>
            </div>
            <button style={{ color: "var(--tx-2)" }}><Icon name="volume" size={19} /></button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18, flexWrap: "wrap" }}>
            {v.plats.map(p => <Btn key={p} size="sm" variant="soft" icon={PLATFORMS[p].icon}>Republier</Btn>)}
            <Btn size="sm" variant="ghost" icon="download">Télécharger</Btn>
            <Btn size="sm" variant="ghost" icon="copy">Dupliquer</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard, Series, History, VideoPlayer, StatusBadge });
