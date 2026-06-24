import { useEffect, useMemo, useRef, useState } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const todayISO = () => toISO(new Date());

const sources = {
  bmi: [
    ["NICE NG246", "https://www.nice.org.uk/guidance/ng246/chapter/Identifying-and-assessing-overweight-obesity-and-central-adiposity"],
    ["NHS BMI", "https://www.nhs.uk/common-health-questions/lifestyle/what-is-the-body-mass-index-bmi/"]
  ],
  rx: [
    ["NHSBSA FAQ", "https://faq.nhsbsa.nhs.uk/knowledgebase/article/KA-01561/en-us"],
    ["NHS.uk", "https://www.nhs.uk/common-health-questions/medicines/how-long-is-a-prescription-valid-for/"],
    ["CPE Apr 2026", "https://cpe.org.uk/wp-content/uploads/2025/10/Dispensing-CDs-factsheet-April-26.pdf"]
  ],
  emergency: [
    ["CPE Emergency Supply Spec", "https://cpe.org.uk/wp-content/uploads/2018/07/269177-Service-Spec-2018-2021.pdf"],
    ["Misuse of Drugs Regs 2001", "https://www.legislation.gov.uk/uksi/2001/3998/contents"]
  ],
  fertility: [
    ["FSRH Fertility Awareness", "https://www.fsrh.org/standards-and-guidance/documents/ceuguidancefertilityawarenessmethods/"],
    ["NHS Planning pregnancy", "https://www.nhs.uk/pregnancy/trying-for-a-baby/planning-your-pregnancy/"]
  ],
  crcl: [
    ["NHS SPS Kidney function", "https://www.sps.nhs.uk/articles/calculating-kidney-function/"],
    ["NHS SPS DOAC monitoring", "https://www.sps.nhs.uk/monitorings/doacs-direct-oral-anticoagulants-monitoring/"]
  ],
  bnf: [["BNF online", "https://bnf.nice.org.uk/"]],
  bnfc: [["BNF for Children", "https://bnfc.nice.org.uk/"]],
  dueDate: [
    ["NHS Due Date Calculator", "https://www.nhs.uk/pregnancy/finding-out/due-date-calculator/"],
    ["NICE CG62", "https://www.nice.org.uk/guidance/cg62"]
  ],
  alcohol: [
    ["NHS Alcohol units", "https://www.nhs.uk/live-well/alcohol-advice/calculating-alcohol-units/"],
    ["UK CMO Guidelines", "https://www.gov.uk/government/publications/alcohol-consumption-advice-on-low-risk-drinking"]
  ],
  smoking: [
    ["NICE NG209", "https://www.nice.org.uk/guidance/ng209"],
    ["NHS Stop Smoking", "https://www.nhs.uk/better-health/quit-smoking/find-your-local-stop-smoking-service/"]
  ]
};

