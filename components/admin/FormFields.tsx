export function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = true,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: "text" | "email" | "date" | "url" | "file";
  required?: boolean;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[#152741]">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={type === "file" ? undefined : defaultValue}
        required={type === "file" ? false : required}
        accept={type === "file" ? "image/jpeg,image/png,image/webp,image/gif,image/svg+xml" : undefined}
        className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal outline-none file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-[#152741] file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-[#203b61] focus:border-[#EFB059]"
      />
      {hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
    </label>
  );
}

export function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  hint?: string;
}) {
  return (
    <label className="block text-sm font-semibold text-[#152741]">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        required
        className="mt-2 w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal leading-6 outline-none focus:border-[#EFB059]"
      />
      {hint && <span className="mt-1 block text-xs font-normal text-slate-500">{hint}</span>}
    </label>
  );
}

export function PanelSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm md:p-7">
      <div className="mb-6 border-l-4 border-[#EFB059] pl-4">
        <h2 className="text-xl font-bold text-[#152741]">{title}</h2>
        {description && <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export function SaveButton({ children = "Değişiklikleri kaydet" }: { children?: React.ReactNode }) {
  return <button className="rounded-lg bg-[#152741] px-6 py-3 font-semibold text-white transition hover:bg-[#203b61]">{children}</button>;
}
