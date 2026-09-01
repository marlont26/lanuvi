"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "No pudimos validar la contraseña.");
        return;
      }
      router.replace(params.get("next") || "/admin");
      router.refresh();
    } catch {
      setError("Error de conexión.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mt-6 space-y-4 p-6">
      <div>
        <label className="label" htmlFor="password">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          required
          autoFocus
          className="field"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>
      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
      )}
      <button type="submit" disabled={submitting} className="btn-primary w-full">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Ingresar
      </button>
    </form>
  );
}
