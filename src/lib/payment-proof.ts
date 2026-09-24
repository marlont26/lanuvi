import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

const SUPABASE_URL = process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const BUCKET = process.env.SUPABASE_PROOF_BUCKET || "comprobantes";

/** Guards the order payload against arbitrary URLs being stored as a receipt. */
export function isStoredProofUrl(url: string): boolean {
  if (url.startsWith("/uploads/")) return !url.includes("..");
  return (
    SUPABASE_URL.length > 0 &&
    url.startsWith(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`)
  );
}

export function proofErrorFor(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "El comprobante debe ser una imagen (JPG, PNG, WEBP) o un PDF.";
  }
  if (file.size > MAX_PROOF_BYTES) return "El comprobante no puede superar 5 MB.";
  return null;
}

/**
 * Stores the receipt in Supabase Storage when credentials are configured and falls
 * back to `public/uploads` so the flow also works on a plain local install.
 */
export async function storePaymentProof(file: File): Promise<string> {
  const name = `${randomUUID()}.${EXTENSIONS[file.type]}`;
  const body = Buffer.from(await file.arrayBuffer());

  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    const response = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${name}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
          "Content-Type": file.type,
          "x-upsert": "false",
        },
        body: new Uint8Array(body),
      },
    );
    if (!response.ok) {
      throw new Error(`Supabase Storage respondió ${response.status}`);
    }
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${name}`;
  }

  const directory = join(process.cwd(), "public", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, name), body);
  return `/uploads/${name}`;
}
