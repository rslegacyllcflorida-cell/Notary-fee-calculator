import { useMemo, useState } from "react";

function formatMoney(value) {
  return "$" + Number(value || 0).toFixed(2);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function monthDay(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return month + "-" + day;
}

function nthWeekdayOfMonth(year, month, weekday, nth) {
  const first = new Date(year, month, 1);
  const firstWeekday = first.getDay();
  const offset = (weekday - firstWeekday + 7) % 7;
  return new Date(year, month, 1 + offset + (nth - 1) * 7);
}

function lastWeekdayOfMonth(year, month, weekday) {
  const last = new Date(year, month + 1, 0);
  const offset = (last.getDay() - weekday + 7) % 7;
  return new Date(year, month, last.getDate() - offset);
}

function getFederalHolidayDates(year) {
  return [
    "01-01", // New Year's Day
    "06-19", // Juneteenth
    "07-04", // Independence Day
    "11-11", // Veterans Day
    "12-25", // Christmas Day

    monthDay(nthWeekdayOfMonth(year, 0, 1, 3)),  // MLK Day
    monthDay(nthWeekdayOfMonth(year, 1, 1, 3)),  // Presidents Day
    monthDay(lastWeekdayOfMonth(year, 4, 1)),    // Memorial Day
    monthDay(nthWeekdayOfMonth(year, 8, 1, 1)),  // Labor Day
    monthDay(nthWeekdayOfMonth(year, 9, 1, 2)),  // Columbus Day
    monthDay(nthWeekdayOfMonth(year, 10, 4, 4)), // Thanksgiving
  ];
}

function isFederalHoliday(date) {
  return getFederalHolidayDates(date.getFullYear()).includes(monthDay(date));
}

function calculateRescission(signingDateValue) {
  if (!signingDateValue) return null;

  const signingDate = new Date(signingDateValue + "T00:00:00");
  if (Number.isNaN(signingDate.getTime())) return null;

  const timeline = [];
  timeline.push({
    date: new Date(signingDate),
    badge: "🚫",
    label: "Signing Date",
  });

  let current = addDays(signingDate, 1);
  let counted = 0;

  while (counted < 3) {
    if (current.getDay() === 0) {
      timeline.push({
        date: new Date(current),
        badge: "🚫",
        label: "Sunday (not counted)",
      });
    } else if (isFederalHoliday(current)) {
      timeline.push({
        date: new Date(current),
        badge: "🚫",
        label: "Federal Holiday (not counted)",
      });
    } else {
      counted += 1;
      timeline.push({
        date: new Date(current),
        badge: "✅",
        label: "Day " + counted,
      });
    }

    if (counted < 3) {
      current = addDays(current, 1);
    }
  }

  const deadline = new Date(current);
  const funding = addDays(deadline, 1);

  return {
    signingDate,
    deadline,
    funding,
    timeline,
  };
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("fees");

  const [fee, setFee] = useState(100);
  const [miles, setMiles] = useState(40);
  const [costPerMile, setCostPerMile] = useState(0.67);

  const [includePrinting, setIncludePrinting] = useState(true);
  const [pages, setPages] = useState(140);
  const [sets, setSets] = useState(2);
  const [costPerPage, setCostPerPage] = useState(0.06);

  const [includeScanbacks, setIncludeScanbacks] = useState(false);
  const [scanbackCost, setScanbackCost] = useState(10);

  const [includeShipping, setIncludeShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState(10);
  const [shippingType, setShippingType] = useState("standard");

  const [includeAdditionalCosts, setIncludeAdditionalCosts] = useState(false);
  const [additionalCosts, setAdditionalCosts] = useState(0);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const [signingDate, setSigningDate] = useState("");

  const feeCalc = useMemo(function () {
    const mileageCost = Number(miles || 0) * Number(costPerMile || 0);
    const printingCost = includePrinting
      ? Number(pages || 0) * Number(sets || 0) * Number(costPerPage || 0)
      : 0;
    const scanCost = includeScanbacks ? Number(scanbackCost || 0) : 0;
    const shipCost = includeShipping ? Number(shippingCost || 0) : 0;
    const extras = includeAdditionalCosts ? Number(additionalCosts || 0) : 0;

    const totalExpenses = mileageCost + printingCost + scanCost + shipCost + extras;
    const netProfit = Number(fee || 0) - totalExpenses;

    let rating = "Good Deal";
    if (netProfit < 20) rating = "Low Profit";
    else if (netProfit < 60) rating = "Fair Deal";

    return {
      mileageCost,
      printingCost,
      scanCost,
      shipCost,
      extras,
      totalExpenses,
      netProfit,
      rating,
    };
  }, [
    fee,
    miles,
    costPerMile,
    includePrinting,
    pages,
    sets,
    costPerPage,
    includeScanbacks,
    scanbackCost,
    includeShipping,
    shippingCost,
    includeAdditionalCosts,
    additionalCosts,
  ]);

  const rescission = useMemo(function () {
    return calculateRescission(signingDate);
  }, [signingDate]);

  const cardStyle = {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.06)",
  };

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #cbd5e1",
    borderRadius: 16,
    padding: 14,
    fontSize: 16,
    background: "white",
  };

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: "14px 16px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: 16,
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "white",
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.10)",
        }}
      >
        <section
          style={{
            background: "linear-gradient(135deg, #0f172a, #6d28d9)",
            color: "white",
            padding: 24,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#ddd6fe" }}>
            Notary Toolkit
          </div>
          <h1 style={{ margin: "10px 0 0", fontSize: 40, lineHeight: 1.05 }}>Notary Toolkit</h1>
          <p style={{ margin: "14px 0 0", maxWidth: 760, color: "#e2e8f0", lineHeight: 1.6 }}>
            Evaluate assignment profitability fast and calculate rescission dates in a cleaner, simpler workflow.
          </p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 22 }}>
            <button
              onClick={function () { setActiveTab("fees"); }}
              style={{
                border: activeTab === "fees" ? "1px solid white" : "1px solid rgba(255,255,255,0.25)",
                background: activeTab === "fees" ? "white" : "rgba(255,255,255,0.12)",
                color: activeTab === "fees" ? "#4c1d95" : "white",
                borderRadius: 14,
                padding: "12px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Fees
            </button>
            <button
              onClick={function () { setActiveTab("rescission"); }}
              style={{
                border: activeTab === "rescission" ? "1px solid white" : "1px solid rgba(255,255,255,0.25)",
                background: activeTab === "rescission" ? "white" : "rgba(255,255,255,0.12)",
                color: activeTab === "rescission" ? "#4c1d95" : "white",
                borderRadius: 14,
                padding: "12px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Rescission
            </button>
            <button
              onClick={function () { setActiveTab("settings"); }}
              style={{
                border: activeTab === "settings" ? "1px solid white" : "1px solid rgba(255,255,255,0.25)",
                background: activeTab === "settings" ? "white" : "rgba(255,255,255,0.12)",
                color: activeTab === "settings" ? "#4c1d95" : "white",
                borderRadius: 14,
                padding: "12px 16px",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Settings
            </button>
          </div>
        </section>

        <section style={{ padding: 24 }}>
          {activeTab === "fees" && (
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 24 }}>
              <div style={{ ...cardStyle, background: "#f8fafc" }}>
                <h2 style={{ margin: 0, fontSize: 32 }}>Signing Fee Calculator</h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
                  <label>
                    <div style={{ marginBottom: 8, fontWeight: 700 }}>Offered Fee</div>
                    <input style={inputStyle} type="number" value={fee} onChange={function (e) { setFee(Number(e.target.value)); }} />
                  </label>
                  <label>
                    <div style={{ marginBottom: 8, fontWeight: 700 }}>Round-Trip Miles</div>
                    <input style={inputStyle} type="number" value={miles} onChange={function (e) { setMiles(Number(e.target.value)); }} />
                  </label>
                  <label>
                    <div style={{ marginBottom: 8, fontWeight: 700 }}>Cost Per Mile</div>
                    <input style={inputStyle} type="number" step="0.01" value={costPerMile} onChange={function (e) { setCostPerMile(Number(e.target.value)); }} />
                  </label>
                </div>

                <div style={{ display: "grid", gap: 14, marginTop: 18 }}>
                  <label style={rowStyle}>
                    <span style={{ fontWeight: 700 }}>Include Printing</span>
                    <input type="checkbox" checked={includePrinting} onChange={function () { setIncludePrinting(!includePrinting); }} />
                  </label>
                  {includePrinting && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <label>
                        <div style={{ marginBottom: 8, fontWeight: 700 }}>Total Pages</div>
                        <input style={inputStyle} type="number" value={pages} onChange={function (e) { setPages(Number(e.target.value)); }} />
                      </label>
                      <label>
                        <div style={{ marginBottom: 8, fontWeight: 700 }}>Number of Sets</div>
                        <input style={inputStyle} type="number" value={sets} onChange={function (e) { setSets(Number(e.target.value)); }} />
                      </label>
                      <label>
                        <div style={{ marginBottom: 8, fontWeight: 700 }}>Cost Per Page</div>
                        <input style={inputStyle} type="number" step="0.01" value={costPerPage} onChange={function (e) { setCostPerPage(Number(e.target.value)); }} />
                      </label>
                    </div>
                  )}

                  <label style={rowStyle}>
                    <span style={{ fontWeight: 700 }}>Include Scanbacks</span>
                    <input type="checkbox" checked={includeScanbacks} onChange={function () { setIncludeScanbacks(!includeScanbacks); }} />
                  </label>
                  {includeScanbacks && (
                    <label>
                      <div style={{ marginBottom: 8, fontWeight: 700 }}>Scanback Cost</div>
                      <input style={inputStyle} type="number" value={scanbackCost} onChange={function (e) { setScanbackCost(Number(e.target.value)); }} />
                    </label>
                  )}

<label style={rowStyle}>
  <span style={{ fontWeight: 700 }}>Include Shipping</span>
  <input
    type="checkbox"
    checked={includeShipping}
    onChange={function () { setIncludeShipping(!includeShipping); }}
  />
</label>

{includeShipping && (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
    <label>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>Delivery Type</div>
      <select
        style={inputStyle}
        value={shippingType}
        onChange={function (e) {
          const value = e.target.value;
          setShippingType(value);

          if (value === "standard") setShippingCost(10);
          if (value === "expedited") setShippingCost(25);
          if (value === "overnight") setShippingCost(35);
        }}
      >
        <option value="standard">Standard</option>
        <option value="expedited">Expedited</option>
        <option value="overnight">Overnight</option>
      </select>
    </label>

    <label>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>Shipping Cost</div>
      <input
        style={inputStyle}
        type="number"
        value={shippingCost}
        onChange={function (e) { setShippingCost(Number(e.target.value)); }}
      />
    </label>
  </div>
)}

                <label style={rowStyle}>
  <span style={{ fontWeight: 700 }}>
    Include Additional Costs
    <span
      style={{
        marginLeft: 8,
        cursor: "pointer",
        border: "1px solid #ccc",
        borderRadius: "50%",
        padding: "2px 6px",
        fontSize: 12,
      }}
      onClick={function () {
        setShowAdditionalInfo(!showAdditionalInfo);
      }}
    >
      ⓘ
    </span>
  </span>

  <input
    type="checkbox"
    checked={includeAdditionalCosts}
    onChange={function () {
      setIncludeAdditionalCosts(!includeAdditionalCosts);
    }}
  />
</label>

{showAdditionalInfo && (
  <div
    style={{
      background: "#f8fafc",
      padding: 12,
      borderRadius: 12,
      fontSize: 13,
      marginTop: 6,
      lineHeight: 1.5,
      border: "1px solid #e2e8f0",
    }}
  >
    Examples: tolls, parking, waiting time, reprints, courier/drop-off costs, or other out-of-pocket expenses.
  </div>
)}

{includeAdditionalCosts && (
  <label>
    <div style={{ marginBottom: 8, fontWeight: 700 }}>Additional Costs</div>
    <input
      style={inputStyle}
      type="number"
      value={additionalCosts}
      onChange={function (e) {
        setAdditionalCosts(Number(e.target.value));
      }}
    />
  </label>
)}
                </div>
              </div>

              <div style={{ display: "grid", gap: 16 }}>
                <div style={{ ...cardStyle, background: "#faf5ff", borderColor: "#ddd6fe" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>Assignment Snapshot</div>
                  <div style={{ marginTop: 12, display: "inline-block", borderRadius: 999, padding: "10px 14px", fontWeight: 800, background: feeCalc.rating === "Good Deal" ? "#dcfce7" : feeCalc.rating === "Fair Deal" ? "#fef3c7" : "#ffe4e6", color: feeCalc.rating === "Good Deal" ? "#166534" : feeCalc.rating === "Fair Deal" ? "#92400e" : "#be123c" }}>
                    {feeCalc.rating}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div style={{ ...cardStyle, background: "#ecfdf5", borderColor: "#a7f3d0" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>Net Profit</div>
                    <h3 style={{ margin: "10px 0 0", fontSize: 34 }}>{formatMoney(feeCalc.netProfit)}</h3>
                  </div>
                  <div style={{ ...cardStyle, background: "#eff6ff", borderColor: "#bfdbfe" }}>
                    <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#64748b" }}>Total Expenses</div>
                    <h3 style={{ margin: "10px 0 0", fontSize: 34 }}>{formatMoney(feeCalc.totalExpenses)}</h3>
                  </div>
                </div>

                <div style={cardStyle}>
                  <h2 style={{ margin: 0, fontSize: 30 }}>Breakdown</h2>
                  <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                    <div style={rowStyle}><span>Fee</span><strong>{formatMoney(fee)}</strong></div>
                    <div style={rowStyle}><span>Mileage Cost</span><strong>{formatMoney(feeCalc.mileageCost)}</strong></div>
                    {includePrinting && <div style={rowStyle}><span>Printing</span><strong>{formatMoney(feeCalc.printingCost)}</strong></div>}
                    {includeScanbacks && <div style={rowStyle}><span>Scanbacks</span><strong>{formatMoney(feeCalc.scanCost)}</strong></div>}
                    {includeShipping && <div style={rowStyle}><span>Shipping</span><strong>{formatMoney(feeCalc.shipCost)}</strong></div>}
                    {includeAdditionalCosts && <div style={rowStyle}><span>Additional Costs</span><strong>{formatMoney(feeCalc.extras)}</strong></div>}
                    <div style={{ ...rowStyle, background: "#ede9fe" }}><span style={{ color: "#5b21b6" }}>Net Profit</span><strong style={{ color: "#5b21b6" }}>{formatMoney(feeCalc.netProfit)}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "rescission" && (
            <div style={{ maxWidth: 760, margin: "0 auto", display: "grid", gap: 16 }}>
              <div style={{ ...cardStyle, background: "#f8fafc" }}>
                <h2 style={{ margin: 0, fontSize: 30 }}>Rescission Calculator</h2>
                <p style={{ marginTop: 10, color: "#475569", lineHeight: 1.55 }}>
                  Simple calculator that skips Sundays and fixed federal holidays only.
                </p>
                <label>
                  <div style={{ marginBottom: 8, fontWeight: 700 }}>Signing Date</div>
                  <input style={inputStyle} type="date" value={signingDate} onChange={function (e) { setSigningDate(e.target.value); }} />
                </label>
              </div>

              {rescission && (
                <>
                  <div style={cardStyle}>
                    <h2 style={{ margin: 0, fontSize: 30 }}>Signing Date</h2>
                    <div style={{ ...rowStyle, marginTop: 16 }}>
                      <span>Signed On</span>
                      <strong>{formatDate(rescission.signingDate)}</strong>
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <h2 style={{ margin: 0, fontSize: 30 }}>Results</h2>
                    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                      <div style={rowStyle}>
                        <span>Rescission Deadline</span>
                        <strong>{formatDate(rescission.deadline)}</strong>
                      </div>
                      <div style={rowStyle}>
                        <span>Estimated Funding</span>
                        <strong>{formatDate(rescission.funding)}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={cardStyle}>
                    <h2 style={{ margin: 0, fontSize: 30 }}>Breakdown</h2>
                    <p style={{ marginTop: 10, color: "#475569" }}>How this was calculated</p>
                    <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                      {rescission.timeline.map(function (item, index) {
                        return (
                          <div key={index} style={rowStyle}>
                            <span>{formatDate(item.date)}</span>
                            <strong>{item.badge} {item.label}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ ...cardStyle, background: "#fffbeb", borderColor: "#fde68a", color: "#92400e" }}>
                    <p style={{ margin: 0, lineHeight: 1.55 }}>
                      This calculator is for convenience only and is not legal advice. Federal holidays and observed holiday dates may affect the rescission deadline. Please confirm the observed holiday date when a holiday falls near the signing date.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ maxWidth: 900, margin: "0 auto" }}>
              <div style={{ ...cardStyle, background: "#fcfcff" }}>
                <div style={{ margin: 0, color: "#7c3aed", fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                  Saved Defaults
                </div>
                <h2 style={{ margin: "8px 0 0", fontSize: 30 }}>Settings</h2>
                <p style={{ marginTop: 10, color: "#475569", lineHeight: 1.55 }}>
                  Keep your preferred defaults here. You can still change numbers inside the fee calculator whenever needed.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 18 }}>
                  <label>
                    <div style={{ marginBottom: 8, fontWeight: 700 }}>Default Cost Per Mile</div>
                    <input style={inputStyle} type="number" value={costPerMile} onChange={function (e) { setCostPerMile(Number(e.target.value)); }} />
                  </label>
                  <label>
                    <div style={{ marginBottom: 8, fontWeight: 700 }}>Default Cost Per Page</div>
                    <input style={inputStyle} type="number" value={costPerPage} onChange={function (e) { setCostPerPage(Number(e.target.value)); }} />
                  </label>
                  <label>
                    <div style={{ marginBottom: 8, fontWeight: 700 }}>Default Scanback Cost</div>
                    <input style={inputStyle} type="number" value={scanbackCost} onChange={function (e) { setScanbackCost(Number(e.target.value)); }} />
                  </label>
                  <label>
                    <div style={{ marginBottom: 8, fontWeight: 700 }}>Default Shipping Cost</div>
                    <input style={inputStyle} type="number" value={shippingCost} onChange={function (e) { setShippingCost(Number(e.target.value)); }} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
