import "server-only";

import type { AdminActionState } from "@/lib/admin-action-state";

export class AdminFormError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminFormError";
  }
}

export function adminActionErrorState(error: unknown): AdminActionState {
  if (error instanceof AdminFormError) {
    return { error: error.message };
  }

  console.error("Yönetim paneli işlemi tamamlanamadı:", error);
  return { error: "İşlem tamamlanamadı. Lütfen tekrar deneyin." };
}
