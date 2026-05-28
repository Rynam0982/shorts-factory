/* global React, Icon, Btn, Pill, Stat, SectionTitle, PLANS, CREDIT_PACKS, TX, QUALITIES, RECENT_VIDEOS */
// pricing-admin.jsx — Crédits/Pricing + Dashboard admin
const { useState: useP } = React;

const TX_META = {
  PURCHASE: { icon: "shopping-cart", tone: "ok" }, SUBSCRIPTION_GRANT: { icon: "refresh", tone: "accent" },
  CONSUMPTION: { icon: "movie", tone: "neutral" }, BONUS: { icon: "gift", tone: "ok" },
  REFUND: { icon: "arrow-back-up", tone: "ok" }, ADMIN_ADJUSTMENT: { icon: "settings", tone: "warn" },
};

function Credits({ balance, plan = "studio" }) {
  const [tab, setTab] = useP("packs");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* solde */}
      <div className="card glow-accent" style={{ padding: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div className="mono" style={{ fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.1em", marginBottom: 10 }}>SOLDE DISPONIBLE</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 700, color: "var(--tx-0)" }} className="tnum">{balance.toLocaleString("fr")}</span>
            <span style={{ fontSize: 18, color: "var(--tx-2)" }}>crédits</span>
          </div>
          <div style={{ fontSize: 13, color: "var(--tx-3)", marginTop: 6 }}>≈ {(balance / 100).toFixed(2)} € · {Math.floor(balance / 217)} vidéos Standard ou {Math.floor(balance / 610)} Cinema</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <Pill tone="accent" icon="diamond" style={{ marginBottom: 12 }}>Plan {PLANS.find(p => p.id === plan)?.name}</Pill>
          <div><Btn icon="bolt" onClick={() => setTab("packs")}>Recharger</Btn></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {[{ id: "packs", l: "Packs de crédits", i: "package" }, { id: "plans", l: "Abonnements", i: "diamond" }, { id: "history", l: "Historique", i: "history" }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", gap: 7, alignItems: "center", padding: "9px 16px", borderRadius: 10, fontSize: 13.5, fontWeight: 600,
            background: tab === t.id ? "var(--bg-3)" : "transparent", border: `1px solid ${tab === t.id ? "var(--line-strong)" : "var(--line)"}`, color: tab === t.id ? "var(--tx-0)" : "var(--tx-2)" }}>
            <Icon name={t.i} size={15} />{t.l}</button>
        ))}
      </div>

      {tab === "packs" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {CREDIT_PACKS.map(p => (
            <div key={p.id} className={p.best ? "card glow-accent" : "card"} style={{ padding: 22, textAlign: "center", position: "relative", border: p.best ? "1px solid var(--accent-line)" : undefined }}>
              {p.best && <Pill tone="accent" icon="star" style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)" }}>Populaire</Pill>}
              <div style={{ color: "var(--accent-bright)", marginBottom: 12, marginTop: p.best ? 6 : 0 }}><Icon name="package" size={26} /></div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--tx-0)" }} className="tnum">{p.credits.toLocaleString("fr")}</div>
              <div style={{ fontSize: 12, color: "var(--tx-3)", marginBottom: 16 }}>crédits</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "var(--tx-0)", marginBottom: 4 }}>{p.price} €</div>
              <div className="mono" style={{ fontSize: 10.5, color: p.per.includes("économise") ? "var(--ok)" : "var(--tx-3)", marginBottom: 16 }}>{p.per}</div>
              <Btn full variant={p.best ? "primary" : "soft"} size="sm" icon="shopping-cart">Acheter</Btn>
            </div>
          ))}
        </div>
      )}

      {tab === "plans" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {PLANS.map(p => (
            <div key={p.id} className={p.pop ? "card glow-accent" : "card"} style={{ padding: 24, position: "relative", display: "flex", flexDirection: "column", border: p.pop ? "1px solid var(--accent-line)" : undefined }}>
              {p.pop && <Pill tone="accent" icon="flame" style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)" }}>Le + choisi</Pill>}
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, color: "var(--tx-0)", marginBottom: 4, marginTop: p.pop ? 6 : 0 }}>{p.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--tx-3)", marginBottom: 16 }}>{p.tagline}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 18 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--tx-0)" }}>{p.price}</span>
                <span style={{ fontSize: 13, color: "var(--tx-2)" }}>€/mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                {p.feats.map(f => <li key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "var(--tx-1)", lineHeight: 1.4 }}><Icon name="check" size={14} style={{ color: "var(--accent-bright)", marginTop: 2, flex: "none" }} />{f}</li>)}
              </ul>
              <Btn full variant={p.pop ? "primary" : "soft"} size="sm">{p.id === "studio" ? "Plan actuel" : "Choisir"}</Btn>
            </div>
          ))}
        </div>
      )}

      {tab === "history" && (
        <div className="card" style={{ padding: 8 }}>
          {TX.map((t, i) => {
            const m = TX_META[t.type];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < TX.length - 1 ? "1px solid var(--line)" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, display: "grid", placeItems: "center", flex: "none",
                  background: t.amount > 0 ? "oklch(0.74 0.16 155 / 0.13)" : "var(--bg-2)", color: t.amount > 0 ? "var(--ok)" : "var(--tx-2)" }}>
                  <Icon name={m.icon} size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--tx-0)" }}>{t.desc}</div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--tx-3)", marginTop: 2 }}>{t.type} · {t.date}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono tnum" style={{ fontSize: 14.5, fontWeight: 700, color: t.amount > 0 ? "var(--ok)" : "var(--tx-1)" }}>{t.amount > 0 ? "+" : ""}{t.amount.toLocaleString("fr")}</div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--tx-3)" }}>solde {t.bal.toLocaleString("fr")}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============ ADMIN ============
