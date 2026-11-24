# Content JSON

Edit these files through GitHub or a local text editor.

- `matches.json`: match scores, featured status, teams, details, thumbnails, and highlights
- `events.json`: event names, types, hosts, dates, teams, and podium results
- `countries.json`: country names and three-letter FIFA codes
- `settings.json`: homepage spotlight title and display settings

Set a match's `"featured"` property to `true` for the homepage spotlight. A maximum of six matches should be featured.

Add and edit match records in `matches.json`.

Use the match field `"event"` to reference the matching event name in `events.json`.

Each goal scorer is a separate object in `goals1` or `goals2`, with a `name`, `minute`, and optional `own` flag. The match overview combines entries for the same scorer, removes repeated minutes, and shows distinct minutes together.

Event records use `"type": "Tournament"` or `"type": "League"`, and have separate `"startDate"` and `"endDate"` fields in `dd/mm/yyyy` format. They can also include `"logo"`, `"primaryColor"`, and `"secondaryColor"`.

Use `"TBD"` for unfinished event positions; the public site hides TBD podium positions.
