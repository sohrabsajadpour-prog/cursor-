/* Global constants */
const GEOCODING_BASE = "https://geocoding-api.open-meteo.com/v1";
const FORECAST_BASE = "https://api.open-meteo.com/v1/forecast";

const DEFAULT_LOCATION = {
  name: "تهران",
  country: "ایران",
  latitude: 35.6892,
  longitude: 51.3890,
};

/* Elements */
const cityInputElement = document.getElementById("city-input");
const suggestionsElement = document.getElementById("suggestions");
const statusElement = document.getElementById("status");
const placeLabelElement = document.getElementById("place-label");
const forecastGridElement = document.getElementById("forecast-grid");
const locationButtonElement = document.getElementById("loc-btn");

/* Utilities */
function debounce(fn, delayMs) {
  let timerId = null;
  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => fn(...args), delayMs);
  };
}

function setStatus(message, type = "info") {
  statusElement.textContent = message || "";
  statusElement.classList.toggle("error", type === "error");
}

function setLoading(isLoading) {
  if (isLoading) {
    statusElement.innerHTML = `در حال بارگذاری<span class="spinner" aria-hidden="true"></span>`;
  } else if (!statusElement.classList.contains("error")) {
    statusElement.textContent = "";
  }
}

function hideSuggestions() {
  suggestionsElement.innerHTML = "";
  suggestionsElement.classList.remove("visible");
}

function showSuggestions(items) {
  suggestionsElement.innerHTML = "";
  if (!items || items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = "نتیجه‌ای یافت نشد";
    suggestionsElement.appendChild(empty);
    suggestionsElement.classList.add("visible");
    return;
  }
  for (const item of items) {
    const li = document.createElement("li");
    li.role = "option";
    li.textContent = item.displayName;
    li.dataset.lat = String(item.latitude);
    li.dataset.lon = String(item.longitude);
    li.dataset.name = item.displayName;
    li.addEventListener("click", () => {
      cityInputElement.value = item.displayName;
      hideSuggestions();
      loadForecastFor(item.latitude, item.longitude, item.displayName);
    });
    suggestionsElement.appendChild(li);
  }
  suggestionsElement.classList.add("visible");
}

function formatDayLabel(date, index) {
  if (index === 0) return "امروز";
  try {
    return new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(date);
  } catch {
    return date.toLocaleDateString("fa-IR", { weekday: "long" });
  }
}

function formatDateLabel(date) {
  try {
    return new Intl.DateTimeFormat("fa-IR", { month: "long", day: "numeric" }).format(date);
  } catch {
    return date.toLocaleDateString("fa-IR", { month: "long", day: "numeric" });
  }
}

function toFaNumber(value) {
  try {
    return Number(value).toLocaleString("fa-IR");
  } catch {
    return String(value);
  }
}

function iconForWeatherCode(code) {
  // Simplified mapping of WMO codes to emoji icons
  const n = Number(code);
  if (n === 0) return "☀️"; // Clear
  if ([1, 2].includes(n)) return "🌤️"; // Mostly clear/partly cloudy
  if ([3].includes(n)) return "☁️"; // Overcast
  if ([45, 48].includes(n)) return "🌫️"; // Fog
  if ([51, 53, 55, 56, 57].includes(n)) return "🌦️"; // Drizzle
  if ([61, 63, 65, 80, 81, 82].includes(n)) return "🌧️"; // Rain
  if ([66, 67].includes(n)) return "🌧️"; // Freezing rain
  if ([71, 73, 75, 77, 85, 86].includes(n)) return "🌨️"; // Snow
  if ([95, 96, 99].includes(n)) return "⛈️"; // Thunder
  return "🌡️"; // Fallback
}

/* Data fetching */
async function searchCitiesByName(query) {
  const q = (query || "").trim();
  if (q.length < 2) {
    hideSuggestions();
    return;
  }
  try {
    const url = new URL(`${GEOCODING_BASE}/search`);
    url.searchParams.set("name", q);
    url.searchParams.set("count", "8");
    url.searchParams.set("language", "fa");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("geocoding_failed");
    const data = await res.json();
    const items = (data.results || []).map((r) => ({
      displayName: [r.name, r.admin1, r.country].filter(Boolean).join("، "),
      latitude: r.latitude,
      longitude: r.longitude,
    }));
    showSuggestions(items);
  } catch (err) {
    console.error(err);
    suggestionsElement.innerHTML = "";
    const li = document.createElement("li");
    li.className = "muted";
    li.textContent = "خطا در دریافت پیشنهادها";
    suggestionsElement.appendChild(li);
    suggestionsElement.classList.add("visible");
  }
}

async function reverseGeocode(latitude, longitude) {
  try {
    const url = new URL(`${GEOCODING_BASE}/reverse`);
    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("language", "fa");
    url.searchParams.set("format", "json");

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("reverse_failed");
    const data = await res.json();
    const first = (data.results || [])[0];
    if (!first) return null;
    return [first.name, first.admin1, first.country].filter(Boolean).join("، ");
  } catch (err) {
    console.error(err);
    return null;
  }
}

