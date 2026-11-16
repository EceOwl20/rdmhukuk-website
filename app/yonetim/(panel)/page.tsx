import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { getTasks } from "@/lib/task-store";

const priorityOrder = {
  high: 0,
  normal: 1,
  low: 2,
} as const;

const priorityLabels = {
  high: "Yüksek",
  normal: "Normal",
  low: "Düşük",
} as const;

const priorityStyles = {
  high: "bg-red-50 text-red-700 border-red-100",
  normal: "bg-blue-50 text-blue-700 border-blue-100",
  low: "bg-slate-100 text-slate-600 border-slate-200",
} as const;

function getIstanbulDateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatToday() {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const tasks = await getTasks();

  const todayKey = getIstanbulDateKey(new Date());

  const activeTasks = tasks.filter(
    (task) => task.status === "active",
  );

  const todayTasks = activeTasks
    .filter((task) => {
      if (!task.dueAt) return false;

      return (
        getIstanbulDateKey(new Date(task.dueAt)) === todayKey
      );
    })
    .sort((a, b) => {
      const priorityDiff =
        priorityOrder[a.priority] -
        priorityOrder[b.priority];

      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      if (!a.dueAt || !b.dueAt) return 0;

      return (
        new Date(a.dueAt).getTime() -
        new Date(b.dueAt).getTime()
      );
    });

  const overdueTasks = activeTasks.filter((task) => {
    if (!task.dueAt) return false;

    return (
      getIstanbulDateKey(new Date(task.dueAt)) < todayKey
    );
  });

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* HEADER */}

    <div className="order-1">
    <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D79B43]">
          Yönetim Paneli
        </p>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="text-2xl font-bold text-[#152741] lg:text-3xl">
            Genel Bakış
          </h1>

          <span className="text-sm font-medium capitalize text-slate-500">
            {formatToday()}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Website içerikleri, görevler ve yönetim
          işlemlerinin genel görünümü.
        </p>
      </div>
  </div>

   {/* 2. GECİKEN GÖREVLER - SADECE MOBİL */}
  {overdueTasks.length > 0 && (
    <div className="order-2 xl:hidden">
      <OverdueAlert count={overdueTasks.length} />
    </div>
  )}

    {/* 3. İSTATİSTİKLER - MOBİLDE 4. SIRADA */}
  <div className="order-4 grid grid-cols-2 gap-3 xl:order-2 xl:grid-cols-4 xl:gap-4">
    {/* STATS */}
    
        <StatCard
          label="Blog Yazıları"
          value={0}
          href="/yonetim/blog"
        />

        <StatCard
          label="Belgeler"
          value={0}
          href="/yonetim/belgeler"
        />

        <StatCard
          label="Görseller"
          value={0}
          href="/yonetim/gorseller"
        />

        <StatCard
          label="Açık Görevler"
          value={activeTasks.length}
          href="/yonetim/gorevler"
        />
    
  </div>


   {/* 4. ALT ALAN */}
  <div className="contents xl:grid xl:grid-cols-[1.7fr_0.8fr] xl:gap-6">

    {/* MOBİLDE 3. SIRADA */}
    <section className="order-3 rounded-2xl border border-slate-200 bg-white shadow-sm xl:order-none">
      {/* TODAY TASKS */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#152741]">
                Bugün Yapılacaklar
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Öncelik sırasına göre bugünün görevleri
              </p>
            </div>

            <span className="rounded-full bg-[#152741] px-3 py-1 text-xs font-bold text-white">
              {todayTasks.length}
            </span>
          </div>

          {todayTasks.length ? (
            <div className="divide-y divide-slate-100">
              {todayTasks.map((task) => (
                <Link
                  key={task.id}
                  href="/yonetim/gorevler"
                  className="flex items-start justify-between gap-4 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${
                          priorityStyles[
                            task.priority
                          ]
                        }`}
                      >
                        {
                          priorityLabels[
                            task.priority
                          ]
                        }
                      </span>

                      {task.category && (
                        <span className="text-xs text-slate-400">
                          #{task.category}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-2 font-semibold text-[#152741]">
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {task.dueAt && (
                    <span className="shrink-0 text-sm font-semibold text-slate-500">
                      {formatTime(task.dueAt)}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="text-2xl">✓</div>

              <p className="mt-3 font-semibold text-[#152741]">
                Bugün için görev yok
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Bugünün planı temiz görünüyor.
              </p>
            </div>
          )}

          <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
            <Link
              href="/yonetim/gorevler"
              className="text-sm font-semibold text-[#D79B43]"
            >
              Tüm görevleri görüntüle →
            </Link>
          </div>
        </section>
    </section>

    {/* MOBİLDE 5. SIRADA */}
    <div className="order-5 space-y-5 xl:order-none">

      {/* GECİKEN GÖREVLER - SADECE MASAÜSTÜ */}
      {overdueTasks.length > 0 && (
        <div className="hidden xl:block">
          <OverdueAlert count={overdueTasks.length} />
        </div>
      )}

      {/* Mevcut Hızlı İşlemler */}

    </div>
  </div>

    

      <div className="grid gap-6 xl:grid-cols-[1.7fr_0.8fr] mt-5">
        {/* RIGHT COLUMN */}
        <div className="space-y-5">

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-bold text-[#152741]">
              Hızlı İşlemler
            </h2>

            <div className="mt-4 grid gap-2">
              <QuickLink
                href="/yonetim/blog"
                label="Blog yazısı ekle"
              />

              <QuickLink
                href="/yonetim/belgeler"
                label="Belge ekle"
              />

              <QuickLink
                href="/yonetim/gorevler"
                label="Yeni görev oluştur"
              />

              <QuickLink
                href="/yonetim/icerik"
                label="Sayfa içeriklerini düzenle"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex md:min-h-[125px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-3 md:p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md lg:min-h-[155px] lg:rounded-2xl lg:p-5"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 lg:text-xs">
        {label}
      </p>

      <div className="flex items-end justify-between">
        <strong className="text-xl md:text-2xl font-bold text-[#152741] lg:text-3xl">
          {value}
        </strong>

        <span className="text-base text-[#D79B43] transition group-hover:translate-x-1 lg:text-lg">
          →
        </span>
      </div>
    </Link>
  );
}

function QuickLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-[#152741] transition hover:bg-slate-100"
    >
      {label}
      <span className="text-[#D79B43]">+</span>
    </Link>
  );
}

function OverdueAlert({ count }: { count: number }) {
  return (
    <section
      role="status"
      className="rounded-2xl border border-red-100 bg-red-50 p-4 lg:p-5"
    >
      <div className="flex items-center gap-2 text-red-700">
        <span aria-hidden="true">⚠</span>
        <span className="text-xs font-bold uppercase tracking-wider">
          Dikkat
        </span>
      </div>

      <p className="mt-2 text-lg font-bold text-red-700">
        {count} gecikmiş görev
      </p>

      <p className="mt-1 text-xs text-red-700 lg:text-sm">
        Henüz tamamlanmamış görevleriniz bulunuyor.
      </p>

      <Link
        href="/yonetim/gorevler"
        className="mt-3 inline-block text-xs font-bold text-red-700"
      >
        Görevleri kontrol et →
      </Link>
    </section>
  );
}