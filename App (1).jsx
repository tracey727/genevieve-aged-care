import React, { useState, useMemo, useEffect } from "react";

// ---------------------------------------------------------------------------
// Genevieve · Cattery — boarding cattery operator console
// Brand frame: orange #F77F00 on a lighter-orange page. Status: green/amber/red.
// Decision-support only — does not replace a vet's assessment or your duty of care
// under the QLD code of practice for boarding establishments.
// ---------------------------------------------------------------------------

const C = {
  green: "#008037", greenDeep: "#02622b", greenSoft: "#e7f3ec",
  yellow: "#FFE600", amber: "#caa400", amberSoft: "#fff8cc",
  red: "#f80808", redSoft: "#fde7e7", redText: "#a40606",
  ink: "#3a2412", slate: "#7a6450", line: "#f0e2d2",
  paper: "#fff6ec", white: "#ffffff",
  // Brand accent (cattery orange): buttons / frame / header. Status stays green/amber/red.
  brand: "#F77F00", brandDeep: "#c2410c", brandSoft: "#ffe8d1", pageBg: "#ffe4c4",
};

const ATTENTION_TARGET = 20; // minutes of 1-on-1 attention per cat/day (good-practice target)

const ZONE_META = {
  quiet:  { name: "Quiet Wing",     sub: "Shy & senior cats" },
  sun:    { name: "Sunroom Condos", sub: "Perches & enrichment" },
  family: { name: "Family Suites",  sub: "Bonded pairs & groups" },
  vet:    { name: "Vet Watch",      sub: "Medical & isolation" },
};
const CAT_COUNT = { quiet: 8, sun: 12, family: 10, vet: 5 };
const DAY_RATIO = { quiet: 6, sun: 8, family: 8, vet: 4 };     // cats per carer (day)
const NIGHT_RATIO = { quiet: 10, sun: 12, family: 12, vet: 6 };// cats per carer (night)

// Diet / feeding / handling / clinical-alert / temperament libraries
const DIETS = {
  regular: "Regular adult (wet + dry)", renal: "Renal / kidney (Rx)",
  urinary: "Urinary / FLUTD (Rx)", sensitive: "Sensitive / GI",
  kitten: "Kitten growth", senior: "Senior",
};
const FEED = { free: "Free-fed dry", twice: "2 meals/day", three: "3 small meals", timed: "Timed / portioned" };
const HANDLING = {
  easy: "Easy to handle", caution: "Handle with care",
  gloves: "Gloves / 2-person", noscruff: "No scruffing", solo: "Solo handler only",
};
const ALERT_META = {
  urinary:  { label: "Urinary / FLUTD", color: C.red },
  renal:    { label: "Renal / CKD", color: C.red },
  infection:{ label: "Isolation — infectious", color: C.red },
  newarrival:{ label: "New arrival — settling", color: C.amber },
  diabetic: { label: "Diabetic", color: C.amber },
  asthma:   { label: "Feline asthma", color: C.amber },
  senior:   { label: "Senior care", color: C.amber },
  resourceguard:{ label: "Resource guarder", color: C.amber },
  fiv:      { label: "FIV+ · house solo", color: C.slate },
};
const TEMPER = {
  settled:    { label: "Settled & friendly", color: C.green, note: "Relaxed — enjoys gentle attention and lap time." },
  shy:        { label: "Shy / hides", color: C.amber, note: "Nervous — give a covered hiding box, approach quietly, let them come to you." },
  playful:    { label: "Playful & active", color: C.green, note: "High energy — needs daily wand play and a tall climbing space or gets vocal." },
  vocal:      { label: "Vocal / seeks attention", color: C.amber, note: "Talkative — reassure with routine; check needs (food, litter, company)." },
  territorial:{ label: "Territorial", color: C.red, note: "Does not share — house solo, separate food, water and litter." },
};
// Co-housing compatibility (traffic light)
const COMPAT = {
  green: { label: "Can share", color: C.green },
  amber: { label: "Supervise", color: C.amber },
  red:   { label: "Solo only", color: C.red },
};

const con = (name, rel, phone) => ({ name, rel, phone });

