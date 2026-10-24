document.addEventListener('DOMContentLoaded', () => {
  const cards = [...document.querySelectorAll('.media-card')];
  const grid = document.getElementById('embodimentMediaGrid');
  const embodiments = {
    g1: ['G1-Dex5', 'Bimanual humanoid · five-finger hands', './assets/posters/g1-dex5/kitchen-bread/id/mxt-plus-x-embodiment-pretrain-04.jpg'],
    xarm: ['xArm7-Dex4', 'Tabletop arm · four-finger hand', './assets/embodiments/xarm7.jpg'],
    g1sim: ['G1-Sim-Dex3', 'Simulated humanoid · three-finger hands', './assets/posters/g1-sim-dex3/kitchen-bread/id/mxt-plus-x-embodiment-pretrain-01.jpg'],
    r1lite: ['R1Lite-Gripper', 'Wheeled bimanual manipulator', './assets/embodiments/r1lite.jpg'],
    locoman: ['LocoMan-Dex2', 'Quadruped · front-leg grippers', './assets/posters/locoman-dex2/scoop/id/mxt-plus-x-embodiment-pretrain-01.jpg'],
    z1: ['Z1-Tool', 'Tabletop arm · fixed scoop', './assets/embodiments/z1.jpg'],
    human: ['Human-Dex5', 'Egocentric human data collection', './assets/embodiments/human.jpg']
  };
  const tasks = {'kitchen-bread': 'Kitchen-Bread', insert: 'Insert', 'kitchen-cleanup': 'Kitchen-Cleanup', sort: 'Sort', scoop: 'Scoop'};
  const models = {'cross-embodiment': 'MXT+ (w/ pretrain)', 'mxt-plus': 'MXT+ (w/o pretrain)', pi05: 'π0.5', act: 'ACT'};
  // Keep in sync with the paper's dataset-composition figure; human counts combine all recording setups.
  const demos = {
    g1: {insert: 218, 'kitchen-bread': 210, sort: 142, scoop: 140},
    xarm: {insert: 195, sort: 159, scoop: 83},
    g1sim: {'kitchen-bread': 437, 'kitchen-cleanup': 312},
    r1lite: {'kitchen-bread': 180, sort: 170},
    locoman: {scoop: 37},
    z1: {scoop: 84},
    human: {insert: 506, 'kitchen-bread': 584, sort: 581, scoop: 725}
  };
  const demoUse = {
    'cross-embodiment': 'this policy was fine-tuned on them after cross-embodiment pretraining',
    'mxt-plus': 'this policy was trained on them from scratch',
    act: 'this policy was trained on them from scratch',
    pi05: 'this policy was fine-tuned on them from its pretrained checkpoint',
    'human-data': 'all recording setups combined, used only for pretraining'
  };
  const outcomes = {success: ['Success', 'M4.6 8.4l2.3 2.3 4.6-5.1'], failure: ['Failure', 'M5.5 5.5l5 5m0-5l-5 5']};
  const selected = {embodiment: 'all', task: 'all', model: 'all'};
  const comparison = {embodiment: 'r1lite', task: 'kitchen-bread', model: 'all'};
  const compare = document.getElementById('compareMethods');
  const orders = {embodiment: Object.keys(embodiments), task: Object.keys(tasks), model: Object.keys(models)};
  const rank = (card, field) => (index => index < 0 ? orders[field].length : index)(orders[field].indexOf(card.dataset[field]));
  const sortBy = (...fields) => (a, b) => fields.reduce((order, field) => order || rank(a, field) - rank(b, field), 0);
  let groups = [];
  let groupLayout = '';
  grid.className = 'gallery-rows';
  const resizeObserver = new ResizeObserver(entries => entries.forEach(({target}) => updateNavigation(target.parentElement)));
  function updateNavigation(section) {
    const rows = [...section.querySelectorAll('.embodiment-media-grid')];
    const navigation = section.querySelector('.row-navigation');
    navigation.hidden = rows.every(row => row.scrollWidth <= row.clientWidth + 2);
    navigation.children[0].disabled = rows.every(row => row.scrollLeft < 2);
    navigation.children[1].disabled = rows.every(row => row.scrollLeft + row.clientWidth >= row.scrollWidth - 2);
  }
  function groupRows() {
    // One task with every training setting gives each embodiment's methods their own rows.
    const split = selected.task !== 'all' && selected.model === 'all';
    const layout = selected.task === 'all' ? 'task' : split ? 'method:' + selected.task : 'embodiment';
    if (layout === groupLayout) return;
    groupLayout = layout;
    resizeObserver.disconnect();
    grid.replaceChildren();
    groups = [];
    if (selected.task === 'all') {
      Object.entries(tasks).forEach(([key, name]) => addRow(name, [cards.filter(card => card.dataset.task === key).sort(sortBy('embodiment', 'model'))]));
      return;
    }
    Object.entries(embodiments).forEach(([key, [name]]) => {
      const rowCards = cards.filter(card => card.dataset.embodiment === key).sort(sortBy('task', 'model'));
      const methods = split ? [...new Set(rowCards.filter(card => card.dataset.task === selected.task).map(card => card.dataset.model))] : [];
      addRow(name, methods.length ? methods.map(model => rowCards.filter(card => card.dataset.model === model)) : [rowCards]);
    });
  }
  function addRow(name, cardRows) {
    const section = document.createElement('section');
    section.className = 'embodiment-row';
    const heading = document.createElement('header');
    const label = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = name;
    label.append(title);
    heading.append(label);
    section.append(heading);
    const rows = cardRows.map(rowCards => {
      const row = document.createElement('div');
      row.className = 'embodiment-media-grid';
      rowCards.forEach(card => row.append(card));
      section.append(row);
      row.tabIndex = 0;
      row.setAttribute('aria-label', [name, cardRows.length > 1 && models[rowCards[0].dataset.model], 'videos — scroll horizontally'].filter(Boolean).join(' '));
      resizeObserver.observe(row);
      row.addEventListener('scroll', () => {
        updateNavigation(section);
        [...row.querySelectorAll('video')].forEach(video => {
          const bounds = video.getBoundingClientRect();
          const parent = row.getBoundingClientRect();
          if (bounds.right <= parent.left || bounds.left >= parent.right) video.pause();
        });
      }, {passive: true});
      return row;
    });
    const navigation = document.createElement('div');
    navigation.className = 'row-navigation';
    [['←', -1, 'Previous'], ['→', 1, 'Next']].forEach(([text, direction, action]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = text;
      button.setAttribute('aria-label', action + ' ' + name + ' videos');
      button.addEventListener('click', () => rows.forEach(row => row.scrollBy({left: direction * 304, behavior: 'smooth'})));
      navigation.append(button);
    });
    heading.append(navigation);
    grid.append(section);
    groups.push(section);
  }
  function filters(id, field, entries) {
    const target = document.getElementById(id);
    [['all', 'All'], ...Object.entries(entries)].forEach(([key, value]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = Array.isArray(value) ? value[0] : value;
      button.className = 'gallery-filter' + (field === 'task' && key !== 'all' ? ' task-' + key : '');
      button.dataset.value = key;
      button.setAttribute('aria-pressed', key === 'all' ? 'true' : 'false');
      button.addEventListener('click', () => {
        selected[field] = key;
        target.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        render();
      });
      target.append(button);
    });
  }
  // The model lineup is the embodiment selector; task and training filters
  // remain independent and keep their current values when models change.
  document.addEventListener('egox:embodiment-select', event => {
    const key = event.detail.embodiment;
    if (key !== 'all' && !Object.hasOwn(embodiments, key)) return;
    selected.embodiment = key;
    render();
  });
  filters('taskFilters', 'task', tasks);
  const modelSelect = document.getElementById('modelFilters');
  [['all', 'All training settings'], ...Object.entries(models)].forEach(([value, name]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    modelSelect.append(option);
  });
  modelSelect.addEventListener('change', () => {
    selected.model = modelSelect.value;
    render();
  });
  let beforeComparison = {...selected};
  function choose(state) {
    selected.task = state.task;
    selected.model = modelSelect.value = state.model;
    document.querySelectorAll('#taskFilters button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.value === state.task)));
    // Selecting through the model lineup keeps its highlighted model in sync.
    document.querySelector(state.embodiment === 'all' ? '.embodiment-show-all' : `.embodiment-model-card[data-embodiment="${state.embodiment}"] .embodiment-select`)?.click();
    selected.embodiment = state.embodiment;
    render();
  }
  compare.hidden = false;
  compare.addEventListener('click', () => {
    const active = compare.getAttribute('aria-pressed') === 'true';
    if (!active) beforeComparison = {...selected};
    choose(active ? beforeComparison : comparison);
  });
  const manuallyPaused = new WeakSet();
  const interactionTimes = new WeakMap();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => {
      if (isIntersecting && !target.closest('.media-card').hidden && !manuallyPaused.has(target)) target.play().catch(() => {});
      else target.pause();
    });
  }, {threshold: 0.15});
  cards.forEach(card => {
    const video = card.querySelector('video');
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = 'none';
    video.controls = true;
    video.addEventListener('pointerdown', () => interactionTimes.set(video, Date.now()));
    video.addEventListener('keydown', () => interactionTimes.set(video, Date.now()));
    video.addEventListener('pause', () => {
      if (Date.now() - (interactionTimes.get(video) || 0) < 1500) manuallyPaused.add(video);
    });
    video.addEventListener('play', () => manuallyPaused.delete(video));
    video.poster = video.getAttribute('src').replace('./videos/', './assets/posters/').replace(/\.(mp4|mov)$/i, '.jpg');
    observer.observe(video);
    const [outcome, icon] = outcomes[card.dataset.outcome] || [];
    if (outcome) {
      const badge = document.createElement('span');
      badge.className = 'clip-outcome ' + card.dataset.outcome;
      badge.setAttribute('aria-hidden', 'true');
      badge.innerHTML = `<svg viewBox="0 0 16 16"><path d="${icon}"/></svg>${outcome}`;
      video.after(badge);
      video.setAttribute('aria-label', video.getAttribute('aria-label') + ', ' + outcome.toLowerCase());
    }
    const count = demos[card.dataset.embodiment]?.[card.dataset.task];
    if (count) {
      const setting = card.querySelector('.clip-setting');
      const meta = document.createElement('div');
      const label = document.createElement('span');
      meta.className = 'clip-meta';
      label.className = 'clip-demos';
      label.textContent = count + (card.dataset.embodiment === 'human' ? ' demos' : ' target demos');
      label.title = `${count} ${embodiments[card.dataset.embodiment][0]} ${tasks[card.dataset.task]} demonstrations; ${demoUse[card.dataset.model]}.`;
      setting.replaceWith(meta);
      meta.append(setting, label);
    }
  });
  function render() {
    groupRows();
    let count = 0;
    cards.forEach(card => {
      const visible = Object.entries(selected).every(([field, value]) => value === 'all' || card.dataset[field] === value);
      card.hidden = !visible;
      const video = card.querySelector('video');
      if (visible) {
        count++;
        const bounds = video.getBoundingClientRect();
        const rowBounds = video.closest('.embodiment-media-grid').getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < innerHeight &&
            bounds.right > Math.max(0, rowBounds.left) && bounds.left < Math.min(innerWidth, rowBounds.right) &&
            !manuallyPaused.has(video)) video.play().catch(() => {});
      } else video.pause();
    });
    groups.forEach(group => { group.hidden = ![...group.querySelectorAll('.media-card')].some(card => !card.hidden); });
    requestAnimationFrame(() => groups.forEach(updateNavigation));
    document.getElementById('galleryCount').textContent = count + (count === 1 ? ' video' : ' videos');
    document.getElementById('mediaEmptyState').hidden = count !== 0;
    compare.setAttribute('aria-pressed', String(Object.keys(comparison).every(field => selected[field] === comparison[field])));
  }
  render();
});
