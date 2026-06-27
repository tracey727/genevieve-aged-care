import React, { useState, useEffect } from 'react'
import { THEME as T } from './theme'
import { ROOMS, CHILDREN, EDUCATORS, ALLERGENS, SLEEP_PROFILES, ZONES, PLAY, STAFF_ROSTER, SHIFTS, DUTY, SAFETY, EMERGENCY } from './data'

function usePersistent(key, initial) {
  const [v, setV] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV]
}
const seed = () => { const m = {}; CHILDREN.forEach(c => { m[c.id] = { present: true, signIn: c.signIn, signOut: null, hadSleep: false, sleepStart: null, lastCheck: null, amTea: false, lunch: false, pmTea: false } }); return m }

const STAT = {
  green: { dot: T.green, soft: T.greenSoft, text: T.greenText },
  amber: { dot: T.amber, soft: T.amberSoft, text: T.amberText },
  red:   { dot: T.red,   soft: T.redSoft,   text: T.redText },
  slate: { dot: T.slate, soft: '#eef1ef',   text: T.slate },
}
const now = () => new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '')
const roomMeta = id => ROOMS.find(r => r.id === id)

// A child's indicator
function childLevel(c) {
  if (c.restricted.length) return 'red'
  if (c.allergy && ALLERGENS[c.allergy].sev === 3) return 'red'
  if (c.allergy) return 'amber'
  if (c.inclusion) return 'amber'
  return 'green'
}
function childFlag(c) {
  if (c.restricted.length) return 'Custody — restricted collector'
  if (c.allergy) return `${ALLERGENS[c.allergy].label} · ${ALLERGENS[c.allergy].severity}`
  if (c.inclusion) return 'Inclusion plan'
  return 'No alerts on file'
}

