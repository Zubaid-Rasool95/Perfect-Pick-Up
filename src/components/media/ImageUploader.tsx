"use client";

import { useId, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/avif,image/gif";

export type UploadFolder = "vendors" | "logos" | "menu";

/**
 * Picks an image, uploads it straight to Supabase Storage, and writes the
 * resulting public URL into a hidden input — so the surrounding form and its
 * server action keep working unchanged.
 *
 * Pasting a URL by hand still works. Vendors sometimes already host their
 * artwork elsewhere, and removing that would be a downgrade.
 */
export function ImageUploader({
  name,
  label,
  folder,
  defaultValue = "",
  hint,
  aspect = "wide",
}: {
  name: string;
  label: string;
  folder: UploadFolder;
  defaultValue?: string | null;
  hint?: string;
  aspect?: "wide" | "square";
}) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlField, setShowUrlField] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  async function handleFile(file: File) {
    setError(null);

    if (file.size > MAX_BYTES) {
      setError(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 5MB — try resizing it first.`
      );
      return;
    }

    setBusy(true);
    try {
      // 1. Ask our server for a signed slot (it checks the caller's role).
      const response = await fetch("/api/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder, contentType: file.type }),
      });

      const payload = (await response.json()) as {
        path?: string;
        token?: string;
        publicUrl?: string;
        error?: string;
      };

      if (!response.ok || !payload.path || !payload.token || !payload.publicUrl) {
        setError(payload.error ?? "Could not start the upload.");
        return;
      }

      // 2. Send the bytes straight to storage, bypassing our server.
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("media")
        .uploadToSignedUrl(payload.path, payload.token, file, {
          contentType: file.type,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      setUrl(payload.publicUrl);
    } catch {
      setError("The upload failed. Check your connection and try again.");
    } finally {
      setBusy(false);
      // Allow re-picking the same file after a failure.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const previewClass =
    aspect === "square"
      ? "w-20 h-20 rounded-lg"
      : "w-full max-w-[280px] aspect-[16/9] rounded-lg";

  return (
    <div className="space-y-xs">
      <span className="font-label-md text-label-md text-on-surface-variant uppercase ml-1">
        {label}
      </span>

      {/* The value the form actually submits. */}
      <input type="hidden" name={name} value={url} />

      <div className="flex items-start gap-md flex-wrap">
        <div
          className={`${previewClass} overflow-hidden bg-surface-dim border border-outline-variant/20 flex items-center justify-center shrink-0`}
        >
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt="" src={url} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-outline text-[28px]">image</span>
          )}
        </div>

        <div className="flex flex-col gap-sm">
          <div className="flex gap-sm flex-wrap">
            <input
              ref={inputRef}
              id={fieldId}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            <label
              htmlFor={fieldId}
              className={`bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest transition-all inline-flex items-center gap-xs ${
                busy
                  ? "opacity-60 cursor-wait"
                  : "cursor-pointer hover:bg-surface-bright"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {busy ? "progress_activity" : "upload"}
              </span>
              {busy ? "Uploading…" : url ? "Replace" : "Upload image"}
            </label>

            {url ? (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setError(null);
                }}
                className="px-md py-xs font-label-md text-label-md uppercase tracking-widest text-error/80 hover:text-error transition-colors"
              >
                Remove
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setShowUrlField((open) => !open)}
            className="self-start font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors underline underline-offset-2"
          >
            {showUrlField ? "Hide URL field" : "Or paste an image URL"}
          </button>

          {showUrlField ? (
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://…"
              className="w-full min-w-[260px] bg-surface-dim text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20"
            />
          ) : null}

          {hint ? (
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[380px]">{hint}</p>
          ) : null}

          {error ? (
            <p className="font-body-sm text-body-sm text-error max-w-[380px]">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
