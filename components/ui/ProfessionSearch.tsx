"use client";
import { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { PROFESSION_CATEGORIES, searchProfessions } from "@/lib/profession-data";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export default function ProfessionSearch({ value, onChange, error, required }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = query.trim() ? searchProfessions(query) : [];
  const displayCategories = activeCategory
    ? PROFESSION_CATEGORIES.filter(c => c.category === activeCategory)
    : PROFESSION_CATEGORIES;

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const select = (profession: string) => {
    onChange(profession);
    setOpen(false);
    setQuery("");
    setActiveCategory(null);
  };

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "w-full flex items-center justify-between border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1a3c8f] bg-white transition-colors text-left",
          error ? "border-red-400" : "border-gray-200",
          open && "border-[#1a3c8f] ring-1 ring-[#1a3c8f]/20"
        )}
      >
        <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
          {value || "Select your profession"}
        </span>
        {value ? (
          <button type="button" onClick={e => { e.stopPropagation(); onChange(""); }}
            className="p-0.5 hover:bg-gray-100 rounded text-gray-400">
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", open && "rotate-180")} />
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          style={{ maxHeight: "70vh" }}>

          {/* Search input */}
          <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                value={query}
                onChange={e => { setQuery(e.target.value); setActiveCategory(null); }}
                placeholder="Search professions..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#1a3c8f] bg-gray-50"
              />
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "calc(70vh - 70px)" }}>
            {/* Search results */}
            {query.trim() && suggestions.length > 0 && (
              <div className="p-2">
                <p className="text-xs text-gray-400 font-semibold px-2 mb-1">Results for "{query}"</p>
                {suggestions.map(p => (
                  <button key={p} type="button" onClick={() => select(p)}
                    className={cn("w-full text-left px-3 py-2.5 rounded-xl text-sm hover:bg-blue-50 hover:text-[#1a3c8f] transition-colors",
                      value === p && "bg-blue-50 text-[#1a3c8f] font-semibold"
                    )}>
                    {p}
                  </button>
                ))}
              </div>
            )}
            {query.trim() && suggestions.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">No results. Browse categories below.</div>
            )}

            {/* Category filter pills */}
            {!query.trim() && (
              <div className="px-3 pt-2 pb-1 flex gap-1.5 flex-wrap border-b border-gray-50">
                <button type="button" onClick={() => setActiveCategory(null)}
                  className={cn("px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                    !activeCategory ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}>
                  All
                </button>
                {PROFESSION_CATEGORIES.map(c => (
                  <button key={c.category} type="button" onClick={() => setActiveCategory(c.category)}
                    className={cn("px-3 py-1 rounded-full text-xs font-semibold transition-colors",
                      activeCategory === c.category ? "bg-[#1a3c8f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    )}>
                    {c.category}
                  </button>
                ))}
              </div>
            )}

            {/* Category profession lists */}
            {!query.trim() && displayCategories.map(cat => (
              <div key={cat.category} className="px-2 py-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide px-2 mb-1">{cat.category}</p>
                {cat.professions.map(p => (
                  <button key={p} type="button" onClick={() => select(p)}
                    className={cn("w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-blue-50 hover:text-[#1a3c8f] transition-colors break-words",
                      value === p && "bg-blue-50 text-[#1a3c8f] font-semibold"
                    )}>
                    {p}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
