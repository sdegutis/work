const fs = require('fs-extra');
const path = require('path');
const electron = require('electron');

const datadir = electron.app.getPath('userData');
const templateDir = path.join(datadir, 'templates');

if (!fs.existsSync(templateDir)) {
  const templateInDir = path.join(__dirname, '../templates');
  fs.copy(templateInDir, templateDir);
}

function currentTemplate() {
  const currentPath = path.join(templateDir, 'current.html');
  return fs.readFileSync(currentPath, 'utf-8');
}

module.exports = { templateDir, currentTemplate };
