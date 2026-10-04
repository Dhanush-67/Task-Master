export interface Task {
  id: string; title: string; dueDate: string; dueTime: string; completed: boolean;
  createdAt: string; updatedAt: string;
}
export interface TaskInput { title: string; dueDate: string; dueTime: string; }
export interface TaskFilters {
  status: "all" | "open" | "completed";
  sortBy: "dueDate" | "createdAt" | "title";
  order: "asc" | "desc";
}