function toISO(date) {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fromISO(value) {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date, months) {
  const d = new Date(date);
  const originalDay = d.getDate();
  d.setMonth(d.getMonth() + months);
  if (d.getDate() !== originalDay) d.setDate(0);
  return d;
}

function diffDays(a, b) {
  const first = new Date(a);
  const second = new Date(b);
  first.setHours(0, 0, 0, 0);
  second.setHours(0, 0, 0, 0);
  return Math.floor((first - second) / 86400000);
}

// All dates render DD/MM/YYYY (never locale digits like 年/月/日). Weekday on by default.
function fmtDate(date, weekday = true) {
  if (!date) return "";
  const d = new Date(date);
  const core = fmtShort(d);
  return weekday ? `${core}, ${DAYS[d.getDay()]}` : core;
}

function fmtShort(date) {
  if (!date) return "";
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function n(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberText(value, decimals = 1) {
  return Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function ClipboardIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function NumberField({ label, value, onChange, unit, min, max, step = "any", className = "" }) {
  const [touched, setTouched] = useState(false);
  const numeric = value === "" ? null : Number(value);
  const invalid =
    touched &&
    value !== "" &&
    ((min !== undefined && numeric < min) || (max !== undefined && numeric > max) || Number.isNaN(numeric));

  return (
    <label className={`field-group ${className}`}>
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        <input
          className="field-input"
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.]?[0-9]*"
          autoComplete="off"
          enterKeyHint="done"
          value={value}
          aria-invalid={invalid ? "true" : "false"}
          data-step={step}
          onBlur={() => setTouched(true)}
          onChange={(event) => {
            const next = event.target.value.trim();
            if (/^\d*\.?\d*$/.test(next)) onChange(next);
          }}
        />
        {unit ? <span className="input-unit">{unit}</span> : null}
      </span>
      {invalid ? (
        <span className="field-error">
          Must be {min !== undefined ? `at least ${min}` : ""}{min !== undefined && max !== undefined ? " and " : ""}
          {max !== undefined ? `no more than ${max}` : ""}.
        </span>
      ) : null}
    </label>
  );
}

function DateField({ label, value, onChange, todayButton = true }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => fromISO(value) || new Date());
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const display = value ? fmtDate(fromISO(value)) : "";
  return (
    <div className="field-group" ref={ref}>
      {label ? <span className="field-label">{label}</span> : null}
      <span className="input-wrap">
        <button
          type="button"
          className="field-input date-display"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => {
            setView(fromISO(value) || new Date());
            setOpen((current) => !current);
          }}
        >
          {display || <span className="muted">DD/MM/YYYY</span>}
        </button>
        {todayButton ? (
          <button className="today-btn" type="button" onClick={() => onChange(todayISO())}>
            Today
          </button>
        ) : null}
      </span>
      {open ? (
        <CalendarPopover
          view={view}
          setView={setView}
          value={value}
          onPick={(date) => {
            onChange(toISO(date));
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function CalendarPopover({ view, setView, value, onPick }) {
  const year = view.getFullYear();
  const month = view.getMonth();
  const today = todayISO();
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7; // Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));

  return (
    <div className="dp-pop" role="dialog" aria-label="Choose date">
      <div className="dp-head">
        <button type="button" className="dp-nav" aria-label="Previous month" onClick={() => setView(new Date(year, month - 1, 1))}>
          ‹
        </button>
        <span className="dp-title">{MONTHS[month]} {year}</span>
        <button type="button" className="dp-nav" aria-label="Next month" onClick={() => setView(new Date(year, month + 1, 1))}>
          ›
        </button>
      </div>
      <div className="dp-grid">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span className="dp-dow" key={i}>{d}</span>
        ))}
        {cells.map((date, i) =>
          date ? (
            <button
              type="button"
              key={i}
              className={`dp-cell ${toISO(date) === value ? "sel" : ""} ${toISO(date) === today ? "today" : ""}`}
              onClick={() => onPick(date)}
            >
              {date.getDate()}
            </button>
          ) : (
            <span className="dp-cell empty" key={i} />
          )
        )}
      </div>
      <div className="dp-foot">
        <button type="button" onClick={() => onPick(new Date())}>Today</button>
      </div>
    </div>
  );
}

function Segmented({ options, value, onChange, ariaLabel }) {
  return (
    <div className="unit-toggle" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`unit-btn ${value === option.value ? "active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SubTabs({ items, active, onChange }) {
  return (
    <div className="sub-tabs" role="tablist">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={`sub-tab-btn ${active === item ? "active" : ""}`}
          role="tab"
          aria-selected={active === item}
          onClick={() => {
            onChange(item);
            window.scrollTo({ top: 0, behavior: "auto" });
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Badge({ tone = "info", children }) {
  return <span className={`status-badge badge-${tone}`}>{children}</span>;
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className={`copy-btn ${copied ? "copied" : ""}`}
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          setCopied(false);
        }
      }}
      aria-label="Copy result"
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function SourceLinks({ links }) {
  return (
    <div className="result-source">
      {links.map(([label, href], index) => (
        <span className="source-item" key={href}>
          {index > 0 ? <span className="result-source-sep">|</span> : null}
          <a href={href} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        </span>
      ))}
    </div>
  );
}

function ResultBlock({ badge, tone = "info", label, value, sub, links = [], copyText, children }) {
  if (!value && !children) return null;
  return (
    <section className="result-block" aria-live="polite">
      <div className="result-header">
        {badge ? <Badge tone={tone}>{badge}</Badge> : <span />}
        {copyText ? <CopyButton text={copyText} /> : null}
      </div>
      {label ? <div className="result-label">{label}</div> : null}
      {value ? <div className={`result-value text-${tone}`}>{value}</div> : null}
      {sub ? <div className="result-sub">{sub}</div> : null}
      {children}
      {links.length ? <SourceLinks links={links} /> : null}
    </section>
  );
}

function Notice({ tone = "info", children }) {
  return <div className={`notice-banner notice-${tone}`}>{children}</div>;
}

function Disclaimer({ links = sources.bnf }) {
  return (
    <div className="disclaimer">
      <span className="info-mark">i</span>
      <span>
        Decision-support tool only. Verify results with BNF, NICE, FSRH or local SOPs. Not a substitute for professional
        judgement.
        {links.length ? " " : null}
        {links.map(([label, href], index) => (
          <span key={href}>
            {index ? " | " : ""}
            <a href={href} target="_blank" rel="noopener noreferrer">
              {label}
            </a>
          </span>
        ))}
      </span>
    </div>
  );
}

function App() {
  const tabs = ["BMI", "Dates", "Fertility", "Clinical", "Patient", "Dosing"];
  const [activeTab, setActiveTab] = useState("BMI");

  // On section switch, jump back to the top of the page.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [activeTab]);

  return (
    <div className="app-shell">
      <header className="header">
        <span className="logo">PharmaCalc</span>
        <div className="header-right">
          <button className="help-btn" type="button" title="Help" aria-label="Help">
            ?
          </button>
        </div>
      </header>
      <nav className="tab-bar" aria-label="Main tools">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>
      {/* Each tab is mounted fresh on switch, so its inputs reset automatically. */}
      <main className="content">
        {activeTab === "BMI" ? <BmiTab /> : null}
        {activeTab === "Dates" ? <DatesTab /> : null}
        {activeTab === "Fertility" ? <FertilityTab /> : null}
        {activeTab === "Clinical" ? <ClinicalTab /> : null}
        {activeTab === "Patient" ? <PatientTab /> : null}
        {activeTab === "Dosing" ? <DosingTab /> : null}
      </main>
    </div>
  );
}

function BmiTab() {
  const [heightMode, setHeightMode] = useState("ftin"); // ft/in is the common UK input
  const [weightMode, setWeightMode] = useState("kg");
  const [ethnic, setEthnic] = useState(false);
  const [heightCm, setHeightCm] = useState("");
  const [feet, setFeet] = useState("");
  const [inches, setInches] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [stone, setStone] = useState("");
  const [pounds, setPounds] = useState("");

  const result = useMemo(() => {
    const hM = heightMode === "cm" ? n(heightCm) / 100 : (n(feet) * 12 + n(inches)) * 0.0254;
    const wKg = weightMode === "kg" ? n(weightKg) : (n(stone) * 14 + n(pounds)) * 0.453592;
    if (!hM || !wKg || hM < 0.5 || wKg < 10) return null;
    const bmi = wKg / (hM * hM);
    let category = "Healthy weight";
    let tone = "valid";

    if (ethnic) {
      if (bmi < 18.5) [category, tone] = ["Underweight", "warn"];
      else if (bmi < 23) [category, tone] = ["Healthy weight", "valid"];
      else if (bmi < 27.5) [category, tone] = ["Overweight", "warn"];
      else [category, tone] = ["Obese", "error"];
    } else if (bmi < 18.5) [category, tone] = ["Underweight", "warn"];
    else if (bmi < 25) [category, tone] = ["Healthy weight", "valid"];
    else if (bmi < 30) [category, tone] = ["Overweight", "warn"];
    else if (bmi < 35) [category, tone] = ["Obese class I", "error"];
    else if (bmi < 40) [category, tone] = ["Obese class II", "error"];
    else [category, tone] = ["Obese class III", "error"];

    return { bmi: bmi.toFixed(1), category, tone };
  }, [ethnic, feet, heightCm, heightMode, inches, pounds, stone, weightKg, weightMode]);

  return (
    <>
      <section className="card">
        <div className="card-title">BMI Calculator</div>
        <div className="label-with-control">
          <span className="field-label">Height</span>
          <Segmented
            ariaLabel="Height unit"
            value={heightMode}
            onChange={setHeightMode}
            options={[
              { value: "cm", label: "cm" },
              { value: "ftin", label: "ft / in" }
            ]}
          />
        </div>
        {heightMode === "cm" ? (
          <NumberField label="" value={heightCm} onChange={setHeightCm} unit="cm" min={50} max={250} />
        ) : (
          <div className="field-row">
            <NumberField label="Feet" value={feet} onChange={setFeet} unit="ft" min={1} max={8} />
            <NumberField label="Inches" value={inches} onChange={setInches} unit="in" min={0} max={11.9} />
          </div>
        )}

        <div className="label-with-control">
          <span className="field-label">Weight</span>
          <Segmented
            ariaLabel="Weight unit"
            value={weightMode}
            onChange={setWeightMode}
            options={[
              { value: "kg", label: "kg" },
              { value: "stlb", label: "st / lb" }
            ]}
          />
        </div>
        {weightMode === "kg" ? (
          <NumberField label="" value={weightKg} onChange={setWeightKg} unit="kg" min={10} max={350} />
        ) : (
          <div className="field-row">
            <NumberField label="Stone" value={stone} onChange={setStone} unit="st" min={1} max={55} />
            <NumberField label="Pounds" value={pounds} onChange={setPounds} unit="lb" min={0} max={13.9} />
          </div>
        )}

        <label className="check-row">
          <input type="checkbox" checked={ethnic} onChange={(event) => setEthnic(event.target.checked)} />
          <span>
            Use NICE ethnic minority thresholds
            <small>Overweight at BMI 23, obesity at BMI 27.5.</small>
          </span>
        </label>

        {result ? (
          <ResultBlock
            badge={result.category.toUpperCase()}
            tone={result.tone}
            label="BMI"
            value={result.bmi}
            sub={`${result.category}${ethnic ? " - ethnic thresholds active" : ""}`}
            links={sources.bmi}
            copyText={`BMI: ${result.bmi} - ${result.category}`}
          />
        ) : (
          <EmptyResult label="BMI" />
        )}

        <Notice>
          BMI is not suitable for pregnant women, high muscle mass, or under 18s. Use clinical judgement and appropriate
          paediatric centile charts.
        </Notice>
        <button className="clear-btn" type="button" onClick={() => {
          setHeightCm(""); setFeet(""); setInches(""); setWeightKg(""); setStone(""); setPounds(""); setEthnic(false);
        }}>
          Clear
        </button>
      </section>
      <Disclaimer links={sources.bmi} />
    </>
  );
}

function EmptyResult({ label }) {
  return (
    <section className="result-block empty">
      <div className="result-label">{label}</div>
      <div className="result-value muted">--</div>
    </section>
  );
}

function DatesTab() {
  const [sub, setSub] = useState("Rx Validity");
  return (
    <>
      <section className="card">
        <SubTabs items={["Rx Validity", "Mixed FP10", "Emergency Supply", "Age", "Duration"]} active={sub} onChange={setSub} />
        {sub === "Rx Validity" ? <RxValidity /> : null}
        {sub === "Mixed FP10" ? <MixedFp10 /> : null}
        {sub === "Emergency Supply" ? <EmergencySupply /> : null}
        {sub === "Age" ? <AgeTool /> : null}
        {sub === "Duration" ? <DurationTool /> : null}
      </section>
      <Disclaimer links={sources.rx} />
    </>
  );
}

function AgeTool() {
  const [dob, setDob] = useState(todayISO());
  const result = useMemo(() => {
    const birth = fromISO(dob);
    if (!birth) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (birth > today) return { future: true };
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();
    if (days < 0) {
      months -= 1;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }
    const totalDays = diffDays(today, birth);
    return { years, months, days, totalDays, totalWeeks: Math.floor(totalDays / 7) };
  }, [dob]);

  return (
    <>
      <DateField label="Date of birth" value={dob} onChange={setDob} />
      {result?.future ? (
        <Notice tone="warn">Date of birth is in the future.</Notice>
      ) : result ? (
        <ResultBlock
          badge="AGE"
          tone="info"
          label="Age"
          value={`${result.years} y ${result.months} m ${result.days} d`}
          sub={`${result.totalWeeks.toLocaleString("en-GB")} weeks | ${result.totalDays.toLocaleString("en-GB")} days total`}
          copyText={`Age: ${result.years} years ${result.months} months ${result.days} days`}
        />
      ) : null}
      <button className="clear-btn" type="button" onClick={() => setDob(todayISO())}>
        Clear
      </button>
    </>
  );
}

function DurationTool() {
  const [mode, setMode] = useState("between");
  const [start, setStart] = useState(todayISO());
  const [startT, setStartT] = useState("");
  const [end, setEnd] = useState(todayISO());
  const [endT, setEndT] = useState("");
  const [base, setBase] = useState(todayISO());
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("weeks");
  const [direction, setDirection] = useState("after");

  const between = useMemo(() => {
    if (mode !== "between" || !start || !end) return null;
    const from = new Date(`${start}T${startT || "00:00"}:00`);
    const to = new Date(`${end}T${endT || "00:00"}:00`);
    const ms = to - from;
    const sign = ms < 0 ? "-" : "";
    const abs = Math.abs(ms);
    const totalMin = Math.round(abs / 60000);
    const days = Math.floor(totalMin / 1440);
    const hours = Math.floor((totalMin % 1440) / 60);
    const mins = totalMin % 60;
    const main = days > 0 ? `${sign}${days} d ${hours} h ${mins} m` : `${sign}${hours} h ${mins} m`;
    return {
      main,
      reversed: to < from,
      sub: `${sign}${(abs / 604800000).toFixed(2)} weeks | ${sign}${(abs / 86400000).toFixed(2)} days | ${sign}${(abs / 3600000).toFixed(1)} hours`
    };
  }, [end, endT, mode, start, startT]);

  const shifted = useMemo(() => {
    if (mode !== "addsub" || !base || !n(amount)) return null;
    const result = fromISO(base);
    const value = direction === "before" ? -n(amount) : n(amount);
    if (unit === "days") result.setDate(result.getDate() + value);
    else if (unit === "weeks") result.setDate(result.getDate() + value * 7);
    else if (unit === "months") result.setMonth(result.getMonth() + value);
    else result.setFullYear(result.getFullYear() + value);
    return result;
  }, [amount, base, direction, mode, unit]);

  return (
    <>
      <Segmented
        ariaLabel="Duration mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "between", label: "Between two dates" },
          { value: "addsub", label: "Add / subtract" }
        ]}
      />
      {mode === "between" ? (
        <>
          <div className="field-row">
            <DateField label="Start date" value={start} onChange={setStart} todayButton={false} />
            <TimeField label="Start time (optional)" value={startT} onChange={setStartT} />
          </div>
          <div className="field-row">
            <DateField label="End date" value={end} onChange={setEnd} todayButton={false} />
            <TimeField label="End time (optional)" value={endT} onChange={setEndT} />
          </div>
          {between ? (
            <ResultBlock
              badge={between.reversed ? "END BEFORE START" : "DURATION"}
              tone="info"
              label="Length of period"
              value={between.main}
              sub={between.sub}
              copyText={`Duration: ${between.main}`}
            />
          ) : null}
        </>
      ) : (
        <>
          <DateField label="Base date" value={base} onChange={setBase} />
          <div className="field-row">
            <NumberField label="Amount" value={amount} onChange={setAmount} min={0} />
            <label className="field-group">
              <span className="field-label">Unit</span>
              <select className="field-input plain-select" value={unit} onChange={(event) => setUnit(event.target.value)}>
                <option value="days">days</option>
                <option value="weeks">weeks</option>
                <option value="months">months</option>
                <option value="years">years</option>
              </select>
            </label>
          </div>
          <Segmented
            ariaLabel="Direction"
            value={direction}
            onChange={setDirection}
            options={[
              { value: "after", label: "After" },
              { value: "before", label: "Before" }
            ]}
          />
          {shifted ? (
            <ResultBlock
              badge="DATE"
              tone="info"
              label="Resulting date"
              value={fmtDate(shifted)}
              copyText={`${amount} ${unit} ${direction}: ${fmtDate(shifted)}`}
            />
          ) : null}
        </>
      )}
      <button
        className="clear-btn"
        type="button"
        onClick={() => {
          setStart(todayISO()); setStartT(""); setEnd(todayISO()); setEndT("");
          setBase(todayISO()); setAmount("");
        }}
      >
        Clear
      </button>
    </>
  );
}

function TimeField({ label, value, onChange }) {
  return (
    <label className="field-group">
      <span className="field-label">{label}</span>
      <span className="input-wrap">
        <input className="field-input plain-input" type="time" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

function RxValidity() {
  const [rxDate, setRxDate] = useState(todayISO());
  const [dispDate, setDispDate] = useState(todayISO());
  const [schedule, setSchedule] = useState("6m");

  const result = useMemo(() => {
    const rx = fromISO(rxDate);
    const disp = fromISO(dispDate) || new Date();
    if (!rx) return null;
    const expiry = schedule === "6m" ? addMonths(rx, 6) : addDays(rx, 28);
    const days = diffDays(expiry, disp);
    const tone = days < 0 ? "error" : days <= 7 ? "warn" : "valid";
    const badge = days < 0 ? "EXPIRED" : days <= 7 ? "EXPIRING SOON" : "VALID";
    return { expiry, days, tone, badge };
  }, [dispDate, rxDate, schedule]);

  return (
    <>
      <DateField label="Appropriate date (date on prescription)" value={rxDate} onChange={setRxDate} />
      <div className="field-group">
        <span className="field-label">Drug schedule</span>
        <ChoiceList
          value={schedule}
          onChange={setSchedule}
          options={[
            ["6m", "Standard POM / Schedule 5 CD", "6 months"],
            ["s2", "Schedule 2 CD", "28 days"],
            ["s3", "Schedule 3 CD", "28 days"],
            ["s4", "Schedule 4 CD", "28 days"]
          ]}
          normalize={(value) => (value === "6m" ? "6m" : "28d")}
        />
      </div>
      <DateField label="Dispensing date" value={dispDate} onChange={setDispDate} />
      {result ? (
        <ResultBlock
          badge={result.badge}
          tone={result.tone}
          label="Expires"
          value={fmtDate(result.expiry)}
          sub={
            result.days < 0
              ? `${Math.abs(result.days)} days overdue`
              : `${result.days} days remaining${schedule !== "6m" ? " - CD 28-day rule applies" : ""}`
          }
          links={sources.rx}
          copyText={`Rx expires: ${fmtDate(result.expiry)} (${result.days < 0 ? `${Math.abs(result.days)} days overdue` : `${result.days} days remaining`})`}
        />
      ) : null}
      <button className="clear-btn" type="button" onClick={() => { setRxDate(todayISO()); setDispDate(todayISO()); setSchedule("6m"); }}>
        Clear
      </button>
    </>
  );
}

function ChoiceList({ value, onChange, options, normalize = (next) => next }) {
  return (
    <div className="schedule-options">
      {options.map(([optionValue, label, rule]) => {
        const actualValue = normalize(optionValue);
        const selected = value === optionValue || value === actualValue;
        return (
          <label className={`schedule-option ${selected ? "selected" : ""}`} key={optionValue}>
            <input
              type="radio"
              checked={selected}
              onChange={() => onChange(actualValue === "28d" ? optionValue : optionValue)}
            />
            <span className="schedule-label">{label}</span>
            {rule ? <span className="schedule-rule">{rule}</span> : null}
          </label>
        );
      })}
    </div>
  );
}

function MixedFp10() {
  const [date, setDate] = useState(todayISO());
  const [items, setItems] = useState([
    { id: 1, schedule: "6m" },
    { id: 2, schedule: "s2" }
  ]);

  const updateItem = (id, schedule) => setItems((current) => current.map((item) => (item.id === id ? { ...item, schedule } : item)));

  return (
    <>
      <DateField label="Appropriate date" value={date} onChange={setDate} />
      <span className="field-label list-label">Items on this prescription</span>
      <div className="rx-list">
        {items.map((item, index) => {
          const expiry = item.schedule === "6m" ? addMonths(fromISO(date), 6) : addDays(fromISO(date), 28);
          const days = diffDays(expiry, new Date());
          const tone = days < 0 ? "error" : days <= 7 ? "warn" : "valid";
          const badge = days < 0 ? "Expired" : days <= 7 ? "Soon" : "Valid";
          return (
            <div className="rx-item" key={item.id}>
              <span className="rx-item-label">Item {index + 1}</span>
              <select value={item.schedule} onChange={(event) => updateItem(item.id, event.target.value)} aria-label={`Item ${index + 1} schedule`}>
                <option value="6m">Standard POM / Sched. 5</option>
                <option value="s2">Schedule 2 CD</option>
                <option value="s3">Schedule 3 CD</option>
                <option value="s4">Schedule 4 CD</option>
              </select>
              <span className="rx-item-expiry">{fmtShort(expiry)}</span>
              <Badge tone={tone}>{badge}</Badge>
              {items.length > 1 ? (
                <button className="rx-item-remove" type="button" onClick={() => setItems((current) => current.filter((row) => row.id !== item.id))} aria-label={`Remove item ${index + 1}`}>
                  x
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
      <button
        className="add-item-btn"
        type="button"
        disabled={items.length >= 8}
        onClick={() => setItems((current) => [...current, { id: Date.now(), schedule: "6m" }])}
      >
        + Add item
      </button>
      <Notice>
        Each item has its own expiry. Schedule 2, 3 and 4 CD items expire after 28 days. Non-CD and Schedule 5 items
        expire after 6 months.
      </Notice>
      <button className="clear-btn" type="button" onClick={() => setItems([{ id: 1, schedule: "6m" }, { id: 2, schedule: "s2" }])}>
        Clear all
      </button>
    </>
  );
}

function EmergencySupply() {
  const [criteria, setCriteria] = useState({ previous: false, need: false, unavailable: false });
  const [type, setType] = useState("pom");
  const allMet = criteria.previous && criteria.need && criteria.unavailable;
  const result = useMemo(() => {
    if (type === "cd123") return { tone: "error", badge: "CANNOT SUPPLY", value: "Schedule 1/2/3 CD", sub: "Emergency supply not permitted in law. Exception may apply for phenobarbital for epilepsy." };
    if (!allMet) return { tone: "error", badge: "CRITERIA NOT MET", value: "Do not supply yet", sub: "All three legal criteria must be satisfied before supply." };
    if (type === "cd45") return { tone: "valid", badge: "MAY SUPPLY", value: "5 days", sub: "Maximum emergency supply for Schedule 4 or 5 CD." };
    if (type === "inhaler") return { tone: "valid", badge: "MAY SUPPLY", value: "Smallest pack", sub: "Supply the smallest available manufacturer's pack." };
    return { tone: "valid", badge: "MAY SUPPLY", value: "30 days", sub: "Maximum supply for most POMs." };
  }, [allMet, type]);

  return (
    <>
      <span className="field-label list-label">Legal criteria - all must be met</span>
      <div className="check-list">
        {[
          ["previous", "Previously prescribed this medicine"],
          ["need", "Immediate need - health at risk without it"],
          ["unavailable", "Unable to obtain a prescription without undue delay"]
        ].map(([key, label]) => (
          <label className={`check-item ${criteria[key] ? "checked" : ""}`} key={key}>
            <input type="checkbox" checked={criteria[key]} onChange={(event) => setCriteria((current) => ({ ...current, [key]: event.target.checked }))} />
            {label}
          </label>
        ))}
      </div>
      <div className="field-group stacked">
        <span className="field-label">Medicine type</span>
        <ChoiceList
          value={type}
          onChange={setType}
          options={[
            ["pom", "Standard POM (incl. Schedule 5 CD)", "max 30 days"],
            ["cd45", "Schedule 4 / 5 CD", "max 5 days"],
            ["cd123", "Schedule 1 / 2 / 3 CD", "cannot supply"],
            ["inhaler", "Inhaler / cream / ointment", "smallest pack"]
          ]}
        />
      </div>
      <ResultBlock
        badge={result.badge}
        tone={result.tone}
        label={result.badge === "MAY SUPPLY" ? "Maximum supply" : "Decision"}
        value={result.value}
        sub={result.sub}
        links={sources.emergency}
        copyText={`Emergency supply: ${result.badge} - ${result.value}`}
      />
      <button className="clear-btn" type="button" onClick={() => setCriteria({ previous: false, need: false, unavailable: false })}>
        Clear
      </button>
    </>
  );
}

function FertilityTab() {
  const [sub, setSub] = useState("Trying to Conceive");
  return (
    <>
      <section className="card">
        <SubTabs items={["Trying to Conceive", "Cycle Tracker"]} active={sub} onChange={setSub} />
        {sub === "Trying to Conceive" ? <FertilityTool showPlanning /> : <FertilityTool />}
      </section>
      <Disclaimer links={sources.fertility} />
    </>
  );
}

function FertilityTool({ showPlanning = false }) {
  const [lmp, setLmp] = useState(todayISO());
  const [cycle, setCycle] = useState("");
  const result = useMemo(() => {
    const lmpDate = fromISO(lmp);
    const cycleDays = n(cycle) || 28;
    if (!lmpDate || cycleDays < 21 || cycleDays > 45) return null;
    const next = addDays(lmpDate, cycleDays);
    const ovulation = addDays(next, -14);
    const start = addDays(ovulation, -5);
    const days = Array.from({ length: Math.min(cycleDays, 45) }, (_, index) => addDays(lmpDate, index));
    return { start, ovulation, next, days };
  }, [cycle, lmp]);

  return (
    <>
      {!showPlanning ? (
        <Notice tone="warn">
          Fertility awareness alone is not a reliable contraceptive method. Use this as an estimate only.
        </Notice>
      ) : null}
      <DateField label="First day of last period (LMP)" value={lmp} onChange={setLmp} />
      <NumberField label="Average cycle length (default 28)" value={cycle} onChange={setCycle} unit="days" min={21} max={45} />
      {result ? (
        <>
          <ResultBlock
            badge="FERTILE WINDOW"
            tone="info"
            label="Estimated fertile window"
            value={`${fmtDate(result.start)} to ${fmtDate(result.ovulation)}`}
            sub={`Estimated ovulation: ${fmtDate(result.ovulation)} | Next period: ${fmtDate(result.next)}`}
            links={sources.fertility}
            copyText={`Fertile window: ${fmtDate(result.start)} to ${fmtDate(result.ovulation)}`}
          />
          <CalendarStrip result={result} />
        </>
      ) : null}
      {showPlanning ? (
        <Notice>
          Estimates vary by individual. Consider ovulation tests or basal body temperature tracking. Folic acid: 400 mcg
          daily from before conception until 12 weeks.
        </Notice>
      ) : null}
      <button className="clear-btn" type="button" onClick={() => { setLmp(todayISO()); setCycle(""); }}>
        Clear
      </button>
    </>
  );
}

function CalendarStrip({ result }) {
  const today = toISO(new Date());
  const startIso = toISO(result.start);
  const ovIso = toISO(result.ovulation);
  return (
    <div className="calendar-strip" aria-label="Cycle calendar">
      {result.days.map((date) => {
        const iso = toISO(date);
        const fertile = iso >= startIso && iso <= ovIso;
        return (
          <span
            className={`cal-day ${fertile ? "fertile" : ""} ${iso === ovIso ? "ovulation" : ""} ${iso === today ? "today" : ""}`}
            key={iso}
          >
            <span className="day-name">{DAYS[date.getDay()].slice(0, 1)}</span>
            <span className="day-num">{date.getDate()}</span>
          </span>
        );
      })}
    </div>
  );
}

function ClinicalTab() {
  const [sub, setSub] = useState("CrCl");
  return (
    <section className="card">
      <SubTabs items={["CrCl", "BSA", "Paediatric", "Converter"]} active={sub} onChange={setSub} />
      {sub === "CrCl" ? <CrClTool /> : null}
      {sub === "BSA" ? <BsaTool /> : null}
      {sub === "Paediatric" ? <PaediatricTool /> : null}
      {sub === "Converter" ? <ConverterTool /> : null}
    </section>
  );
}

function CrClTool() {
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("M");
  const [weightType, setWeightType] = useState("actual");
  const [weight, setWeight] = useState("");
  const [scr, setScr] = useState("");
  const result = useMemo(() => {
    if (!n(age) || !n(weight) || !n(scr)) return null;
    const k = sex === "M" ? 1.23 : 1.04;
    const crcl = ((140 - n(age)) * n(weight) * k) / n(scr);
    let stage = "G1 (>=90)", tone = "valid";
    if (crcl < 15) [stage, tone] = ["G5 (<15)", "error"];
    else if (crcl < 30) [stage, tone] = ["G4 (15-29)", "error"];
    else if (crcl < 45) [stage, tone] = ["G3b (30-44)", "warn"];
    else if (crcl < 60) [stage, tone] = ["G3a (45-59)", "warn"];
    else if (crcl < 90) [stage, tone] = ["G2 (60-89)", "valid"];
    return { crcl, stage, tone };
  }, [age, scr, sex, weight]);

  return (
    <>
      <Notice>
        Use Cockcroft-Gault CrCl, not eGFR, for DOAC, gentamicin and vancomycin dosing checks.
      </Notice>
      <div className="field-row">
        <NumberField label="Age" value={age} onChange={setAge} unit="yrs" min={18} max={120} />
        <div className="field-group">
          <span className="field-label">Sex</span>
          <Segmented
            ariaLabel="Sex"
            value={sex}
            onChange={setSex}
            options={[
              { value: "M", label: "Male" },
              { value: "F", label: "Female" }
            ]}
          />
        </div>
      </div>
      <div className="label-with-control">
        <span className="field-label">Weight</span>
        <Segmented
          ariaLabel="Weight type"
          value={weightType}
          onChange={setWeightType}
          options={[
            { value: "actual", label: "Actual" },
            { value: "ideal", label: "Ideal" },
            { value: "adjusted", label: "Adjusted" }
          ]}
        />
      </div>
      <NumberField label="" value={weight} onChange={setWeight} unit="kg" min={20} max={350} />
      <NumberField label="Serum creatinine" value={scr} onChange={setScr} unit="micromol/L" min={10} max={1500} />
      {result ? (
        <ResultBlock
          badge={`CKD ${result.stage}`}
          tone={result.tone}
          label="CrCl (Cockcroft-Gault)"
          value={`${numberText(result.crcl)} mL/min`}
          sub={`Weight: ${weightType} | Sex: ${sex === "M" ? "Male" : "Female"}`}
          links={sources.crcl}
          copyText={`CrCl (C-G): ${numberText(result.crcl)} mL/min - CKD ${result.stage}`}
        />
      ) : null}
      <Disclaimer links={sources.bnf} />
      <button className="clear-btn" type="button" onClick={() => { setAge(""); setWeight(""); setScr(""); }}>
        Clear
      </button>
    </>
  );
}

function BsaTool() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const bsa = n(height) && n(weight) ? Math.sqrt((n(height) * n(weight)) / 3600) : null;
  return (
    <>
      <div className="field-row">
        <NumberField label="Height" value={height} onChange={setHeight} unit="cm" min={30} max={250} />
        <NumberField label="Weight" value={weight} onChange={setWeight} unit="kg" min={1} max={350} />
      </div>
      {bsa ? (
        <ResultBlock
          badge="BSA"
          tone="info"
          label="BSA (Mosteller)"
          value={`${numberText(bsa, 2)} sq m`}
          sub="Formula: sqrt(height cm x weight kg / 3600)"
          copyText={`BSA (Mosteller): ${numberText(bsa, 2)} sq m`}
        />
      ) : null}
      <button className="clear-btn" type="button" onClick={() => { setHeight(""); setWeight(""); }}>
        Clear
      </button>
    </>
  );
}

function PaediatricTool() {
  const [weight, setWeight] = useState("");
  const [dose, setDose] = useState("");
  const [frequency, setFrequency] = useState("");
  const [maxSingle, setMaxSingle] = useState("");
  const result = n(weight) && n(dose) ? { single: n(weight) * n(dose), daily: n(weight) * n(dose) * (n(frequency) || 1) } : null;
  const exceeded = result && n(maxSingle) && result.single > n(maxSingle);

  return (
    <>
      <div className="field-row">
        <NumberField label="Weight" value={weight} onChange={setWeight} unit="kg" min={1} max={120} />
        <NumberField label="Dose per kg" value={dose} onChange={setDose} unit="mg/kg" min={0.01} max={500} />
      </div>
      <div className="field-row">
        <NumberField label="Doses per day" value={frequency} onChange={setFrequency} unit="/day" min={1} max={12} />
        <NumberField label="Max single dose" value={maxSingle} onChange={setMaxSingle} unit="mg" min={0} max={10000} />
      </div>
      {exceeded ? <Notice tone="error">Exceeds maximum single dose of {numberText(n(maxSingle), 0)} mg. Check BNFc.</Notice> : null}
      {result ? (
        <ResultBlock
          badge={exceeded ? "EXCEEDS MAX" : "WITHIN RANGE"}
          tone={exceeded ? "error" : "valid"}
          label="Calculated dose"
          links={sources.bnfc}
          copyText={`Paediatric dose: ${numberText(result.single, 0)} mg single | ${numberText(result.daily, 0)} mg daily`}
        >
          <div className="mini-results">
            <div>
              <div className="result-label">Single dose</div>
              <div className={`result-value ${exceeded ? "text-error" : ""}`}>{numberText(result.single, result.single < 1 ? 2 : 0)} mg</div>
            </div>
            <div>
              <div className="result-label">Daily total</div>
              <div className="result-value">{numberText(result.daily, result.daily < 1 ? 2 : 0)} mg</div>
            </div>
          </div>
        </ResultBlock>
      ) : null}
      <Disclaimer links={sources.bnfc} />
      <button className="clear-btn" type="button" onClick={() => { setWeight(""); setDose(""); setFrequency(""); setMaxSingle(""); }}>
        Clear
      </button>
    </>
  );
}

const VIT = {
  vitd: { unit: "mcg", perIU: 1 / 40, note: "Vitamin D: 1 mcg = 40 IU" },
  vite: { unit: "mg", perIU: 1 / 1.1, note: "Vitamin E: 1 mg dl-alpha-tocopherol (synthetic) ~ 1.10 IU" }
};

function ConverterTool() {
  const [mode, setMode] = useState("mgmcg");
  const [value, setValue] = useState("");
  const [mw, setMw] = useState("");
  const [iu, setIu] = useState("");
  const [mass, setMass] = useState("");
  const isVit = mode === "vitd" || mode === "vite";
  const vit = VIT[mode];

  const result = useMemo(() => {
    if (isVit) return null;
    const v = n(value);
    if (!v) return null;
    if (mode === "mgmcg") return `${numberText(v * 1000, 0)} mcg`;
    if (mode === "wvmg") return `${numberText(v * 10, 2)} mg/mL`;
    return n(mw) ? `${numberText((v * 1000) / n(mw), 2)} mmol/L` : "Enter molecular weight";
  }, [isVit, mode, mw, value]);

  const labels = { mgmcg: ["Value in mg", "mg"], wvmg: ["% w/v", "%"], mgmmol: ["mg/mL", "mg/mL"] };
  const resetAll = () => { setValue(""); setMw(""); setIu(""); setMass(""); };
  const onIu = (next) => { setIu(next); setMass(next === "" ? "" : String(+(n(next) * vit.perIU).toFixed(3))); };
  const onMass = (next) => { setMass(next); setIu(next === "" ? "" : String(+(n(next) / vit.perIU).toFixed(2))); };

  return (
    <>
      <div className="field-group">
        <span className="field-label">Conversion type</span>
        <ChoiceList
          value={mode}
          onChange={(next) => { setMode(next); resetAll(); }}
          options={[
            ["mgmcg", "mg to mcg"],
            ["wvmg", "% w/v to mg/mL"],
            ["mgmmol", "mg/mL to mmol/L"],
            ["vitd", "Vitamin D: IU and mcg"],
            ["vite", "Vitamin E: IU and mg"]
          ]}
        />
      </div>
      {isVit ? (
        <>
          <div className="field-row">
            <NumberField label="International units" value={iu} onChange={onIu} unit="IU" min={0} />
            <NumberField label="Mass" value={mass} onChange={onMass} unit={vit.unit} min={0} />
          </div>
          <p className="conv-note">{vit.note} - confirm the product's stated form before converting.</p>
        </>
      ) : (
        <>
          <NumberField label={labels[mode][0]} value={value} onChange={setValue} unit={labels[mode][1]} min={0} />
          {mode === "mgmmol" ? <NumberField label="Molecular weight" value={mw} onChange={setMw} unit="g/mol" min={0} /> : null}
          {result ? <ResultBlock badge="RESULT" tone="info" label="Converted value" value={result} copyText={`Converted value: ${result}`} /> : null}
        </>
      )}
      <button className="clear-btn" type="button" onClick={resetAll}>
        Clear
      </button>
    </>
  );
}

function PatientTab() {
  const [sub, setSub] = useState("Due Date");
  return (
    <section className="card">
      <SubTabs items={["Due Date", "Alcohol", "Smoking"]} active={sub} onChange={setSub} />
      {sub === "Due Date" ? <DueDateTool /> : null}
      {sub === "Alcohol" ? <AlcoholTool /> : null}
      {sub === "Smoking" ? <SmokingTool /> : null}
    </section>
  );
}

function DueDateTool() {
  const [lmp, setLmp] = useState(todayISO());
  const result = useMemo(() => {
    const lmpDate = fromISO(lmp);
    if (!lmpDate) return null;
    const edd = addDays(lmpDate, 280);
    const days = diffDays(new Date(), lmpDate);
    const weeks = Math.floor(days / 7);
    const rem = days % 7;
    return { edd, sub: days >= 0 && days <= 280 ? `Currently: ${weeks} weeks + ${rem} days` : "LMP is outside the usual pregnancy range" };
  }, [lmp]);

  return (
    <>
      <DateField label="First day of last period (LMP)" value={lmp} onChange={setLmp} />
      {result ? (
        <ResultBlock
          badge="EDD"
          tone="info"
          label="Estimated due date"
          value={fmtDate(result.edd, true)}
          sub={result.sub}
          links={sources.dueDate}
          copyText={`EDD: ${fmtDate(result.edd, true)}`}
        />
      ) : null}
      <Notice>Scan date overrides an LMP-based estimate. 400 mcg folic acid daily until 12 weeks.</Notice>
      <button className="clear-btn" type="button" onClick={() => setLmp(todayISO())}>
        Clear
      </button>
    </>
  );
}

function AlcoholTool() {
  const [session, setSession] = useState(0);
  const [weekly, setWeekly] = useState(0);
  const [volume, setVolume] = useState("");
  const [abv, setAbv] = useState("");
  const pct = Math.min((weekly / 14) * 100, 110);
  const tone = weekly > 14 ? "error" : weekly > 10 ? "warn" : "info";

  const addDrink = (ml, percent) => {
    const units = (ml * percent) / 1000;
    setSession((current) => current + units);
    setWeekly((current) => current + units);
  };

  return (
    <>
      <span className="field-label list-label">Quick add</span>
      <div className="quick-add">
        {[
          ["Pint 4%", 568, 4],
          ["175ml wine", 175, 13],
          ["250ml wine", 250, 13],
          ["25ml spirit", 25, 40],
          ["35ml spirit", 35, 40]
        ].map(([label, ml, percent]) => (
          <button className="quick-pill" type="button" key={label} onClick={() => addDrink(ml, percent)}>
            {label}
          </button>
        ))}
      </div>
      <span className="field-label list-label">Or enter manually</span>
      <div className="field-row">
        <NumberField label="Volume" value={volume} onChange={setVolume} unit="mL" min={0} />
        <NumberField label="ABV" value={abv} onChange={setAbv} unit="%" min={0} max={100} />
      </div>
      <button
        className="primary-mini"
        type="button"
        onClick={() => {
          if (n(volume) && n(abv)) {
            addDrink(n(volume), n(abv));
            setVolume("");
            setAbv("");
          }
        }}
      >
        + Add drink
      </button>
      <section className="result-block" aria-live="polite">
        <div className="result-header">
          <Badge tone={tone}>RUNNING TOTAL</Badge>
          <CopyButton text={`Alcohol: session ${numberText(session)} units | weekly ${numberText(weekly)} units`} />
        </div>
        <div className="mini-results">
          <div>
            <div className="result-label">This session</div>
            <div className="result-value text-info">{numberText(session)} units</div>
          </div>
          <div>
            <div className="result-label">Weekly total</div>
            <div className={`result-value text-${tone}`}>{numberText(weekly)} units</div>
          </div>
        </div>
        <div className={`progress-caption text-${tone}`}>{weekly > 14 ? `Over UK limit - ${numberText(weekly)} / 14 units` : `UK limit: 14 units/week - ${numberText(weekly)} used`}</div>
        <div className="progress-track">
          <div className={`progress-fill fill-${tone}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="progress-labels"><span>0</span><span>7</span><span>14</span><span>+</span></div>
        <SourceLinks links={sources.alcohol} />
      </section>
      <Notice>Spread alcohol over 3 or more days. Avoid saving all units for one or two sessions.</Notice>
      <div className="button-row">
        <button className="clear-btn" type="button" onClick={() => setSession(0)}>Clear session</button>
        <button className="clear-btn" type="button" onClick={() => { setSession(0); setWeekly(0); }}>Clear weekly total</button>
      </div>
    </>
  );
}

function SmokingTool() {
  const [cigs, setCigs] = useState("");
  const [years, setYears] = useState("");
  const packYears = n(cigs) && n(years) ? (n(cigs) / 20) * n(years) : null;

  return (
    <>
      <div className="field-row">
        <NumberField label="Cigarettes per day" value={cigs} onChange={setCigs} min={0} max={200} />
        <NumberField label="Years smoked" value={years} onChange={setYears} unit="yrs" min={0} max={100} />
      </div>
      {packYears !== null ? (
        <ResultBlock
          badge="PACK-YEARS"
          tone="info"
          label="Pack-years"
          value={numberText(packYears)}
          sub="Formula: (cigarettes/day / 20) x years smoked"
          links={sources.smoking}
          copyText={`Pack-years: ${numberText(packYears)}`}
        />
      ) : null}
      <button className="clear-btn" type="button" onClick={() => { setCigs(""); setYears(""); }}>
        Clear
      </button>
    </>
  );
}

function minToHHMM(value) {
  const m = ((value % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function hhmmToMin(value) {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

function weeklySchedule(perWeek) {
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (perWeek >= 7) return "every day";
  const step = 7 / perWeek;
  const picks = [];
  for (let i = 0; i < perWeek; i += 1) picks.push(names[Math.round(i * step) % 7]);
  return picks.join(" / ");
}

function DosingTab() {
  const [sub, setSub] = useState("Dose Timing");
  return (
    <>
      <section className="card">
        <SubTabs items={["Dose Timing", "Days' Supply", "Med Sync"]} active={sub} onChange={setSub} />
        {sub === "Dose Timing" ? <DoseTimingTool /> : null}
        {sub === "Days' Supply" ? <DaysSupplyTool /> : null}
        {sub === "Med Sync" ? <MedSyncTool /> : null}
      </section>
      <Disclaimer links={sources.bnf} />
    </>
  );
}

function DoseTimingTool() {
  const [wake, setWake] = useState("07:00");
  const [sleep, setSleep] = useState("23:00");
  const [doses, setDoses] = useState("");
  const [empty, setEmpty] = useState(false);
  const [breakfast, setBreakfast] = useState("08:00");
  const [lunch, setLunch] = useState("13:00");
  const [dinner, setDinner] = useState("18:30");

  const result = useMemo(() => {
    const count = Math.round(n(doses));
    let wakeMin = hhmmToMin(wake);
    let sleepMin = hhmmToMin(sleep);
    if (!count || count < 1 || wakeMin == null || sleepMin == null) return null;
    if (sleepMin <= wakeMin) sleepMin += 1440; // bedtime after midnight
    const span = sleepMin - wakeMin;
    let times = [];
    let note = "";

    if (empty) {
      const meals = [breakfast, lunch, dinner].map(hhmmToMin).filter((value) => value != null);
      let slots = [];
      meals.forEach((meal) => {
        slots.push(meal - 60); // 1 h before
        slots.push(meal + 120); // 2 h after
      });
      slots = slots.filter((value) => value >= wakeMin && value <= sleepMin).sort((a, b) => a - b);
      slots = slots.filter((value, index) => index === 0 || value - slots[index - 1] >= 45);
      if (slots.length >= count) {
        const step = (slots.length - 1) / (count - 1 || 1);
        for (let i = 0; i < count; i += 1) times.push(slots[Math.round(i * step)]);
      } else {
        times = slots;
      }
      note = `Spaced 1 h before or 2 h after meals.${times.length < count ? " Fewer empty-stomach slots than doses - review with patient." : ""}`;
    } else if (count === 1) {
      times = [wakeMin + Math.round(span / 2)];
      note = "Once daily - mid-waking suggestion.";
    } else {
      const step = span / (count - 1);
      for (let i = 0; i < count; i += 1) times.push(Math.round(wakeMin + i * step));
      note = `Approximately every ${(step / 60).toFixed(1)} h across ${(span / 60).toFixed(0)} waking hours.`;
    }
    return { times: times.map(minToHHMM), note };
  }, [breakfast, dinner, doses, empty, lunch, sleep, wake]);

  return (
    <>
      <div className="field-row">
        <TimeField label="Wakes up" value={wake} onChange={setWake} />
        <TimeField label="Goes to bed" value={sleep} onChange={setSleep} />
      </div>
      <NumberField label="Doses per day" value={doses} onChange={setDoses} min={1} max={12} />
      <label className={`check-item ${empty ? "checked" : ""}`}>
        <input type="checkbox" checked={empty} onChange={(event) => setEmpty(event.target.checked)} />
        Empty stomach - space around meals (1 h before / 2 h after)
      </label>
      {empty ? (
        <div className="field-group stacked">
          <span className="field-label">Meal times</span>
          <div className="field-row">
            <TimeField label="Breakfast" value={breakfast} onChange={setBreakfast} />
            <TimeField label="Lunch" value={lunch} onChange={setLunch} />
          </div>
          <TimeField label="Dinner" value={dinner} onChange={setDinner} />
        </div>
      ) : null}
      {result ? (
        <ResultBlock badge="SUGGESTED TIMES" tone="info" copyText={`Suggested dose times: ${result.times.join(", ")}`}>
          <div className="time-chips">
            {result.times.map((time, index) => (
              <span className="time-chip" key={`${time}-${index}`}>{time}</span>
            ))}
          </div>
          <div className="result-sub">{result.note}</div>
        </ResultBlock>
      ) : null}
      <Notice>
        Suggested times only - follow the directions on the label or BNF. Some medicines must be spaced evenly over a full
        24 h (e.g. certain antibiotics), not only waking hours.
      </Notice>
      <button className="clear-btn" type="button" onClick={() => { setDoses(""); setEmpty(false); }}>
        Clear
      </button>
    </>
  );
}

function DaysSupplyTool() {
  const [mode, setMode] = useState("lasts");
  const [dose, setDose] = useState("");
  const [freq, setFreq] = useState("");
  const [per, setPer] = useState("day");
  const [qty, setQty] = useState("");
  const [weeks, setWeeks] = useState("");

  const result = useMemo(() => {
    if (!n(dose) || !n(freq)) return null;
    const perDay = per === "day" ? n(dose) * n(freq) : (n(dose) * n(freq)) / 7;
    if (perDay <= 0) return null;
    const schedule = per === "week" ? ` | e.g. take on ${weeklySchedule(Math.round(n(freq)))}` : "";
    if (mode === "lasts") {
      if (!n(qty)) return null;
      const days = n(qty) / perDay;
      const runOut = addDays(new Date(), Math.floor(days));
      return {
        label: "Lasts",
        value: `${numberText(days)} days`,
        sub: `${numberText(days / 7)} weeks | runs out ${fmtShort(runOut)} (${numberText(perDay, 2)}/day)${schedule}`,
        copy: `Supply lasts ${numberText(days)} days (runs out ${fmtShort(runOut)})`
      };
    }
    if (!n(weeks)) return null;
    const needed = Math.ceil(perDay * n(weeks) * 7);
    return {
      label: "Quantity needed",
      value: `${needed.toLocaleString("en-GB")} tab/mL`,
      sub: `to cover ${n(weeks)} weeks at ${numberText(perDay, 2)}/day${schedule}`,
      copy: `Order ${needed} to cover ${n(weeks)} weeks`
    };
  }, [dose, freq, mode, per, qty, weeks]);

  return (
    <>
      <Segmented
        ariaLabel="Supply mode"
        value={mode}
        onChange={setMode}
        options={[
          { value: "lasts", label: "How long will it last" },
          { value: "order", label: "Quantity to order" }
        ]}
      />
      <div className="field-row">
        <NumberField label="Dose each time" value={dose} onChange={setDose} unit="tab/mL" min={0} />
        <NumberField label="Times" value={freq} onChange={setFreq} min={0} />
      </div>
      <label className="field-group">
        <span className="field-label">Per</span>
        <select className="field-input plain-select" value={per} onChange={(event) => setPer(event.target.value)}>
          <option value="day">day</option>
          <option value="week">week</option>
        </select>
      </label>
      {mode === "lasts" ? (
        <NumberField label="Total quantity dispensed" value={qty} onChange={setQty} unit="tab/mL" min={0} />
      ) : (
        <NumberField label="Duration needed" value={weeks} onChange={setWeeks} unit="weeks" min={0} />
      )}
      {result ? (
        <ResultBlock
          badge="SUPPLY"
          tone="info"
          label={result.label}
          value={result.value}
          sub={result.sub}
          copyText={result.copy}
        />
      ) : null}
      <button className="clear-btn" type="button" onClick={() => { setDose(""); setFreq(""); setQty(""); setWeeks(""); }}>
        Clear
      </button>
    </>
  );
}

let syncId = 0;
const newSyncRow = () => ({ id: (syncId += 1), name: "", use: "", stock: "" });

function MedSyncTool() {
  const [rows, setRows] = useState(() => [newSyncRow(), newSyncRow()]);
  const [targetMode, setTargetMode] = useState("longest");
  const [customDays, setCustomDays] = useState("");

  const update = (id, key, value) => setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));

  const plan = useMemo(() => {
    const valid = rows
      .map((row) => ({ name: row.name || "(unnamed)", use: n(row.use), stock: n(row.stock) }))
      .filter((row) => row.use > 0 && row.stock >= 0)
      .map((row) => ({ ...row, days: row.stock / row.use }));
    if (valid.length < 2) return null;
    const target = targetMode === "custom" ? n(customDays) : Math.max(...valid.map((row) => row.days));
    if (!target) return null;
    const lines = valid.map((row) => {
      const gap = target - row.days;
      let action;
      if (Math.abs(gap) < 0.5) action = "aligned - no change";
      else if (gap > 0) action = `request +${Math.ceil(gap * row.use)} (~${gap.toFixed(0)} d short)`;
      else action = `surplus ${Math.abs(gap).toFixed(0)} d - withhold / don't reorder`;
      return { name: row.name, detail: `${row.days.toFixed(0)} d left - ${action}` };
    });
    return { lines, common: fmtShort(addDays(new Date(), Math.floor(target))), target };
  }, [customDays, rows, targetMode]);

  return (
    <>
      <Notice>
        Enter each regular medicine with how much is used per day and how much the patient has now. The tool aligns
        run-out dates so items can be collected together.
      </Notice>
      <div className="sync-head">
        <span>Medicine</span>
        <span>Use/day</span>
        <span>In hand</span>
        <span />
      </div>
      <div className="sync-list">
        {rows.map((row, index) => (
          <div className="sync-item" key={row.id}>
            <input type="text" placeholder={`Medicine ${index + 1}`} value={row.name} onChange={(event) => update(row.id, "name", event.target.value)} />
            <input type="text" inputMode="decimal" placeholder="/day" value={row.use} onChange={(event) => /^\d*\.?\d*$/.test(event.target.value) && update(row.id, "use", event.target.value)} />
            <input type="text" inputMode="decimal" placeholder="stock" value={row.stock} onChange={(event) => /^\d*\.?\d*$/.test(event.target.value) && update(row.id, "stock", event.target.value)} />
            <button
              className="rx-item-remove"
              type="button"
              aria-label={`Remove medicine ${index + 1}`}
              onClick={() => setRows((current) => (current.length > 1 ? current.filter((item) => item.id !== row.id) : current))}
            >
              x
            </button>
          </div>
        ))}
      </div>
      <button className="add-item-btn" type="button" onClick={() => setRows((current) => [...current, newSyncRow()])}>
        + Add medication
      </button>
      <div className="field-group stacked">
        <span className="field-label">Sync target</span>
        <div className="schedule-options">
          <label className={`schedule-option ${targetMode === "longest" ? "selected" : ""}`}>
            <input type="radio" checked={targetMode === "longest"} onChange={() => setTargetMode("longest")} />
            <span className="schedule-label">Align to the longest-lasting medicine</span>
          </label>
          <label className={`schedule-option ${targetMode === "custom" ? "selected" : ""}`}>
            <input type="radio" checked={targetMode === "custom"} onChange={() => setTargetMode("custom")} />
            <span className="schedule-label">
              Custom target
              <input
                className="inline-input"
                type="text"
                inputMode="numeric"
                value={customDays}
                onChange={(event) => /^\d*$/.test(event.target.value) && setCustomDays(event.target.value)}
              />
              days from today
            </span>
          </label>
        </div>
      </div>
      {plan ? (
        <section className="result-block" aria-live="polite">
          <div className="result-label">Synchronisation plan</div>
          <div className="sync-plan">
            {plan.lines.map((line) => (
              <div className="sync-plan-row" key={line.name + line.detail}>
                <span className="sync-plan-name">{line.name}</span>
                <span className="sync-plan-action">{line.detail}</span>
              </div>
            ))}
          </div>
          <div className="result-sub">Aligned to {plan.target.toFixed(0)} days - next common collection ~ {plan.common}.</div>
        </section>
      ) : null}
      <div className="disclaimer">
        <span className="info-mark">i</span>
        <span>Suggestion only - confirm quantities and any extra requests with the prescriber. Not for high-risk, as-required or variable-dose medicines without review.</span>
      </div>
      <button className="clear-btn" type="button" onClick={() => { setRows([newSyncRow(), newSyncRow()]); setCustomDays(""); }}>
        Clear
      </button>
    </>
  );
}

export default App;
