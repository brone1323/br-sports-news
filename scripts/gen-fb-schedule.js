// @ts-check
const fs = require('fs')
const path = require('path')

// ─── Pro teams (120) ordered by market size ───────────────────────────────────
// Excludes the 5 already configured: nhl-toronto-maple-leafs, nfl-dallas-cowboys,
// nfl-new-england-patriots, nba-los-angeles-lakers, mlb-new-york-yankees
const proTeamsOrdered = [
  // New York / New Jersey  — largest US sports market
  'mlb-new-york-mets', 'nfl-new-york-giants', 'nfl-new-york-jets',
  'nba-new-york-knicks', 'nba-brooklyn-nets', 'nhl-new-york-rangers',
  'nhl-new-york-islanders', 'nhl-new-jersey-devils',
  // Los Angeles
  'nba-los-angeles-clippers', 'nfl-los-angeles-rams', 'nfl-los-angeles-chargers',
  'mlb-los-angeles-dodgers', 'mlb-los-angeles-angels', 'nhl-los-angeles-kings', 'nhl-anaheim-ducks',
  // Chicago
  'nfl-chicago-bears', 'nba-chicago-bulls', 'nhl-chicago-blackhawks',
  'mlb-chicago-cubs', 'mlb-chicago-white-sox',
  // Dallas / Fort Worth (Cowboys already done)
  'nba-dallas-mavericks', 'nhl-dallas-stars', 'mlb-texas-rangers',
  // San Francisco Bay Area
  'nba-golden-state-warriors', 'nfl-san-francisco-49ers', 'mlb-san-francisco-giants',
  'mlb-oakland-athletics', 'nhl-san-jose-sharks',
  // Houston
  'nfl-houston-texans', 'nba-houston-rockets', 'mlb-houston-astros',
  // Washington DC
  'nfl-washington-commanders', 'nba-washington-wizards', 'nhl-washington-capitals', 'mlb-washington-nationals',
  // Philadelphia
  'nfl-philadelphia-eagles', 'nba-philadelphia-76ers', 'nhl-philadelphia-flyers', 'mlb-philadelphia-phillies',
  // Boston (Patriots already done)
  'nba-boston-celtics', 'nhl-boston-bruins', 'mlb-boston-red-sox',
  // Atlanta
  'nfl-atlanta-falcons', 'nba-atlanta-hawks', 'mlb-atlanta-braves',
  // Miami / South Florida
  'nfl-miami-dolphins', 'nba-miami-heat', 'nhl-florida-panthers', 'mlb-miami-marlins',
  // Phoenix / Arizona
  'nfl-arizona-cardinals', 'nba-phoenix-suns', 'nhl-arizona-coyotes', 'mlb-arizona-diamondbacks',
  // Seattle
  'nfl-seattle-seahawks', 'mlb-seattle-mariners', 'nhl-seattle-kraken',
  // Minneapolis / Minnesota
  'nfl-minnesota-vikings', 'nba-minnesota-timberwolves', 'nhl-minnesota-wild', 'mlb-minnesota-twins',
  // Denver / Colorado
  'nfl-denver-broncos', 'nba-denver-nuggets', 'nhl-colorado-avalanche', 'mlb-colorado-rockies',
  // San Diego
  'mlb-san-diego-padres',
  // Tampa Bay
  'nfl-tampa-bay-buccaneers', 'nhl-tampa-bay-lightning', 'mlb-tampa-bay-rays',
  // Detroit
  'nfl-detroit-lions', 'nba-detroit-pistons', 'nhl-detroit-red-wings', 'mlb-detroit-tigers',
  // Toronto (Maple Leafs already done)
  'nba-toronto-raptors', 'mlb-toronto-blue-jays',
  // Single-team markets
  'nba-portland-trail-blazers',
  'nba-orlando-magic',
  'nba-oklahoma-city-thunder',
  'nba-sacramento-kings',
  // Salt Lake City / Utah
  'nba-utah-jazz', 'nhl-utah-hockey-club',
  // New Orleans
  'nfl-new-orleans-saints', 'nba-new-orleans-pelicans',
  // Memphis
  'nba-memphis-grizzlies',
  // Indianapolis
  'nfl-indianapolis-colts', 'nba-indiana-pacers',
  // Kansas City
  'nfl-kansas-city-chiefs', 'mlb-kansas-city-royals',
  // Cleveland
  'nfl-cleveland-browns', 'nba-cleveland-cavaliers', 'mlb-cleveland-guardians',
  // Baltimore
  'nfl-baltimore-ravens', 'mlb-baltimore-orioles',
  // Milwaukee
  'nba-milwaukee-bucks', 'mlb-milwaukee-brewers',
  // Charlotte / Carolina
  'nfl-carolina-panthers', 'nba-charlotte-hornets',
  // Nashville
  'nhl-nashville-predators', 'nfl-tennessee-titans',
  // Las Vegas
  'nfl-las-vegas-raiders', 'nhl-vegas-golden-knights',
  // Smaller single/dual markets
  'nfl-green-bay-packers',
  'nfl-jacksonville-jaguars',
  'nfl-buffalo-bills', 'nhl-buffalo-sabres',
  'nhl-columbus-blue-jackets',
  // Pittsburgh
  'nfl-pittsburgh-steelers', 'nhl-pittsburgh-penguins', 'mlb-pittsburgh-pirates',
  // St. Louis
  'nhl-st-louis-blues', 'mlb-st-louis-cardinals',
  // Cincinnati
  'nfl-cincinnati-bengals', 'mlb-cincinnati-reds',
  // San Antonio
  'nba-san-antonio-spurs',
  // Canadian markets
  'nhl-edmonton-oilers', 'nhl-vancouver-canucks', 'nhl-calgary-flames',
  'nhl-ottawa-senators', 'nhl-winnipeg-jets', 'nhl-montreal-canadiens', 'nhl-carolina-hurricanes',
]

