import { createClient, createAdminClient } from "@/lib/supabase/server";
import { setUserRole } from "@/app/actions/users";
import { getSessionUser } from "@/lib/auth";
import { dateTime, initials } from "@/lib/format";
import type { Profile, UserRole } from "@/lib/types/database";

export const metadata = { title: "People" };

const ROLES: UserRole[] = ["customer", "vendor", "admin"];

const ROLE_TONE: Record<UserRole, string> = {
  customer: "bg-surface-container-highest text-on-surface-variant",
  vendor: "bg-tertiary/15 text-tertiary",
  admin: "bg-primary/15 text-primary",
};

export default async function Page() {
  const [supabase, me] = await Promise.all([createClient(), getSessionUser()]);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // profiles doesn't store emails — those live in auth.users.
  const { data: authUsers } = await createAdminClient().auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const emailById = new Map(authUsers?.users.map((user) => [user.id, user.email ?? ""]) ?? []);

  const people = (profiles ?? []) as Profile[];

  return (
    <div className="flex flex-col gap-lg">
      <h2 className="font-headline-lg text-headline-lg text-on-surface uppercase">
        {people.length} {people.length === 1 ? "Person" : "People"}
      </h2>

      <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl">
        Promoting someone to <strong className="text-on-surface">vendor</strong> lets them open the
        vendor dashboard, but they only see restaurants where they are set as the owner — assign
        that on the restaurant&apos;s edit page.
      </p>

      <div className="flex flex-col gap-sm">
        {people.map((person) => {
          const isMe = person.id === me?.id;
          return (
            <div
              key={person.id}
              className="flex flex-col md:flex-row md:items-center gap-md p-md bg-surface-container rounded-xl border border-outline-variant/10"
            >
              <span className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden">
                {person.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="" src={person.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-label-md text-label-md text-primary">
                    {initials(person.full_name)}
                  </span>
                )}
              </span>

              <div className="flex flex-col gap-xs grow min-w-0">
                <span className="font-body-md text-body-md text-on-surface flex items-center gap-sm flex-wrap">
                  {person.full_name ?? "Unnamed"}
                  <span
                    className={`font-label-md text-label-md uppercase tracking-widest px-sm py-0.5 rounded ${
                      ROLE_TONE[person.role]
                    }`}
                  >
                    {person.role}
                  </span>
                  {isMe ? (
                    <span className="font-label-md text-label-md uppercase text-on-surface-variant">
                      (you)
                    </span>
                  ) : null}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {emailById.get(person.id) || "—"}
                  {person.phone ? ` · ${person.phone}` : ""} · joined {dateTime(person.created_at)}
                </span>
              </div>

              <form action={setUserRole} className="flex items-center gap-sm shrink-0">
                <input type="hidden" name="userId" value={person.id} />
                <label className="sr-only" htmlFor={`role-${person.id}`}>
                  Role for {person.full_name ?? "this person"}
                </label>
                <select
                  id={`role-${person.id}`}
                  name="role"
                  defaultValue={person.role}
                  disabled={isMe}
                  className="bg-surface-dim text-on-surface px-md py-xs rounded-lg border border-outline-variant/20 font-body-sm text-body-sm disabled:opacity-50"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isMe}
                  className="bg-surface-container-high text-on-surface px-md py-xs rounded-lg font-label-md text-label-md uppercase tracking-widest hover:bg-surface-bright transition-all disabled:opacity-50"
                >
                  Save
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
