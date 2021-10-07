const electron = require('electron');
const App = require('./app');
const { autoUpdater } = require("electron-updater");

let app;

electron.app.whenReady().then(async () => {
  autoUpdater.checkForUpdatesAndNotify();

  app = new App();

  electron.app.on('window-all-closed', (/** @type {electron.Event} */ e) => {
    e.preventDefault();
  });

});
