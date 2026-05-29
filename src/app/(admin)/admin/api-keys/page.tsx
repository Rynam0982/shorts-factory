"use client";

import { useEffect, useState, useCallback } from "react";
import ApiKeyField from "@/components/api-key-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_SERVICES = [
  {
    section: "LLM & Scripts",
    items: [
      { service: "anthropic", label: "Anthropic (Claude)", placeholder: "sk-ant-..." },
    ],
  },
  {
    section: "Images",
    items: [
      { service: "openai", label: "OpenAI (DALL-E + TTS)", placeholder: "sk-..." },
    ],
  },
  {
    section: "Génération Vidéo IA",
    items: [
      { service: "fal", label: "fal.ai (Kling + Hailuo)", placeholder: "key-..." },
    ],
  },
  {
    section: "Voix Off",
    items: [
      { service: "elevenlabs", label: "ElevenLabs", placeholder: "sk_..." },
    ],
  },
  {
    section: "Stock & BGM",
    items: [
      { service: "pixabay", label: "Pixabay (BGM gratuit)", placeholder: "..." },
      { service: "pexels", label: "Pexels (Stock vidéo)", placeholder: "..." },
      { service: "apiframe", label: "Apiframe (Suno music, optionnel)", placeholder: "..." },
    ],
  },
  {
    section: "Alertes Email",
    items: [
      { service: "resend", label: "Resend (emails transactionnels)", placeholder: "re_..." },
    ],
  },
];

type KeyData = { hasValue: boolean; enabled: boolean };

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<Record<string, KeyData>>({});
  const [loading, setLoading] = useState(true);

  const fetchKeys = useCallback(async () => {
    const res = await fetch("/api/admin/api-keys");
    if (res.ok) {
      const data = await res.json();
      setKeys(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function handleSave(service: string, value: string, enabled: boolean) {
    const res = await fetch("/api/admin/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service, value, enabled }),
    });
    if (!res.ok) throw new Error("Erreur de sauvegarde");
    await fetchKeys();
  }

  async function handleDelete(service: string) {
    const res = await fetch("/api/admin/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service }),
    });
    if (!res.ok) throw new Error("Erreur de suppression");
    await fetchKeys();
  }

  async function handleTest(service: string): Promise<{ ok: boolean; message: string }> {
    const res = await fetch(`/api/admin/api-keys/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ service }),
    });
    return res.json();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400 text-sm">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Clés API</h1>
        <p className="text-slate-400 text-sm mt-1">
          Toutes les clés sont chiffrées AES-256-GCM avant stockage dans Firebase.
        </p>
      </div>

      {API_SERVICES.map(({ section, items }) => (
        <Card key={section} className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              {section}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map(({ service, label, placeholder }) => (
              <ApiKeyField
                key={service}
                service={service}
                label={label}
                placeholder={placeholder}
                isEnabled={keys[service]?.enabled ?? true}
                currentValue={keys[service]?.hasValue ? "placeholder" : ""}
                onSave={handleSave}
                onDelete={handleDelete}
                onTest={handleTest}
              />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
