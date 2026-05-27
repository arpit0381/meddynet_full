"use client";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export function Breadcrumbs() {
  const pathname = usePathname();
  if (pathname === "/admin/overview") return null;

  const paths = pathname.split("/").filter(p => p && p !== "admin");

  return (
    <nav className="flex items-center gap-2 mb-6">
      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors">
        <Home size={14} />
        <a href="/admin/overview" className="text-[10px] font-black uppercase tracking-widest">Portal</a>
      </div>
      
      {paths.map((path, i) => {
        const fullPath = `/admin/${paths.slice(0, i + 1).join("/")}`;
        const isLast = i === paths.length - 1;
        const formattedPath = path.replace(/-/g, " ");

        return (
          <div key={path} className="flex items-center gap-2">
            <ChevronRight size={12} className="text-gray-300 dark:text-gray-600" />
            {isLast ? (
              <div className="flex items-center gap-2 bg-primary/5 border border-primary/10 dark:bg-primary/10 dark:border-primary/20 px-3 py-1 rounded-lg">
                 <div className="w-1 h-1 rounded-full bg-primary shadow-glow" />
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">{formattedPath}</span>
              </div>
            ) : (
              <a 
                href={fullPath} 
                className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
              >
                {formattedPath}
              </a>
            )}
          </div>
        );
      })}
    </nav>
  );
}
