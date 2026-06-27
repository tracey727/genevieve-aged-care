// Genevieve Kids — combined data. Everything a coordinator shouldn't have to
// remember is encoded here: allergy plans (foods/play/swaps), play cohorts,
// zone capacity, sleep profiles. The app surfaces it automatically.

export const ROOMS = [
  { id: 'nursery', name: 'Nursery',  band: '0–24 months',      ratio: 4,  capacity: 16 },
  { id: 'toddler', name: 'Toddlers', band: '24–36 months',     ratio: 5,  capacity: 20 },
  { id: 'kindy',   name: 'Kindy',    band: '36 mo – preschool',ratio: 11, capacity: 24 },
  { id: 'oshc',    name: 'OSHC',     band: 'Over preschool',   ratio: 15, capacity: 30 },
]

// Allergen library. sev: 1 monitor · 2 moderate · 3 anaphylaxis
export const ALLERGENS = {
  milk: {
    label: "Cow's milk protein", severity: 'Anaphylaxis', sev: 3, epipen: true,
    plan: 'Adrenaline (EpiPen) on file. Follow the ASCIA action plan — give adrenaline first, then call 000.',
    avoidFoods: ['Dairy milk, cheese, yoghurt', 'Butter & cream', 'Milk custard / ice cream'],
    avoidPlay: ['Milk-carton & yoghurt-tub sensory play', 'Cream or butter-based playdough', 'Whipped-cream messy play'],
    swaps: ['Oat or soy milk at the table', 'Water-based paint & taste-safe dough'],
  },
  nuts: {
    label: 'Peanut & tree nut', severity: 'Anaphylaxis', sev: 3, epipen: true,
    plan: 'Adrenaline (EpiPen) on file. Strict nut-free table. Give adrenaline first, then call 000.',
    avoidFoods: ['Peanut butter & nut spreads', 'Muesli / snack bars with nuts', 'Satay & some sauces'],
    avoidPlay: ['Nut or nut-shell sensory bins', 'Bird-feeder craft using nuts', 'Some scented playdough'],
    swaps: ['Sunflower-seed butter (SunButter)', 'Rice, oat or cornflour sensory bins'],
  },
  egg: {
    label: 'Egg', severity: 'Moderate', sev: 2, epipen: false,
    plan: 'No adrenaline on file. Antihistamine plan — monitor closely and call family.',
    avoidFoods: ['Egg & mayonnaise', 'Quiche, frittata, some cakes', 'Egg-wash pastries'],
    avoidPlay: ['Eggshell mosaic craft', 'Egg-carton craft (residue)', 'Homemade paint/dough using egg'],
    swaps: ['Cardboard-tube crafts', 'Commercial taste-safe paint'],
  },
  wheat: {
    label: 'Wheat / gluten (coeliac)', severity: 'Intolerance', sev: 1, epipen: false,
    plan: 'No adrenaline needed. Strict gluten avoidance to prevent illness; separate utensils & board.',
    avoidFoods: ['Bread, pasta, wheat crackers', 'Standard flour in cooking', 'Some sauces & gravies'],
    avoidPlay: ['Standard playdough (wheat flour)', 'Cloud dough & papier-mâché', 'Dyed-pasta threading craft'],
    swaps: ['Gluten-free or cornflour playdough', 'Rice threading & cornflour cloud dough'],
  },
}

export const SLEEP_PROFILES = {
  fast:   { label: 'Out like a light', level: 'green', note: 'Settles fast and sleeps soundly.' },
  more:   { label: 'Needs a longer rest', level: 'green', note: 'Sleeps deeply — wakes grumpy if cut short, let them run on.' },
  slow:   { label: 'Slow to settle', level: 'amber', note: 'Needs patting or quiet company to drift off.' },
  resist: { label: 'Resists rest', level: 'red', note: 'Fights sleep — offer a quiet activity so the others can settle.' },
  quiet:  { label: 'Quiet rester (no nap)', level: 'slate', note: 'Has dropped the daytime nap — quiet play instead of sleep.' },
}

