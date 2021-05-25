const electron = require('electron');
const path = require('path');
const fs = require('fs-extra');
var writeFileAtomic = require('write-file-atomic');

const datadir = electron.app.getPath('userData');
const dataFilePath = path.join(datadir, 'data.json');

copyTemplatesIfNeeded();

/**
 * @type {{
 *   running: boolean,
 *   currentTaskIndex: number,
 *   tasks: { name: string, seconds: number }[],
 *   template: string,
 *   rate: number,
 * }}
 */
module.exports.data = readData() || {
  running: false,
  currentTaskIndex: -1,
  tasks: [],
  rate: 30,
};

function readData() {
  if (fs.existsSync(dataFilePath)) {
    const content = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(content);
  }
}

function saveImmediately() {
  writeFileAtomic.sync(dataFilePath, JSON.stringify(module.exports.data, null, 2));
  console.log('saved data');
}

/** @type {NodeJS.Timeout | undefined} */
let saveTimeout;
function saveSoon() {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveImmediately, 1000);
}

module.exports.save = saveSoon;
module.exports.saveImmediately = saveImmediately;

setInterval(saveSoon, 1000 * 30);
saveImmediately();

electron.app.on('quit', saveImmediately);

function copyTemplatesIfNeeded() {
  const templateOutDir = path.join(datadir, 'templates');

  if (!fs.existsSync(templateOutDir)) {
    const templateInDir = path.join(__dirname, '../templates');

    fs.copy(templateInDir, templateOutDir);
  }
}
