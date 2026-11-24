document.addEventListener("click", e => {
  const nav = e.target.closest("[data-view]");
  if (nav) {
    currentView = nav.dataset.view;
    currentDetailId = null;
    location.hash = nav.dataset.view === "home" ? "" : nav.dataset.view;
    document.querySelectorAll(".nav-link").forEach(b => b.classList.toggle("active", b.dataset.view === currentView));
    readRoute();
    window.scrollTo({top:0, behavior:"smooth"});
  }
  const matchCard = e.target.closest("[data-match-id]");
  if (matchCard) {
    currentView = "match-detail";
    currentDetailId = matchCard.dataset.matchId;
    location.hash = `match/${encodeURIComponent(currentDetailId)}`;
    render();
    window.scrollTo({top:0, behavior:"smooth"});
  }
  const eventCard = e.target.closest("[data-event-id]");
  if (eventCard) {
    currentView = "event-detail";
    currentDetailId = eventCard.dataset.eventId;
    location.hash = `event/${encodeURIComponent(currentDetailId)}`;
    render();
    window.scrollTo({top:0, behavior:"smooth"});
  }
  if (e.target.matches(".filter-chip")) {
    document.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("active"));
    e.target.classList.add("active");
    const filter = e.target.dataset.filter;
    document.querySelectorAll(".full-match-row").forEach(row => row.hidden = filter !== "All" && row.dataset.event !== filter);
    document.querySelectorAll(".match-day-group").forEach(group => {
      const rows = group.querySelectorAll(".full-match-row");
      group.hidden = rows.length > 0 && [...rows].every(row => row.hidden);
    });
  }
});

