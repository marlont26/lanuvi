import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, createSession } from "@/lib/auth";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000;
const attempts = new Map<string, { count: number; until: number }>();

function throttled(ip: string): boolean {
  const entry = attempts.get(ip);
  if (!entry || entry.until < Date.now()) return false;
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailure(ip: string): void {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.until < now) {
    attempts.set(ip, { count: 1, until: now + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (throttled(ip)) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera unos minutos." },
      { status: 429 },
    );
  }

  const { password } = (await request.json()) as { password?: string };

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Falta configurar ADMIN_PASSWORD en el servidor." },
      { status: 500 },
    );
  }
  if (!checkPassword(password ?? "")) {
    recordFailure(ip);
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  attempts.delete(ip);
  const session = await createSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });
  return response;
}
