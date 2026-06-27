import React, { useState, useEffect } from 'react'
import { THEME as T } from './theme'
import { WINGS, RESIDENTS, STAFF, DIETS, AREAS, ACTIVITIES, STAFF_ROSTER, SHIFTS, DUTY, SAFETY, EMERGENCY } from './data'

function usePersistent(key, initial) {
  const [v, setV] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial } catch { return initial } })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)) } catch {} }, [key, v])
  return [v, setV]
}
const seed = () => { const m = {}; RESIDENTS.forEach(r => { m[r.id] = { present: true, repositioned: false, lastCheck: null, breakfast: false, lunch: false, dinner: false } }); return m }

const STAT = {
  green: { dot: T.green, soft: T.greenSoft, text: T.greenText },
  amber: { dot: T.amber, soft: T.amberSoft, text: T.amberText },
  red:   { dot: T.red,   soft: T.redSoft,   text: T.redText },
  slate: { dot: T.slate, soft: '#e7efed',   text: T.slate },
}
const now = () => new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '')
const wingMeta = id => WINGS.find(w => w.id === id)

function resLevel(r) {
  if (r.falls === 3 || r.alerts.includes('Palliative') || r.alerts.includes('Aspiration risk')) return 'red'
  if (r.alerts.length || DIETS[r.diet].sev >= 2) return 'amber'
  return 'green'
}
function resFlag(r) {
  if (r.alerts.includes('Palliative')) return 'Palliative — comfort care'
  if (r.falls === 3) return 'High falls risk'
  if (r.alerts.includes('Aspiration risk')) return 'Aspiration risk'
  if (DIETS[r.diet].sev === 3) return DIETS[r.diet].label
  if (r.alerts.length) return r.alerts.join(', ')
  return 'Settled'
}

function Dot({ level, size = 10, glow }) { return <span style={{ width: size, height: size, borderRadius: size, background: STAT[level].dot, display: 'inline-block', flexShrink: 0, boxShadow: glow ? `0 0 5px ${STAT[level].dot}88` : 'none' }} /> }
function Pill({ level, children }) { const s = STAT[level]; return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: s.soft, color: s.text, fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '.4px' }}><Dot level={level} size={8} />{children}</span> }
function Toggle({ on, onClick, label }) { return <button type="button" onClick={onClick} aria-label={label} aria-pressed={on} style={{ width: 48, height: 26, minWidth: 48, borderRadius: 13, border: 'none', padding: 0, position: 'relative', cursor: 'pointer', background: on ? T.green : '#bcd2ce', transition: 'background .18s', flexShrink: 0, boxShadow: 'inset 0 1px 2px rgba(0,0,0,.12)' }}><span style={{ position: 'absolute', top: 3, left: on ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .18s', boxShadow: '0 1px 3px rgba(0,0,0,.3)' }} /></button> }
function Bar({ pct, color }) { return <div style={{ height: 6, background: T.line, borderRadius: 4, overflow: 'hidden' }}><div style={{ height: '100%', width: `${Math.max(3, Math.min(100, pct))}%`, background: color, borderRadius: 4, transition: 'width .3s' }} /></div> }
const card = { background: T.card, border: `1px solid ${T.line}`, borderRadius: 14, padding: 16 }
const sectionTitle = (txt, right) => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '22px 0 12px' }}><span style={{ fontSize: 13, fontWeight: 800, color: T.ink, textTransform: 'uppercase', letterSpacing: 1.2, borderLeft: `3px solid ${T.accent}`, paddingLeft: 10 }}>{txt}</span>{right && <span style={{ fontSize: 12, color: T.slate }}>{right}</span>}</div>
function List({ title, items, tone }) { const c = tone === 'green' ? T.greenText : tone === 'red' ? T.redText : T.slate; return <div style={{ marginTop: 14 }}><div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: c, marginBottom: 7 }}>{title}</div>{items.map((t, i) => <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: T.ink, marginBottom: 4 }}><span style={{ color: c }}>{tone === 'green' ? '✓' : '•'}</span>{t}</div>)}</div> }

