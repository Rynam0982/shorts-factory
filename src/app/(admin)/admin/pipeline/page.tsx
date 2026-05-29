"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface QualityConfig {
  provider: string;
  fallback: string;
  label: string;
  description: string;
  perSecondCostUsd: number;
  perSecondCredits: number;
}

interface PricingConfig {
  videoQualities: {
    standard: QualityConfig;
    premium: QualityConfig;
    cinema: QualityConfig;
  };
  fixedCosts: {
    storyboardCredits: number;
    dalleImageCredits: number;
    elevenlabsFlashPer1kChars: number;
    elevenlabsMultiPer1kChars: number;
    sunoMusicCredits: number;
  };
}

type VideoQuality = "standard" | "premium" | "cinema";

export default function PipelinePage() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testEstimate, setTestEstimate] = useState<{
    totalCredits: number;
    breakdown: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/pricing")
      .then((r) => r.json())
      .then((d) => {
        setConfig(d);
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Configuration sauvegardée");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function runTestEstimate() {
    const res = await fetch("/api/credits/estimate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        videoQuality: "standard",
        durationSeconds: 30,
        ttsProvider: "elevenlabs_flash",
        voiceoverCharacters: 500,
        generateImages: false,
        sceneCount: 6,
        useSunoMusic: false,
      }),
    });
    if (res.ok) {
      setTestEstimate(await res.json());
    }
  }

  function updateQuality(q: VideoQuality, field: keyof QualityConfig, value: string | number) {
    if (!config) return;
    setConfig({
      ...config,
      videoQualities: {
        ...config.videoQualities,
        [q]: { ...config.videoQualities[q], [field]: value },
      },
    });
  }

  function updateFixed(field: string, value: number) {
    if (!config) return;
    setConfig({
      ...config,
      fixedCosts: { ...config.fixedCosts, [field]: value },
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (!config) return <div className="text-slate-400">Pricing config non trouvée. Lance le seed script.</div>;

  const qualities: VideoQuality[] = ["standard", "premium", "cinema"];

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline & Pricing</h1>
          <p className="text-slate-400 text-sm mt-1">
            Modifie les coûts et providers sans redéployer l&apos;app.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
          Sauvegarder
        </Button>
      </div>

      {/* Qualités vidéo */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Qualités Vidéo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {qualities.map((q) => {
            const qc = config.videoQualities[q];
            return (
              <div key={q} className="space-y-3 p-4 bg-slate-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      q === "cinema"
                        ? "bg-amber-500/20 text-amber-300"
                        : q === "premium"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-slate-500/20 text-slate-300"
                    }`}
                  >
                    {qc.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-slate-400">Provider</Label>
                    <Input
                      value={qc.provider}
                      onChange={(e) => updateQuality(q, "provider", e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Fallback</Label>
                    <Input
                      value={qc.fallback}
                      onChange={(e) => updateQuality(q, "fallback", e.target.value)}
                      className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Coût/s (USD)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      value={qc.perSecondCostUsd}
                      onChange={(e) =>
                        updateQuality(q, "perSecondCostUsd", parseFloat(e.target.value))
                      }
                      className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-slate-400">Crédits/s</Label>
                    <Input
                      type="number"
                      value={qc.perSecondCredits}
                      onChange={(e) =>
                        updateQuality(q, "perSecondCredits", parseInt(e.target.value))
                      }
                      className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Coûts fixes */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Coûts Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(config.fixedCosts).map(([field, val]) => (
              <div key={field}>
                <Label className="text-xs text-slate-400 capitalize">
                  {field.replace(/([A-Z])/g, " $1").trim()}
                </Label>
                <Input
                  type="number"
                  value={val}
                  onChange={(e) => updateFixed(field, parseFloat(e.target.value))}
                  className="bg-slate-900 border-slate-700 text-slate-100 text-sm mt-1"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test estimation */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
            Tester l&apos;estimation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-slate-400">
            Standard 30s, 500 chars TTS, 6 scènes, pas de Suno
          </p>
          <Button onClick={runTestEstimate} variant="outline" size="sm">
            Calculer
          </Button>
          {testEstimate && (
            <div className="p-3 bg-slate-800 rounded-lg">
              <p className="text-white font-semibold">
                Total : {testEstimate.totalCredits} crédits (≈ {(testEstimate.totalCredits * 0.01).toFixed(2)}€)
              </p>
              <div className="mt-2 space-y-1">
                {Object.entries(testEstimate.breakdown).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-xs text-slate-400">
                    <span className="capitalize">{k}</span>
                    <span>{v} crédits</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
