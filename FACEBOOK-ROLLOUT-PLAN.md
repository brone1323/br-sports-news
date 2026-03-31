# Facebook Page Rollout Plan — Bragging Rights

**Start date:** April 2, 2026
**Cadence:** 1 new page per league per day (4 pages/day max)
**Total teams:** 31 across NFL · NBA · MLB · NHL

Assets for each team are in `public/facebook-assets/{team-slug}/`:
- `profile.png` — 360×360 profile picture
- `cover.png` — 820×312 cover photo

---

## Schedule

| Day | Date | NFL | NBA | MLB | NHL |
|-----|------|-----|-----|-----|-----|
| 1 | Apr 2, 2026 | Dallas Cowboys | Los Angeles Lakers | New York Yankees | New York Rangers |
| 2 | Apr 3, 2026 | New England Patriots | Golden State Warriors | Los Angeles Dodgers | Boston Bruins |
| 3 | Apr 4, 2026 | Philadelphia Eagles | Boston Celtics | Boston Red Sox | Chicago Blackhawks |
| 4 | Apr 5, 2026 | San Francisco 49ers | New York Knicks | Chicago Cubs | Toronto Maple Leafs |
| 5 | Apr 6, 2026 | Green Bay Packers | Chicago Bulls | New York Mets | Pittsburgh Penguins |
| 6 | Apr 7, 2026 | Kansas City Chiefs | Brooklyn Nets | San Francisco Giants | Montreal Canadiens |
| 7 | Apr 8, 2026 | Pittsburgh Steelers | Miami Heat | Houston Astros | — |
| 8 | Apr 9, 2026 | New York Giants | Philadelphia 76ers | — | — |
| 9 | Apr 10, 2026 | Chicago Bears | — | — | — |
| 10 | Apr 11, 2026 | Baltimore Ravens | — | — | — |

---

## Per-League Details

### NFL — 10 teams (Apr 2–11)

| # | Date | Team | Slug | Profile | Cover |
|---|------|------|------|---------|-------|
| 1 | Apr 2 | Dallas Cowboys | `nfl-dallas-cowboys` | ✅ | ✅ |
| 2 | Apr 3 | New England Patriots | `nfl-new-england-patriots` | ✅ | ✅ |
| 3 | Apr 4 | Philadelphia Eagles | `nfl-philadelphia-eagles` | ✅ | ✅ |
| 4 | Apr 5 | San Francisco 49ers | `nfl-san-francisco-49ers` | ✅ | ✅ |
| 5 | Apr 6 | Green Bay Packers | `nfl-green-bay-packers` | ✅ | ✅ |
| 6 | Apr 7 | Kansas City Chiefs | `nfl-kansas-city-chiefs` | ✅ | ✅ |
| 7 | Apr 8 | Pittsburgh Steelers | `nfl-pittsburgh-steelers` | ✅ | ✅ |
| 8 | Apr 9 | New York Giants | `nfl-new-york-giants` | ✅ | ✅ |
| 9 | Apr 10 | Chicago Bears | `nfl-chicago-bears` | ✅ | ✅ |
| 10 | Apr 11 | Baltimore Ravens | `nfl-baltimore-ravens` | ✅ | ✅ |

### NBA — 8 teams (Apr 2–9)

| # | Date | Team | Slug | Profile | Cover |
|---|------|------|------|---------|-------|
| 1 | Apr 2 | Los Angeles Lakers | `nba-los-angeles-lakers` | ✅ | ✅ |
| 2 | Apr 3 | Golden State Warriors | `nba-golden-state-warriors` | ✅ | ✅ |
| 3 | Apr 4 | Boston Celtics | `nba-boston-celtics` | ✅ | ✅ |
| 4 | Apr 5 | New York Knicks | `nba-new-york-knicks` | ✅ | ✅ |
| 5 | Apr 6 | Chicago Bulls | `nba-chicago-bulls` | ✅ | ✅ |
| 6 | Apr 7 | Brooklyn Nets | `nba-brooklyn-nets` | ✅ | ✅ |
| 7 | Apr 8 | Miami Heat | `nba-miami-heat` | ✅ | ✅ |
| 8 | Apr 9 | Philadelphia 76ers | `nba-philadelphia-76ers` | ✅ | ✅ |

### MLB — 7 teams (Apr 2–8)

