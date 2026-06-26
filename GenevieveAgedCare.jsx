import React, { useState, useMemo, useEffect } from "react";

// ---------------------------------------------------------------------------
// Genevieve · Care & Wellbeing — residential aged care
// Brand frame: plum #7e4a63 (muted, less pink than childcare). Status: green/amber/red.
// Care minutes 215/day incl. 44 RN + 24/7 RN per Aged Care Act (decision support only)
// ---------------------------------------------------------------------------

const C = {
  green: "#008037", greenDeep: "#02622b", greenSoft: "#e7f3ec",
  yellow: "#FFE600", amber: "#caa400", amberSoft: "#fff8cc",
  red: "#f80808", redSoft: "#fde7e7", redText: "#a40606",
  ink: "#241a20", slate: "#6a5c63", line: "#e7e0e4",
  paper: "#f4eef1", white: "#ffffff",
  // Brand accent (aged-care plum): buttons / frame / header. Status stays green/amber/red.
  brand: "#7e4a63", brandDeep: "#5e3349", brandSoft: "#efe4ea",
};

const CARE_MIN_TARGET = 215, RN_MIN_TARGET = 44;

const WING_META = {
  memory: { name: "Memory Support", sub: "Dementia care" },
  high:   { name: "High Care", sub: "Complex clinical" },
  low:    { name: "Low Care", sub: "Assisted living" },
  respite:{ name: "Respite", sub: "Short stay & transition" },
};
const RESIDENT_COUNT = { memory: 18, high: 16, low: 24, respite: 8 };
const DAY_RATIO = { memory: 6, high: 5, low: 8, respite: 6 };
const NIGHT_RATIO = { memory: 9, high: 8, low: 12, respite: 8 };

// Diet (IDDSI), mobility, clinical-alert and wellbeing libraries
const DIETS = {
  regular: "Regular (IDDSI 7)", soft: "Soft & bite-sized (IDDSI 6)",
  minced: "Minced & moist (IDDSI 5)", pureed: "Pureed (IDDSI 4)",
};
const FLUIDS = { thin: "Thin fluids", mild: "Mildly thick (L2)", mod: "Moderately thick (L3)" };
const MOBILITY = { ind: "Independent", sup: "Supervision", one: "1 assist", two: "2 assist", hoist: "Full hoist" };
const ALERT_META = {
  falls:   { label: "Falls risk", color: C.red },
  choke:   { label: "Choking / aspiration", color: C.red },
  anticoag:{ label: "Anticoagulant", color: C.amber },
  diabetic:{ label: "Diabetic", color: C.amber },
  skin:    { label: "Skin / pressure risk", color: C.amber },
  wander:  { label: "Wandering risk", color: C.amber },
  infection:{ label: "Infection precautions", color: C.red },
  acd:     { label: "Advance Care Directive", color: C.slate },
};
const WELLBEING = {
  settled:  { label: "Settled & sociable", color: C.green, note: "Engages well and enjoys company." },
  reassure: { label: "Needs reassurance", color: C.amber, note: "Anxious at times — calm, familiar faces help." },
  wander:   { label: "Walks with purpose", color: C.amber, note: "Tends to wander — safe walking space and gentle redirection." },
  sundown:  { label: "Sundowning", color: C.red, note: "Becomes distressed late afternoon — quiet, low-stimulus routine." },
  quiet:    { label: "Prefers quiet", color: C.slate, note: "Likes solitude — small groups, not large gatherings." },
};

const con = (name, rel, phone) => ({ name, rel, phone });

