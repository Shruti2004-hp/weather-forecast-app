/* =========================================
   CONFIG — paste your free OpenWeather API key below
   Get one at: https://home.openweathermap.org/api_keys
========================================= */
const API_KEY = "78e5fe1fececce4d55654b54a26f3bde";

/* =========================================
   ELEMENTS
========================================= */
const searchForm   = document.getElementById('searchForm');
const cityInput    = document.getElementById('cityInput');
const locateBtn    = document.getElementById('locateBtn');

const loadingState = document.getElementById('loadingState');
const errorState   = document.getElementById('errorState');
const errorMsg     = document.getElementById('errorMsg');
const initState    = document.getElementById('initState');
const dashboard     = document.getElementById('dashboard');

const els = {
  place: document.getElementById('place'),
  date: document.getElementById('date'),
  temp: document.getElementById('temp'),
  desc: document.getElementById('desc'),
  feels: document.getElementById('feels'),
  humidity: document.getElementById('humidity'),
  wind: document.getElementById('wind'),
  pressure: document.getElementById('pressure'),
  visibility: document.getElementById('visibility'),
  sunrise: document.getElementById('sunrise'),
  sunset: document.getElementById('sunset'),
  iconWrap: document.getElementById('iconWrap'),
};

/* =========================================
   VIEW STATE HELPERS
========================================= */
function showState(state){
  loadingState.hidden = state !== 'loading';
  errorState.hidden   = state !== 'error';
  initState.hidden    = state !== 'init';
  dashboard.hidden    = state !== 'data';
}
showState('init');

/* =========================================
   ICONS — simple inline SVGs per condition
========================================= */
const ICONS = {
  sun: `<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="22" fill="#FFD98A"/><g stroke="#FFD98A" stroke-width="5" stroke-linecap="round"><line x1="50" y1="8" x2="50" y2="18"/><line x1="50" y1="82" x2="50" y2="92"/><line x1="8" y1="50" x2="18" y2="50"/><line x1="82" y1="50" x2="92" y2="50"/><line x1="19" y1="19" x2="26" y2="26"/><line x1="74" y1="74" x2="81" y2="81"/><line x1="81" y1="19" x2="74" y2="26"/><line x1="26" y1="74" x2="19" y2="81"/></g></svg>`,
  moon: `<svg viewBox="0 0 100 100" fill="none"><path d="M62 20a32 32 0 1 0 18 58A38 38 0 0 1 62 20Z" fill="#EAEFFB"/></svg>`,
  cloud: `<svg viewBox="0 0 100 100" fill="none"><path d="M28 68a17 17 0 0 1-2-33.8A22 22 0 0 1 68 30a15 15 0 0 1-3 30H28Z" fill="#EAEFFB"/></svg>`,
  cloudSun: `<svg viewBox="0 0 100 100" fill="none"><circle cx="36" cy="34" r="15" fill="#FFD98A"/><path d="M32 74a17 17 0 0 1-2-33.8A22 22 0 0 1 72 36a15 15 0 0 1-3 30H32Z" fill="#EAEFFB"/></svg>`,
  rain: `<svg viewBox="0 0 100 100" fill="none"><path d="M28 56a17 17 0 0 1-2-33.8A22 22 0 0 1 68 18a15 15 0 0 1-3 30H28Z" fill="#D7E2F2"/><g stroke="#8FB3E8" stroke-width="5" stroke-linecap="round"><line x1="32" y1="66" x2="27" y2="82"/><line x1="50" y1="66" x2="45" y2="82"/><line x1="68" y1="66" x2="63" y2="82"/></g></svg>`,
  storm: `<svg viewBox="0 0 100 100" fill="none"><path d="M28 52a17 17 0 0 1-2-33.8A22 22 0 0 1 68 14a15 15 0 0 1-3 30H28Z" fill="#B9C4DA"/><path d="M52 58 40 78h12l-8 18 24-26H56l8-12z" fill="#FFD98A"/></svg>`,
  snow: `<svg viewBox="0 0 100 100" fill="none"><path d="M28 54a17 17 0 0 1-2-33.8A22 22 0 0 1 68 16a15 15 0 0 1-3 30H28Z" fill="#EAEFFB"/><g stroke="#D7E2F2" stroke-width="5" stroke-linecap="round"><line x1="34" y1="68" x2="34" y2="84"/><line x1="50" y1="68" x2="50" y2="84"/><line x1="66" y1="68" x2="66" y2="84"/></g></svg>`,
  mist: `<svg viewBox="0 0 100 100" fill="none"><g stroke="#DCE4F0" stroke-width="6" stroke-linecap="round"><line x1="14" y1="38" x2="86" y2="38"/><line x1="14" y1="54" x2="86" y2="54"/><line x1="14" y1="70" x2="86" y2="70"/></g></svg>`,
};

