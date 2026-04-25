const modal = document.getElementById("modal");
const btn = document.getElementById("newBookButton");
const closeBtn = document.querySelector(".close");
const form = document.getElementById("bookForm");
const taskList = document.getElementById("bookshelf");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");
const errorBanner = document.getElementById("errorBanner");
const loadingState = document.getElementById("loadingState");
const statusFilter = document.getElementById("statusFilter");
const sortBySelect = document.getElementById("sortBy");
const sortOrderSelect = document.getElementById("sortOrder");
const modalEyebrow = document.getElementById("modalEyebrow");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const submitButton = document.getElementById("submitButton");

const state = {
  tasks: [],
  filters: {
    status: "all",
    sortBy: "dueDate",
    order: "asc",
  },
  editingTaskId: null,
};

async function fetchTasks() {
  setError("");
  setLoading(true);

  const params = new URLSearchParams(state.filters);

  try {
    const response = await fetch(`/api/tasks?${params.toString()}`);
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error?.message || "Unable to load tasks.");
    }

    state.tasks = payload.data;
    renderTasks();
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}

async function createTask(task) {
  const response = await fetch("/api/tasks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || "Unable to create task.");
  }

  return payload.data;
}

async function updateTask(id, task) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || "Unable to update task.");
  }

  return payload.data;
}

async function completeTask(id, completed = true) {
  const response = await fetch(`/api/tasks/${id}/complete`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || "Unable to update task.");
  }

  return payload.data;
}

async function deleteTask(id) {
  const response = await fetch(`/api/tasks/${id}`, {
    method: "DELETE",
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error?.message || "Unable to delete task.");
  }

  return payload.data;
}

btn.addEventListener("click", function () {
  openCreateModal();
});

closeBtn.addEventListener("click", function () {
  closeModal();
});

window.addEventListener("click", function (event) {
  if (event.target == modal) {
    closeModal();
  }
});

form.addEventListener("submit", function (event) {
  event.preventDefault();
  handleCreateTask();
});

statusFilter.addEventListener("change", function (event) {
  state.filters.status = event.target.value;
  fetchTasks();
});

sortBySelect.addEventListener("change", function (event) {
  state.filters.sortBy = event.target.value;
  fetchTasks();
});

sortOrderSelect.addEventListener("change", function (event) {
  state.filters.order = event.target.value;
  fetchTasks();
});

function closeModal() {
  form.reset();
  resetModal();
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

async function handleCreateTask() {
  const title = document.getElementById("title").value.trim();
  const dueDate = document.getElementById("author").value;
  const dueTime = document.getElementById("pages").value;

  try {
    setError("");
    if (state.editingTaskId) {
      await updateTask(state.editingTaskId, { title, dueDate, dueTime });
    } else {
      await createTask({ title, dueDate, dueTime });
    }

    closeModal();
    await fetchTasks();
  } catch (error) {
    setError(error.message);
  }
}

function renderTasks() {
  taskList.innerHTML = "";
  taskCount.textContent = state.tasks.length;
  emptyState.classList.toggle("hidden", state.tasks.length > 0);

  for (const task of state.tasks) {
    const taskDiv = document.createElement("div");
    const statusClasses = task.completed
      ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200"
      : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    taskDiv.className =
      "group rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-lg shadow-slate-950/30 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08]";
    taskDiv.setAttribute("data-id", task.id);
    taskDiv.innerHTML = `
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Task</p>
          <h3 class="mt-3 text-lg font-semibold text-white">${escapeHtml(task.title)}</h3>
        </div>
        <span class="rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] ${statusClasses}">
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
        <button class="editButton w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-amber-300/30 hover:bg-amber-400/10 hover:text-amber-100">
          Edit
        </button>
      </div>

      <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button class="completeButton w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-100">
          ${task.completed ? "Mark Open" : "Mark Done"}
        </button>
        <button class="deleteButton w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-100">
          Delete
        </button>
      </div>
    `;

    taskList.appendChild(taskDiv);
  }

  bindTaskActions();
}

function bindTaskActions() {
  const deleteButtons = document.getElementsByClassName("deleteButton");
  for (let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener("click", async function () {
      const taskCard = this.closest("[data-id]");
      const taskId = taskCard.getAttribute("data-id");

      try {
        setError("");
        await deleteTask(taskId);
        await fetchTasks();
      } catch (error) {
        setError(error.message);
      }
    });
  }

  const completeButtons = document.getElementsByClassName("completeButton");
  for (let i = 0; i < completeButtons.length; i++) {
    completeButtons[i].addEventListener("click", async function () {
      const taskCard = this.closest("[data-id]");
      const taskId = taskCard.getAttribute("data-id");
      const task = state.tasks.find((item) => item.id === taskId);

      if (!task) {
        return;
      }

      try {
        setError("");
        await completeTask(taskId, !task.completed);
        await fetchTasks();
      } catch (error) {
        setError(error.message);
      }
    });
  }

  const editButtons = document.getElementsByClassName("editButton");
  for (let i = 0; i < editButtons.length; i++) {
    editButtons[i].addEventListener("click", function () {
      const taskCard = this.closest("[data-id]");
      const taskId = taskCard.getAttribute("data-id");
      const task = state.tasks.find((item) => item.id === taskId);

      if (!task) {
        return;
      }

      openEditModal(task);
    });
  }
}

function setError(message) {
  errorBanner.textContent = message;
  errorBanner.classList.toggle("hidden", !message);
}

function setLoading(isLoading) {
  loadingState.classList.toggle("hidden", !isLoading);
}

function formatDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function openCreateModal() {
  resetModal();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function openEditModal(task) {
  state.editingTaskId = task.id;
  modalEyebrow.textContent = "Update task";
  modalTitle.textContent = "Edit task";
  modalDescription.textContent = "Adjust the task details and save the changes.";
  submitButton.textContent = "Update Task";
  document.getElementById("title").value = task.title;
  document.getElementById("author").value = task.dueDate;
  document.getElementById("pages").value = task.dueTime;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function resetModal() {
  state.editingTaskId = null;
  modalEyebrow.textContent = "Create task";
  modalTitle.textContent = "Add a new item";
  modalDescription.textContent =
    "Keep it short and specific so it is easy to finish later.";
  submitButton.textContent = "Save Task";
}

fetchTasks();
