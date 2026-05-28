/* global React, Icon, Btn, Pill, ShortFrame, PlatformDot, TEMPLATES, QUALITIES, CAPTION_STYLES, PIPELINE_STEPS */
// studio.jsx — écran de création (mode Studio)
const { useState, useEffect, useRef } = React;

function QualityCard({ q, selected, onSelect, locked }) {
  const sel = selected === q.key;
  return (
    <button onClick={() => !locked && onSelect(q.key)} style={{
      flex: 1, textAlign: "left", padding: 16, borderRadius: 14, position: "relative",
      background: sel ? "var(--accent-soft)" : "var(--bg-1)",
      border: `1.5px solid ${sel ? "var(--accent-line)" : "var(--line)"}`,
      transition: "all .16s", opacity: locked ? 0.5 : 1, cursor: locked ? "not-allowed" : "pointer",
      boxShadow: sel ? "0 8px 26px oklch(0.66 0.21 var(--accent-h) / calc(0.25 * var(--glow)))" : "none",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
        <div style={{ color: q.color }}><Icon name={q.icon} size={19} /></div>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15.5, color: "var(--tx-0)" }}>{q.label}</span>
        {locked && <Icon name="lock" size={13} style={{ marginLeft: "auto", color: "var(--tx-3)" }} />}
        {sel && !locked && <Icon name="circle-check-filled" size={17} style={{ marginLeft: "auto", color: "var(--accent-bright)" }} />}
      </div>
      <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: 10 }}>{q.desc}</div>
      <div className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>{q.crps} cr/s</div>
    </button>
  );
}

function Segmented({ options, value, onChange, getLabel = (o) => o.label, getKey = (o) => o.id }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map((o) => {
        const k = getKey(o); const sel = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} style={{
            padding: "8px 13px", borderRadius: 9, fontSize: 13, fontWeight: 600,
            background: sel ? "var(--bg-3)" : "var(--bg-1)", color: sel ? "var(--tx-0)" : "var(--tx-2)",
            border: `1px solid ${sel ? "var(--line-strong)" : "var(--line)"}`, transition: "all .14s",
          }}>{getLabel(o)}</button>
        );
      })}
    </div>
  );
}