function RemainingVideosWidget({ service, balanceUsd, est, color }) {
  const tone = balanceUsd > 200 ? "ok" : balanceUsd > 50 ? "warn" : "bad";
  const toneColor = { ok: "var(--ok)", warn: "var(--warn)", bad: "var(--bad)" }[tone];
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--bg-2)", display: "grid", placeItems: "center", color }}><Icon name="cpu" size={16} /></div>
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--tx-0)" }}>{service}</span>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono tnum" style={{ fontSize: 16, fontWeight: 700, color: toneColor }}>${balanceUsd}</div>
          <div className="mono" style={{ fontSize: 9.5, color: "var(--tx-3)" }}>solde</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {est.map(e => (
          <div key={e.l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
            <span style={{ color: "var(--tx-2)" }}>{e.l}</span>
            <span className="mono tnum" style={{ color: "var(--tx-0)", fontWeight: 600 }}>≈ {e.n.toLocaleString("fr")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Admin() {
  const [section, setSection] = useP("overview");
  const adminNav = [
    { id: "overview", l: "Vue d'ensemble", i: "layout-dashboard" },
    { id: "users", l: "Utilisateurs", i: "users" },
    { id: "pipeline", l: "Pipeline & tarifs", i: "adjustments" },
    { id: "keys", l: "Clés API", i: "key" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <Pill tone="bad" icon="shield-lock">ESPACE OPÉRATEUR</Pill>
        <h1 style={{ fontSize: 24 }}>Console d'administration</h1>
        <div style={{ marginLeft: "auto" }}><Btn size="sm" variant="ghost" icon="refresh">Rafraîchir les soldes</Btn></div>
      </div>

      <div style={{ display: "flex", gap: 6 }}>
        {adminNav.map(n => (
          <button key={n.id} onClick={() => setSection(n.id)} style={{ display: "flex", gap: 7, alignItems: "center", padding: "9px 15px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: section === n.id ? "var(--bg-3)" : "transparent", border: `1px solid ${section === n.id ? "var(--line-strong)" : "var(--line)"}`, color: section === n.id ? "var(--tx-0)" : "var(--tx-2)" }}>
            <Icon name={n.i} size={15} />{n.l}</button>
        ))}
      </div>

      {section === "overview" && <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          <Stat label="MRR estimé" value="4 287 €" sub="+12% ce mois" icon="trending-up" />
          <Stat label="Utilisateurs actifs" value="1 284" sub="93 aujourd'hui" icon="users" />
          <Stat label="Jobs en cours" value="7" sub="2 en file" icon="loader-2" />
          <Stat label="Marge brute" value="46%" sub="coûts API ↓" icon="chart-pie" />
        </div>
        <div>
          <SectionTitle kicker="Monitoring" title="Vidéos restantes par service" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <RemainingVideosWidget service="fal.ai (vidéo)" balanceUsd={412} color="var(--accent-bright)"
              est={[{ l: "Standard 30s", n: 343 }, { l: "Premium 60s", n: 81 }, { l: "Cinema 60s", n: 61 }]} />
            <RemainingVideosWidget service="ElevenLabs (voix)" balanceUsd={88} color="var(--tk)"
              est={[{ l: "Standard 30s", n: 1760 }, { l: "Premium 60s", n: 977 }, { l: "Cinema 60s", n: 517 }]} />
            <RemainingVideosWidget service="Anthropic (LLM)" balanceUsd={36} color="var(--cinema)"
              est={[{ l: "Storyboards", n: 1200 }, { l: "Mots-clés", n: 8400 }, { l: "Réserve", n: 36 }]} />
          </div>
        </div>
        <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14, border: "1px solid oklch(0.78 0.15 75 / 0.3)", background: "oklch(0.78 0.15 75 / 0.07)" }}>
          <Icon name="alert-triangle" size={20} style={{ color: "var(--warn)" }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--tx-0)" }}>Solde Anthropic faible</div>
            <div style={{ fontSize: 12, color: "var(--tx-2)" }}>Recharge recommandée avant 200 storyboards supplémentaires.</div>
          </div>
          <Btn size="sm" variant="ghost">Acquitter</Btn>
        </div>
      </>}

      {section === "users" && (
        <div className="card" style={{ padding: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "12px 16px", borderBottom: "1px solid var(--line)", fontSize: 11, color: "var(--tx-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }} className="mono">
            <span>Utilisateur</span><span>Plan</span><span>Crédits</span><span>Vidéos</span><span>Statut</span>
          </div>
          {[["sofiane@mail.com", "Studio", "3 411", "47", "active"], ["lea.k@mail.com", "Creator Pro", "182", "129", "active"], ["marco99@mail.com", "Creator", "12", "31", "past_due"], ["agence.x@mail.com", "Agency", "2 740", "318", "active"], ["test@mail.com", "Free", "0", "2", "active"]].map((u, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", padding: "13px 16px", borderBottom: i < 4 ? "1px solid var(--line)" : "none", alignItems: "center", fontSize: 13 }}>
              <span style={{ color: "var(--tx-0)", fontWeight: 600 }}>{u[0]}</span>
              <span style={{ color: "var(--tx-2)" }}>{u[1]}</span>
              <span className="mono tnum" style={{ color: "var(--accent-bright)" }}>{u[2]}</span>
              <span className="mono tnum" style={{ color: "var(--tx-1)" }}>{u[3]}</span>
              <span><Pill tone={u[4] === "active" ? "ok" : "warn"}>{u[4]}</Pill></span>
            </div>
          ))}
        </div>
      )}

      {section === "pipeline" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {Object.values(QUALITIES).map(q => (
            <div key={q.key} className="card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <div style={{ color: q.color }}><Icon name={q.icon} size={19} /></div>
                <span style={{ fontWeight: 600, fontSize: 15, color: "var(--tx-0)" }}>{q.label}</span>
              </div>
              {[["Provider", q.key === "standard" ? "hailuo" : q.key === "premium" ? "kling_standard" : "kling_pro"], ["Fallback", q.key === "standard" ? "pexels" : "wan"], ["Crédits / s", q.crps], ["Coût / s", q.key === "standard" ? "$0.04" : q.key === "premium" ? "$0.084" : "$0.112"], ["Marge", "~46%"]].map(r => (
                <div key={r[0]} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--line)", fontSize: 12.5 }}>
                  <span style={{ color: "var(--tx-3)" }}>{r[0]}</span>
                  <span className="mono" style={{ color: "var(--tx-0)", fontWeight: 600 }}>{r[1]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {section === "keys" && (
        <div className="card" style={{ padding: 8 }}>
          {[["Anthropic", "sk-ant-a••••••••••••3f2a", true], ["fal.ai", "fal-k••••••••••••9b1c", true], ["ElevenLabs", "el_pr••••••••••••7d44", true], ["OpenAI", "sk-pr••••••••••••0a8e", true], ["Pixabay", "4827••••••••••••ac01", true], ["Pexels", "563492••••••••df90", false]].map((k, i, arr) => (
            <div key={k[0]} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--line)" : "none" }}>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: k[2] ? "var(--ok)" : "var(--tx-3)", flex: "none" }} />
              <span style={{ fontWeight: 600, fontSize: 13.5, color: "var(--tx-0)", width: 110 }}>{k[0]}</span>
              <span className="mono" style={{ fontSize: 12.5, color: "var(--tx-2)", flex: 1 }}>{k[1]}</span>
              <Pill tone={k[2] ? "ok" : "neutral"}>{k[2] ? "Active" : "Désactivée"}</Pill>
              <Btn size="sm" variant="ghost" icon="dots" style={{ padding: "6px 9px" }}> </Btn>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { Credits, Admin });
