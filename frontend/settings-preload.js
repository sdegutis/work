const electron = require('electron');

electron.contextBridge.exposeInMainWorld('main', {
  rename(i, newName) { electron.ipcRenderer.send('rename', i, newName) },
  delete(i) { electron.ipcRenderer.send('delete', i) },
  create(name) { electron.ipcRenderer.send('create', name) },
  setRate(rate) { electron.ipcRenderer.send('set-rate', rate) },
  setInvoiceNumber(invoiceNumber) { electron.ipcRenderer.send('set-invoice-number', invoiceNumber) },
  showTemplates() { electron.ipcRenderer.send('show-templates') },
});
