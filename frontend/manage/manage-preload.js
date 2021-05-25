const electron = require('electron');

electron.contextBridge.exposeInMainWorld('main', {
  rename(i, newName) { electron.ipcRenderer.send('rename', i, newName) },
  delete(i) { electron.ipcRenderer.send('delete', i) },
  create(name) { electron.ipcRenderer.send('create', name) },
  setRate(rate) { electron.ipcRenderer.send('set-rate', rate) },
  showTemplates() { electron.ipcRenderer.send('show-templates') },
});
