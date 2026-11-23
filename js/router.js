function readRoute() {
  const hash = location.hash.replace(/^#/, "");
  if (hash.startsWith("match/")) {
    currentView = "match-detail";
    currentDetailId = decodeURIComponent(hash.slice(6));
  } else if (hash.startsWith("tournament/")) {
    currentView = "tournament-detail";
    currentDetailId = decodeURIComponent(hash.slice(11));
  } else if (["matches", "tournaments"].includes(hash)) {
    currentView = hash;
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
