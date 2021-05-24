const electron = require('electron');

let ready;
electron.contextBridge.exposeInMainWorld('main', {
  ready(fn) { ready = fn },
});

electron.ipcRenderer.on('setup', (e, data) => ready(data));