// Resident roster per wing (named subset; wing totals in RESIDENT_COUNT)
const ROSTER = {
  memory: [
    { name: "Margaret", age: 84, falls: 3, diet: "soft", fluid: "mild", mob: "one", well: "sundown",
      alerts: ["falls", "anticoag"], med: "2:00pm · warfarin (RN)", presence: "in",
      contacts: [con("Susan Hill", "Daughter", "0412 660 200"), con("Dr Patel", "GP", "07 5599 1020")],
      notes: ["Daughter: responds well to old jazz records in the afternoon.", "Hates being rushed at meals — allow extra time."] },
    { name: "Arthur", age: 79, falls: 2, diet: "regular", fluid: "thin", mob: "sup", well: "wander",
      alerts: ["wander", "diabetic"], med: "12:00pm · insulin (RN/EN)", presence: "in",
      contacts: [con("Peter Nolan", "Son", "0423 551 884")],
      notes: ["Likes to walk the garden loop after breakfast — settles him."] },
    { name: "Joan", age: 88, falls: 3, diet: "minced", fluid: "mod", mob: "two", well: "reassure",
      alerts: ["falls", "choke"], med: null, presence: "in",
      contacts: [con("Margaret Reed", "Niece", "0410 223 670")],
      notes: ["Niece: please sit her with Dorothy — they're old friends."] },
    { name: "Bill", age: 81, falls: 2, diet: "soft", fluid: "thin", mob: "one", well: "quiet",
      alerts: ["skin"], med: null, presence: "in", contacts: [con("Helen Brooks", "Daughter", "0419 887 props".slice(0,12))] },
    { name: "Dorothy", age: 90, falls: 3, diet: "pureed", fluid: "mod", mob: "hoist", well: "settled",
      alerts: ["choke", "skin", "acd"], med: null, presence: "in",
      contacts: [con("James Carter", "Son", "0401 556 233")],
      notes: ["Advance care directive on file — comfort-focused. Confirm with RN."] },
    { name: "Frank", age: 77, falls: 1, diet: "regular", fluid: "thin", mob: "ind", well: "settled", alerts: [], med: null, presence: "out" },
  ],
  high: [
    { name: "Eunice", age: 86, falls: 3, diet: "minced", fluid: "mild", mob: "two", well: "reassure",
      alerts: ["falls", "infection"], med: "1:00pm · antibiotics (RN)", presence: "in",
      contacts: [con("Robert Shaw", "Son", "0412 098 551")],
      notes: ["Contact precautions in place — gown & gloves, dedicated equipment."] },
    { name: "Henry", age: 82, falls: 2, diet: "regular", fluid: "thin", mob: "one", well: "settled",
      alerts: ["diabetic", "anticoag"], med: "2:00pm · warfarin + BGL (RN)", presence: "in",
      contacts: [con("Anne Page", "Wife", "0423 771 600")] },
    { name: "Vera", age: 91, falls: 3, diet: "pureed", fluid: "mod", mob: "hoist", well: "quiet",
      alerts: ["choke", "skin", "acd"], med: null, presence: "in",
      contacts: [con("David Lowe", "Nephew", "0410 442 889")],
      notes: ["High aspiration risk — upright 30 min after meals, supervise fully."] },
    { name: "Stan", age: 84, falls: 2, diet: "soft", fluid: "thin", mob: "sup", well: "settled", alerts: [], med: null, presence: "appt" },
  ],
  low: [
    { name: "Patricia", age: 76, falls: 1, diet: "regular", fluid: "thin", mob: "ind", well: "settled", alerts: [], med: null, presence: "in",
      contacts: [con("Lisa Grant", "Daughter", "0412 330 771")] },
    { name: "Ron", age: 78, falls: 2, diet: "regular", fluid: "thin", mob: "sup", well: "settled", alerts: ["diabetic"], med: "5:00pm · metformin (EN)", presence: "in" },
    { name: "Betty", age: 80, falls: 1, diet: "soft", fluid: "thin", mob: "ind", well: "quiet", alerts: [], med: null, presence: "in" },
    { name: "Colin", age: 75, falls: 1, diet: "regular", fluid: "thin", mob: "ind", well: "settled", alerts: [], med: null, presence: "out" },
  ],
  respite: [
    { name: "Maureen", age: 74, falls: 2, diet: "regular", fluid: "thin", mob: "sup", well: "reassure", alerts: [], med: null, presence: "in",
      contacts: [con("Gail Turner", "Daughter", "0419 220 553")],
      notes: ["Two-week respite — daughter visits daily at 4pm."] },
    { name: "Keith", age: 83, falls: 2, diet: "soft", fluid: "mild", mob: "one", well: "settled", alerts: ["skin"], med: null, presence: "in" },
  ],
};
// tidy a stray value
ROSTER.memory[3].contacts = [con("Helen Brooks", "Daughter", "0419 887 540")];

const W = (name, role) => ({ name, role }); // role: 'RN' | 'EN' | 'PCW'

const SCENARIOS = {
  morning: {
    label: "Morning · 9:00am", ratio: "day", rn: 2, careMin: 216,
    note: "Full staffing, residents up and about. Care minutes on track and an RN onsite.",
    wings: {
      memory: [W("Grace", "EN"), W("Sam", "PCW"), W("Mia", "PCW")],
      high:   [W("Raj", "EN"), W("Tom", "PCW"), W("Leah", "PCW"), W("Dan", "PCW")],
      low:    [W("Amy", "PCW"), W("Ben", "PCW"), W("Zoe", "PCW")],
      respite:[W("Kate", "EN"), W("Joe", "PCW")],
    },
  },
  afternoon: {
    label: "Afternoon · 3:00pm", ratio: "day", rn: 2, careMin: 211,
    note: "A carer is escorting a resident to an appointment — High Care is now short. Balance to cover it.",
    wings: {
      memory: [W("Grace", "EN"), W("Sam", "PCW"), W("Mia", "PCW")],
      high:   [W("Raj", "EN"), W("Tom", "PCW"), W("Leah", "PCW")],
      low:    [W("Amy", "PCW"), W("Ben", "PCW"), W("Zoe", "PCW"), W("Eli", "PCW")],
      respite:[W("Kate", "EN"), W("Joe", "PCW")],
    },
  },
  night: {
    label: "Night · 11:00pm", ratio: "night", rn: 1, careMin: 213,
    note: "Residents settled for the night. Fewer staff, an RN on duty, and repositioning rounds in focus.",
    wings: {
      memory: [W("Grace", "EN"), W("Sam", "PCW")],
      high:   [W("Raj", "EN"), W("Tom", "PCW")],
      low:    [W("Amy", "PCW"), W("Ben", "PCW")],
      respite:[W("Joe", "PCW")],
    },
  },
};

const ratioSet = (s) => (s.ratio === "night" ? NIGHT_RATIO : DAY_RATIO);
const reqCarers = (wingKey, s) => Math.ceil(RESIDENT_COUNT[wingKey] / ratioSet(s)[wingKey]);
const presentList = (wingKey, presence) => ROSTER[wingKey].filter((r) => (presence[`${wingKey}:${r.name}`] || r.presence) === "in");

function wingStatus(wingKey, carers, s) {
  const required = reqCarers(wingKey, s);
  const have = carers.length;
  if (have < required) return { level: "red", required, have };
  return { level: "green", required, have };
}

