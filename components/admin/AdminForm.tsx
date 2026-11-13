"use client";

import { useActionState, type ComponentPropsWithoutRef } from "react";

import {
  initialAdminActionState,
  type AdminFormAction,
} from "@/lib/admin-action-state";

type AdminFormProps = Omit<ComponentPropsWithoutRef<"form">, "action"> & {
  action: AdminFormAction;
};

export default function AdminForm({ action, children, ...props }: AdminFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );

  return (
    <form action={formAction} aria-busy={pending} {...props}>
      {state.error && (
        <div
          role="alert"
          aria-live="polite"
          className="mb-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {state.error}
        </div>
      )}
      {children}
    </form>
  );
}
