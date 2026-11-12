import { redirect } from "next/navigation";
import { Suspense } from "react";

import { isAdminAuthenticated, isAdminConfigured } from "@/lib/admin-auth";
import { loginAction } from "@/app/yonetim/actions";

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ hata?: string }>;
}) {
  if (await isAdminAuthenticated()) redirect("/yonetim");
  const configured = isAdminConfigured();
  const { hata } = await searchParams;

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 border-l-4 border-[#EFB059] pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#738595]">RDM Hukuk</p>
          <h1 className="mt-1 text-3xl font-bold text-[#152741]">Yönetim Paneli</h1>
        </div>
        {!configured ? (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            Panel henüz yapılandırılmadı. Sunucuda <code>ADMIN_USERNAME</code>, <code>ADMIN_PASSWORD</code> ve en az 32 karakterlik <code>SESSION_SECRET</code> tanımlayın.
          </div>
        ) : (
          <form action={loginAction} className="space-y-5">
            {process.env.NODE_ENV !== "production" && (
              <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm leading-6 text-blue-800">
                Yerel giriş: <strong>admin</strong> / <strong>admin123</strong>
              </p>
            )}
            {hata && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Kullanıcı adı veya parola hatalı.</p>}
            <label className="block text-sm font-semibold text-[#152741]">
              Kullanıcı adı
              <input name="username" autoComplete="username" required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#EFB059]" />
            </label>
            <label className="block text-sm font-semibold text-[#152741]">
              Parola
              <input name="password" type="password" autoComplete="current-password" required className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-normal outline-none focus:border-[#EFB059]" />
            </label>
            <button className="w-full rounded-lg bg-[#152741] px-4 py-3 font-semibold text-white transition hover:bg-[#203b61]">Giriş yap</button>
          </form>
        )}
    </div>
  );
}

export default function LoginPage({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eef2f6] px-5 py-12">
      <Suspense fallback={<div className="text-[#152741]">Giriş ekranı yükleniyor…</div>}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
