(() => {
  "use strict";

  const DATA = window.PAPER_DATA;
  const COLORS = {
    ink: "#112234",
    inkSoft: "#526272",
    navy: "#0d1826",
    navySoft: "#203b50",
    paper: "#f3efe6",
    white: "#fffdf8",
    grid: "rgba(17, 34, 52, 0.10)",
    gridDark: "rgba(243, 239, 230, 0.13)",
    cyan: "#67d6c9",
    cyanDeep: "#1c938c",
    coral: "#f26a53",
    coralDeep: "#b7473c",
    yellow: "#f0ce70",
    gray: "#74808b"
  };

  const dom = {
    heroCanvas: document.getElementById("hero-canvas"),
    episodeSelect: document.getElementById("episode-select"),
    rolloutCaseCode: document.getElementById("rollout-case-code"),
    rolloutCaseTitle: document.getElementById("rollout-case-title"),
    rolloutCaseCaption: document.getElementById("rollout-case-caption"),
    nativeCanvas: document.getElementById("native-rollout"),
    hadpCanvas: document.getElementById("hadp-rollout"),
    nativeResult: document.getElementById("native-result"),
    hadpResult: document.getElementById("hadp-result"),
    nativeDistance: document.getElementById("native-distance"),
    nativeScore: document.getElementById("native-score"),
    hadpDistance: document.getElementById("hadp-distance"),
    hadpScore: document.getElementById("hadp-score"),
    playRollout: document.getElementById("play-rollout"),
    playLabel: document.getElementById("play-label"),
    replayRollout: document.getElementById("replay-rollout"),
    rolloutScrub: document.getElementById("rollout-scrub"),
    frameLabel: document.getElementById("frame-label"),
    microscopeCanvas: document.getElementById("microscope-canvas"),
    weightSlider: document.getElementById("weight-slider"),
    weightValue: document.getElementById("weight-value"),
    microscopeReplay: document.getElementById("microscope-replay"),
    selectedCandidate: document.getElementById("selected-candidate"),
    selectedCandidateNote: document.getElementById("selected-candidate-note"),
    terminalScore: document.getElementById("terminal-score"),
    terminalScoreBar: document.getElementById("terminal-score-bar"),
    directionScore: document.getElementById("direction-score"),
    directionScoreBar: document.getElementById("direction-score-bar"),
    combinedScore: document.getElementById("combined-score"),
    epochSlider: document.getElementById("epoch-slider"),
    epochValue: document.getElementById("epoch-value"),
    epochDelta: document.getElementById("epoch-delta"),
    latentEquation: document.getElementById("latent-equation"),
    latentCanvas: document.getElementById("latent-canvas"),
    metricNext: document.getElementById("metric-next"),
    metricRollout: document.getElementById("metric-rollout"),
    metricStraightness: document.getElementById("metric-straightness"),
    dynamicsChart: document.getElementById("dynamics-chart"),
    dynamicsReadout: document.getElementById("dynamics-readout"),
    ldadCanvas: document.getElementById("ldad-canvas"),
    ldadRanking: document.getElementById("ldad-ranking"),
    ldadMargin: document.getElementById("ldad-margin"),
    ldadSensitivity: document.getElementById("ldad-sensitivity"),
    ldadControl: document.getElementById("ldad-control"),
    ldadRollout: document.getElementById("ldad-rollout"),
    resultsTitle: document.getElementById("results-title"),
    resultsTable: document.getElementById("results-table"),
    resultsInsight: document.getElementById("results-insight"),
    galleryGrid: document.getElementById("gallery-grid"),
    figureContextCopy: document.getElementById("figure-context-copy")
  };

  const state = {
    horizon: 100,
    caseId: DATA.rolloutCases[0].id,
    frame: 0,
    playing: false,
    plannerMode: "hadp",
    lambda: 2,
    microscopePlaying: false,
    microscopeCursor: 0,
    microscopeClock: 0,
    dynamicsModel: "residual",
    ldadModel: "ldad",
    epoch: 1,
    resultsTab: "headline",
    galleryFilter: "all",
    raf: 0,
    lastRolloutTick: 0,
    lastMicroscopeTick: 0
  };

  function clamp(value, low, high) {
    return Math.max(low, Math.min(high, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpPoint(a, b, t) {
    return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
  }

  function format(value, digits = 3) {
    return Number(value).toFixed(digits);
  }

  function signed(value, digits = 3) {
    const sign = value < 0 ? "−" : "+";
    return `${sign}${Math.abs(value).toFixed(digits)}`;
  }

  function getCurrentCase() {
    return DATA.rolloutCases.find((item) => item.id === state.caseId) || DATA.rolloutCases[0];
  }

  function getCanvas(canvas) {
    const baseWidth = Number(canvas.getAttribute("width")) || 640;
    const baseHeight = Number(canvas.getAttribute("height")) || 360;
    const width = Math.max(240, Math.round(canvas.clientWidth || baseWidth));
    const height = Math.round(width * (baseHeight / baseWidth));
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      canvas.style.height = `${height}px`;
    }
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    return { context, width, height };
  }

  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function drawArrow(context, x1, y1, x2, y2, color, width = 2, dashed = false) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const head = 7 + width;
    context.save();
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = width;
    context.setLineDash(dashed ? [5, 5] : []);
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.setLineDash([]);
    context.beginPath();
    context.moveTo(x2, y2);
    context.lineTo(x2 - head * Math.cos(angle - Math.PI / 6), y2 - head * Math.sin(angle - Math.PI / 6));
    context.lineTo(x2 - head * Math.cos(angle + Math.PI / 6), y2 - head * Math.sin(angle + Math.PI / 6));
    context.closePath();
    context.fill();
    context.restore();
  }

  function boardPoint(point, width, height, padding = 28) {
    return {
      x: padding + point.x * (width - padding * 2),
      y: padding + point.y * (height - padding * 2)
    };
  }

  function drawT(context, x, y, angle, scale, fill, alpha = 1, outline = null) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.globalAlpha = alpha;
    if (outline) {
      context.strokeStyle = outline;
      context.lineWidth = 2;
      context.setLineDash([4, 4]);
      roundedRect(context, -23 * scale, -10 * scale, 46 * scale, 20 * scale, 5 * scale);
      context.stroke();
      roundedRect(context, -8 * scale, -29 * scale, 16 * scale, 58 * scale, 5 * scale);
      context.stroke();
    } else {
      context.fillStyle = fill;
      roundedRect(context, -23 * scale, -10 * scale, 46 * scale, 20 * scale, 5 * scale);
      context.fill();
      roundedRect(context, -8 * scale, -29 * scale, 16 * scale, 58 * scale, 5 * scale);
      context.fill();
    }
    context.restore();
  }

  function drawPusher(context, x, y, angle, color, scale = 1) {
    context.save();
    context.translate(x, y);
    context.rotate(angle);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, 10 * scale, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = COLORS.white;
    context.lineWidth = 2.5 * scale;
    context.beginPath();
    context.moveTo(0, 0);
    context.lineTo(19 * scale, 0);
    context.stroke();
    context.restore();
  }

  function makeTrace(item, planner) {
    const curve = planner === "native" ? item.nativeCurve : item.hadpCurve;
    const drift = planner === "native" ? item.nativeDrift : item.hadpDrift;
    const angleOffset = planner === "native" ? item.nativeAngle : item.hadpAngle;
    const result = item.outcomes[state.horizon][planner];
    const trace = [];
    for (let index = 0; index < DATA.rolloutFrames; index += 1) {
      const t = index / (DATA.rolloutFrames - 1);
      const bend = Math.sin(Math.PI * t) * curve;
      const directionX = item.goal.x - item.initial.x;
      const directionY = item.goal.y - item.initial.y;
      let x = item.initial.x + directionX * t + bend * (0.42 + 0.18 * Math.sin(item.phase));
      let y = item.initial.y + directionY * t + bend * (0.5 + 0.16 * Math.cos(item.phase));
      if (t > 0.62) {
        const failureT = (t - 0.62) / 0.38;
        const failureSign = Math.sin(item.phase * 1.7) > 0 ? 1 : -1;
        const orbit = Math.sin(failureT * Math.PI * 2.2 + item.phase) * drift * 0.5;
        x += failureSign * drift * failureT * 0.66 + orbit;
        y += drift * failureT * (planner === "native" ? -0.24 : 0.28) - orbit * 0.62;
      }
      const nextT = Math.min(1, t + 1 / (DATA.rolloutFrames - 1));
      const nextBend = Math.sin(Math.PI * nextT) * curve;
      const nextX = item.initial.x + directionX * nextT + nextBend * (0.42 + 0.18 * Math.sin(item.phase));
      const nextY = item.initial.y + directionY * nextT + nextBend * (0.5 + 0.16 * Math.cos(item.phase));
      trace.push({ x: clamp(x, 0.04, 0.96), y: clamp(y, 0.05, 0.94), angle: Math.atan2(nextY - y, nextX - x) + angleOffset });
    }
    return trace;
  }

  function drawBoard(context, width, height, item, planner, frame, dark = false) {
    const trace = makeTrace(item, planner);
    const currentIndex = clamp(Math.round((frame / (DATA.rolloutFrames - 1)) * (trace.length - 1)), 0, trace.length - 1);
    const current = trace[currentIndex];
    const result = item.outcomes[state.horizon][planner];
    const pad = dark ? 38 : 28;
    const field = { x: pad, y: pad, width: width - pad * 2, height: height - pad * 2 };
    const colors = dark
      ? { field: "rgba(32, 59, 80, 0.38)", stroke: "rgba(243, 239, 230, 0.14)", grid: COLORS.gridDark, trail: planner === "hadp" ? COLORS.cyan : "#91a0ad", text: "rgba(243, 239, 230, 0.66)" }
      : { field: "#edf2ee", stroke: "rgba(17, 34, 52, 0.14)", grid: COLORS.grid, trail: planner === "hadp" ? COLORS.cyanDeep : COLORS.gray, text: COLORS.inkSoft };

    context.fillStyle = dark ? COLORS.navy : "#e8efea";
    context.fillRect(0, 0, width, height);
    context.fillStyle = colors.field;
    roundedRect(context, field.x, field.y, field.width, field.height, 15);
    context.fill();
    context.save();
    context.beginPath();
    roundedRect(context, field.x, field.y, field.width, field.height, 15);
    context.clip();
    context.strokeStyle = colors.grid;
    context.lineWidth = 1;
    for (let i = 1; i < 7; i += 1) {
      const x = field.x + (field.width * i) / 7;
      const y = field.y + (field.height * i) / 7;
      context.beginPath();
      context.moveTo(x, field.y);
      context.lineTo(x, field.y + field.height);
      context.stroke();
      context.beginPath();
      context.moveTo(field.x, y);
      context.lineTo(field.x + field.width, y);
      context.stroke();
    }
    context.restore();
    context.strokeStyle = colors.stroke;
    context.lineWidth = 1;
    roundedRect(context, field.x, field.y, field.width, field.height, 15);
    context.stroke();

    const start = boardPoint(item.initial, width, height, pad);
    const target = boardPoint(item.goal, width, height, pad);
    const currentPoint = boardPoint(current, width, height, pad);
    const objectScale = Math.max(0.52, Math.min(0.78, width / 640));

    context.save();
    context.strokeStyle = dark ? "rgba(240, 206, 112, 0.55)" : "rgba(166, 126, 27, 0.65)";
    context.lineWidth = 1;
    context.setLineDash([5, 5]);
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(target.x, target.y);
    context.stroke();
    context.restore();

    drawT(context, target.x, target.y, -0.08, objectScale, COLORS.yellow, 0.95, dark ? COLORS.yellow : "#b38a22");

    context.save();
    context.strokeStyle = colors.trail;
    context.lineWidth = dark ? 3.4 : 3;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    trace.slice(0, currentIndex + 1).forEach((point, index) => {
      const mapped = boardPoint(point, width, height, pad);
      if (index === 0) context.moveTo(mapped.x, mapped.y);
      else context.lineTo(mapped.x, mapped.y);
    });
    context.stroke();
    context.restore();

    const nextPoints = [];
    for (let i = 1; i <= 6; i += 1) {
      nextPoints.push(trace[Math.min(trace.length - 1, currentIndex + i * 2)]);
    }
    nextPoints.forEach((point, index) => {
      const from = index === 0 ? currentPoint : boardPoint(nextPoints[index - 1], width, height, pad);
      const to = boardPoint(point, width, height, pad);
      drawArrow(context, from.x, from.y, to.x, to.y, dark ? "rgba(242, 106, 83, 0.72)" : "rgba(183, 71, 60, 0.65)", index === 0 ? 2.2 : 1.4, index > 1);
    });

    const pusherOffset = { x: Math.cos(current.angle) * 0.08, y: Math.sin(current.angle) * 0.08 };
    const pusher = boardPoint({ x: current.x + pusherOffset.x, y: current.y + pusherOffset.y }, width, height, pad);
    drawT(context, currentPoint.x, currentPoint.y, current.angle * 0.14, objectScale, planner === "hadp" ? COLORS.cyanDeep : COLORS.gray, 0.98);
    drawPusher(context, pusher.x, pusher.y, current.angle, dark ? COLORS.cyan : COLORS.coral, objectScale);

    context.fillStyle = dark ? COLORS.cyan : COLORS.cyanDeep;
    context.beginPath();
    context.arc(start.x, start.y, 4, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = colors.text;
    context.font = `700 ${Math.max(9, width / 72)}px ${getComputedStyle(document.body).fontFamily}`;
    context.fillText("initial", start.x - 16, start.y + 25);
    context.fillStyle = dark ? COLORS.yellow : "#97741b";
    context.fillText("target", target.x - 16, target.y - 34);

    const status = frame >= DATA.rolloutFrames - 2 ? (result.success ? "SUCCESS" : "MISS") : "IN PROGRESS";
    context.fillStyle = dark ? "rgba(243, 239, 230, 0.65)" : COLORS.inkSoft;
    context.font = `800 ${Math.max(9, width / 76)}px ${getComputedStyle(document.body).fontFamily}`;
    context.fillText(`frame ${currentIndex + 1} / ${DATA.rolloutFrames}`, field.x + 12, field.y + 18);
    context.textAlign = "right";
    context.fillStyle = status === "SUCCESS" ? (dark ? COLORS.cyan : COLORS.cyanDeep) : status === "MISS" ? COLORS.coral : colors.text;
    context.fillText(status, field.x + field.width - 12, field.y + 18);
    context.textAlign = "left";
    context.fillStyle = colors.text;
    context.font = `600 ${Math.max(8, width / 84)}px ${getComputedStyle(document.body).fontFamily}`;
    context.fillText(`decision step ${item.outcomes[state.horizon][planner].step}`, field.x + 12, field.y + field.height - 12);
  }

  function drawHero() {
    const { context, width, height } = getCanvas(dom.heroCanvas);
    const item = getCurrentCase();
    context.fillStyle = COLORS.navy;
    context.fillRect(0, 0, width, height);
    const pad = 25;
    const field = { x: pad, y: 15, width: width - pad * 2, height: height - 45 };
    context.strokeStyle = COLORS.gridDark;
    context.lineWidth = 1;
    for (let i = 0; i <= 7; i += 1) {
      const x = field.x + (field.width * i) / 7;
      context.beginPath();
      context.moveTo(x, field.y);
      context.lineTo(x, field.y + field.height);
      context.stroke();
    }
    for (let i = 0; i <= 4; i += 1) {
      const y = field.y + (field.height * i) / 4;
      context.beginPath();
      context.moveTo(field.x, y);
      context.lineTo(field.x + field.width, y);
      context.stroke();
    }
    ["native", "hadp"].forEach((planner) => {
      const trace = makeTrace(item, planner);
      context.save();
      context.strokeStyle = planner === "hadp" ? COLORS.cyan : "rgba(243, 239, 230, 0.54)";
      context.lineWidth = planner === "hadp" ? 3 : 1.7;
      context.lineCap = "round";
      context.beginPath();
      trace.forEach((point, index) => {
        const mapped = boardPoint(point, width, height - 25, pad);
        if (index === 0) context.moveTo(mapped.x, mapped.y);
        else context.lineTo(mapped.x, mapped.y);
      });
      context.stroke();
      context.restore();
    });
    const target = boardPoint(item.goal, width, height - 25, pad);
    const start = boardPoint(item.initial, width, height - 25, pad);
    drawT(context, target.x, target.y, -0.08, 0.56, COLORS.yellow, 1, COLORS.yellow);
    context.fillStyle = COLORS.cyan;
    context.beginPath();
    context.arc(start.x, start.y, 4, 0, Math.PI * 2);
    context.fill();
    const candidatePoints = [
      { x: 0.45, y: 0.45 }, { x: 0.61, y: 0.38 }, { x: 0.72, y: 0.55 }, { x: 0.77, y: 0.29 }, { x: 0.55, y: 0.66 }
    ];
    candidatePoints.forEach((point, index) => {
      const mapped = boardPoint(point, width, height - 25, pad);
      context.fillStyle = index === 3 ? COLORS.coral : "rgba(240, 206, 112, 0.78)";
      context.beginPath();
      context.arc(mapped.x, mapped.y, index === 3 ? 5 : 3, 0, Math.PI * 2);
      context.fill();
    });
    context.fillStyle = "rgba(243, 239, 230, 0.55)";
    context.font = `700 ${Math.max(9, width / 67)}px ${getComputedStyle(document.body).fontFamily}`;
    context.fillText("possible future states", 22, height - 12);
    context.textAlign = "right";
    context.fillStyle = COLORS.cyan;
    context.fillText("HADP route", width - 22, 24);
    context.textAlign = "left";
  }

  function updateHorizonButtons() {
    document.querySelectorAll("[data-horizon]").forEach((button) => {
      button.classList.toggle("is-active", Number(button.dataset.horizon) === state.horizon);
    });
  }

  function setHorizon(value) {
    state.horizon = Number(value);
    state.lambda = state.horizon === 100 ? 2 : 1;
    dom.weightSlider.value = String(state.lambda);
    updateHorizonButtons();
    renderRollout();
    renderMicroscope();
    renderGallery();
  }

  function renderEpisodeOptions() {
    dom.episodeSelect.innerHTML = "";
    DATA.rolloutCases.forEach((item, index) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `Case ${index + 1} · ${item.label} · ${item.title}`;
      dom.episodeSelect.appendChild(option);
    });
    dom.episodeSelect.value = state.caseId;
  }

  function updateResultPill(element, success) {
    element.textContent = success ? "SUCCESS" : "FAIL";
    element.classList.toggle("result-pill-success", success);
    element.classList.toggle("result-pill-muted", !success);
  }

  function renderRollout() {
    const item = getCurrentCase();
    const outcome = item.outcomes[state.horizon];
    dom.episodeSelect.value = item.id;
    dom.rolloutCaseCode.textContent = `CASE ${item.label.toUpperCase()} · SEED ${item.seed} · H${state.horizon}`;
    dom.rolloutCaseTitle.textContent = item.title;
    dom.rolloutCaseCaption.textContent = item.caption;
    updateResultPill(dom.nativeResult, outcome.native.success);
    updateResultPill(dom.hadpResult, outcome.hadp.success);
    dom.nativeDistance.textContent = format(outcome.native.distance, 2);
    dom.nativeScore.textContent = format(outcome.native.score, 2);
    dom.hadpDistance.textContent = format(outcome.hadp.distance, 2);
    dom.hadpScore.textContent = format(outcome.hadp.score, 2);
    dom.rolloutScrub.value = String(state.frame);
    dom.frameLabel.textContent = `frame ${state.frame + 1} / ${DATA.rolloutFrames}`;
    dom.playLabel.textContent = state.playing ? "Pause" : "Play";
    dom.playRollout.querySelector(".play-icon").textContent = state.playing ? "Ⅱ" : "▶";
    const nativeContext = getCanvas(dom.nativeCanvas);
    drawBoard(nativeContext.context, nativeContext.width, nativeContext.height, item, "native", state.frame);
    const hadpContext = getCanvas(dom.hadpCanvas);
    drawBoard(hadpContext.context, hadpContext.width, hadpContext.height, item, "hadp", state.frame);
    drawHero();
  }

  function renderMicroscope() {
    const candidates = DATA.microscopeCandidates;
    const nativeWinner = candidates.reduce((best, current) => current.distance < best.distance ? current : best, candidates[0]);
    const scored = candidates.map((candidate) => ({ candidate, score: candidate.distance + state.lambda * candidate.direction }));
    const hadpWinner = scored.reduce((best, current) => current.score < best.score ? current : best, scored[0]);
    const selected = state.plannerMode === "native" ? nativeWinner : hadpWinner.candidate;
    const combined = state.plannerMode === "native" ? selected.distance : selected.distance + state.lambda * selected.direction;
    dom.weightValue.textContent = state.lambda.toFixed(1);
    dom.selectedCandidate.textContent = `Plan ${selected.id.replace(/^C0?/, "")}`;
    dom.selectedCandidateNote.textContent = state.plannerMode === "native" ? "distance only" : "HADP adds goal direction";
    dom.terminalScore.textContent = format(selected.distance, 2);
    dom.directionScore.textContent = format(selected.direction, 2);
    dom.combinedScore.textContent = format(combined, 2);
    dom.terminalScoreBar.style.width = `${clamp(selected.distance / 0.5, 0.08, 1) * 100}%`;
    dom.directionScoreBar.style.width = `${clamp(selected.direction / 0.35, 0.08, 1) * 100}%`;
    document.querySelectorAll("[data-planner-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.plannerMode === state.plannerMode));
    const { context, width, height } = getCanvas(dom.microscopeCanvas);
    drawMicroscope(context, width, height, selected, nativeWinner, hadpWinner.candidate);
  }

  function drawMicroscope(context, width, height, selected, nativeWinner, hadpWinner) {
    context.fillStyle = COLORS.white;
    context.fillRect(0, 0, width, height);
    const plot = { x: 54, y: 36, width: width - 84, height: height - 88 };
    context.fillStyle = "#f5f5ef";
    roundedRect(context, plot.x, plot.y, plot.width, plot.height, 14);
    context.fill();
    context.strokeStyle = COLORS.grid;
    context.lineWidth = 1;
    for (let i = 1; i < 6; i += 1) {
      const x = plot.x + (plot.width * i) / 6;
      const y = plot.y + (plot.height * i) / 6;
      context.beginPath();
      context.moveTo(x, plot.y);
      context.lineTo(x, plot.y + plot.height);
      context.stroke();
      context.beginPath();
      context.moveTo(plot.x, y);
      context.lineTo(plot.x + plot.width, y);
      context.stroke();
    }
    const world = (point) => ({ x: plot.x + point.x * plot.width, y: plot.y + point.y * plot.height });
    const current = world({ x: 0.18, y: 0.72 });
    const goal = world({ x: 0.82, y: 0.27 });
    drawArrow(context, current.x, current.y, goal.x, goal.y, "rgba(166, 126, 27, 0.78)", 2, true);
    context.fillStyle = COLORS.cyanDeep;
    context.beginPath();
    context.arc(current.x, current.y, 8, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = COLORS.white;
    context.beginPath();
    context.arc(current.x, current.y, 3, 0, Math.PI * 2);
    context.fill();
    drawT(context, goal.x, goal.y, -0.08, 0.62, COLORS.yellow, 1, "#b38a22");
    context.font = `800 ${Math.max(10, width / 76)}px ${getComputedStyle(document.body).fontFamily}`;
    context.fillStyle = COLORS.inkSoft;
    context.fillText("current state", current.x - 35, current.y + 28);
    context.fillStyle = "#97741b";
    context.fillText("goal state", goal.x - 28, goal.y - 38);

    DATA.microscopeCandidates.forEach((candidate, index) => {
      const point = world(candidate);
      const score = candidate.distance + state.lambda * candidate.direction;
      const isSelected = candidate.id === selected.id;
      const isNative = candidate.id === nativeWinner.id;
      const isHadp = candidate.id === hadpWinner.id;
      const isRevealed = !state.microscopePlaying || index <= state.microscopeCursor;
      context.save();
      context.globalAlpha = isRevealed ? 1 : 0.25;
      context.strokeStyle = isSelected ? COLORS.coral : "rgba(82, 98, 114, 0.2)";
      context.lineWidth = isSelected ? 2.5 : 1;
      context.setLineDash(isSelected ? [] : [3, 4]);
      context.beginPath();
      context.moveTo(current.x, current.y);
      context.lineTo(point.x, point.y);
      context.stroke();
      context.setLineDash([]);
      if (isSelected) {
        context.strokeStyle = COLORS.coral;
        context.lineWidth = 2;
        context.beginPath();
        context.arc(point.x, point.y, 12 + Math.sin(Date.now() / 180) * 2, 0, Math.PI * 2);
        context.stroke();
      }
      context.fillStyle = isSelected ? COLORS.coral : isHadp ? COLORS.cyanDeep : isNative ? COLORS.gray : "#9ca7ac";
      context.beginPath();
      context.arc(point.x, point.y, isSelected ? 7 : 5, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = isSelected ? COLORS.coralDeep : COLORS.inkSoft;
      context.font = `800 ${Math.max(9, width / 86)}px ${getComputedStyle(document.body).fontFamily}`;
      context.fillText(`Plan ${index + 1}`, point.x + 9, point.y - 8);
      context.fillStyle = COLORS.inkSoft;
      context.font = `600 ${Math.max(8, width / 101)}px ${getComputedStyle(document.body).fontFamily}`;
      context.fillText(state.plannerMode === "native" ? format(candidate.distance, 2) : format(score, 2), point.x + 9, point.y + 7);
      context.restore();
    });
    context.fillStyle = COLORS.inkSoft;
    context.font = `800 ${Math.max(9, width / 84)}px ${getComputedStyle(document.body).fontFamily}`;
    context.fillText(state.plannerMode === "native" ? "distance only" : `distance + ${state.lambda.toFixed(1)} × goal direction`, plot.x, height - 24);
  }

  function renderDynamics() {
    const record = DATA.trainingDynamics[state.epoch - 1];
    const model = record[state.dynamicsModel];
    const direct = record.direct;
    const residual = record.residual;
    const rolloutDelta = residual.rollout - direct.rollout;
    const straightnessDelta = residual.straightness - direct.straightness;
    dom.epochSlider.value = String(state.epoch);
    dom.epochValue.textContent = String(state.epoch);
    dom.metricNext.textContent = format(model.next, 4);
    dom.metricRollout.textContent = format(model.rollout, 4);
    dom.metricStraightness.textContent = format(model.straightness, 3);
    dom.epochDelta.textContent = `${signed(rolloutDelta, 3)} long-run error`;
    dom.dynamicsReadout.textContent = `At pass ${state.epoch}, residual prediction changes long-run error by ${signed(rolloutDelta, 3)} and path straightness by ${signed(straightnessDelta, 3)} relative to direct prediction. Across passes 1–10, validation prediction AUC is 0.00753 for RLD vs 0.00979 for direct prediction.`;
    if (state.dynamicsModel === "residual") {
      dom.latentEquation.innerHTML = "<span>ẑ<sub>t+1</sub></span><b>=</b><span>z<sub>t</sub></span><b>+</b><span class=\"equation-accent\">Δẑ<sub>t</sub></span>";
    } else {
      dom.latentEquation.innerHTML = "<span>ẑ<sub>t+1</sub></span><b>=</b><span class=\"equation-accent\">f(z<sub>t</sub>, a<sub>t</sub>)</span>";
    }
    document.querySelectorAll("[data-dynamics-model]").forEach((button) => button.classList.toggle("is-active", button.dataset.dynamicsModel === state.dynamicsModel));
    const latent = getCanvas(dom.latentCanvas);
    drawLatent(latent.context, latent.width, latent.height, record, state.dynamicsModel);
    const chart = getCanvas(dom.dynamicsChart);
    drawDynamicsChart(chart.context, chart.width, chart.height);
  }

  function makeLatentPath(start, goal, bend, count = 9) {
    const path = [];
    for (let index = 0; index < count; index += 1) {
      const t = index / (count - 1);
      path.push({ x: start.x + (goal.x - start.x) * t + Math.sin(Math.PI * t) * bend, y: start.y + (goal.y - start.y) * t + Math.sin(Math.PI * t) * bend * 0.52 });
    }
    return path;
  }

  function drawLatent(context, width, height, record, model) {
    context.fillStyle = COLORS.white;
    context.fillRect(0, 0, width, height);
    const plot = { x: 42, y: 32, width: width - 74, height: height - 75 };
    context.strokeStyle = COLORS.grid;
    context.lineWidth = 1;
    for (let i = 1; i < 7; i += 1) {
      const x = plot.x + (plot.width * i) / 7;
      const y = plot.y + (plot.height * i) / 6;
      context.beginPath();
      context.moveTo(x, plot.y);
      context.lineTo(x, plot.y + plot.height);
      context.stroke();
      context.beginPath();
      context.moveTo(plot.x, y);
      context.lineTo(plot.x + plot.width, y);
      context.stroke();
    }
    const map = (point) => ({ x: plot.x + point.x * plot.width, y: plot.y + point.y * plot.height });
    const start = { x: 0.15, y: 0.74 };
    const goal = { x: 0.84, y: 0.28 };
    const quality = clamp(1 - record[model].next / 0.032, 0.12, 0.96);
    const targetPath = makeLatentPath(start, goal, 0.02, 9);
    const encodedPath = makeLatentPath(start, goal, 0.08 - quality * 0.035, 9).map((point, index) => ({ x: point.x + Math.sin(index * 1.7) * 0.006, y: point.y + Math.cos(index * 1.25) * 0.006 }));
    const predictionBend = model === "residual" ? 0.09 - quality * 0.065 : 0.16 - quality * 0.09;
    const predictedPath = makeLatentPath(start, goal, predictionBend, 9);
    const drawPath = (path, color, lineWidth, dashed = false) => {
      context.save();
      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.setLineDash(dashed ? [6, 6] : []);
      context.beginPath();
      path.forEach((point, index) => {
        const mapped = map(point);
        if (index === 0) context.moveTo(mapped.x, mapped.y);
        else context.lineTo(mapped.x, mapped.y);
      });
      context.stroke();
      context.restore();
    };
    drawPath(targetPath, "rgba(166, 126, 27, 0.72)", 2, true);
    drawPath(encodedPath, COLORS.cyanDeep, 3.2);
    drawPath(predictedPath, model === "residual" ? COLORS.coral : COLORS.gray, 3.2);
    targetPath.forEach((point, index) => {
      const mapped = map(point);
      context.fillStyle = "rgba(166, 126, 27, 0.52)";
      context.beginPath();
      context.arc(mapped.x, mapped.y, 3, 0, Math.PI * 2);
      context.fill();
      if (index % 2 === 0) {
        const encoded = map(encodedPath[index]);
        context.fillStyle = COLORS.cyanDeep;
        context.beginPath();
        context.arc(encoded.x, encoded.y, 3.5, 0, Math.PI * 2);
        context.fill();
        const predicted = map(predictedPath[index]);
        context.fillStyle = model === "residual" ? COLORS.coral : COLORS.gray;
        context.beginPath();
        context.arc(predicted.x, predicted.y, 3.5, 0, Math.PI * 2);
        context.fill();
      }
    });
    const currentIndex = 3;
    const current = map(predictedPath[currentIndex]);
    const next = map(predictedPath[currentIndex + 1]);
    const encodedNext = map(targetPath[currentIndex + 1]);
    drawArrow(context, current.x, current.y, next.x, next.y, COLORS.coral, 2.3);
    if (model === "residual") {
      context.fillStyle = COLORS.coralDeep;
      context.font = `800 ${Math.max(10, width / 65)}px ${getComputedStyle(document.body).fontFamily}`;
      context.fillText("Δẑt", next.x + 10, next.y - 10);
      context.strokeStyle = "rgba(242, 106, 83, 0.25)";
      context.lineWidth = 1;
      context.setLineDash([3, 3]);
      context.beginPath();
      context.moveTo(current.x, current.y);
      context.lineTo(encodedNext.x, encodedNext.y);
      context.stroke();
      context.setLineDash([]);
    } else {
      context.fillStyle = COLORS.gray;
      context.font = `800 ${Math.max(10, width / 65)}px ${getComputedStyle(document.body).fontFamily}`;
      context.fillText("ẑt+1", next.x + 10, next.y - 10);
    }
    const legendY = height - 24;
    const legends = [
      [COLORS.cyanDeep, "observed path"],
      [model === "residual" ? COLORS.coral : COLORS.gray, "model path"],
      ["rgba(166, 126, 27, 0.72)", "target path"]
    ];
    let legendX = plot.x;
    legends.forEach(([color, label]) => {
      context.strokeStyle = color;
      context.lineWidth = 2.5;
      context.setLineDash(label === "target path" ? [4, 4] : []);
      context.beginPath();
      context.moveTo(legendX, legendY);
      context.lineTo(legendX + 19, legendY);
      context.stroke();
      context.setLineDash([]);
      context.fillStyle = COLORS.inkSoft;
      context.font = `600 ${Math.max(9, width / 92)}px ${getComputedStyle(document.body).fontFamily}`;
      context.fillText(label, legendX + 26, legendY + 3);
      legendX += label.length * 5.5 + 66;
    });
  }

  function drawDynamicsChart(context, width, height) {
    context.fillStyle = COLORS.white;
    context.fillRect(0, 0, width, height);
    const plot = { x: 40, y: 20, width: width - 55, height: height - 53 };
    const minY = 0.45;
    const maxY = 1.05;
    const mapX = (epoch) => plot.x + ((epoch - 1) / 9) * plot.width;
    const mapY = (value) => plot.y + (1 - (value - minY) / (maxY - minY)) * plot.height;
    context.strokeStyle = COLORS.grid;
    context.lineWidth = 1;
    [0.5, 0.7, 0.9, 1.0].forEach((value) => {
      const y = mapY(value);
      context.beginPath();
      context.moveTo(plot.x, y);
      context.lineTo(plot.x + plot.width, y);
      context.stroke();
      context.fillStyle = COLORS.inkSoft;
      context.font = `600 ${Math.max(8, width / 78)}px ${getComputedStyle(document.body).fontFamily}`;
      context.fillText(value.toFixed(1), 3, y + 3);
    });
    const drawSeries = (model, color) => {
      context.save();
      context.strokeStyle = color;
      context.lineWidth = 2.4;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.beginPath();
      DATA.trainingDynamics.forEach((record, index) => {
        const x = mapX(record.epoch);
        const y = mapY(record[model].rollout);
        if (index === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      });
      context.stroke();
      DATA.trainingDynamics.forEach((record) => {
        const x = mapX(record.epoch);
        const y = mapY(record[model].rollout);
        context.fillStyle = color;
        context.beginPath();
        context.arc(x, y, record.epoch === state.epoch ? 5 : 3.3, 0, Math.PI * 2);
        context.fill();
        if (record.epoch === state.epoch) {
          context.strokeStyle = COLORS.white;
          context.lineWidth = 2;
          context.stroke();
        }
      });
      context.restore();
    };
    drawSeries("direct", COLORS.gray);
    drawSeries("residual", COLORS.coral);
    context.fillStyle = COLORS.inkSoft;
    context.font = `600 ${Math.max(8, width / 78)}px ${getComputedStyle(document.body).fontFamily}`;
    context.fillText("lower is better", plot.x, height - 10);
    context.textAlign = "right";
    context.fillText("pass 10", plot.x + plot.width, height - 10);
    context.textAlign = "left";
  }

  function renderLdad() {
    const metrics = DATA.figureMetrics.rldActionAwareness;
    const ldad = state.ldadModel === "ldad";
    dom.ldadRanking.textContent = ldad ? metrics.rankingAccuracy.ldad : metrics.rankingAccuracy.rld;
    dom.ldadMargin.textContent = ldad ? metrics.margin.ldad : metrics.margin.rld;
    dom.ldadSensitivity.textContent = ldad ? metrics.sensitivity.ldad : metrics.sensitivity.rld;
    dom.ldadControl.textContent = ldad ? metrics.control.ldad : metrics.control.rld;
    dom.ldadRollout.textContent = ldad ? metrics.rolloutAuc.ldad : metrics.rolloutAuc.rld;
    document.querySelectorAll("[data-ldad-model]").forEach((button) => button.classList.toggle("is-active", button.dataset.ldadModel === state.ldadModel));
    const canvas = getCanvas(dom.ldadCanvas);
    drawLdad(canvas.context, canvas.width, canvas.height, ldad);
  }

  function drawLdad(context, width, height, ldadEnabled) {
    context.fillStyle = COLORS.white;
    context.fillRect(0, 0, width, height);
    const fontFamily = getComputedStyle(document.body).fontFamily;
    const latentA = { x: width * 0.16, y: height * 0.48 };
    const latentB = { x: width * 0.38, y: height * 0.48 };
    const decoder = { x: width * 0.58, y: height * 0.48 };
    const action = { x: width * 0.84, y: height * 0.48 };
    const circle = (point, label, sublabel, fill, stroke) => {
      context.fillStyle = fill;
      context.strokeStyle = stroke;
      context.lineWidth = 2;
      context.beginPath();
      context.arc(point.x, point.y, Math.min(42, width * 0.055), 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = COLORS.ink;
      context.font = `700 ${Math.max(11, width / 60)}px ${fontFamily}`;
      context.textAlign = "center";
      context.fillText(label, point.x, point.y + 4);
      context.fillStyle = COLORS.inkSoft;
      context.font = `600 ${Math.max(9, width / 90)}px ${fontFamily}`;
      context.fillText(sublabel, point.x, point.y + 63);
      context.textAlign = "left";
    };
    circle(latentA, "zₜ", "current state", "rgba(103, 214, 201, 0.24)", COLORS.cyanDeep);
    circle(latentB, "zₜ₊₁", "next state", "rgba(240, 206, 112, 0.25)", "#b38a22");
    drawArrow(context, latentA.x + 44, latentA.y, latentB.x - 44, latentB.y, COLORS.coral, 3);
    context.fillStyle = COLORS.coralDeep;
    context.font = `800 ${Math.max(10, width / 72)}px ${fontFamily}`;
    context.textAlign = "center";
    context.fillText("dₜ = zₜ₊₁ − zₜ", (latentA.x + latentB.x) / 2, latentA.y - 26);
    context.textAlign = "left";

    context.fillStyle = "rgba(242, 106, 83, 0.10)";
    context.strokeStyle = "rgba(183, 71, 60, 0.40)";
    context.lineWidth = 1.5;
    roundedRect(context, decoder.x - 68, decoder.y - 38, 136, 76, 12);
    context.fill();
    context.stroke();
    context.fillStyle = COLORS.coralDeep;
    context.font = `800 ${Math.max(11, width / 65)}px ${fontFamily}`;
    context.textAlign = "center";
    context.fillText("action helper", decoder.x, decoder.y - 3);
    context.fillStyle = COLORS.inkSoft;
    context.font = `600 ${Math.max(9, width / 90)}px ${fontFamily}`;
    context.fillText("Dψ(dₜ) → âₜ", decoder.x, decoder.y + 20);
    context.textAlign = "left";
    drawArrow(context, latentB.x + 45, latentB.y, decoder.x - 72, decoder.y, COLORS.coral, 2.3);
    drawArrow(context, decoder.x + 72, decoder.y, action.x - 40, action.y, ldadEnabled ? COLORS.cyanDeep : "rgba(82, 98, 114, 0.35)", 2.3);

    context.fillStyle = ldadEnabled ? COLORS.cyanDeep : COLORS.inkSoft;
    context.beginPath();
    context.arc(action.x, action.y, 7, 0, Math.PI * 2);
    context.fill();
    const actionArrows = [
      { dx: 46, dy: -31 },
      { dx: 55, dy: 2 },
      { dx: 40, dy: 34 }
    ];
    actionArrows.forEach((arrow, index) => {
      const color = ldadEnabled ? [COLORS.cyanDeep, COLORS.coral, "#97741b"][index] : "rgba(82, 98, 114, 0.32)";
      drawArrow(context, action.x, action.y, action.x + arrow.dx, action.y + arrow.dy, color, 2);
    });
    context.fillStyle = ldadEnabled ? COLORS.cyanDeep : COLORS.inkSoft;
    context.font = `700 ${Math.max(10, width / 74)}px ${fontFamily}`;
    context.textAlign = "center";
    context.fillText(ldadEnabled ? "action-separated changes" : "less separated changes", action.x, action.y + 67);
    context.textAlign = "left";

    context.fillStyle = ldadEnabled ? "rgba(28, 147, 140, 0.12)" : "rgba(82, 98, 114, 0.10)";
    roundedRect(context, width * 0.29, height - 57, width * 0.42, 28, 14);
    context.fill();
    context.fillStyle = ldadEnabled ? COLORS.cyanDeep : COLORS.inkSoft;
    context.font = `800 ${Math.max(9, width / 86)}px ${fontFamily}`;
    context.textAlign = "center";
    context.fillText("training only · helper removed before planning", width * 0.50, height - 39);
    context.textAlign = "left";
  }

  function renderResults() {
    const result = DATA.quantitative[state.resultsTab];
    dom.resultsTitle.textContent = result.title;
    const header = result.columns.map((column) => `<th scope="col">${column}</th>`).join("");
    const rows = result.rows.map((row) => `<tr class="${row.kind}"><th scope="row">${row.label}</th>${row.values.map((value) => `<td>${value}</td>`).join("")}</tr>`).join("");
    dom.resultsTable.innerHTML = `<table class="results-table"><thead><tr><th scope="col">Condition</th>${header}</tr></thead><tbody>${rows}</tbody></table>`;
    dom.resultsInsight.innerHTML = `<span>${result.insight}</span><strong>${result.foot}</strong>`;
    document.querySelectorAll("[data-result-tab]").forEach((button) => button.classList.toggle("is-active", button.dataset.resultTab === state.resultsTab));
  }

  function renderFigureContext() {
    const metrics = DATA.figureMetrics.hadpMechanism;
    dom.figureContextCopy.textContent = `The locked mechanism figure shows a ${metrics.changedDecisions[100]} decision-change rate at H100 and ${metrics.changedDecisions[150]} at H150, with directional cost reductions of 1.9% and 1.3%.`;
  }

  function renderGallery() {
    const visible = DATA.rolloutCases.filter((item) => state.galleryFilter === "all" || item.filter === state.galleryFilter);
    dom.galleryGrid.innerHTML = visible.map((item) => {
      const outcome = item.outcomes[state.horizon];
      const clip = item.clips && item.clips[0];
      const caseNumber = DATA.rolloutCases.indexOf(item) + 1;
      return `<article class="gallery-card">
        <div class="gallery-preview"><canvas data-gallery-canvas="${item.id}" width="420" height="312"></canvas><span class="gallery-outcome ${item.filter}">${item.label}</span></div>
        <div class="gallery-body">
          <span class="case-label">Case ${caseNumber} · H${state.horizon}</span>
          <h3>${item.title}</h3>
          <p>${item.caption}</p>
          <div class="case-mini-scores">
            <div class="score-cell"><span>Native CEM · ${outcome.native.success ? "success" : "fail"} · plan score</span><strong>${format(outcome.native.score, 2)}</strong></div>
            <div class="score-cell hadp"><span>HADP · ${outcome.hadp.success ? "success" : "fail"} · plan score</span><strong>${format(outcome.hadp.score, 2)}</strong></div>
          </div>
          <div class="clip-wrap"><label>recorded reference clip</label><video src="${clip}" muted loop playsinline preload="metadata" controls></video></div>
        </div>
      </article>`;
    }).join("");
    visible.forEach((item) => {
      const canvas = dom.galleryGrid.querySelector(`[data-gallery-canvas="${item.id}"]`);
      if (!canvas) return;
      const { context, width, height } = getCanvas(canvas);
      drawBoard(context, width, height, item, "hadp", 48);
    });
    document.querySelectorAll("[data-gallery-filter]").forEach((button) => button.classList.toggle("is-active", button.dataset.galleryFilter === state.galleryFilter));
  }

  function startAnimation() {
    if (!state.raf) state.raf = requestAnimationFrame(animationFrame);
  }

  function animationFrame(now) {
    if (state.playing && now - state.lastRolloutTick > 72) {
      state.lastRolloutTick = now;
      state.frame += 1;
      if (state.frame >= DATA.rolloutFrames) {
        state.frame = DATA.rolloutFrames - 1;
        state.playing = false;
      }
      renderRollout();
    }
    if (state.microscopePlaying && now - state.lastMicroscopeTick > 105) {
      state.lastMicroscopeTick = now;
      state.microscopeCursor += 1;
      if (state.microscopeCursor > DATA.microscopeCandidates.length + 2) {
        state.microscopePlaying = false;
        state.microscopeCursor = DATA.microscopeCandidates.length;
      }
      renderMicroscope();
    }
    if (state.playing || state.microscopePlaying) {
      state.raf = requestAnimationFrame(animationFrame);
    } else {
      state.raf = 0;
    }
  }

  function bindEvents() {
    document.querySelectorAll("[data-horizon]").forEach((button) => button.addEventListener("click", () => setHorizon(button.dataset.horizon)));
    document.querySelectorAll("[data-planner-mode]").forEach((button) => button.addEventListener("click", () => {
      state.plannerMode = button.dataset.plannerMode;
      renderMicroscope();
    }));
    document.querySelectorAll("[data-dynamics-model]").forEach((button) => button.addEventListener("click", () => {
      state.dynamicsModel = button.dataset.dynamicsModel;
      renderDynamics();
    }));
    document.querySelectorAll("[data-ldad-model]").forEach((button) => button.addEventListener("click", () => {
      state.ldadModel = button.dataset.ldadModel;
      renderLdad();
    }));
    document.querySelectorAll("[data-result-tab]").forEach((button) => button.addEventListener("click", () => {
      state.resultsTab = button.dataset.resultTab;
      renderResults();
    }));
    document.querySelectorAll("[data-gallery-filter]").forEach((button) => button.addEventListener("click", () => {
      state.galleryFilter = button.dataset.galleryFilter;
      renderGallery();
    }));
    dom.episodeSelect.addEventListener("change", (event) => {
      state.caseId = event.target.value;
      state.frame = 0;
      state.playing = false;
      renderRollout();
    });
    dom.playRollout.addEventListener("click", () => {
      if (!state.playing && state.frame >= DATA.rolloutFrames - 1) state.frame = 0;
      state.playing = !state.playing;
      renderRollout();
      if (state.playing) startAnimation();
    });
    dom.replayRollout.addEventListener("click", () => {
      state.frame = 0;
      state.playing = true;
      renderRollout();
      startAnimation();
    });
    dom.rolloutScrub.addEventListener("input", (event) => {
      state.frame = Number(event.target.value);
      state.playing = false;
      renderRollout();
    });
    dom.weightSlider.addEventListener("input", (event) => {
      state.lambda = Number(event.target.value);
      renderMicroscope();
    });
    dom.microscopeReplay.addEventListener("click", () => {
      state.microscopePlaying = true;
      state.microscopeCursor = 0;
      state.lastMicroscopeTick = 0;
      renderMicroscope();
      startAnimation();
    });
    dom.epochSlider.addEventListener("input", (event) => {
      state.epoch = Number(event.target.value);
      renderDynamics();
    });
    window.addEventListener("resize", () => {
      renderRollout();
      renderMicroscope();
      renderDynamics();
      renderLdad();
      renderGallery();
    });
    document.addEventListener("keydown", (event) => {
      if (event.code === "Space" && !["INPUT", "SELECT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        dom.playRollout.click();
      }
    });
  }

  renderEpisodeOptions();
  bindEvents();
  updateHorizonButtons();
  renderRollout();
  renderMicroscope();
  renderDynamics();
  renderLdad();
  renderResults();
  renderFigureContext();
  renderGallery();
})();
