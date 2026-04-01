#!/usr/bin/env node
/**
 * Generates FACEBOOK-ROLLOUT-PLAN.md for all 125 teams.
 */

const fs = require('fs');
const path = require('path');
const teams = require('../src/data/teams.json');

const nfl = teams.filter(t => t.league === 'NFL');
const nba = teams.filter(t => t.league === 'NBA');
const mlb = teams.filter(t => t.league === 'MLB');
const nhl = teams.filter(t => t.league === 'NHL');
const maxDays = Math.max(nfl.length, nba.length, mlb.length, nhl.length); // 33

function makeDate(year, month, day) { return new Date(year, month - 1, day); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmt(d) { return MONTHS[d.getMonth()] + ' ' + d.getDate(); }
const start = makeDate(2026, 4, 2); // April 2, 2026

// Summary schedule table
let scheduleRows = '';
for (let i = 0; i < maxDays; i++) {
  const date = addDays(start, i);
  const nflT = nfl[i] ? nfl[i].name : '—';
  const nbaT = nba[i] ? nba[i].name : '—';
  const mlbT = mlb[i] ? mlb[i].name : '—';
  const nhlT = nhl[i] ? nhl[i].name : '—';
  scheduleRows += `| ${i+1} | ${fmt(date)}, 2026 | ${nflT} | ${nbaT} | ${mlbT} | ${nhlT} |\n`;
}

// Per-league detailed table
function leagueTable(leagueTeams) {
  let out = '| # | Date | Team | Slug | Profile | Cover |\n';
  out += '|---|------|------|------|---------|-------|\n';
  leagueTeams.forEach((t, i) => {
    const date = addDays(start, i);
    out += `| ${i+1} | ${fmt(date)} | ${t.name} | \`${t.slug}\` | ✅ | ✅ |\n`;
  });
  return out;
}

// Asset index sorted by slug
const sortedTeams = [...teams].sort((a, b) => a.slug.localeCompare(b.slug));
let assetIndex = '';
sortedTeams.forEach(t => {
  assetIndex += `├── ${t.slug.padEnd(42)} profile.png  cover.png\n`;
});

const plan = `# Facebook Page Rollout Plan — Bragging Rights

**Start date:** April 2, 2026
**End date:** May 4, 2026
**Cadence:** 4 pages per day (1 per league) to avoid Facebook flagging
**Total teams:** 125 (NFL: ${nfl.length}, NBA: ${nba.length}, MLB: ${mlb.length}, NHL: ${nhl.length})

Assets for each team are in \`public/facebook-assets/{team-slug}/\`:
- \`profile.png\` — 360×360 profile picture
- \`cover.png\` — 820×312 cover photo

---

## Summary Schedule

| Day | Date | NFL | NBA | MLB | NHL |
|-----|------|-----|-----|-----|-----|
${scheduleRows}
---

## Per-League Details

### NFL — ${nfl.length} teams (Apr 2 – May 3)

${leagueTable(nfl)}
### NBA — ${nba.length} teams (Apr 2 – May 1)

${leagueTable(nba)}
### MLB — ${mlb.length} teams (Apr 2 – May 1)

${leagueTable(mlb)}
### NHL — ${nhl.length} teams (Apr 2 – May 4)

${leagueTable(nhl)}
---

## Page Setup Checklist (per team)

When creating each Facebook page:

- [ ] Page name: \`Bragging Rights – [Team Name]\` (e.g. "Bragging Rights – Dallas Cowboys")
- [ ] Category: Sports Team / Fan Page
- [ ] Upload \`profile.png\` as profile picture
- [ ] Upload \`cover.png\` as cover photo
- [ ] Bio: "Daily fan polls, hot takes & debates for [Team Name] fans. Drop your opinion — we'll put it to a vote. #BraggingRights"
- [ ] Website: https://brsportsnews.com
- [ ] After setup: copy the Facebook Page ID into \`src/data/teams.json\` → \`facebookPageId\`

---

## Asset File Index

\`\`\`
public/facebook-assets/
${assetIndex}\`\`\`

---

*Generated 2026-03-31. Regenerate assets: \`node scripts/generate-facebook-assets.js\`*
`;

const outPath = path.join(__dirname, '..', 'FACEBOOK-ROLLOUT-PLAN.md');
fs.writeFileSync(outPath, plan);
console.log('Wrote FACEBOOK-ROLLOUT-PLAN.md');
