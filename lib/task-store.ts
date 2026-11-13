import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  taskPriorities,
  taskStatuses,
  type CreateTaskInput,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type UpdateTaskInput,
} from "@/lib/task-types";
import { AdminFormError } from "@/lib/admin-form-error";

const TASK_STORE_VERSION = 1 as const;
const storageRoot = path.resolve(
  process.env.CONTENT_STORAGE_PATH || path.join(process.cwd(), "uploads"),
);
const dataDirectory = path.join(storageRoot, "data");
const tasksFile = path.join(dataDirectory, "tasks.json");

type TaskStore = {
  version: typeof TASK_STORE_VERSION;
  tasks: Task[];
};

let taskMutationQueue: Promise<void> = Promise.resolve();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isTaskPriority(value: unknown): value is TaskPriority {
  return typeof value === "string" && taskPriorities.includes(value as TaskPriority);
}

function isTaskStatus(value: unknown): value is TaskStatus {
  return typeof value === "string" && taskStatuses.includes(value as TaskStatus);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isNullableIsoDate(value: unknown): value is string | null {
  return value === null || isIsoDate(value);
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string" &&
    typeof value.category === "string" &&
    isTaskPriority(value.priority) &&
    isNullableIsoDate(value.dueAt) &&
    isNullableIsoDate(value.reminderAt) &&
    isTaskStatus(value.status) &&
    isNullableIsoDate(value.completedAt) &&
    isIsoDate(value.createdAt) &&
    isIsoDate(value.updatedAt)
  );
}

function parseTaskStore(value: unknown): TaskStore {
  // İlk geliştirme sürümündeki düz dizi biçimiyle geriye dönük uyumluluk.
  const candidate = Array.isArray(value)
    ? { version: TASK_STORE_VERSION, tasks: value }
    : value;

  if (
    !isRecord(candidate) ||
    candidate.version !== TASK_STORE_VERSION ||
    !Array.isArray(candidate.tasks) ||
    !candidate.tasks.every(isTask)
  ) {
    throw new Error("Görev veri dosyasının biçimi geçersiz.");
  }

  return {
    version: TASK_STORE_VERSION,
    tasks: candidate.tasks,
  };
}

async function readTaskStore(): Promise<TaskStore> {
  try {
    const storedValue: unknown = JSON.parse(await readFile(tasksFile, "utf8"));
    return parseTaskStore(storedValue);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { version: TASK_STORE_VERSION, tasks: [] };
    }
    throw error;
  }
}

async function writeTaskStore(store: TaskStore): Promise<void> {
  await mkdir(dataDirectory, { recursive: true });
  const temporaryPath = `${tasksFile}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await rename(temporaryPath, tasksFile);
}

function runTaskMutation<T>(operation: () => Promise<T>): Promise<T> {
  const result = taskMutationQueue.then(operation, operation);
  taskMutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function requiredText(value: string, label: string, maxLength: number): string {
  const normalized = value.trim();
  if (!normalized) throw new AdminFormError(`${label} boş bırakılamaz.`);
  if (normalized.length > maxLength) {
    throw new AdminFormError(`${label} en fazla ${maxLength} karakter olabilir.`);
  }
  return normalized;
}

function optionalText(value: string | undefined, label: string, maxLength: number): string {
  if (value === undefined) return "";
  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new AdminFormError(`${label} en fazla ${maxLength} karakter olabilir.`);
  }
  return normalized;
}

function optionalDate(value: string | null | undefined, label: string): string | null {
  if (value === undefined || value === null || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new AdminFormError(`${label} geçerli bir tarih olmalıdır.`);
  return date.toISOString();
}

function normalizePriority(value: TaskPriority | undefined): TaskPriority {
  if (value === undefined) return "normal";
  if (!isTaskPriority(value)) throw new AdminFormError("Geçersiz görev önceliği.");
  return value;
}

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    if (left.status !== right.status) return left.status === "active" ? -1 : 1;
    if (left.dueAt && right.dueAt) return left.dueAt.localeCompare(right.dueAt);
    if (left.dueAt) return -1;
    if (right.dueAt) return 1;
    return right.updatedAt.localeCompare(left.updatedAt);
  });
}

export async function getTasks(): Promise<Task[]> {
  return sortTasks((await readTaskStore()).tasks);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const task = (await readTaskStore()).tasks.find((item) => item.id === id);
  return task ?? null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  return runTaskMutation(async () => {
    const store = await readTaskStore();
    const now = new Date().toISOString();
    const task: Task = {
      id: randomUUID(),
      title: requiredText(input.title, "Görev başlığı", 200),
      description: optionalText(input.description, "Görev açıklaması", 10_000),
      category: optionalText(input.category, "Görev kategorisi", 100),
      priority: normalizePriority(input.priority),
      dueAt: optionalDate(input.dueAt, "Son tarih"),
      reminderAt: optionalDate(input.reminderAt, "Hatırlatma tarihi"),
      status: "active",
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    store.tasks.push(task);
    await writeTaskStore(store);
    return task;
  });
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  return runTaskMutation(async () => {
    const store = await readTaskStore();
    const taskIndex = store.tasks.findIndex((item) => item.id === id);
    if (taskIndex === -1) throw new AdminFormError("Görev bulunamadı.");

    const current = store.tasks[taskIndex];
    const updated: Task = {
      ...current,
      title:
        input.title === undefined
          ? current.title
          : requiredText(input.title, "Görev başlığı", 200),
      description:
        input.description === undefined
          ? current.description
          : optionalText(input.description, "Görev açıklaması", 10_000),
      category:
        input.category === undefined
          ? current.category
          : optionalText(input.category, "Görev kategorisi", 100),
      priority:
        input.priority === undefined ? current.priority : normalizePriority(input.priority),
      dueAt: input.dueAt === undefined ? current.dueAt : optionalDate(input.dueAt, "Son tarih"),
      reminderAt:
        input.reminderAt === undefined
          ? current.reminderAt
          : optionalDate(input.reminderAt, "Hatırlatma tarihi"),
      updatedAt: new Date().toISOString(),
    };

    store.tasks[taskIndex] = updated;
    await writeTaskStore(store);
    return updated;
  });
}

export async function setTaskCompleted(id: string, completed: boolean): Promise<Task> {
  return runTaskMutation(async () => {
    const store = await readTaskStore();
    const taskIndex = store.tasks.findIndex((item) => item.id === id);
    if (taskIndex === -1) throw new AdminFormError("Görev bulunamadı.");

    const now = new Date().toISOString();
    const updated: Task = {
      ...store.tasks[taskIndex],
      status: completed ? "completed" : "active",
      completedAt: completed ? now : null,
      updatedAt: now,
    };

    store.tasks[taskIndex] = updated;
    await writeTaskStore(store);
    return updated;
  });
}

export async function deleteTask(id: string): Promise<boolean> {
  return runTaskMutation(async () => {
    const store = await readTaskStore();
    const remainingTasks = store.tasks.filter((item) => item.id !== id);
    if (remainingTasks.length === store.tasks.length) return false;

    store.tasks = remainingTasks;
    await writeTaskStore(store);
    return true;
  });
}
