/**
 * Tolerances and Conductor Calculations
 * Based on factory notebook standard tables
 */

const TOLERANCE_TABLES = {
  // Table 1: Width & Thickness Tolerance
  widthAndThickness: [
    { min: 0, max: 3.15, tol: 0.03, label: '0 to 3.15 mm', id: 'wt-row-1' },
    { min: 3.15, max: 6.30, tol: 0.05, label: '3.15 to 6.30 mm', id: 'wt-row-2' },
    { min: 6.30, max: 12.50, tol: 0.07, label: '6.30 to 12.50 mm', id: 'wt-row-3' },
    { min: 12.50, max: Infinity, tol: 0.10, label: 'Above 12.50 mm', id: 'wt-row-4' }
  ],

  // Table 2: Increase in dimension due to paper covering (Insulation Tolerance)
  paperCovering: [
    { min: 0, max: 0.50, posTolPercent: 0, negTolPercent: 10, label: 'Up to 0.50 mm', tolDisplay: '+0%, -10%', id: 'pc-row-1' },
    { min: 0.50, max: 1.25, posTolPercent: 0, negTolPercent: 7.5, label: '0.50 to 1.25 mm', tolDisplay: '+0%, -7.5%', id: 'pc-row-2' },
    { min: 1.25, max: Infinity, posTolPercent: 0, negTolPercent: 5, label: 'Above 1.25 mm', tolDisplay: '+0%, -5%', id: 'pc-row-3' }
  ],

  // Table 3: Corner Radius
  cornerRadius: [
    { min: 0, max: 1.00, radius: 'Semicircle', numericRadius: null, tolPercent: 25, label: 'Up to 1.00 mm', id: 'cr-row-1' },
    { min: 1.00, max: 1.60, radius: '0.50 mm', numericRadius: 0.50, tolPercent: 25, label: '1.00 to 1.60 mm', id: 'cr-row-2' },
    { min: 1.60, max: 2.24, radius: '0.65 mm', numericRadius: 0.65, tolPercent: 25, label: '1.60 to 2.24 mm', id: 'cr-row-3' },
    { min: 2.24, max: 3.55, radius: '0.80 mm', numericRadius: 0.80, tolPercent: 25, label: '2.24 to 3.55 mm', id: 'cr-row-4' },
    { min: 3.55, max: Infinity, radius: '1.00 mm', numericRadius: 1.00, tolPercent: 25, label: '3.55 mm & Above', id: 'cr-row-5' }
  ]
};

/**
 * Get Width & Thickness tolerance for a given dimension
 */
function getWidthAndThicknessTolerance(dim) {
  const num = parseFloat(dim);
  if (isNaN(num) || num <= 0) return null;

  for (const row of TOLERANCE_TABLES.widthAndThickness) {
    if (row.min === 0) {
      if (num <= row.max) return row;
    } else {
      if (num > row.min && num <= row.max) return row;
    }
  }
  return TOLERANCE_TABLES.widthAndThickness[TOLERANCE_TABLES.widthAndThickness.length - 1];
}

/**
 * Get Paper Covering tolerance for a given insulation thickness
 */
function getPaperCoveringTolerance(insulation) {
  const num = parseFloat(insulation);
  if (isNaN(num) || num <= 0) return null;

  for (const row of TOLERANCE_TABLES.paperCovering) {
    if (row.min === 0) {
      if (num <= row.max) return row;
    } else {
      if (num > row.min && num <= row.max) return row;
    }
  }
  return TOLERANCE_TABLES.paperCovering[TOLERANCE_TABLES.paperCovering.length - 1];
}

/**
 * Get Corner Radius information for a given bare thickness
 */
function getCornerRadius(thickness) {
  const num = parseFloat(thickness);
  if (isNaN(num) || num <= 0) return null;

  for (const row of TOLERANCE_TABLES.cornerRadius) {
    if (row.min === 0) {
      if (num <= row.max) return row;
    } else {
      if (num > row.min && num <= row.max) return row;
    }
  }
  return TOLERANCE_TABLES.cornerRadius[TOLERANCE_TABLES.cornerRadius.length - 1];
}

/**
 * Helper to round to decimal places without floating point errors
 */
function roundDec(val, dec = 2) {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const factor = Math.pow(10, dec);
  return (Math.round((val + Number.EPSILON) * factor) / factor).toFixed(dec);
}

/**
 * Calculate Single Strip Dimensions and Tolerances
 * Bare W, Bare T, Paper Covering (Insulation)
 */