// ---- Pipeline live (overlay de génération) ----
function GenerationPipeline({ config, onDone, onClose }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [sceneStates, setSceneStates] = useState([0, 0, 0, 0, 0, 0]);
  const doneRef = useRef(false);

  useEffect(() => {
    let raf, t0 = performance.now();
    const durations = [1600, 4200, 1800, 1400, 2000]; // ms par étape
    let acc = [];
    let sum = 0;
    durations.forEach((d) => { acc.push(sum); sum += d; });
    const total = sum;
    function tick(now) {
      const el = now - t0;
      const p = Math.min(1, el / total);
      setProgress(p);
      let idx = durations.length - 1;
      for (let i = 0; i < durations.length; i++) { if (el < acc[i] + durations[i]) { idx = i; break; } }
      setStepIdx(idx);
      if (idx === 1) {
        const local = (el - acc[1]) / durations[1];
        setSceneStates(prev => prev.map((_, i) => {
          const start = i / 6, end = (i + 1) / 6;
          if (local >= end) return 2; if (local >= start) return 1; return 0;
        }));
      } else if (idx > 1) setSceneStates([2,2,2,2,2,2]);
      if (p >= 1) { if (!doneRef.current) { doneRef.current = true; setTimeout(onDone, 500); } return; }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "oklch(0.15 0.012 280 / 0.82)", backdropFilter: "blur(10px)",
      display: "grid", placeItems: "center", padding: 30 }} className="fade-in">
      <div className="card glow-accent" style={{ width: "min(880px, 100%)", padding: 32, maxHeight: "90%", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent-bright)" }}>
            <Icon name="loader-2" size={19} style={{ animation: "spin 0.9s linear infinite" }} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--tx-0)" }}>Génération en cours…</div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)" }}>job_8f3a · {config.quality.toUpperCase()} · {config.duration}s</div>
          </div>
          <div style={{ marginLeft: "auto", fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 600, color: "var(--accent-bright)" }} className="tnum">{Math.round(progress * 100)}%</div>
        </div>

        {/* barre globale */}
        <div style={{ height: 5, borderRadius: 5, background: "var(--bg-2)", margin: "18px 0 26px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: "linear-gradient(90deg, var(--accent-deep), var(--accent-bright))", borderRadius: 5, transition: "width .1s linear" }} />
        </div>

        {/* étapes pipeline */}
        <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
          {PIPELINE_STEPS.map((s, i) => {
            const state = i < stepIdx ? "done" : i === stepIdx ? "active" : "todo";
            return (
              <div key={s.id} style={{ flex: 1, padding: "12px 10px", borderRadius: 11, textAlign: "center", position: "relative",
                background: state === "active" ? "var(--accent-soft)" : "var(--bg-1)",
                border: `1px solid ${state === "active" ? "var(--accent-line)" : "var(--line)"}`, transition: "all .25s" }}>
                <div style={{ display: "grid", placeItems: "center", marginBottom: 7,
                  color: state === "done" ? "var(--ok)" : state === "active" ? "var(--accent-bright)" : "var(--tx-3)" }}>
                  {state === "done" ? <Icon name="circle-check-filled" size={20} />
                    : state === "active" ? <Icon name={s.icon} size={20} style={{ animation: "pulse-soft 1.2s infinite" }} />
                    : <Icon name={s.icon} size={20} />}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: state === "todo" ? "var(--tx-3)" : "var(--tx-0)" }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 9, color: "var(--tx-3)", marginTop: 3 }}>{s.engine}</div>
              </div>
            );
          })}
        </div>

        {/* aperçu scènes */}
        <div style={{ fontSize: 12, color: "var(--tx-2)", marginBottom: 12, fontWeight: 600 }}>Plans générés</div>
        <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
          {sceneStates.map((st, i) => (
            <div key={i} style={{ flex: 1, position: "relative" }}>
              <div style={{ aspectRatio: "9/16", borderRadius: 9, overflow: "hidden", border: "1px solid var(--line)", position: "relative",
                background: st === 0 ? "var(--bg-1)" : undefined }} className={st === 0 ? "ph-stripe" : ""}>
                {st >= 1 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(120% 90% at 40% 20%, oklch(0.55 0.2 ${280 + i * 18}), transparent 60%), var(--bg-3)` }} />}
                {st === 1 && <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#fff" }}>
                  <Icon name="loader-2" size={18} style={{ animation: "spin 0.9s linear infinite" }} /></div>}
                {st === 2 && <div style={{ position: "absolute", bottom: 5, right: 5, color: "var(--ok)" }}><Icon name="circle-check-filled" size={15} /></div>}
              </div>
              <div className="mono" style={{ fontSize: 9, color: "var(--tx-3)", textAlign: "center", marginTop: 5 }}>plan {i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Résultat ----
function GenerationResult({ config, onClose, onNew }) {
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40, background: "oklch(0.15 0.012 280 / 0.85)", backdropFilter: "blur(10px)",
      display: "grid", placeItems: "center", padding: 30 }} className="fade-in">
      <div className="card" style={{ width: "min(720px, 100%)", padding: 30, display: "flex", gap: 28 }}>
        <div style={{ position: "relative" }}>
          <ShortFrame seed={2} w={190} caption={config.cap || "Personne ne s'y attendait"} playing badge={<Pill tone="ok" icon="check">PRÊTE</Pill>} />
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Pill tone="ok" icon="circle-check" style={{ alignSelf: "flex-start" }}>Génération terminée</Pill>
          <h2 style={{ fontSize: 22, margin: "14px 0 6px" }}>Ta vidéo est prête 🎬</h2>
          <p style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.6 }}>
            5 plans assemblés, voix off synchronisée et sous-titres « {CAPTION_STYLES.find(c => c.id === config.captionStyle)?.label} » incrustés. Tu peux la publier directement ou l'éditer.
          </p>
          <div style={{ display: "flex", gap: 16, margin: "18px 0", flexWrap: "wrap" }}>
            <div><div className="mono" style={{ fontSize: 10, color: "var(--tx-3)", marginBottom: 3 }}>QUALITÉ</div><div style={{ fontWeight: 600, color: "var(--tx-0)", fontSize: 14 }}>{QUALITIES[config.quality].label}</div></div>
            <div><div className="mono" style={{ fontSize: 10, color: "var(--tx-3)", marginBottom: 3 }}>DURÉE</div><div style={{ fontWeight: 600, color: "var(--tx-0)", fontSize: 14 }}>{config.duration}s</div></div>
            <div><div className="mono" style={{ fontSize: 10, color: "var(--tx-3)", marginBottom: 3 }}>COÛT</div><div style={{ fontWeight: 600, color: "var(--accent-bright)", fontSize: 14 }}>{config.credits} cr</div></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: "auto", flexWrap: "wrap" }}>
            <Btn icon="brand-youtube" variant="primary">Publier</Btn>
            <Btn icon="download" variant="soft">Télécharger</Btn>
            <Btn icon="plus" variant="ghost" onClick={onNew}>Nouvelle</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

function Studio({ balance, onConsume, captionStyleDefault = "bold_center" }) {
  const [template, setTemplate] = useState("top5");
  const [prompt, setPrompt] = useState("");
  const [quality, setQuality] = useState("premium");
  const [duration, setDuration] = useState(30);
  const [captionStyle, setCaptionStyle] = useState(captionStyleDefault);
  const [platforms, setPlatforms] = useState(["tiktok", "youtube"]);
  const [suno, setSuno] = useState(false);
  const [thumb, setThumb] = useState(true);
  const [phase, setPhase] = useState("form"); // form | running | result

  const tpl = TEMPLATES.find(t => t.id === template);

  // estimation live
  const q = QUALITIES[quality];
  const videoCr = duration * q.crps;
  const ttsCr = Math.round((duration * 16) * (quality === "cinema" ? 0.02 : 0.01));
  const claudeCr = 2;
  const dalleCr = quality === "cinema" ? 28 : 0;
  const sunoCr = suno ? 5 : 0;
  const total = videoCr + ttsCr + claudeCr + dalleCr + sunoCr;
  const enough = balance >= total;

  const togglePlat = (id) => setPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const breakdown = [
    { label: "Génération vidéo", icon: "movie", cr: videoCr, note: `${duration}s × ${q.crps} cr/s` },
    { label: "Voix off", icon: "microphone", cr: ttsCr, note: quality === "cinema" ? "Multilingual v3" : "Flash v2.5" },
    { label: "Scénario (LLM)", icon: "writing", cr: claudeCr, note: "storyboard" },
    ...(dalleCr ? [{ label: "Images de référence", icon: "photo", cr: dalleCr, note: "4 × avatar" }] : []),
    ...(sunoCr ? [{ label: "Musique IA", icon: "music", cr: sunoCr, note: "Suno" }] : []),
  ];

  const config = { quality, duration, captionStyle, credits: total, cap: tpl.id === "myth" ? "FAUX. Voici la vérité" : undefined };

  return (
    <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 340px", gap: 22, alignItems: "start" }}>
      {/* COLONNE GAUCHE — formulaire */}
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {/* Templates */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 4 }}>1 · Choisis un format viral</div>
          <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginBottom: 16 }}>Un canevas narratif optimisé pour la rétention.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {TEMPLATES.map(t => {
              const sel = template === t.id;
              return (
                <button key={t.id} onClick={() => setTemplate(t.id)} style={{
                  textAlign: "left", padding: 14, borderRadius: 12, transition: "all .14s",
                  background: sel ? "var(--accent-soft)" : "var(--bg-1)", border: `1.5px solid ${sel ? "var(--accent-line)" : "var(--line)"}`,
                }}>
                  <div style={{ color: sel ? "var(--accent-bright)" : "var(--tx-2)", marginBottom: 9 }}><Icon name={t.icon} size={20} /></div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--tx-0)", marginBottom: 3 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "var(--tx-3)", lineHeight: 1.4 }}>{t.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prompt */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)" }}>2 · Décris ton sujet</div>
              <div style={{ fontSize: 12.5, color: "var(--tx-3)", marginTop: 4 }}>Une phrase suffit. L'IA s'occupe du reste.</div>
            </div>
            <Btn size="sm" variant="ghost" icon="sparkles">Suggérer</Btn>
          </div>
          <div style={{ position: "relative" }}>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3}
              placeholder={`Ex : « ${tpl.name === "Prompt libre" ? "Un astronaute découvre une cité sous la glace de Mars" : "Les faits les plus fous sur les fonds marins"} »`}
              style={{ width: "100%", resize: "none", background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12,
                padding: 14, color: "var(--tx-0)", fontSize: 14.5, lineHeight: 1.5, outline: "none", fontFamily: "var(--font-body)" }} />
          </div>
          {/* chips suggestions */}
          <div style={{ display: "flex", gap: 7, marginTop: 12, flexWrap: "wrap" }}>
            {["Faits sur l'océan profond", "Mystères de l'Égypte", "Records du monde animal"].map(s => (
              <button key={s} onClick={() => setPrompt(s)} style={{ fontSize: 12, padding: "6px 11px", borderRadius: 8, background: "var(--bg-2)", border: "1px solid var(--line)", color: "var(--tx-2)" }}>
                <Icon name="trending-up" size={12} style={{ marginRight: 5, verticalAlign: "-1px", color: "var(--accent-bright)" }} />{s}
              </button>
            ))}
          </div>
        </div>

        {/* Qualité */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)", marginBottom: 14 }}>3 · Niveau de qualité</div>
          <div style={{ display: "flex", gap: 10 }}>
            {Object.values(QUALITIES).map(qq => <QualityCard key={qq.key} q={qq} selected={quality} onSelect={setQuality} />)}
          </div>
        </div>

        {/* Options */}
        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)" }}>4 · Réglages</div>
          <div>
            <div style={{ fontSize: 12.5, color: "var(--tx-2)", marginBottom: 9, fontWeight: 600 }}>Durée</div>
            <Segmented options={[{ id: 20, label: "20s" }, { id: 30, label: "30s" }, { id: 60, label: "60s" }]} value={duration} onChange={setDuration} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: "var(--tx-2)", marginBottom: 9, fontWeight: 600 }}>Style de sous-titres</div>
            <Segmented options={CAPTION_STYLES} value={captionStyle} onChange={setCaptionStyle} />
          </div>
          <div>
            <div style={{ fontSize: 12.5, color: "var(--tx-2)", marginBottom: 9, fontWeight: 600 }}>Publier sur</div>
            <div style={{ display: "flex", gap: 9 }}>
              {["tiktok", "youtube", "instagram"].map(id => {
                const on = platforms.includes(id);
                return (
                  <button key={id} onClick={() => togglePlat(id)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "8px 13px", borderRadius: 10,
                    background: on ? "var(--bg-3)" : "var(--bg-1)", border: `1px solid ${on ? "var(--line-strong)" : "var(--line)"}`,
                    color: on ? "var(--tx-0)" : "var(--tx-3)", fontSize: 13, fontWeight: 600, transition: "all .14s",
                  }}>
                    <PlatformDot id={id} size={22} />{PLATFORMS[id].label}
                    {on && <Icon name="check" size={14} style={{ color: "var(--accent-bright)" }} />}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <OptionToggle label="Musique IA (Suno)" sub="+5 cr · piste originale" on={suno} onToggle={() => setSuno(s => !s)} icon="music" />
            <OptionToggle label="Miniature IA" sub="Thumbnail générée" on={thumb} onToggle={() => setThumb(s => !s)} icon="photo" />
          </div>
        </div>
      </div>

      {/* COLONNE DROITE — estimateur (sticky) */}
      <div style={{ position: "sticky", top: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Icon name="calculator" size={16} style={{ color: "var(--accent-bright)" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--tx-0)" }}>Estimation</span>
            <span className="mono" style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--tx-3)" }}>live</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 18 }}>
            {breakdown.map(b => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ color: "var(--tx-3)", width: 16 }}><Icon name={b.icon} size={15} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12.5, color: "var(--tx-1)", fontWeight: 500 }}>{b.label}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--tx-3)" }}>{b.note}</div>
                </div>
                <div className="mono tnum" style={{ fontSize: 13, color: "var(--tx-0)", fontWeight: 600 }}>{b.cr}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--tx-2)" }}>Coût total</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--tx-3)", marginTop: 2 }}>≈ {(total / 100).toFixed(2)} €</div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--accent-bright)" }} className="tnum">{total}<span style={{ fontSize: 14, color: "var(--tx-2)", marginLeft: 4 }}>cr</span></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Btn full size="lg" icon="player-play-filled" disabled={!enough || !prompt.trim()} onClick={() => { setPhase("running"); }}>
              Générer la vidéo
            </Btn>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 11.5 }}>
              <span style={{ color: "var(--tx-3)" }}>Solde après</span>
              <span className="mono tnum" style={{ color: enough ? "var(--tx-1)" : "var(--bad)", fontWeight: 600 }}>{balance - total} cr</span>
            </div>
            {!enough && <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--bad)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="alert-triangle" size={13} />Crédits insuffisants</div>}
            {!prompt.trim() && enough && <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--tx-3)", display: "flex", gap: 6, alignItems: "center" }}><Icon name="info-circle" size={13} />Décris ton sujet pour lancer</div>}
          </div>
        </div>

        <div className="card" style={{ padding: 16, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon name="shield-check" size={16} style={{ color: "var(--ok)", marginTop: 1 }} />
          <div style={{ fontSize: 11.5, color: "var(--tx-2)", lineHeight: 1.5 }}>Tu n'es débité <b style={{ color: "var(--tx-1)" }}>qu'après</b> une génération réussie. En cas d'échec, les crédits réservés sont restitués.</div>
        </div>
      </div>

      {phase === "running" && <GenerationPipeline config={config} onDone={() => { setPhase("result"); onConsume && onConsume(total); }} />}
      {phase === "result" && <GenerationResult config={config} onClose={() => setPhase("form")} onNew={() => { setPhase("form"); setPrompt(""); }} />}
    </div>
  );
}

function OptionToggle({ label, sub, on, onToggle, icon }) {
  return (
    <button onClick={onToggle} style={{ flex: 1, display: "flex", alignItems: "center", gap: 11, padding: 13, borderRadius: 11,
      background: on ? "var(--accent-soft)" : "var(--bg-1)", border: `1px solid ${on ? "var(--accent-line)" : "var(--line)"}`, textAlign: "left", transition: "all .14s" }}>
      <div style={{ color: on ? "var(--accent-bright)" : "var(--tx-3)" }}><Icon name={icon} size={17} /></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--tx-0)" }}>{label}</div>
        <div style={{ fontSize: 10.5, color: "var(--tx-3)" }}>{sub}</div>
      </div>
      <div style={{ width: 34, height: 20, borderRadius: 99, background: on ? "var(--accent)" : "var(--bg-3)", position: "relative", transition: "all .16s", flex: "none" }}>
        <div style={{ position: "absolute", top: 2, left: on ? 16 : 2, width: 16, height: 16, borderRadius: 99, background: "#fff", transition: "all .16s" }} />
      </div>
    </button>
  );
}

window.Studio = Studio;
