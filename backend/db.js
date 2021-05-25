const electron = require('electron');
const path = require('path');
const fs = require('fs-extra');
var writeFileAtomic = require('write-file-atomic');

const datadir = electron.app.getPath('userData');
const dataFilePath = path.join(datadir, 'data.json');

/**
 * @typedef Data
 * @property {boolean} running
 * @property {number} currentTaskIndex
 * @property {{ name: string, seconds: number }[]} tasks
 * @property {number} rate
 */

/** @type {Data} */
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
  console.log('saved data', new Date().toLocaleString());
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