const LEVEL = {
  green:  { dot: C.green, bg: C.greenSoft, text: C.greenDeep, label: "Staffed" },
  amber:  { dot: C.amber, bg: C.amberSoft, text: "#7a6300", label: "Watch" },
  red:    { dot: C.red, bg: C.redSoft, text: C.redText, label: "Understaffed" },
  closed: { dot: "#b9c4bd", bg: "#f0f3f1", text: C.slate, label: "—" },
};

// Optimiser: move a spare carer (prefer PCW) from a surplus wing to an understaffed one
function balance(wings, s) {
  const next = JSON.parse(JSON.stringify(wings));
  const notes = [];
  const keys = ["memory", "high", "low", "respite"];
  const takeSpare = (k) => {
    const arr = next[k];
    if (arr.length <= reqCarers(k, s)) return null;
    const pi = arr.findIndex((c) => c.role === "PCW");
    return pi > -1 ? arr.splice(pi, 1)[0] : arr.pop();
  };
  keys.forEach((k) => {
    let guard = 0;
    while (next[k].length < reqCarers(k, s) && guard < 6) {
      guard++;
      const donor = keys.find((j) => j !== k && next[j].length > reqCarers(j, s));
      if (!donor) break;
      const moved = takeSpare(donor);
      if (!moved) break;
      next[k].push(moved);
      notes.push(`Moved ${moved.name} (${moved.role}) → ${WING_META[k].name} to restore safe staffing.`);
    }
  });
  if (notes.length === 0) notes.push("Every wing is safely staffed for this shift — nothing to change.");
  return { wings: next, notes };
}

// ---------------------------------------------------------------------------
function Dot({ level, size = 12 }) {
  return <span style={{ width: size, height: size, borderRadius: size, background: LEVEL[level].dot, display: "inline-block", flexShrink: 0, animation: level === "red" ? "pulse 1.6s infinite" : "none" }} />;
}
function FillBar({ value, max, color }) {
  const pct = Math.min(value / max, 1) * 100;
  return <div style={{ height: 6, background: C.line, borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 6, transition: "width .4s ease" }} /></div>;
}
function RiskBar({ level }) { // 1 low · 2 medium · 3 high
  const labels = { 1: "Low", 2: "Medium", 3: "High" };
  const cols = [C.green, C.amber, C.red];
  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 9, borderRadius: 4, background: i < level ? cols[level - 1] : C.line }} />)}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 11, color: C.slate }}>Falls risk</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: cols[level - 1] }}>{labels[level]}</span>
      </div>
      {level === 3 && <div style={{ fontSize: 11.5, color: C.redText, marginTop: 6, fontWeight: 600 }}>⚠ High falls risk — check hourly, sensor mat on, call bell in reach.</div>}
    </div>
  );
}
const softFor = (c) => (c === C.green ? C.greenSoft : c === C.amber ? C.amberSoft : c === C.red ? C.redSoft : "#efe9ec");

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.white, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, boxShadow: "0 1px 2px rgba(0,0,0,.05)" }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.red }} />
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.yellow }} />
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.green }} />
      </div>
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 17, color: "#ffffff" }}>Genevieve</div>
        <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#f0d8e2", fontWeight: 600 }}>Care &amp; Wellbeing</div>
      </div>
    </div>
  );
}

function Legend() {
  const item = (node, text) => <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.slate }}>{node}<span>{text}</span></div>;
  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 18px", marginTop: 18 }}>
      <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>What you're looking at</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "10px 22px" }}>
        {item(<Dot level="green" />, "Wing safely staffed for the shift")}
        {item(<Dot level="red" />, "Understaffed — act now")}
        {item(<span style={{ width: 10, height: 10, borderRadius: 10, background: C.green }} />, "Carer: RN / EN (qualified nurse)")}
        {item(<span style={{ width: 10, height: 10, borderRadius: 10, background: C.amber }} />, "Carer: PCW / AIN (personal care worker)")}
        {item(<span style={{ fontSize: 12 }}>⚠</span>, "Resident with a clinical alert — tap for their plan")}
        {item(<span style={{ fontSize: 12 }}>🕑</span>, "Care minutes & 24/7 RN — the regulated targets")}
      </div>
      <div style={{ fontSize: 12, color: C.brand, fontWeight: 600, marginTop: 12 }}>Tap any wing to see residents, clinical alerts, contacts and care notes.</div>
    </div>
  );
}

