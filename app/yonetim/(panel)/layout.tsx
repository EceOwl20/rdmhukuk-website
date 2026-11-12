import { Suspense } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import { requireAdmin } from "@/lib/admin-auth";

async function ProtectedPanel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#152741] lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1 p-4 sm:p-5 md:p-8 lg:p-12">{children}</div>
    </div>
  );
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#eef2f6] p-10 text-[#152741]">Panel yükleniyor…</div>}>
      <ProtectedPanel>{children}</ProtectedPanel>
    </Suspense>
  );
}