function Dot({ level, size = 10, glow }) { return <span style={{ width: size, height: size, borderRadius: size, background: STAT[level].dot, display: 'inline-block', flexShrink: 0, boxShadow: glow ? `0 0 5px ${STAT[level].dot}88` : 'none' }} /> }
function Pill({ level, children }) { const s = STAT[level]; return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.soft, color: s.text, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.4px' }}><Dot level={level} size={8} />{children}</span> }
function Toggle({ on, onClick, label }) { return <button type="button" onClick={onClick} aria-label={label} aria-pressed={on} style={{ width: 48, height: 26, minWidth: 48, borderRadius: 13, border: 'none', padding: 0, position: 'relative', cursor: 'pointer', background: on ? T.green : '#d9c4cf', transition: 'background .18s', flexShrink: 0, boxShadow: 'inset 0 1px 2px rgba(0,0,0,.12)' }}><span style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} /></button> }
function Bar({ pct, color }) { return <div style={{ height: 6, background: T.line, borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.max(3, Math.min(100, pct))}%`, background: color, borderRadius: 4, transition: 'width .3s' }} /></div> }
const card = { background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16 }
const sectionTitle = (txt, right) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 0 12px' }}><span style={{ fontSize: 13, fontWeight: 800, color: T.ink, textTransform: 'uppercase', letterSpacing: 1.2, borderLeft: `3px solid ${T.accent}`, paddingLeft: 10 }}>{txt}</span>{right && <span style={{ fontSize: 12, color: T.slate }}>{right}</span>}</div>
function List({ title, items, tone }) {
  const c = tone === 'green' ? T.greenText : tone === 'red' ? T.redText : T.slate
  return <div style={{ marginTop: 14 }}><div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: c, marginBottom: 7 }}>{title}</div>{items.map((t, i) => <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: T.ink, marginBottom: 4 }}><span style={{ color: c }}>{tone === 'green' ? '✓' : '•'}</span>{t}</div>)}</div>
}

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [st, setSt] = usePersistent('gkids_v2', seed())
  const [safe, setSafe] = usePersistent('gkids_safety', {})
  const [shift, setShift] = useState('morning')
  const [openChild, setOpenChild] = useState(null)
  const toggleSafe = id => setSafe(x => ({ ...x, [id]: !x[id] }))
  const set = (id, p) => setSt(s => ({ ...s, [id]: { ...s[id], ...p } }))
  const cs = id => st[id] || {}

  const roomData = ROOMS.map(r => {
    const kids = CHILDREN.filter(c => c.room === r.id && cs(c.id).present)
    const eds = STAFF_ROSTER.filter(e => e.room === r.id && e.onNow)
    const required = Math.max(1, Math.ceil(kids.length / r.ratio))
    const hasQ = eds.some(e => e.qualified)
    const level = eds.length < required ? 'red' : !hasQ ? 'amber' : 'green'
    const allergyKids = kids.filter(c => c.allergy)
    return { ...r, kids, eds, required, hasQ, level, allergyKids }
  })
  const redRooms = roomData.filter(r => r.level === 'red').length
  const present = CHILDREN.filter(c => cs(c.id).present).length

  const TABS = [['dashboard', 'Dashboard'], ['rooms', 'Rooms'], ['roster', 'Roster'], ['play', 'Play'], ['lunch', 'Lunch'], ['sleep', 'Sleep'], ['children', 'Children'], ['safety', 'Safety & WHS']]

  return (
    <div style={{ minHeight: '100vh', background: T.pageBg, padding: '18px 14px 50px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}*{box-sizing:border-box}.disp{font-family:'Plus Jakarta Sans',system-ui,sans-serif}`}</style>

      <div style={{ maxWidth: 980, margin: '0 auto', background: T.pageBg, border: `5px solid ${T.frame}`, borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,.12)' }}>
        <header style={{ background: `linear-gradient(135deg, ${T.headerA}, ${T.headerB})`, padding: '0 18px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, background: 'rgba(0,0,0,.22)', padding: '5px 6px', borderRadius: 6 }}>{[T.red, T.amber, T.green].map((c, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}aa` }} />)}</div>
            <div><div className="disp" style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Genevieve</div><div style={{ fontSize: 10, color: '#ffd6e6', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Kids · {T.tagline}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 11.5, color: '#ffe6f0', textTransform: 'uppercase', letterSpacing: 1 }}>Sunrise Early Learning</span><span style={{ background: T.green, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, letterSpacing: 1, animation: 'pulse 2s infinite' }}>LIVE</span></div>
        </header>

        <nav style={{ background: T.card, borderBottom: `1px solid ${T.line}`, display: 'flex', gap: 4, padding: '8px 10px', overflowX: 'auto' }}>
          {TABS.map(([k, label]) => { const a = tab === k; return <button key={k} onClick={() => setTab(k)} style={{ border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: a ? T.accent : 'transparent', color: a ? T.onAccent : T.slate, fontFamily: 'inherit' }}>{label}</button> })}
        </nav>

        <div style={{ padding: '16px 16px 26px' }}>
          {tab === 'dashboard' && <Dashboard roomData={roomData} redRooms={redRooms} present={present} onChild={setOpenChild} />}
          {tab === 'rooms' && <Rooms roomData={roomData} onChild={setOpenChild} />}
          {tab === 'roster' && <Roster shift={shift} setShift={setShift} roomData={roomData} />}
          {tab === 'safety' && <Safety safe={safe} toggleSafe={toggleSafe} />}
          {tab === 'play' && <Play />}
          {tab === 'lunch' && <Lunch roomData={roomData} />}
          {tab === 'sleep' && <Sleep cs={cs} set={set} onChild={setOpenChild} />}
          {tab === 'children' && <Children cs={cs} set={set} onChild={setOpenChild} />}
        </div>
      </div>
      <div style={{ maxWidth: 980, margin: '14px auto 0', textAlign: 'center', fontSize: 11, color: T.slate }}>Genevieve Kids · {T.tagline} · decision-support only — your nominated supervisor signs off. Ratios per NQF (Nursery 1:4 · Toddlers 1:5 · Kindy 1:11 · OSHC 1:15).</div>

      {openChild && <ChildModal child={CHILDREN.find(c => c.id === openChild)} cs={cs} set={set} onClose={() => setOpenChild(null)} />}
    </div>
  )
}

// ===== DASHBOARD =====
function Dashboard({ roomData, redRooms, present, onChild }) {
  const watch = CHILDREN.filter(c => childLevel(c) !== 'green')
  const stat = (label, value, level) => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot level={level || 'green'} size={10} glow={!!level} /><span style={{ fontSize: 13, color: T.ink }}><strong>{value}</strong> {label}</span></div>
  return (
    <div>
      <div style={{ ...card, padding: '12px 16px', display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center', background: T.cardSoft }}>
        <span style={{ fontSize: 11, color: T.slate, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Centre Status</span>
        {stat('In ratio', roomData.filter(r => r.level !== 'red').length, 'green')}
        {stat('Out of ratio', redRooms, redRooms ? 'red' : 'green')}
        {stat('Children in', present)}
        {stat('Allergy children', CHILDREN.filter(c => c.allergy).length, 'amber')}
      </div>

      {redRooms > 0 && <div style={{ marginTop: 14, background: T.redSoft, border: `1px solid ${T.red}55`, borderLeft: `4px solid ${T.red}`, borderRadius: 10, padding: '13px 15px', display: 'flex', gap: 12 }}><span style={{ color: T.redText, fontWeight: 900, fontSize: 16 }}>!</span><div><div className="disp" style={{ fontSize: 14, fontWeight: 800, color: T.redText }}>{roomData.find(r => r.level === 'red')?.name} — Out of ratio</div><div style={{ fontSize: 12.5, color: T.ink, marginTop: 2 }}>Educator cover required now. Notified: Director, Room Leader.</div></div></div>}

      {sectionTitle('Room Status', 'Updated just now')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
        {roomData.map(r => (
          <div key={r.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div className="disp" style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{r.name}</div><div style={{ fontSize: 11, color: T.slate }}>{r.band} · 1:{r.ratio}</div></div>
              <Pill level={r.level}>{r.level === 'red' ? 'Out' : r.level === 'amber' ? 'No qual' : 'In ratio'}</Pill>
            </div>
            <div style={{ display: 'flex', gap: 18, margin: '12px 0 10px', alignItems: 'flex-end' }}>
              <div><div className="disp" style={{ fontSize: 24, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{r.kids.length}</div><div style={{ fontSize: 10.5, color: T.slate }}>present</div></div>
              <div><div className="disp" style={{ fontSize: 24, fontWeight: 800, color: r.level === 'red' ? T.red : T.ink, lineHeight: 1 }}>{r.eds.length}<span style={{ fontSize: 13, color: T.slate }}>/{r.required}</span></div><div style={{ fontSize: 10.5, color: T.slate }}>educators</div></div>
            </div>
            <Bar pct={(r.eds.length / r.required) * 100} color={STAT[r.level].dot} />
            {r.allergyKids.length > 0 && <div style={{ fontSize: 11.5, color: T.redText, fontWeight: 700, marginTop: 10 }}>⚠ {r.allergyKids.length} allergy child{r.allergyKids.length > 1 ? 'ren' : ''}</div>}
          </div>
        ))}
      </div>

      {sectionTitle('Allergy & care watch list', `${watch.length} need eyes`)}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {watch.map((c, i) => { const lv = childLevel(c); return (
          <button key={c.id} onClick={() => onChild(c.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: 'none', borderBottom: i < watch.length - 1 ? `1px solid ${T.line}` : 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <Dot level={lv} glow />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.ink, width: 70 }}>{c.name}</span>
            <span style={{ fontSize: 11, color: T.slate, width: 64 }}>{roomMeta(c.room).name}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: STAT[lv].text, flex: 1 }}>{childFlag(c)}{c.allergy && ALLERGENS[c.allergy].epipen ? ' · EpiPen' : ''}</span>
            <span style={{ color: T.accent, fontSize: 16 }}>›</span>
          </button>
        )})}
      </div>
    </div>
  )
}

// ===== ROOMS =====
function Rooms({ roomData, onChild }) {
  return (
    <div>{sectionTitle('Rooms', 'Live headcount, ratio & allergies')}
      <div style={{ display: 'grid', gap: 14 }}>
        {roomData.map(r => (
          <div key={r.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div><div className="disp" style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{r.name}</div><div style={{ fontSize: 11.5, color: T.slate }}>{r.band} · 1:{r.ratio} · {r.eds.map(e => e.name).join(', ') || 'no educator'}</div></div>
              <Pill level={r.level}>{r.level === 'red' ? 'Out of ratio' : r.level === 'amber' ? 'Needs qualified' : 'In ratio'}</Pill>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              {[['Present', `${r.kids.length}/${r.capacity}`], ['Educators', `${r.eds.length}/${r.required}`], ['Allergies', r.allergyKids.length]].map(([l, v]) => <div key={l} style={{ background: T.cardSoft, borderRadius: 10, padding: '8px 12px', minWidth: 80 }}><div style={{ fontSize: 10.5, color: T.slate }}>{l}</div><div className="disp" style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{v}</div></div>)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {r.kids.map(c => { const lv = childLevel(c); return <button key={c.id} onClick={() => onChild(c.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: STAT[lv].soft, border: `1px solid ${STAT[lv].dot}33`, borderRadius: 999, padding: '5px 11px', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: T.ink }}><Dot level={lv} size={8} />{c.name}{c.allergy ? ' ⚠' : ''}</button> })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ===== PLAY (play-group setup) =====
const zoneLevel = z => (z.children > z.max ? 'red' : z.children === z.max ? 'amber' : 'green')
const zoneLabel = z => (z.children > z.max ? 'Over capacity' : z.children === z.max ? 'At capacity' : 'Open')
const groupLevel = g => (g.educators.length < g.required ? 'red' : !g.educators.some(e => e.qualified) ? 'amber' : 'green')
function Play() {
  const onBoard = PLAY.groups.reduce((a, g) => a + g.educators.length, 0)
  const needed = PLAY.groups.reduce((a, g) => a + g.required, 0)
  const uvLabels = { 1: 'Low', 2: 'High — hats on, water at 11:00', 3: 'Extreme — shade only' }
  const uvCols = [T.green, T.amber, T.red]
  return (
    <div>
      {sectionTitle('Outdoor play setup', `${PLAY.time} · how the groups are set up`)}
      <div style={{ fontSize: 12.5, color: T.slate, marginBottom: 12 }}>Children are grouped into the age cohorts that play together — each with its own ratio, staff and play areas. Genevieve keeps under-3s fenced from bikes, flags areas at capacity, watches UV, and reminds staff which EpiPens go outside.</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginBottom: 14 }}>
        <div style={card}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>UV &amp; heat</span><span style={{ fontSize: 12, fontWeight: 700, color: uvCols[PLAY.uv - 1] }}>{uvLabels[PLAY.uv]}</span></div><div style={{ display: 'flex', gap: 4 }}>{[0, 1, 2].map(i => <span key={i} style={{ flex: 1, height: 9, borderRadius: 4, background: i < PLAY.uv ? uvCols[PLAY.uv - 1] : T.line }} />)}</div></div>
        <div style={{ ...card, borderLeft: `5px solid ${onBoard >= needed ? T.green : T.red}` }}><div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Total outdoor supervision</div><div className="disp" style={{ fontSize: 22, fontWeight: 800, color: onBoard >= needed ? T.green : T.red }}>{onBoard} <span style={{ fontSize: 13, color: T.slate, fontWeight: 600 }}>/ {needed} needed</span></div><div style={{ fontSize: 11.5, color: T.slate }}>{onBoard >= needed ? 'Both cohorts in ratio' : 'A cohort is short — call a float'}</div></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
        {PLAY.groups.map(g => { const lvl = groupLevel(g); return (
          <div key={g.key} style={{ ...card, borderLeft: `6px solid ${STAT[lvl].dot}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div><div className="disp" style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{g.name}</div><div style={{ fontSize: 11.5, color: T.slate }}>{g.band} · from {g.from} · {g.ratioText}</div></div>
              <Pill level={lvl}>{lvl === 'green' ? 'In ratio' : lvl === 'amber' ? 'No qual' : 'Short'}</Pill>
            </div>
            <div style={{ display: 'flex', gap: 22, margin: '14px 0 6px', alignItems: 'flex-end' }}>
              <div><div className="disp" style={{ fontSize: 26, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{g.children}</div><div style={{ fontSize: 10.5, color: T.slate }}>children</div></div>
              <div><div className="disp" style={{ fontSize: 26, fontWeight: 800, color: lvl === 'red' ? T.red : T.ink, lineHeight: 1 }}>{g.educators.length}<span style={{ fontSize: 14, color: T.slate }}>/{g.required}</span></div><div style={{ fontSize: 10.5, color: T.slate }}>staff</div></div>
            </div>
            <div style={{ fontSize: 11, color: T.slate, marginBottom: 10 }}>{g.math}</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: T.slate, margin: '4px 0 8px' }}>Areas in use · {g.area}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {g.zones.map((zn, i) => { const z = ZONES[zn]; const zl = zoneLevel(z); return (
                <div key={i} style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: '9px 11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{zn}</span><Dot level={zl} size={8} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.slate, margin: '6px 0 5px' }}><span>{z.children}/{z.max}</span><span style={{ fontWeight: 700, color: STAT[zl].text }}>{zoneLabel(z)}</span></div>
                  <Bar pct={(z.children / z.max) * 100} color={STAT[zl].dot} />
                </div>
              )})}
            </div>
            {(g.epipen.length > 0 || g.aware.length > 0) && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {g.epipen.map((n, i) => <span key={i} style={{ fontSize: 12, fontWeight: 700, color: T.redText, background: T.redSoft, padding: '4px 10px', borderRadius: 999 }}>⚠ EpiPen out: {n}</span>)}
              {g.aware.map((n, i) => <span key={i} style={{ fontSize: 12, fontWeight: 600, color: T.amberText, background: T.amberSoft, padding: '4px 10px', borderRadius: 999 }}>allergy-aware: {n}</span>)}
            </div>}
          </div>
        )})}
      </div>
    </div>
  )
}

// ===== LUNCH (allergy-safe seating + menu swaps) =====
function Lunch({ roomData }) {
  const rooms = roomData.filter(r => r.allergyKids.length > 0)
  return (
    <div>
      {sectionTitle('Allergy-safe lunch & seating', 'Auto-built from each child’s plan')}
      <div style={{ fontSize: 12.5, color: T.slate, marginBottom: 12 }}>For every room with an allergy child, Genevieve sets the allergen-safe table, lists what to keep off it, and what to swap into today’s menu and play — so coordinators don’t have to remember it before moving about.</div>
      {rooms.length === 0 && <div style={card}>No allergy children currently signed in.</div>}
      {rooms.map(r => {
        const allergens = [...new Set(r.allergyKids.map(c => c.allergy))]
        const foods = [...new Set(allergens.flatMap(k => ALLERGENS[k].avoidFoods))]
        const plays = [...new Set(allergens.flatMap(k => ALLERGENS[k].avoidPlay))]
        const swaps = [...new Set(allergens.flatMap(k => ALLERGENS[k].swaps))]
        const safe = r.kids.filter(c => !c.allergy)
        const tables = []; for (let i = 0; i < safe.length; i += 6) tables.push(safe.slice(i, i + 6))
        return (
          <div key={r.id} style={{ ...card, marginBottom: 14 }}>
            <div className="disp" style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 12 }}>{r.name}</div>
            <div style={{ border: `2px solid ${T.green}`, borderRadius: 12, padding: 14, background: T.greenSoft }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: T.greenText }}>🛡️ Allergen-safe table</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>{r.allergyKids.map((c, i) => <span key={i} style={{ fontSize: 12.5, fontWeight: 700, color: T.greenText, background: T.card, border: `1px solid ${T.green}55`, padding: '5px 11px', borderRadius: 999 }}>{c.name} · {ALLERGENS[c.allergy].label}</span>)}</div>
              <div style={{ fontSize: 12, color: T.ink, marginTop: 9 }}>Excluded: {allergens.map(k => ALLERGENS[k].label).join(' · ')}. Separate wipe cloths; seat a qualified educator here.</div>
            </div>
            {tables.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 10, marginTop: 12 }}>{tables.map((tb, i) => <div key={i} style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: 11 }}><div style={{ fontSize: 11.5, fontWeight: 700, color: T.slate, marginBottom: 5 }}>Table {i + 1}</div><div style={{ fontSize: 12.5, color: T.ink, lineHeight: 1.6 }}>{tb.map(c => c.name).join(', ')}</div></div>)}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <List title="Keep off the safe table" items={foods} tone="red" />
              <List title="Swap into today’s menu" items={swaps} tone="green" />
            </div>
            <List title="Adjust today’s play & craft" items={plays} tone="red" />
          </div>
        )
      })}
    </div>
  )
}

// ===== SLEEP =====
function Sleep({ cs, set, onChild }) {
  const [checkAgo, setCheckAgo] = useState(11)
  const level = checkAgo >= 10 ? 'red' : checkAgo >= 7 ? 'amber' : 'green'
  const label = level === 'red' ? 'Safety check overdue' : level === 'amber' ? 'Check due soon' : 'Check up to date'
  const nappers = CHILDREN.filter(c => cs(c.id).present && c.sleep && SLEEP_PROFILES[c.sleep].level !== 'slate')
  const quiet = CHILDREN.filter(c => cs(c.id).present && c.sleep && SLEEP_PROFILES[c.sleep].level === 'slate')
  const slept = nappers.filter(c => cs(c.id).hadSleep).length
  const toggle = c => { const s = cs(c.id); set(c.id, { hadSleep: !s.hadSleep, sleepStart: !s.hadSleep ? (s.sleepStart || now()) : null }) }
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 12 }}>
        <div style={{ ...card, borderLeft: `6px solid ${STAT[level].dot}`, background: level === 'red' ? T.redSoft : T.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot level={level} size={11} /><span style={{ fontWeight: 800, fontSize: 15, color: STAT[level].text }}>{label}</span></div><div className="disp" style={{ fontSize: 24, fontWeight: 800, color: T.ink, marginTop: 6, lineHeight: 1 }}>{checkAgo} min <span style={{ fontSize: 12, color: T.slate, fontWeight: 600 }}>since last check</span></div><div style={{ fontSize: 11.5, color: T.slate, marginTop: 4 }}>Policy: physical visual check every 10 min</div></div>
          <button onClick={() => setCheckAgo(0)} style={{ border: 'none', background: T.accent, color: T.onAccent, fontWeight: 700, fontSize: 14, padding: '12px 16px', borderRadius: 11, cursor: 'pointer' }}>✓ Log safety check</button>
        </div>
        <div style={{ ...card, borderLeft: `5px solid ${T.green}` }}><div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 6 }}>Sleep room</div><div style={{ fontSize: 13, color: T.ink }}><strong>{slept}/{nappers.length}</strong> had a sleep</div><div style={{ fontSize: 11.5, color: T.slate, marginTop: 4 }}>Supervised · lights dimmed · door open for sightline</div></div>
      </div>

      {sectionTitle('Nappers — profile & mark off when slept')}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {nappers.map((c, i) => { const p = SLEEP_PROFILES[c.sleep]; const s = cs(c.id); const lv = s.hadSleep ? 'green' : s.sleepStart ? 'amber' : p.level
          return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < nappers.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <Dot level={lv === 'slate' ? 'amber' : lv} glow />
              <button onClick={() => onChild(c.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{c.name} <span style={{ fontSize: 11, fontWeight: 700, color: STAT[p.level === 'slate' ? 'slate' : p.level].text }}>· {p.label}</span></div>
                <div style={{ fontSize: 11.5, color: T.slate }}>{s.hadSleep ? `Slept · started ${s.sleepStart || ''}` : s.sleepStart ? `Sleeping since ${s.sleepStart}` : p.note}</div>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 10.5, color: T.slate }}>Slept</span><Toggle on={s.hadSleep} onClick={() => toggle(c)} label={`${c.name} had a sleep`} /></div>
            </div>
          )})}
      </div>

      {quiet.length > 0 && <>{sectionTitle('Quiet rest group (no nap)')}<div style={{ ...card, display: 'flex', flexWrap: 'wrap', gap: 8 }}>{quiet.map(c => <span key={c.id} style={{ fontSize: 12.5, fontWeight: 600, color: T.ink, background: '#eef1ef', borderRadius: 999, padding: '5px 12px' }}>{c.name} · {roomMeta(c.room).name}</span>)}<div style={{ width: '100%', fontSize: 11.5, color: T.slate, marginTop: 4 }}>Rest with books, puzzles & drawing — never forced to sleep, never woken early.</div></div></>}
    </div>
  )
}

// ===== CHILDREN =====
function Children({ cs, set, onChild }) {
  const sign = c => { const s = cs(c.id); if (s.present) set(c.id, { present: false, signOut: now() }); else set(c.id, { present: true, signIn: s.signIn || now(), signOut: null }) }
  return (
    <div>{sectionTitle('Children', `${CHILDREN.filter(c => cs(c.id).present).length} signed in`)}
      {ROOMS.map(r => { const kids = CHILDREN.filter(c => c.room === r.id); if (!kids.length) return null; return (
        <div key={r.id} style={{ ...card, marginBottom: 12, padding: 0, overflow: 'hidden' }}>
          <div style={{ background: T.cardSoft, padding: '10px 16px', fontSize: 12, fontWeight: 800, color: T.ink, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${T.line}` }}>{r.name}</div>
          {kids.map((c, i) => { const s = cs(c.id); const lv = childLevel(c); return (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: i < kids.length - 1 ? `1px solid ${T.line}` : 'none', opacity: s.present ? 1 : 0.55 }}>
              <Dot level={lv} glow />
              <button onClick={() => onChild(c.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{c.name} {c.allergy ? <span style={{ fontSize: 11, color: ALLERGENS[c.allergy].sev === 3 ? T.red : T.amber }}>⚠</span> : null}{c.restricted.length ? <span style={{ fontSize: 11, color: T.red }}>● custody</span> : null}</div>
                <div style={{ fontSize: 11.5, color: T.slate }}>{c.age} · {childFlag(c)}</div>
              </button>
              <span style={{ fontSize: 11, fontWeight: 700, color: s.present ? T.greenText : T.slate, width: 64, textAlign: 'right' }}>{s.present ? (s.signIn || 'In') : 'Out'}</span>
              <button onClick={() => sign(c)} style={{ border: `1px solid ${s.present ? T.line : T.accent}`, background: s.present ? T.card : T.accent, color: s.present ? T.slate : T.onAccent, fontSize: 11.5, fontWeight: 700, padding: '6px 11px', borderRadius: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}>{s.present ? 'Sign out' : 'Sign in'}</button>
            </div>
          )})}
        </div>
      )})}
    </div>
  )
}

// ===== CHILD MODAL =====
function SeverityBar({ sev }) {
  const labels = { 1: 'Monitor', 2: 'Moderate', 3: 'Anaphylaxis' }; const cols = [T.green, T.amber, T.red]
  return <div><div style={{ display: 'flex', gap: 4 }}>{[0, 1, 2].map(i => <span key={i} style={{ flex: 1, height: 9, borderRadius: 4, background: i < sev ? cols[sev - 1] : T.line }} />)}</div><div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5 }}><span style={{ fontSize: 11, color: T.slate }}>Reaction severity on file</span><span style={{ fontSize: 12, fontWeight: 700, color: cols[sev - 1] }}>{labels[sev]}</span></div>{sev === 3 && <div style={{ fontSize: 11.5, color: T.redText, marginTop: 6, fontWeight: 600 }}>⚠ Severity can change without warning — act on first symptoms, every time.</div>}</div>
}
function ChildModal({ child: c, cs, set, onClose }) {
  const s = cs(c.id); const a = c.allergy ? ALLERGENS[c.allergy] : null; const sp = c.sleep ? SLEEP_PROFILES[c.sleep] : null
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(74,31,48,.5)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5vh 14px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: 16, width: '100%', maxWidth: 470, padding: 22, border: `3px solid ${T.frame}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Dot level={childLevel(c)} size={14} glow /><div><div className="disp" style={{ fontSize: 20, fontWeight: 800, color: T.ink }}>{c.name}</div><div style={{ fontSize: 12.5, color: T.slate }}>{c.age} · {roomMeta(c.room).name}</div></div></div>
          <button onClick={onClose} style={{ border: 'none', background: T.cardSoft, width: 30, height: 30, borderRadius: 999, fontSize: 16, color: T.slate, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          <Pill level={s.present ? 'green' : 'amber'}>{s.present ? `In ${s.signIn || ''}` : 'Signed out'}</Pill>
          {c.inclusion && <span style={{ fontSize: 11, fontWeight: 700, color: T.accentDeep, background: T.accentSoft, padding: '3px 10px', borderRadius: 999 }}>Inclusion plan</span>}
        </div>

        {!a && <div style={{ marginTop: 14, background: T.greenSoft, color: T.greenText, borderRadius: 12, padding: '13px 15px', fontSize: 13.5, fontWeight: 600 }}>No dietary or medical alerts on file.</div>}
        {a && <div style={{ marginTop: 14, background: a.sev === 3 ? T.redSoft : T.amberSoft, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 16 }}>⚠</span><span style={{ fontWeight: 800, fontSize: 15, color: a.sev === 3 ? T.redText : T.amberText }}>{a.label}</span>{a.epipen && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: T.red }}>EpiPen</span>}</div>
          <div style={{ marginTop: 12 }}><SeverityBar sev={a.sev} /></div>
          <div style={{ fontSize: 13, color: T.ink, marginTop: 12, lineHeight: 1.5 }}>{a.plan}</div>
        </div>}
        {a && <><List title="Keep off their plate" items={a.avoidFoods} tone="red" /><List title="Avoid in play & craft" items={a.avoidPlay} tone="red" /><List title="Safe swaps" items={a.swaps} tone="green" /></>}

        {sp && <div style={{ marginTop: 14, background: STAT[sp.level === 'slate' ? 'slate' : sp.level].soft, borderRadius: 10, padding: '11px 13px' }}><div style={{ fontWeight: 700, fontSize: 13.5, color: STAT[sp.level === 'slate' ? 'slate' : sp.level].text }}>🛌 {sp.label}</div><div style={{ fontSize: 12.5, color: T.ink, marginTop: 4 }}>{sp.note}</div></div>}

        <div style={{ marginTop: 14, border: `2px solid ${c.restricted.length ? T.red : T.line}`, borderRadius: 12, padding: '12px 14px', background: c.restricted.length ? T.redSoft : T.cardSoft }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: c.restricted.length ? T.redText : T.slate, marginBottom: 8 }}>Authorised to collect</div>
          {c.authorised.map((x, i) => <div key={i} style={{ fontSize: 13, color: T.ink, display: 'flex', gap: 8 }}><span style={{ color: T.green, fontWeight: 800 }}>✓</span>{x}</div>)}
          {c.restricted.map((x, i) => <div key={i} style={{ fontSize: 13, color: T.redText, fontWeight: 700, display: 'flex', gap: 8, marginTop: 4 }}><span style={{ fontWeight: 800 }}>✕</span>{x}</div>)}
          {c.restricted.length > 0 && <div style={{ fontSize: 11.5, color: T.redText, marginTop: 7, fontWeight: 600 }}>Verify photo ID before release.</div>}
        </div>

        {c.contacts.length > 0 && <List title="Emergency contacts" items={c.contacts} />}
        {c.notes.length > 0 && <List title="Notes from parents" items={c.notes} />}
      </div>
    </div>
  )
}

// ===== ROSTER (shifts, times, ratios, staff certs) =====
const CERT_KEYS = [['blueCard', 'Blue Card'], ['firstAid', 'First Aid'], ['cpr', 'CPR'], ['anaphylaxis', 'Anaphylaxis'], ['asthma', 'Asthma']]
function certLevel(s) {
  const vals = CERT_KEYS.map(([k]) => s[k])
  if (vals.includes('expired')) return 'red'
  if (vals.includes('expiring')) return 'amber'
  return 'green'
}
function Roster({ shift, setShift, roomData }) {
  const staff = STAFF_ROSTER.filter(s => s.shift === shift)
  const duty = DUTY[shift]
  const meta = SHIFTS.find(x => x.key === shift)
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
        {SHIFTS.map(sh => { const a = sh.key === shift; return <button key={sh.key} onClick={() => setShift(sh.key)} style={{ border: `1px solid ${a ? T.accent : T.line}`, background: a ? T.accent : T.card, color: a ? T.onAccent : T.ink, fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 999, cursor: 'pointer' }}>{sh.label} · {sh.time}</button> })}
      </div>

      <div style={{ ...card, marginTop: 14, background: T.cardSoft }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: T.slate, marginBottom: 10 }}>On duty this shift · {meta.time}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
          {[['Responsible person', duty.responsible], ['First-aid officer', duty.firstAid], ['Anaphylaxis officer', duty.anaphylaxis], ['Fire warden', duty.fireWarden]].map(([l, v]) => (
            <div key={l} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 10, padding: '10px 12px' }}><div style={{ fontSize: 10.5, color: T.slate, textTransform: 'uppercase', letterSpacing: '.05em' }}>{l}</div><div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, marginTop: 3 }}>{v}</div></div>
          ))}
        </div>
      </div>

      {sectionTitle('Ratios this shift', 'Children in ratio per room')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
        {roomData.map(r => {
          const onShift = STAFF_ROSTER.filter(e => e.room === r.id && e.shift === shift)
          const required = Math.max(1, Math.ceil(r.kids.length / r.ratio))
          const lvl = onShift.length < required ? 'red' : !onShift.some(e => e.level !== 'Trainee') ? 'amber' : 'green'
          return (
            <div key={r.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div className="disp" style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{r.name}</div><div style={{ fontSize: 11, color: T.slate }}>ratio 1:{r.ratio}</div></div>
                <Pill level={lvl}>{lvl === 'red' ? 'Short' : lvl === 'amber' ? 'No qual' : 'In ratio'}</Pill>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'flex-end' }}>
                <div><div className="disp" style={{ fontSize: 22, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{r.kids.length}</div><div style={{ fontSize: 10, color: T.slate }}>children</div></div>
                <div><div className="disp" style={{ fontSize: 22, fontWeight: 800, color: lvl === 'red' ? T.red : T.ink, lineHeight: 1 }}>{onShift.length}<span style={{ fontSize: 12, color: T.slate }}>/{required}</span></div><div style={{ fontSize: 10, color: T.slate }}>educators</div></div>
              </div>
              <div style={{ fontSize: 11, color: T.slate, marginTop: 8 }}>{onShift.map(e => e.name).join(', ') || 'none rostered'}</div>
            </div>
          )
        })}
      </div>

      {sectionTitle('Staff & certifications', `${staff.length} rostered`)}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {staff.map((e, i) => { const lv = certLevel(e); return (
          <div key={e.id} style={{ padding: '12px 16px', borderBottom: i < staff.length - 1 ? `1px solid ${T.line}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Dot level={lv} glow />
              <span style={{ fontSize: 14, fontWeight: 700, color: T.ink }}>{e.name}</span>
              <span style={{ fontSize: 11, color: T.slate }}>{e.level} · {roomMeta(e.room).name}</span>
              {lv !== 'green' && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: lv === 'red' ? T.redText : T.amberText }}>{lv === 'red' ? 'CERT EXPIRED — do not roster' : 'cert expiring'}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {CERT_KEYS.map(([k, label]) => { const v = e[k]; const c = v === 'expired' ? 'red' : v === 'expiring' ? 'amber' : 'green'; return <span key={k} style={{ fontSize: 11, fontWeight: 700, color: STAT[c].text, background: STAT[c].soft, padding: '3px 9px', borderRadius: 999 }}>{label}: {v === 'current' ? '✓' : v}</span> })}
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

// ===== SAFETY & WHS (toggle register + emergency) =====
function Safety({ safe, toggleSafe }) {
  const all = SAFETY.flatMap(c => c.items)
  const done = all.filter(i => safe[i.id]).length
  const pct = Math.round((done / all.length) * 100)
  const level = pct === 100 ? 'green' : pct >= 60 ? 'amber' : 'red'
  return (
    <div>
      <div style={{ ...card, borderLeft: `6px solid ${STAT[level].dot}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot level={level} size={11} /><span className="disp" style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>WHS daily safety register</span></div><div style={{ fontSize: 12.5, color: T.slate, marginTop: 3 }}>{done} of {all.length} checks complete — everything a safe service confirms before and during the day.</div></div>
        <div className="disp" style={{ fontSize: 30, fontWeight: 800, color: STAT[level].text }}>{pct}%</div>
      </div>

      <div style={{ ...card, marginTop: 12, background: T.redSoft, border: `1px solid ${T.red}44` }}>
        <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: T.redText, marginBottom: 8 }}>🚨 Emergency information</div>
        {Object.entries({ Emergency: EMERGENCY.emergency, Hospital: EMERGENCY.hospital, Poisons: EMERGENCY.poisons, Evacuation: EMERGENCY.evacuation, Drill: EMERGENCY.drill }).map(([k, v]) => (
          <div key={k} style={{ fontSize: 12.5, color: T.ink, marginBottom: 4 }}><strong>{k}:</strong> {v}</div>
        ))}
      </div>

      {SAFETY.map(c => {
        const cdone = c.items.filter(i => safe[i.id]).length
        return (
          <div key={c.cat} style={{ ...card, marginTop: 14, padding: 0, overflow: 'hidden' }}>
            <div style={{ background: T.cardSoft, padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${T.line}` }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: T.ink, textTransform: 'uppercase', letterSpacing: '.05em' }}>{c.cat}</span>
              <Pill level={cdone === c.items.length ? 'green' : 'amber'}>{cdone}/{c.items.length}</Pill>
            </div>
            {c.items.map((it, i) => (
              <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: i < c.items.length - 1 ? `1px solid ${T.line}` : 'none' }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13.5, color: T.ink, fontWeight: safe[it.id] ? 500 : 600 }}>{it.label}</div><div style={{ fontSize: 11, color: T.slate, marginTop: 2 }}>{it.freq} · {it.by}</div></div>
                <Toggle on={!!safe[it.id]} onClick={() => toggleSafe(it.id)} label={it.label} />
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