function WingCard({ wingKey, carers, s, presence, onOpen }) {
  const st = wingStatus(wingKey, carers, s);
  const meta = WING_META[wingKey];
  const lv = LEVEL[st.level];
  const total = RESIDENT_COUNT[wingKey];
  const present = presentList(wingKey, presence).length;
  const alertCount = presentList(wingKey, presence).filter((r) => r.alerts && r.alerts.length).length;
  const nurses = carers.filter((c) => c.role !== "PCW").length;
  return (
    <div onClick={() => onOpen(wingKey)} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, boxShadow: "0 1px 2px rgba(36,26,32,.04)", cursor: "pointer", transition: "transform .15s ease, box-shadow .15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(36,26,32,.09)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(36,26,32,.04)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: C.ink }}>{meta.name}</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{meta.sub} · {total} residents</div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: lv.bg, color: lv.text, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 999 }}><Dot level={st.level} size={9} />{lv.label}</div>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 16, alignItems: "flex-end" }}>
        <div><div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, lineHeight: 1, color: st.level === "red" ? C.red : C.ink }}>{st.have}<span style={{ fontSize: 16, color: C.slate, fontWeight: 600 }}> / {st.required}</span></div><div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>carers (have / need)</div></div>
        <div><div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{nurses}</div><div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>nurse{nurses === 1 ? "" : "s"} (RN/EN)</div></div>
      </div>
      <div style={{ marginTop: 14 }}><FillBar value={st.have} max={st.required || 1} color={lv.dot} /></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, minHeight: 24, alignItems: "center" }}>
        {carers.map((cw, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: 600, color: C.ink, background: C.paper, border: `1px solid ${C.line}`, padding: "3px 9px 3px 7px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 7, background: cw.role === "PCW" ? C.amber : C.green }} />{cw.name} <span style={{ fontSize: 10, color: cw.role === "PCW" ? C.amber : C.green, fontWeight: 700 }}>{cw.role}</span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.brandDeep, background: C.brandSoft, padding: "3px 9px", borderRadius: 999 }}>🕑 {present}/{total} in</span>
        {alertCount > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: C.redText, background: C.redSoft, padding: "3px 9px", borderRadius: 999 }}>⚠ {alertCount} clinical</span>}
      </div>
      <div style={{ fontSize: 12, color: C.brand, fontWeight: 600, marginTop: 12 }}>View residents →</div>
    </div>
  );
}

function buildAlerts(wings, s, presence) {
  const staffing = [], clinical = [];
  Object.keys(wings).forEach((k) => {
    const st = wingStatus(k, wings[k], s);
    if (st.level === "red") staffing.push({ level: "red", title: `${WING_META[k].name} understaffed`, body: `${st.have} carers on, needs ${st.required}.` });
    presentList(k, presence).forEach((r) => {
      if (r.falls === 3) clinical.push({ level: "red", title: `${r.name} · high falls risk`, body: `${WING_META[k].name} — hourly checks, sensor mat on.` });
      if (r.alerts && r.alerts.includes("choke")) clinical.push({ level: "amber", title: `${r.name} · aspiration risk`, body: `Texture diet ${DIETS[r.diet]}, supervise meals.` });
      if (r.med) clinical.push({ level: "amber", title: `${r.name} · medication due`, body: r.med });
    });
  });
  return { staffing, clinical };
}

// ---------------------------------------------------------------------------
function Backdrop({ onClose, children }) {
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(36,20,30,.45)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflowY: "auto" }}>{children}</div>;
}
function Section({ title, children, tone }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: tone === "green" ? C.green : C.slate, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {children.map((t, i) => <div key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: C.ink }}><span style={{ color: tone === "green" ? C.green : C.slate }}>{tone === "green" ? "✓" : "•"}</span>{t}</div>)}
      </div>
    </div>
  );
}

function ResidentModal({ resident, wingName, notes, onAddNote, onClose }) {
  const r = resident;
  const w = WELLBEING[r.well];
  const [draft, setDraft] = useState("");
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 480, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, color: C.ink }}>{r.name}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{r.age} · {wingName}</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>✕</button>
        </div>

        {/* clinical alerts */}
        {r.alerts && r.alerts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14 }}>
            {r.alerts.map((a, i) => <span key={i} style={{ fontSize: 12, fontWeight: 700, color: softFor(ALERT_META[a].color) === C.redSoft ? C.redText : ALERT_META[a].color === C.amber ? "#7a6300" : C.slate, background: softFor(ALERT_META[a].color), padding: "4px 10px", borderRadius: 999 }}>⚠ {ALERT_META[a].label}</span>)}
          </div>
        )}

        {/* falls risk */}
        <div style={{ marginTop: 16, background: r.falls === 3 ? C.redSoft : r.falls === 2 ? C.amberSoft : C.greenSoft, borderRadius: 12, padding: "14px 16px" }}>
          <RiskBar level={r.falls} />
        </div>

        {/* diet & mobility */}
        <Section title="Diet & swallowing">{[DIETS[r.diet], FLUIDS[r.fluid], r.alerts && r.alerts.includes("choke") ? "Supervise meals — sit upright, slow pace" : "No feeding supervision flagged"]}</Section>
        <Section title="Mobility & transfers">{[MOBILITY[r.mob], r.falls >= 2 ? "Falls precautions — sensor mat, call bell in reach" : "Standard precautions"]}</Section>

        {/* wellbeing profile */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Wellbeing &amp; behaviour</div>
        <div style={{ background: softFor(w.color), borderRadius: 10, padding: "11px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontSize: 14 }}>💜</span><span style={{ fontWeight: 700, fontSize: 13.5, color: w.color }}>{w.label}</span></div>
          <div style={{ fontSize: 12.5, color: C.ink, marginTop: 5 }}>{w.note}</div>
        </div>

        {/* medication */}
        {r.med && <div style={{ marginTop: 16, background: C.amberSoft, borderRadius: 10, padding: "11px 13px", fontSize: 13, fontWeight: 600, color: "#7a6300" }}>💊 Next medication: {r.med}</div>}

        {/* contacts */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Family &amp; emergency contacts</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(r.contacts || [con(`${r.name}'s next of kin`, "Primary", "On file")]).map((ct, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
              <span><span style={{ fontWeight: 700, fontSize: 13.5 }}>{ct.name}</span><span style={{ fontSize: 12, color: C.slate }}> · {ct.rel}</span></span>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: C.brand }}>{ct.phone}</span>
            </div>
          ))}
        </div>

        {/* care notes */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Care notes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(notes || []).length === 0 && <div style={{ fontSize: 13, color: C.slate, fontStyle: "italic" }}>No notes yet.</div>}
          {(notes || []).map((nt, i) => <div key={i} style={{ background: "#fdf6f9", border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.brand}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: C.ink }}>{nt}</div>)}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a care note…" style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "var(--body)", outline: "none" }} />
          <button onClick={() => { if (draft.trim()) { onAddNote(r.name, draft.trim()); setDraft(""); } }} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 13, padding: "0 16px", borderRadius: 10 }}>Add</button>
        </div>
      </div>
    </Backdrop>
  );
}

