export const ADMIN_COOKIE = "lanuvi_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return [...new Uint8Array(signature)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function checkPassword(password: string): boolean {
  const expected = secret();
  return expected.length > 0 && password === expected;
}

export async function createSession(): Promise<{ value: string; maxAge: number }> {
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  return {
    value: `${expiresAt}.${await sign(expiresAt)}`,
    maxAge: SESSION_TTL_MS / 1000,
  };
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token || !secret()) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (Number(expiresAt) < Date.now()) return false;
  return signature === (await sign(expiresAt));
}
