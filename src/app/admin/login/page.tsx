import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Ingresar al panel" };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="serif text-2xl">Panel de Lanuvi</h1>
      <p className="mt-1 text-sm text-stone-600">
        Ingresa la contraseña de administración para continuar.
      </p>
      <Suspense fallback={<div className="h-40" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
