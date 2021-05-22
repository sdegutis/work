const electron = require('electron');
const App = require('./app');

let app;

electron.app.whenReady().then(async () => {

  app = new App();

  electron.app.on('window-all-closed', (/** @type {electron.Event} */ e) => {
    e.preventDefault();
  });

});