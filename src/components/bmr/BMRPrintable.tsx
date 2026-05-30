import { BMRRecord } from "@/context/BMRContext";

interface Props {
  bmr: BMRRecord;
}

const hasVal = (v: any) => v !== undefined && v !== null && String(v).trim() !== "" && v !== 0;

const Cell = ({ value, height = "22pt" }: { value?: any; height?: string }) => {
  const cellStyle: React.CSSProperties = { border: "1px solid #000", padding: "4pt 6pt", fontSize: "10pt", verticalAlign: "top", height };
  return <td style={cellStyle}>{hasVal(value) ? String(value) : "\u00A0"}</td>;
};

const Blank = ({ value, width = "100%", solid = false }: { value?: string | number; width?: string; solid?: boolean }) => (
  <span
    className="print-blank"
    style={{
      display: "inline-block",
      width,
      borderBottom: hasVal(value) ? "none" : (solid ? "1px solid #000" : "1px dotted #000"),
      minHeight: "1.2em",
      paddingLeft: "2px",
      verticalAlign: "bottom",
      fontWeight: hasVal(value) ? 500 : 400,
    }}
  >
    {hasVal(value) ? String(value) : "\u00A0"}
  </span>
);

const Section = ({ title, scheduleRef, children, breakBefore = true }: { title: string; scheduleRef?: string; children: React.ReactNode; breakBefore?: boolean }) => (
  <section className="print-section" style={{ pageBreakBefore: breakBefore ? "always" : "auto", breakBefore: breakBefore ? "page" : "auto", marginBottom: "16pt" }}>
    <h2 style={{ fontSize: "14pt", fontWeight: 700, borderBottom: "2px solid #000", paddingBottom: "4pt", marginBottom: scheduleRef ? "2pt" : "10pt" }}>
      {title}
    </h2>
    {scheduleRef && (
      <div style={{ fontSize: "8.5pt", color: "#666", fontStyle: "italic", marginBottom: "10pt" }}>{scheduleRef}</div>
    )}
    {children}
  </section>
);

const Row = ({ label, value, width = "60%" }: { label: string; value?: string | number; width?: string }) => (
  <div style={{ display: "flex", gap: "8pt", marginBottom: "8pt", alignItems: "baseline" }}>
    <span style={{ fontWeight: 600, minWidth: "40%" }}>{label}:</span>
    <Blank value={value} width={width} />
  </div>
);

