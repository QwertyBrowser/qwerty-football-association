function render() {
  const app = document.getElementById("app");
  if (currentView === "match-detail") app.innerHTML = renderMatchOverview(currentDetailId);
  else if (currentView === "tournament-detail") app.innerHTML = renderTournamentOverview(currentDetailId);
  else if (currentView === "matches") app.innerHTML = renderMatchesPage();
  else if (currentView === "tournaments") app.innerHTML = renderTournamentsPage();
  else app.innerHTML = renderHome();
}

function renderHome() {
  const matches = sortedMatches();
  if (!matches.length) return `<div class="page"><div class="empty-state"><h2>No matches yet</h2><p>Matches will appear after they are added to the content JSON.</p></div></div>`;
  const featured = matches.filter(match => match.featured).slice(0, 6);
  const latest = matches.filter(match => !isMatchUpcoming(match));
  const upcoming = matches.filter(isMatchUpcoming).sort((a,b) => (a.date || "").localeCompare(b.date || ""));
  const cards = latest.slice(0, 6);
  const spotlightTitle = data.settings.spotlightTitle || "Featured matches";
  return `
    <div class="page">
      ${featured.length ? `<div class="section-heading spotlight-section-heading" style="margin-top:0"><h2>${escapeHtml(spotlightTitle)}</h2></div>` : ""}
      ${featured.length ? `<div class="spotlight-grid spotlight-${featured.length}">${featured.map(renderHero).join("")}</div>` : `<div class="empty-state">No spotlight matches selected.</div>`}
      <div class="section-heading">
        <h2>Latest matches</h2>
        <button class="text-button" data-view="matches">View all matches →</button>
      </div>
      ${cards.length ? `<div class="match-grid">${cards.map(renderMatchCard).join("")}</div>` : `<div class="empty-state compact">No completed matches yet.</div>`}
      <div class="section-heading">
        <h2>Upcoming matches</h2>
        <button class="text-button" data-view="matches">View schedule →</button>
      </div>
      ${upcoming.length ? `<div class="match-grid">${upcoming.slice(0,6).map(renderMatchCard).join("")}</div>` : `<div class="empty-state compact">No upcoming matches scheduled.</div>`}
    </div>`;
}

function renderGroupedMatches(matches, renderMatch, layout) {
  const groups = new Map();
  matches.forEach(match => {
    const key = match.date || "date-tbc";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(match);
  });
  return [...groups].map(([date, dayMatches]) => `
    <section class="match-day-group">
      <h3 class="match-day-heading">${date === "date-tbc" ? "Date TBC" : matchDayLabel(date)}</h3>
      <div class="${layout === "cards" ? "match-grid" : "full-match-list"}">${dayMatches.map(renderMatch).join("")}</div>
    </section>`).join("");
}

