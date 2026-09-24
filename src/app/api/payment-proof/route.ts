import { NextResponse } from "next/server";
import { proofErrorFor, storePaymentProof } from "@/lib/payment-proof";

// The endpoint is public (buyers upload before the order exists), so uploads are
// capped per minute to keep an anonymous flood from filling storage.
const MAX_UPLOADS_PER_MINUTE = 30;
let uploadWindow = { count: 0, until: 0 };

function overCapacity(): boolean {
  const now = Date.now();
  if (uploadWindow.until < now) uploadWindow = { count: 0, until: now + 60_000 };
  uploadWindow.count += 1;
  return uploadWindow.count > MAX_UPLOADS_PER_MINUTE;
}

export async function POST(request: Request) {
  if (overCapacity()) {
    return NextResponse.json(
      { error: "Demasiados comprobantes seguidos. Intenta en un minuto." },
      { status: 429 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Adjunta un archivo." }, { status: 400 });
  }
  const invalid = proofErrorFor(file);
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  try {
    return NextResponse.json({ url: await storePaymentProof(file) }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "No pudimos guardar el comprobante. Intenta de nuevo." },
      { status: 502 },
    );
  }
}
