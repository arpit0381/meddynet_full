"use client";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
}

export function DataTable<T extends { id: string | number }>({ 
  data, 
  columns, 
  onRowClick, 
  searchable,
  selectedIds,
  onSelectionChange
}: DataTableProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // URL-derived state
  const query = searchParams.get("search") || "";
  const pageParam = parseInt(searchParams.get("page") || "1");

  const [searchTerm, setSearchTerm] = useState(query);
  const itemsPerPage = 25;

  // Sync internal search state with URL when URL changes (e.g. browser back)
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // Debounced search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.set("page", "1"); // Reset to page 1 on search
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, pathname, router, searchParams]); 

  const filteredData = useMemo(() => {
    if (!query) return data;
    const lowerQuery = query.toLowerCase();
    return data.filter((row) => {
      return columns.some((col) => {
        const value = typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor as keyof T];
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }, [data, query, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const currentPage = Math.min(pageParam, totalPages);
  
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      onSelectionChange(paginatedData.map(row => row.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectionChange || !selectedIds) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const isAllSelected = paginatedData.length > 0 && selectedIds?.length === paginatedData.length;

  return (
    <div className="bg-card border border-border-dim rounded-xl overflow-hidden flex flex-col transition-colors">
      {searchable && (
        <div className="p-4 border-b border-border-dim flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Filter specific results..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-input border border-border-dim rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 text-main-text transition-colors"
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-slate-900/40 border-b border-border-dim">
              <th className="p-4 w-12 text-center text-xs font-medium text-muted uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="rounded border-border-dim bg-input text-primary focus:ring-primary cursor-pointer"
                />
              </th>
              {columns.map((col, idx) => (
                <th key={idx} className={`p-4 text-xs font-semibold text-muted uppercase tracking-wider ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-dim/50">
            {paginatedData.length > 0 ? paginatedData.map((row) => (
              <tr 
                key={row.id} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`group hover:bg-gray-50/80 dark:hover:bg-slate-800/40 transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
              >
                <td className="p-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds?.includes(row.id) || false}
                    onChange={() => handleSelectRow(row.id)}
                    className="rounded border-border-dim bg-input text-primary focus:ring-primary cursor-pointer" 
                    onClick={(e) => e.stopPropagation()} 
                  />
                </td>
                {columns.map((col, idx) => (
                  <td key={idx} className={`p-4 text-sm text-main-text/90 dark:text-slate-300 ${col.className || ""}`}>
                    {typeof col.accessor === "function" ? col.accessor(row) : (row[col.accessor as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-8 text-center text-muted">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {filteredData.length > 0 && (
        <div className="p-4 border-t border-border-dim flex items-center justify-between bg-card shrink-0 transition-colors">
          <p className="text-sm text-muted">
            Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> of <span className="font-medium">{filteredData.length}</span> results
          </p>
          <div className="flex gap-2 text-sm font-medium">
            <button 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-3 py-1.5 border border-border-dim rounded-lg text-muted disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-3 py-1.5 border border-border-dim rounded-lg text-muted disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-1 transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
