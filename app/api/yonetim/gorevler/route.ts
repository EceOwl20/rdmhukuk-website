import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getTasks } from "@/lib/task-store";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ tasks: [] }, { status: 401 });
  }

  const tasks = (await getTasks())
    .filter((task) => task.status === "active" && (task.reminderAt || task.dueAt))
    .map(({ id, title, dueAt, reminderAt }) => ({ id, title, dueAt, reminderAt }));

  return Response.json(
    { tasks },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
