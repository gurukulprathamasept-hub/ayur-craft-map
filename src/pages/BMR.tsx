import { useNavigate } from "react-router-dom";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { useBMRs } from "@/context/BMRContext";

const STATUS_BADGE: Record<string, string> = {
  "Draft": "app-badge-gray",
  "In process": "app-badge-blue",
  "QC pending": "app-badge-amber",
  "Released": "app-badge-green",
  "Rejected": "app-badge-red",
};

const BMR = () => {
  const navigate = useNavigate();
  const { bmrs } = useBMRs();

  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-3 border-b border-border shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-medium">Batch Manufacturing Records</div>
          <div className="text-[11px] text-muted-foreground mt-px">
            {bmrs.length} BMR{bmrs.length !== 1 ? "s" : ""} created
          </div>
        </div>
        <button
          onClick={() => navigate("/bmr-create")}
          className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> New BMR
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {bmrs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-5">
            <FileText className="w-12 h-12 text-muted-foreground opacity-30 mb-3" />
            <div className="text-sm font-medium text-muted-foreground mb-1">No BMRs yet</div>
            <div className="text-xs text-muted-foreground mb-4">
              Create a BMR from an existing formulation (MFR) to start tracking production batches.
            </div>
            <button
              onClick={() => navigate("/bmr-create")}
              className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create first BMR
            </button>
          </div>
        ) : (
          <div className="app-card mx-5 my-4">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Batch no.</th>
                  <th>Product</th>
                  <th>MFR</th>
                  <th>Batch size</th>
                  <th>Start date</th>
                  <th>Status</th>
                  <th>Yield</th>
                  <th style={{ width: 28 }}></th>
                </tr>
              </thead>
              <tbody>
                {bmrs.map((bmr) => {
                  const yieldPct = bmr.theoreticalYield > 0 && bmr.actualYield > 0
                    ? ((bmr.actualYield / bmr.theoreticalYield) * 100).toFixed(1)
                    : "—";
                  const completedSteps = bmr.steps.filter((s) => s.status === "done").length;

                  return (
                    <tr
                      key={bmr.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/bmr/${bmr.id}`)}
                    >
                      <td>
                        <div className="font-medium">{bmr.batchNo}</div>
                        <div className="text-[10px] text-muted-foreground">{bmr.createdAt}</div>
                      </td>
                      <td className="font-medium">{bmr.productName}</td>
                      <td className="text-[11px] text-muted-foreground">{bmr.mfrName}</td>
                      <td>{bmr.batchSize} {bmr.batchUnit}</td>
                      <td className="text-[11px]">{bmr.startDate}</td>
                      <td>
                        <span className={`app-badge ${STATUS_BADGE[bmr.status] || "app-badge-gray"}`}>
                          {bmr.status}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs">{yieldPct}%</div>
                        <div className="text-[10px] text-muted-foreground">
                          {completedSteps}/{bmr.steps.length} steps
                        </div>
                      </td>
                      <td>
                        <ChevronRight className="w-3 h-3 text-muted-foreground" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default BMR;
