import { Suspense } from "react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import MobileAdminNav from "@/components/admin/MobileAdminNav";
import TaskNotificationScheduler from "@/components/admin/TaskNotificationScheduler";
import { requireAdmin } from "@/lib/admin-auth";

async function ProtectedPanel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-[#eef2f6] text-[#152741] lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1 p-4 pb-28 sm:p-5 sm:pb-28 md:p-8 md:pb-28 lg:p-12">{children}</div>
      <TaskNotificationScheduler />
      <MobileAdminNav />
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
