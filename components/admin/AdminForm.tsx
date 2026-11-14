"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type FormEvent,
} from "react";
import { FiAlertTriangle, FiTrash2, FiX } from "react-icons/fi";

import {
  initialAdminActionState,
  type AdminFormAction,
} from "@/lib/admin-action-state";

type ConfirmationOptions = {
  title: string;
  description: string;
  confirmLabel?: string;
};

type AdminFormProps = Omit<ComponentPropsWithoutRef<"form">, "action" | "onSubmit"> & {
  action: AdminFormAction;
  confirmation?: ConfirmationOptions;
};

export default function AdminForm({
  action,
  children,
  confirmation,
  ...props
}: AdminFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialAdminActionState,
  );
  const [isConfirming, setIsConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (!isConfirming) return;

    cancelButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsConfirming(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isConfirming]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!confirmation || confirmedRef.current) {
      confirmedRef.current = false;
      return;
    }

    event.preventDefault();
    setIsConfirming(true);
  };

  const confirmSubmit = () => {
    confirmedRef.current = true;
    setIsConfirming(false);
    formRef.current?.requestSubmit();
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      aria-busy={pending}
      onSubmit={handleSubmit}
      {...props}
    >
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
      {confirmation && isConfirming && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[#0A1729]/55 p-3 backdrop-blur-[2px] sm:items-center sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsConfirming(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="admin-confirmation-title"
            aria-describedby="admin-confirmation-description"
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
                <FiAlertTriangle aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="admin-confirmation-title" className="text-lg font-bold text-[#152741]">
                  {confirmation.title}
                </h2>
                <p id="admin-confirmation-description" className="mt-2 text-sm leading-6 text-slate-600">
                  {confirmation.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                aria-label="Onay penceresini kapat"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                ref={cancelButtonRef}
                type="button"
                onClick={() => setIsConfirming(false)}
                className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-[#152741] transition hover:bg-slate-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                disabled={pending}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-wait disabled:opacity-60"
              >
                <FiTrash2 aria-hidden="true" />
                {confirmation.confirmLabel ?? "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
