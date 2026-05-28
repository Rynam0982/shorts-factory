/* global React, Icon, Btn, Pill, Logo, ShortFrame, PlatformDot, PLATFORMS, PublicHeader, PublicFooter,
   PIPELINE_STEPS, QUALITIES, TEMPLATES, PLANS, CREDIT_PACKS */
// public-pages.jsx — Fonctionnement, Tarifs, Exemples
const { useState: usePub } = React;

function PageWrap({ active, onEnter, onNav, children }) {
  return (
    <div style={{ minHeight: "100vh", overflow: "auto" }}>
      <PublicHeader onEnter={onEnter} onNav={onNav} active={active} />
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 40px" }}>{children}</div>
      <PublicFooter onNav={onNav} />
    </div>
  );
}

function PageHero({ kicker, title, sub }) {
  return (
    <div style={{ padding: "64px 0 44px", textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
      <div className="mono" style={{ fontSize: 11, color: "var(--accent-bright)", letterSpacing: "0.14em", marginBottom: 16 }}>{kicker}</div>
      <h1 style={{ fontSize: 46, lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 18 }}>{title}</h1>
      <p style={{ fontSize: 17, color: "var(--tx-2)", lineHeight: 1.6 }}>{sub}</p>
    </div>
  );
}

/* ============ FONCTIONNEMENT ============ */
function HowItWorks({ onEnter, onNav }) {
  const detail = {
    storyboard: "Claude analyse ton sujet et écrit un storyboard structuré : hook d'accroche, découpage en 6 plans, texte de la voix off et ambiance sonore — calibré pour la rétention.",
    scenes: "Chaque plan est généré par un modèle vidéo de pointe en format 9:16. Tu choisis le niveau de qualité ; nous routons vers le meilleur moteur disponible.",
    voice: "Le texte est transformé en voix off naturelle, synchronisée au rythme des plans. Voix multilingues et clonage de ta propre voix selon le plan.",
    music: "Une piste musicale est ajoutée selon l'ambiance détectée — bibliothèque libre de droits par défaut, ou musique 100% originale générée par IA.",
    assembly: "Plans, voix, musique et sous-titres animés sont montés ensemble. 5 styles de sous-titres viraux, miniature générée, export prêt à publier.",
  };
  return (
    <PageWrap active="how" onEnter={onEnter} onNav={onNav}>
      <PageHero kicker="FONCTIONNEMENT" title="De l'idée au short publié, sans toucher au montage"
        sub="Cinq intelligences artificielles spécialisées s'enchaînent automatiquement. Tu n'écris qu'une phrase — la chaîne de production fait le reste en ~90 secondes." />

      {/* pipeline vertical détaillé */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 820, margin: "0 auto 70px" }}>
        {PIPELINE_STEPS.map((s, i) => (
          <div key={s.id} className="card" style={{ padding: 24, display: "flex", gap: 22, alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: "none" }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, display: "grid", placeItems: "center", background: "var(--accent-soft)", color: "var(--accent-bright)", border: "1px solid var(--accent-line)" }}>
                <Icon name={s.icon} size={24} />
              </div>
              {i < PIPELINE_STEPS.length - 1 && <div style={{ width: 2, height: 28, background: "var(--line-strong)", borderRadius: 2 }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className="mono" style={{ fontSize: 11, color: "var(--tx-3)" }}>ÉTAPE 0{i + 1}</span>
                <Pill tone="accent">{s.engine}</Pill>
              </div>
              <h3 style={{ fontSize: 19, marginBottom: 7 }}>{s.label}</h3>
              <p style={{ fontSize: 14, color: "var(--tx-2)", lineHeight: 1.6 }}>{detail[s.id]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* qualités */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontSize: 32, marginBottom: 12 }}>Trois niveaux de qualité</h2>
        <p style={{ fontSize: 15.5, color: "var(--tx-2)", maxWidth: 540, margin: "0 auto" }}>Choisis selon ton besoin et ton budget. Le prix s'ajuste au nombre de crédits par seconde de vidéo.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 70 }}>
        {Object.values(QUALITIES).map(q => (
          <div key={q.key} className="card" style={{ padding: 26 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--bg-2)", display: "grid", placeItems: "center", color: q.color }}><Icon name={q.icon} size={20} /></div>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--tx-0)" }}>{q.label}</span>
            </div>
            <p style={{ fontSize: 13.5, color: "var(--tx-2)", lineHeight: 1.5, marginBottom: 18, minHeight: 42 }}>{q.desc}</p>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: "var(--tx-0)" }} className="tnum">{q.crps}</span>
              <span style={{ fontSize: 13, color: "var(--tx-2)" }}>crédits / seconde</span>
            </div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--tx-3)" }}>≈ {(q.crps * 30 + (q.key === "cinema" ? 40 : 7)).toLocaleString("fr")} cr pour 30 s</div>
          </div>
        ))}
      </div>

      {/* deux modes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 70 }}>
        {[{ t: "Mode Studio", k: "À la demande", i: "bolt", tone: "accent", d: "Crée une vidéo quand tu veux, avec un contrôle total : prompt libre, qualité, durée, sous-titres. Tu paies aux crédits, sans engagement.", f: ["Contrôle plan par plan", "Estimateur de coût live", "Crédits valables sans limite"] },
          { t: "Mode Auto", k: "Pilote automatique", i: "repeat", tone: "cinema", d: "Configure une série avec un avatar récurrent et une fréquence. L'app génère et publie chaque jour, toute seule. Abonnement fixe, vidéos incluses.", f: ["Avatars IA cohérents", "Sujets via Google Trends", "Publication programmée"] }].map(m => (
          <div key={m.t} className="card" style={{ padding: 30, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: m.tone === "accent" ? "var(--accent-soft)" : "oklch(0.7 0.18 330 / 0.13)", filter: "blur(40px)" }} />
            <Pill tone={m.tone} icon={m.i}>{m.k}</Pill>
            <h3 style={{ fontSize: 23, margin: "16px 0 12px" }}>{m.t}</h3>
            <p style={{ fontSize: 14, color: "var(--tx-2)", lineHeight: 1.6, marginBottom: 20 }}>{m.d}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 11 }}>
              {m.f.map(f => <li key={f} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 14, color: "var(--tx-1)" }}><Icon name="circle-check-filled" size={17} style={{ color: m.tone === "accent" ? "var(--accent-bright)" : "var(--cinema)" }} />{f}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <FAQ items={[
        ["Combien de temps pour générer une vidéo ?", "En général moins de deux minutes, de l'écriture du scénario à l'export final prêt à publier."],
        ["Et si une étape échoue ?", "La chaîne bascule automatiquement vers un moteur de secours, et les crédits réservés sont restitués si la génération n'aboutit pas."],
        ["Puis-je publier directement ?", "Oui. Connecte tes comptes TikTok, YouTube et Instagram une fois, puis publie en un clic — ou laisse le mode Auto publier pour toi."],
        ["Mes vidéos sont-elles libres de droits ?", "Oui, vidéo, voix et musique générées sont utilisables commercialement. La musique par défaut est issue de bibliothèques libres de droits."],
      ]} />
      <CTA onEnter={onEnter} />
    </PageWrap>
  );
}

/* ============ TARIFS ============ */
function PricingPublic({ onEnter, onNav }) {
  const [billing, setBilling] = usePub("sub");
  const examples = [
    ["Standard", "30 s", 217, "2,17 €"], ["Standard", "60 s", 431, "4,31 €"],
    ["Premium", "30 s", 427, "4,27 €"], ["Premium", "60 s", 851, "8,51 €"],
    ["Cinema", "30 s", 610, "6,10 €"], ["Cinema", "60 s", 1188, "11,88 €"],
  ];
  return (
    <PageWrap active="pricing-public" onEnter={onEnter} onNav={onNav}>
      <PageHero kicker="TARIFS" title="Un abonnement pour automatiser, des crédits pour créer"
        sub="Les séries en pilote automatique sont incluses dans ton abonnement. Pour la création à la demande, tu utilises des crédits — 1 crédit = 1 centime." />

      {/* toggle */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
        <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--bg-1)", border: "1px solid var(--line)", borderRadius: 12 }}>
          {[{ id: "sub", l: "Abonnements", i: "diamond" }, { id: "packs", l: "Packs de crédits", i: "package" }].map(b => (
            <button key={b.id} onClick={() => setBilling(b.id)} style={{ display: "flex", gap: 7, alignItems: "center", padding: "9px 18px", borderRadius: 9, fontSize: 13.5, fontWeight: 600,
              background: billing === b.id ? "var(--bg-3)" : "transparent", color: billing === b.id ? "var(--tx-0)" : "var(--tx-2)" }}><Icon name={b.i} size={15} />{b.l}</button>
          ))}
        </div>
      </div>

      {billing === "sub" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 44 }}>
          {PLANS.map(p => (
            <div key={p.id} className={p.pop ? "card glow-accent" : "card"} style={{ padding: 26, position: "relative", display: "flex", flexDirection: "column", border: p.pop ? "1px solid var(--accent-line)" : undefined }}>
              {p.pop && <Pill tone="accent" icon="flame" style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)" }}>Le + choisi</Pill>}
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18, color: "var(--tx-0)", marginBottom: 4, marginTop: p.pop ? 6 : 0 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--tx-3)", marginBottom: 18, minHeight: 32 }}>{p.tagline}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 20 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 700, color: "var(--tx-0)" }}>{p.price}</span>
                <span style={{ fontSize: 13, color: "var(--tx-2)" }}>€/mois</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                {p.feats.map(f => <li key={f} style={{ display: "flex", gap: 8, fontSize: 12.5, color: "var(--tx-1)", lineHeight: 1.4 }}><Icon name="check" size={14} style={{ color: "var(--accent-bright)", marginTop: 2 }} />{f}</li>)}
              </ul>
              <Btn full variant={p.pop ? "primary" : "soft"} size="sm" onClick={onEnter}>Choisir {p.name}</Btn>
            </div>
          ))}
        </div>
      )}

      {billing === "packs" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 44 }}>
          {CREDIT_PACKS.map(p => (
            <div key={p.id} className={p.best ? "card glow-accent" : "card"} style={{ padding: 26, textAlign: "center", position: "relative", border: p.best ? "1px solid var(--accent-line)" : undefined }}>
              {p.best && <Pill tone="accent" icon="star" style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)" }}>Meilleur ratio</Pill>}
              <div style={{ color: "var(--accent-bright)", marginBottom: 14, marginTop: p.best ? 6 : 0 }}><Icon name="package" size={28} /></div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700, color: "var(--tx-0)" }} className="tnum">{p.credits.toLocaleString("fr")}</div>
              <div style={{ fontSize: 12, color: "var(--tx-3)", marginBottom: 18 }}>crédits</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "var(--tx-0)", marginBottom: 5 }}>{p.price} €</div>
              <div className="mono" style={{ fontSize: 11, color: p.per.includes("économise") ? "var(--ok)" : "var(--tx-3)", marginBottom: 18 }}>{p.per}</div>
              <Btn full variant={p.best ? "primary" : "soft"} size="sm" icon="shopping-cart" onClick={onEnter}>Acheter</Btn>
            </div>
          ))}
        </div>
      )}

      {/* table d'exemples de coûts */}
      <div className="card" style={{ padding: 8, marginBottom: 70 }}>
        <div style={{ padding: "16px 18px 8px", display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="calculator" size={17} style={{ color: "var(--accent-bright)" }} />
          <h3 style={{ fontSize: 16 }}>Combien coûte une vidéo ?</h3>
          <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--tx-3)" }}>en mode Studio</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", padding: "10px 18px", fontSize: 11, color: "var(--tx-3)", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }} className="mono">
          <span>Qualité</span><span>Durée</span><span>Crédits</span><span>Prix indicatif</span>
        </div>
        {examples.map((e, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", padding: "13px 18px", borderTop: "1px solid var(--line)", alignItems: "center", fontSize: 13.5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}><Icon name={QUALITIES[e[0].toLowerCase()].icon} size={15} style={{ color: QUALITIES[e[0].toLowerCase()].color }} /><span style={{ color: "var(--tx-0)", fontWeight: 600 }}>{e[0]}</span></span>
            <span className="mono" style={{ color: "var(--tx-2)" }}>{e[1]}</span>
            <span className="mono tnum" style={{ color: "var(--accent-bright)", fontWeight: 600 }}>{e[2].toLocaleString("fr")}</span>
            <span className="mono tnum" style={{ color: "var(--tx-1)" }}>{e[3]}</span>
          </div>
        ))}
        <div style={{ padding: "12px 18px", borderTop: "1px solid var(--line)", fontSize: 11.5, color: "var(--tx-3)" }}>+ option musique IA originale : 5 crédits · Les vidéos en mode Auto sont incluses dans l'abonnement (aucun crédit débité).</div>
      </div>

      <FAQ items={[
        ["Les crédits expirent-ils ?", "Non, les crédits achetés en pack restent valables sans limite de temps. Les crédits mensuels d'abonnement se cumulent jusqu'à 3× ton allocation."],
        ["Quelle différence entre abonnement et crédits ?", "L'abonnement débloque le mode Auto (séries publiées automatiquement) et offre un bonus de crédits. Les crédits servent à la création Studio à la demande."],
        ["Puis-je changer de plan ?", "Oui, à tout moment depuis ton espace facturation. Le changement est calculé au prorata."],
        ["Y a-t-il un essai gratuit ?", "Tu peux créer un compte gratuitement et tester l'interface. La génération nécessite des crédits ou un abonnement actif."],
      ]} />
      <CTA onEnter={onEnter} />
    </PageWrap>
  );
}