| # | Date | Team | Slug | Profile | Cover |
|---|------|------|------|---------|-------|
| 1 | Apr 2 | New York Yankees | `mlb-new-york-yankees` | ✅ | ✅ |
| 2 | Apr 3 | Los Angeles Dodgers | `mlb-los-angeles-dodgers` | ✅ | ✅ |
| 3 | Apr 4 | Boston Red Sox | `mlb-boston-red-sox` | ✅ | ✅ |
| 4 | Apr 5 | Chicago Cubs | `mlb-chicago-cubs` | ✅ | ✅ |
| 5 | Apr 6 | New York Mets | `mlb-new-york-mets` | ✅ | ✅ |
| 6 | Apr 7 | San Francisco Giants | `mlb-san-francisco-giants` | ✅ | ✅ |
| 7 | Apr 8 | Houston Astros | `mlb-houston-astros` | ✅ | ✅ |

### NHL — 6 teams (Apr 2–7)

| # | Date | Team | Slug | Profile | Cover |
|---|------|------|------|---------|-------|
| 1 | Apr 2 | New York Rangers | `nhl-new-york-rangers` | ✅ | ✅ |
| 2 | Apr 3 | Boston Bruins | `nhl-boston-bruins` | ✅ | ✅ |
| 3 | Apr 4 | Chicago Blackhawks | `nhl-chicago-blackhawks` | ✅ | ✅ |
| 4 | Apr 5 | Toronto Maple Leafs | `nhl-toronto-maple-leafs` | ✅ | ✅ |
| 5 | Apr 6 | Pittsburgh Penguins | `nhl-pittsburgh-penguins` | ✅ | ✅ |
| 6 | Apr 7 | Montreal Canadiens | `nhl-montreal-canadiens` | ✅ | ✅ |

---

## Page Setup Checklist (per team)

When creating each Facebook page:

- [ ] Page name: `Bragging Rights – [Team Name]` (e.g. "Bragging Rights – Dallas Cowboys")
- [ ] Category: Sports Team / Fan Page
- [ ] Upload `profile.png` as profile picture
- [ ] Upload `cover.png` as cover photo
- [ ] Bio: "Daily fan polls, hot takes & debates for [Team Name] fans. Drop your opinion — we'll put it to a vote. 🏆 #BraggingRights"
- [ ] Website: https://brsportsnews.com
- [ ] After setup: copy the Facebook Page ID into `src/data/teams.json` → `facebookPageId`

---

## Asset File Index

```
public/facebook-assets/
├── nfl-dallas-cowboys/          profile.png  cover.png
├── nfl-new-england-patriots/    profile.png  cover.png
├── nfl-philadelphia-eagles/     profile.png  cover.png
├── nfl-san-francisco-49ers/     profile.png  cover.png
├── nfl-green-bay-packers/       profile.png  cover.png
├── nfl-kansas-city-chiefs/      profile.png  cover.png
├── nfl-pittsburgh-steelers/     profile.png  cover.png
├── nfl-new-york-giants/         profile.png  cover.png
├── nfl-chicago-bears/           profile.png  cover.png
├── nfl-baltimore-ravens/        profile.png  cover.png
├── nba-los-angeles-lakers/      profile.png  cover.png
├── nba-golden-state-warriors/   profile.png  cover.png
├── nba-boston-celtics/          profile.png  cover.png
├── nba-new-york-knicks/         profile.png  cover.png
├── nba-chicago-bulls/           profile.png  cover.png
├── nba-brooklyn-nets/           profile.png  cover.png
├── nba-miami-heat/              profile.png  cover.png
├── nba-philadelphia-76ers/      profile.png  cover.png
├── mlb-new-york-yankees/        profile.png  cover.png
├── mlb-los-angeles-dodgers/     profile.png  cover.png
├── mlb-boston-red-sox/          profile.png  cover.png
├── mlb-chicago-cubs/            profile.png  cover.png
├── mlb-new-york-mets/           profile.png  cover.png
├── mlb-san-francisco-giants/    profile.png  cover.png
├── mlb-houston-astros/          profile.png  cover.png
├── nhl-new-york-rangers/        profile.png  cover.png
├── nhl-boston-bruins/           profile.png  cover.png
├── nhl-chicago-blackhawks/      profile.png  cover.png
├── nhl-toronto-maple-leafs/     profile.png  cover.png
├── nhl-pittsburgh-penguins/     profile.png  cover.png
└── nhl-montreal-canadiens/      profile.png  cover.png
```

---

*Generated 2026-03-31. Regenerate assets: `node scripts/generate-facebook-assets.js`*
