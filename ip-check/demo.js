// demo.js
const { checkIpCity } = require('./ip-city-crosscheck.cjs');

(async () => {
  const res = await checkIpCity('62.103.147.55', 'Athens', { debug: false });
  console.log(res);
})();
