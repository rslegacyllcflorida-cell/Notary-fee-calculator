import { useEffect, useMemo, useState } from "react";

function formatCurrency(value) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, }).format(Number.isFinite(value) ? value : 0); }

const DEFAULT_SETTINGS = { costPerMile: "0.67", costPerPage: "0.06", scanbackFee: "10", shippingStandard: "10", shippingExpedited: "25", shippingOvernight: "35", };

function getShippingEstimates(settings) { return { standard: Number(settings.shippingStandard) || 0, expedited: Number(settings.shippingExpedited) || 0, overnight: Number(settings.shippingOvernight) || 0, }; }

export default function Home() { const [activeTool, setActiveTool] = useState("fee"); const [isPro, setIsPro] = useState(false);

const [showSettings, setShowSettings] = useState(false); const [settings, setSettings] = useState(DEFAULT_SETTINGS);

const [fee, setFee] = useState("100"); const [roundTripMiles, setRoundTripMiles] = useState("40"); const [costPerMile, setCostPerMile] = useState(DEFAULT_SETTINGS.costPerMile);

const [includePrinting, setIncludePrinting] = useState(true); const [pages, setPages] = useState("140"); const [sets, setSets] = useState("2"); const [costPerPage, setCostPerPage] = useState(DEFAULT_SETTINGS.costPerPage);

const [includeScanbacks, setIncludeScanbacks] = useState(false); const [scanbackCost, setScanbackCost] = useState(DEFAULT_SETTINGS.scanbackFee);

const [includeShipping, setIncludeShipping] = useState(false); const [shippingType, setShippingType] = useState("standard"); const [shippingCost, setShippingCost] = useState(DEFAULT_SETTINGS.shippingStandard);

useEffect(() => { const saved = localStorage.getItem("settings"); if (saved) { const parsed = JSON.parse(saved); setSettings(parsed); setCostPerMile(parsed.costPerMile); setCostPerPage(parsed.costPerPage); setScanbackCost(parsed.scanbackFee); } }, []);

const saveSettings = () => { localStorage.setItem("settings", JSON.stringify(settings)); setCostPerMile(settings.costPerMile); setCostPerPage(settings.costPerPage); setScanbackCost(settings.scanbackFee); };

const printingCost = useMemo(() => { return (parseFloat(pages) || 0) * (parseFloat(sets) || 0) * (parseFloat(costPerPage) || 0); }, [pages, sets, costPerPage]);

const values = useMemo(() => { const feeVal = parseFloat(fee) || 0; const miles = parseFloat(roundTripMiles) || 0; const mileage = miles * (parseFloat(costPerMile) || 0); const print = includePrinting ? printingCost : 0; const scan = includeScanbacks ? parseFloat(scanbackCost) || 0 : 0; const ship = includeShipping ? parseFloat(shippingCost) || 0 : 0;

const totalExpenses = mileage + print + scan + ship;
const net = feeVal - totalExpenses;

return { totalExpenses, net };

}, [fee, roundTripMiles, costPerMile, includePrinting, printingCost, includeScanbacks, scanbackCost, includeShipping, shippingCost]);

return ( <main style={{ padding: 20, fontFamily: "Arial" }}>

<h1>Notary Toolkit</h1>

  {/* TOOL SWITCH */}
  <div style={{ marginBottom: 20 }}>
    <button onClick={() => setActiveTool("fee")}>Fee Calculator</button>
    <button onClick={() => setActiveTool("rescission")}>Rescission 🔒</button>
    <button onClick={() => setShowSettings(!showSettings)}>⚙️ Settings</button>
  </div>

  {/* SETTINGS */}
  {showSettings && (
    <div style={{ border: "1px solid #ccc", padding: 15, marginBottom: 20 }}>
      <h2>Settings</h2>

      <label>Cost Per Mile</label>
      <input value={settings.costPerMile} onChange={(e)=>setSettings({...settings, costPerMile:e.target.value})}/>

      <label>Cost Per Page</label>
      <input value={settings.costPerPage} onChange={(e)=>setSettings({...settings, costPerPage:e.target.value})}/>

      <label>Scanback Fee</label>
      <input value={settings.scanbackFee} onChange={(e)=>setSettings({...settings, scanbackFee:e.target.value})}/>

      <button onClick={saveSettings}>Save</button>
    </div>
  )}

  {/* FEE CALCULATOR */}
  {activeTool === "fee" && (
    <div>
      <h2>Fee Calculator</h2>

      <label>Offered Fee</label>
      <input value={fee} onChange={(e)=>setFee(e.target.value)}/>

      <label>Miles</label>
      <input value={roundTripMiles} onChange={(e)=>setRoundTripMiles(e.target.value)}/>

      <label>Cost Per Mile</label>
      <input value={costPerMile} onChange={(e)=>setCostPerMile(e.target.value)}/>

      <hr/>

      <label>
        <input type="checkbox" checked={includePrinting} onChange={()=>setIncludePrinting(!includePrinting)}/>
        Printing
      </label>

      {includePrinting && (
        <div>
          <input value={pages} onChange={(e)=>setPages(e.target.value)} placeholder="pages"/>
          <input value={sets} onChange={(e)=>setSets(e.target.value)} placeholder="sets"/>
          <input value={costPerPage} onChange={(e)=>setCostPerPage(e.target.value)} placeholder="cost per page"/>
          <p>Printing Cost: {formatCurrency(printingCost)}</p>
        </div>
      )}

      <label>
        <input type="checkbox" checked={includeScanbacks} onChange={()=>setIncludeScanbacks(!includeScanbacks)}/>
        Scanbacks
      </label>

      {includeScanbacks && (
        <input value={scanbackCost} onChange={(e)=>setScanbackCost(e.target.value)}/>
      )}

      <label>
        <input type="checkbox" checked={includeShipping} onChange={()=>setIncludeShipping(!includeShipping)}/>
        Shipping
      </label>

      {includeShipping && (
        <input value={shippingCost} onChange={(e)=>setShippingCost(e.target.value)}/>
      )}

      <h3>Total Expenses: {formatCurrency(values.totalExpenses)}</h3>
      <h3>Net Profit: {formatCurrency(values.net)}</h3>
    </div>
  )}

  {/* RESCISSION LOCK */}
  {activeTool === "rescission" && (
    <div style={{ textAlign: "center" }}>
      {!isPro ? (
        <>
          <h2>Rescission Calculator 🔒</h2>
          <p>Never miss a deadline. Automatically calculates correct rescission dates.</p>
          <div style={{ filter: "blur(2px)", padding: 20, background: "#eee" }}>
            Example Tool Preview
          </div>
          <button onClick={()=>alert("Upgrade coming soon")}>Unlock Pro</button>
        </>
      ) : (
        <h2>Full Rescission Tool Coming</h2>
      )}
    </div>
  )}

</main>

); }
