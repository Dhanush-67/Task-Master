import { useEffect, useState } from "react";
import { tasksApi } from "./api";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import type { Task, TaskFilters, TaskInput } from "./types";
export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filters, setFilters] = useState<TaskFilters>({ status: "all", sortBy: "dueDate", order: "asc" });
  const [editor, setEditor] = useState<{ task: Task | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    tasksApi.list(filters, controller.signal)
      .then((data) => { if (!controller.signal.aborted) setTasks(data); })
      .catch((error: unknown) => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : "Unable to load tasks."); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [filters, revision]);
  async function mutate(operation: () => Promise<unknown>) {
    setPending(true);
    setError("");
    try {
      await operation();
      setRevision((value) => value + 1);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to update task.");
    } finally { setPending(false); }
  }
  async function save(input: TaskInput) {
    await tasksApi.save(input, editor?.task?.id);
    setEditor(null);
    setRevision((value) => value + 1);
  }
  return <>
    <main
      className="relative isolate min-h-screen overflow-hidden px-4 py-10 sm:px-6"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(244,114,182,0.14),_transparent_28%),linear-gradient(135deg,_#020617,_#0f172a_55%,_#111827)]"
      ></div>
      <div
        className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl"
      ></div>

      <header className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
          <div className="flex justify-center">
            <h1
              className="text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              Task Master
            </h1>
          </div>
        </div>

        <div className="flex w-full justify-between items-center gap-4">
          <div className="flex justify-start">
            <button
              onClick={() => setEditor({ task: null })} disabled={pending}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-5 py-3 text-sm font-semibold text-slate-950 transition duration-200 hover:scale-[1.01] hover:shadow-lg hover:shadow-cyan-500/25"
              type="button"
            >
              Add New Task
            </button>
          </div>

          <article
            className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl lg:min-w-40"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
              Live tasks
            </p>
            <p id="taskCount" aria-live="polite" className="mt-3 text-3xl font-semibold text-white">
              {tasks.length}
            </p>
          </article>
        </div>
      </header>

      <section
        className="relative mx-auto mt-6 w-full max-w-6xl rounded-[2rem] border border-white/10 bg-white/8 p-5 shadow-glow backdrop-blur-2xl sm:p-8"
      >
        <div
          className="rounded-[1.75rem] border border-white/10 bg-slate-950/35 p-4 backdrop-blur-xl sm:p-6"
        >
          <div className="border-b border-white/10 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Your to-do list</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Manage tasks with server-backed storage, filters, and sorting.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                    Status
                  </span>
                  <select
                    id="statusFilter" value={filters.status} disabled={pending} onChange={(event) => setFilters({ ...filters, status: event.target.value as TaskFilters["status"] })}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/10"
                  >
                    <option value="all">All</option>
                    <option value="open">Open</option>
                    <option value="completed">Completed</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                    Sort By
                  </span>
                  <select
                    id="sortBy" value={filters.sortBy} disabled={pending} onChange={(event) => setFilters({ ...filters, sortBy: event.target.value as TaskFilters["sortBy"] })}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/10"
                  >
                    <option value="dueDate">Due date</option>
                    <option value="createdAt">Created</option>
                    <option value="title">Title</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
                    Order
                  </span>
                  <select
                    id="sortOrder" value={filters.order} disabled={pending} onChange={(event) => setFilters({ ...filters, order: event.target.value as TaskFilters["order"] })}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/60 focus:bg-white/10"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          {error && <div role="alert" className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div>}
          {loading && <div role="status" className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-10 text-center text-sm text-slate-300">Loading tasks...</div>}
          {!loading && !error && tasks.length === 0 && <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.04] px-6 py-16 text-center">
            <p className="text-lg font-medium text-slate-200">No tasks yet</p>
            <p className="mt-2 text-sm text-slate-400">Add your first task to bring this board to life.</p>
          </div>}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => <TaskCard key={task.id} task={task} disabled={pending || loading}
              onEdit={() => setEditor({ task })}
              onToggle={() => void mutate(() => tasksApi.complete(task))}
              onDelete={() => void mutate(() => tasksApi.remove(task.id))} />)}
          </div>
        </div>
      </section>
    </main>

    {editor && <TaskForm task={editor.task} onClose={() => setEditor(null)} onSave={save} />}
  </>;
}