function calculateSingleStrip({ bareW, bareT, insulation, customCoveredW = null, customCoveredT = null }) {
  const bw = parseFloat(bareW);
  const bt = parseFloat(bareT);
  const ins = parseFloat(insulation);

  if (isNaN(bw) || bw <= 0 || isNaN(bt) || bt <= 0) {
    return { error: 'Please enter valid Bare Width and Bare Thickness.' };
  }

  const wTolObj = getWidthAndThicknessTolerance(bw);
  const tTolObj = getWidthAndThicknessTolerance(bt);
  const crObj = getCornerRadius(bt);

  const wTol = wTolObj ? wTolObj.tol : 0;
  const tTol = tTolObj ? tTolObj.tol : 0;

  // Bare Width
  const bareWMax = bw + wTol;
  const bareWMin = bw - wTol;

  // Bare Thickness
  const bareTMax = bt + tTol;
  const bareTMin = bt - tTol;

  // Corner radius limits
  let crMin = null, crMax = null;
  if (crObj && crObj.numericRadius !== null) {
    const crTol = crObj.numericRadius * (crObj.tolPercent / 100);
    crMin = crObj.numericRadius - crTol;
    crMax = crObj.numericRadius + crTol;
  }

  // Covered Calculations if insulation is provided
  let covered = null;
  if (!isNaN(ins) && ins > 0) {
    const insTolObj = getPaperCoveringTolerance(ins);
    const negPercent = insTolObj ? insTolObj.negTolPercent : 0;
    const insNegVariation = ins * (negPercent / 100);

    const covWNominal = (customCoveredW !== null && customCoveredW !== '' && !isNaN(parseFloat(customCoveredW))) 
      ? parseFloat(customCoveredW) 
      : bw + ins;
    const covTNominal = (customCoveredT !== null && customCoveredT !== '' && !isNaN(parseFloat(customCoveredT))) 
      ? parseFloat(customCoveredT) 
      : bt + ins;

    // Covered Width (+ve): Nominal + Bare Width Tolerance
    // Covered Width (-ve): Nominal - (Bare Width Tolerance + Insulation Neg Variation)
    const covWMax = covWNominal + wTol;
    const covWMin = covWNominal - (wTol + insNegVariation);

    // Covered Thickness (+ve): Nominal + Bare Thickness Tolerance
    // Covered Thickness (-ve): Nominal - (Bare Thickness Tolerance + Insulation Neg Variation)
    const covTMax = covTNominal + tTol;
    const covTMin = covTNominal - (tTol + insNegVariation);

    covered = {
      insulation: ins,
      insTolObj,
      negPercent,
      insNegVariation,
      nominalW: covWNominal,
      nominalT: covTNominal,
      wMax: covWMax,
      wMin: covWMin,
      tMax: covTMax,
      tMin: covTMin,
      totalWReduction: wTol + insNegVariation,
      totalTReduction: tTol + insNegVariation
    };
  }

  return {
    mode: 'single',
    bare: {
      nominalW: bw,
      nominalT: bt,
      wTol,
      tTol,
      wTolObj,
      tTolObj,
      wMax: bareWMax,
      wMin: bareWMin,
      tMax: bareTMax,
      tMin: bareTMin
    },
    covered,
    cornerRadius: {
      ...crObj,
      crMin,
      crMax
    }
  };
}

/**
 * Calculate Bunched / Multi-Strip Conductor Dimensions
 * as seen in Vijipower notebook photos (11.80 x 1.40 / 0.25 || 0.65 2+5 PC -> 12.70 x 5.60)
 */
/**
 * Calculate Bunched / Multi-Strip Conductor Dimensions
 * as seen in Dec 2026 bunching notebook (12.00 x 2.65 / 0.46 || 0.66 4+5 PC -> 13.12 x 6.88)
 * and Vijipower notebook (11.80 x 1.40 / 0.25 || 0.65 2+5 PC -> 12.70 x 5.60)
 * Note: waxConstant = 0.02 is constant per workshop specification
 */