/* ============ EXEMPLES ============ */
const EXAMPLE_VIDEOS = [
  { seed: 0, cat: "top5", title: "Top 5 faits sur l'espace", cap: "L'espace SENT le métal", q: "premium", views: "1,2 M", plats: ["youtube", "tiktok"] },
  { seed: 2, cat: "story", title: "L'histoire vraie du Titanic", cap: "Personne ne s'y attendait", q: "cinema", views: "847 k", plats: ["youtube"] },
  { seed: 1, cat: "myth", title: "On utilise 10% du cerveau ?", cap: "FAUX. Voici la vérité", q: "standard", views: "2,1 M", plats: ["tiktok", "instagram"] },
  { seed: 4, cat: "beforeafter", title: "Tokyo : 1920 vs aujourd'hui", cap: "1920 vs aujourd'hui", q: "premium", views: "634 k", plats: ["youtube", "tiktok", "instagram"] },
  { seed: 3, cat: "explain", title: "Pourquoi le ciel est bleu", cap: "Ce n'est PAS l'océan", q: "standard", views: "412 k", plats: ["tiktok"] },
  { seed: 0, cat: "top5", title: "Top 5 animaux les plus rapides", cap: "Le n°1 va te choquer", q: "standard", views: "988 k", plats: ["instagram"] },
  { seed: 2, cat: "story", title: "Le mystère de l'île de Pâques", cap: "Comment ont-ils fait ?", q: "cinema", views: "1,5 M", plats: ["youtube", "tiktok"] },
  { seed: 1, cat: "myth", title: "Les vikings et leurs casques", cap: "Les cornes ? Un MYTHE", q: "standard", views: "723 k", plats: ["tiktok"] },
  { seed: 4, cat: "beforeafter", title: "Cette ville en 50 ans", cap: "Méconnaissable", q: "premium", views: "356 k", plats: ["youtube", "instagram"] },
];

