function readRoute() {
  const hash = location.hash.replace(/^#/, "");
  if (hash.startsWith("match/")) {
    currentView = "match-detail";
    currentDetailId = decodeURIComponent(hash.slice(6));
  } else if (hash.startsWith("event/") || hash.startsWith("tournament/")) {
    currentView = "event-detail";
    currentDetailId = decodeURIComponent(hash.slice(hash.indexOf("/") + 1));
  } else if (["matches", "events", "tournaments"].includes(hash)) {
    currentView = hash === "tournaments" ? "events" : hash;
  } else {
    currentView = "home";
  }
  document.querySelectorAll(".nav-link").forEach(button =>
    button.classList.toggle("active", button.dataset.view === currentView)
  );
  render();
}

window.addEventListener("hashchange", readRoute);

loadJsonData();
