const electron = require('electron');

let app;

const mainInstance = electron.app.requestSingleInstanceLock();
if (mainInstance) {
  const App = require('./app');
  const { autoUpdater } = require("electron-updater");

  electron.app.whenReady().then(async () => {
    autoUpdater.checkForUpdatesAndNotify();

    app = new App();

    electron.app.on('window-all-closed', (/** @type {electron.Event} */ e) => {
      e.preventDefault();
    });

  });
}
else {
  electron.app.quit();
}
