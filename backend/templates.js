const fs = require('fs-extra');
const path = require('path');
const electron = require('electron');

const datadir = electron.app.getPath('userData');
const templateOutDir = path.join(datadir, 'templates');

if (!fs.existsSync(templateOutDir)) {
  const templateInDir = path.join(__dirname, '../templates');
  fs.copy(templateInDir, templateOutDir);
}

module.exports = templateOutDir;