function matchDayLabel(date) {
  const parsedDate = new Date(`${date}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC"
  }).formatToParts(parsedDate);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.day} ${values.month}, ${values.year}`;
}

function renderHero(match) {
  const score = hasConfirmedScore(match) ? `${match.score1}–${match.score2}` : "vs.";
  const extras = [match.aet ? "(a.e.t.)" : "", match.penalties ? `Penalties ${match.penalties}` : ""].filter(Boolean).join(" · ");
  const tournament = data.tournaments.find(item => item.name === match.tournament);
  const themeStyle = tournamentThemeStyle(tournament);
  const thumbnailStyle = matchThumbnailStyle(match).replace(/^style="/, "").replace(/"$/, "");
  const heroStyle = `style="${themeStyle}${thumbnailStyle ? `;${thumbnailStyle}` : ""}"`;
  return `
    <article class="hero" ${heroStyle}>
      <div class="hero-copy">
        <div class="match-title-bar"><p class="eyebrow">${escapeHtml(match.tournament)} · ${escapeHtml(match.round)}</p></div>
        <h1>${escapeHtml(match.team1)}<br>${escapeHtml(match.team2)}</h1>
        <div class="hero-round">${dateLabel(match.date)}</div>
        <div class="scoreboard">
          <div class="score-team"><div class="flag">${flag(match.team1)}</div><span class="team-name">${escapeHtml(match.team1)}</span></div>
          <div class="score">${score}<small>${extras || "&nbsp;"}</small></div>
          <div class="score-team"><div class="flag">${flag(match.team2)}</div><span class="team-name">${escapeHtml(match.team2)}</span></div>
        </div>
      </div>
      <div class="hero-details">
        ${detail("Stadium", match.stadium)}${detail("City", [match.city, match.country].filter(Boolean).join(", "))}${detail("Referee", match.referee)}${detail("Attendance", match.attendance ? attendanceLabel(match.attendance) : "")}
      </div>
    </article>`;
}

function detail(label, value) {
  return value ? `<div class="detail"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>` : "";
}

function renderMatchCard(match) {
  const team1Score = match.score1 === "" || match.score1 == null ? "" : match.score1;
  const team2Score = match.score2 === "" || match.score2 == null ? "" : match.score2;
  const scoreConfirmed = hasConfirmedScore(match);
  const tournament = data.tournaments.find(item => item.name === match.tournament);
  const themeStyle = tournamentThemeStyle(tournament);
  const thumbnailStyle = matchThumbnailStyle(match).replace(/^style="/, "").replace(/"$/, "");
  return `
    <article class="match-card" data-match-id="${match.id}" style="${themeStyle}${thumbnailStyle ? `;${thumbnailStyle}` : ""}">
      <div class="match-meta"><span>${escapeHtml(match.tournament)}</span><span>${dateLabel(match.date)}</span></div>
      <div class="match-card-team"><span class="flag">${flag(match.team1)}</span><strong>${escapeHtml(match.team1)}</strong><span class="card-score">${scoreConfirmed ? team1Score : ""}</span></div>
      <div class="match-card-team"><span class="flag">${flag(match.team2)}</span><strong>${escapeHtml(match.team2)}</strong><span class="card-score">${scoreConfirmed ? team2Score : ""}</span></div>
    </article>`;
}

function renderMatchesPage() {
  const tournaments = ["All", ...new Set(data.matches.map(m => m.tournament))];
  const upcoming = sortedMatches().filter(isMatchUpcoming).sort((a,b) => (a.date || "").localeCompare(b.date || ""));
  const results = sortedMatches().filter(match => !isMatchUpcoming(match));
  return `
    <div class="page">
      <div class="section-heading" style="margin-top:0"><div><p class="eyebrow">Results archive</p><h2>Matches</h2></div></div>
      <div class="filter-bar">${tournaments.map((name,i) => `<button class="filter-chip ${i===0?"active":""}" data-filter="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join("")}</div>
      <div class="section-heading"><h2>Upcoming matches</h2></div>
      <div class="match-section" data-section="upcoming">${upcoming.length ? renderGroupedMatches(upcoming, renderFullMatchRow, "rows") : `<div class="empty-state compact">No upcoming matches scheduled.</div>`}</div>
      <div class="section-heading"><h2>Results</h2></div>
      <div class="match-section" data-section="results">${results.length ? renderGroupedMatches(results, renderFullMatchRow, "rows") : `<div class="empty-state compact">No match results yet.</div>`}</div>
    </div>`;
}

function renderFullMatchRow(match) {
  const tournament = data.tournaments.find(item => item.name === match.tournament);
  return `
    <article class="full-match-row" data-match-id="${match.id}" data-tournament="${escapeHtml(match.tournament)}" style="${tournamentThemeStyle(tournament)}">
      <div class="row-date">${dateLabel(match.date)}</div>
      <div class="row-teams">
        <div class="row-team"><span>${escapeHtml(match.team1)}</span><span class="flag">${flag(match.team1)}</span></div>
        <div class="row-score">${scoreText(match) || "vs."}</div>
        <div class="row-team"><span class="flag">${flag(match.team2)}</span><span>${escapeHtml(match.team2)}</span></div>
      </div>
      <div class="row-round">${escapeHtml(match.round)}</div>
    </article>`;
}

function renderTournamentsPage() {
  return `
    <div class="page">
      <div class="section-heading" style="margin-top:0"><div><p class="eyebrow">Competitions</p><h2>Tournaments</h2></div></div>
      ${data.tournaments.length ? `<div class="tournament-grid">${data.tournaments.map(tournamentCard).join("")}</div>` : `<div class="empty-state">No tournaments added yet.</div>`}
    </div>`;
}

function tournamentCard(t) {
  const podium = [
    ["Champions",t.champion],["Runners-up",t.runnerUp],["Third place",t.third]
  ].filter(([,name]) => name && name !== "TBD").map(([label,name]) => `<div><span class="podium-label">${label}</span><span class="podium-name">${escapeHtml(name)}</span></div>`).join("");
  const logo = tournamentLogoMarkup(t, "tournament-card-logo");
  return `
    <article class="tournament-card" data-tournament-id="${escapeHtml(t.id)}" style="${tournamentThemeStyle(t)}">
      <div class="tournament-banner">${logo}<div><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.hosts || "Host nation TBD")}</p></div></div>
      <div class="tournament-body">
        ${podium || `<div><span class="podium-label">Status</span><span class="podium-name">In progress</span></div>`}
        <div><span class="podium-label">Teams</span><span class="podium-name">${escapeHtml(t.teams || "—")}</span></div>
        <div><span class="podium-label">Dates</span><span class="podium-name">${escapeHtml(t.dates || "—")}</span></div>
      </div>
    </article>`;
}

function renderMatchOverview(id) {
  const match = data.matches.find(item => item.id === id);
  if (!match) return `<div class="page"><div class="empty-state"><h2>Match not found</h2><button class="text-button" data-view="matches">Back to matches</button></div></div>`;
  const score = hasConfirmedScore(match) ? `${match.score1}–${match.score2}` : "";
  const isUpcoming = isMatchUpcoming(match);
  const resultStatus = score ? "Full Time" : (isUpcoming ? "Upcoming" : "Score TBC");
  const penaltyNote = match.penalties
    ? `${match.team1} won ${match.penalties} on penalties`
    : "";
  const matchNumber = match.matchNumber ? `Match ${escapeHtml(match.matchNumber)} · ` : "";
  const matchTime = match.time ? escapeHtml(match.time) : (isUpcoming ? "Time TBC" : "");
  const tournament = data.tournaments.find(item => item.name === match.tournament);
  const themeStyle = tournamentThemeStyle(tournament);
  const matchThumbnail = matchThumbnailStyle(match).replace(/^style="/, "").replace(/"$/, "");
  const tournamentLogo = tournament && tournament.logo
    ? `<img class="match-tournament-logo" src="${escapeHtml(tournament.logo)}" alt="${escapeHtml(tournament.name)} logo">`
    : "";
  const team1Goals = (match.goals1 || []).map(goal => `<li><span>${escapeHtml(goal.minute)}’</span><strong>${escapeHtml(goal.name)}</strong>${goal.own ? " <span>(OG)</span>" : ""}</li>`).join("");
  const team2Goals = (match.goals2 || []).map(goal => `<li><span>${escapeHtml(goal.minute)}’</span><strong>${escapeHtml(goal.name)}</strong>${goal.own ? " <span>(OG)</span>" : ""}</li>`).join("");
  const penaltiesList = (match.penaltyTakers || []).map(taker =>
    `<li><span>${taker.scored ? "✓" : "×"}</span><strong>${escapeHtml(taker.name)}</strong></li>`
  ).join("");
  const goalList = team => (team || []).map(goal =>
    `<li><strong>${escapeHtml(goal.name)}</strong>${goal.minute ? ` ${escapeHtml(goal.minute)}’` : ""}${goal.own ? " · Own goal" : ""}</li>`
  ).join("");
  const penalties = (match.penaltyTakers || []).map(taker =>
    `<li><strong>${escapeHtml(taker.name)}</strong> · ${taker.scored ? "Scored" : "Missed"}</li>`
  ).join("");
  const youtubeId = getYouTubeId(match.highlightUrl);
  const highlightFile = match.highlightFile || (match.highlightMedia ? match.highlight : "");
  const highlightSection = youtubeId || highlightFile ? `
      <section class="overview-card highlights-card">
        <h3>Match highlights</h3>
        <div class="highlights-player">
          ${youtubeId
            ? `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}" title="Match highlights" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
            : `<video controls preload="metadata" src="${escapeHtml(highlightFile)}"></video>`}
        </div>
      </section>` : "";
  return `
    <div class="match-overview-page">
      <button class="back-button" data-view="matches">← Back to matches</button>
      <article class="match-sheet" style="${themeStyle}${matchThumbnail ? `;${matchThumbnail}` : ""}">
        <header class="match-sheet-top">
          <div class="match-sheet-context">${matchNumber}${escapeHtml(match.round)}</div>
          <div class="match-tournament-mark">${tournamentLogo}</div>
          <div class="match-sheet-datetime">${matchTime}${matchTime && match.date ? " · " : ""}${dateLabel(match.date)}</div>
        </header>

        <section class="match-sheet-result">
          <div class="match-side match-side-left">
            <span class="match-team-dot"></span>
            <strong>${escapeHtml(match.team1)}</strong>
            <span class="match-team-flag">${flag(match.team1)}</span>
          </div>

          <div class="match-score-center">
            ${score
              ? `<div class="match-main-score">${escapeHtml(match.team1 === "" ? "" : match.score1)} <span>–</span> ${escapeHtml(match.score2)}</div>`
              : `<div class="match-main-score match-main-score-vs">vs.</div>`}
            ${match.aet ? `<div class="match-extra-status">(a.e.t.)</div>` : ""}
            ${match.penalties ? `<div class="match-extra-status">${escapeHtml(match.penalties)} on penalties</div>` : ""}
            ${penaltyNote ? `<div class="match-result-note">${escapeHtml(penaltyNote)}</div>` : ""}
            <div class="match-status-pill">${escapeHtml(resultStatus)}</div>
          </div>

          <div class="match-side match-side-right">
            <span class="match-team-flag">${flag(match.team2)}</span>
            <strong>${escapeHtml(match.team2)}</strong>
          </div>
        </section>

        ${(team1Goals || team2Goals || penaltiesList) ? `
          <section class="match-goals-sheet">
            <div class="match-goals-side">${team1Goals}</div>
            <div class="match-goals-center">${penaltiesList ? `<div class="penalty-summary"><span>Penalties</span><ul>${penaltiesList}</ul></div>` : ""}</div>
            <div class="match-goals-side match-goals-right">${team2Goals}</div>
          </section>` : ""}

        <footer class="match-sheet-footer">
          <div class="match-tournament-name">${escapeHtml(match.tournament)}</div>
          <div class="match-location"><span>${escapeHtml(match.city || "")}</span>${match.city && match.stadium ? "<span class=\"location-dot\">•</span>" : ""}<span>${escapeHtml(match.stadium || "")}</span></div>
          ${match.referee ? `<div class="match-fact">${escapeHtml(match.referee)}${match.attendance ? ` · ${attendanceLabel(match.attendance)} attendance` : ""}</div>` : ""}
        </footer>
      </article>
      ${highlightSection}
    </div>`;
}

