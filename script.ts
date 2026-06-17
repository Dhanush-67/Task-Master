type TaskStatus = "all" | "open" | "completed";
type TaskSortBy = "dueDate" | "createdAt" | "title";
type TaskOrder = "asc" | "desc";

interface Task {
  id: string;
  title: string;
  dueDate: string;
  dueTime: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiErrorPayload {
  success: false;
  error?: {
    message?: string;
  };
}

interface TaskFilters {
  status: TaskStatus;
  sortBy: TaskSortBy;
  order: TaskOrder;
}

interface AppState {
  tasks: Task[];
  filters: TaskFilters;
  editingTaskId: string | null;
}

const modal = document.getElementById("modal") as HTMLDivElement;
const addTaskButton = document.getElementById("newBookButton") as HTMLButtonElement;
const closeButton = document.querySelector(".close") as HTMLButtonElement;
const form = document.getElementById("bookForm") as HTMLFormElement;
const taskList = document.getElementById("bookshelf") as HTMLDivElement;
const emptyState = document.getElementById("emptyState") as HTMLDivElement;
const taskCount = document.getElementById("taskCount") as HTMLParagraphElement;
const errorBanner = document.getElementById("errorBanner") as HTMLDivElement;
const loadingState = document.getElementById("loadingState") as HTMLDivElement;
const statusFilter = document.getElementById("statusFilter") as HTMLSelectElement;
const sortBySelect = document.getElementById("sortBy") as HTMLSelectElement;
const sortOrderSelect = document.getElementById("sortOrder") as HTMLSelectElement;
const modalEyebrow = document.getElementById("modalEyebrow") as HTMLParagraphElement;
const modalTitle = document.getElementById("modalTitle") as HTMLHeadingElement;
const modalDescription = document.getElementById("modalDescription") as HTMLParagraphElement;
const submitButton = document.getElementById("submitButton") as HTMLButtonElement;
const titleInput = document.getElementById("title") as HTMLInputElement;
const dueDateInput = document.getElementById("author") as HTMLInputElement;
const dueTimeInput = document.getElementById("pages") as HTMLInputElement;

const state: AppState = {
  tasks: [],
  filters: {
    status: "all",
    sortBy: "dueDate",
    order: "asc",
  },
  editingTaskId: null,
};

addTaskButton.addEventListener("click", () => {
  openCreateModal();
});

closeButton.addEventListener("click", () => {
  closeModal();
});

window.addEventListener("click", (event: MouseEvent) => {
  if (event.target === modal) {
    closeModal();
  }
});

form.addEventListener("submit", async (event: SubmitEvent) => {
  event.preventDefault();
  await handleSaveTask();
});

statusFilter.addEventListener("change", async (event: Event) => {
  state.filters.status = (event.target as HTMLSelectElement).value as TaskStatus;
  await fetchTasks();
});

sortBySelect.addEventListener("change", async (event: Event) => {
  state.filters.sortBy = (event.target as HTMLSelectElement).value as TaskSortBy;
  await fetchTasks();
});

sortOrderSelect.addEventListener("change", async (event: Event) => {
  state.filters.order = (event.target as HTMLSelectElement).value as TaskOrder;
  await fetchTasks();
});

async function fetchTasks(): Promise<void> {
  setError("");
  setLoading(true);

  try {
    const params = new URLSearchParams({
      status: state.filters.status,
      sortBy: state.filters.sortBy,
      order: state.filters.order,
    });

    const payload = await apiRequest<Task[]>(`/api/tasks?${params.toString()}`);
    state.tasks = payload.data;
    renderTasks();
  } catch (error) {
    setError(getErrorMessage(error, "Unable to load tasks."));
  } finally {
    setLoading(false);
  }
}

async function handleSaveTask(): Promise<void> {
  const taskInput = {
    title: titleInput.value.trim(),
    dueDate: dueDateInput.value,
    dueTime: dueTimeInput.value,
  };

  try {
    setError("");

    if (state.editingTaskId) {
      await apiRequest<Task>(`/api/tasks/${state.editingTaskId}`, {
        method: "PATCH",
        body: JSON.stringify(taskInput),
      });
    } else {
      await apiRequest<Task>("/api/tasks", {
        method: "POST",
        body: JSON.stringify(taskInput),
      });
    }

    closeModal();
    await fetchTasks();
  } catch (error) {
    setError(getErrorMessage(error, "Unable to save task."));
  }
}

async function toggleTaskCompletion(task: Task): Promise<void> {
  try {
    setError("");

    await apiRequest<Task>(`/api/tasks/${task.id}/complete`, {
      method: "PATCH",
      body: JSON.stringify({ completed: !task.completed }),
    });

    await fetchTasks();
  } catch (error) {
    setError(getErrorMessage(error, "Unable to update task."));
  }
}

async function removeTask(taskId: string): Promise<void> {
  try {
    setError("");
    await apiRequest<{ message: string }>(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    await fetchTasks();
  } catch (error) {
    setError(getErrorMessage(error, "Unable to delete task."));
  }
}

function renderTasks(): void {
  taskList.innerHTML = "";
  taskCount.textContent = String(state.tasks.length);
  emptyState.classList.toggle("hidden", state.tasks.length > 0);

  state.tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className =
      "group rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-lg shadow-slate-950/30 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08]";

    const badgeClasses = task.completed
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    taskCard.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Task</p>
          <h3 class="mt-3 text-lg font-semibold text-white">${escapeHtml(task.title)}</h3>
        </div>
        <span class="rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] ${badgeClasses}">
          ${task.completed ? "Completed" : "Open"}
        </span>
      </div>
      <div class="mt-6 space-y-3 text-sm text-slate-300">
        <p class="flex items-center justify-between rounded-2xl bg-slate-900/50 px-4 py-3">
          <span class="text-slate-400">Date</span>
          <span class="font-medium text-slate-100">${formatDate(task.dueDate)}</span>
        </p>
        <p class="flex items-center justify-between rounded-2xl bg-slate-900/50 px-4 py-3">
          <span class="text-slate-400">Time</span>
          <span class="font-medium text-slate-100">${formatTime(task.dueTime)}</span>
        </p>
      </div>
      <div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button data-action="edit" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-amber-300/30 hover:bg-amber-400/10 hover:text-amber-100">
          Edit
        </button>
        <button data-action="toggle" class="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-100">
          ${task.completed ? "Mark Open" : "Mark Done"}
        </button>
      </div>
      <button data-action="delete" class="mt-3 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-100">
        Delete
      </button>
    `;

    const editButton = taskCard.querySelector('[data-action="edit"]') as HTMLButtonElement;
    const toggleButton = taskCard.querySelector('[data-action="toggle"]') as HTMLButtonElement;
    const deleteButton = taskCard.querySelector('[data-action="delete"]') as HTMLButtonElement;

    editButton.addEventListener("click", () => {
      openEditModal(task);
    });

    toggleButton.addEventListener("click", async () => {
      await toggleTaskCompletion(task);
    });

    deleteButton.addEventListener("click", async () => {
      await removeTask(task.id);
    });

    taskList.appendChild(taskCard);
  });
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<ApiSuccess<T>> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = (await response.json()) as ApiSuccess<T> | ApiErrorPayload;

  if (!response.ok) {
    const message =
      "error" in payload && payload.error?.message
        ? payload.error.message
        : "Request failed.";

    throw new Error(message);
  }

  return payload as ApiSuccess<T>;
}

function openCreateModal(): void {
  resetModal();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function openEditModal(task: Task): void {
  state.editingTaskId = task.id;
  modalEyebrow.textContent = "Update task";
  modalTitle.textContent = "Edit task";
  modalDescription.textContent = "Adjust the task details and save the changes.";
  submitButton.textContent = "Update Task";
  titleInput.value = task.title;
  dueDateInput.value = task.dueDate;
  dueTimeInput.value = task.dueTime;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeModal(): void {
  form.reset();
  resetModal();
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function resetModal(): void {
  state.editingTaskId = null;
  modalEyebrow.textContent = "Create task";
  modalTitle.textContent = "Add a new item";
  modalDescription.textContent =
    "Keep it short and specific so it is easy to finish later.";
  submitButton.textContent = "Save Task";
}

function setError(message: string): void {
  errorBanner.textContent = message;
  errorBanner.classList.toggle("hidden", message.length === 0);
}

function setLoading(isLoading: boolean): void {
  loadingState.classList.toggle("hidden", !isLoading);
}

function formatDate(dateString: string): string {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

void fetchTasks();
