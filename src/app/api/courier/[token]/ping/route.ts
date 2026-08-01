import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

/**
 * GPS ingest for courier devices.
 *
 * Couriers have no platform login — the opaque token in the URL is the
 * credential, and `record_courier_ping` validates it against an active courier
 * before writing anything. This route is excluded from the proxy matcher so a
 * missing session never turns into a redirect.
 */

const pingSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
  accuracy: z.number().nullable().optional(),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;

  if (!z.uuid().safeParse(token).success) {
    return NextResponse.json({ error: "Invalid courier link." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = pingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("record_courier_ping", {
    p_token: token,
    p_lat: parsed.data.lat,
    p_lng: parsed.data.lng,
    p_heading: parsed.data.heading ?? null,
    p_speed: parsed.data.speed ?? null,
    p_accuracy: parsed.data.accuracy ?? null,
  });

  if (error) {
    // The function raises 42501 for an unknown or deactivated token.
    const unauthorized = error.code === "42501";
    return NextResponse.json(
      { error: unauthorized ? "This courier link is no longer active." : "Could not record location." },
      { status: unauthorized ? 403 : 500 }
    );
  }

  return NextResponse.json({ ok: true, ...(data as Record<string, unknown>) });
}
