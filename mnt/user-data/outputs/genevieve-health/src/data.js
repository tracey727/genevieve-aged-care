// Genevieve Health — combined data. Everything a coordinator shouldn't have to
// remember is encoded here: diet/swallowing plans (IDDSI, avoid, swaps),
// activity cohorts, area capacity, falls & care profiles.

export const WINGS = [
  { id: 'memory',   name: 'Memory Support', band: 'Dementia · Secure',    ratio: 5, capacity: 14 },
  { id: 'high',     name: 'High Care',      band: 'Complex · Palliative',  ratio: 4, capacity: 12 },
  { id: 'assisted', name: 'Assisted Living',band: 'Supported',             ratio: 9, capacity: 18 },
  { id: 'respite',  name: 'Respite',        band: 'Short-stay',            ratio: 6, capacity: 6 },
]

// Diet / swallowing library (IDDSI). sev: 1 monitor · 2 moderate · 3 high (aspiration)
export const DIETS = {
  thin: {
    label: 'Regular · thin fluids', severity: 'Standard', sev: 1, alert: false,
    plan: 'No texture modification. Normal diet and drinks.',
    avoid: ['Nothing restricted'],
    avoidActivity: ['No restriction'],
    swaps: ['Standard menu'],
  },
  soft6: {
    label: 'Soft & bite-sized (IDDSI 6)', severity: 'Moderate', sev: 2, alert: true,
    plan: 'Food soft, moist, bite-sized (≤1.5cm). Cut up; supervise pace.',
    avoid: ['Hard, crunchy or stringy foods', 'Skins, pips, crusty bread', 'Mixed thin-liquid + solid (e.g. cereal in milk)'],
    avoidActivity: ['Cooking sessions with hard tasting items', 'Hard lollies as activity rewards'],
    swaps: ['Slow-cooked, moist proteins', 'Soft fruit without skin', 'Mashable veg'],
  },
  minced5: {
    label: 'Minced & moist (IDDSI 5)', severity: 'High', sev: 3, alert: true,
    plan: 'Minced (≤4mm), moist, easily mashed with a fork. Upright 90° for meals; supervise.',
    avoid: ['Any whole or bite-sized pieces', 'Dry, crumbly textures', 'Loose hard bits (rice, peas, corn)'],
    avoidActivity: ['Tasting plates with mixed textures', 'Self-serve finger food'],
    swaps: ['Minced moist mains with gravy', 'Smooth mashed sides', 'Thickened sauces to bind'],
  },
  puree4: {
    label: 'Pureed (IDDSI 4)', severity: 'High', sev: 3, alert: true,
    plan: 'Smooth pureed, no lumps. Upright 90°, 1:1 supervision, slow pace. Thickened fluids as charted.',
    avoid: ['Any lumps or pieces', 'Standard thin drinks (use thickener)', 'Bread, crackers, raw veg'],
    avoidActivity: ['Group baking with sampling', 'Unsupervised drinks station'],
    swaps: ['Smooth purees moulded for appeal', 'Pre-thickened drinks', 'Smooth dessert (no seeds)'],
  },
}