// Cat roster per zone (named subset; zone totals in CAT_COUNT)
const ROSTER = {
  quiet: [
    { name: "Cleo", breed: "Ragdoll", age: "7 yrs", sex: "Female (desexed)", weight: "4.4 kg",
      compat: "red", diet: "renal", feed: "three", handle: "easy", stress: 2, well: "shy",
      alerts: ["renal", "senior", "resourceguard"], med: "5:00pm · renal supplement",
      vacc: "F3 current (03/2027) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 41, stress: 58, hydration: 47, rest: 74 },
      litter: { lastClean: "07:55", urine: "Increased x4 - watch", stool: "Normal x1", flag: true },
      contacts: [con("Lisa Grant", "Owner", "0412 330 771"), con("Coomera Vet", "Vet", "07 5573 1100")],
      notes: ["Long coat - daily groom to prevent matting.", "Owner: feed renal diet only, no treats. Resource guards - feed alone."] },
    { name: "Smokey", breed: "British Shorthair", age: "9 yrs", sex: "Male (desexed)", weight: "6.0 kg",
      compat: "amber", diet: "senior", feed: "twice", handle: "caution", stress: 2, well: "shy",
      alerts: ["senior"], med: null, vacc: "F3 current (08/2026) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 38, stress: 49, hydration: 66, rest: 80 },
      litter: { lastClean: "08:10", urine: "Normal x2", stool: "Normal x1", flag: false },
      contacts: [con("Mark Webb", "Owner", "0419 552 030")],
      notes: ["Hides at the back - quiet approach, let him settle before handling."] },
    { name: "Pippin", breed: "Domestic Shorthair", age: "13 yrs", sex: "Female (desexed)", weight: "3.6 kg",
      compat: "red", diet: "senior", feed: "three", handle: "noscruff", stress: 1, well: "settled",
      alerts: ["senior"], med: "8:00am · arthritis pain relief", vacc: "F3 current (01/2027) · FIV/FeLV neg",
      presence: "in", sensors: { activity: 30, stress: 35, hydration: 70, rest: 85 },
      litter: { lastClean: "08:05", urine: "Normal x2", stool: "Normal x1", flag: false },
      contacts: [con("Gail Turner", "Owner", "0419 220 553")],
      notes: ["Arthritic - low-sided litter tray, easy-access bed, no scruffing."] },
  ],
  sun: [
    { name: "Biscuit", breed: "Bengal", age: "2 yrs", sex: "Male (desexed)", weight: "5.8 kg",
      compat: "green", diet: "regular", feed: "timed", handle: "easy", stress: 1, well: "playful",
      alerts: [], med: null, vacc: "F3 current (09/2026) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 91, stress: 22, hydration: 70, rest: 52 },
      litter: { lastClean: "09:10", urine: "Normal x2", stool: "Normal x1", flag: false },
      contacts: [con("Amara Lee", "Owner", "0423 551 884")],
      notes: ["Very high energy - wand play + climbing twice daily or he gets vocal.", "Puzzle feeder for enrichment."] },
    { name: "Miso", breed: "Domestic Shorthair", age: "4 yrs", sex: "Male (desexed)", weight: "5.1 kg",
      compat: "amber", diet: "regular", feed: "twice", handle: "easy", stress: 1, well: "settled",
      alerts: ["asthma"], med: null, vacc: "F3 current (11/2026) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 72, stress: 28, hydration: 80, rest: 68 },
      litter: { lastClean: "08:40", urine: "Normal x2", stool: "Normal x1", flag: false },
      contacts: [con("Jess Pollard", "Owner", "0410 223 670"), con("Coomera Vet", "Vet", "07 5573 1100")],
      notes: ["Mild asthma - keep dust low, use low-dust litter. Allergic to chicken."] },
    { name: "Luna", breed: "Siamese", age: "3 yrs", sex: "Female (desexed)", weight: "3.9 kg",
      compat: "amber", diet: "regular", feed: "twice", handle: "easy", stress: 2, well: "vocal",
      alerts: [], med: null, vacc: "F3 current (06/2026) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 68, stress: 52, hydration: 64, rest: 60 },
      litter: { lastClean: "08:50", urine: "Normal x3", stool: "Normal x1", flag: false },
      contacts: [con("Priya Nair", "Owner", "0412 660 200")],
      notes: ["Very vocal - settles with routine and a window perch."] },
    { name: "Oscar", breed: "Maine Coon", age: "5 yrs", sex: "Male (desexed)", weight: "7.4 kg",
      compat: "green", diet: "regular", feed: "twice", handle: "easy", stress: 1, well: "settled",
      alerts: [], med: null, vacc: "F3 current (02/2027) · FIV/FeLV neg", presence: "out",
      sensors: { activity: 60, stress: 25, hydration: 72, rest: 70 },
      litter: { lastClean: "09:00", urine: "Normal x2", stool: "Normal x1", flag: false },
      contacts: [con("Tom Reed", "Owner", "0401 556 233")],
      notes: ["Big boy - needs an XL litter tray and a sturdy perch. Daily groom for coat."] },
  ],
  family: [
    { name: "Bonnie", breed: "Domestic Shorthair", age: "4 yrs", sex: "Female (desexed)", weight: "4.2 kg",
      compat: "green", diet: "regular", feed: "twice", handle: "easy", stress: 1, well: "settled",
      alerts: [], med: null, vacc: "F3 current (10/2026) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 64, stress: 24, hydration: 75, rest: 72 },
      litter: { lastClean: "08:30", urine: "Normal x2", stool: "Normal x1", flag: false },
      contacts: [con("Helen Brooks", "Owner", "0419 887 540")],
      notes: ["Bonded pair with Clyde - must be housed together, settles them both."] },
    { name: "Clyde", breed: "Domestic Shorthair", age: "4 yrs", sex: "Male (desexed)", weight: "5.0 kg",
      compat: "green", diet: "regular", feed: "twice", handle: "easy", stress: 1, well: "playful",
      alerts: [], med: null, vacc: "F3 current (10/2026) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 78, stress: 26, hydration: 70, rest: 66 },
      litter: { lastClean: "08:30", urine: "Normal x2", stool: "Normal x1", flag: false },
      contacts: [con("Helen Brooks", "Owner", "0419 887 540")],
      notes: ["Bonded pair with Bonnie. Confident - leads play."] },
    { name: "Willow", breed: "Domestic Longhair", age: "6 yrs", sex: "Female (desexed)", weight: "4.6 kg",
      compat: "amber", diet: "sensitive", feed: "three", handle: "caution", stress: 2, well: "shy",
      alerts: ["resourceguard"], med: null, vacc: "F3 current (04/2027) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 48, stress: 55, hydration: 60, rest: 70 },
      litter: { lastClean: "08:35", urine: "Normal x2", stool: "Soft x1 - watch", flag: false },
      contacts: [con("Sandra Cole", "Owner", "0410 442 889")],
      notes: ["Sensitive stomach - strict diet, no swapping. Feed away from others."] },
  ],
  vet: [
    { name: "Ginger", breed: "Domestic Shorthair", age: "3 yrs", sex: "Male (desexed)", weight: "5.5 kg",
      compat: "red", diet: "urinary", feed: "timed", handle: "caution", stress: 3, well: "vocal",
      alerts: ["urinary"], med: "9:00am & 6:00pm · urinary support",
      vacc: "F3 current (07/2026) · FIV/FeLV neg", presence: "in",
      sensors: { activity: 35, stress: 72, hydration: 40, rest: 50 },
      litter: { lastClean: "07:40", urine: "Straining - small amounts", stool: "Normal x1", flag: true },
      contacts: [con("Robert Shaw", "Owner", "0412 098 551"), con("Coomera Vet - 24h", "Vet", "07 5573 1100")],
      notes: ["FLUTD - a blocked male is a life-threatening emergency. Any straining or no urine output = vet NOW.", "Encourage water, wet urinary diet only."] },
    { name: "Salem", breed: "Domestic Shorthair", age: "1 yr", sex: "Male (desexed)", weight: "4.0 kg",
      compat: "red", diet: "regular", feed: "twice", handle: "gloves", stress: 3, well: "shy",
      alerts: ["newarrival", "infection"], med: null, vacc: "F3 (settling in) · FIV/FeLV neg",
      presence: "in", sensors: { activity: 44, stress: 68, hydration: 62, rest: 55 },
      litter: { lastClean: "08:00", urine: "Normal x2", stool: "Loose x2 - watch", flag: true },
      contacts: [con("Dana Price", "Owner", "0423 771 600")],
      notes: ["New arrival in isolation - possible cat flu, mild eye discharge. Dedicated equipment, wash hands, gloves.", "Keep separated from all other cats for now."] },
    { name: "Mittens", breed: "Ragdoll", age: "8 yrs", sex: "Female (desexed)", weight: "4.8 kg",
      compat: "red", diet: "sensitive", feed: "three", handle: "noscruff", stress: 2, well: "settled",
      alerts: ["senior"], med: "Post-op wound check daily", vacc: "F3 current (12/2026) · FIV/FeLV neg",
      presence: "in", sensors: { activity: 40, stress: 45, hydration: 68, rest: 78 },
      litter: { lastClean: "08:15", urine: "Normal x2", stool: "Normal x1", flag: false },
      contacts: [con("Ken Diaz", "Owner", "0419 220 110")],
      notes: ["Recovering from dental surgery - soft food, quiet, check wound and appetite daily."] },
  ],
};

const W = (name, role) => ({ name, role }); // role: 'Senior' | 'Carer' | 'Assistant'

