import { Suspense } from "react";

import {
  createTaskAction,
  deleteTaskAction,
  toggleTaskAction,
  updateTaskAction,
} from "@/app/yonetim/actions";
import NotificationPermissionButton from "@/components/admin/NotificationPermissionButton";
import AdminForm from "@/components/admin/AdminForm";
import { requireAdmin } from "@/lib/admin-auth";
import { getTasks } from "@/lib/task-store";
import type { Task } from "@/lib/task-types";

const inputClassName =
  "mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-[#EFB059]";

const priorityLabels = {
  low: "Düşük",
  normal: "Normal",
  high: "Yüksek",
} as const;

const priorityStyles = {
  low: "bg-slate-100 text-slate-600",
  normal: "bg-blue-50 text-blue-700",
  high: "bg-red-50 text-red-700",
} as const;

function dateTimeInputValue(value: string | null) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function displayDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function TaskFields({ task }: { task?: Task }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="block text-sm font-semibold text-[#152741] md:col-span-2">
        Görev başlığı
        <input
          name="title"
          defaultValue={task?.title}
          maxLength={200}
          required
          className={inputClassName}
          placeholder="Örn. Dava dosyasını gözden geçir"
        />
      </label>
      <label className="block text-sm font-semibold text-[#152741] md:col-span-2">
        Açıklama
        <textarea
          name="description"
          defaultValue={task?.description}
          maxLength={10_000}
          rows={4}
          className={`${inputClassName} resize-y`}
          placeholder="Görevle ilgili notlar"
        />
      </label>
      <label className="block text-sm font-semibold text-[#152741]">
        Kategori
        <input
          name="category"
          defaultValue={task?.category}
          maxLength={100}
          className={inputClassName}
          placeholder="Örn. Müvekkil, ofis"
        />
      </label>
      <fieldset className="block text-sm font-semibold text-[#152741]">
        <legend>Öncelik</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {([
            ["low", "Düşük"],
            ["normal", "Normal"],
            ["high", "Yüksek"],
          ] as const).map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="priority"
                value={value}
                defaultChecked={(task?.priority ?? "normal") === value}
                className="peer sr-only"
              />
              <span className="flex min-h-12 items-center justify-center rounded-lg border border-slate-300 bg-white px-2 text-center font-medium text-slate-600 transition peer-checked:border-[#152741] peer-checked:bg-[#152741] peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#EFB059]">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block text-sm font-semibold text-[#152741]">
        Son tarih
        <input
          name="dueAt"
          type="datetime-local"
          defaultValue={dateTimeInputValue(task?.dueAt ?? null)}
          className={inputClassName}
        />
      </label>
      <label className="block text-sm font-semibold text-[#152741]">
        Hatırlatma zamanı
        <input
          name="reminderAt"
          type="datetime-local"
          defaultValue={dateTimeInputValue(task?.reminderAt ?? null)}
          className={inputClassName}
        />
      </label>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const completed = task.status === "completed";

  return (
    <article className={`rounded-2xl border bg-white p-4 shadow-sm sm:p-5 ${completed ? "border-slate-200 opacity-75" : "border-slate-200"}`}>
      <div className="flex items-start gap-3 sm:gap-4">
        <AdminForm action={toggleTaskAction} className="shrink-0">
          <input type="hidden" name="id" value={task.id} />
          <input type="hidden" name="completed" value={completed ? "false" : "true"} />
          <button
            type="submit"
            title={completed ? "Görevi yeniden aç" : "Tamamlandı olarak işaretle"}
            className={`mt-0.5 flex h-8 lg:h-10 w-8 lg:w-10 items-center justify-center rounded-full border-2 text-lg font-bold transition ${completed ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white text-transparent hover:border-emerald-500"}`}
          >
            ✓
          </button>
        </AdminForm>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className={`font-mont break-words text-base font-bold sm:text-lg lg:text-xl ${completed ? "text-slate-500 line-through" : "text-[#152741]"}`}>
              {task.title}
            </h2>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${priorityStyles[task.priority]}`}>
              {priorityLabels[task.priority]}
            </span>
          </div>
          {task.description && <p className="mt-1 lg:mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{task.description}</p>}
          <div className="mt-2 lg:mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
            {task.category && <span>#{task.category}</span>}
            {task.dueAt && <span>Son tarih: {displayDate(task.dueAt)}</span>}
            {task.reminderAt && <span>Hatırlatma: {displayDate(task.reminderAt)}</span>}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <details className="group w-auto">
          <summary className="cursor-pointer list-none rounded-lg border border-slate-300 px-3 py-2 lg:px-4 lg:py-2.5 text-center text-xs lg:text-sm font-semibold text-[#152741] marker:hidden hover:bg-slate-50">
            Düzenle
          </summary>
          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:min-w-[520px]">
            <AdminForm action={updateTaskAction} className="space-y-4">
              <input type="hidden" name="id" value={task.id} />
              <TaskFields task={task} />
              <div className="flex justify-end">
                <button className="w-full rounded-lg bg-[#152741] px-5 py-3 text-sm font-semibold text-white sm:w-auto">
                  Değişiklikleri kaydet
                </button>
              </div>
            </AdminForm>
          </div>
        </details>
        <AdminForm
          action={deleteTaskAction}
          confirmation={{
            title: "Görev silinsin mi?",
            description: `“${task.title}” kalıcı olarak silinecek. Bu işlem geri alınamaz.`,
            confirmLabel: "Görevi sil",
          }}
          className="w-auto"
        >
          <input type="hidden" name="id" value={task.id} />
          <button className="w-full rounded-lg border border-red-200 px-3 py-2 lg:px-4 lg:py-2.5 text-xs lg:text-sm font-semibold text-red-700 hover:bg-red-50">
            Sil
          </button>
        </AdminForm>
      </div>
    </article>
  );
}

async function TasksContent({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  await requireAdmin();
  const [tasks, params] = await Promise.all([getTasks(), searchParams]);
  const activeTasks = tasks.filter((task) => task.status === "active");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <div className="mx-auto max-w-7xl space-y-6 lg:space-y-7">
      <div className="flex flex-col gap-4 lg:gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs lg:text-sm font-semibold uppercase tracking-[0.15em] text-[#D79B43]">Panel içi çalışma alanı</p>
          <h1 className="mt-2 text-2xl lg:text-3xl font-bold">Görevler ve İşler</h1>
          <p className="mt-2 max-w-2xl text-xs lg:text-sm leading-4 lg:leading-6 text-slate-500">
            Yapılacak işleri kaydedin, son tarih belirleyin ve tamamlandıklarında işaretleyin.
          </p>
        </div>
        <div className="shrink-0 sm:max-w-sm">
          <NotificationPermissionButton />
        </div>
      </div>

      {params.durum && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          İşlem başarıyla tamamlandı.
        </p>
      )}

      <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 marker:hidden sm:px-7">
          <span>
            <strong className="block text-md lg:text-lg text-[#152741]">Yeni görev ekle</strong>
            <span className="mt-1 block text-xs lg:text-sm font-normal text-slate-500">Başlık, öncelik ve isteğe bağlı son tarih belirleyin.</span>
          </span>
          <span className="flex h-8 lg:h-10 w-8 lg:w-10 shrink-0 items-center justify-center rounded-full bg-[#152741] text-2xl text-white transition group-open:rotate-45">+</span>
        </summary>
        <AdminForm action={createTaskAction} className="space-y-5 border-t border-slate-100 px-5 py-6 sm:px-7">
          <TaskFields />
          <div className="flex justify-end">
            <button className="w-full rounded-lg bg-[#152741] px-6 py-3 font-semibold text-white transition hover:bg-[#203b61] sm:w-auto">
              Görevi kaydet
            </button>
          </div>
        </AdminForm>
      </details>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-[#152741]">Yapılacaklar</h2>
          <span className="rounded-full bg-[#152741] px-3 py-1 text-xs font-bold text-white">{activeTasks.length}</span>
        </div>
        {activeTasks.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {activeTasks.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            Henüz açık görev bulunmuyor.
          </div>
        )}
      </section>

      {completedTasks.length > 0 && (
        <details className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between marker:hidden">
            <span className="font-bold text-slate-600">Tamamlananlar ({completedTasks.length})</span>
            <span className="text-xl text-[#D79B43] transition group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 xl:grid-cols-2">
            {completedTasks.map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        </details>
      )}
    </div>
  );
}

export default function TasksPage({ searchParams }: { searchParams: Promise<{ durum?: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl text-sm text-slate-500">Görevler yükleniyor…</div>}>
      <TasksContent searchParams={searchParams} />
    </Suspense>
  );
}
