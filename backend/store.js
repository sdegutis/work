const electron = require('electron');
const path = require('path');
const fs = require('fs');
var writeFileAtomic = require('write-file-atomic');

const datadir = electron.app.getPath('userData');
const filepath = path.join(datadir, 'data.json');

/**
 * @type {{
 *   running: boolean,
 *   currentTaskIndex: number,
 *   tasks: { name: string, seconds: number }[],
 * }}
 */
module.exports.data = readData() || {
  running: false,
  currentTaskIndex: -1,
  tasks: [],
};

function readData() {
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  }
}

function saveImmediately() {
  writeFileAtomic(filepath, JSON.stringify(module.exports.data, null, 2));
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