const SCENARIOS = {
  morning: {
    label: "Morning · 8:00am", ratio: "day", attentionMin: 20,
    note: "Full clean and breakfast done. Every zone covered and cats getting their morning attention.",
    zones: {
      quiet:  [W("Tracey", "Senior"), W("Sam", "Carer")],
      sun:    [W("Jess", "Carer"), W("Mia", "Carer")],
      family: [W("Amara", "Carer"), W("Ben", "Assistant")],
      vet:    [W("Priya", "Senior"), W("Liam", "Carer")],
    },
  },
  afternoon: {
    label: "Afternoon · 2:00pm", ratio: "day", attentionMin: 18,
    note: "A carer is doing a vet run for Ginger - Vet Watch is now short. Balance to keep isolation safely covered.",
    zones: {
      quiet:  [W("Tracey", "Senior"), W("Sam", "Carer")],
      sun:    [W("Jess", "Carer"), W("Mia", "Carer"), W("Eli", "Assistant")],
      family: [W("Amara", "Carer"), W("Ben", "Assistant")],
      vet:    [W("Priya", "Senior")],
    },
  },
  night: {
    label: "Night · 9:00pm", ratio: "night", attentionMin: 0,
    note: "Cats settled for the night. Fewer staff, dim lighting, and the last litter and comfort round in focus.",
    zones: {
      quiet:  [W("Sam", "Carer")],
      sun:    [W("Mia", "Carer")],
      family: [W("Ben", "Assistant")],
      vet:    [W("Priya", "Senior")],
    },
  },
};

const ratioSet = (s) => (s.ratio === "night" ? NIGHT_RATIO : DAY_RATIO);
const reqCarers = (zoneKey, s) => Math.ceil(CAT_COUNT[zoneKey] / ratioSet(s)[zoneKey]);
const presentList = (zoneKey, presence) =>
  ROSTER[zoneKey].filter((r) => (presence[`${zoneKey}:${r.name}`] || r.presence) === "in");

function zoneStatus(zoneKey, carers, s) {
  const required = reqCarers(zoneKey, s);
  const have = carers.length;
  if (have < required) return { level: "red", required, have };
  return { level: "green", required, have };
}

const LEVEL = {
  green:  { dot: C.green, bg: C.greenSoft, text: C.greenDeep, label: "Covered" },
  amber:  { dot: C.amber, bg: C.amberSoft, text: "#7a6300", label: "Watch" },
  red:    { dot: C.red, bg: C.redSoft, text: C.redText, label: "Short-staffed" },
  closed: { dot: "#c8bbac", bg: "#f3ede6", text: C.slate, label: "-" },
};

// Persisted state helper (falls back to in-memory if storage is unavailable)
function usePersistent(key, initial) {
  const [v, setV] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
}

// Optimiser: move a spare carer (prefer Assistant) from a surplus zone to a short one
function balance(zones, s) {
  const next = JSON.parse(JSON.stringify(zones));
  const notes = [];
  const keys = ["quiet", "sun", "family", "vet"];
  const takeSpare = (k) => {
    const arr = next[k];
    if (arr.length <= reqCarers(k, s)) return null;
    const pi = arr.findIndex((c) => c.role === "Assistant");
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
      notes.push(`Moved ${moved.name} (${moved.role}) -> ${ZONE_META[k].name} to keep it safely covered.`);
    }
  });
  if (notes.length === 0) notes.push("Every zone is covered for this shift - nothing to change.");
  return { zones: next, notes };
}

// ---------------------------------------------------------------------------
function Dot({ level, size = 12 }) {
  return <span style={{ width: size, height: size, borderRadius: size, background: LEVEL[level].dot, display: "inline-block", flexShrink: 0, animation: level === "red" ? "pulse 1.6s infinite" : "none" }} />;
}
function FillBar({ value, max, color }) {
  const pct = Math.min(value / (max || 1), 1) * 100;
  return <div style={{ height: 6, background: C.line, borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 6, transition: "width .4s ease" }} /></div>;
}
function StressBar({ level }) { // 1 low · 2 medium · 3 high (FIC / stress risk)
  const labels = { 1: "Low", 2: "Medium", 3: "High" };
  const cols = [C.green, C.amber, C.red];
  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>{[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 9, borderRadius: 4, background: i < level ? cols[level - 1] : C.line }} />)}</div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ fontSize: 11, color: C.slate }}>Stress / FIC risk</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: cols[level - 1] }}>{labels[level]}</span>
      </div>
      {level === 3 && <div style={{ fontSize: 11.5, color: C.redText, marginTop: 6, fontWeight: 600 }}>High stress - covered hiding box, vertical space, Feliway, minimise handling. Stress can trigger cystitis (FIC).</div>}
    </div>
  );
}
// Wellbeing sensor bar (activity / stress / hydration / rest). invert = high is bad.
function SensorBar({ label, value, hint, invert }) {
  let colour = C.green;
  if (!invert) colour = value < 35 ? C.red : value < 65 ? C.amber : C.green;
  else colour = value > 65 ? C.red : value > 35 ? C.amber : C.green;
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, fontWeight: 700, color: C.ink }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: colour }}>{value}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 6, background: C.line, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: colour, borderRadius: 6, transition: "width .4s ease" }} />
      </div>
      {hint && <div style={{ fontSize: 11, color: C.slate, marginTop: 3 }}>{hint}</div>}
    </div>
  );
}
// Even-sized toggle - every switch is identical (48x26 track, 20px knob)
function Toggle({ on, onClick, ariaLabel }) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} aria-pressed={on}
      style={{ width: 48, height: 26, minWidth: 48, borderRadius: 13, border: "none", padding: 0, position: "relative",
        background: on ? C.green : "#d9c6b0", transition: "background .18s ease", flexShrink: 0, boxShadow: "inset 0 1px 2px rgba(0,0,0,.12)" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 25 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .18s ease", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
    </button>
  );
}
const softFor = (c) => (c === C.green ? C.greenSoft : c === C.amber ? C.amberSoft : c === C.red ? C.redSoft : "#f3ede6");
function CompatBadge({ level }) {
  const m = COMPAT[level];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: softFor(m.color), color: m.color === C.amber ? "#7a6300" : m.color === C.red ? C.redText : C.greenDeep, fontSize: 12, fontWeight: 700, padding: "4px 11px", borderRadius: 999 }}><span style={{ width: 9, height: 9, borderRadius: 9, background: m.color }} />{m.label}</span>;
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: C.white, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, boxShadow: "0 1px 2px rgba(0,0,0,.05)" }}>
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.red }} />
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.yellow }} />
        <span style={{ width: 9, height: 9, borderRadius: 9, background: C.green }} />
      </div>
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 17, color: "#fff" }}>Genevieve</div>
        <div style={{ fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "#ffe3c4", fontWeight: 600 }}>Cattery Care</div>
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
        {item(<Dot level="green" />, "Zone safely covered for the shift")}
        {item(<Dot level="red" />, "Short-staffed - act now")}
        {item(<span style={{ width: 10, height: 10, borderRadius: 10, background: C.green }} />, "Compatible - can share a space")}
        {item(<span style={{ width: 10, height: 10, borderRadius: 10, background: C.red }} />, "Solo only - territorial or medical")}
        {item(<span style={{ fontSize: 12 }}>!</span>, "Cat with a health alert - tap for their care plan")}
        {item(<span style={{ fontSize: 12 }}>L</span>, "Litter flag - abnormal output, monitor closely")}
      </div>
      <div style={{ fontSize: 12, color: C.brand, fontWeight: 600, marginTop: 12 }}>Tap any zone to see cats, health alerts, owners and care notes.</div>
    </div>
  );
}

