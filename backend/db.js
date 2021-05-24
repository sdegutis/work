const electron = require('electron');
const path = require('path');
const fs = require('fs');
var writeFileAtomic = require('write-file-atomic');

const datadir = electron.app.getPath('userData');
const filepath = path.join(datadir, 'data.json');

const DEFAULT_TEMPLATE = `

<h1>Invoice</h1>

<table>
<tr>
<th>Description</th>
<th>Hours</th>
<th>Rate</th>
<th>Total</th>
</tr>
{{#each lines}}
<tr>
<td>{{name}}</td>
<td>{{humanize time}}</td>
<td>{{dollars rate}}</td>
<td>{{money total}}</td>
</tr>
{{/each}}
<tr>
<td></td>
<td>{{humanize totalHours}}</td>
<td>Total</td>
<td>{{money totalCharge}}</td>
</tr>
</table>

<p>Total: {{total}}</p>

<p>Thanks!</p>

`.trim();

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
  template: DEFAULT_TEMPLATE,
  rate: 30,
};

function readData() {
  if (fs.existsSync(filepath)) {
    const content = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(content);
  }
}

function saveImmediately() {
  writeFileAtomic.sync(filepath, JSON.stringify(module.exports.data, null, 2));
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
