import { BMRRecord } from "@/context/BMRContext";
import { Info } from "lucide-react";

interface Props {
  bmr: BMRRecord;
  onChange: (updates: Partial<BMRRecord>) => void;
  prevBatchNo: string | null;
}

const Step1BatchHeader = ({ bmr, onChange, prevBatchNo }: Props) => {
  const updatePersonnel = (key: string, value: string) =>
    onChange({ personnel: { ...bmr.personnel, [key]: value } });

  return (
    <>
      <div className="alert-box alert-info mb-3">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>Schedule U §I-A: Serial no., product, MFR reference, batch/lot size, batch number, dates, and date of expiry must be recorded.</span>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Product & licence details</div>
          <span className="app-badge app-badge-teal">AFI Vol.I</span>
        </div>
        <div className="p-3.5">
          <div className="grid grid-cols-4 gap-2.5 mb-2.5">
            <div className="form-field">
              <label>BMR serial no.</label>
              <input value={bmr.id.slice(0, 13).toUpperCase()} readOnly className="bg-secondary" />
            </div>
            <div className="form-field">
              <label>Product name</label>
              <input value={bmr.productName} readOnly className="bg-secondary" />
            </div>
            <div className="form-field">
              <label>Dosage form</label>
              <select value={bmr.dosageForm} onChange={e => onChange({ dosageForm: e.target.value })}>
                <option value="">— Select —</option>
                <option>Churna (powder)</option>
                <option>Arishta</option>
                <option>Avaleha</option>
                <option>Taila</option>
                <option>Ghrita</option>
                <option>Vati / Gutika</option>
                <option>Kwatha</option>
                <option>Bhasma</option>
              </select>
            </div>
            <div className="form-field">
              <label>Batch no. (auto)</label>
              <input value={bmr.batchNo} readOnly className="bg-secondary" />
              {prevBatchNo && (
                <div className="text-[10px] text-muted-foreground mt-1">Previous: {prevBatchNo}</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <div className="form-field">
              <label>Master formula ref.</label>
              <input value={bmr.mfrRef} onChange={e => onChange({ mfrRef: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Pharmacopoeia ref.</label>
              <input value={bmr.pharmacopoeiaRef} onChange={e => onChange({ pharmacopoeiaRef: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Mfg. licence no.</label>
              <input value={bmr.licenceNo} onChange={e => onChange({ licenceNo: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Product code</label>
              <input value={bmr.productCode} onChange={e => onChange({ productCode: e.target.value })} />
            </div>
          </div>
        </div>
      </div>

      <div className="app-card mb-2.5">
        <div className="app-card-head">
          <div className="app-card-title">Batch size & dates</div>
        </div>
        <div className="p-3.5">
          <div className="grid grid-cols-4 gap-2.5 mb-2.5">
            <div className="form-field">
              <label>Batch size (target)</label>
              <input type="number" value={bmr.batchSize || ""} onChange={e => onChange({ batchSize: Number(e.target.value) })} />
            </div>
            <div className="form-field">
              <label>UOM</label>
              <input value={bmr.batchUnit} readOnly className="bg-secondary" />
            </div>
            <div className="form-field">
              <label>Scale factor</label>
              <input value={bmr.scaleFactor ? `${bmr.scaleFactor.toFixed(2)}×` : "—"} readOnly className="bg-secondary" />
            </div>
            <div className="form-field">
              <label>Lot number</label>
              <input value={bmr.lotNumber} onChange={e => onChange({ lotNumber: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            <div className="form-field">
              <label>Mfg. start date</label>
              <input type="date" value={bmr.startDate} onChange={e => onChange({ startDate: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Mfg. completion date</label>
              <input type="date" value={bmr.completionDate} onChange={e => onChange({ completionDate: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Shelf life (months)</label>
              <input type="number" value={bmr.shelfLifeMonths} onChange={e => onChange({ shelfLifeMonths: Number(e.target.value) })} />
            </div>
            <div className="form-field">
              <label>Date of expiry (auto)</label>
              <input value={bmr.expiryDate || "—"} readOnly className="bg-secondary" />
            </div>
          </div>
        </div>
      </div>

      <div className="app-card">
        <div className="app-card-head">
          <div className="app-card-title">Responsible personnel</div>
          <span className="app-badge app-badge-gray">Schedule U §I-A.20</span>
        </div>
        <div className="p-3.5">
          <div className="grid grid-cols-3 gap-2.5 mb-2.5">
            <div className="form-field">
              <label>Prepared by (store)</label>
              <input value={bmr.personnel.preparedBy} onChange={e => updatePersonnel("preparedBy", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Technical staff (in-charge)</label>
              <input value={bmr.personnel.technicalStaff} onChange={e => updatePersonnel("technicalStaff", e.target.value)} />
            </div>
            <div className="form-field">
              <label>QC Head (counter-sign)</label>
              <input value={bmr.personnel.qcHead} onChange={e => updatePersonnel("qcHead", e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="form-field">
              <label>Production supervisor</label>
              <input value={bmr.personnel.productionSupervisor} onChange={e => updatePersonnel("productionSupervisor", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Room / plant no.</label>
              <input value={bmr.personnel.roomPlant} onChange={e => updatePersonnel("roomPlant", e.target.value)} />
            </div>
            <div className="form-field">
              <label>Equipment used</label>
              <input value={bmr.personnel.equipmentUsed} onChange={e => updatePersonnel("equipmentUsed", e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Step1BatchHeader;