function ZoneCard({ zoneKey, carers, s, presence, onOpen }) {
  const st = zoneStatus(zoneKey, carers, s);
  const meta = ZONE_META[zoneKey];
  const lv = LEVEL[st.level];
  const total = CAT_COUNT[zoneKey];
  const present = presentList(zoneKey, presence).length;
  const alertCount = presentList(zoneKey, presence).filter((r) => (r.alerts && r.alerts.length) || r.litter.flag).length;
  const seniors = carers.filter((c) => c.role === "Senior").length;
  return (
    <div onClick={() => onOpen(zoneKey)} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, boxShadow: "0 1px 2px rgba(58,36,18,.04)", cursor: "pointer", transition: "transform .15s ease, box-shadow .15s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(58,36,18,.10)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 2px rgba(58,36,18,.04)"; }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 18, color: C.ink }}>{meta.name}</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{meta.sub} · {total} cats</div>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: lv.bg, color: lv.text, fontSize: 12, fontWeight: 700, padding: "5px 10px", borderRadius: 999 }}><Dot level={st.level} size={9} />{lv.label}</div>
      </div>
      <div style={{ display: "flex", gap: 22, marginTop: 16, alignItems: "flex-end" }}>
        <div><div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, lineHeight: 1, color: st.level === "red" ? C.red : C.ink }}>{st.have}<span style={{ fontSize: 16, color: C.slate, fontWeight: 600 }}> / {st.required}</span></div><div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>carers (have / need)</div></div>
        <div><div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{present}</div><div style={{ fontSize: 11, color: C.slate, marginTop: 4 }}>boarding now</div></div>
      </div>
      <div style={{ marginTop: 14 }}><FillBar value={st.have} max={st.required || 1} color={lv.dot} /></div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 14, minHeight: 24, alignItems: "center" }}>
        {carers.map((cw, i) => (
          <span key={i} style={{ fontSize: 12, fontWeight: 600, color: C.ink, background: C.paper, border: `1px solid ${C.line}`, padding: "3px 9px 3px 7px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: 7, background: cw.role === "Assistant" ? C.amber : C.green }} />{cw.name} <span style={{ fontSize: 10, color: cw.role === "Assistant" ? C.amber : C.green, fontWeight: 700 }}>{cw.role}</span>
          </span>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {alertCount > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: C.redText, background: C.redSoft, padding: "3px 9px", borderRadius: 999 }}>! {alertCount} health</span>}
        {seniors > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: C.greenDeep, background: C.greenSoft, padding: "3px 9px", borderRadius: 999 }}>* {seniors} senior carer</span>}
      </div>
      <div style={{ fontSize: 12, color: C.brand, fontWeight: 600, marginTop: 12 }}>View cats →</div>
    </div>
  );
}

function buildAlerts(zones, s, presence) {
  const staffing = [], health = [];
  Object.keys(zones).forEach((k) => {
    const st = zoneStatus(k, zones[k], s);
    if (st.level === "red") staffing.push({ level: "red", title: `${ZONE_META[k].name} short-staffed`, body: `${st.have} carer on, needs ${st.required}.` });
    presentList(k, presence).forEach((r) => {
      if (r.alerts && r.alerts.includes("urinary")) health.push({ level: "red", title: `${r.name} · urinary / FLUTD`, body: `${ZONE_META[k].name} - watch for straining; blocked male = emergency.` });
      if (r.litter.flag) health.push({ level: r.alerts && r.alerts.includes("urinary") ? "red" : "amber", title: `${r.name} · litter flag`, body: `${r.litter.urine}` });
      if (r.alerts && r.alerts.includes("infection")) health.push({ level: "red", title: `${r.name} · isolation`, body: `${ZONE_META[k].name} - infectious precautions, dedicated equipment.` });
      if (r.sensors.stress >= 65) health.push({ level: "amber", title: `${r.name} · high stress`, body: "Hiding box, quiet, Feliway - FIC risk." });
      if (r.med) health.push({ level: "amber", title: `${r.name} · medication`, body: r.med });
    });
  });
  return { staffing, health };
}

// ---------------------------------------------------------------------------
function Backdrop({ onClose, children }) {
  return <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(58,36,18,.45)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "5vh 16px", overflowY: "auto" }}>{children}</div>;
}
function Section({ title, children, tone }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: tone === "green" ? C.green : C.slate, marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {children.map((t, i) => <div key={i} style={{ display: "flex", gap: 8, fontSize: 13.5, color: C.ink }}><span style={{ color: tone === "green" ? C.green : C.slate }}>{tone === "green" ? "+" : "·"}</span>{t}</div>)}
      </div>
    </div>
  );
}

const CARE_ITEMS = [
  ["litterCleaned", "Litter scooped"],
  ["fedAM", "Fed - morning"],
  ["fedPM", "Fed - evening"],
  ["freshWater", "Fresh water topped up"],
  ["medication", "Medication given"],
  ["groomed", "Groomed / coat check"],
  ["enrichment", "Play / enrichment"],
  ["healthCheck", "Health check (eyes, appetite, output)"],
  ["hideBox", "Hiding box in place"],
  ["pheromone", "Feliway / pheromone on"],
];

function Row({ k, v, warn, last }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: last ? "none" : `1px solid ${C.line}` }}>
      <span style={{ fontSize: 12.5, color: C.slate }}>{k}</span>
      <span style={{ fontSize: 12.5, fontWeight: warn ? 700 : 600, color: warn ? C.redText : C.ink, textAlign: "right", maxWidth: "62%" }}>{v}</span>
    </div>
  );
}

