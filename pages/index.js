import { useMemo, useState } from "react";

function formatCurrency(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(Number.isFinite(value) ? value : 0); }

function formatNumber(value) { return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, }).format(Number.isFinite(value) ? value : 0); }

export default function Home() { const [fee, setFee] = useState(""); const [roundTripMiles, setRoundTripMiles] = useState(""); const [costPerMile, setCostPerMile] = useState("0.67"); const [printingCost, setPrintingCost] = useState(""); const [scanbackFee, setScanbackFee] = useState(""); const [otherCost, setOtherCost] = useState("");

const values = useMemo(() => { const totalFee = parseFloat(fee) || 0; const miles = parseFloat(roundTripMiles) || 0; const mileageRate = parseFloat(costPerMile) || 0; const printCost = parseFloat(printingCost) || 0; const scanCost = parseFloat(scanbackFee) || 0; const miscCost = parseFloat(otherCost) || 0;

const mileageCost = miles * mileageRate;
const totalExpenses = mileageCost + printCost + scanCost + miscCost;
const netProfit = totalFee - totalExpenses;
const profitPerMile = miles > 0 ? netProfit / miles : netProfit;

let rating = "Solid";
let ratingStyle = "bg-emerald-100 text-emerald-800 border-emerald-200";

if (netProfit < 0) {
  rating = "Losing Money";
  ratingStyle = "bg-rose-100 text-rose-700 border-rose-200";
} else if (netProfit < 40) {
  rating = "Low Profit";
  ratingStyle = "bg-amber-100 text-amber-800 border-amber-200";
}

return {
  totalFee,
  miles,
  mileageRate,
  printCost,
  scanCost,
  miscCost,
  mileageCost,
  totalExpenses,
  netProfit,
  profitPerMile,
  rating,
  ratingStyle,
};

}, [fee, roundTripMiles, costPerMile, printingCost, scanbackFee, otherCost]);

return ( <main className="min-h-screen bg-slate-100 px-4 py-8 font-sans sm:px-6"> <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-200/60"> <div className="bg-gradient-to-r from-slate-900 to-violet-700 px-6 py-8 text-white sm:px-8"> <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-violet-200"> Notary Toolkit </p> <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl"> Notary Fee Calculator </h1> <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base"> Enter the job details and instantly see your estimated expenses, net profit, and whether the assignment is worth it. </p> </div>

<div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-bold text-slate-900">Job Details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Signing Fee
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="100"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Round-Trip Miles
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={roundTripMiles}
              onChange={(e) => setRoundTripMiles(e.target.value)}
              placeholder="40"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Cost Per Mile
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={costPerMile}
              onChange={(e) => setCostPerMile(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Printing Cost
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={printingCost}
              onChange={(e) => setPrintingCost(e.target.value)}
              placeholder="8"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Scanback Cost
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={scanbackFee}
              onChange={(e) => setScanbackFee(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Other Cost
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={otherCost}
              onChange={(e) => setOtherCost(e.target.value)}
              placeholder="0"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />
          </label>
        </div>

        <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-sm text-violet-900">
            Tip: use round-trip miles so the estimate reflects the full job,
            not just the drive there.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <div className={`rounded-2xl border p-5 ${values.ratingStyle}`}>
          <p className="text-sm font-semibold uppercase tracking-wide">
            Assignment Snapshot
          </p>
          <p className="mt-2 text-3xl font-extrabold">{values.rating}</p>
          <p className="mt-2 text-sm">
            Based on your fee and estimated job-related costs.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Net Profit
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatCurrency(values.netProfit)}
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              Total Expenses
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {formatCurrency(values.totalExpenses)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold text-slate-900">Breakdown</h2>
          <div className="mt-4 space-y-3 text-sm sm:text-base">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-slate-700">Fee</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(values.totalFee)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-slate-700">Mileage Cost</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(values.mileageCost)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-slate-700">Printing</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(values.printCost)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-slate-700">Scanbacks</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(values.scanCost)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="font-medium text-slate-700">Other Cost</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(values.miscCost)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
              <span className="font-semibold text-violet-900">Profit Per Mile</span>
              <span className="font-bold text-violet-900">
                {formatCurrency(values.profitPerMile)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-900">
            This calculator provides an estimate only. Actual profitability
            depends on your true operating costs, time, taxes, and any
            unpaid admin work related to the assignment.
          </p>
          <p className="mt-2 text-sm text-amber-900">
            Mileage rate is editable so you can use your preferred estimate
            for gas, wear and tear, and vehicle expenses.
          </p>
        </div>
      </section>
    </div>
  </div>
</main>

); }