/* Map OpenWeather condition codes + day/night to our icon set & body gradient key */
function resolveVisual(weatherId, isDay){
  if (weatherId >= 200 && weatherId < 300) return { icon: ICONS.storm, cond: 'storm' };
  if (weatherId >= 300 && weatherId < 600) return { icon: ICONS.rain, cond: 'rain' };
  if (weatherId >= 600 && weatherId < 700) return { icon: ICONS.snow, cond: 'snow' };
  if (weatherId >= 700 && weatherId < 800) return { icon: ICONS.mist, cond: 'mist' };
  if (weatherId === 800) return isDay ? { icon: ICONS.sun, cond: 'clear-day' } : { icon: ICONS.moon, cond: 'clear-night' };
  if (weatherId > 800) return { icon: isDay ? ICONS.cloudSun : ICONS.cloud, cond: 'clouds' };
  return { icon: ICONS.cloud, cond: 'clouds' };
}

/* =========================================
   FETCH + RENDER
========================================= */
async function fetchByCity(city){
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  await fetchAndRender(url);
}

async function fetchByCoords(lat, lon){
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
  await fetchAndRender(url);
}

async function fetchAndRender(url){
  if (!API_KEY || API_KEY.startsWith('PASTE_')){
    showState('error');
    errorMsg.textContent = 'Add your OpenWeather API key in script.js first (see README.md).';
    return;
  }

  showState('loading');
  try{
    const res = await fetch(url);
    if (!res.ok){
      throw new Error(res.status === 404 ? 'City not found. Try another search.' : 'Something went wrong. Please try again.');
    }
    const data = await res.json();
    render(data);
    showState('data');
  }catch(err){
    errorMsg.textContent = err.message || 'Something went wrong. Please try again.';
    showState('error');
  }
}

function render(data){
  const nowUnix = data.dt;
  const isDay = nowUnix > data.sys.sunrise && nowUnix < data.sys.sunset;
  const { icon, cond } = resolveVisual(data.weather[0].id, isDay);

  document.body.setAttribute('data-condition', cond);
  els.iconWrap.innerHTML = icon;

  els.place.textContent = `${data.name}, ${data.sys.country}`;
  els.date.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  els.temp.textContent = Math.round(data.main.temp);
  els.desc.textContent = data.weather[0].description;
  els.feels.innerHTML = `Feels like <span>${Math.round(data.main.feels_like)}</span>`;

  els.humidity.innerHTML = `${data.main.humidity}<small>%</small>`;
  els.wind.innerHTML = `${Math.round(data.wind.speed * 3.6)}<small>km/h</small>`;
  els.pressure.innerHTML = `${data.main.pressure}<small>hPa</small>`;
  els.visibility.innerHTML = `${(data.visibility / 1000).toFixed(1)}<small>km</small>`;

  els.sunrise.textContent = formatTime(data.sys.sunrise, data.timezone);
  els.sunset.textContent = formatTime(data.sys.sunset, data.timezone);
}

function formatTime(unix, tzOffsetSeconds){
  const d = new Date((unix + tzOffsetSeconds) * 1000);
  let h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/* =========================================
   EVENTS
========================================= */
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (city) fetchByCity(city);
});

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation){
    errorMsg.textContent = 'Geolocation is not supported by your browser.';
    showState('error');
    return;
  }
  showState('loading');
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    () => {
      errorMsg.textContent = 'Location access denied. Try searching a city instead.';
      showState('error');
    }
  );
});

/* Load a default city on first visit so the dashboard isn't empty */
fetchByCity('Delhi');
