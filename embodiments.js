(() => {
  'use strict';

  const section = document.querySelector('.embodiment-explorer');
  if (!section) return;
  const cards = [...section.querySelectorAll('.embodiment-model-card')];
  const all = section.querySelector('.embodiment-show-all');
  const dialog = section.querySelector('.embodiment-dialog');
  const stage = dialog.querySelector('.embodiment-dialog-stage');
  const title = dialog.querySelector('#embodiment-dialog-title');
  const poster = dialog.querySelector('.embodiment-dialog-poster');
  const close = dialog.querySelector('.embodiment-dialog-close');
  const reset = section.querySelector('.embodiment-model-reset');
  const retry = section.querySelector('.embodiment-model-retry');
  const status = section.querySelector('.embodiment-model-status');
  const defaultOrbit = '31.5deg 66.25deg 105%';
  const failedLoads = new Map();
  const technicalColors = new Map();
  let selectedCard;
  let openedCard;
  let opener;
  let viewer;
  let timeout;
  let generation = 0;
  let runtimePromise;
  let runtimeAttempt = 0;

  function applyTechnicalMaterials(model, slug) {
    // Match the Blender technical posters with matte, warm neutral bodies.
    // The GLB files retain their original materials; only this view is styled.
    for (const material of model.materials) {
      const pbr = material.pbrMetallicRoughness;
      const name = material.name.toLowerCase();
      const key = `${slug}:${material.name}`;
      if (!technicalColors.has(key)) {
        let color = [...pbr.baseColorFactor];
        if (!/end effector (left|right)|simulation g1 body/.test(name)) {
          if (/silver|steel|mounting hardware/.test(name)) color = [0.47932, 0.50289, 0.47932, 1];
          else if (Math.max(...color.slice(0, 3)) < 0.18) color = [0.18447, 0.20156, 0.19807, 1];
          else color = [0.79130, 0.78354, 0.73791, 1];
        }
        technicalColors.set(key, color);
      }
      pbr.setBaseColorFactor(technicalColors.get(key));
      if (!/end effector (left|right)|simulation g1 body/.test(name)) {
        pbr.baseColorTexture.setTexture(null);
      }
      pbr.setMetallicFactor(0);
      pbr.setRoughnessFactor(1);
      material.setClearcoatFactor?.(0);
    }
  }

  function loadRuntime() {
    if (!runtimePromise) {
      // The constructor reads this global configuration for every new instance.
      self.ModelViewerElement = {
        dracoDecoderLocation: new URL('./assets/vendor/model-viewer/draco/', document.baseURI).href
      };
      runtimeAttempt += 1;
      runtimePromise = import('./assets/vendor/model-viewer/model-viewer.min.js' +
        (runtimeAttempt > 1 ? `?retry=${runtimeAttempt}` : ''))
        .then(() => {
          const ModelViewer = customElements.get('model-viewer');
          ModelViewer.dracoDecoderLocation = new URL('./assets/vendor/model-viewer/draco/', document.baseURI).href;
          return ModelViewer;
        })
        .catch(error => {
          runtimePromise = undefined;
          throw error;
        });
    }
    return runtimePromise;
  }

  function clearViewer() {
    generation += 1;
    clearTimeout(timeout);
    viewer?.remove();
    viewer = undefined;
    stage.removeAttribute('aria-busy');
    reset.hidden = true;
    retry.hidden = true;
  }

  function fail(id) {
    if (id !== generation || !dialog.open || !openedCard || dialog.dataset.state === 'error') return;
    clearTimeout(timeout);
    viewer?.remove();
    viewer = undefined;
    dialog.dataset.state = 'error';
    const slug = openedCard.dataset.model;
    failedLoads.set(slug, (failedLoads.get(slug) || 0) + 1);
    stage.removeAttribute('aria-busy');
    status.textContent = '3D could not load. The preview is still available.';
    reset.hidden = true;
    retry.hidden = false;
  }

  async function loadModel(card, focusSource) {
    clearViewer();
    const id = generation;
    const name = card.querySelector('h3').textContent;
    const slug = card.dataset.model;
    const retries = failedLoads.get(slug) || 0;
    dialog.dataset.state = 'loading';
    stage.setAttribute('aria-busy', 'true');
    status.textContent = `Loading ${name}…`;
    timeout = window.setTimeout(() => fail(id), 90000);
    try {
      await loadRuntime();
      // Closing the dialog, reopening it, or retrying invalidates older loads.
      if (id !== generation || openedCard !== card || !dialog.open || dialog.dataset.state !== 'loading') return;
      viewer = document.createElement('model-viewer');
      const activeViewer = viewer;
      activeViewer.inert = true;
      const attributes = {
        // A failed URL can persist in the shared loader cache; retry a fresh URL.
        src: `./assets/models/embodiments/${slug}.glb${retries ? `?retry=${retries}` : ''}`,
        alt: `${name}. Drag to rotate; scroll or pinch to zoom. Arrow keys rotate the view.`,
        'camera-controls': '',
        'disable-pan': '',
        'touch-action': 'pan-y',
        'camera-orbit': defaultOrbit,
        'min-camera-orbit': 'auto 5deg 45%',
        'max-camera-orbit': 'auto 175deg 180%',
        'field-of-view': '30deg',
        'environment-image': 'neutral',
        'shadow-intensity': '0',
        'tone-mapping': 'aces',
        exposure: '0.8',
        loading: 'eager',
        reveal: 'auto',
        'interaction-prompt': 'none'
      };
      for (const [attribute, value] of Object.entries(attributes)) activeViewer.setAttribute(attribute, value);
      activeViewer.addEventListener('focusin', () => {
        activeViewer.dataset.keyboardFocus = String(
          activeViewer.shadowRoot.querySelector('.userInput')?.matches(':focus-visible')
        );
      });
      activeViewer.addEventListener('keydown', () => { activeViewer.dataset.keyboardFocus = 'true'; });
      activeViewer.addEventListener('pointerdown', () => { activeViewer.dataset.keyboardFocus = 'false'; });
      activeViewer.addEventListener('progress', event => {
        if (id !== generation || dialog.dataset.state !== 'loading') return;
        const progress = Math.round(event.detail.totalProgress * 100);
        status.textContent = progress < 100 ? `Loading ${name}… ${progress}%` : 'Preparing 3D view…';
      });
      activeViewer.addEventListener('load', () => {
        if (id !== generation || viewer !== activeViewer) return;
        clearTimeout(timeout);
        applyTechnicalMaterials(activeViewer.model, slug);
        dialog.dataset.state = 'ready';
        activeViewer.inert = false;
        stage.removeAttribute('aria-busy');
        reset.hidden = false;
        reset.setAttribute('aria-label', `Reset ${name} view`);
        status.textContent = '3D view ready';
        // model-viewer reveals its internal controls after the load event.
        requestAnimationFrame(() => {
          if (id === generation && focusSource && document.activeElement === focusSource) {
            activeViewer.shadowRoot.querySelector('.userInput')?.focus({preventScroll: true});
          }
        });
      }, {once: true});
      activeViewer.addEventListener('error', () => fail(id), {once: true});
      stage.append(activeViewer);
    } catch {
      fail(id);
    }
  }

  function select(card) {
    if (card === selectedCard) return;
    selectedCard = card;
    for (const item of cards) {
      const selected = item === card;
      item.dataset.selected = String(selected);
      item.querySelector('.embodiment-select').setAttribute('aria-pressed', String(selected));
    }
    all.setAttribute('aria-pressed', String(!card));
    // Filtering never constructs a viewer or changes the dimensions of the row.
    document.dispatchEvent(new CustomEvent('egox:embodiment-select', {
      detail: {embodiment: card ? card.dataset.embodiment : 'all'}
    }));
  }

  function openModel(card, button) {
    if (dialog.open) return;
    openedCard = card;
    opener = button;
    const name = card.querySelector('h3').textContent;
    title.textContent = name;
    poster.src = card.querySelector('.embodiment-model-poster').src;
    poster.alt = name;
    dialog.dataset.model = card.dataset.model;
    document.documentElement.classList.add('embodiment-dialog-open');
    dialog.showModal();
    // Opening a model is independent of the selected video filter.
    loadModel(card);
  }

  function finishClose() {
    clearViewer();
    openedCard = undefined;
    dialog.dataset.state = 'poster';
    delete dialog.dataset.model;
    status.textContent = '';
    document.documentElement.classList.remove('embodiment-dialog-open');
    const previousOpener = opener;
    opener = undefined;
    previousOpener?.focus({preventScroll: true});
  }

  function closeDialog() {
    if (!dialog.open) return;
    dialog.close();
    // Clean up synchronously, before a visitor can reopen another model.
    finishClose();
  }

  for (const card of cards) {
    const button = card.querySelector('.embodiment-select');
    const enlarge = card.querySelector('.embodiment-enlarge');
    button.hidden = false;
    enlarge.hidden = false;
    button.addEventListener('click', () => select(card));
    enlarge.addEventListener('click', () => openModel(card, enlarge));
  }
  all.hidden = false;
  all.addEventListener('click', () => select(undefined));
  close.addEventListener('click', closeDialog);
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeDialog();
  });
  dialog.addEventListener('close', () => {
    // A queued close event from a previous opening must not clear a new viewer.
    if (!dialog.open && openedCard) finishClose();
  });
  // Both endpoints must be on the backdrop, so a drag that ends outside the
  // model never accidentally closes the viewer.
  const outsideDialog = event => {
    const bounds = dialog.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  let backdropDown = false;
  dialog.addEventListener('pointerdown', event => { backdropDown = outsideDialog(event); });
  dialog.addEventListener('pointerup', event => {
    if (backdropDown && outsideDialog(event)) closeDialog();
    backdropDown = false;
  });
  dialog.addEventListener('pointercancel', () => { backdropDown = false; });
  retry.addEventListener('click', () => {
    if (!openedCard) return;
    // The Retry button disappears while loading; retain a visible focus target.
    if (document.activeElement === retry) close.focus({preventScroll: true});
    loadModel(openedCard, close);
  });
  reset.addEventListener('click', () => {
    if (!viewer || dialog.dataset.state !== 'ready') return;
    viewer.cameraOrbit = defaultOrbit;
    viewer.cameraTarget = 'auto auto auto';
    viewer.fieldOfView = '30deg';
    viewer.jumpCameraToGoal();
  });
})();