function DiningPlanner({ wingKey, presence, onClose }) {
  const residents = presentList(wingKey, presence);
  const assisted = residents.filter((r) => r.mob === "two" || r.mob === "hoist" || r.diet === "pureed" || r.diet === "minced" || (r.alerts && r.alerts.includes("choke")));
  const independent = residents.filter((r) => !assisted.includes(r));
  const textures = [...new Set(residents.map((r) => DIETS[r.diet]))];
  const choke = residents.filter((r) => r.alerts && r.alerts.includes("choke"));
  const tables = [];
  for (let i = 0; i < independent.length; i += 4) tables.push(independent.slice(i, i + 4));
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 620, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Dining &amp; assistance plan</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{WING_META[wingKey].name} · {residents.length} present</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>✕</button>
        </div>

        <div style={{ marginTop: 16, border: `2px solid ${C.brand}`, borderRadius: 14, padding: 16, background: C.brandSoft }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 15 }}>🍽️</span><span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.brandDeep }}>Assisted table (near staff)</span></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {assisted.map((r, i) => <span key={i} style={{ fontSize: 13, fontWeight: 700, color: C.brandDeep, background: C.white, border: `1px solid ${C.brand}55`, padding: "5px 11px", borderRadius: 999 }}>{r.name} · {DIETS[r.diet].split(" (")[0]}{r.mob === "hoist" || r.mob === "two" ? " · " + MOBILITY[r.mob] : ""}</span>)}
            {assisted.length === 0 && <span style={{ fontSize: 13, color: C.slate }}>No residents need feeding assistance this sitting.</span>}
          </div>
          {choke.length > 0 && <div style={{ fontSize: 12.5, color: C.redText, marginTop: 10, fontWeight: 600 }}>⚠ Aspiration risk — full supervision, upright posture: {choke.map((r) => r.name).join(", ")}</div>}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
          {tables.map((tb, i) => <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6 }}>Table {i + 1} · independent</div><div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>{tb.map((r) => r.name).join(", ")}</div></div>)}
        </div>

        <Section title="Texture-modified diets in this sitting">{textures}</Section>
        <div style={{ fontSize: 11.5, color: C.slate, marginTop: 14, lineHeight: 1.5 }}>Built from each resident's diet, mobility and swallowing profile, with companionable residents seated together. Genevieve drafts the plan — the RN signs off.</div>
      </div>
    </Backdrop>
  );
}