export const CHILDREN = [
  { id: 'c1', name: 'Ethan', room: 'nursery', age: '12 mo', allergy: 'milk', sleep: 'more', signIn: '7:55am',
    authorised: ['Sarah Bennett (Mum)', 'Mark Bennett (Dad)'], restricted: [],
    contacts: ['Sarah Bennett · Mum · 0412 334 556', 'Mark Bennett · Dad · 0423 110 982'],
    notes: ['Mum: reflux med given at home each morning — none needed here.', 'Use his labelled oat-milk bottle only, please.'] },
  { id: 'c2', name: 'Olivia', room: 'nursery', age: '10 mo', allergy: null, sleep: 'fast', signIn: '8:03am', authorised: ['Mum'], restricted: [], contacts: [], notes: [] },
  { id: 'c3', name: 'Ava', room: 'nursery', age: '8 mo', allergy: null, sleep: 'fast', signIn: '8:18am', authorised: ['Mum', 'Dad'], restricted: [], contacts: [], notes: [] },
  { id: 'c4', name: 'Mia', room: 'nursery', age: '16 mo', allergy: null, sleep: null, signIn: '8:31am', authorised: ['Mum'], restricted: [], contacts: [], notes: [] },
  { id: 'c5', name: 'Lucas', room: 'nursery', age: '9 mo', allergy: null, sleep: null, signIn: '8:47am', authorised: ['Mum', 'Dad'], restricted: [], contacts: [], notes: [] },

  { id: 'c6', name: 'Amelia', room: 'toddler', age: '26 mo', allergy: 'nuts', sleep: 'fast', signIn: '7:42am',
    authorised: ['Priya Rao (Mum)', 'Dev Rao (Dad)'], restricted: [],
    contacts: ['Priya Rao · Mum · 0410 882 071', 'Dev Rao · Dad · 0432 556 109'],
    notes: ["Dad: EpiPen lives in Amelia's red pouch in her bag.", 'Mum: she knows not to share food — a gentle reminder helps.'] },
  { id: 'c7', name: 'Jack', room: 'toddler', age: '31 mo', allergy: null, sleep: 'resist', signIn: '8:10am', authorised: ['Mum'], restricted: [], contacts: [], notes: [] },
  { id: 'c8', name: 'Charlotte', room: 'toddler', age: '28 mo', allergy: null, sleep: 'slow', signIn: '8:25am', authorised: ['Mum', 'Dad'], restricted: [], contacts: [], notes: [] },
  { id: 'c9', name: 'Oliver', room: 'toddler', age: '33 mo', allergy: null, sleep: null, signIn: '8:39am', authorised: ['Mum'], restricted: [], contacts: [], notes: [] },
  { id: 'c10', name: 'Ruby', room: 'toddler', age: '27 mo', allergy: null, sleep: null, signIn: '8:54am',
    authorised: ['Mia S. (Mum)'], restricted: ['Biological father — NOT authorised (court order)'], contacts: ['Mia S. · Mum · 0410 223 670'],
    notes: ['Custody: father is NOT permitted to collect — verify ID at pickup.'] },

  { id: 'c11', name: 'Sophie', room: 'kindy', age: '3 yr', allergy: 'egg', sleep: 'quiet', signIn: '8:20am',
    authorised: ['Hannah Wells (Mum)'], restricted: [], contacts: ['Hannah Wells · Mum · 0419 663 220'],
    notes: ['Mum: baked egg traces are usually fine — but no scrambled or boiled egg.'] },
  { id: 'c12', name: 'Thomas', room: 'kindy', age: '4 yr', allergy: 'wheat', sleep: 'quiet', signIn: '8:35am',
    authorised: ['Kate Lawson (Mum)', 'James Lawson (Dad)'], restricted: [],
    contacts: ['Kate Lawson · Mum · 0438 220 117', 'James Lawson · Dad · 0401 778 540'],
    notes: ['Mum: separate toaster & board are essential — even crumbs make him unwell.', 'GF snacks are in the labelled blue container.'] },
  { id: 'c13', name: 'Mason', room: 'kindy', age: '3 yr', allergy: null, sleep: 'quiet', signIn: '9:02am', authorised: ['Mum'], restricted: [], contacts: [], notes: [] },
  { id: 'c14', name: 'Ella', room: 'kindy', age: '4 yr', allergy: null, sleep: 'quiet', signIn: '9:10am', authorised: ['Mum', 'Dad'], inclusion: true, restricted: [], contacts: [],
    notes: ['Inclusion plan — speech support goals, visual cards in use.'] },
  { id: 'c15', name: 'Harper', room: 'kindy', age: '3 yr', allergy: null, sleep: null, signIn: '8:47am', authorised: ['Mum'], restricted: [], contacts: [], notes: [] },

  { id: 'c16', name: 'Riley', room: 'oshc', age: '6 yr', allergy: null, sleep: null, signIn: '7:30am', authorised: ['Mum'], restricted: [], contacts: [], notes: [] },
  { id: 'c17', name: 'Holly', room: 'oshc', age: '6 yr', allergy: null, sleep: null, signIn: '7:45am', authorised: ['Mum', 'Dad'], restricted: [], contacts: [], notes: [] },
]

