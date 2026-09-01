import { NextResponse } from "next/server";
import { ADMIN_COOKIE, checkPassword, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Falta configurar ADMIN_PASSWORD en el servidor." },
      { status: 500 },
    );
  }
  if (!checkPassword(password ?? "")) {
    return NextResponse.json({ error: "Contraseña incorrecta." }, { status: 401 });
  }

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
