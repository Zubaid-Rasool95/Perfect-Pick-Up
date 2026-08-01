import { redirect } from "next/navigation";

/**
 * The old single static menu screen. Menus are per-vendor now, so send people
 * to the directory rather than break existing links.
 */
export default function Page() {
  redirect("/restaurants");
}
