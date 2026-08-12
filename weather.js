/* ===================================
   FOREVER WEATHER
=================================== */

const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

// WMO weather codes -> { text, icon, day/night variants }
const WEATHER_CODES = {

    0: { text: "Clear sky", icon: "fa-sun", night: "fa-moon" },
    1: { text: "Mainly clear", icon: "fa-sun", night: "fa-moon" },
    2: { text: "Partly cloudy", icon: "fa-cloud-sun", night: "fa-cloud-moon" },
    3: { text: "Overcast", icon: "fa-cloud", night: "fa-cloud" },

    45: { text: "Fog", icon: "fa-smog", night: "fa-smog" },
    48: { text: "Depositing rime fog", icon: "fa-smog", night: "fa-smog" },

    51: { text: "Light drizzle", icon: "fa-cloud-rain", night: "fa-cloud-rain" },
    53: { text: "Moderate drizzle", icon: "fa-cloud-rain", night: "fa-cloud-rain" },
    55: { text: "Dense drizzle", icon: "fa-cloud-rain", night: "fa-cloud-rain" },

    56: { text: "Light freezing drizzle", icon: "fa-cloud-rain", night: "fa-cloud-rain" },
    57: { text: "Dense freezing drizzle", icon: "fa-cloud-rain", night: "fa-cloud-rain" },

    61: { text: "Slight rain", icon: "fa-cloud-rain", night: "fa-cloud-rain" },
    63: { text: "Moderate rain", icon: "fa-cloud-showers-heavy", night: "fa-cloud-showers-heavy" },
    65: { text: "Heavy rain", icon: "fa-cloud-showers-heavy", night: "fa-cloud-showers-heavy" },

    66: { text: "Light freezing rain", icon: "fa-cloud-rain", night: "fa-cloud-rain" },
    67: { text: "Heavy freezing rain", icon: "fa-cloud-showers-heavy", night: "fa-cloud-showers-heavy" },

    71: { text: "Slight snow fall", icon: "fa-snowflake", night: "fa-snowflake" },
    73: { text: "Moderate snow fall", icon: "fa-snowflake", night: "fa-snowflake" },
    75: { text: "Heavy snow fall", icon: "fa-snowflake", night: "fa-snowflake" },
    77: { text: "Snow grains", icon: "fa-snowflake", night: "fa-snowflake" },

    80: { text: "Slight rain showers", icon: "fa-cloud-showers-heavy", night: "fa-cloud-showers-heavy" },
    81: { text: "Moderate rain showers", icon: "fa-cloud-showers-heavy", night: "fa-cloud-showers-heavy" },
    82: { text: "Violent rain showers", icon: "fa-cloud-showers-heavy", night: "fa-cloud-showers-heavy" },

    85: { text: "Slight snow showers", icon: "fa-snowflake", night: "fa-snowflake" },
    86: { text: "Heavy snow showers", icon: "fa-snowflake", night: "fa-snowflake" },

    95: { text: "Thunderstorm", icon: "fa-cloud-bolt", night: "fa-cloud-bolt" },
    96: { text: "Thunderstorm with hail", icon: "fa-cloud-bolt", night: "fa-cloud-bolt" },
    99: { text: "Severe thunderstorm with hail", icon: "fa-cloud-bolt", night: "fa-cloud-bolt" }

};


let clockInterval = null;


document.addEventListener('DOMContentLoaded', function () {

    const citySearch = document.getElementById('citySearch');
    const searchResults = document.getElementById('searchResults');
    const quickCities = document.getElementById('quickCities');
    const locateBtn = document.getElementById('locateBtn');

    let debounceTimer = null;


    // -------------------------------------------------
    // SEARCH INPUT (debounced geocoding lookup)
    // -------------------------------------------------

    citySearch.addEventListener('input', function () {

        const query = citySearch.value.trim();

        clearTimeout(debounceTimer);

        if (query.length < 2) {
            searchResults.classList.remove('open');
            searchResults.innerHTML = '';
            return;
        }

        debounceTimer = setTimeout(() => {
            runGeocodeSearch(query);
        }, 400);

    });

    document.addEventListener('click', function (e) {

        if (!e.target.closest('.search-box')) {
            searchResults.classList.remove('open');
        }

    });


    // -------------------------------------------------
    // QUICK CITY CHIPS
    // -------------------------------------------------

    quickCities.addEventListener('click', function (e) {

        const btn = e.target.closest('button[data-city]');

        if (!btn) return;

        quickCities.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        citySearch.value = btn.dataset.city;

        runGeocodeSearch(btn.dataset.city, true);

    });


    // -------------------------------------------------
    // USE MY LOCATION
    // -------------------------------------------------

    locateBtn.addEventListener('click', function () {

        if (!navigator.geolocation) {
            showError("Location access isn't supported on this device.");
            return;
        }

        locateBtn.classList.add('loading');

        navigator.geolocation.getCurrentPosition(

            function (position) {

                locateBtn.classList.remove('loading');

                loadWeather(
                    position.coords.latitude,
                    position.coords.longitude,
                    "Your location",
                    ""
                );

            },

            function () {

                locateBtn.classList.remove('loading');

                showError("Couldn't access your location. Please search a city instead.");

            }

        );

    });


    // Load a default city on first visit.
    runGeocodeSearch("Lagos", true);

});


// =====================================================
// GEOCODING
// =====================================================

