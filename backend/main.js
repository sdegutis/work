const electron = require('electron');
const App = require('./app');

let app;

electron.app.whenReady().then(async () => {

  app = new App();

});