async function fetchFiveDayForecast(latitude, longitude) {
  const url = new URL(FORECAST_BASE);
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "daily",
    [
      "weathercode",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_mean",
      "wind_speed_10m_max",
    ].join(",")
  );
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("forecast_failed");
  const data = await res.json();
  return data;
}

/* Rendering */
function renderForecast(data, placeDisplayName) {
  const daily = data?.daily;
  if (!daily || !daily.time) {
    setStatus("داده‌ای برای نمایش موجود نیست", "error");
    forecastGridElement.innerHTML = "";
    return;
  }

  placeLabelElement.textContent = placeDisplayName || "—";

  forecastGridElement.innerHTML = "";
  const daysCount = Math.min(5, daily.time.length);
  for (let i = 0; i < daysCount; i += 1) {
    const date = new Date(daily.time[i]);
    const card = document.createElement("article");
    card.className = "card";

    const dayEl = document.createElement("div");
    dayEl.className = "day";
    dayEl.textContent = formatDayLabel(date, i);

    const dateEl = document.createElement("div");
    dateEl.className = "date";
    dateEl.textContent = formatDateLabel(date);

    const iconEl = document.createElement("div");
    iconEl.className = "icon";
    iconEl.textContent = iconForWeatherCode(daily.weathercode[i]);

    const tempsEl = document.createElement("div");
    tempsEl.className = "temps";
    const minT = Math.round(daily.temperature_2m_min[i]);
    const maxT = Math.round(daily.temperature_2m_max[i]);
    tempsEl.innerHTML = `کمینه ${toFaNumber(minT)}° | بیشینه ${toFaNumber(maxT)}°`;

    const metaEl = document.createElement("div");
    metaEl.className = "meta";
    const prec = daily.precipitation_probability_mean?.[i] ?? 0;
    const wind = daily.wind_speed_10m_max?.[i] ?? 0;
    const precEl = document.createElement("span");
    precEl.textContent = `احتمال بارش ${toFaNumber(prec)}٪`;
    const windEl = document.createElement("span");
    windEl.textContent = `باد ${toFaNumber(wind)} km/h`;
    metaEl.appendChild(precEl);
    metaEl.appendChild(windEl);

    card.appendChild(dayEl);
    card.appendChild(dateEl);
    card.appendChild(iconEl);
    card.appendChild(tempsEl);
    card.appendChild(metaEl);

    forecastGridElement.appendChild(card);
  }
}

/* High-level flows */
async function loadForecastFor(latitude, longitude, displayName) {
  setStatus("");
  setLoading(true);
  try {
    const data = await fetchFiveDayForecast(latitude, longitude);
    renderForecast(data, displayName);
  } catch (err) {
    console.error(err);
    setStatus("خطا در دریافت پیش‌بینی. لطفا دوباره تلاش کنید.", "error");
  } finally {
    setLoading(false);
  }
}

async function useCurrentLocation() {
  if (!("geolocation" in navigator)) {
    setStatus("مرورگر شما از موقعیت مکانی پشتیبانی نمی‌کند.", "error");
    return;
  }
  setStatus("");
  setLoading(true);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const { latitude, longitude } = pos.coords;
        const name = (await reverseGeocode(latitude, longitude)) || "موقعیت فعلی";
        await loadForecastFor(latitude, longitude, name);
        cityInputElement.value = name;
      } finally {
        setLoading(false);
      }
    },
    (err) => {
      console.error(err);
      setLoading(false);
      setStatus("عدم دسترسی به موقعیت مکانی.", "error");
    },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
  );
}

/* Events */
cityInputElement.addEventListener(
  "input",
  debounce(() => searchCitiesByName(cityInputElement.value), 350)
);

cityInputElement.addEventListener("focus", () => {
  if (cityInputElement.value.trim().length >= 2 && suggestionsElement.children.length) {
    suggestionsElement.classList.add("visible");
  }
});

cityInputElement.addEventListener("keydown", (e) => {
  if (e.key === "Escape") hideSuggestions();
  if (e.key === "Enter") {
    // Pick first suggestion if exists
    const first = suggestionsElement.querySelector("li:not(.muted)");
    if (first) {
      e.preventDefault();
      const lat = Number(first.dataset.lat);
      const lon = Number(first.dataset.lon);
      const name = first.dataset.name || cityInputElement.value.trim();
      cityInputElement.value = name;
      hideSuggestions();
      loadForecastFor(lat, lon, name);
    }
  }
});

document.addEventListener("click", (e) => {
  if (!suggestionsElement.contains(e.target) && e.target !== cityInputElement) {
    hideSuggestions();
  }
});

locationButtonElement.addEventListener("click", useCurrentLocation);

/* Init */
(function init() {
  const defaultName = [DEFAULT_LOCATION.name, DEFAULT_LOCATION.country].filter(Boolean).join("، ");
  loadForecastFor(DEFAULT_LOCATION.latitude, DEFAULT_LOCATION.longitude, defaultName);
})();
