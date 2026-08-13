import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";

/**
 * Hands out a short-lived signed upload URL for the `media` bucket.
 *
 * The browser uploads straight to Supabase Storage with that URL, so image
 * bytes never pass through this server. That matters: serverless request
 * bodies are capped around 4.5MB, and routing a photo through here would hit
 * that ceiling for no benefit.
 *
 * Authorisation happens here rather than in storage policies, keeping the
 * rule in the same place as the rest of the app's role checks.
 */

const BUCKET = "media";

/** Folders callers may write to. Anything else is rejected outright. */
const FOLDERS = ["vendors", "logos", "menu"] as const;

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const requestSchema = z.object({
  folder: z.enum(FOLDERS),
  contentType: z.string().refine((value) => value in EXTENSIONS, {
    message: "Only JPEG, PNG, WebP, AVIF and GIF images are accepted.",
  }),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  const role = user?.profile?.role;

  if (!user || (role !== "admin" && role !== "vendor")) {
    return NextResponse.json(
      { error: "Only restaurant staff and administrators can upload images." },
      { status: 403 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected a JSON body." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.flattenError(parsed.error).fieldErrors.contentType?.[0] ?? "Invalid upload request." },
      { status: 400 }
    );
  }

  const extension = EXTENSIONS[parsed.data.contentType];
  // Random name: keeps uploads from colliding and stops a replaced image
  // being served from a stale CDN cache under the old URL.
  const path = `${parsed.data.folder}/${crypto.randomUUID()}.${extension}`;

  const supabase = createAdminClient();
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: "Could not start the upload. Check the media bucket exists." },
      { status: 500 }
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return NextResponse.json({ path, token: data.token, publicUrl });
}
