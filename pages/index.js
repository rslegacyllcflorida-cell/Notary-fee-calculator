import { useEffect, useMemo, useState } from "react";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

const DEFAULT_SETTINGS = {
  costPerMile: "0.67",
  costPerPage: "0.06",
  scanbackFee: "10",
  shippingStandard: "10",
  shippingExpedited: "25",
  shippingOvernight: "35",
};

function getShippingEstimates(settings) {
  return {
    standard: Number(settings.shippingStandard) || 0,
    expedited: Number(settings.shippingExpedited) || 0,
    overnight: Number(settings.shippingOvernight) || 0,
  };
}

function isSunday(date) {
  return date.getDay() === 0;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatLongDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function calculateRescission(signingDateString) {
  if (!signingDateString) return null;

  const signingDate = new Date(`${signingDateString}T00:00:00`);
  if (Number.isNaN(signingDate.getTime())) return null;

  const days = [];
  let current = new Date(signingDate);
  let counted = 0;

  while (counted < 3) {
    const countedToday = !isSunday(current);

    days.push({
      date: new Date(current),
      counted: countedToday,
      label: countedToday ? `Day ${counted + 1}` : "Sunday (not counted)",
    });

    if (countedToday) counted += 1;
    if (counted < 3) current = addDays(current, 1);
  }

  const rescissionDeadline = days[days.length - 1].date;
  const estimatedFunding = addDays(rescissionDeadline, 1);

  return {
    rescissionDeadline,
    estimatedFunding,
    days,
  };
}

export default function Home() {
  const [activeTool, setActiveTool] = useState("fee");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [fee, setFee] = useState("100");
  const [roundTripMiles, setRoundTripMiles] = useState("40");
  const [costPerMile, setCostPerMile] = useState(DEFAULT_SETTINGS.costPerMile);

  const [includePrinting, setIncludePrinting] = useState(true);
  const [pages, setPages] = useState("140");
  const [sets, setSets] = useState("2");
  const [costPerPage, setCostPerPage] = useState(DEFAULT_SETTINGS.costPerPage);

  const [includeScanbacks, setIncludeScanbacks] = useState(false);
  const [scanbackCost, setScanbackCost] = useState(DEFAULT_SETTINGS.scanbackFee);

  const [includeShipping, setIncludeShipping] = useState(false);
  const [shippingType, setShippingType] = useState("standard");
  const [shippingCost, setShippingCost] = useState(DEFAULT_SETTINGS.shippingStandard);

  const [includeAdditionalCosts, setIncludeAdditionalCosts] = useState(false);
  const [additionalCosts, setAdditionalCosts] = useState("0");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const [signingDate, setSigningDate] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = window.localStorage.getItem("notary-toolkit-settings");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      setSettings(merged);
      setCostPerMile(merged.costPerMile);
      setCostPerPage(merged.costPerPage);
      setScanbackCost(merged.scanbackFee);
      setShippingCost(merged.shippingStandard);
    } catch (error) {
      console.error("Could not load saved settings", error);
    }
  }, []);

  const saveSettings = () => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      "notary-toolkit-settings",
      JSON.stringify(settings)
    );

    setCostPerMile(settings.costPerMile);
    setCostPerPage(settings.costPerPage);
    setScanbackCost(settings.scanbackFee);

    const estimates = getShippingEstimates(settings);
    setShippingCost(String(estimates[shippingType] || 0));

    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 1500);
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setCostPerMile(DEFAULT_SETTINGS.costPerMile);
    setCostPerPage(DEFAULT_SETTINGS.costPerPage);
    setScanbackCost(DEFAULT_SETTINGS.scanbackFee);
    setShippingCost(DEFAULT_SETTINGS.shippingStandard);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "notary-toolkit-settings",
        JSON.stringify(DEFAULT_SETTINGS)
      );
    }
  };

  const handleShippingToggle = () => {
    const next = !includeShipping;
    setIncludeShipping(next);

    if (next) {
      const estimates = getShippingEstimates(settings);
      setShippingCost(String(estimates[shippingType] || 0));
    }
  };

  const handleShippingTypeChange = (value) => {
    setShippingType(value);
    const estimates = getShippingEstimates(settings);
    setShippingCost(String(estimates[value] || 0));
  };

  const printingCost = useMemo(() => {
    const pageCount = parseFloat(pages) || 0;
    const setCount = parseFloat(sets) || 0;
    const pageRate = parseFloat(costPerPage) || 0;
    return pageCount * setCount * pageRate;
  }, [pages, sets, costPerPage]);

  const feeValues = useMemo(() => {
    const totalFee = parseFloat(fee) || 0;
    const miles = parseFloat(roundTripMiles) || 0;
    const mileageRate = parseFloat(costPerMile) || 0;
    const printCost = includePrinting ? printingCost : 0;
    const scanCost = includeScanbacks ? parseFloat(scanbackCost) || 0 : 0;
    const shipCost = includeShipping ? parseFloat(shippingCost) || 0 : 0;
    const extraCost = includeAdditionalCosts ? parseFloat(additionalCosts) || 0 : 0;

    const mileageCost = miles * mileageRate;
    const totalExpenses = mileageCost + printCost + scanCost + shipCost + extraCost;
    const netProfit = totalFee - totalExpenses;
    const profitPerMile = miles > 0 ? netProfit / miles : 0;

    let rating = "Good Deal";
    let ratingClass = "good";

    if (netProfit < 20) {
      rating = "Low Profit";
      ratingClass = "bad";
    } else if (netProfit < 60) {
      rating = "Fair Deal";
      ratingClass = "warn";
    }

    return {
      totalFee,
      mileageCost,
      printCost,
      scanCost,
      shipCost,
      extraCost,
      totalExpenses,
      netProfit,
      profitPerMile,
      rating,
      ratingClass,
    };
  }, [
    fee,
    roundTripMiles,
    costPerMile,
    includePrinting,
    printingCost,
    includeScanbacks,
    scanbackCost,
    includeShipping,
    shippingCost,
    includeAdditionalCosts,
    additionalCosts,
  ]);

  const rescission = useMemo(() => calculateRescission(signingDate), [signingDate]);

  return (
    <main className="page">
      <div className="card">
        <section className="hero">
          <div className="heroTop">
            <div>
              <p className="eyebrow">NOTARY TOOLKIT</p>
              <h1>Notary Toolkit</h1>
              <p className="heroText">
                Evaluate assignment profitability fast, save your usual cost
                assumptions, and calculate rescission dates in seconds.
              </p>
            </div>

            <button
              type="button"
              className="settingsButton"
              onClick={() => setShowSettings(!showSettings)}
            >
              ⚙️ {showSettings ? "Close Settings" : "Settings"}
            </button>
          </div>

          <div className="toolTabs">
            <button
              type="button"
              className={`tabButton ${activeTool === "fee" ? "tabActive" : ""}`}
              onClick={() => setActiveTool("fee")}
            >
              Fee Calculator
            </button>
            <button
              type="button"
              className={`tabButton ${activeTool === "rescission" ? "tabActive" : ""}`}
              onClick={() => setActiveTool("rescission")}
            >
              Rescission
            </button>
          </div>
        </section>

        {showSettings && (
          <section className="settingsPanel">
            <p className="settingsEyebrow">Saved Defaults</p>
            <h2 className="sectionTitle">Settings</h2>
            <p className="settingsText">
              Save your usual assumptions here. The fee calculator will use
              these values as starting points, but you can still change them per assignment.
            </p>

            <div className="settingsGrid">
              <div className="settingsCard">
                <h3>Mileage Defaults</h3>
                <label>
                  <span>Default Cost Per Mile</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={settings.costPerMile}
                    onChange={(e) =>
                      setSettings({ ...settings, costPerMile: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="settingsCard">
                <h3>Printing Defaults</h3>
                <label>
                  <span>Default Cost Per Page</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={settings.costPerPage}
                    onChange={(e) =>
                      setSettings({ ...settings, costPerPage: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="settingsCard">
                <h3>Scanback Defaults</h3>
                <label>
                  <span>Default Scanback Fee</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={settings.scanbackFee}
                    onChange={(e) =>
                      setSettings({ ...settings, scanbackFee: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="settingsCard">
                <h3>Shipping Defaults</h3>
                <div className="miniGrid">
                  <label>
                    <span>Standard</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={settings.shippingStandard}
                      onChange={(e) =>
                        setSettings({ ...settings, shippingStandard: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span>Expedited</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={settings.shippingExpedited}
                      onChange={(e) =>
                        setSettings({ ...settings, shippingExpedited: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    <span>Overnight</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={settings.shippingOvernight}
                      onChange={(e) =>
                        setSettings({ ...settings, shippingOvernight: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="settingsActions">
              <button type="button" className="primaryBtn" onClick={saveSettings}>
                {settingsSaved ? "Saved" : "Save Settings"}
              </button>
              <button type="button" className="secondaryBtn" onClick={resetSettings}>
                Reset to Defaults
              </button>
            </div>
          </section>
        )}

        <section className="contentWrap">
          {activeTool === "fee" && (
            <div className="contentGrid">
              <div className="panel softPanel">
                <h2 className="sectionTitle">Fee Calculator</h2>

                <div className="formGrid">
                  <label>
                    <span>Offered Fee</span>
                    <small className="fieldHint">
                      What the company is offering for this assignment
                    </small>
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
                </div>

                <div className="toggleSection">
                  <label className="toggleRow">
                    <input
                      type="checkbox"
                      checked={includePrinting}
                      onChange={() => setIncludePrinting(!includePrinting)}
                    />
                    <span>Include Printing</span>
                  </label>

                  {includePrinting && (
                    <div className="subGrid">
                      <label>
                        <span>Total Pages</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={pages}
                          onChange={(e) => setPages(e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Number of Sets</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={sets}
                          onChange={(e) => setSets(e.target.value)}
                        />
                      </label>
                      <label>
                        <span>Cost Per Page</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={costPerPage}
                          onChange={(e) => setCostPerPage(e.target.value)}
                        />
                      </label>
                      <div className="calcPreview">
                        <span>Estimated Printing Cost</span>
                        <strong>{formatCurrency(printingCost)}</strong>
                      </div>
                    </div>
                  )}

                  <label className="toggleRow">
                    <input
                      type="checkbox"
                      checked={includeScanbacks}
                      onChange={() => setIncludeScanbacks(!includeScanbacks)}
                    />
                    <span>Include Scanbacks</span>
                  </label>

                  {includeScanbacks && (
                    <label>
                      <span>Scanback Cost</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={scanbackCost}
                        onChange={(e) => setScanbackCost(e.target.value)}
                      />
                    </label>
                  )}

                  <label className="toggleRow">
                    <input
                      type="checkbox"
                      checked={includeShipping}
                      onChange={handleShippingToggle}
                    />
                    <span>Include Shipping</span>
                  </label>

                  {includeShipping && (
                    <div className="subGrid">
                      <label>
                        <span>Delivery Type</span>
                        <select
                          value={shippingType}
                          onChange={(e) => handleShippingTypeChange(e.target.value)}
                        >
                          <option value="standard">Standard</option>
                          <option value="expedited">Expedited</option>
                          <option value="overnight">Overnight</option>
                        </select>
                      </label>

                      <label>
                        <span>Shipping Cost</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={shippingCost}
                          onChange={(e) => setShippingCost(e.target.value)}
                        />
                      </label>
                    </div>
                  )}

                  <div className="additionalHeader">
                    <label className="toggleRow grow">
                      <input
                        type="checkbox"
                        checked={includeAdditionalCosts}
                        onChange={() =>
                          setIncludeAdditionalCosts(!includeAdditionalCosts)
                        }
                      />
                      <span>Include Additional Costs</span>
                    </label>
                    <button
                      type="button"
                      className="secondaryBtn"
                      onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                    >
                      {showAdditionalInfo ? "Hide examples" : "What counts?"}
                    </button>
                  </div>

                  {showAdditionalInfo && (
                    <div className="infoBox">
                      <ul>
                        <li>Tolls</li>
                        <li>Parking fees</li>
                        <li>Extra time or waiting time</li>
                        <li>Printing corrections or reprints</li>
                        <li>Document drop-off or courier-related costs</li>
                        <li>Last-minute expenses not covered elsewhere</li>
                      </ul>
                    </div>
                  )}

                  {includeAdditionalCosts && (
                    <label>
                      <span>Additional Costs</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={additionalCosts}
                        onChange={(e) => setAdditionalCosts(e.target.value)}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="rightCol">
                <div className="panel snapshotPanel">
                  <p className="label">Assignment Snapshot</p>
                  <div className={`pill ${feeValues.ratingClass}`}>{feeValues.rating}</div>
                  <p className="snapshotText">
                    Based on your offered fee and estimated job-related costs.
                  </p>
                </div>

                <div className="statsGrid">
                  <div className="statCard statProfit">
                    <p className="label">Net Profit</p>
                    <h3>{formatCurrency(feeValues.netProfit)}</h3>
                  </div>
                  <div className="statCard statExpense">
                    <p className="label">Total Expenses</p>
                    <h3>{formatCurrency(feeValues.totalExpenses)}</h3>
                  </div>
                </div>

                <div className="panel">
                  <h2 className="sectionTitle">Breakdown</h2>
                  <div className="rows">
                    <div className="row"><span>Fee</span><strong>{formatCurrency(feeValues.totalFee)}</strong></div>
                    <div className="row"><span>Mileage Cost</span><strong>{formatCurrency(feeValues.mileageCost)}</strong></div>
                    {includePrinting && <div className="row"><span>Printing</span><strong>{formatCurrency(feeValues.printCost)}</strong></div>}
                    {includeScanbacks && <div className="row"><span>Scanbacks</span><strong>{formatCurrency(feeValues.scanCost)}</strong></div>}
                    {includeShipping && <div className="row"><span>Shipping</span><strong>{formatCurrency(feeValues.shipCost)}</strong></div>}
                    {includeAdditionalCosts && <div className="row"><span>Additional Costs</span><strong>{formatCurrency(feeValues.extraCost)}</strong></div>}
                    <div className="row highlight"><span>Profit Per Mile</span><strong>{formatCurrency(feeValues.profitPerMile)}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTool === "rescission" && (
            <div className="rescissionWrap">
              <div className="panel softPanel">
                <h2 className="sectionTitle">Rescission Calculator</h2>
                <p className="fieldHint">
                  Counts three business days excluding Sundays. Federal holidays can be added next.
                </p>

                <label>
                  <span>Signing Date</span>
                  <input
                    type="date"
                    value={signingDate}
                    onChange={(e) => setSigningDate(e.target.value)}
                  />
                </label>
              </div>

              {rescission && (
                <div className="panel" style={{ marginTop: 16 }}>
                  <h2 className="sectionTitle">Results</h2>
                  <div className="rows">
                    <div className="row">
                      <span>Rescission Deadline</span>
                      <strong>{formatLongDate(rescission.rescissionDeadline)}</strong>
                    </div>
                    <div className="row">
                      <span>Estimated Funding</span>
                      <strong>{formatLongDate(rescission.estimatedFunding)}</strong>
                    </div>
                  </div>

                  <div className="rows" style={{ marginTop: 16 }}>
                    {rescission.days.map((d, i) => (
                      <div className="row" key={i}>
                        <span>{formatLongDate(d.date)}</span>
                        <strong>{d.label}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 24px 16px;
        }

        .card {
          max-width: 1120px;
          margin: 0 auto;
          background: white;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12);
        }

        .hero {
          background: linear-gradient(135deg, #0f172a, #6d28d9);
          color: white;
          padding: 32px 24px 24px;
        }

        .heroTop {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }

        .eyebrow,
        .settingsEyebrow,
        .label {
          margin: 0 0 10px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #ddd6fe;
        }

        .label {
          color: #64748b;
          margin-bottom: 0;
        }

        h1 {
          margin: 0;
          font-size: 42px;
          line-height: 1.05;
        }

        .heroText,
        .settingsText,
        .fieldHint,
        .snapshotText {
          line-height: 1.55;
        }

        .heroText {
          margin: 14px 0 0;
          max-width: 760px;
          font-size: 17px;
          color: #e2e8f0;
        }

        .settingsButton,
        .tabButton,
        .primaryBtn,
        .secondaryBtn {
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .settingsButton,
        .tabButton {
          border: 1px solid rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.12);
          color: white;
        }

        .tabActive {
          background: white;
          color: #4c1d95;
          border-color: white;
        }

        .toolTabs {
          display: flex;
          gap: 10px;
          margin-top: 22px;
          flex-wrap: wrap;
        }

        .settingsPanel,
        .contentWrap {
          padding: 24px;
        }

        .settingsPanel {
          border-bottom: 1px solid #e2e8f0;
          background: #fcfcff;
        }

        .sectionTitle {
          margin: 0;
          font-size: 30px;
          line-height: 1.1;
          color: #0f172a;
        }

        .settingsText,
        .fieldHint,
        .snapshotText {
          color: #475569;
        }

        .settingsGrid,
        .contentGrid {
          display: grid;
          gap: 16px;
        }

        .settingsGrid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-top: 18px;
        }

        .contentGrid {
          grid-template-columns: 1.05fr 0.95fr;
          gap: 24px;
        }

        .settingsCard,
        .panel {
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          padding: 20px;
          background: white;
        }

        .softPanel {
          background: #f8fafc;
        }

        .miniGrid,
        .formGrid,
        .subGrid,
        .statsGrid {
          display: grid;
          gap: 14px;
        }

        .miniGrid {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .formGrid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          margin-top: 18px;
        }

        .subGrid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
          padding-left: 8px;
        }

        .statsGrid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }

        .settingsActions,
        .additionalHeader {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        .primaryBtn {
          border: none;
          background: #6d28d9;
          color: white;
        }

        .secondaryBtn {
          border: 1px solid #cbd5e1;
          background: white;
          color: #334155;
        }

        .toggleSection,
        .rightCol,
        .rows {
          display: grid;
          gap: 14px;
        }

        .toggleRow,
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 16px;
          background: white;
          border: 1px solid #e2e8f0;
        }

        .grow {
          flex: 1;
        }

        .row {
          background: #f8fafc;
          font-size: 15px;
        }

        .highlight {
          background: #ede9fe;
        }

        .infoBox,
        .calcPreview,
        .snapshotPanel,
        .statProfit,
        .statExpense {
          border-radius: 18px;
          padding: 16px;
        }

        .infoBox {
          border: 1px solid #dbeafe;
          background: #eff6ff;
          color: #1e3a8a;
        }

        .calcPreview {
          border: 1px solid #ddd6fe;
          background: #faf5ff;
        }

        .snapshotPanel {
          border: 1px solid #ddd6fe;
          background: #faf5ff;
        }

        .statProfit {
          border: 1px solid #a7f3d0;
          background: #ecfdf5;
        }

        .statExpense {
          border: 1px solid #bfdbfe;
          background: #eff6ff;
        }

        .pill {
          display: inline-block;
          margin-top: 12px;
          border-radius: 999px;
          padding: 10px 14px;
          font-size: 15px;
          font-weight: 800;
        }

        .good {
          background: #dcfce7;
          color: #166534;
        }

        .warn {
          background: #fef3c7;
          color: #92400e;
        }

        .bad {
          background: #ffe4e6;
          color: #be123c;
        }

        label span {
          display: block;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 700;
          color: #334155;
        }

        input,
        select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 14px;
          padding: 14px 15px;
          font-size: 16px;
          background: white;
          outline: none;
        }

        input:focus,
        select:focus {
          border-color: #7c3aed;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.12);
        }

        .rescissionWrap {
          max-width: 760px;
          margin: 0 auto;
        }

        @media (max-width: 900px) {
          .heroTop,
          .settingsGrid,
          .contentGrid {
            display: flex;
            flex-direction: column;
          }
        }

        @media (max-width: 640px) {
          .page {
            padding: 12px;
          }

          .hero,
          .settingsPanel,
          .contentWrap {
            padding: 18px;
          }

          h1 {
            font-size: 34px;
          }

          .toolTabs,
          .settingsActions,
          .additionalHeader,
          .formGrid,
          .subGrid,
          .statsGrid,
          .miniGrid {
            display: flex;
            flex-direction: column;
          }

          .row,
          .toggleRow {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
					}
