/**
 * Main Web Application Logic
 * Conductor Strip Tolerance Inspector
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const modeSingleBtn = document.getElementById('modeSingleBtn');
  const modeBunchedBtn = document.getElementById('modeBunchedBtn');
  const singleInputsContainer = document.getElementById('singleInputs');
  const bunchedInputsContainer = document.getElementById('bunchedInputs');

  // Single strip inputs
  const bareWInput = document.getElementById('bareW');
  const bareTInput = document.getElementById('bareT');
  const insulationInput = document.getElementById('insulation');
  const covWNominalInput = document.getElementById('covWNominal');
  const covTNominalInput = document.getElementById('covTNominal');

  // Bunched inputs
  const bunchedBareW = document.getElementById('bunchedBareW');
  const bunchedBareT = document.getElementById('bunchedBareT');
  const bunchedSingleIns = document.getElementById('bunchedSingleIns');
  const bunchedOverallIns = document.getElementById('bunchedOverallIns');
  const bunchedStripsThick = document.getElementById('bunchedStripsThick');
  const bunchedWax = document.getElementById('bunchedWax');
  const bunchedCoveredW = document.getElementById('bunchedCoveredW');
  const bunchedCoveredT = document.getElementById('bunchedCoveredT');

  // Display elements - Bare
  const dispBareWNom = document.getElementById('dispBareWNom');
  const dispBareWPos = document.getElementById('dispBareWPos');
  const dispBareWNeg = document.getElementById('dispBareWNeg');
  const dispBareWTol = document.getElementById('dispBareWTol');

  const dispBareTNom = document.getElementById('dispBareTNom');
  const dispBareTPos = document.getElementById('dispBareTPos');
  const dispBareTNeg = document.getElementById('dispBareTNeg');
  const dispBareTTol = document.getElementById('dispBareTTol');

  // Display elements - Covered
  const dispCovWNom = document.getElementById('dispCovWNom');
  const dispCovWPos = document.getElementById('dispCovWPos');
  const dispCovWNeg = document.getElementById('dispCovWNeg');
  const dispCovWSub = document.getElementById('dispCovWSub');

  const dispCovTNom = document.getElementById('dispCovTNom');
  const dispCovTPos = document.getElementById('dispCovTPos');
  const dispCovTNeg = document.getElementById('dispCovTNeg');
  const dispCovTSub = document.getElementById('dispCovTSub');

  // Corner radius
  const dispCRNom = document.getElementById('dispCRNom');
  const dispCRTol = document.getElementById('dispCRTol');
  const dispCRRange = document.getElementById('dispCRRange');

  // Bunched intermediate strip section
  const bunchedStripCard = document.getElementById('bunchedStripCard');
  const dispSingleStripWNom = document.getElementById('dispSingleStripWNom');
  const dispSingleStripWPos = document.getElementById('dispSingleStripWPos');
  const dispSingleStripWNeg = document.getElementById('dispSingleStripWNeg');

  const dispSingleStripTNom = document.getElementById('dispSingleStripTNom');
  const dispSingleStripTPos = document.getElementById('dispSingleStripTPos');
  const dispSingleStripTNeg = document.getElementById('dispSingleStripTNeg');

  // Step breakdown
  const formulaLinesContainer = document.getElementById('formulaLines');

  // QC Inputs & outputs
  const qcMeasuredW = document.getElementById('qcMeasuredW');
  const qcMeasuredT = document.getElementById('qcMeasuredT');
  const qcCheckTarget = document.getElementById('qcCheckTarget');
  const qcResultBadge = document.getElementById('qcResultBadge');

  // State
  let currentMode = 'single'; // 'single' | 'bunched'
  let currentCalculation = null;

  // Auto sync nominal covered dimensions when bare / insulation change in single mode
  let autoSyncCovered = true;
  let autoSyncBunched = true;

  // Event Listeners for Mode
  modeSingleBtn.addEventListener('click', () => switchMode('single'));
  modeBunchedBtn.addEventListener('click', () => switchMode('bunched'));

  function switchMode(mode) {
    currentMode = mode;
    if (mode === 'single') {
      modeSingleBtn.classList.add('active');
      modeBunchedBtn.classList.remove('active');
      singleInputsContainer.style.display = 'grid';
      bunchedInputsContainer.style.display = 'none';
      if (bunchedStripCard) bunchedStripCard.style.display = 'none';
    } else {
      modeBunchedBtn.classList.add('active');
      modeSingleBtn.classList.remove('active');
      singleInputsContainer.style.display = 'none';
      bunchedInputsContainer.style.display = 'grid';
      if (bunchedStripCard) bunchedStripCard.style.display = 'block';
    }
    recalculate();
  }

  // Presets
  document.querySelectorAll('.preset-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('.preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const preset = chip.dataset.preset;
      applyPreset(preset);
    });
  });

  function applyPreset(preset) {
    autoSyncCovered = true;
    autoSyncBunched = true;
    if (preset === 'dec2026') {
      switchMode('single');
      bareWInput.value = '14.80';
      bareTInput.value = '4.50';
      insulationInput.value = '0.75';
      covWNominalInput.value = '15.55';
      covTNominalInput.value = '5.25';
    } else if (preset === 'bunching2026') {
      switchMode('bunched');
      bunchedBareW.value = '12.00';
      bunchedBareT.value = '2.65';
      bunchedSingleIns.value = '0.46';
      bunchedOverallIns.value = '0.66';
      bunchedStripsThick.value = '2';
      if (bunchedWax) bunchedWax.value = '0.02';
      bunchedCoveredW.value = '13.12';
      bunchedCoveredT.value = '6.88';
    } else if (preset === 'vijipower') {
      switchMode('bunched');
      bunchedBareW.value = '11.80';
      bunchedBareT.value = '1.40';
      bunchedSingleIns.value = '0.25';
      bunchedOverallIns.value = '0.65';
      bunchedStripsThick.value = '3';
      if (bunchedWax) bunchedWax.value = '0.02';
      bunchedCoveredW.value = '12.70';
      bunchedCoveredT.value = '5.60';
    } else if (preset === 'transformer') {
      switchMode('single');
      bareWInput.value = '8.50';
      bareTInput.value = '2.80';
      insulationInput.value = '0.45';
      covWNominalInput.value = '8.95';
      covTNominalInput.value = '3.25';
    } else if (preset === 'clear') {
      bareWInput.value = '';
      bareTInput.value = '';
      insulationInput.value = '';
      covWNominalInput.value = '';
      covTNominalInput.value = '';
      bunchedBareW.value = '';
      bunchedBareT.value = '';
      bunchedSingleIns.value = '';
      bunchedOverallIns.value = '';
      bunchedCoveredW.value = '';
      bunchedCoveredT.value = '';
    }
    recalculate();
  }

  // Listen for changes in single mode inputs
  [bareWInput, bareTInput, insulationInput].forEach(inp => {
    inp.addEventListener('input', () => {
      if (autoSyncCovered) {
        const bw = parseFloat(bareWInput.value) || 0;
        const bt = parseFloat(bareTInput.value) || 0;
        const ins = parseFloat(insulationInput.value) || 0;
        if (bw > 0 && ins > 0) {
          covWNominalInput.value = (bw + ins).toFixed(2);
        }
        if (bt > 0 && ins > 0) {
          covTNominalInput.value = (bt + ins).toFixed(2);
        }
      }
      recalculate();
    });
  });

  covWNominalInput.addEventListener('input', () => {
    autoSyncCovered = false;
    recalculate();
  });
  covTNominalInput.addEventListener('input', () => {
    autoSyncCovered = false;
    recalculate();
  });

  // Listen for bunched inputs with auto-sync of Covered Width & Thickness
  [bunchedBareW, bunchedBareT, bunchedSingleIns, bunchedOverallIns, bunchedStripsThick].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', () => {
        if (autoSyncBunched) {
          const bw = parseFloat(bunchedBareW.value) || 0;
          const bt = parseFloat(bunchedBareT.value) || 0;
          const sIns = parseFloat(bunchedSingleIns.value) || 0;
          const oIns = parseFloat(bunchedOverallIns.value) || 0;
          const nT = parseInt(bunchedStripsThick.value) || 1;

          if (bw > 0) {
            bunchedCoveredW.value = (bw + sIns + oIns).toFixed(2);
          }
          if (bt > 0) {
            const singleT = bt + sIns;
            bunchedCoveredT.value = ((nT * singleT) + oIns).toFixed(2);
          }
        }
        recalculate();
      });
    }
  });

  if (bunchedWax) {
    bunchedWax.addEventListener('input', recalculate);
  }

  bunchedCoveredW.addEventListener('input', () => {
    autoSyncBunched = false;
    recalculate();
  });
  bunchedCoveredT.addEventListener('input', () => {
    autoSyncBunched = false;
    recalculate();
  });

  // QC Inputs
  [qcMeasuredW, qcMeasuredT, qcCheckTarget].forEach(inp => {
    inp.addEventListener('input', runQualityCheck);
  });

  function recalculate() {
    let result = null;

    if (currentMode === 'single') {
      result = calculateSingleStrip({
        bareW: bareWInput.value,
        bareT: bareTInput.value,
        insulation: insulationInput.value,
        customCoveredW: covWNominalInput.value,
        customCoveredT: covTNominalInput.value
      });
    } else {
      result = calculateBunchedStrip({
        bareW: bunchedBareW.value,
        bareT: bunchedBareT.value,
        singleInsulation: bunchedSingleIns.value,
        overallInsulation: bunchedOverallIns.value,
        stripsWide: 1,
        stripsThick: bunchedStripsThick.value,
        waxConstant: bunchedWax ? bunchedWax.value : 0.02,
        coveredWNominal: bunchedCoveredW.value,
        coveredTNominal: bunchedCoveredT.value
      });
    }

    currentCalculation = result;

    if (result && !result.error) {
      updateDigitalReadouts(result);
      highlightToleranceTables(result);
      renderCrossSection(result);
      renderFormulas(result);
      runQualityCheck();
    } else {
      clearReadouts();
    }
  }

  function updateDigitalReadouts(res) {
    // Bare Width
    dispBareWNom.textContent = `${roundDec(res.bare.nominalW, 2)} mm`;
    dispBareWPos.textContent = roundDec(res.bare.wMax, 2);
    dispBareWNeg.textContent = roundDec(res.bare.wMin, 2);
    dispBareWTol.textContent = `Tol: ±${roundDec(res.bare.wTol, 2)} mm`;

    // Bare Thickness
    dispBareTNom.textContent = `${roundDec(res.bare.nominalT, 2)} mm`;
    dispBareTPos.textContent = roundDec(res.bare.tMax, 2);
    dispBareTNeg.textContent = roundDec(res.bare.tMin, 2);
    dispBareTTol.textContent = `Tol: ±${roundDec(res.bare.tTol, 2)} mm`;

    // Covered
    const coveredInsSummary = document.getElementById('coveredInsulationSummary');
    if (res.covered) {
      dispCovWNom.textContent = `${roundDec(res.covered.nominalW, 2)} mm`;
      dispCovWPos.textContent = roundDec(res.covered.wMax, 2);
      dispCovWNeg.textContent = roundDec(res.covered.wMin, 2);
      
      const wNegSub = res.mode === 'single' ? res.covered.totalWReduction : res.covered.wNegDeduction;
      dispCovWSub.textContent = `(-ve deduct: -${roundDec(wNegSub, 4)} mm)`;

      dispCovTNom.textContent = `${roundDec(res.covered.nominalT, 2)} mm`;
      dispCovTPos.textContent = roundDec(res.covered.tMax, 2);
      dispCovTNeg.textContent = roundDec(res.covered.tMin, 2);
      
      const tNegSub = res.mode === 'single' ? res.covered.totalTReduction : res.covered.tNegDeduction;
      dispCovTSub.textContent = `(-ve deduct: -${roundDec(tNegSub, 4)} mm)`;

      if (coveredInsSummary) {
        if (res.mode === 'bunched') {
          const sIns = res.singleStrip.sIns;
          const sTol = res.singleStrip.sInsTolObj ? res.singleStrip.sInsTolObj.negTolPercent : 10;
          const sDed = res.singleStrip.sInsNegVar;

          const oIns = res.covered.oIns;
          const oTol = res.covered.oInsTolObj ? res.covered.oInsTolObj.negTolPercent : 7.5;
          const oDed = res.covered.oInsNegVar;

          coveredInsSummary.innerHTML = `
            <div>
              <span style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; font-weight:700;">Single Strip Paper:</span>
              <strong style="color:#38bdf8; margin-left:4px;">${sIns.toFixed(2)} mm</strong>
              <span style="color:#fbbf24; font-size:0.75rem; margin-left:3px;">(-${sTol}% = -${roundDec(sDed, 4)} mm)</span>
            </div>
            <div>
              <span style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; font-weight:700;">Overall Covering:</span>
              <strong style="color:#38bdf8; margin-left:4px;">${oIns.toFixed(2)} mm</strong>
              <span style="color:#fbbf24; font-size:0.75rem; margin-left:3px;">(-${oTol}% = -${roundDec(oDed, 5)} mm)</span>
            </div>
            <div>
              <span style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; font-weight:700;">Wax:</span>
              <strong style="color:#a78bfa; margin-left:4px;">${res.covered.waxConstant.toFixed(2)} mm</strong>
            </div>
          `;
        } else {
          const ins = res.covered.insulation;
          const tol = res.covered.negPercent;
          const ded = res.covered.insNegVariation;

          coveredInsSummary.innerHTML = `
            <div>
              <span style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; font-weight:700;">Paper Covering:</span>
              <strong style="color:#38bdf8; margin-left:4px;">${ins.toFixed(2)} mm</strong>
              <span style="color:#fbbf24; font-size:0.75rem; margin-left:4px;">(-${tol}% = -${roundDec(ded, 5)} mm deduction)</span>
            </div>
            <div>
              <span style="color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; font-weight:700;">Tolerance:</span>
              <strong style="color:#4ade80; margin-left:4px;">+0%, -${tol}%</strong>
            </div>
          `;
        }
      }
    } else {
      dispCovWNom.textContent = '-';
      dispCovWPos.textContent = '-';
      dispCovWNeg.textContent = '-';
      dispCovWSub.textContent = '';
      dispCovTNom.textContent = '-';
      dispCovTPos.textContent = '-';
      dispCovTNeg.textContent = '-';
      dispCovTSub.textContent = '';
      if (coveredInsSummary) coveredInsSummary.innerHTML = '<span style="color:var(--text-dim);">No paper covering specified</span>';
    }

    // Corner Radius
    if (res.cornerRadius) {
      dispCRNom.textContent = res.cornerRadius.radius || '-';
      dispCRTol.textContent = `±${res.cornerRadius.tolPercent}%`;
      if (res.cornerRadius.crMin !== null && res.cornerRadius.crMax !== null) {
        dispCRRange.textContent = `${roundDec(res.cornerRadius.crMin, 3)} to ${roundDec(res.cornerRadius.crMax, 3)} mm`;
      } else {
        dispCRRange.textContent = 'Semi-circular edge';
      }
    }

    // Bunched single strip card
    if (res.mode === 'bunched' && res.singleStrip) {
      dispSingleStripWNom.textContent = `${roundDec(res.singleStrip.nominalW, 2)} mm`;
      dispSingleStripWPos.textContent = roundDec(res.singleStrip.wMax, 2);
      dispSingleStripWNeg.textContent = roundDec(res.singleStrip.wMin, 2);

      if (dispSingleStripTNom) {
        dispSingleStripTNom.textContent = `${roundDec(res.singleStrip.nominalT, 2)} mm`;
        dispSingleStripTPos.textContent = roundDec(res.singleStrip.tMax, 2);
        dispSingleStripTNeg.textContent = roundDec(res.singleStrip.tMin, 3);
      }
    }
  }

  function clearReadouts() {
    dispBareWNom.textContent = '-';
    dispBareWPos.textContent = '-';
    dispBareWNeg.textContent = '-';
    dispBareWTol.textContent = '';

    dispBareTNom.textContent = '-';
    dispBareTPos.textContent = '-';
    dispBareTNeg.textContent = '-';
    dispBareTTol.textContent = '';

    dispCovWNom.textContent = '-';
    dispCovWPos.textContent = '-';
    dispCovWNeg.textContent = '-';
    dispCovWSub.textContent = '';

    dispCovTNom.textContent = '-';
    dispCovTPos.textContent = '-';
    dispCovTNeg.textContent = '-';
    dispCovTSub.textContent = '';

    dispCRNom.textContent = '-';
    dispCRRange.textContent = '-';

    formulaLinesContainer.innerHTML = '<div style="color:var(--text-dim);">Enter conductor dimensions to view detailed arithmetic step-by-step breakdown.</div>';
    
    // Clear highlights
    document.querySelectorAll('.custom-table tr').forEach(r => r.classList.remove('active-row'));
    document.querySelectorAll('.row-tag').forEach(t => t.remove());
  }

  /**
   * Highlight Active Rows in Reference Tables
   */
  function highlightToleranceTables(res) {
    // Clear existing tags and classes
    document.querySelectorAll('.custom-table tr').forEach(r => r.classList.remove('active-row'));
    document.querySelectorAll('.row-tag').forEach(t => t.remove());

    // 1. Width & Thickness Table
    const wRow = res.bare.wTolObj ? document.getElementById(res.bare.wTolObj.id) : null;
    const tRow = res.bare.tTolObj ? document.getElementById(res.bare.tTolObj.id) : null;

    if (wRow) {
      wRow.classList.add('active-row');
      const tag = document.createElement('span');
      tag.className = 'row-tag';
      tag.textContent = 'Width Tol';
      wRow.cells[2].appendChild(tag);
    }

    if (tRow) {
      tRow.classList.add('active-row');
      const tag = document.createElement('span');
      tag.className = 'row-tag';
      tag.textContent = 'Thick Tol';
      tRow.cells[2].appendChild(tag);
    }

    // 2. Paper Covering Table
    let insTolObj = null;
    if (res.mode === 'single' && res.covered) {
      insTolObj = res.covered.insTolObj;
    } else if (res.mode === 'bunched' && res.covered) {
      insTolObj = res.covered.oInsTolObj;
    }

    if (insTolObj) {
      const pcRow = document.getElementById(insTolObj.id);
      if (pcRow) {
        pcRow.classList.add('active-row');
        const tag = document.createElement('span');
        tag.className = 'row-tag';
        tag.textContent = 'Paper Tol';
        pcRow.cells[2].appendChild(tag);
      }
    }

    // 3. Corner Radius Table
    if (res.cornerRadius && res.cornerRadius.id) {
      const crRow = document.getElementById(res.cornerRadius.id);
      if (crRow) {
        crRow.classList.add('active-row');
        const tag = document.createElement('span');
        tag.className = 'row-tag';
        tag.textContent = 'Active CR';
        crRow.cells[1].appendChild(tag);
      }
    }
  }

  /**
   * Dynamic Conductor Cross-Section Diagram
   */
  function renderCrossSection(res) {
    const container = document.getElementById('diagramSvg');
    if (!container) return;

    const bw = res.bare.nominalW;
    const bt = res.bare.nominalT;
    const cw = res.covered ? res.covered.nominalW : bw;
    const ct = res.covered ? res.covered.nominalT : bt;

    // SVG canvas size
    const svgWidth = 460;
    const svgHeight = 220;
    const centerX = svgWidth / 2;
    const centerY = svgHeight / 2;

    // Aspect ratio scaling
    const maxDrawWidth = 280;
    const maxDrawHeight = 120;
    
    // Scale factor
    const scaleX = maxDrawWidth / Math.max(cw, bw, 10);
    const scaleY = maxDrawHeight / Math.max(ct, bt, 5);
    const scale = Math.min(scaleX, scaleY);

    const drawCW = Math.max(30, cw * scale);
    const drawCT = Math.max(20, ct * scale);
    const drawBW = Math.max(24, bw * scale);
    const drawBT = Math.max(14, bt * scale);

    const cornerRadiusRaw = res.cornerRadius.numericRadius || (bt <= 1.0 ? drawBT / 2 : 1.0);
    const drawCornerRadius = Math.min(drawBT / 2 - 1, cornerRadiusRaw * scale * 2);

    const copperLeft = centerX - drawBW / 2;
    const copperTop = centerY - drawBT / 2;

    const paperLeft = centerX - drawCW / 2;
    const paperTop = centerY - drawCT / 2;

    const hasCovering = res.covered && (cw > bw || ct > bt);

    let svgHtml = `
      <svg width="100%" height="220" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Copper gradient -->
          <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f97316"/>
            <stop offset="50%" stop-color="#ea580c"/>
            <stop offset="100%" stop-color="#c2410c"/>
          </linearGradient>
          <!-- Paper insulation pattern / gradient -->
          <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef3c7"/>
            <stop offset="100%" stop-color="#d97706" stop-opacity="0.3"/>
          </linearGradient>
          <!-- Marker for dimension arrows -->
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#38bdf8"/>
          </marker>
          <marker id="arrowGreen" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#4ade80"/>
          </marker>
        </defs>
    `;

    // Outer Paper Layer (if covered)
    if (hasCovering) {
      svgHtml += `
        <rect x="${paperLeft}" y="${paperTop}" width="${drawCW}" height="${drawCT}" rx="${drawCornerRadius + 3}" ry="${drawCornerRadius + 3}" 
              fill="url(#paperGrad)" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 2"/>
        <text x="${paperLeft + 6}" y="${paperTop - 6}" fill="#fbbf24" font-size="11" font-weight="600">Paper Insulation Layer</text>
      `;
    }

    // Bare Conductor Core
    svgHtml += `
      <rect x="${copperLeft}" y="${copperTop}" width="${drawBW}" height="${drawBT}" rx="${drawCornerRadius}" ry="${drawCornerRadius}" 
            fill="url(#copperGrad)" stroke="#7c2d12" stroke-width="1.5"/>
      <text x="${centerX}" y="${centerY + 4}" fill="#ffffff" font-size="12" font-weight="700" text-anchor="middle">
        Bare ${bw} × ${bt} mm
      </text>
    `;

    // Dimension lines
    // Width dimension line (bottom)
    const dimY = centerY + drawCT / 2 + 20;
    svgHtml += `
      <line x1="${copperLeft}" y1="${dimY}" x2="${copperLeft + drawBW}" y2="${dimY}" stroke="#38bdf8" stroke-width="1.5" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
      <line x1="${copperLeft}" y1="${copperTop + drawBT}" x2="${copperLeft}" y2="${dimY + 5}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="${copperLeft + drawBW}" y1="${copperTop + drawBT}" x2="${copperLeft + drawBW}" y2="${dimY + 5}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
      <text x="${centerX}" y="${dimY + 14}" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">
        Width: ${bw} mm (Tol ±${res.bare.wTol})
      </text>
    `;

    // Thickness dimension line (right side)
    const dimX = centerX + drawCW / 2 + 25;
    svgHtml += `
      <line x1="${dimX}" y1="${copperTop}" x2="${dimX}" y2="${copperTop + drawBT}" stroke="#38bdf8" stroke-width="1.5" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
      <line x1="${copperLeft + drawBW}" y1="${copperTop}" x2="${dimX + 5}" y2="${copperTop}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="${copperLeft + drawBW}" y1="${copperTop + drawBT}" x2="${dimX + 5}" y2="${copperTop + drawBT}" stroke="#38bdf8" stroke-width="1" stroke-dasharray="2 2"/>
      <text x="${dimX + 10}" y="${centerY + 4}" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="start">
        Thick: ${bt} mm (±${res.bare.tTol})
      </text>
    `;

    // Corner Radius callout
    if (res.cornerRadius.numericRadius) {
      svgHtml += `
        <circle cx="${copperLeft + drawCornerRadius}" cy="${copperTop + drawCornerRadius}" r="${drawCornerRadius}" fill="none" stroke="#c084fc" stroke-width="1.5" stroke-dasharray="2 2"/>
        <text x="${copperLeft - 8}" y="${copperTop - 6}" fill="#c084fc" font-size="10" font-weight="600" text-anchor="end">
          R: ${res.cornerRadius.radius} (±25%)
        </text>
      `;
    }

    svgHtml += `</svg>`;
    container.innerHTML = svgHtml;
  }

  /**
   * Render step-by-step arithmetic equations matching factory notebook
   */
  function renderFormulas(res) {
    if (!formulaLinesContainer) return;

    let lines = [];

    if (res.mode === 'single') {
      const bw = res.bare.nominalW;
      const bt = res.bare.nominalT;
      const wTol = res.bare.wTol;
      const tTol = res.bare.tTol;

      lines.push({ title: 'Bare Width (+ve)', math: `${bw.toFixed(2)} + ${wTol.toFixed(2)}`, res: `${roundDec(res.bare.wMax, 2)} mm` });
      lines.push({ title: 'Bare Width (-ve)', math: `${bw.toFixed(2)} - ${wTol.toFixed(2)}`, res: `${roundDec(res.bare.wMin, 2)} mm` });
      lines.push({ title: 'Bare Thickness (+ve)', math: `${bt.toFixed(2)} + ${tTol.toFixed(2)}`, res: `${roundDec(res.bare.tMax, 2)} mm` });
      lines.push({ title: 'Bare Thickness (-ve)', math: `${bt.toFixed(2)} - ${tTol.toFixed(2)}`, res: `${roundDec(res.bare.tMin, 2)} mm` });

      if (res.covered) {
        const cw = res.covered.nominalW;
        const ct = res.covered.nominalT;
        const ins = res.covered.insulation;
        const pct = res.covered.negPercent;
        const insVar = res.covered.insNegVariation;

        lines.push({ title: 'Paper Insulation Deduct', math: `${ins.toFixed(2)} × ${pct}% = ${insVar.toFixed(5)}`, res: `${roundDec(insVar, 5)} mm` });
        lines.push({ title: 'Covered Width (+ve)', math: `${cw.toFixed(2)} + ${wTol.toFixed(2)}`, res: `${roundDec(res.covered.wMax, 2)} mm` });
        lines.push({ title: 'Covered Width (-ve)', math: `${cw.toFixed(2)} - [${wTol.toFixed(2)} + ${insVar.toFixed(5)}] = ${cw.toFixed(2)} - ${roundDec(res.covered.totalWReduction, 5)}`, res: `${roundDec(res.covered.wMin, 2)} mm` });
        lines.push({ title: 'Covered Thickness (+ve)', math: `${ct.toFixed(2)} + ${tTol.toFixed(2)}`, res: `${roundDec(res.covered.tMax, 2)} mm` });
        lines.push({ title: 'Covered Thickness (-ve)', math: `${ct.toFixed(2)} - [${tTol.toFixed(2)} + ${insVar.toFixed(5)}] = ${ct.toFixed(2)} - ${roundDec(res.covered.totalTReduction, 5)}`, res: `${roundDec(res.covered.tMin, 2)} mm` });
      }
    } else {
      // Bunched Conductor Breakdown
      const cov = res.covered;
      const sInsP = res.singleStrip.sIns;
      const sInsTol = res.singleStrip.sInsTolObj ? res.singleStrip.sInsTolObj.negTolPercent : 10;
      const oInsP = cov.oIns;
      const oInsTol = cov.oInsTolObj ? cov.oInsTolObj.negTolPercent : 7.5;

      lines.push({ title: 'Single Strip Paper Deduct', math: `${sInsP} × ${sInsTol}% = ${roundDec(cov.sInsNegVar, 5)}`, res: `${roundDec(cov.sInsNegVar, 5)} mm` });
      lines.push({ title: 'Overall Covering Paper Deduct', math: `${oInsP} × ${oInsTol}% = ${roundDec(cov.oInsNegVar, 5)}`, res: `${roundDec(cov.oInsNegVar, 5)} mm` });
      lines.push({ title: 'Bare Width (+ve)', math: `${res.bare.nominalW} + ${res.bare.wTol}`, res: `${roundDec(res.bare.wMax, 2)} mm` });
      lines.push({ title: 'Bare Width (-ve)', math: `${res.bare.nominalW} - ${res.bare.wTol}`, res: `${roundDec(res.bare.wMin, 2)} mm` });
      lines.push({ title: 'Single Strip Width (+ve)', math: `${roundDec(res.singleStrip.nominalW, 2)} + ${res.bare.wTol}`, res: `${roundDec(res.singleStrip.wMax, 2)} mm` });
      lines.push({ title: 'Single Strip Width (-ve)', math: `${roundDec(res.singleStrip.nominalW, 2)} - [${res.bare.wTol} + ${roundDec(cov.sInsNegVar, 4)}]`, res: `${roundDec(res.singleStrip.wMin, 2)} mm` });
      lines.push({ title: 'Single Strip Thick (+ve)', math: `${roundDec(res.singleStrip.nominalT, 2)} + ${res.bare.tTol}`, res: `${roundDec(res.singleStrip.tMax, 2)} mm` });
      lines.push({ title: 'Single Strip Thick (-ve)', math: `${roundDec(res.singleStrip.nominalT, 2)} - [${res.bare.tTol} + ${roundDec(cov.sInsNegVar, 4)}]`, res: `${roundDec(res.singleStrip.tMin, 3)} mm` });
      const bw = res.bare.nominalW;
      lines.push({ title: 'Covered Width (+ve)', math: `(${bw.toFixed(2)} + [${sInsP.toFixed(2)} + ${oInsP.toFixed(2)}]) + ${res.bare.wTol.toFixed(2)} = ${cov.nominalW.toFixed(2)} + ${res.bare.wTol.toFixed(2)}`, res: `${roundDec(cov.wMax, 2)} mm` });
      lines.push({ title: 'Covered Width (-ve)', math: `${cov.nominalW.toFixed(2)} - [${res.bare.wTol.toFixed(2)} + (${roundDec(cov.sInsNegVar, 4)} + ${roundDec(cov.oInsNegVar, 5)})] = ${cov.nominalW.toFixed(2)} - ${roundDec(cov.wNegDeduction, 5)}`, res: `${roundDec(cov.wMin, 2)} mm` });
      lines.push({ title: 'Covered Thickness (+ve)', math: `${cov.nominalT.toFixed(2)} + [${cov.stripsThick} × ${res.bare.tTol.toFixed(2)} + (${cov.stripsThick} - 1) × ${cov.waxConstant.toFixed(2)} (wax)] = ${cov.nominalT.toFixed(2)} + ${roundDec(cov.tPosAddition, 3)}`, res: `${roundDec(cov.tMax, 2)} mm` });
      lines.push({ title: 'Covered Thickness (-ve)', math: `${cov.nominalT.toFixed(2)} - [${cov.stripsThick} × ${res.bare.tTol.toFixed(2)} + ${cov.stripsThick} × ${roundDec(cov.sInsNegVar, 4)} + ${roundDec(cov.oInsNegVar, 5)}] = ${cov.nominalT.toFixed(2)} - ${roundDec(cov.tNegDeduction, 5)}`, res: `${roundDec(cov.tMin, 4)} mm` });
    }

    formulaLinesContainer.innerHTML = lines.map(item => `
      <div class="formula-line">
        <span><strong>${item.title}:</strong> <span class="formula-math">${item.math}</span></span>
        <span class="formula-res">= ${item.res}</span>
      </div>
    `).join('');
  }

  /**
   * Shop Floor Quality Check (Go / No-Go)
   */
  function runQualityCheck() {
    if (!currentCalculation || currentCalculation.error) return;

    const mW = parseFloat(qcMeasuredW.value);
    const mT = parseFloat(qcMeasuredT.value);
    const target = qcCheckTarget.value; // 'bare' or 'covered'

    if (isNaN(mW) && isNaN(mT)) {
      qcResultBadge.className = 'qc-result-badge qc-neutral';
      qcResultBadge.textContent = 'Enter measured dimensions from micrometer/caliper above to verify';
      return;
    }

    let minW, maxW, minT, maxT;
    if (target === 'bare') {
      minW = currentCalculation.bare.wMin;
      maxW = currentCalculation.bare.wMax;
      minT = currentCalculation.bare.tMin;
      maxT = currentCalculation.bare.tMax;
    } else {
      if (!currentCalculation.covered) return;
      minW = currentCalculation.covered.wMin;
      maxW = currentCalculation.covered.wMax;
      minT = currentCalculation.covered.tMin;
      maxT = currentCalculation.covered.tMax;
    }

    let wOk = true, tOk = true;
    let errors = [];

    if (!isNaN(mW)) {
      if (mW < minW - 0.001 || mW > maxW + 0.001) {
        wOk = false;
        errors.push(`Width ${mW} mm is OUT OF SPEC (Allowed: ${roundDec(minW, 2)} - ${roundDec(maxW, 2)})`);
      }
    }

    if (!isNaN(mT)) {
      if (mT < minT - 0.001 || mT > maxT + 0.001) {
        tOk = false;
        errors.push(`Thickness ${mT} mm is OUT OF SPEC (Allowed: ${roundDec(minT, 2)} - ${roundDec(maxT, 2)})`);
      }
    }

    if (wOk && tOk) {
      qcResultBadge.className = 'qc-result-badge qc-pass';
      qcResultBadge.innerHTML = `✓ PASS: Conductor Dimensions are WITHIN TOLERANCE SPECIFICATION!`;
    } else {
      qcResultBadge.className = 'qc-result-badge qc-fail';
      qcResultBadge.innerHTML = `✗ REJECT: ${errors.join(' | ')}`;
    }
  }

  // Modal handler for viewing original notebook notes
  const modal = document.getElementById('imageModal');
  const modalImg = document.getElementById('modalImage');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');

  document.querySelectorAll('.thumb-item').forEach(item => {
    item.addEventListener('click', () => {
      const src = item.dataset.src;
      const title = item.dataset.title;
      modalImg.src = src;
      modalTitle.textContent = title;
      modal.classList.add('open');
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', () => modal.classList.remove('open'));
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  }

  // Print button
  const printBtn = document.getElementById('printBtn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  // Initial load
  applyPreset('dec2026');
});
