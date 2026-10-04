import type { Task } from "./types";
interface Props {
  task: Task; disabled: boolean;
  onEdit: () => void; onToggle: () => void; onDelete: () => void;
}
const buttonClass = "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-100 transition";
export default function TaskCard({ task, disabled, onEdit, onToggle, onDelete }: Props) {
  const date = new Date(`${task.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const [hours, minutes] = task.dueTime.split(":").map(Number);
  const time = new Date();
  time.setHours(hours, minutes, 0, 0);
  return <article aria-label={task.title} className="group rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-lg shadow-slate-950/30 backdrop-blur-xl transition duration-200 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08]">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Task</p>
        <h3 className="mt-3 text-lg font-semibold text-white break-words">{task.title}</h3>
      </div>
      <span className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] ${task.completed ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"}`}>
        {task.completed ? "Completed" : "Open"}
      </span>
    </div>
    <div className="mt-6 space-y-3 text-sm text-slate-300">
      <p className="flex items-center justify-between rounded-2xl bg-slate-900/50 px-4 py-3"><span className="text-slate-400">Date</span><span className="font-medium text-slate-100">{date}</span></p>
      <p className="flex items-center justify-between rounded-2xl bg-slate-900/50 px-4 py-3"><span className="text-slate-400">Time</span><span className="font-medium text-slate-100">{time.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></p>
    </div>
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button type="button" disabled={disabled} onClick={onEdit} className={`${buttonClass} hover:border-amber-300/30 hover:bg-amber-400/10 hover:text-amber-100`}>Edit</button>
      <button type="button" disabled={disabled} onClick={onToggle} className={`${buttonClass} hover:border-cyan-300/30 hover:bg-cyan-400/10 hover:text-cyan-100`}>{task.completed ? "Mark Open" : "Mark Done"}</button>
    </div>
    <button type="button" disabled={disabled} onClick={onDelete} className={`mt-3 w-full ${buttonClass} hover:border-rose-300/30 hover:bg-rose-400/10 hover:text-rose-100`}>Delete</button>
  </article>;
}