export default function App() {
  const [tab, setTab] = useState('dashboard')
  const [st, setSt] = usePersistent('ghealth_v2', seed())
  const [safe, setSafe] = usePersistent('ghealth_safety', {})
  const [shift, setShift] = useState('morning')
  const [openRes, setOpenRes] = useState(null)
  const toggleSafe = id => setSafe(x => ({ ...x, [id]: !x[id] }))
  const set = (id, p) => setSt(s => ({ ...s, [id]: { ...s[id], ...p } }))
  const cs = id => st[id] || {}

  const wingData = WINGS.map(w => {
    const res = RESIDENTS.filter(r => r.wing === w.id && cs(r.id).present)
    const staff = STAFF_ROSTER.filter(s => s.wing === w.id && s.onNow)
    const required = Math.max(1, Math.ceil(res.length / w.ratio))
    const short = staff.length < required
    const dietRes = res.filter(r => DIETS[r.diet].sev >= 2)
    return { ...w, res, staff, required, short, level: short ? 'red' : 'green', dietRes }
  })
  const redWings = wingData.filter(w => w.short).length
  const present = RESIDENTS.filter(r => cs(r.id).present).length

  const TABS = [['dashboard', 'Dashboard'], ['wings', 'Wings'], ['roster', 'Roster'], ['activities', 'Activities'], ['meals', 'Meals'], ['rounds', 'Rounds'], ['residents', 'Residents'], ['safety', 'Safety & WHS']]

  return (
    <div style={{ minHeight: '100vh', background: T.pageBg, padding: '18px 14px 50px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap');@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}*{box-sizing:border-box}.disp{font-family:'Plus Jakarta Sans',system-ui,sans-serif}`}</style>

      <div style={{ maxWidth: 980, margin: '0 auto', background: T.pageBg, border: `5px solid ${T.frame}`, borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,.12)' }}>
        <header style={{ background: `linear-gradient(135deg, ${T.headerA}, ${T.headerB})`, padding: '0 18px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, background: 'rgba(0,0,0,.22)', padding: '5px 6px', borderRadius: 6 }}>{[T.red, T.amber, T.green].map((c, i) => <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, boxShadow: `0 0 5px ${c}aa` }} />)}</div>
            <div><div className="disp" style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Genevieve</div><div style={{ fontSize: 10, color: '#cdeae6', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>Health · {T.tagline}</div></div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={{ fontSize: 11.5, color: '#d6efeb', textTransform: 'uppercase', letterSpacing: 1 }}>Rosewood Aged Care</span><span style={{ background: T.green, color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, letterSpacing: 1, animation: 'pulse 2s infinite' }}>LIVE</span></div>
        </header>

        <nav style={{ background: T.card, borderBottom: `1px solid ${T.line}`, display: 'flex', gap: 4, padding: '8px 10px', overflowX: 'auto' }}>
          {TABS.map(([k, label]) => { const a = tab === k; return <button key={k} onClick={() => setTab(k)} style={{ border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 700, background: a ? T.accent : 'transparent', color: a ? T.onAccent : T.slate, fontFamily: 'inherit' }}>{label}</button> })}
        </nav>

        <div style={{ padding: '16px 16px 26px' }}>
          {tab === 'dashboard' && <Dashboard wingData={wingData} redWings={redWings} present={present} onRes={setOpenRes} />}
          {tab === 'wings' && <Wings wingData={wingData} onRes={setOpenRes} />}
          {tab === 'roster' && <Roster shift={shift} setShift={setShift} wingData={wingData} />}
          {tab === 'safety' && <Safety safe={safe} toggleSafe={toggleSafe} />}
          {tab === 'activities' && <Activities />}
          {tab === 'meals' && <Meals wingData={wingData} cs={cs} set={set} />}
          {tab === 'rounds' && <Rounds cs={cs} set={set} onRes={setOpenRes} />}
          {tab === 'residents' && <Residents cs={cs} onRes={setOpenRes} />}
        </div>
      </div>
      <div style={{ maxWidth: 980, margin: '14px auto 0', textAlign: 'center', fontSize: 11, color: T.slate }}>Genevieve Health · {T.tagline} · decision-support only — confirm AN-ACC, RN coverage, IDDSI diets &amp; medication against current Aged Care Quality Standards.</div>

      {openRes && <ResModal res={RESIDENTS.find(r => r.id === openRes)} cs={cs} set={set} onClose={() => setOpenRes(null)} />}
    </div>
  )
}

function Dashboard({ wingData, redWings, present, onRes }) {
  const watch = RESIDENTS.filter(r => resLevel(r) !== 'green')
  const stat = (label, value, level) => <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot level={level || 'green'} size={10} glow={!!level} /><span style={{ fontSize: 13, color: T.ink }}><strong>{value}</strong> {label}</span></div>
  return (
    <div>
      <div style={{ ...card, padding: '12px 16px', display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center', background: T.cardSoft }}>
        <span style={{ fontSize: 11, color: T.slate, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Facility Status</span>
        {stat('Covered', wingData.filter(w => !w.short).length, 'green')}
        {stat('Short-staffed', redWings, redWings ? 'red' : 'green')}
        {stat('Residents', present)}
        {stat('Modified diets', RESIDENTS.filter(r => DIETS[r.diet].sev >= 2).length, 'amber')}
        {stat('RN 24/7', '', 'green')}
      </div>

      {redWings > 0 && <div style={{ marginTop: 14, background: T.redSoft, border: `1px solid ${T.red}55`, borderLeft: `4px solid ${T.red}`, borderRadius: 10, padding: '13px 15px', display: 'flex', gap: 12 }}><span style={{ color: T.redText, fontWeight: 900, fontSize: 16 }}>!</span><div><div className="disp" style={{ fontSize: 14, fontWeight: 800, color: T.redText }}>{wingData.find(w => w.short)?.name} — Below Safe Staffing</div><div style={{ fontSize: 12.5, color: T.ink, marginTop: 2 }}>Cover required. Notified: RN in Charge, Care Manager.</div></div></div>}

      {sectionTitle('Wing Status', 'Updated just now')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
        {wingData.map(w => (
          <div key={w.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div className="disp" style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{w.name}</div><div style={{ fontSize: 11, color: T.slate }}>{w.band}</div></div>
              <Pill level={w.level}>{w.short ? 'Short' : 'Covered'}</Pill>
            </div>
            <div style={{ display: 'flex', gap: 18, margin: '12px 0 10px', alignItems: 'flex-end' }}>
              <div><div className="disp" style={{ fontSize: 24, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{w.res.length}</div><div style={{ fontSize: 10.5, color: T.slate }}>residents</div></div>
              <div><div className="disp" style={{ fontSize: 24, fontWeight: 800, color: w.short ? T.red : T.ink, lineHeight: 1 }}>{w.staff.length}<span style={{ fontSize: 13, color: T.slate }}>/{w.required}</span></div><div style={{ fontSize: 10.5, color: T.slate }}>carers</div></div>
            </div>
            <Bar pct={(w.staff.length / w.required) * 100} color={STAT[w.level].dot} />
            {w.dietRes.length > 0 && <div style={{ fontSize: 11.5, color: T.amberText, fontWeight: 700, marginTop: 10 }}>🍽 {w.dietRes.length} modified diet{w.dietRes.length > 1 ? 's' : ''}</div>}
          </div>
        ))}
      </div>

      {sectionTitle('Clinical watch list', `${watch.length} need eyes`)}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {watch.map((r, i) => { const lv = resLevel(r); return (
          <button key={r.id} onClick={() => onRes(r.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', border: 'none', borderBottom: i < watch.length - 1 ? `1px solid ${T.line}` : 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
            <Dot level={lv} glow />
            <span style={{ fontSize: 13, fontWeight: 700, color: T.ink, width: 92 }}>{r.name}</span>
            <span style={{ fontSize: 11, color: T.slate, width: 44 }}>{r.room}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: STAT[lv].text, flex: 1 }}>{resFlag(r)}</span>
            <span style={{ color: T.accent, fontSize: 16 }}>›</span>
          </button>
        )})}
      </div>
    </div>
  )
}

function Wings({ wingData, onRes }) {
  return (
    <div>{sectionTitle('Wings', 'Census, staffing & diets')}
      <div style={{ display: 'grid', gap: 14 }}>
        {wingData.map(w => (
          <div key={w.id} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div><div className="disp" style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{w.name}</div><div style={{ fontSize: 11.5, color: T.slate }}>{w.band} · {w.staff.map(s => s.name).join(', ')}</div></div>
              <Pill level={w.level}>{w.short ? 'Short-staffed' : 'Covered'}</Pill>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              {[['Residents', `${w.res.length}/${w.capacity}`], ['Carers', `${w.staff.length}/${w.required}`], ['Modified diets', w.dietRes.length]].map(([l, v]) => <div key={l} style={{ background: T.cardSoft, borderRadius: 10, padding: '8px 12px', minWidth: 84 }}><div style={{ fontSize: 10.5, color: T.slate }}>{l}</div><div className="disp" style={{ fontSize: 16, fontWeight: 800, color: T.ink }}>{v}</div></div>)}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {w.res.map(r => { const lv = resLevel(r); return <button key={r.id} onClick={() => onRes(r.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: STAT[lv].soft, border: `1px solid ${STAT[lv].dot}33`, borderRadius: 999, padding: '5px 11px', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, color: T.ink }}><Dot level={lv} size={8} />{r.name}{DIETS[r.diet].alert ? ' 🍽' : ''}</button> })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const areaLevel = a => (a.people > a.max ? 'red' : a.people === a.max ? 'amber' : 'green')
const areaLabel = a => (a.people > a.max ? 'Over capacity' : a.people === a.max ? 'At capacity' : 'Open')
const grpLevel = g => (g.staff.length < g.required ? 'red' : 'green')
function Activities() {
  const onBoard = ACTIVITIES.groups.reduce((a, g) => a + g.staff.length, 0)
  const needed = ACTIVITIES.groups.reduce((a, g) => a + g.required, 0)
  return (
    <div>
      {sectionTitle('Activity groups', `${ACTIVITIES.time} · how the groups are set up`)}
      <div style={{ fontSize: 12.5, color: T.slate, marginBottom: 12 }}>Residents are grouped by ability so the right support is on board — each group lists who needs a closer eye (falls, wandering, transfers) so the coordinator doesn’t have to remember before moving residents about.</div>
      <div style={{ ...card, borderLeft: `5px solid ${onBoard >= needed ? T.green : T.red}`, marginBottom: 14 }}><div style={{ fontSize: 12, fontWeight: 700, color: T.ink, marginBottom: 4 }}>Total activity supervision</div><div className="disp" style={{ fontSize: 22, fontWeight: 800, color: onBoard >= needed ? T.green : T.red }}>{onBoard} <span style={{ fontSize: 13, color: T.slate, fontWeight: 600 }}>/ {needed} needed</span></div><div style={{ fontSize: 11.5, color: T.slate }}>{onBoard >= needed ? 'All groups supported' : 'A group is short — call a float'}</div></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 14 }}>
        {ACTIVITIES.groups.map(g => { const lvl = grpLevel(g); return (
          <div key={g.key} style={{ ...card, borderLeft: `6px solid ${STAT[lvl].dot}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <div><div className="disp" style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>{g.name}</div><div style={{ fontSize: 11.5, color: T.slate }}>{g.band} · from {g.from} · {g.ratioText}</div></div>
              <Pill level={lvl}>{lvl === 'green' ? 'Supported' : 'Short'}</Pill>
            </div>
            <div style={{ display: 'flex', gap: 22, margin: '14px 0 6px', alignItems: 'flex-end' }}>
              <div><div className="disp" style={{ fontSize: 26, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{g.people}</div><div style={{ fontSize: 10.5, color: T.slate }}>residents</div></div>
              <div><div className="disp" style={{ fontSize: 26, fontWeight: 800, color: lvl === 'red' ? T.red : T.ink, lineHeight: 1 }}>{g.staff.length}<span style={{ fontSize: 14, color: T.slate }}>/{g.required}</span></div><div style={{ fontSize: 10.5, color: T.slate }}>staff</div></div>
            </div>
            <div style={{ fontSize: 11, color: T.slate, marginBottom: 10 }}>{g.math}</div>
            <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: T.slate, margin: '4px 0 8px' }}>Areas in use · {g.area}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {g.areas.map((an, i) => { const a = AREAS[an]; const al = areaLevel(a); return (
                <div key={i} style={{ border: `1px solid ${T.line}`, borderRadius: 10, padding: '9px 11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 12, fontWeight: 600, color: T.ink }}>{an}</span><Dot level={al} size={8} /></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: T.slate, margin: '6px 0 5px' }}><span>{a.people}/{a.max}</span><span style={{ fontWeight: 700, color: STAT[al].text }}>{areaLabel(a)}</span></div>
                  <Bar pct={(a.people / a.max) * 100} color={STAT[al].dot} />
                </div>
              )})}
            </div>
            {(g.flags.length > 0 || g.aware.length > 0) && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
              {g.flags.map((n, i) => <span key={i} style={{ fontSize: 12, fontWeight: 700, color: T.redText, background: T.redSoft, padding: '4px 10px', borderRadius: 999 }}>⚠ {n}</span>)}
              {g.aware.map((n, i) => <span key={i} style={{ fontSize: 12, fontWeight: 600, color: T.amberText, background: T.amberSoft, padding: '4px 10px', borderRadius: 999 }}>{n}</span>)}
            </div>}
          </div>
        )})}
      </div>
    </div>
  )
}

