let fetchFn = globalThis.fetch;
if (typeof fetchFn !== 'function') {
  fetchFn = require('node-fetch');
}

const ipv4Regex = /^(25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3}$/;
const ipv6Regex = /^(([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:)|(([0-9A-Fa-f]{1,4}:){1,7}:)|(([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,5}(:[0-9A-Fa-f]{1,4}){1,2})|(([0-9A-Fa-f]{1,4}:){1,4}(:[0-9A-Fa-f]{1,4}){1,3})|(([0-9A-Fa-f]{1,4}:){1,3}(:[0-9A-Fa-f]{1,4}){1,4})|(([0-9A-Fa-f]{1,4}:){1,2}(:[0-9A-Fa-f]{1,4}){1,5})|([0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|::([0-9A-Fa-f]{1,4}:){1,5}[0-9A-Fa-f]{1,4}|([0-9A-Fa-f]{1,4}:){1,7}:|:)((25[0-5]|2[0-4]\d|[01]?\d?\d)(\.(25[0-5]|2[0-4]\d|[01]?\d?\d)){3})?$/i;

const citySynonyms = {
  athens: 'athens',
  marousi: 'athens',
  amarousion: 'athens',
  piraeus: 'athens',
  patra: 'patra',
  patras: 'patra',
  'patra city': 'patra',
  thessaloniki: 'thessaloniki',
  thessalonica: 'thessaloniki',
  salonika: 'thessaloniki',
  salonica: 'thessaloniki'
};

const cityCoords = {
  athens: { lat: 37.9838, lon: 23.7275 },
  patra: { lat: 38.2466, lon: 21.7346 },
  thessaloniki: { lat: 40.6401, lon: 22.9444 }
};

const DEFAULT_DISTANCE_KM = 20;
const DEFAULT_TIMEOUT_MS = 7000;

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function timeoutFetch(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return fetchFn(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
}

const apiEndpoints = [
  ip =>
    timeoutFetch(
      `https://ip-api.com/json/${ip}?fields=status,message,city,lat,lon`,
      DEFAULT_TIMEOUT_MS
    )
      .then(r => r.json())
      .then(d =>
        d.status === 'success'
          ? { city: d.city ?? '', lat: d.lat, lon: d.lon }
          : null
      ),
  ip =>
    timeoutFetch(`https://ipapi.co/${ip}/json/`, DEFAULT_TIMEOUT_MS)
      .then(r => r.json())
      .then(d =>
        d.error ? null : { city: d.city ?? '', lat: d.latitude, lon: d.longitude }
      ),
  ip =>
    timeoutFetch(`https://ipwho.is/${ip}`, DEFAULT_TIMEOUT_MS)
      .then(r => r.json())
      .then(d =>
        d.success ? { city: d.city ?? '', lat: d.latitude, lon: d.longitude } : null
      ),
  ip =>
    timeoutFetch(`https://freeipapi.com/api/json/${ip}`, DEFAULT_TIMEOUT_MS)
      .then(r => r.json())
      .then(d =>
        d.cityName
          ? { city: d.cityName, lat: d.latitude, lon: d.longitude }
          : null
      ),
  ip =>
    timeoutFetch(`https://www.geoplugin.net/json.gp?ip=${ip}`, DEFAULT_TIMEOUT_MS)
      .then(r => r.json())
      .then(d =>
        d.geoplugin_city
          ? {
              city: d.geoplugin_city,
              lat: parseFloat(d.geoplugin_latitude),
              lon: parseFloat(d.geoplugin_longitude)
            }
          : null
      )
];

async function checkIpCity(ip, expectedCity, opts = {}) {
  const {
    distanceKm = DEFAULT_DISTANCE_KM,
    timeoutMsPerFetch = DEFAULT_TIMEOUT_MS,
    debug = false
  } = opts;

  if (typeof ip !== 'string' || typeof expectedCity !== 'string') {
    throw new TypeError('ip and expectedCity must be strings');
  }
  if (!ipv4Regex.test(ip.trim()) && !ipv6Regex.test(ip.trim())) {
    throw new Error('Invalid IP format');
  }

  let canonicalExpected = expectedCity.trim().toLowerCase();
  canonicalExpected = citySynonyms[canonicalExpected] || canonicalExpected;

  if (!cityCoords[canonicalExpected]) {
    throw new Error(`Unknown expected city "${expectedCity}".`);
  }

  const results = await Promise.allSettled(apiEndpoints.map(api => api(ip)));

  let successfulLookups = 0;
  let matchingCount = 0;
  const detailLines = [];

  results.forEach((res, idx) => {
    if (res.status !== 'fulfilled' || !res.value) {
      detailLines.push(`API #${idx + 1}: failed or empty`);
      return;
    }

    successfulLookups++;
    const { city, lat, lon } = res.value;

    let cityCanon = (city ?? '').trim().toLowerCase();
    cityCanon = citySynonyms[cityCanon] || cityCanon;

    if (cityCanon === canonicalExpected) {
      matchingCount++;
      detailLines.push(`API #${idx + 1}: "${city}" (name match)`);
      return;
    }

    if (Number.isFinite(lat) && Number.isFinite(lon)) {
      const { lat: eLat, lon: eLon } = cityCoords[canonicalExpected];
      const distance = haversine(lat, lon, eLat, eLon);
      if (distance <= distanceKm) {
        matchingCount++;
        detailLines.push(
          `API #${idx + 1}: "${city}" (distance ${distance.toFixed(
            1
          )} km → counted as ${canonicalExpected})`
        );
        return;
      }
    }

    detailLines.push(`API #${idx + 1}: "${city}" (no match)`);
  });

  if (successfulLookups === 0) {
    return {
      ok: false,
      matchRatio: 0,
      matchingCount: 0,
      successfulLookups: 0,
      details: detailLines
    };
  }

  const matchRatio = matchingCount / successfulLookups;
  const ok = matchRatio > 0.5;

  if (debug) console.debug(detailLines.join('\n'));

  return {
    ok,
    matchRatio,
    matchingCount,
    successfulLookups,
    details: detailLines
  };
}

module.exports = {
  checkIpCity
};