function CatModal({ cat, zoneName, notes, care, onToggleCare, onAddNote, onClose }) {
  const r = cat;
  const w = TEMPER[r.well];
  const [draft, setDraft] = useState("");
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 480, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, color: C.ink }}>{r.name}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{r.breed} · {r.age} · {r.sex}</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>x</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, alignItems: "center" }}>
          <CompatBadge level={r.compat} />
          <span style={{ fontSize: 12, color: C.slate }}>{r.weight} · {zoneName}</span>
        </div>

        {/* health alert chips */}
        {r.alerts && r.alerts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {r.alerts.map((a, i) => <span key={i} style={{ fontSize: 12, fontWeight: 700, color: ALERT_META[a].color === C.red ? C.redText : ALERT_META[a].color === C.amber ? "#7a6300" : C.slate, background: softFor(ALERT_META[a].color), padding: "4px 10px", borderRadius: 999 }}>! {ALERT_META[a].label}</span>)}
          </div>
        )}

        {/* stress / FIC risk */}
        <div style={{ marginTop: 16, background: r.stress === 3 ? C.redSoft : r.stress === 2 ? C.amberSoft : C.greenSoft, borderRadius: 12, padding: "14px 16px" }}>
          <StressBar level={r.stress} />
        </div>

        {/* sensor monitoring */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 10px" }}>Sensor monitoring</div>
        <SensorBar label="Activity" value={r.sensors.activity} hint="Movement & play over 24h" />
        <SensorBar label="Stress / reactivity" value={r.sensors.stress} invert hint="Higher = more hiding / tension - early FIC warning" />
        <SensorBar label="Hydration" value={r.sensors.hydration} hint="Water intake - key for kidney & urinary health" />
        <SensorBar label="Rest quality" value={r.sensors.rest} hint="Settled sleep cycles" />

        {/* litter & toileting */}
        <div style={{ marginTop: 16, background: r.litter.flag ? C.redSoft : C.greenSoft, borderRadius: 12, padding: "13px 15px" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: r.litter.flag ? C.redText : C.greenDeep, marginBottom: 7 }}>Litter & toileting</div>
          <Row k="Last scooped" v={r.litter.lastClean} />
          <Row k="Urination" v={r.litter.urine} warn={r.litter.urine.toLowerCase().includes("strain") || r.litter.urine.toLowerCase().includes("increas")} />
          <Row k="Stool" v={r.litter.stool} warn={r.litter.stool.toLowerCase().includes("loose") || r.litter.stool.toLowerCase().includes("soft")} last />
          {r.litter.flag && <div style={{ fontSize: 12, color: C.redText, marginTop: 8, fontWeight: 600 }}>Flagged - abnormal output. Monitor; straining or no urine (esp. males) is a same-day vet emergency.</div>}
        </div>

        <Section title="Diet & feeding">{[DIETS[r.diet], FEED[r.feed], r.alerts && r.alerts.includes("resourceguard") ? "Resource guarder - feed alone, separate bowls" : "No feeding conflicts flagged"]}</Section>
        <Section title="Handling & care">{[HANDLING[r.handle], `Vaccination: ${r.vacc}`]}</Section>

        {/* temperament */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Temperament</div>
        <div style={{ background: softFor(w.color), borderRadius: 10, padding: "11px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ fontWeight: 700, fontSize: 13.5, color: w.color === C.amber ? "#7a6300" : w.color === C.red ? C.redText : C.greenDeep }}>{w.label}</span></div>
          <div style={{ fontSize: 12.5, color: C.ink, marginTop: 5 }}>{w.note}</div>
        </div>

        {r.med && <div style={{ marginTop: 16, background: C.amberSoft, borderRadius: 10, padding: "11px 13px", fontSize: 13, fontWeight: 600, color: "#7a6300" }}>Medication: {r.med}</div>}

        {/* owner & vet contacts */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Owner &amp; vet contacts</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(r.contacts || [con(`${r.name}'s owner`, "Owner", "On file")]).map((ct, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: C.paper, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px" }}>
              <span><span style={{ fontWeight: 700, fontSize: 13.5 }}>{ct.name}</span><span style={{ fontSize: 12, color: C.slate }}> · {ct.rel}</span></span>
              <span style={{ fontWeight: 700, fontSize: 13.5, color: C.brand }}>{ct.phone}</span>
            </div>
          ))}
        </div>

        {/* care checklist - even-sized toggles */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 4px" }}>Care checklist</div>
        <div>
          {CARE_ITEMS.map(([key, label], i) => (
            <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < CARE_ITEMS.length - 1 ? `1px solid ${C.line}` : "none" }}>
              <span style={{ fontSize: 14, color: C.ink }}>{label}</span>
              <Toggle on={!!care[key]} onClick={() => onToggleCare(r.name, key)} ariaLabel={label} />
            </div>
          ))}
        </div>

        {/* care notes */}
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>Care notes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(notes || []).length === 0 && <div style={{ fontSize: 13, color: C.slate, fontStyle: "italic" }}>No notes yet.</div>}
          {(notes || []).map((nt, i) => <div key={i} style={{ background: C.paper, border: `1px solid ${C.line}`, borderLeft: `3px solid ${C.brand}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, color: C.ink }}>{nt}</div>)}
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Add a care note..." style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 10, padding: "9px 12px", fontSize: 13, fontFamily: "var(--body)", outline: "none" }} />
          <button onClick={() => { if (draft.trim()) { onAddNote(r.name, draft.trim()); setDraft(""); } }} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 13, padding: "0 16px", borderRadius: 10 }}>Add</button>
        </div>
      </div>
    </Backdrop>
  );
}

function FeedingPlanner({ zoneKey, presence, onClose }) {
  const cats = presentList(zoneKey, presence);
  const separate = cats.filter((r) => (r.alerts && (r.alerts.includes("resourceguard") || r.alerts.includes("infection"))) || ["renal", "urinary", "sensitive"].includes(r.diet));
  const shared = cats.filter((r) => !separate.includes(r));
  const diets = [...new Set(cats.map((r) => DIETS[r.diet]))];
  const groups = [];
  for (let i = 0; i < shared.length; i += 3) groups.push(shared.slice(i, i + 3));
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 620, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Feeding &amp; separation plan</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{ZONE_META[zoneKey].name} · {cats.length} cats present</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>x</button>
        </div>

        <div style={{ marginTop: 16, border: `2px solid ${C.brand}`, borderRadius: 14, padding: 16, background: C.brandSoft }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.brandDeep }}>Feed separately</span></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {separate.map((r, i) => <span key={i} style={{ fontSize: 13, fontWeight: 700, color: C.brandDeep, background: C.white, border: `1px solid ${C.brand}55`, padding: "5px 11px", borderRadius: 999 }}>{r.name} · {DIETS[r.diet].split(" (")[0]}</span>)}
            {separate.length === 0 && <span style={{ fontSize: 13, color: C.slate }}>No cats need separate feeding this round.</span>}
          </div>
          <div style={{ fontSize: 12.5, color: C.slate, marginTop: 10 }}>Prescription diets, resource guarders and isolation cats eat alone - never share bowls, and feed away from litter trays.</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, marginTop: 12 }}>
          {groups.map((g, i) => <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: 12 }}><div style={{ fontSize: 12, fontWeight: 700, color: C.slate, marginBottom: 6 }}>Station {i + 1} · regular</div><div style={{ fontSize: 13, color: C.ink, lineHeight: 1.6 }}>{g.map((r) => r.name).join(", ")}</div></div>)}
        </div>

        <Section title="Diets in this round">{diets}</Section>
        <div style={{ fontSize: 11.5, color: C.slate, marginTop: 14, lineHeight: 1.5 }}>Built from each cat's diet and flags. Genevieve drafts the plan - a carer confirms it.</div>
      </div>
    </Backdrop>
  );
}

function ZoneModal({ zoneKey, carers, s, presence, notesByCat, onClose, onCat, onFeeding, onToggle }) {
  const st = zoneStatus(zoneKey, carers, s);
  const meta = ZONE_META[zoneKey];
  const lv = LEVEL[st.level];
  const cats = ROSTER[zoneKey];
  const present = presentList(zoneKey, presence).length;
  return (
    <Backdrop onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.white, borderRadius: 18, width: "100%", maxWidth: 580, padding: 24, boxShadow: "0 24px 60px rgba(0,0,0,.25)", animation: "fade .2s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 22, color: C.ink }}>{meta.name}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 2 }}>{meta.sub} · {CAT_COUNT[zoneKey]} cats · {present} boarding</div></div>
          <button onClick={onClose} style={{ border: "none", background: C.paper, width: 32, height: 32, borderRadius: 999, fontSize: 16, color: C.slate }}>x</button>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: lv.bg, color: lv.text, fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: 999, marginTop: 14 }}><Dot level={st.level} size={9} />{lv.label} · {st.have}/{st.required} carers</div>

        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "18px 0 8px" }}>On shift</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {carers.map((cw, i) => <span key={i} style={{ fontSize: 13, fontWeight: 600, background: C.paper, border: `1px solid ${C.line}`, padding: "5px 11px 5px 9px", borderRadius: 999, display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: cw.role === "Assistant" ? C.amber : C.green }} />{cw.name} <span style={{ color: cw.role === "Assistant" ? C.amber : C.green, fontWeight: 700, fontSize: 11 }}>{cw.role}</span></span>)}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "18px 0 8px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate }}>Cats · {present}/{CAT_COUNT[zoneKey]} boarding - tap for their file</div>
          <button onClick={() => onFeeding(zoneKey)} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 12.5, padding: "7px 12px", borderRadius: 999, boxShadow: "0 3px 10px rgba(247,127,0,.25)" }}>Feeding plan</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          {cats.map((r, i) => {
            const state = presence[`${zoneKey}:${r.name}`] || r.presence;
            const inn = state === "in";
            const note = (notesByCat[r.name] || []).length;
            const hi = (r.alerts && r.alerts.length) || r.litter.flag;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${hi && inn ? C.red + "44" : C.line}`, background: !inn ? "#faf4ec" : hi ? C.redSoft : C.white, borderRadius: 12, padding: "9px 10px 9px 12px", opacity: inn ? 1 : 0.72 }}>
                <button onClick={() => onCat(r)} style={{ flex: 1, textAlign: "left", border: "none", background: "transparent", padding: 0, display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{r.name} <span style={{ fontSize: 12, color: C.slate, fontWeight: 600 }}>{r.breed}</span> {hi ? <span style={{ fontSize: 11, color: r.litter.flag ? C.red : C.amber }}>!</span> : null}</span>
                  <span style={{ fontSize: 12, color: C.slate }}>{HANDLING[r.handle]} · {DIETS[r.diet].split(" (")[0]}{note ? ` · ${note} note${note > 1 ? "s" : ""}` : ""}</span>
                </button>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: inn ? C.greenDeep : C.slate, minWidth: 64, textAlign: "right" }}>{inn ? "Boarding" : state === "vet" ? "At vet" : "Collected"}</span>
                <button onClick={() => onToggle(zoneKey, r.name)} style={{ border: `1px solid ${inn ? C.line : C.brand}`, background: inn ? C.white : C.brand, color: inn ? C.slate : C.white, fontWeight: 700, fontSize: 12, padding: "6px 11px", borderRadius: 999, whiteSpace: "nowrap" }}>{inn ? "Collect" : "Check in"}</button>
              </div>
            );
          })}
        </div>
      </div>
    </Backdrop>
  );
}

