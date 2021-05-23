const electron = require('electron');

// There's got to be a less convoluted way to do this...

let ready;
electron.contextBridge.exposeInMainWorld('main', {
  ready(fn) { ready = fn },
  rename(i, newName) { electron.ipcRenderer.send('rename', i, newName) },
});

electron.ipcRenderer.on('setup', (e, data) => ready(data));
