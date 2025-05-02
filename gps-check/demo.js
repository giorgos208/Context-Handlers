const { checkRadius } = require('./gps-radius-check.cjs');

const res = checkRadius(37.9838, 23.7275, 37.9715, 23.7257, 2000);
console.log(res);
