const electron = require('electron');
const App = require('./app');

require('update-electron-app')();

let app;

electron.app.whenReady().then(async () => {

  electron.app.dock.hide();

  app = new App();

  electron.app.on('window-all-closed', (/** @type {electron.Event} */ e) => {
    e.preventDefault();
  });

});
