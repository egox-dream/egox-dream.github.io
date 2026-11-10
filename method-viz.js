/* Method walkthrough: four schematics of the EgoX method in the paper's order (the unified egocentric frames, the
   modular inputs, the shared trunk with modular outputs, and embodiment dreaming). Each embodiment encodes every
   modality with its own tokenizer and decodes every action modality with its own expert. The bodies are the teaser animation's frames at the end of each body's action chunk. Each sprite in
   assets/figures/method stacks the body, then one overlay per entry of BODIES[].rows: a modality's parts, the
   F_root disc, or a frame's triad, each with a halo. */
(() => {
  'use strict';

  const SPRITE_DIR = './assets/figures/method/';
  const SPRITE_VERSION = '20261109-2';
  const VIDEO_DIR = './videos/';
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const W = 960;
  const SCALE = 0.5;                                  // viewBox units per sprite px
  const COL = W / 7;

  // The shared observation vocabulary in the architecture figure's order, with its fills and the paper's \modcolor
  // outlines.
  const MODS = [
    { key: 'wristL', label: 'Left wrist', name: 'Left wrist pose', frame: 'ego', where: 'in ℱ<sub>ego</sub>',
      extra: ' The single-arm bodies omit it.', fill: '#BAB68E', ink: '#6D6A42' },
    { key: 'eeL', label: 'Left EE link', name: 'Left end-effector link', frame: 'wrist',
      where: 'as keypoints in ℱ<sub>wrist</sub>', fill: '#A49E6B', ink: '#6F6A35' },
    { key: 'wristR', label: 'Right wrist', name: 'Right wrist pose', frame: 'ego', where: 'in ℱ<sub>ego</sub>',
      fill: '#FBB79E', ink: '#985841' },
    { key: 'eeR', label: 'Right EE link', name: 'Right end-effector link', frame: 'wrist',
      where: 'as keypoints in ℱ<sub>wrist</sub>', fill: '#F6966E', ink: '#AA4D27' },
    { key: 'torso', label: 'Torso', name: 'Torso pose', frame: 'root', where: 'in ℱ<sub>root</sub>',
      extra: ' The fixed-base arms omit it.', fill: '#91BAD7', ink: '#3F6E8B' },
    { key: 'proprio', label: 'Proprioception', name: 'Embodiment-specific proprioception', sub: 'joint space',
      where: 'in joint space', fill: '#EDB3AD', ink: '#925A55' },
    { key: 'image', label: 'Ego image', name: 'Egocentric image', sub: 'main camera', where: 'from the main camera',
      fill: '#E7968D', ink: '#A1514B' },
    { key: 'embod', label: 'Embodiment', name: 'Embodiment tokens', sub: '8 latents',
      where: 'from image and joint features', fill: '#B4A7D7', ink: '#6A57A6' },
  ];

  // The shared action vocabulary in the architecture figure's order; velocity commands use its locomotion fill.
  const ACTS = [
    { key: 'wristL', label: 'Left wrist', name: 'Left wrist pose', frame: 'ego', where: 'targets in ℱ<sub>ego</sub>',
      extra: ' The single-arm bodies have none.', fill: '#BAB68E', ink: '#6D6A42' },
    { key: 'eeL', label: 'Left EE link', name: 'Left end-effector link', frame: 'wrist',
      where: 'keypoint targets in ℱ<sub>wrist</sub>', fill: '#A49E6B', ink: '#6F6A35' },
    { key: 'wristR', label: 'Right wrist', name: 'Right wrist pose', frame: 'ego', where: 'targets in ℱ<sub>ego</sub>',
      extra: ' A single-arm robot\'s wrist is its right wrist.', fill: '#FBB79E', ink: '#985841' },
    { key: 'eeR', label: 'Right EE link', name: 'Right end-effector link', frame: 'wrist',
      where: 'keypoint targets in ℱ<sub>wrist</sub>', extra: ' Z1-Tool has none: its scoop is fixed.',
      fill: '#F6966E', ink: '#AA4D27' },
    { key: 'torso', label: 'Torso', name: 'Torso pose', frame: 'root', where: 'targets in ℱ<sub>root</sub>',
      extra: ' R1Lite-Gripper and the fixed-base arms predict no torso target.', fill: '#91BAD7', ink: '#3F6E8B' },
    { key: 'vel', label: 'Velocity commands', name: 'Velocity commands', frame: 'root', where: 'in ℱ<sub>root</sub>',
      fill: '#7EA1BD', ink: '#485A6C' },
  ];

  const FRAMES = [
    { key: 'root', title: 'Root frame', desc: 'Ground projection of a body part', mods: ['torso', 'vel'],
      text: 'The root frame ℱ<sub>root</sub> is the ground projection of a reference body part; torso poses and ' +
            'velocity commands are expressed in it.' },
    { key: 'ego', title: 'Egocentric frame', desc: 'On the main camera or its body', mods: ['wristL', 'wristR'],
      text: 'The egocentric frame ℱ<sub>ego</sub> is attached to the main camera or the body carrying it; wrist ' +
            'poses and targets are expressed in it.' },
    { key: 'wrist', title: 'Wrist frames', desc: 'Attached to each wrist', mods: ['eeL', 'eeR'],
      text: 'Each wrist frame ℱ<sub>wrist</sub> is attached to a wrist; end-effector-link keypoints, such as ' +
            'fingertips or a scoop point, are expressed in it.' },
    { key: 'native', title: 'Joint states', desc: 'In each embodiment\'s joint space', mods: ['proprio'],
      text: 'Joint states are not converted: they remain in their own joint space, as embodiment-specific ' +
            'proprioception.' },
  ];
  const TAGS = { torso: 'Torso pose', vel: 'Velocity commands', wristL: 'Left wrist', wristR: 'Right wrist',
                 eeL: 'Left EE link', eeR: 'Right EE link', proprio: 'Embodiment-specific proprioception' };

  // w, h, gap, disc (the F_root disc centre), parts (centroids of each modality's parts) and anchors (where each
  // frame's triad sits; the fixed-base arms' F_ego is their F_root) are sprite px of the exported frames.
  const BODIES = [
    { key: 'human-dex5', name: 'Human-Dex5', w: 176, h: 256, gap: 4, disc: [68.4, 179.2],
      rows: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'image', 'embod', 'disc', 'triRoot', 'triEgo', 'triWrist'],
      parts: { wristL: [111.5, 85.1], eeL: [149.5, 107.5], wristR: [81.5, 164.0], eeR: [116.2, 228.6],
               torso: [94.2, 40.6], image: [120.4, 85.9] },
      anchors: { root: [63.6, 158.0], ego: [124.9, 48.3], wrist: [101.8, 168.9] },
      mods: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'image', 'embod'],
      notes: { eeL: '5 fingertips', eeR: '5 fingertips' },
      summary: 'Both wrists and end-effector links (5 fingertips per hand), torso, egocentric image, and ' +
               'embodiment tokens.',
      frames: { root: 'below the head at start', ego: 'tracked head (camera)', wrist: '5 fingertips per hand' },
      frameSummary: 'ℱ<sub>root</sub> is the ground below the head at the start of the episode, ℱ<sub>ego</sub> ' +
                    'the tracked head carrying the stereo camera, and ℱ<sub>wrist</sub> the tracked wrist. Its ' +
                    'torso pose is the head pose in ℱ<sub>root</sub>.',
      acts: ['wristL', 'eeL', 'wristR', 'eeR', 'torso'],
      actNotes: { eeL: '5 fingertips', eeR: '5 fingertips' },
      outSummary: '5 action experts: both wrists, both end-effector links (5 fingertips per hand), and the torso ' +
                  '(head) pose, supervised by human demonstrations during pretraining.',
      clip: { src: 'human-dex5/scoop/human-demo-01.mp4', task: 'Scoop', demo: true },
      dream: [['Ego image', 'its egocentric image']] },
    { key: 'g1-dex5', name: 'G1-Dex5', w: 284, h: 236, gap: 4, disc: [110.1, 203.3],
      rows: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'proprio', 'image', 'embod', 'disc', 'triRoot', 'triEgo',
             'triWrist'],
      parts: { wristL: [204.1, 124.2], eeL: [253.0, 161.0], wristR: [31.0, 149.3], eeR: [97.8, 167.1],
               torso: [101.7, 68.4], image: [134.2, 77.5] },
      anchors: { root: [117.7, 195.0], ego: [144.2, 59.7], wrist: [24.4, 151.8] },
      mods: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'proprio', 'image', 'embod'],
      notes: { eeL: '5 fingertips', eeR: '5 fingertips', proprio: '29+6+6 joints' },
      summary: 'Both wrists and end-effector links (5 fingertips per hand), torso, proprioception (29 + 6 + 6 ' +
               'joints), egocentric image, and embodiment tokens.',
      frames: { root: 'stance frame at the feet', ego: 'virtual head on torso', wrist: '5 fingertips per hand',
                native: '29+6+6 joints' },
      frameSummary: 'ℱ<sub>root</sub> is the stance frame at the feet, from leg kinematics; ℱ<sub>ego</sub> a ' +
                    'virtual head frame on the torso link; each ℱ<sub>wrist</sub> lies 0.05 m beyond a wrist-yaw ' +
                    'joint.',
      acts: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'vel'],
      actNotes: { eeL: '5 fingertips', eeR: '5 fingertips', vel: '3-D command' },
      outSummary: '6 action experts: both wrists, both end-effector links (5 fingertips per hand), the torso pose, ' +
                  'and velocity commands.',
      clip: { src: 'g1-dex5/scoop/id/mxt-plus-x-embodiment-pretrain-01.mp4', task: 'Scoop' },
      dream: [['Ego image', 'its egocentric image'], ['Robot joints (29)', '29 robot joint states'],
              ['EE joints (6 + 6)', '6 + 6 end-effector joint states']] },
    { key: 'xarm7-dex4', name: 'xArm7-Dex4', w: 280, h: 300, gap: 4, disc: [55.2, 280.2],
      rows: ['wristR', 'eeR', 'proprio', 'image', 'embod', 'disc', 'triRoot', 'triWrist'],
      parts: { wristR: [186.9, 183.1], eeR: [238.0, 254.7], image: [171.2, 122.7] },
      anchors: { root: [79.4, 259.3], ego: [79.4, 259.3], wrist: [209.0, 187.2] },
      mods: ['wristR', 'eeR', 'proprio', 'image', 'embod'],
      notes: { eeR: '4 fingertips', proprio: '7+16 joints' },
      summary: 'Right wrist and end-effector link (4 fingertips), proprioception (7 + 16 joints), egocentric ' +
               'image, and embodiment tokens.',
      frames: { root: 'arm base', ego: 'arm base (static camera)', wrist: '4 fingertips', native: '7+16 joints' },
      frameSummary: 'A fixed base and a static camera: ℱ<sub>root</sub> and ℱ<sub>ego</sub> coincide with the arm ' +
                    'base frame, and ℱ<sub>wrist</sub> is the joint-7 frame.',
      acts: ['wristR', 'eeR'],
      actNotes: { eeR: '4 fingertips' },
      outSummary: '2 action experts: the right wrist and the right end-effector link (4 fingertips).',
      clip: { src: 'xarm7-dex4/scoop/id/mxt-plus-x-embodiment-pretrain-01.mp4', task: 'Scoop' },
      dream: [['Ego image', 'its egocentric image'], ['Robot joints (7)', '7 robot joint states'],
              ['EE joints (16)', '16 end-effector joint states']] },
    { key: 'g1-sim-dex3', name: 'G1-Sim-Dex3', w: 216, h: 392, gap: 4, disc: [124.7, 364.1],
      rows: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'proprio', 'image', 'embod', 'disc', 'triRoot', 'triEgo',
             'triWrist'],
      parts: { wristL: [179.1, 147.8], eeL: [129.8, 115.2], wristR: [36.5, 153.3], eeR: [78.7, 106.1],
               torso: [93.9, 124.2], image: [111.4, 80.5] },
      anchors: { root: [108.9, 344.3], ego: [99.5, 46.2], wrist: [25.5, 138.6] },
      mods: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'proprio', 'image', 'embod'],
      notes: { eeL: '3 fingertips', eeR: '3 fingertips', proprio: '29+7+7 joints' },
      summary: 'Both wrists and end-effector links (3 fingertips per hand), torso, proprioception (29 + 7 + 7 ' +
               'joints), egocentric image, and embodiment tokens.',
      frames: { root: 'stance frame at the feet', ego: 'virtual head on torso', wrist: '3 fingertips per hand',
                native: '29+7+7 joints' },
      frameSummary: 'The same frames as G1-Dex5: the stance frame at the feet, a virtual head frame on the torso ' +
                    'link, and a wrist frame beyond each wrist-yaw joint.',
      acts: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'vel'],
      actNotes: { eeL: '3 fingertips', eeR: '3 fingertips', vel: '3-D command' },
      outSummary: '6 action experts: both wrists, both end-effector links (3 fingertips per hand), the torso pose, ' +
                  'and velocity commands for walking.',
      clip: { src: 'g1-sim-dex3/kitchen-cleanup/id/mxt-plus-x-embodiment-pretrain-02.mp4', task: 'Kitchen-Cleanup' },
      dream: [['Ego image', 'its egocentric image'], ['Robot joints (29)', '29 robot joint states'],
              ['EE joints (7 + 7)', '7 + 7 end-effector joint states']] },
    { key: 'locoman-dex2', name: 'LocoMan-Dex2', w: 312, h: 276, gap: 4, disc: [165.4, 219.9],
      rows: ['wristR', 'eeR', 'torso', 'proprio', 'image', 'embod', 'disc', 'triRoot', 'triEgo', 'triWrist'],
      parts: { wristR: [142.1, 197.6], eeR: [163.3, 195.0], torso: [189.1, 64.7], image: [262.6, 53.9] },
      anchors: { root: [173.7, 218.5], ego: [163.3, 16.9], wrist: [160.7, 184.3] },
      mods: ['wristR', 'eeR', 'torso', 'proprio', 'image', 'embod'],
      notes: { eeR: '2 fingertips', proprio: '18+1 joints' },
      summary: 'Right wrist and end-effector link (2 fingertips), torso, proprioception (18 + 1 joints), ' +
               'egocentric image, and embodiment tokens.',
      frames: { root: 'trunk at mode entry', ego: 'trunk', wrist: '2 fingertips', native: '18+1 joints' },
      frameSummary: 'ℱ<sub>root</sub> is the ground projection of the trunk at mode entry, fixed to the stance ' +
                    'feet, and ℱ<sub>ego</sub> is the trunk frame; the gripper pose follows from the manipulating ' +
                    'leg\'s kinematics.',
      acts: ['wristR', 'eeR', 'torso'],
      actNotes: { eeR: '2 fingertips' },
      outSummary: '3 action experts: the right wrist, the right end-effector link (2 fingertips), and the torso pose.',
      clip: { src: 'locoman-dex2/scoop/id/mxt-plus-x-embodiment-pretrain-01.mp4', task: 'Scoop' },
      dream: [['Ego image', 'its egocentric image'], ['Robot joints (18)', '18 robot joint states'],
              ['EE joint (1)', '1 end-effector joint state']] },
    { key: 'r1lite-gripper', name: 'R1Lite-Gripper', w: 264, h: 392, gap: 4, disc: [102.4, 363.4],
      rows: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'proprio', 'image', 'embod', 'disc', 'triEgo', 'triWrist'],
      parts: { wristL: [208.4, 60.0], eeL: [221.6, 69.1], wristR: [125.3, 87.8], eeR: [169.8, 80.2],
               torso: [113.7, 127.5], image: [175.5, 44.3] },
      anchors: { root: [108.0, 360.3], ego: [164.1, 182.2], wrist: [137.6, 72.6] },
      mods: ['wristL', 'eeL', 'wristR', 'eeR', 'torso', 'proprio', 'image', 'embod'],
      notes: { eeL: '2 fingertips', eeR: '2 fingertips', proprio: '15+1+1 joints' },
      summary: 'Both wrists and end-effector links (2 fingertips per gripper), torso, proprioception (15 + 1 + 1 ' +
               'joints), egocentric image, and embodiment tokens.',
      frames: { root: 'wheeled chassis', ego: 'floating base', wrist: '2 fingertips per gripper',
                native: '15+1+1 joints' },
      frameSummary: 'ℱ<sub>root</sub> is the wheeled chassis and ℱ<sub>ego</sub> the floating base, the top torso ' +
                    'link that carries the head camera and both arms; the wrist frames are the vendor end-effector ' +
                    'frames.',
      acts: ['wristL', 'eeL', 'wristR', 'eeR', 'vel'],
      actNotes: { eeL: '2 fingertips', eeR: '2 fingertips', vel: '3-D command' },
      outSummary: '5 action experts: both wrists, both end-effector links (2 fingertips per gripper), and velocity ' +
                  'commands for the wheeled chassis; it predicts no torso target.',
      clip: { src: 'r1lite-gripper/kitchen-bread/id/mxt-plus-x-embodiment-pretrain-05.mp4', task: 'Kitchen-Bread' },
      dream: [['Ego image', 'its egocentric image'], ['Robot joints (15)', '15 robot joint states'],
              ['EE joints (1 + 1)', '1 + 1 end-effector joint states']] },
    { key: 'z1-tool', name: 'Z1-Tool', w: 284, h: 256, gap: 4, disc: [59.7, 236.0],
      rows: ['wristR', 'eeR', 'proprio', 'image', 'embod', 'disc', 'triRoot', 'triWrist'],
      parts: { wristR: [134.5, 167.0], eeR: [211.9, 199.0], image: [234.5, 46.2] },
      anchors: { root: [81.0, 216.4], ego: [81.0, 216.4], wrist: [130.9, 144.3] },
      mods: ['wristR', 'eeR', 'proprio', 'image', 'embod'],
      notes: { eeR: '1 scoop point', proprio: '6 joints' },
      summary: 'Right wrist and end-effector link (1 scoop keypoint), proprioception (6 joints), egocentric ' +
               'image, and embodiment tokens.',
      frames: { root: 'arm base, turned −90°', ego: 'arm base (static camera)', wrist: '1 scoop point',
                native: '6 joints' },
      frameSummary: 'A fixed base and a static camera: ℱ<sub>root</sub> and ℱ<sub>ego</sub> coincide, the arm ' +
                    'base frame turned −90° about z; ℱ<sub>wrist</sub> is the joint-6 frame, and the scoop ' +
                    'keypoint lies 0.2 m beyond it.',
      acts: ['wristR'],
      actNotes: {},
      outSummary: '1 action expert: the right wrist pose. Its scoop is fixed, so it has no end-effector targets.',
      clip: { src: 'z1-tool/scoop/id/mxt-plus-x-embodiment-pretrain-04.mp4', task: 'Scoop' },
      dream: [['Ego image', 'its egocentric image'], ['Robot joints (6)', '6 robot joint states']] },
  ];

  const MOD = Object.fromEntries(MODS.map((m) => [m.key, m]));
  const ACT = Object.fromEntries(ACTS.map((a) => [a.key, a]));
  const BODY = Object.fromEntries(BODIES.map((b) => [b.key, b]));
  const HUES = Object.fromEntries([...MODS, ...ACTS].map((m) => [m.key, { fill: m.fill, ink: m.ink }]));
  const PURPLE = { fill: '#B4A7D7', ink: '#6A57A6' };
  const PALE = { fill: '#E4DEF3', ink: '#6A57A6' };

  const make = (tag, attrs, parent) => {
    const node = document.createElementNS(NS, tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (parent) parent.appendChild(node);
    return node;
  };
  const onActivate = (node, handler) => {
    node.addEventListener('click', handler);
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler(event);
      }
    });
  };
  const toggle = (node, on) => {
    node.classList.toggle('is-on', on === true);
    node.classList.toggle('is-off', on === false);
  };
  const pulse = (node, keyframes, duration) => {
    if (node && node.animate && !REDUCED) node.animate(keyframes, { duration, easing: 'ease-out' });
  };
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
  const listing = (items) => (items.length < 3 ? items.join(' and ') :
    `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`);
  const lengths = new WeakMap();
  const lengthOf = (path) => {
    if (!lengths.has(path)) lengths.set(path, path.getTotalLength());
    return lengths.get(path);
  };

  // The SVG of one figure, its layers in paint order, and the images it loads once it is near the viewport.
  function scaffold(figure, height, label, names) {
    const svg = make('svg', { class: 'mv-svg', viewBox: `0 0 ${W} ${height}`, role: 'group', 'aria-label': label },
      figure.querySelector('.mv-stage'));
    const layers = Object.fromEntries(names.map((name) => [name, make('g', { class: `mv-${name}` }, svg)]));
    return { svg, layers, lazy: [] };
  }

  // A body's sprite rows: the body itself, then each overlay in keys that the body's sprite has.
  function placeBody(parent, b, x, y, scale, keys, lazy) {
    const total = (b.h + b.gap) * (b.rows.length + 1) - b.gap;
    const src = `${SPRITE_DIR}${b.key}.webp?v=${SPRITE_VERSION}`;
    const row = (k, cls) => {
      const view = make('svg', { class: cls, x, y, width: b.w * scale, height: b.h * scale,
        viewBox: `0 ${k * (b.h + b.gap)} ${b.w} ${b.h}`, 'aria-hidden': 'true' }, parent);
      lazy.push([make('image', { width: b.w, height: total, preserveAspectRatio: 'none' }, view), 'href', src]);
      return view;
    };
    const body = row(0, 'mv-body');
    const overlays = {};
    keys.forEach((key) => {
      const k = b.rows.indexOf(key);
      if (k >= 0) overlays[key] = row(k + 1, 'mv-overlay');
    });
    return { body, overlays, at: ([px, py]) => [x + px * scale, y + py * scale] };
  }

  function drawTrunk(layer, y, h) {
    make('rect', { class: 'mv-trunk-body', x: 4, y, width: W - 8, height: h, rx: 14 }, layer);
    const glow = make('rect', { class: 'mv-trunk-glow', x: 4, y, width: W - 8, height: h, rx: 14 }, layer);
    const label = make('text', { class: 'mv-trunk-label', x: W / 2, y: y + h / 2 + 6, 'text-anchor': 'middle' }, layer);
    label.append('Shared Transformer trunk ');
    make('tspan', { 'font-style': 'italic' }, label).textContent = 'G';
    make('tspan', { dy: 4, 'font-size': 11 }, label).textContent = 'θ';
    return glow;
  }

  function drawSegment(layer, x, y, w, h, m, prefix, aria) {
    const g = make('g', { class: 'mv-seg', tabindex: 0, role: 'button', 'aria-pressed': 'false', 'aria-label': aria },
      layer);
    const rect = make('rect', { x, y, width: w, height: h, rx: 9, fill: m.fill, stroke: m.ink }, g);
    const label = make('text', { class: 'mv-seg-label', x: x + w / 2, y: y + 18, 'text-anchor': 'middle', fill: m.ink }, g);
    label.textContent = m.label;
    const sub = make('text', { class: 'mv-seg-sub', x: x + w / 2, y: y + 34, 'text-anchor': 'middle' }, g);
    if (m.frame) {
      sub.append(`${prefix}ℱ`);
      make('tspan', { dy: 3, 'font-size': 8 }, sub).textContent = m.frame;
    } else {
      sub.textContent = m.sub;
    }
    return { g, rect };
  }

  function drawName(layer, cx, nameY, noteY, name) {
    const label = make('text', { class: 'mv-name', x: cx, y: nameY, 'text-anchor': 'middle' }, layer);
    label.textContent = name;
    const note = make('text', { class: 'mv-note', x: cx, y: noteY, 'text-anchor': 'middle' }, layer);
    return { label, note };
  }

  // Square tokens travelling along paths. Each flow fires on its own period while the figure is on screen.
  function chipEngine(layer) {
    let flows = [];
    const live = [];
    let raf = 0;
    let visible = false;
    const place = (node, p, size) => node.setAttribute('transform',
      `translate(${(p.x - size / 2).toFixed(1)} ${(p.y - size / 2).toFixed(1)})`);
    const kick = () => {
      if (!raf && visible && (flows.length || live.length)) raf = requestAnimationFrame(tick);
    };
    function tick(now) {
      raf = 0;
      if (!visible) return;
      flows.forEach((f) => {
        if (now < f.next) return;
        f.next = Math.max(f.next + f.period, now + 200);
        f.fire();
      });
      for (let i = live.length - 1; i >= 0; i -= 1) {
        const chip = live[i];
        const t = (now - chip.t0) / chip.dur;
        if (t >= 1) {
          chip.node.remove();
          live.splice(i, 1);
          if (chip.done) chip.done();
          continue;
        }
        place(chip.node, chip.path.getPointAtLength(ease(Math.max(0, t)) * chip.len), chip.size);
      }
      kick();
    }
    return {
      launch(path, size, hue, dur, done) {
        const node = make('rect', { class: 'mv-chip', width: size, height: size, rx: size / 4, fill: hue.fill,
          stroke: hue.ink }, layer);
        place(node, path.getPointAtLength(0), size);
        live.push({ node, path, len: lengthOf(path), size, dur, done, t0: performance.now() });
        kick();
      },
      set(list, offset) {
        const now = performance.now();
        flows = REDUCED ? [] : list;
        flows.forEach((f, k) => {
          f.next = now + (offset ? offset(f, k) : 60 + k * 45);
        });
        kick();
      },
      clear() {
        live.splice(0).forEach((chip) => chip.node.remove());
      },
      show(v) {
        visible = v;
        kick();
      },
    };
  }

  // The guided tour of one figure. Steps advance on their own while the figure is on screen and playing; selecting
  // anything pauses it. With reduced motion, the last step is shown, still.
  function makeTour(figure, steps, hooks) {
    const textEl = figure.querySelector('.mv-text');
    const playButton = figure.querySelector('.mv-play');
    const stepList = figure.querySelector('.mv-steps');
    let step = 0;
    let playing = !REDUCED;
    let touring = false;
    let visible = false;
    let timer = 0;

    const buttons = steps.map((s, i) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(i + 1);
      button.setAttribute('aria-label', `Step ${i + 1}`);
      button.addEventListener('click', () => {
        playing = false;
        markPlay();
        show(i);
      });
      item.appendChild(button);
      stepList.appendChild(item);
      return button;
    });

    function setText(html, auto) {
      textEl.innerHTML = `<span>${html}</span>`;
      textEl.setAttribute('aria-live', auto ? 'off' : 'polite');
    }
    function markStep(i) {
      buttons.forEach((button, k) => {
        if (k === i) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
    }
    function markPlay() {
      playButton.setAttribute('aria-pressed', String(playing));
      playButton.setAttribute('aria-label', playing ? 'Pause the walkthrough' : 'Play the walkthrough');
    }
    function halt() {
      clearTimeout(timer);
      timer = 0;
      if (hooks.leave) hooks.leave();
    }
    function show(i) {
      halt();
      step = i;
      touring = true;
      markStep(i);
      setText(steps[i].text, playing);
      hooks.enter(steps[i]);
      if (playing && visible) timer = setTimeout(() => show((i + 1) % steps.length), steps[i].ms);
    }

    playButton.addEventListener('click', () => {
      playing = !playing;
      markPlay();
      if (playing) {
        show(touring ? step : 0);
      } else {
        halt();
        textEl.setAttribute('aria-live', 'polite');
      }
    });
    markPlay();

    return {
      setText,
      start() {
        if (REDUCED) show(steps.length - 1);
      },
      pause() {
        playing = false;
        touring = false;
        halt();
        markPlay();
        markStep(-1);
      },
      setVisible(v) {
        visible = v;
        if (!v) {
          clearTimeout(timer);
          timer = 0;
          if (hooks.leave) hooks.leave();
        } else if (playing) {
          show(step);
        }
      },
    };
  }

  // Loads a figure's images once it is near the viewport, and reports when it is on screen. Each entry of lazy is
  // [node, attribute, value] or a function.
  function watch(figure, lazy, onVisible) {
    const load = () => lazy.splice(0).forEach((item) => (typeof item === 'function' ? item() :
      item[0].setAttribute(item[1], item[2])));
    if (!('IntersectionObserver' in window)) {
      load();
      onVisible(true);
      return;
    }
    new IntersectionObserver((entries, observer) => {
      if (entries.some((e) => e.isIntersecting)) {
        load();
        observer.disconnect();
      }
    }, { rootMargin: '800px 0px' }).observe(figure);
    new IntersectionObserver((entries) => onVisible(entries.some((e) => e.isIntersecting)), { threshold: 0.25 })
      .observe(figure);
  }

  // A sweep through the bodies, one every ms, ending on done().
  const SWEEP_MS = 800;
  function sweeper(ms = SWEEP_MS) {
    let timer = 0;
    return {
      run(each, done) {
        clearInterval(timer);
        let k = 0;
        each(BODIES[0]);
        timer = setInterval(() => {
          k += 1;
          if (k < BODIES.length) {
            each(BODIES[k]);
          } else {
            clearInterval(timer);
            done();
          }
        }, ms);
      },
      stop() {
        clearInterval(timer);
      },
    };
  }

  // 01: the unified egocentric frames.
  function initFrames(figure) {
    const H = 354;
    const GROUND = 204, NAME_Y = 228, NOTE_Y = 242;
    const CARD_Y = 262, CARD_H = 86, CARD_W = 232, CARD_STEP = 240;
    const HINT = 'Select a frame or a body to see where its poses are expressed.';
    const ALL = 'Every embodiment uses the same three frames, each with x pointing forward, y to the left, and z up.';
    const STEPS = [...FRAMES.map((f) => ({ kind: 'frame', frame: f.key, ms: 4800, text: f.text })),
      { kind: 'all', ms: 5200, text: ALL }];
    const OVERLAYS = ['disc', 'triRoot', 'triEgo', 'triWrist', 'torso', 'wristL', 'wristR', 'eeL', 'eeR', 'proprio'];
    const TRIADS = ['disc', 'triRoot', 'triEgo', 'triWrist'];
    const keysFor = (b, frame) => ({
      root: ['disc', 'triRoot', 'torso'],
      ego: [b.rows.includes('triEgo') ? 'triEgo' : 'triRoot', 'wristL', 'wristR'],
      wrist: ['triWrist', 'eeL', 'eeR'],
      native: ['proprio'],
    })[frame];

    const { layers, lazy } = scaffold(figure, H, 'Embodiments and the three frames shared by all of them',
      ['figs', 'labels', 'cards']);

    const items = BODIES.map((b, i) => {
      const cx = COL * (i + 0.5);
      const fig = make('g', { class: 'mv-fig' }, layers.figs);
      const hit = make('rect', { class: 'mv-hit', x: cx - COL / 2 + 3, y: 6, width: COL - 6, height: NOTE_Y - 2,
        rx: 10, tabindex: 0, role: 'button', 'aria-pressed': 'false', 'aria-label': `Show the frames of ${b.name}` },
        fig);
      const sprite = placeBody(fig, b, cx - (b.w * SCALE) / 2, GROUND - b.disc[1] * SCALE, SCALE, OVERLAYS, lazy);
      onActivate(hit, () => select({ kind: 'body', body: b.key }));
      return { b, fig, hit, ...sprite, ...drawName(layers.labels, cx, NAME_Y, NOTE_Y, b.name) };
    });

    const cards = {};
    FRAMES.forEach((f, j) => {
      const x = 4 + j * CARD_STEP;
      const g = make('g', { class: 'mv-fcard', tabindex: 0, role: 'button', 'aria-pressed': 'false',
        'aria-label': `Show the ${f.title.toLowerCase()}` }, layers.cards);
      make('rect', { class: 'mv-fcard-bg', x, y: CARD_Y, width: CARD_W, height: CARD_H, rx: 10 }, g);
      if (f.key !== 'native') {
        const sym = make('text', { class: 'mv-fcard-sym', x: x + 14, y: CARD_Y + 27 }, g);
        sym.append('ℱ');
        make('tspan', { dy: 4, 'font-size': 11.5 }, sym).textContent = f.key;
      }
      make('text', { class: 'mv-fcard-title', x: f.key === 'native' ? x + 14 : x + 70, y: CARD_Y + 24 }, g)
        .textContent = f.title;
      make('text', { class: 'mv-fcard-desc', x: x + 14, y: CARD_Y + 45 }, g).textContent = f.desc;
      let tx = x + 14;
      f.mods.forEach((key) => {
        const rect = make('rect', { class: 'mv-tag', x: tx, y: CARD_Y + 55, height: 20, rx: 5, fill: HUES[key].fill,
          stroke: HUES[key].ink }, g);
        const t = make('text', { class: 'mv-tag-label', y: CARD_Y + 69, 'text-anchor': 'middle', fill: HUES[key].ink },
          g);
        t.textContent = TAGS[key];
        const w = (t.getComputedTextLength() || TAGS[key].length * 5.9) + 16;
        rect.setAttribute('width', w);
        t.setAttribute('x', tx + w / 2);
        tx += w + 6;
      });
      onActivate(g, () => select({ kind: 'frame', frame: f.key }));
      cards[f.key] = g;
    });

    let state = { kind: 'none' };
    const tour = makeTour(figure, STEPS, { enter: (s) => apply({ ...s, tour: true }) });

    function apply(s) {
      state = s;
      const frame = s.kind === 'frame' ? s.frame : null;
      items.forEach((it) => {
        const { b } = it;
        const on = s.kind === 'body' ? b.key === s.body : frame === 'native' ? b.rows.includes('proprio') : true;
        [it.fig, it.label, it.note].forEach((node) => node.classList.toggle('is-dim', !on));
        const lit = frame ? keysFor(b, frame) : s.kind === 'all' || (s.kind === 'body' && on) ? TRIADS : [];
        it.body.classList.toggle('is-faded', on && lit.length > 0);
        Object.entries(it.overlays).forEach(([key, view]) => view.classList.toggle('is-on', on && lit.includes(key)));
        it.note.textContent = frame && on ? b.frames[frame] : '';
        it.hit.setAttribute('aria-pressed', String(s.kind === 'body' && b.key === s.body && !s.tour));
      });
      FRAMES.forEach((f) => {
        toggle(cards[f.key], s.kind === 'frame' ? f.key === frame : s.kind === 'all' ? true : null);
        cards[f.key].setAttribute('aria-pressed', String(f.key === frame && !s.tour));
      });
      if (s.tour) return;
      if (s.kind === 'body') tour.setText(`<b>${BODY[s.body].name}</b>: ${BODY[s.body].frameSummary}`, false);
      else if (frame) tour.setText(FRAMES.find((f) => f.key === frame).text, false);
      else tour.setText(HINT, false);
    }

    function select(s) {
      tour.pause();
      const same = !state.tour && s.kind === state.kind && (s.kind === 'body' ? s.body === state.body : s.frame === state.frame);
      apply(same ? { kind: 'none' } : s);
    }

    apply({ kind: 'none' });
    tour.start();
    watch(figure, lazy, (v) => tour.setVisible(v));
  }

  // 02: the modular inputs.
  function initInputs(figure) {
    const H = 564;
    const GROUND = 198, NAME_Y = 246, NOTE_Y = 260;
    const CARD_Y = 268, MOD_W = 11, MOD_H = 13, MOD_STEP = 14;
    const BAND_Y = 428, BAND_H = 44, SEG_W = 112, SEG_STEP = 120;
    const TRUNK_Y = 504, TRUNK_H = 50;
    const CARD_W = MOD_STEP * (MODS.length - 1) + MOD_W;
    const HINT = 'Select a body or a modality to trace its tokens.';
    const STEPS = [
      { kind: 'sweep', ms: 6000,
        text: 'Each embodiment encodes every modality with its own tokenizer, instead of one tokenizer for all of its inputs.' },
      { kind: 'mod', mod: 'wristR', ms: 4400,
        text: 'Seven right wrists, each in its own ℱ<sub>ego</sub>, reach the shared trunk as one modality.' },
      { kind: 'mod', mod: 'wristL', ms: 4200,
        text: 'Only the four two-armed bodies provide a left wrist; the others omit it.' },
      { kind: 'mod', mod: 'eeR', ms: 4600,
        text: 'End-effector links are keypoints in ℱ<sub>wrist</sub>: five, four, three, or two fingertips, or a scoop point.' },
      { kind: 'mod', mod: 'proprio', ms: 4600,
        text: 'Proprioception stays embodiment-specific: joint states remain in their own joint space.' },
      { kind: 'all', ms: 5600,
        text: 'The shared trunk receives each modality with the same meaning from every embodiment that provides it.' },
    ];
    const modIndex = Object.fromEntries(MODS.map((m, j) => [m.key, j]));
    const providers = Object.fromEntries(MODS.map((m) => [m.key, BODIES.filter((b) => b.mods.includes(m.key))]));

    const { layers, lazy } = scaffold(figure, H,
      'Embodiments, their modality tokenizers, the shared modality vocabulary, and the shared trunk',
      ['curves', 'figs', 'leaders', 'labels', 'cards', 'band', 'links', 'trunk', 'chips']);
    const chips = chipEngine(layers.chips);

    const items = BODIES.map((b, i) => {
      const cx = COL * (i + 0.5);
      const left = cx - CARD_W / 2;
      const moduleX = (key) => left + modIndex[key] * MOD_STEP;
      const fig = make('g', { class: 'mv-fig' }, layers.figs);
      const hit = make('rect', { class: 'mv-hit', x: cx - COL / 2 + 3, y: 6, width: COL - 6, height: CARD_Y - 10,
        rx: 10, tabindex: 0, role: 'button', 'aria-pressed': 'false', 'aria-label': `Trace the tokenizers of ${b.name}` },
        fig);
      const sprite = placeBody(fig, b, cx - (b.w * SCALE) / 2, GROUND - b.disc[1] * SCALE, SCALE, b.mods, lazy);
      onActivate(hit, () => select({ kind: 'body', body: b.key }));

      const card = make('g', { class: 'mv-card-g' }, layers.cards);
      const plate = make('rect', { class: 'mv-plate', x: left - 5, y: CARD_Y, width: CARD_W + 10, height: MOD_H + 12,
        rx: 7 }, card);
      plate.addEventListener('click', () => select({ kind: 'body', body: b.key }));
      const modules = {};
      MODS.forEach((m) => {
        const mx = moduleX(m.key);
        if (!b.mods.includes(m.key)) {
          make('circle', { class: 'mv-socket', cx: mx + MOD_W / 2, cy: CARD_Y + 6 + MOD_H / 2, r: 1.6 }, card);
          return;
        }
        const module = make('rect', { class: 'mv-module', x: mx, y: CARD_Y + 6, width: MOD_W, height: MOD_H, rx: 2.5,
          fill: m.fill, stroke: m.ink }, card);
        make('title', null, module).textContent = `${b.name}: ${m.name.toLowerCase()} tokenizer`;
        module.addEventListener('click', () => select({ kind: 'mod', mod: m.key }));
        modules[m.key] = module;
      });
      return { b, fig, hit, card, modules, moduleX, ...sprite, ...drawName(layers.labels, cx, NAME_Y, NOTE_Y, b.name) };
    });
    const itemOf = Object.fromEntries(items.map((it) => [it.b.key, it]));

    const segments = {};
    MODS.forEach((m, j) => {
      const x = 4 + j * SEG_STEP;
      const cx = x + SEG_W / 2;
      const seg = drawSegment(layers.band, x, BAND_Y, SEG_W, BAND_H, m, 'in ', `Trace ${m.name.toLowerCase()}`);
      seg.link = make('path', { class: 'mv-link', d: `M${cx},${BAND_Y + BAND_H} V${TRUNK_Y}`, stroke: m.ink }, layers.links);
      onActivate(seg.g, () => select({ kind: 'mod', mod: m.key }));
      segments[m.key] = seg;
    });
    const trunkGlow = drawTrunk(layers.trunk, TRUNK_Y, TRUNK_H);

    // One curve per tokenizer, from its module to its modality; curves of one modality land side by side.
    const curves = [];
    items.forEach((it) => {
      it.b.mods.forEach((key) => {
        const list = providers[key];
        const k = list.indexOf(it.b);
        const x0 = it.moduleX(key) + MOD_W / 2;
        const y0 = CARD_Y + 6 + MOD_H;
        const x1 = 4 + modIndex[key] * SEG_STEP + SEG_W / 2 + (list.length > 1 ? (k / (list.length - 1) - 0.5) * 64 : 0);
        const path = make('path', { class: 'mv-curve', stroke: MOD[key].ink,
          d: `M${x0},${y0} C${x0},${y0 + 72} ${x1},${BAND_Y - 72} ${x1},${BAND_Y}` }, layers.curves);
        curves.push({ it, mod: key, path });
      });
    });

    let state = { kind: 'none' };
    const sweep = sweeper();
    const tour = makeTour(figure, STEPS, {
      enter(s) {
        if (s.kind === 'sweep') {
          sweep.run((b) => apply({ kind: 'body', body: b.key, tour: true }), () => apply({ kind: 'none', tour: true }));
        } else {
          apply({ kind: s.kind, mod: s.mod, tour: true });
        }
      },
      leave: () => sweep.stop(),
    });

    const bodyOn = (b, s) => (s.kind === 'body' ? b.key === s.body : s.kind === 'mod' ? b.mods.includes(s.mod) : true);
    const curveOn = (c, s) => {
      if (s.kind === 'none') return null;
      if (s.kind === 'all') return true;
      return s.kind === 'body' ? c.it.b.key === s.body : c.mod === s.mod;
    };
    const segmentOn = (key, s) => {
      if (s.kind === 'none') return null;
      if (s.kind === 'all') return true;
      return s.kind === 'mod' ? key === s.mod : BODY[s.body].mods.includes(key);
    };

    function apply(s) {
      state = s;
      const traced = s.kind === 'mod' ? MOD[s.mod] : null;
      items.forEach((it) => {
        const { b } = it;
        const on = bodyOn(b, s);
        [it.fig, it.label, it.note, it.card].forEach((node) => node.classList.toggle('is-dim', !on));
        it.body.classList.toggle('is-faded', Boolean(traced) && on);
        Object.entries(it.overlays).forEach(([key, view]) => view.classList.toggle('is-on', Boolean(traced) && key === s.mod));
        Object.entries(it.modules).forEach(([key, module]) => {
          toggle(module, s.kind === 'none' ? null : s.kind === 'all' || (s.kind === 'body' ? b.key === s.body : key === s.mod));
        });
        const note = traced ? (on && b.notes[s.mod]) || '' : `${b.mods.length} tokenizers`;
        it.note.textContent = note;
        it.note.style.fill = traced && note ? traced.ink : '';
        it.hit.setAttribute('aria-pressed', String(s.kind === 'body' && b.key === s.body && !s.tour));
      });
      curves.forEach((c) => toggle(c.path, curveOn(c, s)));
      MODS.forEach((m) => {
        toggle(segments[m.key].g, segmentOn(m.key, s));
        segments[m.key].g.setAttribute('aria-pressed', String(s.kind === 'mod' && m.key === s.mod && !s.tour));
      });
      drawLeaders(traced);
      if (!s.tour) tour.setText(readout(s), false);
      setFlows(s);
    }

    function drawLeaders(m) {
      layers.leaders.replaceChildren();
      if (!m || m.key === 'proprio' || m.key === 'embod') return;
      providers[m.key].forEach((b) => {
        const it = itemOf[b.key];
        const part = b.parts[m.key];
        if (!part) return;
        const [px, py] = it.at(part);
        const mx = it.moduleX(m.key) + MOD_W / 2;
        const my = CARD_Y + 6;
        make('path', { class: 'mv-leader', stroke: m.ink,
          d: `M${px},${py} C${px},${py + (my - py) * 0.55} ${mx},${my - (my - py) * 0.35} ${mx},${my}` }, layers.leaders);
        make('circle', { class: 'mv-leader-dot', cx: px, cy: py, r: 2.2, fill: m.ink }, layers.leaders);
      });
    }

    function readout(s) {
      if (s.kind === 'body') {
        const b = BODY[s.body];
        return `<b>${b.name}</b>: ${b.mods.length} tokenizers. ${b.summary}`;
      }
      if (s.kind === 'mod') {
        const m = MOD[s.mod];
        return `<b>${m.name}</b> ${m.where}: ${providers[s.mod].length} of ${BODIES.length} embodiments, ` +
          `each through its own tokenizer.${m.extra || ''}`;
      }
      return HINT;
    }

    // Tokens flow from the active tokenizers into the vocabulary, then into the trunk.
    function setFlows(s) {
      const all = s.kind === 'all';
      const active = curves.filter((c) => curveOn(c, s) === true).map((c) => ({
        period: all ? 2600 : 1700,
        fire() {
          const hue = HUES[c.mod];
          chips.launch(c.path, 9, hue, 1050, () => {
            const seg = segments[c.mod];
            pulse(seg.rect, [{ fillOpacity: 0.95 }, { fillOpacity: 0.55 }], 450);
            chips.launch(seg.link, 6, hue, 380, () => pulse(trunkGlow, [{ opacity: 0.3 }, { opacity: 0 }], 520));
          });
          pulse(c.it.modules[c.mod], [{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], 360);
        },
      }));
      chips.set(active, all ? (f) => Math.random() * f.period : null);
    }

    function select(s) {
      tour.pause();
      const same = !state.tour && s.kind === state.kind && (s.kind === 'body' ? s.body === state.body : s.mod === state.mod);
      apply(same ? { kind: 'none' } : s);
    }

    apply({ kind: 'none' });
    tour.start();
    watch(figure, lazy, (v) => {
      chips.show(v);
      tour.setVisible(v);
    });
  }

  // 03: the shared trunk and the modular outputs, with the selected body's rollout.
  function initOutputs(figure) {
    const H = 542;
    const TRUNK_Y = 6, TRUNK_H = 46;
    const BAND_Y = 84, BAND_H = 44, SEG_W = 150, SEG_STEP = 160.4;
    const CARD_Y = 252, MOD_W = 11, MOD_H = 13, MOD_STEP = 14;
    const CARD_W = MOD_STEP * (ACTS.length - 1) + MOD_W;
    const MOD_TOP = CARD_Y + 6, MOD_BOTTOM = CARD_Y + 6 + MOD_H;
    const GROUND = 470, NAME_Y = 518, NOTE_Y = 532;
    const HINT = 'Select a body or an action modality to trace its experts.';
    // Each sweep stop must outlast its tokens' trip (stagger + link + curve + lane in setFlows), so they reach the
    // body's experts before the sweep moves on.
    const STOP_MS = 1500;
    const STEPS = [
      { kind: 'all', ms: 5400,
        text: 'The shared trunk fuses each embodiment\'s tokens into action tokens, and every embodiment decodes them ' +
              'with its own action experts.' },
      { kind: 'sweep', ms: BODIES.length * STOP_MS + 700,
        text: 'Each embodiment decodes every action modality with its own expert: one for Z1-Tool, six for each G1.' },
      { kind: 'act', act: 'wristR', ms: 4600,
        text: 'Right-wrist targets in ℱ<sub>ego</sub> come from seven experts, one per embodiment; a single-arm ' +
              'robot\'s wrist is its right wrist.' },
      { kind: 'act', act: 'vel', ms: 4400,
        text: 'Velocity commands, in ℱ<sub>root</sub>, have experts only on G1-Dex5, G1-Sim-Dex3, and R1Lite-Gripper.' },
      { kind: 'body', body: 'g1-sim-dex3', ms: 6400,
        text: 'Each expert decodes a chunk of future targets for its modality, mapped to the robot\'s native control ' +
              'space: here, G1-Sim-Dex3\'s six.' },
      { kind: 'body', body: 'z1-tool', ms: 5800,
        text: 'Z1-Tool needs a single expert: its scoop is fixed, so the right wrist pose is its whole action.' },
    ];
    const actIndex = Object.fromEntries(ACTS.map((a, j) => [a.key, j]));
    const providers = Object.fromEntries(ACTS.map((a) => [a.key, BODIES.filter((b) => b.acts.includes(a.key))]));
    const target = (b, key) => (key === 'vel' ? b.disc : b.parts[key]);
    const overlayKey = (key) => (key === 'vel' ? 'disc' : key);

    const { svg, layers, lazy } = scaffold(figure, H,
      'The shared trunk, the shared action vocabulary, each embodiment\'s action experts, and the bodies they drive',
      ['trunk', 'links', 'band', 'curves', 'figs', 'lanes', 'labels', 'cards', 'chips']);
    const chips = chipEngine(layers.chips);
    const defs = make('defs', null, svg);
    ACTS.forEach((a) => {
      const marker = make('marker', { id: `mv-arrow-${a.key}`, viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 6,
        markerHeight: 6, orient: 'auto' }, defs);
      make('path', { d: 'M0,0.6 L5.6,3 L0,5.4 z', fill: a.ink }, marker);
    });

    const trunkGlow = drawTrunk(layers.trunk, TRUNK_Y, TRUNK_H);
    const segments = {};
    ACTS.forEach((a, j) => {
      const x = 4 + j * SEG_STEP;
      const cx = x + SEG_W / 2;
      const seg = drawSegment(layers.band, x, BAND_Y, SEG_W, BAND_H, a, a.key === 'vel' ? 'in ' : 'targets in ',
        `Trace ${a.name.toLowerCase()}`);
      seg.link = make('path', { class: 'mv-link', d: `M${cx},${TRUNK_Y + TRUNK_H} V${BAND_Y}`, stroke: a.ink }, layers.links);
      onActivate(seg.g, () => select({ kind: 'act', act: a.key }));
      segments[a.key] = seg;
    });

    const items = BODIES.map((b, i) => {
      const cx = COL * (i + 0.5);
      const left = cx - CARD_W / 2;
      const moduleX = (key) => left + actIndex[key] * MOD_STEP;
      const fig = make('g', { class: 'mv-fig' }, layers.figs);
      const hit = make('rect', { class: 'mv-hit', x: cx - COL / 2 + 3, y: CARD_Y + MOD_H + 18, width: COL - 6,
        height: NOTE_Y + 6 - (CARD_Y + MOD_H + 18), rx: 10, tabindex: 0, role: 'button', 'aria-pressed': 'false',
        'aria-label': `Trace the action experts of ${b.name}` }, fig);
      const sprite = placeBody(fig, b, cx - (b.w * SCALE) / 2, GROUND - b.disc[1] * SCALE, SCALE,
        b.acts.map(overlayKey), lazy);
      onActivate(hit, () => select({ kind: 'body', body: b.key }));

      const card = make('g', { class: 'mv-card-g' }, layers.cards);
      const plate = make('rect', { class: 'mv-plate', x: left - 5, y: CARD_Y, width: CARD_W + 10, height: MOD_H + 12,
        rx: 7 }, card);
      plate.addEventListener('click', () => select({ kind: 'body', body: b.key }));
      const modules = {};
      const lanes = {};
      ACTS.forEach((a) => {
        const mx = moduleX(a.key);
        if (!b.acts.includes(a.key)) {
          make('circle', { class: 'mv-socket', cx: mx + MOD_W / 2, cy: MOD_TOP + MOD_H / 2, r: 1.6 }, card);
          return;
        }
        const module = make('rect', { class: 'mv-module mv-expert', x: mx, y: MOD_TOP, width: MOD_W, height: MOD_H,
          rx: 2.5, fill: a.fill, stroke: a.ink }, card);
        make('title', null, module).textContent = `${b.name}: ${a.name.toLowerCase()} expert`;
        module.addEventListener('click', () => select({ kind: 'act', act: a.key }));
        modules[a.key] = module;
      });
      return { b, cx, fig, hit, card, modules, lanes, moduleX, ...sprite,
        ...drawName(layers.labels, cx, NAME_Y, NOTE_Y, b.name) };
    });

    // Dashed curves from each modality to its experts, and dashed lanes from each expert to the part it moves.
    const curves = [];
    items.forEach((it) => {
      it.b.acts.forEach((key) => {
        const list = providers[key];
        const k = list.indexOf(it.b);
        const x0 = it.moduleX(key) + MOD_W / 2;
        const x1 = 4 + actIndex[key] * SEG_STEP + SEG_W / 2 + (list.length > 1 ? (k / (list.length - 1) - 0.5) * 72 : 0);
        const y1 = BAND_Y + BAND_H;
        const path = make('path', { class: 'mv-curve mv-xcurve', stroke: ACT[key].ink,
          d: `M${x1},${y1} C${x1},${y1 + 66} ${x0},${MOD_TOP - 66} ${x0},${MOD_TOP}` }, layers.curves);
        const [px, py] = it.at(target(it.b, key));
        const dy = py - MOD_BOTTOM;
        it.lanes[key] = make('path', { class: 'mv-lane', stroke: ACT[key].ink, 'marker-end': `url(#mv-arrow-${key})`,
          d: `M${x0},${MOD_BOTTOM} C${x0},${MOD_BOTTOM + dy * 0.5} ${px},${py - dy * 0.4} ${px},${py - 3}` }, layers.lanes);
        curves.push({ it, act: key, path });
      });
    });

    // The rollout of the selected body.
    const panel = document.createElement('div');
    panel.className = 'mv-rollout';
    panel.innerHTML = '<div class="mv-rollout-media"><video muted playsinline loop preload="none"></video></div>' +
      '<div class="mv-rollout-info"><p class="mv-rollout-title"></p><p class="mv-rollout-sub"></p>' +
      '<ul class="mv-rollout-experts" aria-label="Action experts"></ul></div>';
    figure.appendChild(panel);
    const video = panel.querySelector('video');
    const titleEl = panel.querySelector('.mv-rollout-title');
    const subEl = panel.querySelector('.mv-rollout-sub');
    const expertList = panel.querySelector('.mv-rollout-experts');
    let focus = BODY['g1-sim-dex3'];
    let near = false;
    let visible = false;
    let wantPlay = false;
    const setPoster = () => {
      if (near) video.poster = `${SPRITE_DIR}rollout-${focus.key}.jpg?v=${SPRITE_VERSION}`;
    };
    lazy.push(() => {
      near = true;
      setPoster();
    });

    function showClip(b, play) {
      focus = b;
      wantPlay = play;
      titleEl.textContent = `${b.name} · ${b.clip.task}`;
      subEl.textContent = b.clip.demo ? 'Human demonstration, 1×' :
        'MXT+ with cross-embodiment pretraining, ID rollout, 1×';
      expertList.replaceChildren(...b.acts.map((key) => {
        const li = document.createElement('li');
        li.textContent = ACT[key].label;
        li.style.color = ACT[key].ink;
        li.style.background = `${ACT[key].fill}59`;
        return li;
      }));
      video.setAttribute('aria-label', `${b.name} ${b.clip.task} ${b.clip.demo ? 'demonstration' : 'rollout'}`);
      const src = VIDEO_DIR + b.clip.src;
      setPoster();
      if (video.dataset.src !== src) {
        video.dataset.src = src;
        video.removeAttribute('src');
        video.load();
      }
      syncVideo();
    }
    function syncVideo() {
      if (wantPlay && visible && !REDUCED) {
        if (!video.getAttribute('src')) video.src = video.dataset.src;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
    video.addEventListener('click', () => {
      tour.pause();
      wantPlay = video.paused;
      if (wantPlay && !video.getAttribute('src')) video.src = video.dataset.src;
      if (wantPlay) video.play().catch(() => {});
      else video.pause();
    });

    let state = { kind: 'none' };
    const sweep = sweeper(STOP_MS);
    const tour = makeTour(figure, STEPS, {
      enter(s) {
        if (s.kind === 'sweep') {
          sweep.run((b) => {
            chips.clear();
            apply({ kind: 'body', body: b.key, tour: true, sweep: true });
          }, () => apply({ kind: 'all', tour: true }));
        } else {
          apply({ kind: s.kind, act: s.act, body: s.body, tour: true });
        }
      },
      leave: () => sweep.stop(),
    });

    const bodyOn = (b, s) => (s.kind === 'body' ? b.key === s.body : s.kind === 'act' ? b.acts.includes(s.act) : true);
    const curveOn = (c, s) => {
      if (s.kind === 'none') return null;
      if (s.kind === 'all') return true;
      return s.kind === 'body' ? c.it.b.key === s.body : c.act === s.act;
    };
    const segmentOn = (key, s) => {
      if (s.kind === 'none') return null;
      if (s.kind === 'all') return true;
      return s.kind === 'act' ? key === s.act : BODY[s.body].acts.includes(key);
    };
    const laneOn = (c, s) => (s.kind === 'act' ? c.act === s.act : s.kind === 'body' && c.it.b.key === s.body);

    function apply(s) {
      state = s;
      const traced = s.kind === 'act' ? ACT[s.act] : null;
      items.forEach((it) => {
        const { b } = it;
        const on = bodyOn(b, s);
        const chosen = s.kind === 'body' && on;
        [it.fig, it.label, it.note, it.card].forEach((node) => node.classList.toggle('is-dim', !on));
        it.body.classList.toggle('is-faded', on && (Boolean(traced) || chosen));
        Object.entries(it.overlays).forEach(([key, view]) => {
          view.classList.toggle('is-on', on && (traced ? key === overlayKey(s.act) : chosen));
        });
        Object.entries(it.modules).forEach(([key, module]) => {
          toggle(module, s.kind === 'none' ? null : s.kind === 'all' || (s.kind === 'body' ? b.key === s.body : key === s.act));
        });
        const note = traced ? (on && b.actNotes[s.act]) || '' : plural(b.acts.length, 'expert');
        it.note.textContent = note;
        it.note.style.fill = traced && note ? traced.ink : '';
        it.hit.setAttribute('aria-pressed', String(s.kind === 'body' && b.key === s.body && !s.tour));
      });
      curves.forEach((c) => {
        toggle(c.path, curveOn(c, s));
        c.it.lanes[c.act].classList.toggle('is-on', laneOn(c, s));
      });
      ACTS.forEach((a) => {
        toggle(segments[a.key].g, segmentOn(a.key, s));
        segments[a.key].g.setAttribute('aria-pressed', String(s.kind === 'act' && a.key === s.act && !s.tour));
      });
      if (s.kind === 'body' && !s.sweep) {
        showClip(BODY[s.body], true);
      } else if (wantPlay) {
        wantPlay = false;
        syncVideo();
      }
      if (!s.tour) tour.setText(readout(s), false);
      setFlows(s);
    }

    function readout(s) {
      if (s.kind === 'body') return `<b>${BODY[s.body].name}</b>: ${BODY[s.body].outSummary}`;
      if (s.kind === 'act') {
        const a = ACT[s.act];
        return `<b>${a.name}</b> ${a.where}: ${providers[s.act].length} of ${BODIES.length} embodiments, ` +
          `each with its own expert.${a.extra || ''}`;
      }
      return HINT;
    }

    // Action tokens leave the trunk for the vocabulary, reach each active expert, and run down its lane.
    let lastGlow = 0;
    function setFlows(s) {
      const all = s.kind === 'all';
      const [linkMs, curveMs, laneMs] = s.sweep ? [220, 700, 320] : [320, 1000, 460];
      const active = curves.filter((c) => curveOn(c, s) === true).map((c) => ({
        period: all ? 2600 : 1700,
        fire() {
          const hue = HUES[c.act];
          const seg = segments[c.act];
          const now = performance.now();
          if (now - lastGlow > 500) {
            lastGlow = now;
            pulse(trunkGlow, [{ opacity: 0.28 }, { opacity: 0 }], 520);
          }
          chips.launch(seg.link, 6, hue, linkMs, () => {
            pulse(seg.rect, [{ fillOpacity: 0.95 }, { fillOpacity: 0.55 }], 450);
            chips.launch(c.path, 9, hue, curveMs, () => {
              pulse(c.it.modules[c.act], [{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], 360);
              const lane = c.it.lanes[c.act];
              if (lane.classList.contains('is-on')) chips.launch(lane, 6, hue, laneMs);
            });
          });
        },
      }));
      chips.set(active, all ? (f) => Math.random() * f.period : s.sweep ? (f, k) => 40 + k * 20 : null);
    }

    function select(s) {
      tour.pause();
      const same = !state.tour && s.kind === state.kind && (s.kind === 'body' ? s.body === state.body : s.act === state.act);
      apply(same ? { kind: 'none' } : s);
    }

    showClip(focus, false);
    apply({ kind: 'none' });
    tour.start();
    watch(figure, lazy, (v) => {
      visible = v;
      chips.show(v);
      tour.setVisible(v);
      syncVideo();
    });
  }

  // 04: embodiment dreaming, in training and at deployment.
  function initDreaming(figure) {
    const H = 372;
    const CARD = { x: 16, y: 64, w: 170, h: 34 };
    const TRUNK = { x: 226, y: 36, w: 110, h: 266 };
    const EXPERTS = { x: 380, y: 64, w: 122, h: 34 };
    const CHUNK = { x: 544, y: 64 };
    const ROW = 281;                                   // the dreaming row's centre line
    const DREAM = { x: 380, y: ROW - 18, w: 122, h: 36 };
    const PRED = { x: 540, y: ROW - 5 };
    const LOSS = { x: 673, y: ROW, r: 17 };
    const TARG = { x: 714, y: ROW - 5 };
    const TEACH = { x: 836, y: ROW - 18, w: 112, h: 36 };
    const BODY_X = 888, BODY_GROUND = 168, BODY_SCALE = 0.42;
    const HINT = 'Switch between training and deployment, or pick an embodiment.';
    const STEPS = [
      { focus: 'predict', mode: 'train', ms: 5400,
        text: 'In training, a dreaming expert reads the same trunk output as the action experts and predicts future ' +
              'embodiment latents.' },
      { focus: 'target', mode: 'train', ms: 5400,
        text: 'EMA copies of the policy\'s own tokenizers encode the future image and joint states into eight target ' +
              'tokens, under a stop-gradient.' },
      { focus: 'loss', mode: 'train', ms: 5200,
        text: 'A cosine loss aligns each predicted token with its target, and a magnitude loss matches their norms; ' +
              'after every step, each teacher moves slightly toward its student.' },
      { focus: 'sweep', mode: 'train', ms: 6400,
        text: 'Each body dreams from whichever of the image, robot joint states, and end-effector joint states it ' +
              'provides.' },
      { focus: null, mode: 'deploy', ms: 6000,
        text: 'At deployment, the dreaming expert and EMA teachers are removed: the policy runs its tokenizers, trunk, ' +
              'and action experts, with no dreaming computation.' },
    ];

    // Mode and embodiment controls, between the toolbar and the stage.
    const controls = document.createElement('div');
    controls.className = 'mv-controls';
    controls.innerHTML = '<div class="mv-mode" role="group" aria-label="Phase">' +
      '<button type="button" data-mode="train">Training</button>' +
      '<button type="button" data-mode="deploy">Deployment</button></div>' +
      '<div class="mv-picker" role="group" aria-label="Embodiment"></div>';
    figure.insertBefore(controls, figure.querySelector('.mv-stage'));
    const modeButtons = [...controls.querySelectorAll('.mv-mode button')];
    const picker = controls.querySelector('.mv-picker');
    const pickButtons = BODIES.map((b) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = b.name;
      button.addEventListener('click', () => select({ body: b.key }));
      picker.appendChild(button);
      return button;
    });
    modeButtons.forEach((button) => button.addEventListener('click', () => select({ mode: button.dataset.mode })));

    const { svg, layers, lazy } = scaffold(figure, H,
      'Embodiment dreaming: the policy path, the dreaming expert, its EMA targets from a future observation, and the loss',
      ['wires', 'boxes', 'figs', 'labels', 'chips', 'tags']);
    const chips = chipEngine(layers.chips);
    const zone = (part, train) => make('g', { class: `mv-dz${train ? ' mv-train' : ''}`, 'data-part': part }, layers.boxes);
    const wire = (d, cls, parent) => make('path', { class: `mv-wire ${cls || ''}`, d }, parent || layers.wires);
    const text = (parent, x, y, cls, content, anchor) => {
      const node = make('text', { class: cls, x, y, 'text-anchor': anchor || 'start' }, parent);
      if (content) node.textContent = content;
      return node;
    };
    const symbol = (parent, x, y, cls, base, sub, sup, anchor) => {
      const node = text(parent, x, y, cls, null, anchor);
      node.append(base);
      if (sup) make('tspan', { dy: -5, 'font-size': '0.72em' }, node).textContent = sup;
      if (sub) make('tspan', { dy: sup ? 8 : 3, dx: sup ? -4 : 0, 'font-size': '0.72em' }, node).textContent = sub;
      return node;
    };

    // The policy path: tokenizers, trunk, action experts, action chunk.
    const gIn = zone('in', false);
    text(gIn, CARD.x, CARD.y - 24, 'mv-box-title', 'Tokenizers');
    text(gIn, CARD.x, CARD.y - 10, 'mv-box-sub', 'current observation');
    make('rect', { class: 'mv-plate', x: CARD.x, y: CARD.y, width: CARD.w, height: CARD.h, rx: 8 }, gIn);
    const inModules = MODS.map((m, j) => {
      const x = CARD.x + 9 + j * 19.5;
      return {
        m,
        socket: make('circle', { class: 'mv-socket', cx: x + 7, cy: CARD.y + CARD.h / 2, r: 1.8 }, gIn),
        rect: make('rect', { class: 'mv-module', x, y: CARD.y + 9, width: 14, height: 16, rx: 3, fill: m.fill,
          stroke: m.ink }, gIn),
      };
    });
    const embodNote = text(gIn, CARD.x + CARD.w, CARD.y + CARD.h + 16, 'mv-box-sub mv-purple', null, 'end');
    embodNote.append('embodiment tokens, from ');
    make('tspan', { 'font-style': 'italic' }, embodNote).textContent = 'φ';
    make('tspan', { dy: 3, 'font-size': 8 }, embodNote).textContent = 'dream';

    const gTrunk = zone('trunk', false);
    make('rect', { class: 'mv-trunk-body', x: TRUNK.x, y: TRUNK.y, width: TRUNK.w, height: TRUNK.h, rx: 14 }, gTrunk);
    const trunkGlow = make('rect', { class: 'mv-trunk-glow', x: TRUNK.x, y: TRUNK.y, width: TRUNK.w, height: TRUNK.h,
      rx: 14 }, gTrunk);
    text(gTrunk, TRUNK.x + TRUNK.w / 2, TRUNK.y + TRUNK.h / 2 - 4, 'mv-trunk-label is-small', 'Shared trunk', 'middle');
    const tl2 = text(gTrunk, TRUNK.x + TRUNK.w / 2, TRUNK.y + TRUNK.h / 2 + 16, 'mv-trunk-label', null, 'middle');
    make('tspan', { 'font-style': 'italic' }, tl2).textContent = 'G';
    make('tspan', { dy: 4, 'font-size': 11 }, tl2).textContent = 'θ';

    const gAct = zone('act', false);
    text(gAct, EXPERTS.x, EXPERTS.y - 24, 'mv-box-title', 'Action experts');
    text(gAct, EXPERTS.x, EXPERTS.y - 10, 'mv-box-sub', 'one per action modality');
    make('rect', { class: 'mv-plate', x: EXPERTS.x, y: EXPERTS.y, width: EXPERTS.w, height: EXPERTS.h, rx: 8 }, gAct);
    const outModules = ACTS.map((a, j) => {
      const x = EXPERTS.x + 9 + j * 18.5;
      return {
        a,
        socket: make('circle', { class: 'mv-socket', cx: x + 6.5, cy: EXPERTS.y + EXPERTS.h / 2, r: 1.8 }, gAct),
        rect: make('rect', { class: 'mv-module mv-expert', x, y: EXPERTS.y + 9, width: 13, height: 16, rx: 3,
          fill: a.fill, stroke: a.ink }, gAct),
      };
    });
    text(gAct, CHUNK.x, CHUNK.y - 24, 'mv-box-title', 'Action chunk');
    text(gAct, CHUNK.x, CHUNK.y - 10, 'mv-box-sub', 'next H targets per modality');
    const chunkG = make('g', null, gAct);

    // The training-only branch: dreaming expert, predicted and target latents, loss, EMA teacher, future body.
    const gDream = zone('predict', true);
    text(gDream, DREAM.x, DREAM.y - 12, 'mv-box-title', 'Dreaming expert');
    make('rect', { class: 'mv-dream-box', x: DREAM.x, y: DREAM.y, width: DREAM.w, height: DREAM.h, rx: 8 }, gDream);
    symbol(gDream, DREAM.x + DREAM.w / 2, ROW + 5, 'mv-sym', 'ψ', 'dream', 'e', 'middle');
    const latents = (parent, x0, y0, cls) => {
      const g = make('g', { class: cls }, parent);
      [2, 1, 0].forEach((layer) => {
        for (let j = 0; j < 8; j += 1) {
          make('rect', { class: `mv-latent${layer ? ' is-back' : ''}`, x: x0 + j * 11 + layer * 4, y: y0 - layer * 4,
            width: 9, height: 9, rx: 2 }, g);
        }
      });
      return g;
    };
    text(gDream, PRED.x, DREAM.y - 12, 'mv-box-title', 'Predicted latents');
    const predG = latents(gDream, PRED.x, PRED.y, 'mv-pred');
    symbol(gDream, PRED.x, ROW + 26, 'mv-box-sub', 'Ŷ', 't+k', null);

    const gLoss = zone('loss', true);
    const lossCircle = make('circle', { class: 'mv-loss', cx: LOSS.x, cy: LOSS.y, r: LOSS.r }, gLoss);
    text(gLoss, LOSS.x, LOSS.y + 5, 'mv-loss-label', 'ℒ', 'middle');
    text(gLoss, LOSS.x, LOSS.y + 32, 'mv-box-sub', 'cosine', 'middle');
    text(gLoss, LOSS.x, LOSS.y + 44, 'mv-box-sub', '+ magnitude', 'middle');

    const gTarget = zone('target', true);
    text(gTarget, TARG.x, DREAM.y - 12, 'mv-box-title', 'Target latents');
    const targG = latents(gTarget, TARG.x, TARG.y, 'mv-targ');
    symbol(gTarget, TARG.x, ROW + 26, 'mv-box-sub', 'Y', 't+k', null);
    text(gTarget, TEACH.x, DREAM.y - 12, 'mv-box-title', 'EMA teacher');
    make('rect', { class: 'mv-dream-box mv-teacher', x: TEACH.x, y: TEACH.y, width: TEACH.w, height: TEACH.h, rx: 8 },
      gTarget);
    const teacherLabel = text(gTarget, TEACH.x + TEACH.w / 2, ROW + 5, 'mv-sym', null, 'middle');
    teacherLabel.append('φ̄');
    make('tspan', { dy: 3, 'font-size': '0.72em' }, teacherLabel).textContent = 'm';
    make('tspan', { dy: -3 }, teacherLabel).textContent = ', φ̄';
    make('tspan', { dy: 3, 'font-size': '0.72em' }, teacherLabel).textContent = 'dream';
    text(gTarget, (TARG.x + 8 * 11 + 8 + TEACH.x) / 2, ROW - 6, 'mv-sg', 'sg', 'middle');

    const gFuture = zone('target', true);
    const futures = {};
    BODIES.forEach((b) => {
      const g = make('g', { class: 'mv-future' }, gFuture);
      futures[b.key] = { g, ...placeBody(g, b, BODY_X - (b.w * BODY_SCALE) / 2, BODY_GROUND - b.disc[1] * BODY_SCALE,
        BODY_SCALE, ['embod'], lazy) };
      futures[b.key].body.classList.add('is-faded');
      futures[b.key].overlays.embod.classList.add('is-on');
    });
    text(gFuture, BODY_X, BODY_GROUND + 22, 'mv-box-title', 'Future observation', 'middle');
    const sourceLines = [0, 1, 2].map((k) => text(gFuture, BODY_X, BODY_GROUND + 38 + k * 13, 'mv-box-sub mv-purple',
      null, 'middle'));

    const gEma = zone('loss', true);
    const emaPath = make('path', { class: 'mv-ema', d: `M${CARD.x + 10},${CARD.y + CARD.h} V${H - 40} ` +
      `Q${CARD.x + 10},${H - 30} ${CARD.x + 20},${H - 30} H${TEACH.x + TEACH.w / 2 - 10} ` +
      `Q${TEACH.x + TEACH.w / 2},${H - 30} ${TEACH.x + TEACH.w / 2},${H - 40} V${TEACH.y + TEACH.h + 3}`,
      'marker-end': 'url(#mv-arrow-ema)' }, gEma);
    const emaLabel = text(gEma, (CARD.x + TEACH.x + TEACH.w / 2) / 2 + 30, H - 36, 'mv-box-sub mv-purple', null, 'middle');
    emaLabel.append('EMA update after every step:  φ̄ ← αφ̄ + (1 − α)φ');
    const defs = make('defs', null, svg);
    const marker = make('marker', { id: 'mv-arrow-ema', viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 6,
      markerHeight: 6, orient: 'auto' }, defs);
    make('path', { d: 'M0,0.6 L5.6,3 L0,5.4 z', fill: '#8C7BC4' }, marker);
    const wireMarker = make('marker', { id: 'mv-arrow-wire', viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 6,
      markerHeight: 6, orient: 'auto' }, defs);
    make('path', { d: 'M0,0.6 L5.6,3 L0,5.4 z', fill: '#a49b8e' }, wireMarker);
    const dreamMarker = make('marker', { id: 'mv-arrow-dream', viewBox: '0 0 6 6', refX: 5, refY: 3, markerWidth: 6,
      markerHeight: 6, orient: 'auto' }, defs);
    make('path', { d: 'M0,0.6 L5.6,3 L0,5.4 z', fill: '#8C7BC4' }, dreamMarker);

    // Wires; the training-only ones fade with their branch.
    const trainWires = make('g', { class: 'mv-dz mv-train', 'data-part': 'predict' }, layers.wires);
    const targetWires = make('g', { class: 'mv-dz mv-train', 'data-part': 'target' }, layers.wires);
    const lossWires = make('g', { class: 'mv-dz mv-train', 'data-part': 'loss' }, layers.wires);
    const arrow = (path, kind) => path.setAttribute('marker-end', `url(#mv-arrow-${kind})`);
    const wIn = wire(`M${CARD.x + CARD.w},${CARD.y + CARD.h / 2} H${TRUNK.x - 3}`);
    arrow(wIn, 'wire');
    const wAct = wire(`M${TRUNK.x + TRUNK.w},${EXPERTS.y + EXPERTS.h / 2} H${EXPERTS.x - 3}`);
    arrow(wAct, 'wire');
    const wChunk = wire(`M${EXPERTS.x + EXPERTS.w},${EXPERTS.y + EXPERTS.h / 2} H${CHUNK.x - 5}`);
    arrow(wChunk, 'wire');
    const wDream = wire(`M${TRUNK.x + TRUNK.w},${ROW} H${DREAM.x - 3}`, 'is-dream', trainWires);
    arrow(wDream, 'dream');
    const wPred = wire(`M${DREAM.x + DREAM.w},${ROW} H${PRED.x - 5}`, 'is-dream', trainWires);
    arrow(wPred, 'dream');
    const wPredLoss = wire(`M${PRED.x + 8 * 11 + 8},${ROW} H${LOSS.x - LOSS.r - 3}`, 'is-dream', lossWires);
    arrow(wPredLoss, 'dream');
    const wTargLoss = wire(`M${TARG.x - 2},${ROW} H${LOSS.x + LOSS.r + 3}`, 'is-dream', lossWires);
    arrow(wTargLoss, 'dream');
    const wTeach = wire(`M${TEACH.x},${ROW} H${TARG.x + 8 * 11 + 10}`, 'is-dream', targetWires);
    arrow(wTeach, 'dream');
    const wBody = wire(`M${BODY_X},${BODY_GROUND + 66} V${TEACH.y - 3}`, 'is-dream', targetWires);
    arrow(wBody, 'dream');

    const goneTag = make('g', { class: 'mv-gone-tag' }, layers.tags);
    make('rect', { class: 'mv-gone-pill', x: 566, y: ROW - 13, width: 196, height: 26, rx: 13 }, goneTag);
    text(goneTag, 664, ROW + 4.5, 'mv-gone-text', 'Removed at deployment', 'middle');

    let state = { mode: 'train', body: 'g1-dex5', focus: null };
    const sweep = sweeper();
    const tour = makeTour(figure, STEPS, {
      enter(s) {
        if (s.focus === 'sweep') {
          sweep.run((b) => apply({ mode: 'train', body: b.key, focus: 'sweep', tour: true }),
            () => apply({ mode: 'train', body: 'g1-dex5', focus: 'sweep', tour: true }));
        } else {
          apply({ mode: s.mode, body: state.body, focus: s.focus, tour: true });
        }
      },
      leave: () => sweep.stop(),
    });

    function apply(s) {
      state = s;
      const b = BODY[s.body];
      const deploy = s.mode === 'deploy';
      svg.classList.toggle('is-deploy', deploy);
      modeButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === s.mode)));
      pickButtons.forEach((button, i) => button.setAttribute('aria-pressed', String(BODIES[i].key === s.body)));
      inModules.forEach(({ m, socket, rect }) => {
        const has = b.mods.includes(m.key);
        rect.style.display = has ? '' : 'none';
        socket.style.display = has ? 'none' : '';
      });
      outModules.forEach(({ a, socket, rect }) => {
        const has = b.acts.includes(a.key);
        rect.style.display = has ? '' : 'none';
        socket.style.display = has ? 'none' : '';
      });
      chunkG.replaceChildren();
      b.acts.forEach((key, r) => {
        for (let j = 0; j < 8; j += 1) {
          make('rect', { class: 'mv-step', x: CHUNK.x + j * 10, y: CHUNK.y + 3 + r * 7.4, width: 8, height: 5.4, rx: 1.2,
            fill: ACT[key].fill, stroke: ACT[key].ink, 'fill-opacity': (1 - j * 0.07).toFixed(2) }, chunkG);
        }
      });
      Object.entries(futures).forEach(([key, f]) => f.g.classList.toggle('is-hidden', key !== s.body));
      sourceLines.forEach((line, k) => {
        line.textContent = b.dream[k] ? b.dream[k][0] : '';
      });
      const focused = s.focus && s.focus !== 'sweep' ? s.focus : null;
      layers.boxes.querySelectorAll('.mv-dz').forEach((g) => {
        const part = g.dataset.part;
        g.classList.toggle('is-soft', Boolean(focused) && !deploy && part !== focused && part !== 'in' &&
          part !== 'trunk' && !(focused === 'predict' && part === 'act'));
      });
      [trainWires, targetWires, lossWires].forEach((g) => {
        g.classList.toggle('is-soft', Boolean(focused) && !deploy && g.dataset.part !== focused);
      });
      if (!s.tour) tour.setText(readout(s), false);
      setFlows(s);
    }

    function readout(s) {
      const b = BODY[s.body];
      if (s.mode === 'deploy') {
        return `<b>Deployment</b>: ${b.name} runs its ${plural(b.mods.length, 'tokenizer')}, the shared trunk, and ` +
          `its ${plural(b.acts.length, 'action expert')}; the dreaming expert and EMA teachers are removed.`;
      }
      return `<b>${b.name}</b> dreams from ${listing(b.dream.map((d) => d[1]))}, encoded by EMA teachers into ` +
        'eight target tokens at future offsets.';
    }

    function setFlows(s) {
      const b = BODY[s.body];
      const deploy = s.mode === 'deploy';
      const focused = s.focus && s.focus !== 'sweep' ? s.focus : null;
      const flows = [];
      let n = 0;
      flows.push({
        period: 1500,
        fire() {
          const m = MOD[b.mods[n % b.mods.length]];
          n += 1;
          chips.launch(wIn, 8, m, 520, () => pulse(trunkGlow, [{ opacity: 0.3 }, { opacity: 0 }], 520));
        },
      });
      if (!focused || focused === 'predict' || deploy) {
        let k = 0;
        flows.push({
          period: 1500,
          fire() {
            const a = ACT[b.acts[k % b.acts.length]];
            k += 1;
            chips.launch(wAct, 8, a, 420, () => chips.launch(wChunk, 6, a, 380, () => {
              pulse(chunkG, [{ opacity: 0.55 }, { opacity: 1 }], 420);
            }));
          },
        });
      }
      if (!deploy && (!focused || focused === 'predict')) {
        flows.push({
          period: 1500,
          fire: () => chips.launch(wDream, 8, PURPLE, 420, () => chips.launch(wPred, 7, PURPLE, 380, () => {
            pulse(predG, [{ opacity: 0.5 }, { opacity: 1 }], 420);
            if (!focused) chips.launch(wPredLoss, 6, PURPLE, 300, () => pulse(lossCircle, [{ strokeWidth: 3 }, { strokeWidth: 1.4 }], 420));
          })),
        });
      }
      if (!deploy && (!focused || focused === 'target')) {
        flows.push({
          period: 1500,
          fire: () => chips.launch(wBody, 8, PALE, 520, () => chips.launch(wTeach, 7, PALE, 360, () => {
            pulse(targG, [{ opacity: 0.5 }, { opacity: 1 }], 420);
            if (!focused) chips.launch(wTargLoss, 6, PALE, 300);
          })),
        });
      }
      if (!deploy && focused === 'loss') {
        flows.push({
          period: 1500,
          fire() {
            chips.launch(wPredLoss, 7, PURPLE, 420, () => pulse(lossCircle, [{ strokeWidth: 3.2 }, { strokeWidth: 1.4 }], 480));
            chips.launch(wTargLoss, 7, PALE, 420);
          },
        });
        flows.push({ period: 2600, fire: () => chips.launch(emaPath, 7, PALE, 2200) });
      }
      chips.set(flows, (f, k) => 80 + k * 260);
    }

    function select(change) {
      tour.pause();
      apply({ mode: change.mode || state.mode, body: change.body || state.body, focus: null });
    }

    apply(state);
    tour.setText(HINT, false);
    tour.start();
    watch(figure, lazy, (v) => {
      chips.show(v);
      tour.setVisible(v);
    });
  }

  const run = (selector, init) => document.querySelectorAll(selector).forEach(init);
  run('.mv-frames', initFrames);
  run('.mv-inputs', initInputs);
  run('.mv-outputs', initOutputs);
  run('.mv-dreaming', initDreaming);
})();