export const EDUCATORS = [
  { id: 'e1', name: 'Priya', qualified: true,  room: 'nursery' },
  { id: 'e2', name: 'Mia',   qualified: true,  room: 'nursery' },
  { id: 'e3', name: 'Sam',   qualified: true,  room: 'toddler' },
  { id: 'e4', name: 'Leah',  qualified: false, room: 'toddler' },
  { id: 'e5', name: 'Jordan',qualified: true,  room: 'kindy' },
  { id: 'e6', name: 'Tom',   qualified: true,  room: 'kindy' },
]

// Outdoor play areas (zones) with live capacity
export const ZONES = {
  'Toddler soft zone':    { children: 5, max: 6 },
  'Sandpit & water play': { children: 6, max: 8 },
  'Climbing frame':       { children: 6, max: 6 },
  'Bike & scooter track': { children: 4, max: 5 },
  'Shade garden (quiet)': { children: 3, max: 10 },
}

// Age-group cohorts playing together outdoors — how play groups are set up
export const PLAY = {
  time: '10:30am', uv: 2,
  groups: [
    { key: 'under3', name: 'Under 3s', band: '0–36 months', from: 'Nursery + Toddlers',
      area: 'Toddler yard · fenced from bikes', children: 13, required: 3, ratioText: '1:4 + 1:5 combined',
      math: '5 under-2s (1:4) + 8 under-3s (1:5) → 3 educators',
      educators: [{ name: 'Priya', qualified: true }, { name: 'Mia', qualified: true }, { name: 'Sam', qualified: true }],
      zones: ['Toddler soft zone', 'Sandpit & water play'],
      epipen: ['Ethan · milk', 'Amelia · nuts'], aware: [] },
    { key: 'kindy', name: 'Kindy 3–5s', band: '36 mo – preschool', from: 'Kindy',
      area: 'Main playground', children: 12, required: 2, ratioText: '1:11',
      math: '12 children at 1:11 → 2 educators',
      educators: [{ name: 'Jordan', qualified: true }, { name: 'Tom', qualified: true }],
      zones: ['Climbing frame', 'Bike & scooter track', 'Shade garden (quiet)'],
      epipen: [], aware: ['Sophie · egg', 'Thomas · coeliac'] },
  ],
}

// ===========================================================================
// WHS / OH&S additions — staff certs, rosters & shift times, safety register
// ===========================================================================

// Cert status: 'current' | 'expiring' (<30 days) | 'expired' (cannot work)
// Staff on the floor now carry full WHS credentials a childcare service must hold.
export const STAFF_ROSTER = [
  { id: 'e1', name: 'Priya',  level: 'Diploma',  room: 'nursery', shift: 'morning', onNow: true,
    blueCard: 'current', firstAid: 'current', cpr: 'current', anaphylaxis: 'current', asthma: 'current' },
  { id: 'e2', name: 'Mia',    level: 'ECT',      room: 'nursery', shift: 'morning', onNow: true,
    blueCard: 'current', firstAid: 'current', cpr: 'current', anaphylaxis: 'current', asthma: 'current' },
  { id: 'e3', name: 'Sam',    level: 'Diploma',  room: 'toddler', shift: 'morning', onNow: true,
    blueCard: 'current', firstAid: 'expiring', cpr: 'current', anaphylaxis: 'current', asthma: 'current' },
  { id: 'e4', name: 'Leah',   level: 'Trainee',  room: 'toddler', shift: 'morning', onNow: true,
    blueCard: 'current', firstAid: 'current', cpr: 'current', anaphylaxis: 'expiring', asthma: 'current' },
  { id: 'e5', name: 'Jordan', level: 'Cert III', room: 'kindy',   shift: 'morning', onNow: true,
    blueCard: 'current', firstAid: 'current', cpr: 'current', anaphylaxis: 'current', asthma: 'current' },
  { id: 'e6', name: 'Tom',    level: 'Cert III', room: 'kindy',   shift: 'morning', onNow: true,
    blueCard: 'current', firstAid: 'current', cpr: 'current', anaphylaxis: 'current', asthma: 'current' },
  { id: 'e7', name: 'Aisha',  level: 'Diploma',  room: 'nursery', shift: 'afternoon', onNow: false,
    blueCard: 'current', firstAid: 'current', cpr: 'current', anaphylaxis: 'current', asthma: 'current' },
  { id: 'e8', name: 'Cooper', level: 'Cert III', room: 'toddler', shift: 'afternoon', onNow: false,
    blueCard: 'expired', firstAid: 'current', cpr: 'current', anaphylaxis: 'current', asthma: 'current' },
  { id: 'e9', name: 'Ngaire', level: 'ECT',      room: 'kindy',   shift: 'afternoon', onNow: false,
    blueCard: 'current', firstAid: 'current', cpr: 'current', anaphylaxis: 'current', asthma: 'expiring' },
]

