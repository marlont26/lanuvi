import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, createSession } from "@/lib/auth";

const FREE_ATTEMPTS = 5;
const MAX_DELAY_MS = 20_000;
const WINDOW_MS = 5 * 60 * 1000;

// Single counter for the whole store: client IPs can be forged behind a proxy, so
// guesses are slowed with a growing delay instead of a lockout that a spoofed
// address could trigger for the real owner.
let failures = { count: 0, until: 0 };

function penaltyMs(): number {
  if (failures.until < Date.now()) failures = { count: 0, until: 0 };
  const excess = failures.count - FREE_ATTEMPTS + 1;
  return excess <= 0 ? 0 : Math.min(2 ** excess * 1000, MAX_DELAY_MS);
}

function recordFailure(): void {
  failures = { count: failures.count + 1, until: Date.now() + WINDOW_MS };
}

export async function POST(request: Request) {
  const penalty = penaltyMs();
  if (penalty > 0) await new Promise((resolve) => setTimeout(resolve, penalty));

  const { password } = (await request.json()) as { password?: string };

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Falta configurar ADMIN_PASSWORD en el servidor." },
      { status: 500 },
    );
  }
  if (!checkPassword(password ?? "")) {
    recordFailure();
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

  failures = { count: 0, until: 0 };
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
