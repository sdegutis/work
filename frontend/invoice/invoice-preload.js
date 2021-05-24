const electron = require('electron');
const Handlebars = require("handlebars");

let ready;
let refresh;
electron.contextBridge.exposeInMainWorld('main', {
  ready(fn) { ready = fn },
  refresh(fn) { refresh = fn },
  set(key, val) {
    electron.ipcRenderer.send('set', key, val);
  },
  transform: async (text) => {
    const data = await electron.ipcRenderer.invoke('get-data');

    const lines = data.tasks.map(({ name, seconds }) => {
      const hours = seconds / 60 / 60;
      const time = roundToNearest15Mins(hours);
      const rate = data.rate;
      const total = time * rate;
      return ({ name, time, rate, total });
    });

    const total = (lines
      .map(line => line.total)
      .reduce((a, b) => a + b, 0));

    return Handlebars.compile(text)({ ...data, lines, total });
  },
});

electron.ipcRenderer.on('setup', (e, data) => ready(data));
electron.ipcRenderer.on('refresh', (e) => refresh());

const roundToNearest15Mins = (n) => Math.round(n * 4) / 4;
