# Pitch

A static football/soccer results website that is hosted with GitHub Pages and reads all customizable content from JSON files.

## Project structure

- `index.html` - Website entry point
- `styles.css` - Shared stylesheet imports
- `css/` - Base, landing, overview, form, and responsive styles
- `js/core.js` - JSON loading and shared utilities
- `js/pages.js` - Home, match, and event views
- `js/shell.js` - Navigation and click handling
- `js/router.js` - Page routing
- `data/matches.json` - Match records
- `data/events.json` - Event records
- `data/countries.json` - Countries and FIFA codes
- `data/settings.json` - Homepage and display settings
- `assets/media/` - Optional thumbnails and highlight videos

## Editing content

Edit the JSON files through GitHub or locally. Commit and push your changes to publish updates.

### Matches template

Edit `data/matches.json` to add or update match records.

```json
[
  {
  "id": "unique-match-id",
  "featured": false,
  "event": "Event name or Friendly",
  "round": "Final",
  "team1": "Spain",
  "team2": "England",
  "score1": "2",
  "score2": "1",
  "aet": false,
  "penalties": "5-3",
  "goals1": [
    {
      "name": "Player name",
      "minute": "47",
      "own": false
    }
  ],
  "goals2": [
    {
      "name": "Player name",
      "minute": "73",
      "own": false
    }
  ],
  "penaltyTakers": [
    {
      "name": "Player name",
      "team": "Spain",
      "scored": true
    }
  ],
  "referee": "Referee name",
  "attendance": "74475",
  "stadium": "Olympiastadion",
  "city": "Berlin",
  "country": "Germany",
  "date": "2026-09-30",
  "thumbnail": "assets/media/spain-england.jpg",
  "highlightUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "highlightFile": "assets/media/spain-england.mp4"
  }
]
```

Match field guidance:

- `id`: Unique identifier. Do not change an existing ID unless the match is replaced.
- `featured`: `true` to place the match in the homepage spotlight. Maximum: 6 matches.
- `event`: Use `Friendly` or the exact name of an event in `events.json`.
- `team1` and `team2`: Country names must exist in `countries.json`.
- `score1` and `score2`: Leave both values as `""` when the score is not confirmed.
- `aet`: `true` if the match finished after extra time.
- `penalties`: Optional penalty score, for example `"5-3"`. Leave `""` when unused.
- `goals1` and `goals2`: Use separate arrays for team 1 and team 2. The overview combines repeated scorer names and displays each distinct minute once.
- Set a goal's optional `penalty` field to `true` to mark a penalty goal in the overview.
- `penaltyTakers`: Add each taker's `team` using the exact name in `team1` or `team2` so the overview displays them under the correct nation.
- `own`: `true` for an own goal.
- `attendance`: Digits only, for example `"74475"`.
- `date`: ISO format: `yyyy-mm-dd`.
- `thumbnail`: Optional PNG, JPG/JPEG, or WebP path.
- `highlightUrl`: Optional YouTube URL.
- `highlightFile`: Optional local MP4, WebM, or MOV path.
- `highlightUrl` and `highlightFile`: When both are provided, YouTube takes priority.

For an upcoming match, leave `score1` and `score2` blank:

```json
"score1": "",
"score2": ""
```

### Events template

Edit `data/events.json`.

```json
[
  {
    "id": "unique-event-id",
    "name": "2026 QFA Nations Cup",
    "type": "Tournament",
    "teams": "24",
    "hosts": "Qatar",
    "startDate": "11/06/2026",
    "endDate": "19/07/2026",
    "logo": "assets/media/qfa-nations-cup.png",
    "primaryColor": "#147d64",
    "secondaryColor": "#b9ff66",
    "champion": "TBD",
    "runnerUp": "TBD",
    "third": "TBD"
  }
]
```

Event field guidance:

- `id`: Unique identifier.
- `name`: Event display name. Match records must use this exact name.
- `type`: Use `Tournament` or `League`.
- `teams`: Number of participating teams.
- `hosts`: Host nation or a comma-separated list.
- `startDate` and `endDate`: Separate dates in `dd/mm/yyyy` format. Cards and event overviews format the range for display.
- Same-year dates display as `30 Sep – 30 Oct 2026`; different-year dates display as `30 Sep 2026 – 30 Sep 2027`.
- `logo`: Optional event logo path, for example `assets/media/event-logo.png`.
- `primaryColor`: Optional two-color theme primary hex value. Defaults to `#147d64`.
- `secondaryColor`: Optional two-color theme accent hex value. Defaults to `#b9ff66`.
- `champion`, `runnerUp`, `third`: Use a country name or `"TBD"`.
- Event positions set to `"TBD"` are hidden from public event pages.

### Countries template

Edit `data/countries.json`.

```json
[
  {
    "name": "Jamaica",
    "code": "JAM"
  }
]
```

Country field guidance:

- `name`: Full country or territory name exactly as it should appear.
- `code`: Optional three-letter FIFA code.
- Team names in match records must exactly match a country `name`.
- Set `code` to `""` if no flag code is available.
- England, Scotland, and Wales use the following codes:
  - England: `ENG`
  - Scotland: `SCO`
  - Wales: `WAL`

## Match media

Upload files to `assets/media/`, then reference their repository-relative paths in `data/matches.json`.

Examples:

```json
"thumbnail": "assets/media/final-thumbnail.webp"
```

```json
"highlightFile": "assets/media/final-highlights.mp4"
```

Supported formats:

- Thumbnails: PNG, JPG/JPEG, and WebP
- Highlight videos: MP4, WebM, and MOV
- Remote highlights: YouTube URL in `highlightUrl`

## Homepage settings template

Edit `data/settings.json`.

```json
{
  "spotlightTitle": "Featured matches"
}
```

Setting guidance:

- `spotlightTitle`: Heading shown above the homepage match spotlight.
- Leave the setting as `""` to fall back to `Featured matches`.
- This value is repository-editable only; it is not shown as an editable field on the public website.

## Preview locally

Use a local web server. Opening `index.html` directly with `file://` may block JSON loading in some browsers.

```bash
cd /path/to/qfa
python3 -m http.server 4173
```

Open:

```text
http://localhost:4173
```

## Deploy with GitHub Pages

1. Push all project files to your GitHub repository.
2. Open the repository on GitHub.
3. Open **Settings**.
4. Open **Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select the branch containing the website, normally `main`.
7. Select the root folder: `/ (root)`.
8. Save.
9. Wait for GitHub Pages to finish the deployment.
10. Open the URL shown in the GitHub Pages settings.

After every content update:

1. Edit one or more JSON files.
2. Add optional media to `assets/media/`.
3. Commit the changes.
4. Push to the GitHub Pages branch.
5. Wait for the Pages deployment to finish.

## Public editing status

The public website has no Manage button, account system, browser editor, or browser-side content storage. Content can only be changed by someone who can edit and push to the repository.
