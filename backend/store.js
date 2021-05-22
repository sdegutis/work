const electron = require('electron');
const path = require('path');
const fs = require('fs');
var writeFileAtomic = require('write-file-atomic');

const datadir = electron.app.getPath('userData');
const filepath = path.join(datadir, 'data.json');

module.exports.data = {};

if (fs.existsSync(filepath)) {
  const content = fs.readFileSync(filepath, 'utf8');
  module.exports.data = JSON.parse(content);
}

function saveImmediately() {
  writeFileAtomic(filepath, JSON.stringify(module.exports.data, null, 2));
  console.log('saved data');
}

let saveTimeout;
function saveSoon() {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveImmediately, 1000);
}

module.exports.save = saveSoon;
module.exports.saveImmediately = saveImmediately;

setInterval(saveSoon, 1000 * 30);
saveImmediately();