export const SHIFTS = [
  { key: 'morning',   label: 'Morning',   time: '6:30am – 2:30pm' },
  { key: 'afternoon', label: 'Afternoon', time: '2:00pm – 6:30pm' },
]

// Nominated duty roles required on site each shift (National Law)
export const DUTY = {
  morning:   { responsible: 'Mia (ECT) — Nominated Supervisor', firstAid: 'Priya', anaphylaxis: 'Sam', fireWarden: 'Jordan' },
  afternoon: { responsible: 'Ngaire (ECT) — Responsible Person', firstAid: 'Aisha', anaphylaxis: 'Aisha', fireWarden: 'Cooper' },
}

// WHS / OH&S safety register — toggle each as it's checked off
export const SAFETY = [
  { cat: 'Opening & daily setup', items: [
    { id: 'k_indoor', label: 'Indoor safety check (cords, furniture, choke hazards)', freq: 'Daily', by: 'Room leader' },
    { id: 'k_outdoor', label: 'Outdoor playground inspection (equipment & surfaces)', freq: 'Daily', by: 'Room leader' },
    { id: 'k_gates', label: 'Gates & fences secured and latched', freq: 'Daily', by: 'Opening staff' },
    { id: 'k_chem', label: 'Chemicals & cleaning products locked away', freq: 'Daily', by: 'Opening staff' },
    { id: 'k_hotwater', label: 'Hot-water temperature within safe limit', freq: 'Weekly', by: 'Nominated supervisor' },
    { id: 'k_fridge', label: 'Fridge / freezer temperature logged (food safety)', freq: 'Daily', by: 'Cook' },
  ]},
  { cat: 'Supervision & ratios', items: [
    { id: 'k_signin', label: 'Children, staff & visitor sign-in registers current', freq: 'Continuous', by: 'All staff' },
    { id: 'k_headcount', label: 'Roll call / headcount completed', freq: 'Each transition', by: 'Room leader' },
    { id: 'k_supervision', label: 'Active supervision plan in place', freq: 'Continuous', by: 'Room leader' },
    { id: 'k_responsible', label: 'Qualified educator + responsible person on site', freq: 'Continuous', by: 'Director' },
  ]},
  { cat: 'Health & hygiene', items: [
    { id: 'k_hand', label: 'Hand-hygiene stations stocked', freq: 'Daily', by: 'All staff' },
    { id: 'k_nappy', label: 'Nappy-change area sanitised between uses', freq: 'Each use', by: 'Educators' },
    { id: 'k_clean', label: 'Toy & surface sanitising schedule followed', freq: 'Daily', by: 'All staff' },
    { id: 'k_illness', label: 'Illness exclusion check (no unwell children/staff)', freq: 'On arrival', by: 'Room leader' },
    { id: 'k_sun', label: 'Sun protection — hats, shade, sunscreen (UV)', freq: 'Before outdoor', by: 'Educators' },
  ]},
  { cat: 'Emergency preparedness', items: [
    { id: 'k_exits', label: 'Emergency exits clear & evacuation plan displayed', freq: 'Daily', by: 'Fire warden' },
    { id: 'k_fire', label: 'Smoke alarms & fire equipment serviceable', freq: 'Monthly', by: 'Fire warden' },
    { id: 'k_epikit', label: 'Anaphylaxis & asthma kits accessible & in date', freq: 'Daily', by: 'First-aid officer' },
    { id: 'k_firstaidkit', label: 'First-aid kits stocked & in date', freq: 'Weekly', by: 'First-aid officer' },
    { id: 'k_drill', label: 'Emergency evacuation drill up to date (monthly)', freq: 'Monthly', by: 'Nominated supervisor' },
  ]},
  { cat: 'Records & compliance', items: [
    { id: 'k_med', label: 'Medication authorisations & administration log current', freq: 'Continuous', by: 'Room leader' },
    { id: 'k_incident', label: 'Incident / injury / near-miss log up to date', freq: 'Continuous', by: 'All staff' },
    { id: 'k_certs', label: 'Staff Blue Cards & first-aid certs current', freq: 'Ongoing', by: 'Director' },
    { id: 'k_plans', label: 'Allergy & medical management plans current', freq: 'Ongoing', by: 'Director' },
  ]},
]

export const EMERGENCY = {
  evacuation: 'Assembly point: front car park, far fence',
  hospital: 'Gold Coast University Hospital · 1100 Smith St · (07) 5687 0000',
  poisons: 'Poisons Information · 13 11 26',
  emergency: 'Police / Fire / Ambulance · 000',
  drill: 'Last evacuation drill: 18 days ago (next due in 12 days)',
}
