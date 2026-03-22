import { useState, useMemo } from "react";

const formatMoney = (n) => $${Number(n || 0).toFixed(2)};

const FEDERAL_HOLIDAYS = [ "01-01", // New Year "06-19", // Juneteenth "07-04", // Independence Day "11-11", // Veterans "12-25", // Christmas ];

function isFederalHoliday(date) { const m = String(date.getMonth() + 1).padStart(2, "0"); const d = String(date.getDate()).padStart(2, "0"); return FEDERAL_HOLIDAYS.includes(${m}-${d}); }

function addDays(date, days) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }

function formatDate(d) { return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", }); }

export default function Home() { const [tab, setTab] = useState("fees");

const [fee, setFee] = useState(100); const [miles, setMiles] = useState(40); const [cpm, setCpm] = useState(0.67);

const [printing, setPrinting] = useState(true); const [pages, setPages] = useState(140); const [sets, setSets] = useState(2); const [cpp, setCpp] = useState(0.06);

const [scanbacks, setScanbacks] = useState(false); const [scanCost, setScanCost] = useState(10);

const [shipping, setShipping] = useState(false); const [shipCost, setShipCost] = useState(10);

const [extraToggle, setExtraToggle] = useState(false); const [extra, setExtra] = useState(0);

const [signDate, setSignDate] = useState("");

const calc = useMemo(() => { const mileage = miles * cpm; const print = printing ? pages * sets * cpp : 0; const scan = scanbacks ? scanCost : 0; const ship = shipping ? shipCost : 0; const extras = extraToggle ? extra : 0;

const total = mileage + print + scan + ship + extras;
const profit = fee - total;

return { mileage, print, scan, ship, extras, total, profit };

}, [fee, miles, cpm, printing, pages, sets, cpp, scanbacks, scanCost, shipping, shipCost, extraToggle, extra]);

const rescission = useMemo(() => { if (!signDate) return null;

const start = new Date(signDate + "T00:00:00");
let current = addDays(start, 1);
let count = 0;
const timeline = [];

timeline.push({
  label: "Signing Day",
  date: new Date(start),
  status: "info",
});

while (count < 3) {
  const isSunday = current.getDay() === 0;
  const isHoliday = isFederalHoliday(current);

  if (isSunday) {
    timeline.push({ date: new Date(current), label: "🚫 Sunday", status: "skip" });
  } else if (isHoliday) {
    timeline.push({ date: new Date(current), label: "🚫 Holiday", status: "skip" });
  } else {
    count++;
    timeline.push({ date: new Date(current), label: `✅ Day ${count}`, status: "count" });
  }

  if (count < 3) current = addDays(current, 1);
}

return { deadline: current, timeline };

}, [signDate]);

return ( <div style={{ padding: 20, fontFamily: "Arial" }}> <h1>Signing Fee Calculator</h1>

<div style={{ marginBottom: 20 }}>
    <button onClick={() => setTab("fees")}>Fees</button>
    <button onClick={() => setTab("rescission")}>Rescission</button>
    <button onClick={() => setTab("settings")}>Settings</button>
  </div>

  {tab === "fees" && (
    <div>
      <h2>Fees</h2>

      <input value={fee} onChange={(e) => setFee(+e.target.value)} /> Fee
      <br />
      <input value={miles} onChange={(e) => setMiles(+e.target.value)} /> Miles
      <br />
      <input value={cpm} onChange={(e) => setCpm(+e.target.value)} /> Cost Per Mile

      <h3>Breakdown</h3>
      <div>Mileage: {formatMoney(calc.mileage)}</div>
      {printing && <div>Printing: {formatMoney(calc.print)}</div>}
      {scanbacks && <div>Scanbacks: {formatMoney(calc.scan)}</div>}
      {shipping && <div>Shipping: {formatMoney(calc.ship)}</div>}
      {extraToggle && <div>Additional: {formatMoney(calc.extras)}</div>}

      <strong>Net Profit: {formatMoney(calc.profit)}</strong>
    </div>
  )}

  {tab === "rescission" && (
    <div>
      <h2>Rescission</h2>

      <input type="date" value={signDate} onChange={(e) => setSignDate(e.target.value)} />

      {rescission && (
        <div>
          <h3>Deadline: {formatDate(rescission.deadline)}</h3>

          {rescission.timeline.map((d, i) => (
            <div key={i}>
              {formatDate(d.date)} - {d.label}
            </div>
          ))}

          <p style={{ marginTop: 10, color: "orange" }}>
            This calculator is for convenience only and is not legal advice. Please confirm observed holidays.
          </p>
        </div>
      )}
    </div>
  )}

  {tab === "settings" && (
    <div>
      <h2>Settings</h2>
      <p>Coming soon (keeping this simple and stable first)</p>
    </div>
  )}
</div>

); }
