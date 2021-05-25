const fs = require('fs-extra');
const path = require('path');
const electron = require('electron');

const datadir = electron.app.getPath('userData');
const templateDir = path.join(datadir, 'templates');

if (!fs.existsSync(templateDir)) {
  const templateInDir = path.join(__dirname, '../templates');
  fs.copy(templateInDir, templateDir);
}

const currentTemplatePath = path.join(templateDir, 'current.html');

function getCurrentTemplate() {
  return fs.readFileSync(currentTemplatePath, 'utf-8');
}

module.exports = { templateDir, currentTemplatePath, getCurrentTemplate };