async function runGeocodeSearch(query, autoSelectFirst) {

    const searchResults = document.getElementById('searchResults');

    try {

        const url = `${GEOCODE_URL}?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;

        const response = await fetch(url);

        const data = await response.json();

        const results = data.results || [];

        if (results.length === 0) {

            if (autoSelectFirst) {
                showError(`Couldn't find "${query}". Try a different search.`);
            } else {
                searchResults.innerHTML = `
                    <div class="search-result-item">
                        <span class="search-result-meta">No matches found</span>
                    </div>
                `;
                searchResults.classList.add('open');
            }

            return;

        }

        if (autoSelectFirst) {

            selectLocation(results[0]);
            return;

        }

        renderSearchResults(results);

    } catch (error) {

        console.error("Geocoding error:", error);

        showError("Couldn't search right now. Check your connection and try again.");

    }

}


function renderSearchResults(results) {

    const searchResults = document.getElementById('searchResults');

    searchResults.innerHTML = results.map((result, index) => {

        const meta = [result.admin1, result.country]
            .filter(Boolean)
            .join(", ");

        return `
            <div class="search-result-item" data-index="${index}">
                <i class="fa-solid fa-location-dot"></i>
                <div>
                    <div class="search-result-name">${escapeHTML(result.name)}</div>
                    <div class="search-result-meta">${escapeHTML(meta)}</div>
                </div>
            </div>
        `;

    }).join('');

    searchResults.classList.add('open');

    searchResults.querySelectorAll('.search-result-item[data-index]').forEach(item => {

        item.addEventListener('click', function () {

            const index = parseInt(item.dataset.index, 10);

            selectLocation(results[index]);

            searchResults.classList.remove('open');

        });

    });

}


function selectLocation(result) {

    const citySearch = document.getElementById('citySearch');
    const quickCities = document.getElementById('quickCities');

    citySearch.value = result.name;

    quickCities.querySelectorAll('button').forEach(b => b.classList.remove('active'));

    loadWeather(
        result.latitude,
        result.longitude,
        result.name,
        [result.admin1, result.country].filter(Boolean).join(", ")
    );

}


// =====================================================
// WEATHER FETCH
// =====================================================

async function loadWeather(lat, lon, cityName, countryLabel) {

    showLoading();

    try {

        const params = new URLSearchParams({

            latitude: lat,
            longitude: lon,

            current: [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "weather_code",
                "wind_speed_10m",
                "is_day"
            ].join(","),

            timezone: "auto"

        });

        const response = await fetch(`${FORECAST_URL}?${params.toString()}`);

        if (!response.ok) {
            throw new Error("Weather service error");
        }

        const data = await response.json();

        renderWeather(data, cityName, countryLabel);

    } catch (error) {

        console.error("Weather fetch error:", error);

        showError("Couldn't load weather for that location. Please try again.");

    }

}


function renderWeather(data, cityName, countryLabel) {

    const current = data.current;

    const weatherInfo = WEATHER_CODES[current.weather_code] || {
        text: "Unknown",
        icon: "fa-cloud",
        night: "fa-cloud"
    };

    const isDay = current.is_day === 1;

    document.getElementById('cityName').textContent = cityName;
    document.getElementById('countryName').textContent = countryLabel || data.timezone;

    document.getElementById('tempValue').textContent =
        Math.round(current.temperature_2m);

    document.getElementById('conditionText').textContent = weatherInfo.text;

    document.getElementById('feelsLikeValue').textContent =
        `${Math.round(current.apparent_temperature)}°`;

    document.getElementById('humidityValue').textContent =
        `${current.relative_humidity_2m}%`;

    document.getElementById('windValue').textContent =
        `${Math.round(current.wind_speed_10m)} km/h`;

    document.getElementById('dayNightValue').textContent =
        isDay ? "Daytime" : "Night";

    document.getElementById('elevationValue').textContent =
        `${Math.round(data.elevation)} m`;

    const iconClass = isDay ? weatherInfo.icon : weatherInfo.night;
    const dayNightIconClass = isDay ? "fa-sun" : "fa-moon";

    document.getElementById('weatherIcon').innerHTML =
        `<i class="fa-solid ${iconClass}"></i>`;

    document.getElementById('dayNightIcon').className =
        `fa-solid ${dayNightIconClass}`;

    startClock(data.utc_offset_seconds);

    showCard();

}


// =====================================================
// LIVE LOCAL CLOCK
// =====================================================

function startClock(utcOffsetSeconds) {

    if (clockInterval) {
        clearInterval(clockInterval);
    }

    function tick() {

        const localMs = Date.now() + (utcOffsetSeconds * 1000);

        const local = new Date(localMs);

        const hours = local.getUTCHours();
        const minutes = local.getUTCMinutes();

        const displayHour = hours % 12 === 0 ? 12 : hours % 12;
        const ampm = hours < 12 ? "AM" : "PM";

        const timeStr =
            `${displayHour}:${String(minutes).padStart(2, "0")} ${ampm}`;

        const dateStr = local.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC"
        });

        document.getElementById('localTime').textContent = timeStr;
        document.getElementById('localDate').textContent = dateStr;

    }

    tick();

    clockInterval = setInterval(tick, 1000 * 30);

}


// =====================================================
// UI STATE HELPERS
// =====================================================

function showLoading() {

    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('weatherCard').style.display = 'none';

}


function showError(message) {

    document.getElementById('errorText').textContent = message;

    document.getElementById('errorState').style.display = 'flex';
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('weatherCard').style.display = 'none';

}


function showCard() {

    document.getElementById('weatherCard').style.display = 'block';
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('errorState').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';

}


function escapeHTML(str) {

    const div = document.createElement('div');

    div.textContent = str;

    return div.innerHTML;

}