function overviewDetail(label, value) {
  return value ? `<div class="overview-detail"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>` : "";
}

function renderTournamentOverview(id) {
  const tournament = data.tournaments.find(item => item.id === id);
  if (!tournament) return `<div class="page"><div class="empty-state"><h2>Tournament not found</h2><button class="text-button" data-view="tournaments">Back to tournaments</button></div></div>`;
  const matches = data.matches.filter(match => match.tournament === tournament.name);
  const upcoming = matches.filter(isMatchUpcoming).sort((a,b) => (a.date || "").localeCompare(b.date || ""));
  const recent = matches.filter(match => !isMatchUpcoming(match)).sort((a,b) => (b.date || "").localeCompare(a.date || ""));
  const podium = [
    ["Champions",tournament.champion],["Runners-up",tournament.runnerUp],["Third place",tournament.third]
  ].filter(([,name]) => name && name !== "TBD");
  const tournamentLogo = tournamentLogoMarkup(tournament, "tournament-overview-logo");
  return `
    <div class="page overview-page">
      <button class="back-button" data-view="tournaments">← Back to tournaments</button>
      <section class="tournament-overview-header" style="${tournamentThemeStyle(tournament)}">
        ${tournamentLogo}
        <p class="eyebrow">Tournament overview</p>
        <h1>${escapeHtml(tournament.name)}</h1>
        <p>${escapeHtml(tournament.hosts || "Host nation TBD")} · ${escapeHtml(tournament.dates || "")}</p>
      </section>
      ${podium.length ? `<div class="overview-podium">${podium.map(([label,name]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(name)}</strong></div>`).join("")}</div>` : ""}
      <div class="section-heading"><h2>Upcoming matches</h2></div>
      ${upcoming.length ? renderGroupedMatches(upcoming, renderFullMatchRow, "rows") : `<div class="empty-state compact">No upcoming matches.</div>`}
      <div class="section-heading"><h2>Recent matches</h2></div>
      ${recent.length ? renderGroupedMatches(recent, renderFullMatchRow, "rows") : `<div class="empty-state compact">No recent matches.</div>`}
    </div>`;
}