// ---------------------------------------------------------------------------
// Litter & comfort rounds - scooping / health-check timer + night profiles
const ROUNDS = {
  interval: 240, // minutes between full litter/comfort rounds (scoop 2x day minimum)
  senior: "Priya (Senior carer)",
  cats: [
    { name: "Ginger", zone: "Vet Watch", state: "watch", note: "FLUTD - checking litter hourly for straining / output" },
    { name: "Salem", zone: "Vet Watch", state: "watch", note: "Isolation - loose stool, monitor; dedicated tray & equipment" },
    { name: "Cleo", zone: "Quiet Wing", state: "restless", note: "Increased urination - renal watch, water encouraged" },
    { name: "Pippin", zone: "Quiet Wing", state: "settled", note: "Senior - low litter tray, settled and warm" },
    { name: "Biscuit", zone: "Sunroom", state: "settled", note: "Played out - fed, settled on perch" },
  ],
};
const NSTATE = { settled: { label: "Settled", level: "green" }, restless: { label: "Restless", level: "amber" }, watch: { label: "Close watch", level: "red" } };

function ComfortRounds() {
  const [ago, setAgo] = useState(255);
  const level = ago >= ROUNDS.interval ? "red" : ago >= ROUNDS.interval - 30 ? "amber" : "green";
  const label = level === "red" ? "Litter & comfort round overdue" : level === "amber" ? "Round due soon" : "Rounds up to date";
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Litter &amp; comfort rounds</div>
        <span style={{ fontSize: 12, color: C.slate }}>Scoop, fresh water, health &amp; output checks</span>
      </div>
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 14 }}>The timer keeps litter scooping and comfort checks on schedule - clean trays lower stress and catch urinary problems early. Each cat's profile flags who needs a closer eye overnight.</div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 12, marginBottom: 14 }} className="strip">
        <div style={{ background: level === "red" ? C.redSoft : C.white, border: `1px solid ${level === "red" ? C.red + "44" : C.line}`, borderLeft: `6px solid ${LEVEL[level].dot}`, borderRadius: 14, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Dot level={level} size={11} /><span style={{ fontWeight: 800, fontSize: 15, color: LEVEL[level].text }}>{label}</span></div>
            <div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: C.ink, marginTop: 6, lineHeight: 1 }}>{Math.floor(ago / 60)}h {ago % 60}m <span style={{ fontSize: 13, color: C.slate, fontWeight: 600 }}>since last round</span></div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>Target: scoop & check every {ROUNDS.interval / 60} hours</div>
          </div>
          <button onClick={() => setAgo(0)} style={{ border: "none", background: C.brand, color: C.white, fontWeight: 700, fontSize: 14, padding: "12px 18px", borderRadius: 11, boxShadow: "0 4px 12px rgba(247,127,0,.25)" }}>Log round</button>
        </div>
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.green}`, borderRadius: 14, padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Senior carer on duty</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: C.ink }}><span style={{ width: 9, height: 9, borderRadius: 9, background: C.green }} />{ROUNDS.senior}</div>
          <div style={{ fontSize: 12, color: C.slate, marginTop: 6 }}>Overnight · isolation & medical cats prioritised</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {ROUNDS.cats.map((r, i) => {
          const ns = NSTATE[r.state];
          return (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.ink }}>{r.name}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: LEVEL[ns.level].bg, color: LEVEL[ns.level].text, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}><Dot level={ns.level} size={8} />{ns.label}</span>
              </div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>{r.zone}</div>
              <div style={{ fontSize: 12.5, color: C.ink, marginTop: 8 }}>{r.note}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: C.slate, marginTop: 14, lineHeight: 1.5 }}>Genevieve prompts and logs the timing of rounds - it doesn't replace the physical scooping, feeding and health checks a carer performs, which remain their responsibility.</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enrichment & play - sessions grouped by temperament / energy
const ENRICH = {
  time: "11:00am",
  sessions: [
    { name: "Wand & chase", suit: "High energy · playful", lead: "Jess (Carer)", cats: 4, max: 5, zone: "Sunroom" },
    { name: "Window & sunbathe", suit: "Calm · all cats", lead: "Sam (Carer)", cats: 6, max: 6, zone: "Quiet Wing" },
    { name: "Puzzle feeders", suit: "Food-motivated · solo bowls", lead: "Amara (Carer)", cats: 3, max: 8, zone: "Family Suites" },
    { name: "Gentle handling & groom", suit: "Shy · confidence building", lead: "Priya (Senior)", cats: 2, max: 4, zone: "Vet Watch" },
  ],
};
const actLevel = (a) => (a.cats > a.max ? "red" : a.cats === a.max ? "amber" : "green");
const actLabel = (a) => (a.cats > a.max ? "Over capacity" : a.cats === a.max ? "Full" : "Open");

function Enrichment() {
  const total = ENRICH.sessions.reduce((s, a) => s + a.cats, 0);
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: C.ink }}>Enrichment &amp; play</div>
        <span style={{ fontSize: 12, color: C.slate }}>{ENRICH.time} · {total} cats engaged</span>
      </div>
      <div style={{ fontSize: 13, color: C.slate, marginBottom: 14 }}>Sessions are grouped by temperament and energy so every cat gets enrichment that suits them - solo cats kept apart, shy cats built up gently. Each has a lead, a capacity bar and the same traffic light.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
        {ENRICH.sessions.map((a, i) => {
          const lvl = actLevel(a);
          return (
            <div key={i} style={{ background: C.white, border: `1px solid ${C.line}`, borderTop: `4px solid ${LEVEL[lvl].dot}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1.2 }}>{a.name}</div>
                <Dot level={lvl} size={10} />
              </div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 3 }}>{a.suit}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, margin: "12px 0 6px" }}><span style={{ color: C.slate }}>{a.cats}/{a.max} · {a.zone}</span><span style={{ fontWeight: 700, color: LEVEL[lvl].text }}>{actLabel(a)}</span></div>
              <FillBar value={a.cats} max={a.max} color={LEVEL[lvl].dot} />
              <div style={{ fontSize: 12, color: C.ink, marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 7, height: 7, borderRadius: 7, background: C.green }} />Lead: {a.lead}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 11.5, color: C.slate, marginTop: 14, lineHeight: 1.5 }}>Genevieve suggests who suits each session and keeps incompatible cats apart - drawing on its original strength: matching individuals who get along.</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