function WingModal({ wingKey, carers, s, presence, notesByResident, onClose, onResident, onDining, onToggle }) {
  const st = wingStatus(wingKey, carers, s);
  const meta = WING_META[wingKey];
  const lv = LEVEL[st.level];
  const residents = ROSTER[wingKey];
  const present = presentList(wingKey, presence).length;
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 580, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, color: C.ink }}>{meta.name}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{meta.sub} · {RESIDENT_COUNT[wingKey]} residents · {present} in</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>✕</button>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: lv.bg, color: lv.text, fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: 999, marginTop: 14 }}><Dot level={st.level} size={9} />{lv.label} · {st.have}/{st.required} carers</div>

        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>On shift</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {carers.map((cw, i) => <span key={i} style={{ fontSize: 13, fontWeight: 600, background: C.paper, border: `1px solid ${C.line}`, padding: "5px 11px 5px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: cw.role === "PCW" ? C.amber : C.green }} />{cw.name} <span style={{ color: cw.role === "PCW" ? C.amber : C.green, fontWeight: 700, fontSize: 11 }}>{cw.role}</span></span>)}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 0 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate }}>Residents · {present}/{RESIDENT_COUNT[wingKey]} in — tap for their file</div>
          <button onClick={() => onDining(wingKey)} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 12.5, padding: "7px 12px", borderRadius: 999, boxShadow: "0 3px 10px rgba(126,74,99,.25)" }}>🍽️ Dining plan</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {residents.map((r, i) => {
            const state = presence[`${wingKey}:${r.name}`] || r.presence;
            const inn = state === "in";
            const note = (notesByResident[r.name] || []).length;
            const hi = r.alerts && r.alerts.length;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${hi && inn ? C.red + "44" : C.line}`, background: !inn ? "#f7f3f5" : hi ? C.redSoft : C.white, borderRadius: 12, padding: "9px 10px 9px 12px", opacity: inn ? 1 : 0.72 }}>
                <button onClick={() => onResident(r)} style={{ flex: 1, textAlign: "left", border: "none", background: "transparent", padding: 0, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{r.name} <span style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>{r.age}</span> {hi ? <span style={{ fontSize: 11, color: r.falls === 3 ? C.red : C.amber }}>⚠</span> : null}</span>
                  <span style={{ fontSize: 12, color: C.slate }}>{MOBILITY[r.mob]} · {DIETS[r.diet].split(" (")[0]}{note ? ` · ${note} note${note > 1 ? "s" : ""}` : ""}</span>
                </button>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: inn ? C.greenDeep : C.slate, minWidth: 64, textAlign: "right" }}>{inn ? "In" : state === "appt" ? "Appt" : state === "hospital" ? "Hospital" : "On leave"}</span>
                <button onClick={() => onToggle(wingKey, r.name)} style={{ border: `1px solid ${inn ? C.line : C.brand}`, background: inn ? C.white : C.brand, color: inn ? C.slate : C.white, fontWeight: 700, fontSize: 12, padding: "6px 11px", borderRadius: 999, whiteSpace: "nowrap" }}>{inn ? "Sign out" : "Sign in"}</button>
              </div>
            );
          })}
        </div>
      </div>
    </Backdrop>
  );
}

// ---------------------------------------------------------------------------
// Night rounds — repositioning / falls / continence safety timer + night profiles
const NIGHT = {
  interval: 120, // minutes between repositioning rounds (pressure-injury prevention)
  rn: "Priya (RN)",
  residents: [
    { name: "Dorothy", wing: "Memory Support", state: "settled", note: "Repositioned 11:00pm · 2-hrly turns, pressure care" },
    { name: "Margaret", wing: "Memory Support", state: "restless", note: "Up frequently — sundowning settling, sensor mat on" },
    { name: "Vera", wing: "High Care", state: "settled", note: "Upright 30 min post supper · aspiration risk" },
    { name: "Joan", wing: "Memory Support", state: "falls", note: "High falls risk — hourly checks, bed low, mat armed" },
    { name: "Henry", wing: "High Care", state: "settled", note: "BGL checked, settled" },
  ],
};
const NSTATE = { settled: { label: "Settled", level: "green" }, restless: { label: "Restless", level: "amber" }, falls: { label: "Falls watch", level: "red" } };

function NightRounds() {
  const [ago, setAgo] = useState(135);
  const level = ago >= NIGHT.interval ? "red" : ago >= NIGHT.interval - 20 ? "amber" : "green";
  const label = level === "red" ? "Repositioning round overdue" : level === "amber" ? "Round due soon" : "Rounds up to date";
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>🌙</span>
        <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Night rounds &amp; comfort</div>
        <span style={{ fontSize: 12, color: C.slate }}>2-hourly repositioning · falls &amp; continence checks</span>
      </div>
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 14 }}>The timer keeps the regulated night rounds on schedule — repositioning for pressure-injury prevention, plus falls and continence checks — while each resident's night profile tells staff who needs a closer eye.</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginBottom: 14 }} className="strip">
        <div style={{ background: level === "red" ? C.redSoft : C.white, border: `1px solid ${level === "red" ? C.red + "44" : C.line}`, borderLeft: `6px solid ${LEVEL[level].dot}`, borderRadius: 14, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Dot level={level} size={11} /><span style={{ fontWeight: 800, fontSize: 15, color: LEVEL[level].text }}>{label}</span></div>
            <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: C.ink, marginTop: 6, lineHeight: 1 }}>{Math.floor(ago / 60)}h {ago % 60}m <span style={{ fontSize: 13, color: C.slate, fontWeight: 600 }}>since last round</span></div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>Policy: reposition every {NIGHT.interval / 60} hours</div>
          </div>
          <button onClick={() => setAgo(0)} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 14, padding: "12px 18px", borderRadius: 11, boxShadow: "0 4px 12px rgba(126,74,99,.25)" }}>✓ Log round</button>
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.green}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>RN on duty (24/7)</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: C.ink }}><span style={{ width: 9, height: 9, borderRadius: 9, background: C.green }} />{NIGHT.rn}</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>Onsite all night · call-bell response monitored</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {NIGHT.residents.map((r, i) => {
          const ns = NSTATE[r.state];
          return (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.ink }}>{r.name}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: LEVEL[ns.level].bg, color: LEVEL[ns.level].text, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}><Dot level={ns.level} size={8} />{ns.label}</span>
              </div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>{r.wing}</div>
              <div style={{ fontSize: 12.5, color: C.ink, marginTop: 8 }}>{r.note}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: C.slate, marginTop: 14, lineHeight: 1.5 }}>Safety note: Genevieve prompts and logs the timing of rounds — it does not replace the physical repositioning, falls and continence checks an educator or nurse performs, which remain their clinical responsibility.</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Activities & wellbeing — group sessions by mobility / cognition
const ACTIVITIES = {
  time: "10:30am",
  sessions: [
    { name: "Gentle exercise", suit: "Seated · all mobilities", lead: "Mia (PCW)", people: 9, max: 12, zone: "Lounge" },
    { name: "Music & memories", suit: "Reminiscence · dementia-friendly", lead: "Grace (EN)", people: 8, max: 8, zone: "Memory lounge" },
    { name: "Garden club", suit: "Walking / wheelchair", lead: "Ben (PCW)", people: 5, max: 6, zone: "Courtyard" },
    { name: "Quiet reading nook", suit: "Low stimulus", lead: "Zoe (PCW)", people: 3, max: 8, zone: "Library" },
  ],
};
const actLevel = (a) => (a.people > a.max ? "red" : a.people === a.max ? "amber" : "green");
const actLabel = (a) => (a.people > a.max ? "Over capacity" : a.people === a.max ? "Full" : "Open");

function Activities() {
  const total = ACTIVITIES.sessions.reduce((s, a) => s + a.people, 0);
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>🌷</span>
        <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Activities &amp; wellbeing</div>
        <span style={{ fontSize: 12, color: C.slate }}>{ACTIVITIES.time} · {total} residents engaged</span>
      </div>
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 14 }}>Sessions are grouped by mobility and cognition so every resident has something that suits them — each with a lead, a capacity bar and the same traffic light. Companionship matters as much as care.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {ACTIVITIES.sessions.map((a, i) => {
          const lvl = actLevel(a);
          return (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, borderTop: `4px solid ${LEVEL[lvl].dot}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1.2 }}>{a.name}</div>
                <Dot level={lvl} size={10} />
              </div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>{a.suit}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, margin: "12px 0 6px" }}><span style={{ color: C.slate }}>{a.people}/{a.max} · {a.zone}</span><span style={{ fontWeight: 700, color: LEVEL[lvl].text }}>{actLabel(a)}</span></div>
              <FillBar value={a.people} max={a.max} color={LEVEL[lvl].dot} />
              <div style={{ fontSize: 12, color: C.ink, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: 7, background: C.green }} />Lead: {a.lead}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: C.slate, marginTop: 14, lineHeight: 1.5 }}>Genevieve suggests who suits each session and seats companionable residents together — drawing on its original strength: matching individuals who get along.</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function GenevieveAgedCare() {
  const [scenarioKey, setScenarioKey] = useState("morning");
  const [override, setOverride] = useState(null);
  const [banner, setBanner] = useState(null);
  const [openWing, setOpenWing] = useState(null);
  const [openResident, setOpenResident] = useState(null);
  const [diningWing, setDiningWing] = useState(null);
  const [notesByResident, setNotesByResident] = useState(() => {
    const m = {};
    Object.values(ROSTER).flat().forEach((r) => { if (r.notes) m[r.name] = [...r.notes]; });
    return m;
  });
  const addNote = (name, text) => setNotesByResident((p) => ({ ...p, [name]: [...(p[name] || []), text] }));
  const [presence, setPresence] = useState({});
  const togglePresence = (wingKey, name) => setPresence((p) => { const cur = p[`${wingKey}:${name}`] || ROSTER[wingKey].find((r) => r.name === name).presence; return { ...p, [`${wingKey}:${name}`]: cur === "in" ? "out" : "in" }; });

  const s = SCENARIOS[scenarioKey];
  const wings = override || s.wings;
  useEffect(() => { setOverride(null); setBanner(null); setOpenWing(null); setOpenResident(null); setDiningWing(null); }, [scenarioKey]);

  const alerts = useMemo(() => buildAlerts(wings, s, presence), [wings, s, presence]);
  const worstWing = useMemo(() => (Object.keys(wings).some((k) => wingStatus(k, wings[k], s).level === "red") ? "red" : "green"), [wings, s]);
  const careMinLevel = s.careMin >= CARE_MIN_TARGET ? "green" : s.careMin >= CARE_MIN_TARGET - 8 ? "amber" : "red";
  const worst = worstWing === "red" ? "red" : careMinLevel === "red" ? "red" : careMinLevel === "amber" ? "amber" : "green";
  const redWings = Object.keys(wings).filter((k) => wingStatus(k, wings[k], s).level === "red").length;
  const heroText = worst === "green" ? "Home running on track" : worst === "red" ? (redWings ? `${redWings} wing${redWings > 1 ? "s" : ""} understaffed` : "Care minutes behind target") : "Care minutes to watch";

  const onBalance = () => { const { wings: next, notes } = balance(wings, s); setOverride(next); setBanner(notes); };

  return (
    <div style={{ fontFamily: "var(--body)", background: C.paper, minHeight: "100vh", color: C.ink, padding: "0 0 56px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        :root{ --display:'Plus Jakarta Sans',system-ui,sans-serif; --body:'Inter',system-ui,sans-serif; }
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(248,8,8,.5)}70%{box-shadow:0 0 0 7px rgba(248,8,8,0)}100%{box-shadow:0 0 0 0 rgba(248,8,8,0)}}
        @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box} button{cursor:pointer;font-family:var(--body)}
        @media (max-width:760px){.grid2{grid-template-columns:1fr !important}.wings{grid-template-columns:1fr !important}.strip{grid-template-columns:1fr !important}}
      `}</style>

      <header style={{ background: "linear-gradient(135deg,#5e3349,#9c6f83)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 5, color: "#ffffff" }}>
        <Logo />
        <div style={{ textAlign: "right", lineHeight: 1.2, color: "#ffffff" }}><div style={{ fontWeight: 700, fontSize: 14 }}>Rosewood Aged Care</div><div style={{ fontSize: 12, color: "#f0d8e2" }}>Labrador, Gold Coast QLD</div></div>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
          {Object.keys(SCENARIOS).map((k) => { const active = k === scenarioKey; return <button key={k} onClick={() => setScenarioKey(k)} style={{ border: `1px solid ${active ? C.brand : C.line}`, background: active ? C.brand : C.white, color: active ? C.white : C.ink, fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: 999, transition: "all .15s ease" }}>{SCENARIOS[k].label}</button>; })}
        </div>

        {/* compliance header: care minutes + 24/7 RN */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginTop: 16 }} className="strip">
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `6px solid ${LEVEL[careMinLevel].dot}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>🕑 Care minutes today</span><span style={{ fontSize: 12, fontWeight: 700, color: LEVEL[careMinLevel].text }}>{s.careMin >= CARE_MIN_TARGET ? "On target" : "Below target"}</span></div>
            <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: C.ink, margin: "6px 0 8px", lineHeight: 1 }}>{s.careMin} <span style={{ fontSize: 14, color: C.slate, fontWeight: 600 }}>/ {CARE_MIN_TARGET} min · incl. {RN_MIN_TARGET} RN</span></div>
            <FillBar value={s.careMin} max={CARE_MIN_TARGET} color={LEVEL[careMinLevel].dot} />
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.green}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>RN onsite (24/7)</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: C.green, lineHeight: 1 }}>{s.rn} <span style={{ fontSize: 14, color: C.slate, fontWeight: 600 }}>on duty</span></div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>Requirement met</div>
          </div>
        </div>

        {/* hero + balance */}
        <div style={{ marginTop: 12, background: C.white, border: `1px solid ${C.line}`, borderLeft: `6px solid ${LEVEL[worst].dot}`, borderRadius: 18, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: LEVEL[worst].bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Dot level={worst} size={26} /></div>
            <div><div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>{heroText}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 4, maxWidth: 480 }}>{s.note}</div></div>
          </div>
          <button onClick={onBalance} style={{ background: C.brand, color: C.white, border: "none", fontWeight: 700, fontSize: 15, padding: "14px 22px", borderRadius: 12, boxShadow: "0 4px 14px rgba(126,74,99,.28)", transition: "transform .12s ease" }} onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.97)")} onMouseUp={(e) => (e.currentTarget.style.transform = "none")} onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>⚡ Balance staffing</button>
        </div>

        {banner && <div style={{ marginTop: 12, background: C.brandSoft, border: `1px solid ${C.brand}33`, borderRadius: 14, padding: "14px 18px", animation: "fade .3s ease" }}><div style={{ fontWeight: 700, color: C.brandDeep, fontSize: 13, marginBottom: 6 }}>Genevieve rebalanced the floor</div>{banner.map((n, i) => <div key={i} style={{ fontSize: 13, color: C.ink, display: "flex", gap: 8, marginTop: 2 }}><span style={{ color: C.brand, fontWeight: 700 }}>→</span> {n}</div>)}</div>}

        <Legend />

        <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, marginTop: 18, alignItems: "start" }}>
          <div className="wings" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {Object.keys(wings).map((k) => <WingCard key={k} wingKey={k} carers={wings[k]} s={s} presence={presence} onOpen={setOpenWing} />)}
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, position: "sticky", top: 88 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Live alerts</div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, marginBottom: 8 }}>Staffing</div>
            {alerts.staffing.length === 0 ? <div style={{ background: C.greenSoft, borderRadius: 12, padding: "11px 13px", fontSize: 13, fontWeight: 600, color: C.greenDeep, display: "flex", gap: 8 }}><Dot level="green" size={10} /> All wings safely staffed</div> : alerts.staffing.map((a, i) => <div key={i} style={{ background: LEVEL[a.level].bg, borderRadius: 12, padding: "11px 13px", display: "flex", gap: 10, marginBottom: 8, animation: "fade .25s ease" }}><Dot level={a.level} size={10} /><div><div style={{ fontWeight: 700, fontSize: 13, color: LEVEL[a.level].text }}>{a.title}</div><div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{a.body}</div></div></div>)}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "16px 0 8px" }}>Clinical care</div>
            {alerts.clinical.length === 0 ? <div style={{ fontSize: 13, color: C.slate }}>No clinical alerts.</div> : alerts.clinical.slice(0, 8).map((a, i) => <div key={i} style={{ background: LEVEL[a.level].bg, borderRadius: 12, padding: "11px 13px", display: "flex", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 13 }}>{a.level === "red" ? "⚠" : "•"}</span><div><div style={{ fontWeight: 700, fontSize: 13, color: LEVEL[a.level].text }}>{a.title}</div><div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{a.body}</div></div></div>)}
          </div>
        </div>

        <NightRounds />
        <Activities />

        <div style={{ marginTop: 26, fontSize: 11.5, color: C.slate, lineHeight: 1.5 }}>Care minutes (215/day incl. 44 RN) and the 24/7 registered-nurse requirement reflect the Aged Care Act and Department of Health, Disability and Ageing rules. Genevieve is a decision-support tool to help your team stay organised, safely staffed and person-centred — it does not replace clinical judgement, an RN's assessment, or your obligations under the Act.</div>
      </div>

      {openWing && !diningWing && <WingModal wingKey={openWing} carers={wings[openWing]} s={s} presence={presence} notesByResident={notesByResident} onClose={() => setOpenWing(null)} onResident={(r) => setOpenResident(r)} onDining={(k) => setDiningWing(k)} onToggle={togglePresence} />}
      {openResident && <ResidentModal resident={openResident} wingName={WING_META[openWing]?.name || ""} notes={notesByResident[openResident.name]} onAddNote={addNote} onClose={() => setOpenResident(null)} />}
      {diningWing && <DiningPlanner wingKey={diningWing} presence={presence} onClose={() => setDiningWing(null)} />}
    </div>
  );
}
