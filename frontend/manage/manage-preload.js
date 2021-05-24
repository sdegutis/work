const electron = require('electron');

let ready;
electron.contextBridge.exposeInMainWorld('main', {
  ready(fn) { ready = fn },
  rename(i, newName) { electron.ipcRenderer.send('rename', i, newName) },
  delete(i) { electron.ipcRenderer.send('delete', i) },
  create(name) { electron.ipcRenderer.send('create', name) },
});

electron.ipcRenderer.on('setup', (e, data) => ready(data));