export const RESIDENTS = [
  { id: 'r1', name: 'Joan A.', wing: 'memory', age: '84', room: 'M-04', diet: 'minced5', falls: 3, mobility: '1-assist', signIn: 'Resident',
    alerts: ['Dementia', 'High falls risk'], meds: ['PRN sedation · RN review'],
    contacts: ['Karen A. · Daughter/EPOA · 0412 330 771', 'Dr Lee · GP · 07 5573 1100'],
    notes: ['Responds to 1950s music. Sensor mat + hourly checks overnight.'] },
  { id: 'r2', name: 'Bill T.', wing: 'memory', age: '79', room: 'M-09', diet: 'thin', falls: 2, mobility: 'Walking stick', signIn: 'Resident',
    alerts: ['Dementia'], meds: [], contacts: ['Sue T. · Wife · 0419 552 030'], notes: ['Enjoys the garden loop after breakfast, supervised.'] },

  { id: 'r3', name: 'Margaret R.', wing: 'high', age: '88', room: 'H-02', diet: 'puree4', falls: 3, mobility: '2-assist / hoist', signIn: 'Resident',
    alerts: ['Palliative', 'Aspiration risk'], meds: ['Syringe driver · 4-hrly RN check'],
    contacts: ['Peter R. · Son/EPOA · 0423 551 884', 'Palliative Team · 07 5573 2200'],
    notes: ['Comfort focus, family aware. Mouth care 2-hrly. Upright for any intake.'] },
  { id: 'r4', name: 'Frank D.', wing: 'high', age: '82', room: 'H-07', diet: 'soft6', falls: 2, mobility: 'Wheelchair', signIn: 'Resident',
    alerts: ['Diabetic', 'Wound care'], meds: ['Insulin · BSL pre-meals'],
    contacts: ['Mary D. · Daughter · 0412 660 200'], notes: ['BSL before meals. Heel wound dressing alternate days.'] },

  { id: 'r5', name: 'Dorothy K.', wing: 'assisted', age: '76', room: 'A-11', diet: 'thin', falls: 1, mobility: 'Independent', signIn: 'Resident',
    alerts: [], meds: [], contacts: ['Helen K. · Daughter · 0419 887 540'], notes: ['Leads the craft group. Medication prompts only.'] },
  { id: 'r6', name: 'Edna P.', wing: 'assisted', age: '85', room: 'A-15', diet: 'soft6', falls: 2, mobility: 'Walking stick', signIn: 'Resident',
    alerts: ['Falls risk'], meds: [], contacts: ['Janet P. · Niece · 0410 442 889'], notes: ['A little low this week — extra 1:1 time helps.'] },

  { id: 'r7', name: 'Arthur L.', wing: 'respite', age: '78', room: 'R-01', diet: 'thin', falls: 2, mobility: '1-assist', signIn: 'Resident',
    alerts: ['Post-op wound'], meds: ['Antibiotics · 8am / 8pm'], contacts: ['Dana L. · Daughter · 0423 771 600'],
    notes: ['2-week respite, hip recovery. Physio daily, wound check. Goal: home with frame.'] },
  { id: 'r8', name: 'Vera S.', wing: 'respite', age: '83', room: 'R-04', diet: 'thin', falls: 1, mobility: 'Independent', signIn: 'Resident',
    alerts: [], meds: [], contacts: ['Ken S. · Son · 0419 220 110'], notes: ['Respite while family travels. Independent, enjoys the library cart.'] },
]

export const STAFF = [
  { id: 's1', name: 'Tracey', role: 'RN', wing: 'memory' },
  { id: 's2', name: 'Sam',    role: 'PCW',wing: 'memory' },
  { id: 's3', name: 'Priya',  role: 'RN', wing: 'high' },
  { id: 's4', name: 'Ben',    role: 'PCW',wing: 'high' },
  { id: 's5', name: 'Amara',  role: 'EN', wing: 'assisted' },
  { id: 's6', name: 'Jess',   role: 'PCW',wing: 'assisted' },
  { id: 's7', name: 'Noah',   role: 'PCW',wing: 'respite' },
]

// Activity areas with capacity
export const AREAS = {
  'Activity hall':   { people: 12, max: 15 },
  'Sensory garden':  { people: 6, max: 8 },
  'Memory lounge':   { people: 8, max: 8 },
  'Library nook':    { people: 4, max: 6 },
  'Therapy room':    { people: 3, max: 4 },
}