function calculateBunchedStrip({
  bareW,
  bareT,
  singleInsulation = 0.46,
  overallInsulation = 0.66,
  stripsWide = 1,
  stripsThick = 2,
  waxConstant = 0.02,
  coveredWNominal = null,
  coveredTNominal = null
}) {
  const bw = parseFloat(bareW);
  const bt = parseFloat(bareT);
  const sIns = parseFloat(singleInsulation) || 0;
  const oIns = parseFloat(overallInsulation) || 0;
  const nW = parseInt(stripsWide) || 1;
  const nT = parseInt(stripsThick) || 1;
  const wax = parseFloat(waxConstant) || 0.02;

  if (isNaN(bw) || bw <= 0 || isNaN(bt) || bt <= 0) {
    return { error: 'Please enter valid Bare Width and Bare Thickness.' };
  }

  const wTolObj = getWidthAndThicknessTolerance(bw);
  const tTolObj = getWidthAndThicknessTolerance(bt);
  const sInsTolObj = getPaperCoveringTolerance(sIns);
  const oInsTolObj = getPaperCoveringTolerance(oIns);
  const crObj = getCornerRadius(bt);

  const wTol = wTolObj ? wTolObj.tol : 0;
  const tTol = tTolObj ? tTolObj.tol : 0;

  // Bare Single Strip
  const bareWMax = bw + wTol;
  const bareWMin = bw - wTol;
  const bareTMax = bt + tTol;
  const bareTMin = bt - tTol;

  // Single strip with insulation (e.g. 12.00 + 0.46 = 12.46, 2.65 + 0.46 = 3.11)
  const singleStripWNom = bw + sIns;
  const singleStripTNom = bt + sIns;
  const sInsNegVar = sIns * (sInsTolObj ? sInsTolObj.negTolPercent / 100 : 0);

  const singleStripWMax = singleStripWNom + wTol;
  const singleStripWMin = singleStripWNom - (wTol + sInsNegVar);

  const singleStripTMax = singleStripTNom + tTol;
  const singleStripTMin = singleStripTNom - (tTol + sInsNegVar);

  // Overall Covered Dimensions (Nominal defaults: W = singleW + oIns; T = nT * singleT + oIns)
  const autoCovW = singleStripWNom + oIns;
  const autoCovT = (nT * singleStripTNom) + oIns;
  const covWNom = (coveredWNominal !== null && coveredWNominal !== '' && !isNaN(parseFloat(coveredWNominal)))
    ? parseFloat(coveredWNominal)
    : autoCovW;
  const covTNom = (coveredTNominal !== null && coveredTNominal !== '' && !isNaN(parseFloat(coveredTNominal)))
    ? parseFloat(coveredTNominal)
    : autoCovT;

  // Overall Covered Width:
  const oInsNegVar = oIns * (oInsTolObj ? oInsTolObj.negTolPercent / 100 : 0);
  const covWMax = covWNom + wTol;
  const covWNegDeduction = wTol + (sInsNegVar + oInsNegVar);
  const covWMin = covWNom - covWNegDeduction;

  // Overall Covered Thickness:
  // Formula: +ve = covTNom + [nT * tTol + (nT - 1) * wax]
  const waxTotal = Math.max(0, nT - 1) * wax;
  const covTPosAddition = (nT * tTol) + waxTotal;
  const covTMax = covTNom + covTPosAddition;

  // Formula: -ve = covTNom - [nT * tTol + nT * sInsNegVar + oInsNegVar]
  const covTNegDeduction = (nT * tTol) + (nT * sInsNegVar) + oInsNegVar;
  const covTMin = covTNom - covTNegDeduction;

  return {
    mode: 'bunched',
    bare: {
      nominalW: bw,
      nominalT: bt,
      wTol,
      tTol,
      wTolObj,
      tTolObj,
      wMax: bareWMax,
      wMin: bareWMin,
      tMax: bareTMax,
      tMin: bareTMin
    },
    singleStrip: {
      nominalW: singleStripWNom,
      nominalT: singleStripTNom,
      sIns,
      sInsTolObj,
      sInsNegVar,
      wMax: singleStripWMax,
      wMin: singleStripWMin,
      tMax: singleStripTMax,
      tMin: singleStripTMin
    },
    covered: {
      nominalW: covWNom,
      nominalT: covTNom,
      sIns,
      oIns,
      sInsTolObj,
      oInsTolObj,
      sInsNegVar,
      oInsNegVar,
      stripsWide: nW,
      stripsThick: nT,
      waxConstant: wax,
      waxTotal,
      wMax: covWMax,
      wMin: covWMin,
      wNegDeduction: covWNegDeduction,
      tMax: covTMax,
      tMin: covTMin,
      tPosAddition: covTPosAddition,
      tNegDeduction: covTNegDeduction
    },
    cornerRadius: crObj
  };
}

// Export for Node and Browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOLERANCE_TABLES,
    getWidthAndThicknessTolerance,
    getPaperCoveringTolerance,
    getCornerRadius,
    calculateSingleStrip,
    calculateBunchedStrip,
    roundDec
  };
}

if (typeof window !== 'undefined') {
  window.TOLERANCE_TABLES = TOLERANCE_TABLES;
  window.getWidthAndThicknessTolerance = getWidthAndThicknessTolerance;
  window.getPaperCoveringTolerance = getPaperCoveringTolerance;
  window.getCornerRadius = getCornerRadius;
  window.calculateSingleStrip = calculateSingleStrip;
  window.calculateBunchedStrip = calculateBunchedStrip;
  window.roundDec = roundDec;
}
