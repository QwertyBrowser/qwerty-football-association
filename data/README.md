# Content JSON

Edit these files through GitHub or a local text editor.

- `matches.json`: match scores, featured status, teams, details, thumbnails, and highlights
- `tournaments.json`: tournament names, hosts, dates, teams, and podium results
- `countries.json`: country names and three-letter FIFA codes
- `settings.json`: homepage spotlight title and display settings

Set a match's `"featured"` property to `true` for the homepage spotlight. A maximum of six matches should be featured.

Tournament records can also include `"logo"`, `"primaryColor"`, and `"secondaryColor"`. Use six-digit hex values such as `"#147d64"` and `"#b9ff66"`.

Use `"TBD"` for unfinished tournament positions; the public site hides TBD podium positions.
