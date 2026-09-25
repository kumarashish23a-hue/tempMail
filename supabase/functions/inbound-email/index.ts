// Supabase Edge Function: POST /functions/v1/inbound-email
// Called ONLY by the Cloudflare Email Worker. Never by the frontend.
//
// Env secrets (set via `supabase secrets set`, never committed):
//   BACKEND_WEBHOOK_SECRET  — shared secret, must match the Worker's secret
//   SUPABASE_URL            — provided automatically by Supabase
//   SUPABASE_SERVICE_ROLE_KEY — provided automatically by Supabase
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  DuplicateEmailError,
  handleInboundEmail,
  type Db,
  type NewEmailRow,
} from "./handler.ts";

// --- minimal per-instance rate limiter (120 req/min per IP) ---
// Note: this is per Edge Function instance, not global. It blunts floods;
// the Bearer secret remains the real authentication.
const RATE_LIMIT = 120;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > RATE_LIMIT;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const db: Db = {
  async findMailboxByAddress(address: string) {
    const { data, error } = await supabase
      .from("temp_addresses")
      .select("id, address, expires_at")
      .eq("address", address)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
  async insertEmail(row: NewEmailRow) {
    const { data, error } = await supabase
      .from("emails")
      .insert(row)
      .select("id")
      .single();
    if (error) {
      // Unique violation on provider_message_id → duplicate delivery.
      if (error.code === "23505") {
        throw new DuplicateEmailError(`duplicate ${row.provider_message_id}`);
      }
      throw error;
    }
    return (data as { id: string }).id;
  },
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ success: false, error: "method not allowed" }, { status: 405 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return Response.json({ success: false, error: "rate limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ success: false, error: "invalid JSON" }, { status: 400 });
  }

  try {
    const result = await handleInboundEmail(
      payload,
      req.headers.get("authorization"),
      Deno.env.get("BACKEND_WEBHOOK_SECRET") ?? "",
      db,
    );
    return Response.json(result.body, { status: result.status });
  } catch (err) {
    // 500 → the Worker retries once. Safe log: no body, no secret.
    console.error(
      `inbound-email failed: ${err instanceof Error ? err.message : "unknown"}`,
    );
    return Response.json({ success: false, error: "internal error" }, { status: 500 });
  }
});
