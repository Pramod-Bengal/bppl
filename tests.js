const {
  calculateSingleStrip,
  calculateBunchedStrip,
  roundDec
} = require('./tolerances');

let passedCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('--- TEST 1: Single Strip Conductor (Notebook Dec 2026: 14.80 x 4.50 / 0.75) ---');
const res1 = calculateSingleStrip({
  bareW: 14.80,
  bareT: 4.50,
  insulation: 0.75
});

assert(res1.bare.wTol === 0.10, 'Bare Width Tolerance is ±0.10');
assert(roundDec(res1.bare.wMax, 2) === '14.90', 'Bare Width (+ve) is 14.90');
assert(roundDec(res1.bare.wMin, 2) === '14.70', 'Bare Width (-ve) is 14.70');

assert(res1.bare.tTol === 0.05, 'Bare Thickness Tolerance is ±0.05');
assert(roundDec(res1.bare.tMax, 2) === '4.55', 'Bare Thickness (+ve) is 4.55');
assert(roundDec(res1.bare.tMin, 2) === '4.45', 'Bare Thickness (-ve) is 4.45');

assert(roundDec(res1.covered.nominalW, 2) === '15.55', 'Covered Width Nominal is 15.55');
assert(roundDec(res1.covered.nominalT, 2) === '5.25', 'Covered Thickness Nominal is 5.25');
assert(res1.covered.negPercent === 7.5, 'Insulation Negative Tolerance is -7.5%');
assert(Math.abs(res1.covered.insNegVariation - 0.05625) < 1e-6, 'Insulation variation is 0.05625');

assert(roundDec(res1.covered.wMax, 2) === '15.65', 'Covered Width (+ve) is 15.65');
assert(roundDec(res1.covered.wMin, 2) === '15.39', 'Covered Width (-ve) is 15.39 (exact: 15.39375)');

assert(roundDec(res1.covered.tMax, 2) === '5.30', 'Covered Thickness (+ve) is 5.30');
assert(roundDec(res1.covered.tMin, 2) === '5.14', 'Covered Thickness (-ve) is 5.14 (exact: 5.14375)');

assert(res1.cornerRadius.radius === '1.00 mm', 'Corner Radius is 1.00 mm');

console.log('\n--- TEST 2: Bunched Conductor (Notebook Vijipower: 11.80 x 1.40 / 0.25 || 0.65 (2+5 PC)) ---');
const res2 = calculateBunchedStrip({
  bareW: 11.80,
  bareT: 1.40,
  singleInsulation: 0.25,
  overallInsulation: 0.65,
  stripsWide: 1,
  stripsThick: 3,
  extraThickTolPerStrip: 0.02,
  coveredWNominal: 12.70,
  coveredTNominal: 5.60
});

assert(res2.bare.wTol === 0.07, 'Bare Width Tolerance is ±0.07');
assert(roundDec(res2.bare.wMax, 2) === '11.87', 'Bare Width (+ve) is 11.87');
assert(roundDec(res2.bare.wMin, 2) === '11.73', 'Bare Width (-ve) is 11.73');

assert(res2.bare.tTol === 0.03, 'Bare Thickness Tolerance is ±0.03');
assert(roundDec(res2.bare.tMax, 2) === '1.43', 'Bare Thickness (+ve) is 1.43');
assert(roundDec(res2.bare.tMin, 2) === '1.37', 'Bare Thickness (-ve) is 1.37');

assert(roundDec(res2.singleStrip.nominalW, 2) === '12.05', 'Single strip width is 12.05');
assert(roundDec(res2.singleStrip.wMax, 2) === '12.12', 'Single strip width (+ve) is 12.12');
assert(roundDec(res2.singleStrip.wMin, 2) === '11.96', 'Single strip width (-ve) is 11.955 -> 11.96');

assert(roundDec(res2.covered.wMax, 2) === '12.77', 'Covered Width (+ve) is 12.77');
assert(roundDec(res2.covered.wMin, 2) === '12.56', 'Covered Width (-ve) is 12.56 (exact: 12.55625, note: 12.55)');

assert(roundDec(res2.covered.tMax, 2) === '5.73', 'Covered Thickness (+ve) is 5.73');
assert(roundDec(res2.covered.tMin, 3) === '5.386', 'Covered Thickness (-ve) is 5.386 (exact: 5.38625)');

console.log('\n--- TEST 3: Bunched Conductor (New Dec 2026 Notebook: 12.00 x 2.65 / 0.46 || 0.66, Wax = 0.02) ---');
const res3 = calculateBunchedStrip({
  bareW: 12.00,
  bareT: 2.65,
  singleInsulation: 0.46,
  overallInsulation: 0.66,
  stripsWide: 1,
  stripsThick: 2,
  waxConstant: 0.02,
  coveredWNominal: 13.12,
  coveredTNominal: 6.88
});

assert(res3.bare.wTol === 0.07, 'Bare Width Tolerance is ±0.07');
assert(roundDec(res3.bare.wMax, 2) === '12.07', 'Bare Width (+ve) is 12.07');
assert(roundDec(res3.bare.wMin, 2) === '11.93', 'Bare Width (-ve) is 11.93');

assert(res3.bare.tTol === 0.03, 'Bare Thickness Tolerance is ±0.03');
assert(roundDec(res3.bare.tMax, 2) === '2.68', 'Bare Thickness (+ve) is 2.68');
assert(roundDec(res3.bare.tMin, 2) === '2.62', 'Bare Thickness (-ve) is 2.62');

assert(roundDec(res3.singleStrip.nominalW, 2) === '12.46', 'Single strip width is 12.46');
assert(roundDec(res3.singleStrip.nominalT, 2) === '3.11', 'Single strip thickness is 3.11');
assert(roundDec(res3.singleStrip.wMax, 2) === '12.53', 'Single strip width (+ve) is 12.53');
assert(roundDec(res3.singleStrip.wMin, 2) === '12.34', 'Single strip width (-ve) is 12.34');
assert(roundDec(res3.singleStrip.tMax, 2) === '3.14', 'Single strip thickness (+ve) is 3.14');
assert(roundDec(res3.singleStrip.tMin, 3) === '3.034', 'Single strip thickness (-ve) is 3.034');

assert(roundDec(res3.covered.nominalW, 2) === '13.12', 'Covered Width Nominal is 13.12');
assert(roundDec(res3.covered.nominalT, 2) === '6.88', 'Covered Thickness Nominal is 6.88');
assert(roundDec(res3.covered.wMax, 2) === '13.19', 'Covered Width (+ve) is 13.19');
assert(roundDec(res3.covered.wMin, 2) === '12.95', 'Covered Width (-ve) is 12.95 (exact: 12.9545)');

assert(roundDec(res3.covered.tMax, 2) === '6.96', 'Covered Thickness (+ve) is 6.96 [6.88 + 0.03 + 0.03 + 0.02 (wax)]');
assert(roundDec(res3.covered.tMin, 4) === '6.6785', 'Covered Thickness (-ve) is 6.6785 [6.88 - 0.2015]');

console.log(`\nResults: ${passedCount} / ${totalCount} tests passed.`);
if (passedCount !== totalCount) {
  process.exit(1);
}
