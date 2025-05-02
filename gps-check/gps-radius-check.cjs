const toRad = d => d * Math.PI / 180;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function valid(v, lat) {
  return typeof v === 'number' && !Number.isNaN(v) && (lat ? v >= -90 && v <= 90 : v >= -180 && v <= 180);
}

function checkRadius(centerLat, centerLon, testLat, testLon, radiusMeters, opts = {}) {
  const { debug = false } = opts;
  [centerLat, centerLon, testLat, testLon, radiusMeters] = [centerLat, centerLon, testLat, testLon, radiusMeters].map(Number);
  if (![centerLat, centerLon, testLat, testLon].every((v, i) => valid(v, i % 2 === 0)) || !Number.isFinite(radiusMeters))
    throw new Error('Invalid input');
  const distance = haversineMeters(centerLat, centerLon, testLat, testLon);
  const result = {
    centerCoordinate: { lat: centerLat, lon: centerLon },
    testCoordinate: { lat: testLat, lon: testLon },
    radiusMeters,
    distanceMeters: Number(distance.toFixed(2)),
    isWithinRadius: distance <= radiusMeters
  };
  if (debug) console.debug(result);
  return result;
}

module.exports = { checkRadius };
