import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import { useStock } from "@/context/StockContext";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";

interface Props {
  value: string;
  onSelect: (rm: { name: string; nameHi: string; category: string; part: string; uom: string; code: string; botanical: string }) => void;
  placeholder?: string;
}

const RMSearchInput = ({ value, onSelect, placeholder }: Props) => {
  const { rmData } = useStock();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setQuery(value), [value]);

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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            className="form-field-input pl-6 pr-5 w-full"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            placeholder={placeholder || "Search RM master..."}
          />
          <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 w-[420px] max-w-[90vw] max-h-64 overflow-y-auto overscroll-contain"
      >
        {matches.length === 0 ? (
          <div className="px-3 py-2 text-[11px] text-muted-foreground">
            No match in RM master. Add it first in RM Master.
          </div>
        ) : (
          matches.map((r) => (
            <button
              key={r.code}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect({ name: r.name, nameHi: r.nameHi || "", category: r.category.toLowerCase(), part: r.part, uom: r.uom, code: r.code, botanical: r.botanical });
                setQuery(r.name);
                setOpen(false);
              }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-accent border-b border-border last:border-b-0"
            >
              <div className="text-xs font-medium">
                {r.name}
                {r.nameHi && <span className="text-muted-foreground font-normal ml-1">/ {r.nameHi}</span>}
              </div>
              <div className="text-[10px] text-muted-foreground italic">
                {r.botanical} • {r.code} • {r.category} • {r.part}
              </div>
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
};

export default RMSearchInput;