export default function GenevieveCattery() {
  const [scenarioKey, setScenarioKey] = useState("morning");
  const [override, setOverride] = useState(null);
  const [banner, setBanner] = useState(null);
  const [openZone, setOpenZone] = useState(null);
  const [openCat, setOpenCat] = useState(null);
  const [feedingZone, setFeedingZone] = useState(null);
  const [presence, setPresence] = useState({});

  const [notesByCat, setNotesByCat] = usePersistent("gcat_notes_v1", (() => {
    const m = {}; Object.values(ROSTER).flat().forEach((r) => { if (r.notes) m[r.name] = [...r.notes]; }); return m;
  })());
  const [careByCat, setCareByCat] = usePersistent("gcat_care_v1", {});

  const addNote = (name, text) => setNotesByCat((p) => ({ ...p, [name]: [...(p[name] || []), text] }));
  const toggleCare = (name, key) => setCareByCat((p) => ({ ...p, [name]: { ...(p[name] || {}), [key]: !(p[name] || {})[key] } }));
  const togglePresence = (zoneKey, name) => setPresence((p) => { const cur = p[`${zoneKey}:${name}`] || ROSTER[zoneKey].find((r) => r.name === name).presence; return { ...p, [`${zoneKey}:${name}`]: cur === "in" ? "out" : "in" }; });

  const s = SCENARIOS[scenarioKey];
  const zones = override || s.zones;
  useEffect(() => { setOverride(null); setBanner(null); setOpenZone(null); setOpenCat(null); setFeedingZone(null); }, [scenarioKey]);

  const alerts = useMemo(() => buildAlerts(zones, s, presence), [zones, s, presence]);
  const worstZone = useMemo(() => (Object.keys(zones).some((k) => zoneStatus(k, zones[k], s).level === "red") ? "red" : "green"), [zones, s]);
  const attnLevel = s.ratio === "night" ? "green" : s.attentionMin >= ATTENTION_TARGET ? "green" : s.attentionMin >= ATTENTION_TARGET - 4 ? "amber" : "red";
  const worst = worstZone === "red" ? "red" : attnLevel === "red" ? "red" : attnLevel === "amber" ? "amber" : "green";
  const redZones = Object.keys(zones).filter((k) => zoneStatus(k, zones[k], s).level === "red").length;
  const heroText = worst === "green" ? "Cattery running on track" : worst === "red" ? (redZones ? `${redZones} zone${redZones > 1 ? "s" : ""} short-staffed` : "Attention time behind target") : "Attention time to watch";

  const onBalance = () => { const { zones: next, notes } = balance(zones, s); setOverride(next); setBanner(notes); };

  return (
    <div style={{ fontFamily: "var(--body)", background: C.pageBg, minHeight: "100vh", color: C.ink, padding: "0 0 56px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        :root{ --display:'Plus Jakarta Sans',system-ui,sans-serif; --body:'Inter',system-ui,sans-serif; }
        @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(248,8,8,.5)}70%{box-shadow:0 0 0 7px rgba(248,8,8,0)}100%{box-shadow:0 0 0 0 rgba(248,8,8,0)}}
        @keyframes fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        *{box-sizing:border-box} button{cursor:pointer;font-family:var(--body)}
        @media (max-width:760px){.grid2{grid-template-columns:1fr !important}.zones{grid-template-columns:1fr !important}.strip{grid-template-columns:1fr !important}}
      `}</style>

      <header style={{ background: "linear-gradient(135deg,#e85d04,#f99845)", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, position: "sticky", top: 0, zIndex: 5, color: "#fff" }}>
        <Logo />
        <div style={{ textAlign: "right", lineHeight: 1.2, color: "#fff" }}><div style={{ fontWeight: 700, fontSize: 14 }}>Sunhaven Boarding Cattery</div><div style={{ fontSize: 12, color: "#ffe3c4" }}>Labrador, Gold Coast QLD</div></div>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ display: "flex", gap: 8, marginTop: 22, flexWrap: "wrap" }}>
          {Object.keys(SCENARIOS).map((k) => { const active = k === scenarioKey; return <button key={k} onClick={() => setScenarioKey(k)} style={{ border: `1px solid ${active ? C.brand : C.line}`, background: active ? C.brand : C.white, color: active ? C.white : C.ink, fontWeight: 600, fontSize: 13, padding: "8px 14px", borderRadius: 999, transition: "all .15s ease" }}>{SCENARIOS[k].label}</button>; })}
        </div>

        {/* compliance header: attention minutes + carers on shift */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginTop: 16 }} className="strip">
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `6px solid ${LEVEL[attnLevel].dot}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}><span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>Attention per cat today</span><span style={{ fontSize: 12, fontWeight: 700, color: LEVEL[attnLevel].text }}>{s.ratio === "night" ? "Settled for night" : s.attentionMin >= ATTENTION_TARGET ? "On target" : "Below target"}</span></div>
            <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: C.ink, margin: "6px 0 8px", lineHeight: 1 }}>{s.attentionMin} <span style={{ fontSize: 14, color: C.slate, fontWeight: 600 }}>/ {ATTENTION_TARGET} min · 1-on-1</span></div>
            <FillBar value={s.ratio === "night" ? ATTENTION_TARGET : s.attentionMin} max={ATTENTION_TARGET} color={LEVEL[attnLevel].dot} />
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderLeft: `5px solid ${C.green}`, borderRadius: 16, padding: "18px 20px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, marginBottom: 6 }}>Carers on shift</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 28, fontWeight: 800, color: C.green, lineHeight: 1 }}>{Object.values(zones).flat().length} <span style={{ fontSize: 14, color: C.slate, fontWeight: 600 }}>on duty</span></div>
            <div style={{ fontSize: 12, color: C.slate, marginTop: 4 }}>{Object.values(ROSTER).flat().length} cats in care</div>
          </div>
        </div>

        {/* hero + balance */}
        <div style={{ marginTop: 12, background: C.white, border: `1px solid ${C.line}`, borderLeft: `6px solid ${LEVEL[worst].dot}`, borderRadius: 18, padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: LEVEL[worst].bg, display: "flex", alignItems: "center", justifyContent: "center" }}><Dot level={worst} size={26} /></div>
            <div><div style={{ fontFamily: "var(--display)", fontSize: 26, fontWeight: 800, color: C.ink, lineHeight: 1.1 }}>{heroText}</div><div style={{ fontSize: 13, color: C.slate, marginTop: 4, maxWidth: 480 }}>{s.note}</div></div>
          </div>
          <button onClick={onBalance} style={{ background: C.brand, color: C.white, border: "none", fontWeight: 700, fontSize: 15, padding: "14px 22px", borderRadius: 12, boxShadow: "0 4px 14px rgba(247,127,0,.30)", transition: "transform .12s ease" }} onMouseDown={(e) => (e.currentTarget.style.transform = "scale(.97)")} onMouseUp={(e) => (e.currentTarget.style.transform = "none")} onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}>Balance staffing</button>
        </div>

        {banner && <div style={{ marginTop: 12, background: C.brandSoft, border: `1px solid ${C.brand}33`, borderRadius: 14, padding: "14px 18px", animation: "fade .3s ease" }}><div style={{ fontWeight: 700, color: C.brandDeep, fontSize: 13, marginBottom: 6 }}>Genevieve rebalanced the floor</div>{banner.map((n, i) => <div key={i} style={{ fontSize: 13, color: C.ink, display: "flex", gap: 8, marginTop: 2 }}><span style={{ color: C.brand, fontWeight: 700 }}>→</span> {n}</div>)}</div>}

        <Legend />

        <div className="grid2" style={{ display: "grid", gridTemplateColumns: "1.55fr 1fr", gap: 18, marginTop: 18, alignItems: "start" }}>
          <div className="zones" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {Object.keys(zones).map((k) => <ZoneCard key={k} zoneKey={k} carers={zones[k]} s={s} presence={presence} onOpen={setOpenZone} />)}
          </div>
          <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, position: "sticky", top: 88 }}>
            <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 16, marginBottom: 14 }}>Live alerts</div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, marginBottom: 8 }}>Staffing</div>
            {alerts.staffing.length === 0 ? <div style={{ background: C.greenSoft, borderRadius: 12, padding: "11px 13px", fontSize: 13, fontWeight: 600, color: C.greenDeep, display: "flex", gap: 8 }}><Dot level="green" size={10} /> All zones safely covered</div> : alerts.staffing.map((a, i) => <div key={i} style={{ background: LEVEL[a.level].bg, borderRadius: 12, padding: "11px 13px", display: "flex", gap: 10, marginBottom: 8, animation: "fade .25s ease" }}><Dot level={a.level} size={10} /><div><div style={{ fontWeight: 700, fontSize: 13, color: LEVEL[a.level].text }}>{a.title}</div><div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{a.body}</div></div></div>)}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: C.slate, margin: "16px 0 8px" }}>Health &amp; care</div>
            {alerts.health.length === 0 ? <div style={{ fontSize: 13, color: C.slate }}>No health alerts.</div> : alerts.health.slice(0, 8).map((a, i) => <div key={i} style={{ background: LEVEL[a.level].bg, borderRadius: 12, padding: "11px 13px", display: "flex", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 13 }}>{a.level === "red" ? "!" : "·"}</span><div><div style={{ fontWeight: 700, fontSize: 13, color: LEVEL[a.level].text }}>{a.title}</div><div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{a.body}</div></div></div>)}
          </div>
        </div>

        <ComfortRounds />
        <Enrichment />

        <div style={{ marginTop: 26, fontSize: 11.5, color: C.slate, lineHeight: 1.5 }}>Genevieve is a decision-support tool to help your cattery stay organised, safely staffed and cat-friendly - it does not replace a veterinarian's assessment, clinical judgement, or your duty of care under the relevant state code of practice for boarding establishments. Confirm vaccination, isolation and ratio requirements against current regulations for your state.</div>
      </div>

      {openZone && !feedingZone && <ZoneModal zoneKey={openZone} carers={zones[openZone]} s={s} presence={presence} notesByCat={notesByCat} onClose={() => setOpenZone(null)} onCat={(r) => setOpenCat(r)} onFeeding={(k) => setFeedingZone(k)} onToggle={togglePresence} />}
      {openCat && <CatModal cat={openCat} zoneName={ZONE_META[openZone]?.name || ""} notes={notesByCat[openCat.name]} care={careByCat[openCat.name] || {}} onToggleCare={toggleCare} onAddNote={addNote} onClose={() => setOpenCat(null)} />}
      {feedingZone && <FeedingPlanner zoneKey={feedingZone} presence={presence} onClose={() => setFeedingZone(null)} />}
    </div>
  );
}
