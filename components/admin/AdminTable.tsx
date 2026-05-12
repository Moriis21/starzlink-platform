"use client";

import { Search, Plus, Download, Trash2, Edit2, ToggleRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface AdminTableProps<T extends { id: string }> {
  title: string;
  addHref: string;
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onToggle?: (id: string) => void;
  onExport?: () => void;
  total?: number;
}

export default function AdminTable<T extends { id: string }>({
  title, addHref, columns, data, loading, search, onSearchChange, onDelete, onEdit, onToggle, onExport, total
}: AdminTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-gray-50">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
          {total !== undefined && <p className="text-xs text-gray-500">{total} total records</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1a3c8f] w-52"
            />
          </div>
          {onExport && (
            <button onClick={onExport} className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm hover:border-[#1a3c8f] hover:text-[#1a3c8f] transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          )}
          <a href={addHref} className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a3c8f] text-white rounded-xl text-sm font-medium hover:bg-blue-900 transition-colors">
            <Plus className="w-4 h-4" /> Add New
          </a>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className={cn("text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap", col.width || "")}>
                  {col.label}
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i}>
                  {columns.map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}
                  <td className="px-4 py-3"><div className="h-4 bg-gray-100 rounded w-24 animate-pulse" /></td>
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map(col => (
                    <td key={String(col.key)} className="px-4 py-3 text-sm text-gray-700">
                      {col.render ? col.render(row) : String((row as any)[col.key] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(row.id)} className="p-1.5 text-gray-400 hover:text-[#1a3c8f] hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {onToggle && (
                        <button onClick={() => onToggle(row.id)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Toggle Status">
                          <ToggleRight className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => onDelete(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-16 text-center text-gray-400">
                  <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">No records found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