// Activity cohorts — grouped by ability so the right support is on board
export const ACTIVITIES = {
  time: '10:30am',
  groups: [
    { key: 'gentle', name: 'Gentle exercise', band: 'Mobility-supported', from: 'All wings',
      area: 'Activity hall', people: 12, required: 2, ratioText: 'Seated · staff at hand',
      math: '12 residents, 2 assist transfers + supervision → 2 staff',
      staff: [{ name: 'Jess', role: 'PCW' }, { name: 'Amara', role: 'EN' }],
      areas: ['Activity hall'],
      flags: ['Joan A. · high falls — chair with brakes', 'Frank D. · wheelchair position'], aware: [] },
    { key: 'music', name: 'Music & memories', band: 'Dementia-friendly', from: 'Memory Support',
      area: 'Memory lounge', people: 8, required: 2, ratioText: 'Calm · 1:4 support',
      math: '8 residents at 1:4 dementia support → 2 staff',
      staff: [{ name: 'Tracey', role: 'RN' }, { name: 'Sam', role: 'PCW' }],
      areas: ['Memory lounge', 'Sensory garden'],
      flags: ['Joan A. · may need quiet exit if unsettled'], aware: ['Bill T. · wandering — door supervised'] },
  ],
}

// ===========================================================================
// WHS / OH&S additions — staff certs, rosters & shift times, safety register
// ===========================================================================

// Cert status: 'current' | 'expiring' | 'expired'. ahpra 'N/A' for care workers.
export const STAFF_ROSTER = [
  { id: 's1', name: 'Tracey', role: 'RN',  wing: 'memory',   shift: 'morning', onNow: true,
    ahpra: 'current', firstAid: 'current', manualHandling: 'current', police: 'current', medComp: 'current' },
  { id: 's2', name: 'Sam',    role: 'PCW', wing: 'memory',   shift: 'morning', onNow: true,
    ahpra: 'N/A', firstAid: 'current', manualHandling: 'expiring', police: 'current', medComp: 'N/A' },
  { id: 's3', name: 'Priya',  role: 'RN',  wing: 'high',     shift: 'morning', onNow: true,
    ahpra: 'current', firstAid: 'current', manualHandling: 'current', police: 'current', medComp: 'current' },
  { id: 's4', name: 'Ben',    role: 'PCW', wing: 'high',     shift: 'morning', onNow: true,
    ahpra: 'N/A', firstAid: 'current', manualHandling: 'current', police: 'current', medComp: 'N/A' },
  { id: 's5', name: 'Amara',  role: 'EN',  wing: 'assisted', shift: 'morning', onNow: true,
    ahpra: 'current', firstAid: 'expiring', manualHandling: 'current', police: 'current', medComp: 'current' },
  { id: 's6', name: 'Jess',   role: 'PCW', wing: 'assisted', shift: 'morning', onNow: true,
    ahpra: 'N/A', firstAid: 'current', manualHandling: 'current', police: 'current', medComp: 'N/A' },
  { id: 's7', name: 'Noah',   role: 'PCW', wing: 'respite',  shift: 'morning', onNow: true,
    ahpra: 'N/A', firstAid: 'current', manualHandling: 'current', police: 'current', medComp: 'N/A' },
  { id: 's8', name: 'Grace',  role: 'RN',  wing: 'high',     shift: 'afternoon', onNow: false,
    ahpra: 'current', firstAid: 'current', manualHandling: 'current', police: 'current', medComp: 'current' },
  { id: 's9', name: 'Hana',   role: 'EN',  wing: 'memory',   shift: 'afternoon', onNow: false,
    ahpra: 'current', firstAid: 'current', manualHandling: 'current', police: 'expiring', medComp: 'current' },
  { id: 's10', name: 'Marco', role: 'PCW', wing: 'assisted', shift: 'night', onNow: false,
    ahpra: 'N/A', firstAid: 'current', manualHandling: 'current', police: 'current', medComp: 'N/A' },
  { id: 's11', name: 'Olivia',role: 'RN',  wing: 'high',     shift: 'night', onNow: false,
    ahpra: 'current', firstAid: 'current', manualHandling: 'expired', police: 'current', medComp: 'current' },
]

export const SHIFTS = [
  { key: 'morning',   label: 'Morning',   time: '7:00am – 3:00pm' },
  { key: 'afternoon', label: 'Afternoon', time: '2:30pm – 10:30pm' },
  { key: 'night',     label: 'Night',     time: '10:00pm – 7:00am' },
]

