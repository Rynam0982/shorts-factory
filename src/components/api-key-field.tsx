"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ApiKeyFieldProps {
  service: string;
  label: string;
  currentValue?: string;
  isEnabled?: boolean;
  onSave: (service: string, value: string, enabled: boolean) => Promise<void>;
  onDelete?: (service: string) => Promise<void>;
  onTest?: (service: string) => Promise<{ ok: boolean; message: string }>;
  placeholder?: string;
}

export default function ApiKeyField({
  service,
  label,
  currentValue = "",
  isEnabled = true,
  onSave,
  onDelete,
  onTest,
  placeholder = "sk-...",
}: ApiKeyFieldProps) {
  const [value, setValue] = useState(currentValue ? "••••••••••••••••" : "");
  const [revealed, setRevealed] = useState(false);
  const [realValue, setRealValue] = useState(currentValue);
  const [enabled, setEnabled] = useState(isEnabled);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [editing, setEditing] = useState(!currentValue);

  const displayValue = revealed ? realValue : value;

  function handleChange(v: string) {
    setRealValue(v);
    setValue(v);
    setEditing(true);
    setTestResult(null);
  }

  function toggleReveal() {
    if (!revealed) {
      setValue(realValue);
      setRevealed(true);
    } else {
      setValue(realValue ? "••••••••••••••••" : "");
      setRevealed(false);
    }
  }

  async function handleSave() {
    if (!realValue && !currentValue) {
      toast.error("Entrez une valeur avant de sauvegarder");
      return;
    }
    setSaving(true);
    try {
      await onSave(service, realValue || currentValue, enabled);
      toast.success(`${label} sauvegardée`);
      setEditing(false);
      if (!revealed) setValue("••••••••••••••••");
    } catch (err) {
      toast.error(`Erreur : ${err instanceof Error ? err.message : "Inconnue"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!onTest) return;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTest(service);
      setTestResult(result);
    } catch {
      setTestResult({ ok: false, message: "Erreur lors du test" });
    } finally {
      setTesting(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (!confirm(`Supprimer la clé ${label} ?`)) return;
    try {
      await onDelete(service);
      setValue("");
      setRealValue("");
      setEditing(true);
      toast.success(`${label} supprimée`);
    } catch (err) {
      toast.error(`Erreur : ${err instanceof Error ? err.message : "Inconnue"}`);
    }
  }

  return (
    <div className="space-y-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-200">{label}</label>
        <div className="flex items-center gap-2">
          {testResult && (
            <span className={`flex items-center gap-1 text-xs ${testResult.ok ? "text-green-400" : "text-red-400"}`}>
              {testResult.ok ? <CheckCircle size={12} /> : <XCircle size={12} />}
              {testResult.message}
            </span>
          )}
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? "bg-violet-600" : "bg-slate-600"}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enabled ? "translate-x-4.5" : "translate-x-0.5"}`} />
          </button>
          <span className="text-xs text-slate-500">{enabled ? "Activé" : "Désactivé"}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={revealed ? "text" : "password"}
            value={displayValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={placeholder}
            className="bg-slate-900 border-slate-700 text-slate-100 pr-10 font-mono text-sm"
          />
          <button
            onClick={toggleReveal}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>

        {onTest && (
          <Button
            onClick={handleTest}
            disabled={testing || !realValue}
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            {testing ? <Loader2 size={14} className="animate-spin" /> : "Tester"}
          </Button>
        )}

        <Button
          onClick={handleSave}
          disabled={saving || (!editing && !enabled !== !isEnabled)}
          size="sm"
          className="shrink-0"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : "Sauvegarder"}
        </Button>

        {onDelete && currentValue && (
          <Button
            onClick={handleDelete}
            variant="destructive"
            size="icon"
            className="shrink-0 size-8"
          >
            <Trash2 size={14} />
          </Button>
        )}
      </div>

      {currentValue && !editing && (
        <div className="flex items-center gap-1">
          <Badge variant="secondary" className="text-xs">
            {currentValue.substring(0, 8)}...{currentValue.slice(-4)}
          </Badge>
        </div>
      )}
    </div>
  );
}
