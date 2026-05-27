import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  delta?: { value: string; trend: "up" | "down" | "neutral" };
  subtext?: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, delta, subtext, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border-dim shadow-sm flex flex-col justify-between transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <h3 className="text-2xl font-bold mt-2 text-main-text">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Icon size={20} />
        </div>
      </div>
      {(delta || subtext) && (
        <div className="mt-4 flex items-center text-sm">
          {delta && (
            <span 
              className={clsx(
                "font-bold",
                delta.trend === "up" ? "text-green-600 dark:text-green-400" : delta.trend === "down" ? "text-red-600 dark:text-red-400" : "text-muted"
              )}
            >
              {delta.trend === "up" ? "↑ " : delta.trend === "down" ? "↓ " : ""}{delta.value}
            </span>
          )}
          {subtext && (
            <span className={clsx("text-muted", delta && "ml-2 font-medium")}>
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
