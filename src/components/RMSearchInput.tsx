import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useStock } from "@/context/StockContext";

interface Props {
  value: string;
  onSelect: (rm: { name: string; nameHi: string; category: string; part: string; uom: string; code: string; botanical: string }) => void;
  placeholder?: string;
}

const RMSearchInput = ({ value, onSelect, placeholder }: Props) => {
  const { rmData } = useStock();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const matches = rmData
    .filter((r) => r.active)
    .filter((r) =>
      !q ||
      r.name.toLowerCase().includes(q) ||
      r.botanical.toLowerCase().includes(q) ||
      r.code.toLowerCase().includes(q)
    )
    .slice(0, 20);

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          className="form-field-input pl-6 pr-5 w-full"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          placeholder={placeholder || "Search RM master..."}
        />
        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
      {open && (
        <div className="absolute z-[9999] mt-1 left-0 min-w-full w-[420px] max-w-[90vw] max-h-64 overflow-y-auto overscroll-contain rounded-md border border-border bg-popover shadow-lg">
          {matches.length === 0 ? (
            <div className="px-3 py-2 text-[11px] text-muted-foreground">
              No match in RM master. Add it first in RM Master.
            </div>
          ) : (
            matches.map((r) => (
              <button
                key={r.code}
                type="button"
                onClick={() => {
                  onSelect({ name: r.name, nameHi: r.nameHi || "", category: r.category.toLowerCase(), part: r.part, uom: r.uom, code: r.code, botanical: r.botanical });
                  setQuery(r.name);
                  setOpen(false);
                }}
                className="w-full text-left px-2.5 py-1.5 hover:bg-accent border-b border-border last:border-b-0"
              >
                <div className="text-xs font-medium">{r.name}</div>
                <div className="text-[10px] text-muted-foreground italic">
                  {r.botanical} • {r.code} • {r.category} • {r.part}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RMSearchInput;
