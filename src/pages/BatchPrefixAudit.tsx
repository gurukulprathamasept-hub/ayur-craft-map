import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, RefreshCw, Wand2, ArrowLeft } from "lucide-react";
import { useFormulations } from "@/context/FormulationContext";
import { derivePrefix, resolveUniquePrefix } from "@/lib/batchPrefix";
import { toast } from "sonner";

const BatchPrefixAudit = () => {
  const navigate = useNavigate();
  const { formulations, updateFormulation } = useFormulations();

  // Group formulations by current prefix to detect collisions.
  const { rows, collisionGroups, collisionCount, missingCount } = useMemo(() => {
    const byPrefix: Record<string, string[]> = {};
    formulations.forEach((f) => {
      const p = (f.batchPrefix || "").toUpperCase();
      if (!p) return;
      (byPrefix[p] ||= []).push(f.id);
    });
    const collidingIds = new Set<string>();
    Object.values(byPrefix).forEach((ids) => {
      if (ids.length > 1) ids.forEach((id) => collidingIds.add(id));
    });

    const rows = formulations.map((f) => {
      const prefix = (f.batchPrefix || "").toUpperCase();
      const colliding = prefix ? collidingIds.has(f.id) : false;
      const missing = !prefix;
      return { f, prefix, colliding, missing };
    });

    const collisionGroups = Object.entries(byPrefix)
      .filter(([, ids]) => ids.length > 1)
      .map(([prefix, ids]) => ({ prefix, ids }));

    return {
      rows,
      collisionGroups,
      collisionCount: collidingIds.size,
      missingCount: rows.filter((r) => r.missing).length,
    };
  }, [formulations]);

  /** Build a "used prefixes" set excluding a given id. */
  const usedExcluding = (excludeId: string) =>
    formulations
      .filter((f) => f.id !== excludeId && !!f.batchPrefix)
      .map((f) => f.batchPrefix!.toUpperCase());

  const reResolve = (id: string) => {
    const f = formulations.find((x) => x.id === id);
    if (!f) return;
    const base = derivePrefix(f.name, f.code);
    const resolved = resolveUniquePrefix(base, usedExcluding(id));
    if (resolved === f.batchPrefix) {
      toast.info(`"${f.name}" already has a unique prefix (${resolved})`);
      return;
    }
    updateFormulation(id, { ...f, batchPrefix: resolved });
    toast.success(`"${f.name}" → ${resolved}`);
  };

  const reResolveAll = () => {
    // Walk in stable order; keep first occurrence, re-resolve the rest.
    let used: string[] = [];
    let changed = 0;
    formulations.forEach((f) => {
      const current = (f.batchPrefix || "").toUpperCase();
      const collides = current && used.includes(current);
      if (current && !collides) {
        used.push(current);
        return;
      }
      const base = derivePrefix(f.name, f.code);
      const resolved = resolveUniquePrefix(base, used);
      if (resolved !== current) {
        updateFormulation(f.id, { ...f, batchPrefix: resolved });
        changed++;
      }
      used.push(resolved);
    });
    toast.success(changed === 0 ? "No collisions to resolve" : `Re-resolved ${changed} prefix${changed === 1 ? "" : "es"}`);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <button
          onClick={() => navigate("/mfr-table")}
          className="px-2 py-1.5 rounded-md border border-border text-xs font-medium hover:bg-secondary transition-all flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="flex-1">
          <div className="text-[15px] font-medium">Batch prefix audit</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            Review every formulation's batch number prefix and resolve any collisions.
          </div>
        </div>
        <button
          onClick={reResolveAll}
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5"
        >
          <Wand2 className="w-3 h-3" /> Re-resolve all
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 px-5 pt-4">
        <div className="app-card p-3.5">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Formulations</div>
          <div className="text-2xl font-medium mt-1">{formulations.length}</div>
        </div>
        <div className={`app-card p-3.5 ${collisionCount > 0 ? "border-destructive/40" : ""}`}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">In collision</div>
          <div className={`text-2xl font-medium mt-1 ${collisionCount > 0 ? "text-destructive" : ""}`}>
            {collisionCount}
          </div>
        </div>
        <div className={`app-card p-3.5 ${missingCount > 0 ? "border-amber-500/40" : ""}`}>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Missing prefix</div>
          <div className={`text-2xl font-medium mt-1 ${missingCount > 0 ? "text-amber-600" : ""}`}>
            {missingCount}
          </div>
        </div>
      </div>

      {/* Collision groups */}
      {collisionGroups.length > 0 && (
        <div className="px-5 pt-4">
          <div className="app-card border-destructive/40">
            <div className="app-card-head">
              <div className="app-card-title flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                Collisions detected
              </div>
            </div>
            <div className="p-3.5 space-y-2">
              {collisionGroups.map((g) => (
                <div key={g.prefix} className="text-xs">
                  <span className="font-mono font-medium px-1.5 py-0.5 bg-destructive/10 text-destructive rounded">
                    {g.prefix}
                  </span>{" "}
                  used by{" "}
                  {g.ids
                    .map((id) => formulations.find((f) => f.id === id)?.name || id)
                    .join(", ")}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="app-card">
          <div className="app-card-head">
            <div className="app-card-title">All formulations</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="text-left font-medium px-3.5 py-2">Formulation</th>
                  <th className="text-left font-medium px-3.5 py-2">MFR code</th>
                  <th className="text-left font-medium px-3.5 py-2">Batch prefix</th>
                  <th className="text-left font-medium px-3.5 py-2">Suggested</th>
                  <th className="text-left font-medium px-3.5 py-2">Status</th>
                  <th className="text-right font-medium px-3.5 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3.5 py-6 text-center text-muted-foreground">
                      No formulations yet.
                    </td>
                  </tr>
                )}
                {rows.map(({ f, prefix, colliding, missing }) => {
                  const suggested = resolveUniquePrefix(
                    derivePrefix(f.name, f.code),
                    usedExcluding(f.id)
                  );
                  const needsChange = colliding || missing || suggested !== prefix;
                  return (
                    <tr key={f.id} className="border-b border-border last:border-b-0 hover:bg-secondary/40">
                      <td className="px-3.5 py-2">
                        <div className="font-medium">{f.name || <span className="text-muted-foreground">(unnamed)</span>}</div>
                        {f.sanskrit && <div className="text-[10px] text-muted-foreground">{f.sanskrit}</div>}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-[11px]">
                        {f.code || <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-3.5 py-2">
                        {prefix ? (
                          <span
                            className={`font-mono font-medium px-1.5 py-0.5 rounded ${
                              colliding
                                ? "bg-destructive/10 text-destructive"
                                : "bg-secondary"
                            }`}
                          >
                            {prefix}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3.5 py-2 font-mono text-[11px]">
                        <span
                          className={
                            suggested !== prefix ? "text-primary font-medium" : "text-muted-foreground"
                          }
                        >
                          {suggested}
                        </span>
                      </td>
                      <td className="px-3.5 py-2">
                        {colliding ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                            <AlertTriangle className="w-3 h-3" /> Collision
                          </span>
                        ) : missing ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700">
                            <AlertTriangle className="w-3 h-3" /> Missing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            <CheckCircle2 className="w-3 h-3" /> OK
                          </span>
                        )}
                      </td>
                      <td className="px-3.5 py-2 text-right">
                        <button
                          onClick={() => reResolve(f.id)}
                          disabled={!needsChange}
                          className="px-2 py-1 rounded-md border border-border text-[11px] font-medium hover:bg-secondary transition-all disabled:opacity-40 inline-flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-resolve
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default BatchPrefixAudit;
