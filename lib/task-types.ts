export const taskPriorities = ["low", "normal", "high"] as const;

export type TaskPriority = (typeof taskPriorities)[number];

export const taskStatuses = ["active", "completed"] as const;

export type TaskStatus = (typeof taskStatuses)[number];

export type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: TaskPriority;
  dueAt: string | null;
  reminderAt: string | null;
  status: TaskStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTaskInput = {
  title: string;
  description?: string;
  category?: string;
  priority?: TaskPriority;
  dueAt?: string | null;
  reminderAt?: string | null;
};

export type UpdateTaskInput = Partial<CreateTaskInput>;
