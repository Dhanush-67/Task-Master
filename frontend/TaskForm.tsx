import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Task, TaskInput } from "./types";
interface Props { task: Task | null; onClose: () => void; onSave: (input: TaskInput) => Promise<void>; }
const inputClass = "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:bg-white/10";
export default function TaskForm({ task, onClose, onSave }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [input, setInput] = useState<TaskInput>({ title: task?.title ?? "", dueDate: task?.dueDate ?? "", dueTime: task?.dueTime ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const element = dialog.current!;
    element.showModal();
    return () => element.close();
  }, []);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try { await onSave({ ...input, title: input.title.trim() }); }
    catch (error) { setError(error instanceof Error ? error.message : "Unable to save task."); }
    finally { setSaving(false); }
  }
  return <dialog ref={dialog} aria-labelledby="modal-title" aria-describedby="modal-description"
    onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}
    onClick={(event) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
      if (event.target === event.currentTarget && outside && !saving) onClose();
    }}
    className="w-[calc(100%_-_2rem)] max-w-md overflow-visible rounded-[1.75rem] border border-white/15 bg-slate-900 p-6 text-slate-100 shadow-2xl shadow-cyan-950/40">
    <button type="button" aria-label="Close modal" disabled={saving} onClick={onClose} className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-slate-300 hover:bg-white/10">&times;</button>
    <div className="pr-12">
      <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">{task ? "Update task" : "Create task"}</p>
      <h2 id="modal-title" className="mt-3 text-2xl font-semibold text-white">{task ? "Edit task" : "Add a new item"}</h2>
      <p id="modal-description" className="mt-2 text-sm leading-6 text-slate-400">{task ? "Adjust the task details and save the changes." : "Keep it short and specific so it is easy to finish later."}</p>
    </div>
    {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-400/10 p-3 text-sm text-rose-100">{error}</p>}
    <form onSubmit={submit} className="mt-8 space-y-5">
      <fieldset disabled={saving} className="space-y-5">
        <label className="block"><span className="mb-2 block text-sm font-medium text-slate-200">Title</span>
          <input autoFocus className={inputClass} type="text" name="title" placeholder="Take out the trash" required value={input.title} onChange={(event) => setInput({ ...input, title: event.target.value })} />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-200">Date</span>
            <input className={inputClass} type="date" name="dueDate" required value={input.dueDate} onChange={(event) => setInput({ ...input, dueDate: event.target.value })} />
          </label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-slate-200">Time</span>
            <input className={inputClass} type="time" name="dueTime" required value={input.dueTime} onChange={(event) => setInput({ ...input, dueTime: event.target.value })} />
          </label>
        </div>
        <button type="submit" className="w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-400 to-fuchsia-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:shadow-lg hover:shadow-cyan-500/20">{saving ? "Saving..." : task ? "Update Task" : "Save Task"}</button>
      </fieldset>
    </form>
  </dialog>;
}
