import { useMemo, useState } from "react";

function formatCurrency(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(Number.isFinite(value) ? value : 0); }

export default function Home() { const [fee, setFee] = useState("100"); const [roundTripMiles, setRoundTripMiles] = useState("40"); const [costPerMile, setCostPerMile] = useState("0.67"); const [printingCost, setPrintingCost] = useState("8"); const [scanbackCost, setScanbackCost] = useState("0"); const [otherCost, setOtherCost] = useState("0");

const values = useMemo(() => { const totalFee = parseFloat(fee) || 0; const miles = parseFloat(roundTripMiles) || 0; const mileageRate = parseFloat(costPerMile) || 0; const printCost = parseFloat(printingCost) || 0; const scanCost = parseFloat(scanbackCost) || 0; const miscCost = parseFloat(otherCost) || 0;

const mileageCost = miles * mileageRate;
const totalExpenses = mileageCost + printCost + scanCost + miscCost;
const netProfit = totalFee - totalExpenses;
const profitPerMile = miles > 0 ? netProfit / miles : 0;

let rating = "Solid";
let ratingClass = "pill pill-good";

if (netProfit < 0) {
  rating = "Losing Money";
  ratingClass = "pill pill-bad";
} else if (netProfit < 40) {
  rating = "Low Profit";
  ratingClass = "pill pill-warn";
}

return {
  totalFee,
  mileageCost,
  printCost,
  scanCost,
  miscCost,
  totalExpenses,
  netProfit,
  profitPerMile,
  rating,
  ratingClass,
};

}, [fee, roundTripMiles, costPerMile, printingCost, scanbackCost, otherCost]);

return ( <> <main className="page"> <div className="card"> <section className="hero"> <p className="eyebrow">Notary Toolkit</p> <h1>Notary Fee Calculator</h1> <p className="heroText"> Enter the job details and instantly see your estimated expenses, net profit, and whether the assignment is worth it. </p> </section>

<section className="contentGrid">
        <div className="panel softPanel">
          <h2>Job Details</h2>

          <div className="formGrid">
            <label>
              <span>Signing Fee</span>
              <input
                type="number"
                inputMode="decimal"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </label>

            <label>
              <span>Round-Trip Miles</span>
              <input
                type="number"
                inputMode="decimal"
                value={roundTripMiles}
                onChange={(e) => setRoundTripMiles(e.target.value)}
              />
            </label>

            <label>
              <span>Cost Per Mile</span>
              <input
                type="number"
                inputMode="decimal"
                value={costPerMile}
                onChange={(e) => setCostPerMile(e.target.value)}
              />
            </label>

            <label>
              <span>Printing Cost</span>
              <input
                type="number"
                inputMode="decimal"
                value={printingCost}
                onChange={(e) => setPrintingCost(e.target.value)}
              />
            </label>

            <label>
              <span>Scanback Cost</span>
              <input
                type="number"
                inputMode="decimal"
                value={scanbackCost}
                onChange={(e) => setScanbackCost(e.target.value)}
              />
            </label>

            <label>
              <span>Other Cost</span>
              <input
                type="number"
                inputMode="decimal"
                value={otherCost}
                onChange={(e) => setOtherCost(e.target.value)}
              />
            </label>
          </div>

          <div className="tipBox">
            Tip: use round-trip miles so the estimate reflects the full job,
            not just the drive there.
          </div>
        </div>

        <div className="rightCol">
          <div className="panel snapshotPanel">
            <p className="label">Assignment Snapshot</p>
            <div className={values.ratingClass}>{values.rating}</div>
            <p className="snapshotText">
              Based on your fee and estimated job-related costs.
            </p>
          </div>

          <div className="statsGrid">
            <div className="statCard statProfit">
              <p className="label">Net Profit</p>
              <h3>{formatCurrency(values.netProfit)}</h3>
            </div>

            <div className="statCard statExpense">
              <p className="label">Total Expenses</p>
              <h3>{formatCurrency(values.totalExpenses)}</h3>
            </div>
          </div>

          <div className="panel">
            <h2>Breakdown</h2>
            <div className="rows">
              <div className="row"><span>Fee</span><strong>{formatCurrency(values.totalFee)}</strong></div>
              <div className="row"><span>Mileage Cost</span><strong>{formatCurrency(values.mileageCost)}</strong></div>
              <div className="row"><span>Printing</span><strong>{formatCurrency(values.printCost)}</strong></div>
              <div className="row"><span>Scanbacks</span><strong>{formatCurrency(values.scanCost)}</strong></div>
              <div className="row"><span>Other Cost</span><strong>{formatCurrency(values.miscCost)}</strong></div>
              <div className="row rowHighlight"><span>Profit Per Mile</span><strong>{formatCurrency(values.profitPerMile)}</strong></div>
            </div>
          </div>

          <div className="notice">
            <p>
              This calculator provides an estimate only. Actual
              profitability depends on your true operating costs, time,
              taxes, and any unpaid admin work related to the assignment.
            </p>
            <p>
              Mileage rate is editable so you can use your preferred
              estimate for gas, wear and tear, and vehicle expenses.
            </p>
          </div>
        </div>
      </section>
    </div>
  </main>

  <style jsx>{`
    :global(body) {
      margin: 0;
      background: #f1f5f9;
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
    }

    .page {
      min-height: 100vh;
      padding: 24px 16px;
    }

    .card {
      max-width: 1100px;
      margin: 0 auto;
      background: white;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
    }

    .hero {
      background: linear-gradient(135deg, #0f172a, #6d28d9);
      color: white;
      padding: 32px 24px;
    }

    .eyebrow {
      margin: 0 0 10px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: #ddd6fe;
    }

    .hero h1 {
      margin: 0;
      font-size: 42px;
      line-height: 1.05;
    }

    .heroText {
      margin: 14px 0 0;
      max-width: 700px;
      font-size: 17px;
      line-height: 1.55;
      color: #e2e8f0;
    }

    .contentGrid {
      display: grid;
      grid-template-columns: 1.05fr 0.95fr;
      gap: 24px;
      padding: 24px;
    }

    .panel {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 22px;
      padding: 20px;
    }

    .softPanel {
      background: #f8fafc;
    }

    h2 {
      margin: 0 0 18px;
      font-size: 24px;
    }

    .formGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    label span {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 700;
      color: #334155;
    }

    input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #cbd5e1;
      border-radius: 14px;
      padding: 14px 15px;
      font-size: 16px;
      outline: none;
      background: white;
    }

    input:focus {
      border-color: #7c3aed;
      box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
    }

    .tipBox {
      margin-top: 18px;
      padding: 14px 16px;
      border-radius: 16px;
      background: #ede9fe;
      color: #4c1d95;
      font-size: 14px;
      line-height: 1.5;
    }

    .rightCol {
      display: grid;
      gap: 16px;
    }

    .snapshotPanel {
      border-color: #ddd6fe;
      background: #faf5ff;
    }

    .label {
      margin: 0;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #64748b;
    }

    .snapshotText {
      margin: 12px 0 0;
      font-size: 14px;
      line-height: 1.5;
      color: #475569;
    }

    .pill {
      display: inline-block;
      margin-top: 12px;
      border-radius: 999px;
      padding: 10px 14px;
      font-size: 15px;
      font-weight: 800;
    }

    .pill-good {
      background: #dcfce7;
      color: #166534;
    }

    .pill-warn {
      background: #fef3c7;
      color: #92400e;
    }

    .pill-bad {
      background: #ffe4e6;
      color: #be123c;
    }

    .statsGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .statCard {
      border-radius: 22px;
      padding: 20px;
      border: 1px solid;
    }

    .statProfit {
      background: #ecfdf5;
      border-color: #a7f3d0;
    }

    .statExpense {
      background: #eff6ff;
      border-color: #bfdbfe;
    }

    .statCard h3 {
      margin: 10px 0 0;
      font-size: 34px;
      line-height: 1.1;
    }

    .rows {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 14px;
      align-items: center;
      padding: 14px 16px;
      border-radius: 16px;
      background: #f8fafc;
      font-size: 15px;
    }

    .row span {
      color: #334155;
      font-weight: 600;
    }

    .rowHighlight {
      background: #ede9fe;
    }

    .rowHighlight span,
    .rowHighlight strong {
      color: #5b21b6;
    }

    .notice {
      border: 1px solid #fde68a;
      background: #fffbeb;
      color: #92400e;
      border-radius: 20px;
      padding: 16px;
      font-size: 14px;
      line-height: 1.55;
    }

    .notice p {
      margin: 0;
    }

    .notice p + p {
      margin-top: 10px;
    }

    @media (max-width: 900px) {
      .contentGrid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 640px) {
      .page {
        padding: 12px;
      }

      .hero {
        padding: 26px 18px;
      }

      .hero h1 {
        font-size: 34px;
      }

      .heroText {
        font-size: 15px;
      }

      .contentGrid {
        padding: 16px;
        gap: 16px;
      }

      .formGrid,
      .statsGrid {
        grid-template-columns: 1fr;
      }

      .statCard h3 {
        font-size: 28px;
      }

      .row {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `}</style>
</>

); }
