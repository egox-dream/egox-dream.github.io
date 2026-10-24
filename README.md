# egox-dream.github.io

Project page for **EgoX: Egocentric Cross-Embodiment Manipulation with Embodiment Dreaming**.

Live site: https://egox-dream.github.io/

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Repository layout

```text
.
├── index.html       # page content and gallery behavior
├── style.css        # classic research-project styling
├── embodiments.css  # compact model-selector lineup
├── embodiments.js   # model selection, on-demand 3D, and gallery filtering
├── assets/          # favicon and shared assets
├── figs/            # paper figures and poster images
└── videos/          # teaser and embodiment videos
```

## Adding media

The teaser expects `videos/egox_teaser.mp4` and an optional
`figs/teaser_poster.png` poster.

Each embodiment gallery has a commented example in `index.html`. Add clips using
the corresponding folder:

```html
<video class="gallery-video" src="./videos/g1-dex5/clip1.mp4" autoplay muted playsinline loop></video>
```

The expected figure paths are documented directly in `index.html`.

## Interactive embodiments

The Embodiments section has a fixed-size row of seven model previews. Click a
model to filter the videos below; **All embodiments** removes that filter while
preserving the task and training settings. Filtering never loads 3D assets or
resizes the lineup. On narrow screens, the row scrolls horizontally.

Each model has a separate **View in 3D** (fullscreen icon) button. It opens a large dialog with
rotation, scroll/pinch zoom, keyboard controls, and **Reset view**. Viewing a
model does not change any video filters. Close with **×**, Escape, or a click on
the backdrop; focus and the compact lineup are restored. Only the open dialog
has an active viewer, and closing during loading cancels the pending view.

The runtime and GLB files load on demand when a 3D dialog is opened. Static
previews remain available without JavaScript or if 3D cannot load. Name-only
labels, a warm shared background, and matte technical previews follow the
visual direction of the robot dataset strip in
[the π0 article](https://pi.website/blog/pi0), retaining EgoX's end-effector colors.

The page uses self-hosted [model-viewer](https://modelviewer.dev/) 4.3.1 with a
local Draco decoder. No backend or JavaScript build step is required. Preview
over HTTP with the command above, rather than opening `index.html` as a local file.

Assets live in `assets/models/embodiments/`: `.glb` models, matching PNG posters,
`manifest.json`, and source attribution/license notices. Blender sources remain
in the workspace's `outputs/` directories. The export script is
`../../outputs/embodiment_models_web/export_web_models.py`; it creates web copies
in a common EgoX body basis, including the corrected Z1 reset and mounting. The
viewer starts from the same body-relative camera angle for all seven models.

The lineup uses transparent WebP previews in `assets/models/embodiments/technical/`,
with 1024-pixel PNG originals retained alongside them. Regenerate this style with
`../../outputs/embodiment_models_web/render_technical_previews.py`. The interactive
view applies the same neutral matte palette at runtime, preserves end-effector
and simulated G1 colors, and adds a subtle silhouette outline. It does not alter
the source GLBs or Blender scenes. The PNGs also include internal part contours;
the interactive view uses surface shading for those details.

The latent geometry (GW) matrix in the results shows the same renders on its diagonal
as the paper's figure. They are WebP copies in `assets/models/embodiments/canonical/`,
made by cropping to the visible pixels and scaling the long side to 256 pixels. Most
come from the canonical-pose renders in
`../../figures/embodiments/embodiment_models_canonical/previews/`; LocoMan-Dex2 and
Z1-Tool come from their posters above, matching their poses in the paper's method figure.

To replace a model, regenerate its GLB and matching poster, retain the filenames
in `manifest.json`, and verify its colors, pose, and default camera in the page.
The `.blend` authoring scenes are not served to visitors.

## Credits

Webpage materials are adapted from [VideoMimic](https://github.com/videomimic-1/videomimic-1.github.io)
and [Nerfies](https://github.com/nerfies/nerfies.github.io).