const BMRPrintable = ({ bmr }: Props) => {
  const cellStyle: React.CSSProperties = { border: "1px solid #000", padding: "4pt 6pt", fontSize: "10pt", verticalAlign: "top" };
  const headerCell: React.CSSProperties = { ...cellStyle, fontWeight: 700, background: "#eee" };

  const isFilled = bmr.released || bmr.status === "Released" || bmr.status === "QC pending";

  return (
    <div className="bmr-printable" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "11pt", color: "#000", lineHeight: 1.4 }}>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm; }
          html, body { background: #fff !important; }
          .no-print, nav, header[role="banner"], aside, .app-sidebar, [data-sidebar] { display: none !important; }
          .bmr-printable { width: 210mm; max-width: 210mm; margin: 0 auto; }
        }
        .bmr-printable { width: 210mm; max-width: 210mm; margin: 0 auto; }
      `}</style>
      {/* Header / Title page */}
      <section style={{ marginBottom: "16pt" }}>
        <div style={{ textAlign: "center", marginBottom: "16pt" }}>
          <h1 style={{ fontSize: "18pt", fontWeight: 700, margin: 0 }}>BATCH MANUFACTURING RECORD</h1>
          <div style={{ fontSize: "10pt", marginTop: "4pt" }}>
            As per Schedule U / Schedule T — Ayurvedic Pharmacopoeia of India
          </div>
          <div style={{ fontSize: "9pt", marginTop: "2pt", fontStyle: "italic" }}>
            Status: {bmr.status} {isFilled ? "· Completed copy" : "· Working copy for shop floor"}
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10pt" }}>
          <tbody>
            <tr>
              <td style={headerCell}>Product Name</td>
              <td style={cellStyle}>{(bmr as any).productNameHi ? `${bmr.productName} / ${(bmr as any).productNameHi}` : bmr.productName}</td>
              <td style={headerCell}>Batch No.</td>
              <td style={cellStyle}>{bmr.batchNo}</td>
            </tr>
            <tr>
              <td style={headerCell}>MFR Ref.</td>
              <td style={cellStyle}>{bmr.mfrRef || bmr.mfrName}</td>
              <td style={headerCell}>Dosage Form</td>
              <td style={cellStyle}>{bmr.dosageForm}</td>
            </tr>
            <tr>
              <td style={headerCell}>Batch Size</td>
              <td style={cellStyle}>{bmr.batchSize} {bmr.batchUnit}</td>
              <td style={headerCell}>Pharmacopoeia Ref.</td>
              <td style={cellStyle}>{bmr.pharmacopoeiaRef}</td>
            </tr>
            <tr>
              <td style={headerCell}>Licence No.</td>
              <td style={cellStyle}>{bmr.licenceNo}</td>
              <td style={headerCell}>Product Code</td>
              <td style={cellStyle}>{bmr.productCode}</td>
            </tr>
            <tr>
              <td style={headerCell}>Lot Number</td>
              <td style={cellStyle}>{bmr.lotNumber}</td>
              <td style={headerCell}>Shelf Life</td>
              <td style={cellStyle}>{bmr.shelfLifeMonths} months</td>
            </tr>
            <tr>
              <td style={headerCell}>Mfg. Date</td>
              <td style={cellStyle}>{bmr.startDate}</td>
              <td style={headerCell}>Expiry Date</td>
              <td style={cellStyle}>{bmr.expiryDate}</td>
            </tr>
          </tbody>
        </table>

        <h3 style={{ fontSize: "12pt", fontWeight: 700, marginTop: "12pt", marginBottom: "6pt" }}>Personnel</h3>
        <Row label="Prepared By" value={bmr.personnel.preparedBy} />
        <Row label="Technical Staff" value={bmr.personnel.technicalStaff} />
        <Row label="QC Head" value={bmr.personnel.qcHead} />
        <Row label="Production Supervisor" value={bmr.personnel.productionSupervisor} />
        <Row label="Room / Plant" value={bmr.personnel.roomPlant} />
        <Row label="Equipment Used" value={bmr.personnel.equipmentUsed} />
      </section>

      {/* Sub-processes (Kwatha / Kalka / Bhavana / Shodhana) */}
      {bmr.subProcesses && bmr.subProcesses.length > 0 && (
        <Section title="2A. Sub-Processes (Pharmaceutical Operations)" scheduleRef="Schedule U §I-A.5 — Process Record (Kwatha / Bhavana / Shodhana)">
          {bmr.subProcesses.map((sp, spi) => (
            <div key={sp.id || spi} style={{ border: "1px solid #000", padding: "8pt", marginBottom: "12pt", pageBreakInside: "avoid" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "6pt", borderBottom: "1px solid #000", paddingBottom: "4pt" }}>
                <div style={{ fontWeight: 700, fontSize: "12pt" }}>{sp.name || sp.type}</div>
                <span style={{ border: "1px solid #000", padding: "1pt 6pt", fontSize: "9pt", fontWeight: 600, textTransform: "uppercase" }}>{sp.type}</span>
              </div>
              {sp.description && (
                <div style={{ fontSize: "10pt", marginBottom: "6pt", fontStyle: "italic" }}>{sp.description}</div>
              )}

              {sp.ingredients && sp.ingredients.length > 0 && (
                <>
                  <div style={{ fontSize: "10pt", fontWeight: 700, marginTop: "6pt", marginBottom: "4pt" }}>Ingredients</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8pt" }}>
                    <thead>
                      <tr>
                        <th style={headerCell}>#</th>
                        <th style={headerCell}>Ingredient</th>
                        <th style={headerCell}>Qty Used</th>
                        <th style={headerCell}>Unit</th>
                        <th style={headerCell}>Lot / AR No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sp.ingredients.map((ing: any, i: number) => (
                        <tr key={i}>
                          <Cell value={i + 1} />
                          <Cell value={`${ing.name || ""}${ing.botanicalName ? ` (${ing.botanicalName})` : ""}`} />
                          <Cell value={ing.actualQty || ing.requiredQty} />
                          <Cell value={ing.unit} />
                          <Cell value={ing.arControlNo || ing.lot || ing.grnRef} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {sp.type === "Kwatha" && (
                <div style={{ display: "flex", gap: "16pt", marginTop: "6pt", flexWrap: "wrap" }}>
                  <div><strong>Initial volume:</strong> <Blank value={sp.initialVolume} width="80pt" /></div>
                  <div style={{ fontSize: "12pt" }}>→</div>
                  <div><strong>Final volume:</strong> <Blank value={sp.finalVolume} width="80pt" /></div>
                  {sp.pakaDuration && <div><strong>Paka duration:</strong> {sp.pakaDuration}</div>}
                  {sp.flameSetting && <div><strong>Flame:</strong> {sp.flameSetting}</div>}
                </div>
              )}

              {(sp.type === "Bhavana" || sp.type === "Shodhana") && (
                <>
                  <div style={{ fontSize: "10pt", fontWeight: 700, marginTop: "8pt", marginBottom: "4pt" }}>Iteration Log</div>
                  <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "6pt" }}>
                    <thead>
                      <tr>
                        <th style={headerCell}>#</th>
                        <th style={headerCell}>Cycle No.</th>
                        <th style={headerCell}>Date</th>
                        <th style={headerCell}>Weight After</th>
                        <th style={headerCell}>Observed By (PIN)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(sp.iterationLog && sp.iterationLog.length > 0 ? sp.iterationLog : Array.from({ length: 3 })).map((log: any, li: number) => (
                        <tr key={li}>
                          <Cell value={li + 1} />
                          <Cell value={log?.cycleNo} />
                          <Cell value={log?.date} />
                          <Cell value={log?.weightAfter} />
                          <Cell value={log?.observedByPin} />
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div style={{ display: "flex", gap: "16pt", marginTop: "8pt", flexWrap: "wrap", borderTop: "1px dashed #999", paddingTop: "6pt" }}>
                <div><strong>Actual Yield:</strong> <Blank value={sp.actualYield ? `${sp.actualYield} ${sp.actualYieldUnit || ""}`.trim() : ""} width="120pt" /></div>
                <div><strong>Completion Test:</strong> <Blank value={sp.completionTestResult} width="60pt" /></div>
                {sp.observedBy && <div><strong>Observed By:</strong> {sp.observedBy}</div>}
                {sp.date && <div><strong>Date:</strong> {sp.date}</div>}
              </div>
              {sp.batchNotes && (
                <div style={{ marginTop: "6pt", fontSize: "10pt" }}><strong>Notes:</strong> {sp.batchNotes}</div>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Ingredients */}
      <Section title="2. Ingredients — Weighing & Dispensing" scheduleRef="Schedule U §I-A.7 — Raw Material Record">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCell}>#</th>
              <th style={headerCell}>Ingredient</th>
              <th style={headerCell}>Cat.</th>
              <th style={headerCell}>Required Qty</th>
              <th style={headerCell}>Actual Qty</th>
              <th style={headerCell}>Unit</th>
              <th style={headerCell}>Lot / AR No.</th>
              <th style={headerCell}>Weighed By</th>
              <th style={headerCell}>Checked By</th>
            </tr>
          </thead>
          <tbody>
            {bmr.ingredients.length === 0 ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} style={{ ...cellStyle, height: "22pt" }}>&nbsp;</td>
                  ))}
                </tr>
              ))
            ) : (
              bmr.ingredients.map((ing, i) => (
                <tr key={i}>
                  <Cell value={i + 1} />
                  <Cell value={`${ing.name}${(ing as any).nameHi ? ` / ${(ing as any).nameHi}` : ""}${ing.botanicalName ? ` (${ing.botanicalName})` : ""}`} />
                  <Cell value={ing.cat} />
                  <Cell value={ing.requiredQty} />
                  <Cell value={ing.actualQty} />
                  <Cell value={ing.unit} />
                  <Cell value={ing.arControlNo || ing.lot || ing.grnRef} />
                  <Cell value={ing.weighedBy} />
                  <Cell value={ing.checkedBy} />
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Section>

      {/* Process log */}
      <Section title="3. Process Log & Environmental Controls" scheduleRef="Schedule U §I-A.6 — Manufacturing Process & Environmental Conditions">
        <h3 style={{ fontSize: "11pt", fontWeight: 700, marginBottom: "6pt" }}>Environment</h3>
        <Row label="Room Temperature (°C)" value={bmr.environment.roomTemp} />
        <Row label="Relative Humidity (%)" value={bmr.environment.relativeHumidity} />
        <Row label="Room Pressure" value={bmr.environment.roomPressure} />
        <Row label="HVAC Unit" value={bmr.environment.hvacUnit} />

        <h3 style={{ fontSize: "11pt", fontWeight: 700, marginTop: "12pt", marginBottom: "6pt" }}>Process Steps</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCell}>#</th>
              <th style={headerCell}>Step / Description</th>
              <th style={headerCell}>Equipment</th>
              <th style={headerCell}>Start</th>
              <th style={headerCell}>End</th>
              <th style={headerCell}>Operator</th>
              <th style={headerCell}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {(bmr.steps.length === 0 ? Array.from({ length: 6 }) : bmr.steps).map((s: any, i: number) => (
              <tr key={i}>
                <Cell value={i + 1} />
                <Cell value={`${s?.step || ""}${s?.description ? ` — ${s.description}` : ""}`} />
                <Cell value={s?.equipment} />
                <Cell value={s?.startTime} />
                <Cell value={s?.endTime} />
                <Cell value={s?.operator} />
                <Cell value={s?.remarks} />
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* IPC */}
      <Section title="4. In-Process Quality Control (IPC) Checks">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCell}>#</th>
              <th style={headerCell}>Check / Parameter</th>
              <th style={headerCell}>Specification</th>
              <th style={headerCell}>Observed Value</th>
              <th style={headerCell}>Unit</th>
              <th style={headerCell}>Checked At</th>
              <th style={headerCell}>Result (P/F)</th>
            </tr>
          </thead>
          <tbody>
            {(bmr.ipcChecks.length === 0 ? Array.from({ length: 6 }) : bmr.ipcChecks).map((c: any, i: number) => (
              <tr key={i}>
                <Cell value={i + 1} />
                <Cell value={c?.check} />
                <Cell value={c?.specification} />
                <Cell value={c?.observedValue} />
                <Cell value={c?.unit} />
                <Cell value={c?.checkedAt} />
                <Cell value={c?.result ? c.result.toUpperCase() : ""} />
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Yield & Packing */}
      <Section title="5. Yield & Packing">
        <h3 style={{ fontSize: "11pt", fontWeight: 700, marginBottom: "6pt" }}>Blend Weights</h3>
        <Row label="Theoretical Blend Wt." value={bmr.blendWeight.theoreticalBlendWt} />
        <Row label="Actual Blend Wt." value={bmr.blendWeight.actualBlendWt} />
        <Row label="Loss on Blending" value={bmr.blendWeight.lossOnBlending} />
        <Row label="Yield at Blend Stage (%)" value={bmr.blendWeight.yieldAtBlendStage} />

        <h3 style={{ fontSize: "11pt", fontWeight: 700, marginTop: "12pt", marginBottom: "6pt" }}>Yield</h3>
        <Row label="Theoretical Yield" value={bmr.theoreticalYield} />
        <Row label="Actual Yield" value={bmr.actualYield} />
        <Row label="Yield %" value={bmr.yieldPct} />

        <h3 style={{ fontSize: "11pt", fontWeight: 700, marginTop: "12pt", marginBottom: "6pt" }}>Pack Sizes</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCell}>Pack Size</th>
              <th style={headerCell}>Qty Allocated</th>
              <th style={headerCell}>No. of Primary Packs</th>
              <th style={headerCell}>Secondary Pack</th>
              <th style={headerCell}>No. of Shippers</th>
            </tr>
          </thead>
          <tbody>
            {(bmr.packing.packEntries && bmr.packing.packEntries.length > 0
              ? bmr.packing.packEntries
              : [{ primaryPackSize: bmr.packing.primaryPackSize, qtyAllocated: 0, noOfPrimaryPacks: bmr.packing.noOfPrimaryPacks, secondaryPack: bmr.packing.secondaryPack, noOfShippers: bmr.packing.noOfShippers } as any]
            ).map((p: any, i: number) => (
              <tr key={i}>
                <Cell value={p.primaryPackSize} />
                <Cell value={hasVal(p.qtyAllocated) ? `${p.qtyAllocated} ${bmr.batchUnit}` : ""} />
                <Cell value={p.noOfPrimaryPacks} />
                <Cell value={p.secondaryPack} />
                <Cell value={p.noOfShippers} />
              </tr>
            ))}
          </tbody>
        </table>

        <h3 style={{ fontSize: "11pt", fontWeight: 700, marginTop: "12pt", marginBottom: "6pt" }}>Labelling & Warehouse</h3>
        <Row label="QC Retain Sample" value={bmr.packing.qcRetainSample} />
        <Row label="Labelling Batch Code" value={bmr.packing.labellingBatchCode} />
        <Row label="Packing Date" value={bmr.packing.packingDate} />
        <Row label="MRP" value={bmr.label.mrp} />
        <Row label="Qty Transferred to Warehouse" value={bmr.warehouseTransfer.qtyToWarehouse} />
        <Row label="Warehouse Location" value={bmr.warehouseTransfer.warehouseLocation} />
        <Row label="Transfer Date" value={bmr.warehouseTransfer.transferDate} />
        <Row label="Acknowledged By" value={bmr.warehouseTransfer.transferAcknowledgedBy} />
      </Section>

      {/* QC */}
      <Section title="6. QC Analytical Report & Release">
        <Row label="AR Report No." value={bmr.arReportNo} />
        <Row label="Date Sample Sent to QC" value={bmr.dateSampleSentToQC} />
        <Row label="Date of Analysis" value={bmr.dateOfAnalysis} />

        <h3 style={{ fontSize: "11pt", fontWeight: 700, marginTop: "12pt", marginBottom: "6pt" }}>Analytical Tests</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCell}>#</th>
              <th style={headerCell}>Parameter</th>
              <th style={headerCell}>Specification</th>
              <th style={headerCell}>Result</th>
              <th style={headerCell}>Compliance (P/F)</th>
            </tr>
          </thead>
          <tbody>
            {(bmr.qcParams.length === 0 ? Array.from({ length: 6 }) : bmr.qcParams).map((q: any, i: number) => (
              <tr key={i}>
                <Cell value={i + 1} />
                <Cell value={q?.parameter} />
                <Cell value={q?.spec} />
                <Cell value={q?.result} />
                <Cell value={q?.compliance ? q.compliance.toUpperCase() : ""} />
              </tr>
            ))}
          </tbody>
        </table>

        <Row label="Overall Result" value={bmr.analystOverallResult} />
        <Row label="Analyst Remarks" value={bmr.analystRemarks} />
        <Row label="Rejection in Batch" value={bmr.rejectionInBatch} />
        <Row label="Disposal Reference" value={bmr.disposalRef} />

        <h3 style={{ fontSize: "11pt", fontWeight: 700, marginTop: "16pt", marginBottom: "6pt" }}>Signatures</h3>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCell}>Role</th>
              <th style={headerCell}>Name</th>
              <th style={headerCell}>Initials</th>
              <th style={headerCell}>Date</th>
              <th style={headerCell}>Signature</th>
            </tr>
          </thead>
          <tbody>
            {bmr.signatures.map((s, i) => (
              <tr key={i}>
                <Cell value={s.role} />
                <Cell value={s.name} height="32pt" />
                <Cell value={s.initials} />
                <Cell value={s.signedAt} />
                <Cell value={s.signed ? "✓ Signed" : ""} />
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </div>
  );
};

export default BMRPrintable;
