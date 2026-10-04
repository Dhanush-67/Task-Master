import type { Task, TaskFilters, TaskInput } from "./types";
type ApiResponse<T> = { success: true; data: T } | {
  success: false; error?: { message?: string; details?: string[] }
};
async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options, headers: { "Content-Type": "application/json", ...options.headers }
  });
  const payload: ApiResponse<T> = await response.json();
  if (!response.ok || !payload.success) {
    const error = !payload.success ? payload.error : undefined;
    throw new Error(error?.details?.join(". ") || error?.message || "Request failed.");
  }
  return payload.data;
}
// PostgreSQL DATE values arrive as ISO timestamps. HTML date inputs
// and date-only rendering need the calendar portion, without a timezone shift.
function normalizeTask(task: Task): Task {
  return { ...task, dueDate: task.dueDate.slice(0, 10), dueTime: task.dueTime.slice(0, 5) };
}
export const tasksApi = {
  list: (filters: TaskFilters, signal?: AbortSignal) =>
    request<Task[]>(`/api/tasks?${new URLSearchParams({ ...filters })}`, { signal }).then((tasks) => tasks.map(normalizeTask)),
  save: (input: TaskInput, id?: string) => request<Task>(id ? `/api/tasks/${encodeURIComponent(id)}` : "/api/tasks", {
    method: id ? "PATCH" : "POST", body: JSON.stringify(input)
  }).then(normalizeTask),
  complete: (task: Task) => request<Task>(`/api/tasks/${encodeURIComponent(task.id)}/complete`, {
    method: "PATCH", body: JSON.stringify({ completed: !task.completed })
  }).then(normalizeTask),
  remove: (id: string) => request<{ message: string }>(`/api/tasks/${encodeURIComponent(id)}`, { method: "DELETE" })
};
