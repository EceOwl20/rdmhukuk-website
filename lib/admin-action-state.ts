export type AdminActionState = {
  error: string | null;
};

export type AdminFormAction = (
  previousState: AdminActionState,
  formData: FormData,
) => Promise<AdminActionState>;

export const initialAdminActionState: AdminActionState = {
  error: null,
};
