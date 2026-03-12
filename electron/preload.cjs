const { contextBridge } = require('electron');

// Keep the surface area tiny; add APIs here only when needed.
contextBridge.exposeInMainWorld('cropaid', {
  isElectron: true,
});

