Self-hosted model-viewer runtime
===============================

Runtime: @google/model-viewer 4.3.1
Source: https://registry.npmjs.org/@google/model-viewer/-/model-viewer-4.3.1.tgz
Release: https://github.com/google/model-viewer/releases/tag/v4.3.1
The original npm tarball was verified against its registry SHA-512 integrity:
sha512-GP+inXhAtY31E8rILVmByA6z8CZZjdlNajddppyI1/j1eIaSQiZcMRaUqTFe7+jv4mzRzwKIOiKBud0apiv+WQ==

model-viewer.min.js is the unmodified, bundled ES module from that release.
It includes Three.js and Lit; no npm install or build is needed by the webpage.
Its upstream sourceMappingURL is retained; the optional debugging source map
is not shipped. LICENSE covers model-viewer, and THIRD_PARTY_LICENSES.txt
contains license texts for its bundled dependencies.

Draco decoder: 1.5.6, matching this model-viewer release's default decoder.
Files in draco/ come from:
https://www.gstatic.com/draco/versioned/decoders/1.5.6/
draco/LICENSE comes from https://github.com/google/draco/tree/1.5.6
The WebAssembly decoder and JavaScript fallback are both included.

Configure the decoder before importing the runtime or creating model-viewer
instances, using the global configuration supported by the upstream loader:

  self.ModelViewerElement = {
    ...(self.ModelViewerElement || {}),
    dracoDecoderLocation: new URL(
      './assets/vendor/model-viewer/draco/', document.baseURI
    ).href
  };
  await import('./assets/vendor/model-viewer/model-viewer.min.js');

That URL example assumes the import statement is in an inline module in the
site's root index.html; adjust the import path for an external JavaScript file.
The global configuration is read by each model-viewer constructor, so setting
only the class's static dracoDecoderLocation before inserting new elements can
be overwritten by the default. Configure the global object first.

Documentation/source for that configuration:
https://github.com/google/model-viewer/blob/v4.3.1/packages/model-viewer/src/features/loading.ts

The exported EgoX GLBs use Draco geometry and embedded ordinary image textures.
No remote KTX2/Lottie decoder or environment map is required by these assets.
Serve the site over HTTP(S); browser module/asset security prevents reliable
operation by double-clicking index.html as a file:// URL.