function Meals({ wingData, cs, set }) {
  const meals = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner']]
  return (
    <div>
      {sectionTitle('Diet-safe meal setup', 'Auto-built from each resident’s IDDSI plan')}
      <div style={{ fontSize: 12.5, color: T.slate, marginBottom: 12 }}>For every wing, Genevieve flags who needs a texture-modified diet, what to keep off their tray, and what to swap in — so staff don’t have to remember each swallowing plan before serving.</div>
      {wingData.map(w => {
        if (!w.res.length) return null
        const modified = w.res.filter(r => DIETS[r.diet].sev >= 2)
        const diets = [...new Set(modified.map(r => r.diet))]
        const avoid = [...new Set(diets.flatMap(k => DIETS[k].avoid))]
        const swaps = [...new Set(diets.flatMap(k => DIETS[k].swaps))]
        return (
          <div key={w.id} style={{ ...card, marginBottom: 14 }}>
            <div className="disp" style={{ fontSize: 16, fontWeight: 800, color: T.ink, marginBottom: 10 }}>{w.name}</div>
            {modified.length > 0 ? (
              <>
                <div style={{ border: `2px solid ${T.red}`, borderRadius: 12, padding: 14, background: T.redSoft }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: T.redText }}>🍽 Texture-modified — supervise &amp; sit upright</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 9 }}>{modified.map((r, i) => <span key={i} style={{ fontSize: 12.5, fontWeight: 700, color: T.redText, background: T.card, border: `1px solid ${T.red}55`, padding: '5px 11px', borderRadius: 999 }}>{r.name} · {DIETS[r.diet].label.split(' (')[0]}</span>)}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <List title="Keep off their tray" items={avoid} tone="red" />
                  <List title="Swap in" items={swaps} tone="green" />
                </div>
              </>
            ) : <div style={{ fontSize: 13, color: T.slate, marginBottom: 8 }}>No texture-modified diets in this wing — standard menu.</div>}
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {w.res.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${T.line}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.ink, flex: 1 }}>{r.name}<span style={{ fontSize: 11, color: DIETS[r.diet].sev >= 2 ? T.redText : T.slate, fontWeight: 700 }}> · {DIETS[r.diet].label.split(' (')[0]}</span></span>
                  {meals.map(([k, label]) => <button key={k} onClick={() => set(r.id, { [k]: !cs(r.id)[k] })} style={{ border: `1px solid ${cs(r.id)[k] ? T.green : T.line}`, background: cs(r.id)[k] ? T.greenSoft : T.card, color: cs(r.id)[k] ? T.greenText : T.slate, fontSize: 11, fontWeight: 700, padding: '6px 10px', borderRadius: 8, cursor: 'pointer', minWidth: 70 }}>{cs(r.id)[k] ? '✓ ' : ''}{label}</button>)}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Rounds({ cs, set, onRes }) {
  const list = RESIDENTS.filter(r => (r.mobility !== 'Independent') && cs(r.id).present)
  const done = list.filter(r => cs(r.id).repositioned).length
  const toggle = r => { const s = cs(r.id); set(r.id, { repositioned: !s.repositioned, lastCheck: !s.repositioned ? now() : s.lastCheck }) }
  return (
    <div>
      <div style={{ ...card, padding: '12px 16px', display: 'flex', gap: 22, flexWrap: 'wrap', alignItems: 'center', background: T.cardSoft }}>
        <span style={{ fontSize: 11, color: T.slate, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>Care Rounds</span>
        <span style={{ fontSize: 13, color: T.ink }}><strong>{done}/{list.length}</strong> repositioned</span>
        <span style={{ fontSize: 13, color: T.ink }}><strong>{list.length - done}</strong> due</span>
        <span style={{ fontSize: 11.5, color: T.amberText, fontWeight: 600 }}>Reposition & falls checks every 2 hrs</span>
      </div>
      {sectionTitle('Repositioning & checks — mark off when done')}
      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        {list.map((r, i) => { const s = cs(r.id); const lv = s.repositioned ? 'green' : r.falls === 3 ? 'red' : 'amber'
          return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderBottom: i < list.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <Dot level={lv} glow />
              <button onClick={() => onRes(r.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{r.name} <span style={{ fontSize: 11, color: T.slate, fontWeight: 600 }}>{r.room} · {r.mobility}</span></div>
                <div style={{ fontSize: 11.5, color: STAT[lv].text }}>{s.repositioned ? `Done ${s.lastCheck || ''}` : r.falls === 3 ? 'Due — high falls risk' : 'Due'}</div>
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ fontSize: 10.5, color: T.slate }}>Done</span><Toggle on={s.repositioned} onClick={() => toggle(r)} label={`${r.name} repositioned`} /></div>
            </div>
          )})}
      </div>
    </div>
  )
}

function Residents({ cs, onRes }) {
  return (
    <div>{sectionTitle('Residents', `${RESIDENTS.filter(r => cs(r.id).present).length} on site`)}
      {WINGS.map(w => { const res = RESIDENTS.filter(r => r.wing === w.id); return (
        <div key={w.id} style={{ ...card, marginBottom: 12, padding: 0, overflow: 'hidden' }}>
          <div style={{ background: T.cardSoft, padding: '10px 16px', fontSize: 12, fontWeight: 800, color: T.ink, textTransform: 'uppercase', letterSpacing: 1, borderBottom: `1px solid ${T.line}` }}>{w.name}</div>
          {res.map((r, i) => { const lv = resLevel(r); return (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: i < res.length - 1 ? `1px solid ${T.line}` : 'none' }}>
              <Dot level={lv} glow />
              <button onClick={() => onRes(r.id)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left', flex: 1, padding: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink }}>{r.name} <span style={{ fontSize: 11, color: T.slate, fontWeight: 600 }}>{r.room} · age {r.age}</span>{DIETS[r.diet].alert ? <span style={{ fontSize: 11, color: T.amber }}> 🍽</span> : null}</div>
                <div style={{ fontSize: 11.5, color: T.slate }}>{resFlag(r)}</div>
              </button>
            </div>
          )})}
        </div>
      )})}
    </div>
  )
}

function ResModal({ res: r, cs, set, onClose }) {
  const s = cs(r.id); const d = DIETS[r.diet]
  const fallsLabel = { 1: 'Low', 2: 'Medium', 3: 'High' }[r.falls]; const fallsLevel = r.falls === 3 ? 'red' : r.falls === 2 ? 'amber' : 'green'
  const meals = [['breakfast', 'Breakfast'], ['lunch', 'Lunch'], ['dinner', 'Dinner']]
  if (r.mobility !== 'Independent') meals.push(['repositioned', 'Repositioned / checked'])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(20,58,54,.5)', zIndex: 100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '5vh 14px', overflowY: 'auto' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.card, borderRadius: 16, width: '100%', maxWidth: 470, padding: 22, border: `3px solid ${T.frame}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Dot level={resLevel(r)} size={14} glow /><div><div className="disp" style={{ fontSize: 20, fontWeight: 800, color: T.ink }}>{r.name}</div><div style={{ fontSize: 12.5, color: T.slate }}>Age {r.age} · {r.room} · {wingMeta(r.wing).name}</div></div></div>
          <button onClick={onClose} style={{ border: 'none', background: T.cardSoft, width: 30, height: 30, borderRadius: 999, fontSize: 16, color: T.slate, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
          <Pill level={fallsLevel}>Falls {fallsLabel}</Pill>
          {r.alerts.map((a, i) => <span key={i} style={{ fontSize: 11, fontWeight: 700, color: T.amberText, background: T.amberSoft, padding: '3px 10px', borderRadius: 999 }}>{a}</span>)}
        </div>

        <div style={{ marginTop: 14, background: d.sev === 3 ? T.redSoft : d.sev === 2 ? T.amberSoft : T.greenSoft, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: 16 }}>🍽</span><span style={{ fontWeight: 800, fontSize: 15, color: d.sev === 3 ? T.redText : d.sev === 2 ? T.amberText : T.greenText }}>{d.label}</span>{d.alert && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: T.red }}>Supervise</span>}</div>
          <div style={{ fontSize: 13, color: T.ink, marginTop: 10, lineHeight: 1.5 }}>{d.plan}</div>
          <div style={{ fontSize: 12.5, color: T.ink, marginTop: 8 }}>Mobility: {r.mobility}</div>
        </div>
        {d.sev >= 2 && <><List title="Keep off their tray" items={d.avoid} tone="red" /><List title="Avoid in activities" items={d.avoidActivity} tone="red" /><List title="Safe swaps" items={d.swaps} tone="green" /></>}

        {r.meds.length > 0 && <List title="Medication" items={r.meds} />}

        <div style={{ marginTop: 14, background: T.cardSoft, border: `1px solid ${T.line}`, borderRadius: 12, padding: '12px 14px' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: T.slate, marginBottom: 8 }}>Care checklist</div>
          {meals.map(([k, label]) => <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${T.line}` }}><span style={{ fontSize: 13.5, color: T.ink }}>{label}</span><Toggle on={!!s[k]} onClick={() => set(r.id, { [k]: !s[k] })} label={label} /></div>)}
        </div>

        {r.contacts.length > 0 && <List title="Family & GP" items={r.contacts} />}
        {r.notes.length > 0 && <List title="Progress notes" items={r.notes} />}
      </div>
    </div>
  )
}

// ===== ROSTER (shifts, RN coverage, ratios, staff certs) =====
const CERT_KEYS = [['ahpra', 'AHPRA'], ['firstAid', 'First Aid'], ['manualHandling', 'Manual handling'], ['police', 'Police check'], ['medComp', 'Med competency']]
function certLevel(s) {
  const vals = CERT_KEYS.map(([k]) => s[k]).filter(v => v !== 'N/A')
  if (vals.includes('expired')) return 'red'
  if (vals.includes('expiring')) return 'amber'
  return 'green'
}
function Roster({ shift, setShift, wingData }) {
  const staff = STAFF_ROSTER.filter(s => s.shift === shift)
  const duty = DUTY[shift]; const meta = SHIFTS.find(x => x.key === shift)
  const rnOn = staff.some(s => s.role === 'RN')
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
        {SHIFTS.map(sh => { const a = sh.key === shift; return <button key={sh.key} onClick={() => setShift(sh.key)} style={{ border: `1px solid ${a ? T.accent : T.line}`, background: a ? T.accent : T.card, color: a ? T.onAccent : T.ink, fontWeight: 700, fontSize: 13, padding: '9px 16px', borderRadius: 999, cursor: 'pointer' }}>{sh.label} · {sh.time}</button> })}
      </div>

      <div style={{ ...card, marginTop: 14, background: T.cardSoft }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', color: T.slate }}>On duty this shift · {meta.time}</span>
          <Pill level={rnOn ? 'green' : 'red'}>{rnOn ? 'RN on site' : 'NO RN — breach'}</Pill>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10 }}>
          {[['RN in charge', duty.rnCharge], ['First-aid officer', duty.firstAid], ['IPC lead', duty.ipc], ['Fire warden', duty.fireWarden]].map(([l, v]) => (
            <div key={l} style={{ background: T.card, border: `1px solid ${T.line}`, borderRadius: 10, padding: '10px 12px' }}><div style={{ fontSize: 10.5, color: T.slate, textTransform: 'uppercase', letterSpacing: '.05em' }}>{l}</div><div style={{ fontSize: 13.5, fontWeight: 700, color: T.ink, marginTop: 3 }}>{v}</div></div>
          ))}
        </div>
      </div>

      {sectionTitle('Staffing this shift', 'Residents per carer per wing')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
        {wingData.map(w => {
          const onShift = STAFF_ROSTER.filter(e => e.wing === w.id && e.shift === shift)
          const required = Math.max(1, Math.ceil(w.res.length / w.ratio))
          const lvl = onShift.length < required ? 'red' : 'green'
          return (
            <div key={w.id} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div className="disp" style={{ fontSize: 15, fontWeight: 800, color: T.ink }}>{w.name}</div><div style={{ fontSize: 11, color: T.slate }}>1:{w.ratio} target</div></div>
                <Pill level={lvl}>{lvl === 'red' ? 'Short' : 'Covered'}</Pill>
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, alignItems: 'flex-end' }}>
                <div><div className="disp" style={{ fontSize: 22, fontWeight: 800, color: T.ink, lineHeight: 1 }}>{w.res.length}</div><div style={{ fontSize: 10, color: T.slate }}>residents</div></div>
                <div><div className="disp" style={{ fontSize: 22, fontWeight: 800, color: lvl === 'red' ? T.red : T.ink, lineHeight: 1 }}>{onShift.length}<span style={{ fontSize: 12, color: T.slate }}>/{required}</span></div><div style={{ fontSize: 10, color: T.slate }}>carers</div></div>
              </div>
              <div style={{ fontSize: 11, color: T.slate, marginTop: 8 }}>{onShift.map(e => `${e.name} (${e.role})`).join(', ') || 'none rostered'}</div>
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
              <span style={{ fontSize: 11, color: T.slate }}>{e.role} · {wingMeta(e.wing).name}</span>
              {lv !== 'green' && <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, color: lv === 'red' ? T.redText : T.amberText }}>{lv === 'red' ? 'CERT EXPIRED — do not roster' : 'cert expiring'}</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {CERT_KEYS.map(([k, label]) => { const v = e[k]; if (v === 'N/A') return null; const c = v === 'expired' ? 'red' : v === 'expiring' ? 'amber' : 'green'; return <span key={k} style={{ fontSize: 11, fontWeight: 700, color: STAT[c].text, background: STAT[c].soft, padding: '3px 9px', borderRadius: 999 }}>{label}: {v === 'current' ? '✓' : v}</span> })}
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}

// ===== SAFETY & WHS =====
function Safety({ safe, toggleSafe }) {
  const all = SAFETY.flatMap(c => c.items)
  const done = all.filter(i => safe[i.id]).length
  const pct = Math.round((done / all.length) * 100)
  const level = pct === 100 ? 'green' : pct >= 60 ? 'amber' : 'red'
  return (
    <div>
      <div style={{ ...card, borderLeft: `6px solid ${STAT[level].dot}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Dot level={level} size={11} /><span className="disp" style={{ fontSize: 17, fontWeight: 800, color: T.ink }}>WHS daily safety register</span></div><div style={{ fontSize: 12.5, color: T.slate, marginTop: 3 }}>{done} of {all.length} checks complete — the clinical & work-safety items a safe facility confirms each shift.</div></div>
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
