"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, signUp, signInWithGoogle, type AuthFormState } from "@/app/actions/auth";

const FIELD =
  "w-full bg-surface-container-high text-on-surface px-md py-sm rounded-lg outline-none focus:ring-1 focus:ring-primary transition-all font-body-md placeholder:text-outline/50 border border-outline-variant/20";
const LABEL = "font-label-md text-label-md text-on-surface-variant uppercase ml-1";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="font-body-sm text-body-sm text-error ml-1">{messages[0]}</p>;
}

function SubmitButton({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-on-primary font-label-md text-label-md py-md rounded-lg uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all mt-base shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? "One moment…" : children}
    </button>
  );
}

function Banner({ state }: { state: AuthFormState }) {
  if (state.error) {
    return (
      <p className="bg-error-container/30 border border-error/30 text-error font-body-sm text-body-sm px-md py-sm rounded-lg">
        {state.error}
      </p>
    );
  }
  if (state.notice) {
    return (
      <p className="bg-tertiary/10 border border-tertiary/30 text-tertiary font-body-sm text-body-sm px-md py-sm rounded-lg">
        {state.notice}
      </p>
    );
  }
  return null;
}

export function AuthPanel({ next }: { next: string }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction] = useActionState<AuthFormState, FormData>(signIn, {});
  const [signupState, signupAction] = useActionState<AuthFormState, FormData>(signUp, {});

  const tabClass = (active: boolean) =>
    `flex-1 py-md font-label-md text-label-md uppercase tracking-widest transition-all duration-300 border-b-2 ${
      active
        ? "border-primary text-on-surface"
        : "border-transparent text-on-surface-variant hover:text-on-surface"
    }`;

  return (
    <div className="bg-surface-container rounded-xl shadow-2xl overflow-hidden">
      <div className="flex border-b border-outline-variant/30">
        <button type="button" className={tabClass(mode === "login")} onClick={() => setMode("login")}>
          Login
        </button>
        <button type="button" className={tabClass(mode === "signup")} onClick={() => setMode("signup")}>
          Sign Up
        </button>
      </div>

      <div className="p-lg md:p-xl">
        {mode === "login" ? (
          <form action={loginAction} className="flex flex-col gap-md">
            <input type="hidden" name="next" value={next} />
            <Banner state={loginState} />

            <div className="space-y-xs">
              <label className={LABEL} htmlFor="login-email">
                Email Address
              </label>
              <input id="login-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" className={FIELD} />
              <FieldError messages={loginState.fieldErrors?.email} />
            </div>

            <div className="space-y-xs">
              <div className="flex justify-between items-center px-1">
                <label className="font-label-md text-label-md text-on-surface-variant uppercase" htmlFor="login-password">
                  Password
                </label>
                <a className="font-label-md text-label-md text-primary hover:underline transition-all" href="#">
                  Forgot?
                </a>
              </div>
              <input id="login-password" name="password" type="password" autoComplete="current-password" placeholder="••••••••" className={FIELD} />
              <FieldError messages={loginState.fieldErrors?.password} />
            </div>

            <SubmitButton>Sign In</SubmitButton>

            <div className="relative py-md flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30" />
              </div>
              <span className="relative bg-surface-container px-md font-label-md text-label-md text-outline">OR</span>
            </div>
          </form>
        ) : (
          <form action={signupAction} className="flex flex-col gap-md">
            <input type="hidden" name="next" value={next} />
            <Banner state={signupState} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className={LABEL} htmlFor="signup-name">
                  Full Name
                </label>
                <input id="signup-name" name="fullName" type="text" autoComplete="name" placeholder="John Doe" className={FIELD} />
                <FieldError messages={signupState.fieldErrors?.fullName} />
              </div>
              <div className="space-y-xs">
                <label className={LABEL} htmlFor="signup-phone">
                  Phone
                </label>
                <input id="signup-phone" name="phone" type="tel" autoComplete="tel" placeholder="+1 (555) 000-0000" className={FIELD} />
              </div>
            </div>

            <div className="space-y-xs">
              <label className={LABEL} htmlFor="signup-email">
                Email Address
              </label>
              <input id="signup-email" name="email" type="email" autoComplete="email" placeholder="name@example.com" className={FIELD} />
              <FieldError messages={signupState.fieldErrors?.email} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="space-y-xs">
                <label className={LABEL} htmlFor="signup-password">
                  Password
                </label>
                <input id="signup-password" name="password" type="password" autoComplete="new-password" placeholder="••••••••" className={FIELD} />
                <FieldError messages={signupState.fieldErrors?.password} />
              </div>
              <div className="space-y-xs">
                <label className={LABEL} htmlFor="signup-confirm">
                  Confirm
                </label>
                <input id="signup-confirm" name="confirm" type="password" autoComplete="new-password" placeholder="••••••••" className={FIELD} />
                <FieldError messages={signupState.fieldErrors?.confirm} />
              </div>
            </div>

            <div className="flex items-start gap-sm mt-xs">
              <input className="mt-1 accent-primary" type="checkbox" required id="signup-terms" />
              <label htmlFor="signup-terms" className="font-body-sm text-body-sm text-on-surface-variant">
                I agree to the <a className="text-primary hover:underline" href="#">Terms of Service</a> and{" "}
                <a className="text-primary hover:underline" href="#">Privacy Policy</a>.
              </label>
            </div>

            <SubmitButton>Create Account</SubmitButton>
          </form>
        )}

        {/* Google lives outside the tabbed forms so it can post to its own action. */}
        <form action={signInWithGoogle} className={mode === "login" ? "-mt-sm" : "mt-md"}>
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="w-full bg-surface-container-highest border border-outline-variant/30 text-on-surface font-label-md text-label-md py-md rounded-lg uppercase tracking-widest flex items-center justify-center gap-sm hover:bg-surface-bright transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="currentColor" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="currentColor" />
            </svg>
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}
