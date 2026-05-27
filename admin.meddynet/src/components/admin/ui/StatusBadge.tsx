import { clsx } from "clsx";

type StatusType = "success" | "warning" | "error" | "info" | "neutral";

const statusStyles: Record<StatusType, string> = {
  success: "bg-green-100/80 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
  warning: "bg-amber-100/80 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  error: "bg-red-100/80 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  info: "bg-blue-100/80 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  neutral: "bg-gray-100/80 text-gray-700 border-gray-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20",
};

export function StatusBadge({ status, label, pulse = false }: { status: StatusType; label: string; pulse?: boolean }) {
  return (
    <span className={clsx(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap",
      statusStyles[status]
    )}>
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={clsx("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", statusStyles[status].split(" ")[1].replace("text-", "bg-"))}></span>
          <span className={clsx("relative inline-flex rounded-full h-2 w-2", statusStyles[status].split(" ")[1].replace("text-", "bg-"))}></span>
        </span>
      )}
      {label}
    </span>
  );
}
