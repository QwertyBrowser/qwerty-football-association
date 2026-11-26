const FifaToIso = {
  ALG:"DZ", ARG:"AR", AUS:"AU", AUT:"AT", BHR:"BH", BEL:"BE", BRA:"BR", CAN:"CA", CPV:"CV",
  CHI:"CL", CHN:"CN", COL:"CO", CRC:"CR", CRO:"HR", CUW:"CW", CZE:"CZ", COD:"CD", DEN:"DK",
  ECU:"EC", EGY:"EG", FRA:"FR", GER:"DE", GHA:"GH", GRE:"GR", HAI:"HT", IRN:"IR",
  IRQ:"IQ", ITA:"IT", CIV:"CI", JPN:"JP", JOR:"JO", MEX:"MX", MAR:"MA", NED:"NL",
  NZL:"NZ", NGA:"NG", NOR:"NO", OMA:"OM", PAN:"PA", PNG:"PG", PAR:"PY", POL:"PL", POR:"PT",
  QAT:"QA", IRL:"IE", KSA:"SA", SEN:"SN", SRB:"RS", SIN:"SG", RSA:"ZA", KOR:"KR", ESP:"ES",
  SWE:"SE", SUI:"CH", THA:"TH", TUR:"TR", UAE:"AE", UKR:"UA", USA:"US", URU:"UY", UZB:"UZ", VEN:"VE", VIE:"VN"
};

let data = { customCountries: [], events: [], matches: [], countries: [], settings: { spotlightTitle:"Featured matches" } };
let currentView = "home";
let currentDetailId = null;
let countryMap = {};
let countryCodes = {};

async function loadJsonData() {
  try {
    const timestamp = Date.now();
    const [countryResponse, eventResponse, matchResponse, settingsResponse] = await Promise.all([
      fetch(`data/countries.json?v=${timestamp}`),
      fetch(`data/events.json?v=${timestamp}`),
      fetch(`data/matches.json?v=${timestamp}`),
      fetch(`data/settings.json?v=${timestamp}`)
    ]);
    if (![countryResponse, eventResponse, matchResponse, settingsResponse].every(response => response.ok)) {
      throw new Error("One or more JSON data files could not be loaded.");
    }
    data.countries = await countryResponse.json();
    data.events = await eventResponse.json();
    data.matches = await matchResponse.json();
    data.settings = await settingsResponse.json();
  } catch (error) {
    console.error("Content JSON load failed:", error);
  }
  refreshCountryLists();
  if (typeof readRoute === "function") readRoute();
}

function getAllCountries() {
  return (data.countries || []).map(country => [country.name, country.code || ""]);
}

function refreshCountryLists() {
  const allCountries = getAllCountries();
  countryMap = Object.fromEntries(allCountries);
  countryCodes = Object.fromEntries(allCountries);
  const countryList = document.getElementById("countryList");
  if (countryList) {
    countryList.innerHTML = allCountries
      .map(([name]) => `<option value="${escapeHtml(name)}"></option>`).join("");
  }
}

function flag(country) {
  const code = countryCodes[country];
  if (!code) return "🏳️";
  if (code === "ENG") return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
  if (code === "SCO") return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
  if (code === "WAL") return "🏴󠁧󠁢󠁷󠁬󠁳󠁿";
  const isoCode = FifaToIso[code];
  if (!isoCode) return "🏳️";
  return String.fromCodePoint(...isoCode.split("").map(char => 127397 + char.charCodeAt()));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char =>
    ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[char])
  );
}

function dateLabel(date) {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day:"2-digit", month:"short", year:"numeric", timeZone:"UTC"
  }).format(new Date(date + "T12:00:00Z"));
}

function attendanceLabel(value) {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "");
  return digits ? new Intl.NumberFormat("en-US").format(Number(digits)) : "";
}

function sortedMatches() {
  return [...data.matches].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function isMatchUpcoming(match) {
  if (!match.date) return !hasConfirmedScore(match);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (match.date > today) return true;
  if (match.date === today) return !hasConfirmedScore(match);
  return false;
}

function hasConfirmedScore(match) {
  return match.score1 !== "" && match.score1 != null &&
    match.score2 !== "" && match.score2 != null;
}

function scoreText(match) {
  if (!hasConfirmedScore(match)) return "";
  let text = `${match.score1}–${match.score2}`;
  if (match.aet) text += " (a.e.t.)";
  if (match.penalties) text += ` · ${match.penalties} pens`;
  return text;
}

function getYouTubeId(value) {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1).split("/")[0] || null;
    if (url.hostname.includes("youtube.com")) {
      if (url.searchParams.get("v")) return url.searchParams.get("v");
      const parts = url.pathname.split("/");
      const index = parts.findIndex(part => ["embed", "shorts", "live"].includes(part));
      if (index >= 0) return parts[index + 1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

function matchThumbnailStyle(match) {
  if (!match.thumbnail) return "";
  const thumbnail = encodeURI(match.thumbnail).replace(/'/g, "%27").replace(/"/g, "%22");
  return `style="--match-thumbnail: url('${thumbnail}'); background-image: linear-gradient(120deg, rgba(23,79,64,.78), rgba(9,36,30,.92)), var(--match-thumbnail);"`;
}

function validThemeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : fallback;
}

function eventTheme(event) {
  return {
    primary: validThemeColor(event && event.primaryColor, "#147d64"),
    secondary: validThemeColor(event && event.secondaryColor, "#b9ff66")
  };
}

function eventThemeStyle(event) {
  const theme = eventTheme(event);
  return `--tournament-primary:${theme.primary};--tournament-secondary:${theme.secondary};`;
}

function eventLogoMarkup(event, className = "event-logo") {
  if (!event || !event.logo) return "";
  return `<img class="${className}" src="${escapeHtml(event.logo)}" alt="${escapeHtml(event.name)} logo">`;
}