// Required duty roles each shift (RN 24/7 is a legislated requirement)
export const DUTY = {
  morning:   { rnCharge: 'Priya (RN) — RN in Charge', firstAid: 'Tracey', ipc: 'Amara (EN) — IPC Lead', fireWarden: 'Ben' },
  afternoon: { rnCharge: 'Grace (RN) — RN in Charge', firstAid: 'Grace', ipc: 'Hana (EN) — IPC Lead', fireWarden: 'Hana' },
  night:     { rnCharge: 'Olivia (RN) — RN on site 24/7', firstAid: 'Olivia', ipc: 'Olivia (RN) — IPC Lead', fireWarden: 'Marco' },
}

export const SAFETY = [
  { cat: 'Clinical safety', items: [
    { id: 'h_falls', label: 'Falls hazards cleared (paths, lighting, footwear)', freq: 'Each shift', by: 'All staff' },
    { id: 'h_bells', label: 'Call bells tested & within reach', freq: 'Each shift', by: 'Care staff' },
    { id: 'h_repos', label: 'Repositioning / pressure-care rounds on schedule', freq: '2-hourly', by: 'Care staff' },
    { id: 'h_meds', label: 'Medication round signed off (incl. S8 register)', freq: 'Each round', by: 'RN / EN' },
    { id: 'h_obs', label: 'Clinical deterioration / vital-signs review', freq: 'As charted', by: 'RN' },
  ]},
  { cat: 'Manual handling & equipment', items: [
    { id: 'h_hoist', label: 'Hoists & lifters checked / in service', freq: 'Daily', by: 'Care staff' },
    { id: 'h_slide', label: 'Slide sheets & transfer aids available', freq: 'Each shift', by: 'Care staff' },
    { id: 'h_2assist', label: '2-assist transfers correctly staffed', freq: 'Continuous', by: 'Team leader' },
    { id: 'h_aids', label: 'Wheelchairs & mobility aids safe & braked', freq: 'Daily', by: 'Care staff' },
  ]},
  { cat: 'Infection prevention & control', items: [
    { id: 'h_hand', label: 'Hand hygiene & PPE stocked at points of care', freq: 'Continuous', by: 'All staff' },
    { id: 'h_screen', label: 'Outbreak / illness screening current', freq: 'Daily', by: 'IPC lead' },
    { id: 'h_sharps', label: 'Sharps & clinical-waste disposal safe', freq: 'Continuous', by: 'Clinical staff' },
    { id: 'h_clean', label: 'Cleaning & sanitising schedule followed', freq: 'Daily', by: 'All staff' },
  ]},
  { cat: 'Environment & emergency', items: [
    { id: 'h_hotwater', label: 'Hot-water temperature safe (anti-scald)', freq: 'Weekly', by: 'Maintenance' },
    { id: 'h_fire', label: 'Fire equipment, exits & evacuation plan clear', freq: 'Each shift', by: 'Fire warden' },
    { id: 'h_code', label: 'Emergency / code-blue equipment ready', freq: 'Daily', by: 'RN' },
    { id: 'h_secure', label: 'Secure-unit (Memory Support) doors checked', freq: 'Each shift', by: 'Care staff' },
    { id: 'h_chem', label: 'Hazardous chemicals locked & labelled', freq: 'Daily', by: 'All staff' },
  ]},
  { cat: 'Records & compliance', items: [
    { id: 'h_restraint', label: 'Restrictive-practices register & authorisations current', freq: 'Ongoing', by: 'RN / Manager' },
    { id: 'h_bsp', label: 'Behaviour-support plans current', freq: 'Ongoing', by: 'RN' },
    { id: 'h_certs', label: 'Staff AHPRA, first-aid & manual-handling current', freq: 'Ongoing', by: 'Manager' },
    { id: 'h_incident', label: 'Clinical-incident & hazard log up to date', freq: 'Continuous', by: 'All staff' },
  ]},
]

export const EMERGENCY = {
  emergency: 'Police / Fire / Ambulance · 000',
  hospital: 'Gold Coast University Hospital · (07) 5687 0000',
  poisons: 'Poisons Information · 13 11 26',
  evacuation: 'Assembly point: rear courtyard, lawn area',
  drill: 'Last evacuation drill: 22 days ago · RN 24/7 on site',
}