// ─── NCAA schools (68) ordered by program prominence / market size ────────────
const ncaaSchoolsOrdered = [
  // Big Ten powerhouses
  'big-ten-ohio-state', 'big-ten-usc', 'big-ten-ucla', 'big-ten-michigan',
  'big-ten-penn-state', 'big-ten-washington', 'big-ten-oregon',
  'big-ten-michigan-state', 'big-ten-wisconsin', 'big-ten-maryland',
  'big-ten-rutgers', 'big-ten-iowa', 'big-ten-nebraska', 'big-ten-minnesota',
  'big-ten-northwestern', 'big-ten-illinois', 'big-ten-purdue', 'big-ten-indiana',
  // SEC powerhouses
  'sec-texas', 'sec-georgia', 'sec-alabama', 'sec-florida',
  'sec-oklahoma', 'sec-tennessee', 'sec-lsu', 'sec-texas-am',
  'sec-auburn', 'sec-south-carolina', 'sec-arkansas', 'sec-kentucky',
  'sec-ole-miss', 'sec-mississippi-state', 'sec-missouri', 'sec-vanderbilt',
  // ACC programs
  'acc-notre-dame', 'acc-florida-state', 'acc-north-carolina', 'acc-miami',
  'acc-virginia-tech', 'acc-georgia-tech', 'acc-clemson', 'acc-duke',
  'acc-pitt', 'acc-boston-college', 'acc-virginia', 'acc-stanford',
  'acc-cal', 'acc-louisville', 'acc-nc-state', 'acc-smu',
  'acc-syracuse', 'acc-wake-forest',
  // Big 12 programs
  'big-12-texas-tech', 'big-12-tcu', 'big-12-baylor', 'big-12-kansas',
  'big-12-iowa-state', 'big-12-kansas-state', 'big-12-colorado', 'big-12-utah',
  'big-12-arizona-state', 'big-12-arizona', 'big-12-west-virginia',
  'big-12-cincinnati', 'big-12-ucf', 'big-12-houston', 'big-12-byu', 'big-12-oklahoma-state',
]

// ─── Schedule builder ─────────────────────────────────────────────────────────
function addDays(dateStr, n) {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function buildSchedule(slugs, startDate, dailyCounts) {
  const schedule = []
  let idx = 0
  let day = 0
  while (idx < slugs.length) {
    const count = dailyCounts[day] !== undefined ? dailyCounts[day] : dailyCounts[dailyCounts.length - 1]
    const batch = slugs.slice(idx, idx + count)
    if (batch.length > 0) {
      schedule.push({ date: addDays(startDate, day), slugs: batch })
    }
    idx += count
    day++
  }
  return schedule
}

// Pro teams: Apr 2 - May 4 (33 days), ramp 3 → 4 → 3
// Days  0-8  (Apr 2-10):  3/day = 27
// Days  9-29 (Apr 11-May 1): 4/day = 84
// Days 30-32 (May 2-4):   3/day =  9
// Total: 120
const proCounts = [
  ...Array(9).fill(3),
  ...Array(21).fill(4),
  ...Array(3).fill(3),
]
const proSchedule = buildSchedule(proTeamsOrdered, '2026-04-02', proCounts)

// NCAA conferences: Apr 2-3 (must be done before Apr 5)
const confSchedule = [
  { date: '2026-04-02', slugs: ['ncaa-big-ten', 'ncaa-sec'] },
  { date: '2026-04-03', slugs: ['ncaa-big-12', 'ncaa-acc'] },
]

// NCAA schools: Apr 5 - May 4 (30 days), ramp 2 → 3
// Days  0-20 (Apr 5-25):  2/day = 42
// Days 21-27 (Apr 26-May 2): 3/day = 21
// Days 28-29 (May 3-4):   3+2 = 5
// Total: 68
const ncaaCounts = [
  ...Array(21).fill(2),
  ...Array(7).fill(3),
  3, 2,
]
const ncaaSchedule = buildSchedule(ncaaSchoolsOrdered, '2026-04-05', ncaaCounts)

// Validate
const proTotal = proSchedule.reduce((s, d) => s + d.slugs.length, 0)
const ncaaTotal = ncaaSchedule.reduce((s, d) => s + d.slugs.length, 0)
console.log(`Pro schedule: ${proSchedule.length} days, ${proTotal} teams (expected 120)`)
console.log(`NCAA schedule: ${ncaaSchedule.length} days, ${ncaaTotal} schools (expected 68)`)

const output = {
  _note: 'Facebook page rollout schedule. Pro teams ordered by market size (largest first). NCAA conferences due before Apr 5. NCAA schools start Apr 5.',
  alreadyConfigured: [
    'nhl-toronto-maple-leafs',
    'nfl-dallas-cowboys',
    'nfl-new-england-patriots',
    'nba-los-angeles-lakers',
    'mlb-new-york-yankees',
    'bragging-rights',
  ],
  proTeams: {
    total: proTeamsOrdered.length,
    schedule: proSchedule,
  },
  ncaaConferences: {
    total: 4,
    deadline: '2026-04-04',
    schedule: confSchedule,
  },
  ncaaSchools: {
    total: ncaaSchoolsOrdered.length,
    startsOn: '2026-04-05',
    schedule: ncaaSchedule,
  },
}

const outPath = path.join(__dirname, '..', 'src', 'data', 'fb-rollout-schedule.json')
fs.writeFileSync(outPath, JSON.stringify(output, null, 2))
console.log('Written', outPath)