function Examples({ onEnter, onNav }) {
  const [cat, setCat] = usePub("all");
  const cats = [{ id: "all", l: "Tout" }, ...TEMPLATES.filter(t => t.id !== "free").map(t => ({ id: t.id, l: t.name, i: t.icon }))];
  const list = EXAMPLE_VIDEOS.filter(v => cat === "all" || v.cat === cat);
  return (
    <PageWrap active="examples" onEnter={onEnter} onNav={onNav}>
      <PageHero kicker="EXEMPLES" title="Des shorts générés en un prompt"
        sub="Une sélection de vidéos produites par la chaîne — du format Top 5 au récit cinématique. Chacune n'a demandé qu'une phrase de départ." />

      {/* filtres catégories */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 36 }}>
        {cats.map(c => (
          <button key={c.id} onClick={() => setCat(c.id)} style={{ display: "flex", gap: 7, alignItems: "center", padding: "9px 15px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: cat === c.id ? "var(--accent-soft)" : "var(--bg-1)", border: `1px solid ${cat === c.id ? "var(--accent-line)" : "var(--line)"}`, color: cat === c.id ? "var(--tx-0)" : "var(--tx-2)" }}>
            {c.i && <Icon name={c.i} size={14} style={{ color: cat === c.id ? "var(--accent-bright)" : "var(--tx-3)" }} />}{c.l}
          </button>
        ))}
      </div>

      {/* galerie */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 22, justifyItems: "center", marginBottom: 60 }}>
        {list.map((v, i) => (
          <div key={i} style={{ width: "100%", maxWidth: 200 }}>
            <div style={{ position: "relative", display: "grid", placeItems: "center", marginBottom: 12 }}>
              <ShortFrame seed={v.seed} w={180} caption={v.cap} playing={i % 3 === 0} progress={0.4 + (i % 4) * 0.15}
                badge={<Pill tone={QUALITIES[v.q].tone} style={{ fontSize: 9, padding: "2px 6px" }}>{QUALITIES[v.q].label}</Pill>} />
            </div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: "var(--tx-0)", marginBottom: 8, lineHeight: 1.3 }}>{v.title}</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "var(--tx-3)", display: "flex", gap: 5, alignItems: "center" }}><Icon name="eye" size={13} />{v.views}</span>
              <div style={{ display: "flex", gap: 4 }}>{v.plats.map(p => <PlatformDot key={p} id={p} size={18} />)}</div>
            </div>
          </div>
        ))}
      </div>
      <CTA onEnter={onEnter} />
    </PageWrap>
  );
}

