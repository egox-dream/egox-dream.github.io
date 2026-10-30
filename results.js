/* Results charts. RESULTS holds the values plotted in the paper's result figures;
   update the two together. */
(() => {
  'use strict';

  const RESULTS = {
    main: [
      [
        { embodiment: 'G1-Dex5', task: 'Kitchen-Bread', id: [[0.238, 0.027], [0.531, 0.076], [0.669, 0.074], [0.708, 0.097]], ood: [[0.157, 0.03], [0.286, 0.14], [0.371, 0.099], [0.814, 0.077]] },
        { embodiment: 'G1-Sim-Dex3', task: 'Kitchen-Bread', id: [[0.381, 0.039], [0.166, 0.032], [0.613, 0.047], [0.684, 0.053]], ood: [[0.294, 0.041], [0.239, 0.044], [0.65, 0.063], [0.656, 0.084]] },
        { embodiment: 'R1Lite-Gripper', task: 'Kitchen-Bread', id: [[0.413, 0.03], [0.51, 0.071], [0.692, 0.08], [0.856, 0.063]], ood: [[0.357, 0.064], [0.571, 0.086], [0.607, 0.074], [0.839, 0.081]] },
        { embodiment: 'G1-Sim-Dex3', task: 'Kitchen-Cleanup', id: [[0.469, 0.044], [0.619, 0.053], [0.637, 0.054], [0.6, 0.052]], ood: [[0.433, 0.067], [0.556, 0.068], [0.611, 0.077], [0.667, 0.072]] }
      ],
      [
        { embodiment: 'G1-Dex5', task: 'Sort', id: [[0.514, 0.088], [0.514, 0.075], [0.601, 0.06], [0.871, 0.05]], ood: [[0.383, 0.147], [0.286, 0.107], [0.468, 0.085], [0.747, 0.1]] },
        { embodiment: 'xArm7-Dex4', task: 'Sort', id: [[0.227, 0.052], [0.388, 0.094], [0.734, 0.089], [0.92, 0.036]], ood: [[0.097, 0.057], [0.416, 0.157], [0.721, 0.073], [0.883, 0.075]] },
        { embodiment: 'R1Lite-Gripper', task: 'Sort', id: [[0.448, 0.103], [0.829, 0.083], [0.79, 0.065], [0.881, 0.034]], ood: [[0.415, 0.172], [0.311, 0.159], [0.683, 0.067], [0.843, 0.045]] },
        { embodiment: 'G1-Dex5', task: 'Insert', id: [[0.628, 0.076], [0.436, 0.086], [0.641, 0.082], [0.756, 0.059]], ood: [[0.143, 0.143], [0.119, 0.031], [0.238, 0.145], [0.81, 0.092]] },
        { embodiment: 'xArm7-Dex4', task: 'Insert', id: [[0.526, 0.068], [0.641, 0.115], [0.692, 0.101], [0.679, 0.044]], ood: [[0.167, 0], [0.714, 0.101], [0.5, 0.141], [0.69, 0.057]] }
      ],
      [
        { embodiment: 'G1-Dex5', task: 'Scoop', id: [[0.205, 0.095], [0.487, 0.081], [0.795, 0.109], [0.949, 0.035]], ood: [[0.429, 0.114], [0.548, 0.13], [0.69, 0.128], [0.81, 0.143]] },
        { embodiment: 'xArm7-Dex4', task: 'Scoop', id: [[0.615, 0.091], [0.769, 0.088], [0.705, 0.109], [0.949, 0.035]], ood: [[0.381, 0.079], [0.429, 0.095], [0.476, 0.117], [0.857, 0.099]] },
        { embodiment: 'LocoMan-Dex2', task: 'Scoop', id: [[0.346, 0.089], [0.423, 0.111], [0.654, 0.109], [0.833, 0.089]], ood: [[0.167, 0], [0.286, 0.119], [0.286, 0.119], [0.405, 0.154]] },
        { embodiment: 'Z1-Tool', task: 'Scoop', id: [[0.569, 0.136], [0.815, 0.097], [0.738, 0.114], [0.877, 0.083]], ood: [[0.114, 0.086], [0.429, 0.202], [0.543, 0.136], [1.0, 0]] }
      ]
    ],
    composition: [
      { embodiment: 'G1-Dex5', task: 'Sort', color: '#07588e', marker: 'circle', id: [[0.601, 0.06], [0.706, 0.077], [0.839, 0.054], [0.871, 0.05]], ood: [[0.468, 0.085], [0.597, 0.051], [0.708, 0.146], [0.747, 0.1]] },
      { embodiment: 'G1-Dex5', task: 'Insert', color: '#7daad7', marker: 'circle', dashed: true, id: [[0.641, 0.082], [0.692, 0.062], [0.679, 0.074], [0.756, 0.059]], ood: [[0.238, 0.145], [0.714, 0.079], [0.738, 0.095], [0.81, 0.092]] },
      { embodiment: 'xArm7-Dex4', task: 'Sort', color: '#d55e00', marker: 'square', id: [[0.734, 0.089], [0.815, 0.052], [0.874, 0.036], [0.92, 0.036]], ood: [[0.721, 0.073], [0.649, 0.086], [0.721, 0.107], [0.883, 0.075]] },
      { embodiment: 'xArm7-Dex4', task: 'Insert', color: '#e9552c', marker: 'square', dashed: true, id: [[0.692, 0.101], [0.513, 0.061], [0.782, 0.089], [0.679, 0.044]], ood: [[0.5, 0.141], [0.548, 0.13], [0.619, 0.144], [0.69, 0.057]] },
      { embodiment: 'G1-Sim-Dex3', task: 'Kitchen-Bread', color: '#4b90d9', marker: 'triangle', id: [[0.613, 0.047], [0.581, 0.05], [0.631, 0.053], [0.684, 0.053]], ood: [[0.65, 0.063], [0.661, 0.074], [0.556, 0.06], [0.656, 0.084]] },
      { embodiment: 'R1Lite-Gripper', task: 'Sort', color: '#a49735', marker: 'diamond', id: [[0.79, 0.065], [0.671, 0.065], [0.755, 0.046], [0.881, 0.034]], ood: [[0.683, 0.067], [0.763, 0.111], [0.683, 0.128], [0.843, 0.045]] }
    ],
    dreaming: [
      { embodiment: 'G1-Dex5', task: 'Scoop', without: [0.4, 0.071], with: [0.9, 0.055] },
      { embodiment: 'G1-Dex5', task: 'Insert', without: [0.65, 0.053], with: [0.775, 0.049] },
      { embodiment: 'xArm7-Dex4', task: 'Scoop', without: [0.825, 0.061], with: [0.917, 0.041] },
      { embodiment: 'G1-Sim-Dex3', task: 'Kitchen-Bread', without: [0.526, 0.041], with: [0.674, 0.045] },
      { embodiment: 'G1-Sim-Dex3', task: 'Kitchen-Cleanup', without: [0.556, 0.04], with: [0.624, 0.042] },
      { embodiment: 'LocoMan-Dex2', task: 'Scoop', without: [0.592, 0.091], with: [0.683, 0.09] },
      { embodiment: 'Z1-Tool', task: 'Scoop', without: [0.87, 0.071], with: [0.92, 0.055] }
    ],
    latent: {
      labels: ['G1-Dex5', 'xArm7-Dex4', 'Z1-Tool', 'LocoMan-Dex2', 'Human-Dex5'],
      cells: [
        [null, [-24.8, '#bfba8c'], [-46.6, '#87803b'], [-34.5, '#a29d68'], [-22.5, '#c6c395']],
        [[-18.3, '#fba799'], null, [-29.7, '#aea97a'], [-31.9, '#a9a372'], [-30.8, '#aba676']],
        [[-6.2, '#fed8d1'], [-8.0, '#fdd0c8'], null, [-55.6, '#6b6628'], [-59.9, '#5c5822']],
        [[-9.7, '#fcc8bf'], [-8.3, '#fdcfc6'], [31.7, '#d6d6d6'], null, [-36.7, '#9d9860']],
        [[-32.3, '#f77966'], [-31.2, '#fb7c69'], [-42.3, '#d35b47'], [-38.5, '#e06653'], null]
      ]
    },
    // Per variant and split: [mean, SEM] without, then with pretraining. Four decimals keep the
    // changes printed above the columns equal to the paper's.
    coarse: [
      { embodiment: 'Z1-Tool', task: 'Scoop', mxt: { id: [[0.7385, 0.1141], [0.8769, 0.0833]], ood: [[0.5429, 0.136], [1, 0]] }, coarse: { id: [[0.6923, 0.1124], [0.8769, 0.0833]], ood: [[0.3714, 0.119], [0.8857, 0.1143]] } },
      { embodiment: 'xArm7-Dex4', task: 'Scoop', mxt: { id: [[0.7051, 0.1087], [0.9487, 0.0347]], ood: [[0.4762, 0.1174], [0.8571, 0.0991]] }, coarse: { id: [[0.4872, 0.0718], [0.2949, 0.0203]], ood: [[0.5, 0.1091], [0.381, 0.079]] } },
      { embodiment: 'G1-Sim-Dex3', task: 'Kitchen-Bread', mxt: { id: [[0.6125, 0.0475], [0.6844, 0.0526]], ood: [[0.65, 0.0633], [0.6556, 0.0841]] }, coarse: { id: [[0.5687, 0.0439], [0.3281, 0.0334]], ood: [[0.5167, 0.0724], [0.2833, 0.0473]] } },
      { embodiment: 'G1-Sim-Dex3', task: 'Kitchen-Cleanup', mxt: { id: [[0.6375, 0.0542], [0.6, 0.0524]], ood: [[0.6111, 0.0766], [0.6667, 0.0723]] }, coarse: { id: [[0.5938, 0.0535], [0, 0]], ood: [[0.5222, 0.0629], [0, 0]] } }
    ]
  };

  const MAIN_METHODS = [
    { key: 'act', label: 'ACT', color: '#f3eef5' },
    { key: 'pi05', label: '&pi;<sub>0.5</sub>', color: '#bda8c1' },
    { key: 'mxt_wo', label: 'MXT+ (w/o pretrain)', color: '#f9b1a5' },
    { key: 'mxt_w', label: 'MXT+ (w/ pretrain)', color: '#ff806d' },
  ];
  const DREAM_METHODS = [
    { key: 'without', label: 'w/o embodiment dreaming (MXT)', color: '#cdc994' },
    { key: 'with', label: 'w/ embodiment dreaming (MXT+)', color: '#ff806d' },
  ];
  const COARSE_VARIANTS = [  // colors without, then with pretraining
    { key: 'mxt', label: 'MXT+', colors: ['#f9b1a5', '#ff806d'] },
    { key: 'coarse', label: 'MXT+ (coarse)', colors: ['#d9d9d9', '#9e9e9e'] },
  ];
  const SPLITS = [
    { key: 'id', label: 'ID', marker: 'circle' },
    { key: 'ood', label: 'OOD', marker: 'diamond' },
  ];
  const STAGES = ['None', 'Human', '+Other Robots', '+Target Robot'];  // each mixture adds to the previous one
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'text') node.textContent = value;
      else if (key === 'html') node.innerHTML = value;
      else node.setAttribute(key, value);
    }
    node.append(...children);
    return node;
  };

  const svg = (tag, attrs = {}, text) => {
    const node = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const fmt = (v) => v.toFixed(2);
  const withError = (v, e) => (e ? `${fmt(v)} &plusmn; ${fmt(e)}` : fmt(v));
  const tipHTML = (title, context, value) => `<b>${title}</b><span>${context}</span><strong>${value}</strong>`;
  const taskClass = (task) => `task-${task.toLowerCase()}`;

  function luminance(hex) {
    const n = parseInt(hex.slice(1), 16);
    const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function marker(shape, x, y, s) {
    const poly = (pts) => svg('polygon', { points: pts.map(([px, py]) => `${(x + px * s).toFixed(2)},${(y + py * s).toFixed(2)}`).join(' ') });
    switch (shape) {
      case 'circle': return svg('circle', { cx: x, cy: y, r: s });
      case 'square': return svg('rect', { x: x - 0.86 * s, y: y - 0.86 * s, width: 1.72 * s, height: 1.72 * s });
      case 'triangle': return poly([[0, -1.2], [1.08, 0.75], [-1.08, 0.75]]);
      case 'diamond': return poly([[0, -1.25], [1, 0], [0, 1.25], [-1, 0]]);
      case 'triangle-down': return poly([[0, 1.2], [1.08, -0.75], [-1.08, -0.75]]);
      case 'triangle-left': return poly([[-1.2, 0], [0.75, -1.08], [0.75, 1.08]]);
      default: return poly([[1.2, 0], [-0.75, -1.08], [-0.75, 1.08]]);
    }
  }

  function yAxis(ticks) {
    const axis = el('div', { class: 'rs-yaxis', 'aria-hidden': 'true' });
    ticks.forEach((t) => axis.append(el('span', { style: `--t:${t}`, text: t.toFixed(1) })));
    return axis;
  }

  function barArea(ticks) {
    const area = el('div', { class: 'rs-area' });
    ticks.filter((t) => t > 0).forEach((t) => area.append(el('div', { class: 'rs-gridline', style: `--t:${t}` })));
    return area;
  }

  function barSlot(method, [v, e], tip, order) {
    const slot = el('div', { class: 'rs-slot', 'data-m': method.key, 'data-tip': tip, style: `--v:${v};--e:${e};--c:${method.color};--i:${order}` });
    slot.append(el('div', { class: 'rs-bar' }));
    if (e > 0) slot.append(el('div', { class: 'rs-err' }));
    return slot;
  }

  function renderLegend(holder, items, onFocus) {
    let pinned = null;
    const buttons = items.map((item) => {
      const button = el('button', { type: 'button', 'aria-pressed': 'false' }, [item.icon, el('span', { html: item.label })]);
      button.addEventListener('mouseenter', () => onFocus(item.key));
      button.addEventListener('mouseleave', () => onFocus(pinned));
      button.addEventListener('focus', () => onFocus(item.key));
      button.addEventListener('blur', () => onFocus(pinned));
      button.addEventListener('click', () => {
        pinned = pinned === item.key ? null : item.key;
        buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(items[i].key === pinned)));
        onFocus(pinned);
      });
      return button;
    });
    holder.append(...buttons);
  }

  function methodLegend(holder, methods, target) {
    renderLegend(holder, methods.map((m) => ({ key: m.key, label: m.label, icon: el('span', { class: 'rs-swatch', style: `--c:${m.color}` }) })), (key) => {
      if (key === null) delete target.dataset.focus;
      else target.dataset.focus = key;
    });
  }

  function renderMain(root) {
    let panelIndex = 0;
    for (const row of RESULTS.main) {
      const rowEl = el('div', { class: 'rs-main-row', style: `--cols:${row.length}` });
      for (const pair of row) {
        const p = panelIndex++;
        const area = barArea([0, 0.5, 1]);
        [['id', 'ID'], ['ood', 'OOD']].forEach(([key, split], g) => {
          const group = el('div', { class: 'rs-group' });
          MAIN_METHODS.forEach((m, j) => {
            const value = pair[key][j];
            const tip = tipHTML(m.label, `${pair.embodiment} &middot; ${pair.task} &middot; ${split}`, withError(...value));
            group.append(barSlot(m, value, tip, p * 1.6 + g * 0.8 + j * 0.25));
          });
          area.append(group);
        });
        rowEl.append(el('div', { class: 'rs-panel' }, [
          el('div', { class: 'rs-panel-title' }, [
            el('b', { text: pair.embodiment, title: pair.embodiment }),
            el('span', { class: `task-tone ${taskClass(pair.task)}`, text: pair.task }),
          ]),
          el('div', { class: 'rs-plot' }, [yAxis([0, 0.5, 1]), area]),
          el('div', { class: 'rs-xlabels', 'aria-hidden': 'true' }, [
            el('span'),
            el('div', {}, [el('span', { class: 'id', text: 'ID' }), el('span', { class: 'ood', text: 'OOD' })]),
          ]),
        ]));
      }
      root.append(rowEl);
    }
  }

  // Stack every panel title when any one would clip, so plots stay aligned across panels.
  function fitPanelTitles(root) {
    const names = [...root.querySelectorAll('.rs-panel-title b')];
    let width = 0;
    const update = () => {
      root.classList.remove('is-stacked');
      root.classList.toggle('is-stacked', names.some((b) => b.scrollWidth > b.clientWidth));
    };
    update();
    if (document.fonts) document.fonts.ready.then(update);
    if ('ResizeObserver' in window) {
      new ResizeObserver(([entry]) => {
        if (Math.abs(entry.contentRect.width - width) < 1) return;
        width = entry.contentRect.width;
        update();
      }).observe(root);
    }
  }

  function renderComposition(root, legendHolder) {
    const W = 430;
    const H = 284;
    const M = { l: 36, r: 14, t: 14, b: 32 };
    const hi = 1.0;
    const x = (i) => M.l + (W - M.l - M.r) * (0.08 + (0.84 * i) / 3);
    const path = (pts) => pts.map(([px, py]) => `${px.toFixed(1)} ${py.toFixed(1)}`).join(' L');
    // The draw-in animation moves stroke-dashoffset from 1 to 0 over pathLength 1, so a dashed line carries its
    // dashes inside that pattern: dashes along the line, then a gap as long as the line.
    const dashes = (pts, on = 5.3, off = 2.9) => {
      const len = pts.slice(1).reduce((s, p, j) => s + Math.hypot(p[0] - pts[j][0], p[1] - pts[j][1]), 0);
      const pattern = [];
      for (let at = 0; at < len; at += on + off) pattern.push(Math.min(on, len - at), off);
      pattern[pattern.length - 1] += len;
      return pattern.map((v) => (v / len).toFixed(6)).join(' ');
    };

    const focus = (i) => {
      if (i === null) delete root.dataset.focus;
      else root.dataset.focus = i;
      root.querySelectorAll('.rs-band, .rs-series, .rs-pt-labels').forEach((g) => g.classList.toggle('is-focus', g.dataset.i === String(i)));
    };

    let pinned = null;
    // ID scores and their SEM bands stay above 0.4
    [['id', 'In-distribution', 'ID', 0.4], ['ood', 'Out-of-distribution', 'OOD', 0]].forEach(([key, title, tag, lo]) => {
      const y = (v) => M.t + (H - M.t - M.b) * (1 - (v - lo) / (hi - lo));
      const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `${title} task progress score for each pretraining mixture, mean and SEM` });
      for (let k = 0; k <= Math.round((hi - lo) / 0.2); k++) {
        const t = lo + k * 0.2;
        chart.append(svg('line', { class: k === 0 ? 'rs-svg-axis' : 'rs-svg-grid', x1: M.l, x2: W - M.r, y1: y(t), y2: y(t) }));
        chart.append(svg('text', { x: M.l - 8, y: y(t) + 3.5, 'text-anchor': 'end' }, t.toFixed(1)));
      }
      STAGES.forEach((stage, i) => chart.append(svg('text', { class: 'rs-tick-x', x: x(i), y: H - M.b + 20, 'text-anchor': 'middle' }, stage)));

      const bandLayer = svg('g', { 'aria-hidden': 'true' });
      const labelLayer = svg('g', { 'aria-hidden': 'true' });
      chart.append(bandLayer);
      RESULTS.composition.forEach((series, i) => {
        const upper = series[key].map(([v, e], j) => [x(j), y(Math.min(hi, v + e))]);
        const lower = series[key].map(([v, e], j) => [x(j), y(Math.max(lo, v - e))]).reverse();
        bandLayer.append(svg('path', { class: 'rs-band', 'data-i': i, d: `M${path(upper)} L${path(lower)} Z`, fill: series.color }));
        const g = svg('g', { class: 'rs-series', 'data-i': i });
        const pts = series[key].map(([v], j) => [x(j), y(v)]);
        const d = `M${path(pts)}`;
        g.append(svg('path', { class: 'rs-hit', d }));
        const line = svg('path', { class: series.dashed ? 'rs-line is-dashed' : 'rs-line', d, stroke: series.color, pathLength: 1 });
        if (series.dashed) line.style.strokeDasharray = dashes(pts);
        g.append(line);
        series[key].forEach(([v, e], j) => {
          const dot = marker(series.marker, pts[j][0], pts[j][1], series.dashed ? 4 : 4.4);
          dot.setAttribute('class', series.dashed ? 'rs-marker is-hollow' : 'rs-marker');
          dot.setAttribute('fill', series.dashed ? '#fff' : series.color);
          if (series.dashed) dot.style.stroke = series.color;
          dot.setAttribute('data-tip', tipHTML(`${series.embodiment} &middot; ${series.task}`, `${STAGES[j]} &middot; ${tag}`, withError(v, e)));
          g.append(dot);
        });
        const labels = svg('g', { class: 'rs-pt-labels', 'data-i': i });
        series[key].forEach(([v], j) => labels.append(svg('text', { class: 'rs-pt-label', x: pts[j][0], y: pts[j][1] - 10, 'text-anchor': 'middle' }, fmt(v))));
        labelLayer.append(labels);
        g.addEventListener('pointerenter', () => focus(i));
        g.addEventListener('pointerleave', () => focus(pinned));
        chart.append(g);
      });
      chart.append(labelLayer);

      root.append(el('div', { class: 'rs-comp-panel' }, [el('h4', {}, [el('i', { class: tag.toLowerCase(), text: tag }), title]), chart]));
    });

    renderLegend(legendHolder, RESULTS.composition.map((series, i) => {
      const icon = svg('svg', { width: 26, height: 12, viewBox: '0 0 26 12', 'aria-hidden': 'true' });
      const stroke = series.dashed ? { 'stroke-dasharray': '4 2.5', 'stroke-linecap': 'butt' } : { 'stroke-linecap': 'round' };
      icon.append(svg('line', { x1: 1, x2: 25, y1: 6, y2: 6, stroke: series.color, 'stroke-width': 2.2, ...stroke }));
      const dot = marker(series.marker, 13, 6, series.dashed ? 3.3 : 3.8);
      dot.setAttribute('fill', series.dashed ? '#fff' : series.color);
      dot.setAttribute('stroke', series.dashed ? series.color : '#fff');
      dot.setAttribute('stroke-width', series.dashed ? 1.4 : 1.1);
      icon.append(dot);
      return { key: i, label: `${series.embodiment} &middot; ${series.task}`, icon };
    }), focus);
    legendHolder.addEventListener('click', () => {
      const pressed = [...legendHolder.querySelectorAll('button')].findIndex((b) => b.getAttribute('aria-pressed') === 'true');
      pinned = pressed < 0 ? null : pressed;
    });
  }

  function renderDreaming(root) {
    const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];
    const area = barArea(ticks);
    const labels = el('div');
    RESULTS.dreaming.forEach((d, k) => {
      const group = el('div', { class: 'rs-group' });
      DREAM_METHODS.forEach((m, j) => {
        const tip = tipHTML(m.label, `${d.embodiment} &middot; ${d.task}`, withError(...d[m.key]));
        group.append(barSlot(m, d[m.key], tip, k * 1.4 + j * 0.7));
      });
      area.append(group);
      labels.append(el('span', {}, [d.embodiment, el('small', { text: d.task })]));
    });
    root.append(
      el('div', { class: 'rs-plot' }, [yAxis(ticks), area]),
      el('div', { class: 'rs-xlabels', 'aria-hidden': 'true' }, [el('span'), labels]),
    );
  }

  function renderLatent(root) {
    const { labels, cells } = RESULTS.latent;
    const nameParts = (name) => {
      const cut = name.indexOf('-') + 1;
      return [el('span', { text: name.slice(0, cut) }), el('span', { text: name.slice(cut) })];
    };
    root.append(el('span'));
    labels.forEach((name) => root.append(el('span', { class: 'rs-gw-label col' }, nameParts(name))));
    cells.forEach((row, r) => {
      root.append(el('span', { class: 'rs-gw-label' }, nameParts(labels[r])));
      row.forEach((cell, c) => {
        if (!cell) {
          root.append(el('span', { class: 'rs-gw-cell is-diag', 'aria-hidden': 'true' }, [
            el('img', { src: `./assets/models/embodiments/canonical/${labels[r].toLowerCase()}.webp`, alt: '', loading: 'lazy', decoding: 'async' }),
          ]));
          return;
        }
        const [v, color] = cell;
        const text = `${v > 0 ? '+' : '\u2212'}${Math.abs(v).toFixed(1)}%`;
        const source = c > r ? 'Embodiment dreaming' : 'Cross-embodiment pretraining';
        root.append(el('span', {
          class: `rs-gw-cell${luminance(color) > 0.3 ? ' is-light' : ''}`,
          style: `--c:${color}`,
          'data-tip': tipHTML(source, `${labels[r]} &harr; ${labels[c]}`, `${text} GW`),
          text,
        }));
      });
    });
  }

  function renderHBars(root, rows, methods) {
    const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];
    rows.forEach((g, k) => {
      root.append(el('div', { class: 'rs-hchart-label' }, [g.embodiment, el('small', { text: g.task })]));
      const bars = el('div', { class: 'rs-hchart-bars' });
      ticks.slice(1).forEach((t) => bars.append(el('div', { class: 'rs-vgrid', style: `--t:${t}` })));
      methods.forEach((m, j) => {
        const [v, e] = g.values[j];
        const slot = el('div', {
          class: 'rs-slot',
          'data-m': m.key,
          'data-tip': tipHTML(m.label, `${g.embodiment} &middot; ${g.task}`, withError(v, e)),
          style: `--v:${v};--e:${e};--c:${m.color};--i:${k * 2 + j * 0.5}`,
        });
        slot.append(el('div', { class: 'rs-hbar' }));
        if (e > 0) slot.append(el('div', { class: 'rs-herr' }));
        if (v === 0) slot.append(el('span', { class: 'rs-zero', text: '0' }));
        bars.append(slot);
      });
      root.append(bars);
    });
    const axis = el('div', { class: 'rs-xaxis', 'aria-hidden': 'true' });
    ticks.forEach((t) => axis.append(el('span', { style: `--t:${t}`, text: t.toFixed(1) })));
    root.append(el('span'), axis);
  }

  function renderCoarse(root, legendHolder) {
    const W = 240;
    const H = 290;
    const M = { l: 30, r: 4, t: 30, b: 6 };
    const lo = -0.03;  // keeps the markers at 0 and 1 clear of the axes
    const hi = 1.03;
    const pw = W - M.l - M.r;
    const y = (v) => M.t + (H - M.t - M.b) * (1 - (v - lo) / (hi - lo));
    const columns = COARSE_VARIANTS.flatMap((variant) => SPLITS.map((split) => ({ variant, split })));
    const violin = (x, v, e) => {
      const a = Math.max(0, v - 3 * e);
      const b = Math.min(1, v + 3 * e);
      const ts = Array.from({ length: 41 }, (_, i) => a + ((b - a) * i) / 40);
      const side = (sign, list) => list.map((t) => `${(x + sign * 0.09 * pw * Math.exp(-0.5 * ((t - v) / e) ** 2)).toFixed(1)} ${y(t).toFixed(1)}`);
      return `M${[...side(1, ts), ...side(-1, [...ts].reverse())].join(' L')} Z`;
    };

    RESULTS.coarse.forEach((g, p) => {
      const chart = svg('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
      for (let k = 0; k <= 5; k++) {
        const t = k * 0.2;
        chart.append(svg('line', { class: 'rs-svg-grid', x1: M.l, x2: W - M.r, y1: y(t), y2: y(t) }));
        chart.append(svg('text', { x: M.l - 7, y: y(t) + 3.5, 'text-anchor': 'end' }, t.toFixed(1)));
      }
      chart.append(svg('line', { class: 'rs-svg-axis', x1: M.l, x2: W - M.r, y1: y(lo), y2: y(lo) }));
      chart.append(svg('text', { class: 'rs-delta', x: M.l - 7, y: M.t - 13, 'text-anchor': 'end' }, '\u0394'));
      columns.forEach(({ variant, split }, k) => {
        const x = M.l + pw * (0.5 + (k - 1.5) * 0.24);
        const ends = g[variant.key][split.key];
        const change = ends[1][0] - ends[0][0];
        const col = svg('g', { class: 'rs-col', 'data-v': variant.key, 'data-s': split.key });
        const body = svg('g', { class: 'rs-col-in', style: `--i:${p * 4 + k}` });
        ends.forEach(([v, e], j) => {
          if (e > 0) body.append(svg('path', { class: 'rs-violin', d: violin(x, v, e), fill: variant.colors[j], stroke: variant.colors[j] }));
        });
        if (Math.abs(change) > 0.08) {  // a shorter arrow would vanish between the markers
          const dir = Math.sign(y(ends[1][0]) - y(ends[0][0]));
          const start = y(ends[0][0]) + dir * 7;
          const end = y(ends[1][0]) - dir * 7;
          body.append(svg('line', { class: 'rs-arrow', x1: x, x2: x, y1: start, y2: end - dir * 5, stroke: variant.colors[1] }));
          body.append(svg('polygon', { points: `${x},${end} ${x - 3.4},${end - dir * 6.5} ${x + 3.4},${end - dir * 6.5}`, fill: variant.colors[1] }));
        }
        ends.forEach(([v, e], j) => {
          const dot = marker(split.marker, x, y(v), 4.5);
          dot.setAttribute('class', 'rs-cmarker');
          dot.setAttribute('fill', variant.colors[j]);
          dot.setAttribute('data-tip', tipHTML(`${variant.label} &middot; ${j ? 'w/' : 'w/o'} pretrain`, `${g.embodiment} &middot; ${g.task} &middot; ${split.label}`, withError(v, e)));
          body.append(dot);
        });
        const text = Math.abs(change) < 0.005 ? '0.00' : `${change < 0 ? '\u2212' : '+'}${Math.abs(change).toFixed(2)}`;
        body.append(svg('text', { class: `rs-delta${change < -0.05 ? ' is-drop' : ''}`, x, y: M.t - 13, 'text-anchor': 'middle' }, text));
        col.append(body);
        chart.append(col);
      });
      root.append(el('div', { class: 'rs-panel' }, [
        el('div', { class: 'rs-panel-title' }, [
          el('b', { text: g.embodiment, title: g.embodiment }),
          el('span', { class: `task-tone ${taskClass(g.task)}`, text: g.task }),
        ]),
        chart,
      ]));
    });

    const icon = (width) => svg('svg', { width, height: 12, viewBox: `0 0 ${width} 12`, 'aria-hidden': 'true' });
    const legendMarker = (shape, x, fill) => {
      const dot = marker(shape, x, 6, 4);
      dot.setAttribute('fill', fill);
      dot.setAttribute('stroke', '#2a2520');
      dot.setAttribute('stroke-width', 0.9);
      return dot;
    };
    renderLegend(legendHolder, [
      ...COARSE_VARIANTS.map((variant) => {
        const pair = icon(22);
        variant.colors.forEach((c, j) => pair.append(legendMarker('circle', 5 + j * 12, c)));
        return { key: variant.key, label: `${variant.label}: w/o &rarr; w/ pretrain`, icon: pair };
      }),
      ...SPLITS.map((split) => {
        const shape = icon(12);
        shape.append(legendMarker(split.marker, 6, '#fff'));
        return { key: split.key, label: split.label, icon: shape };
      }),
    ], (key) => {
      if (key === null) delete root.dataset.focus;
      else root.dataset.focus = key;
    });
  }

  const tip = el('div', { class: 'rs-tip', 'aria-hidden': 'true' });
  document.body.append(tip);
  let tipTarget = null;

  function showTip(target) {
    tipTarget = target;
    tip.innerHTML = target.getAttribute('data-tip');
    const parts = [...target.querySelectorAll('.rs-bar, .rs-err, .rs-hbar, .rs-herr')];
    const rects = (parts.length ? parts : [target]).map((n) => n.getBoundingClientRect());
    const horizontal = target.querySelector('.rs-hbar');
    let x = horizontal ? Math.max(...rects.map((r) => r.right)) : rects[0].left + rects[0].width / 2;
    const y = Math.min(...rects.map((r) => r.top));
    tip.classList.add('is-on');
    const half = tip.offsetWidth / 2;
    x = Math.min(Math.max(x, half + 8), window.innerWidth - half - 8);
    tip.style.left = `${x}px`;
    tip.style.top = `${Math.max(y, tip.offsetHeight + 16)}px`;
  }

  function hideTip() {
    tipTarget = null;
    tip.classList.remove('is-on');
  }

  const tipOwner = (node) => (node && node.closest ? node.closest('.rs-block [data-tip]') : null);
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const target = tipOwner(e.target);
    if (target && target !== tipTarget) showTip(target);
  });
  document.addEventListener('pointerout', (e) => {
    if (e.pointerType === 'touch' || !tipTarget) return;
    if (!tipTarget.contains(e.relatedTarget)) hideTip();
  });
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    const target = tipOwner(e.target);
    if (target) showTip(target);
    else hideTip();
  });
  window.addEventListener('scroll', hideTip, { passive: true });

  const byId = (id) => document.getElementById(id);
  const main = byId('mainChart');
  if (main) {
    renderMain(main);
    methodLegend(byId('mainLegend'), MAIN_METHODS, main);
    fitPanelTitles(main);
  }
  const composition = byId('compositionChart');
  if (composition) renderComposition(composition, byId('compositionLegend'));
  const dreaming = byId('dreamChart');
  if (dreaming) {
    renderDreaming(dreaming);
    const compact = byId('dreamChartCompact');
    if (compact) renderHBars(compact, RESULTS.dreaming.map((d) => ({ ...d, values: DREAM_METHODS.map((m) => d[m.key]) })), DREAM_METHODS);
    methodLegend(byId('dreamLegend'), DREAM_METHODS, dreaming.closest('.rs-figure') || dreaming);
  }
  const latent = byId('latentChart');
  if (latent) renderLatent(latent);
  const coarse = byId('coarseChart');
  if (coarse) {
    renderCoarse(coarse, byId('coarseLegend'));
    fitPanelTitles(coarse);
  }

  const animated = [...document.querySelectorAll('.rs-anim')];
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    animated.forEach((node) => observer.observe(node));
  } else {
    animated.forEach((node) => node.classList.add('is-in'));
  }
})();