/* ---- partagés ---- */
function FAQ({ items }) {
  const [open, setOpen] = usePub(0);
  return (
    <div style={{ maxWidth: 760, margin: "0 auto 70px" }}>
      <h2 style={{ fontSize: 28, textAlign: "center", marginBottom: 28 }}>Questions fréquentes</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "18px 22px", textAlign: "left" }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: "var(--tx-0)" }}>{it[0]}</span>
              <Icon name={open === i ? "minus" : "plus"} size={18} style={{ color: "var(--accent-bright)", flex: "none" }} />
            </button>
            {open === i && <div style={{ padding: "0 22px 20px", fontSize: 14, color: "var(--tx-2)", lineHeight: 1.6 }}>{it[1]}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CTA({ onEnter }) {
  return (
    <div className="card glow-accent" style={{ padding: 50, textAlign: "center", background: "linear-gradient(160deg, var(--bg-1), var(--bg-0))", marginBottom: 30 }}>
      <h2 style={{ fontSize: 34, marginBottom: 14 }}>Prêt à lancer ta chaîne ?</h2>
      <p style={{ fontSize: 16, color: "var(--tx-2)", marginBottom: 26, maxWidth: 440, margin: "0 auto 26px" }}>Crée ton premier short gratuitement, en moins de deux minutes.</p>
      <Btn size="lg" icon="arrow-right" iconRight onClick={onEnter}>Entrer dans le studio</Btn>
    </div>
  );
}

Object.assign(window, { HowItWorks, PricingPublic, Examples });
