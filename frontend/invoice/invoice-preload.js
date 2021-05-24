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

    const lines = (data.tasks
      .map(({ name, seconds }) => {
        const hours = seconds / 60 / 60;
        const time = roundToNearest15Mins(hours);
        const rate = data.rate;
        const total = time * rate;
        return ({ name, time, rate, total });
      })
      .filter(({ total }) => total > 0)
    );

    const totalCharge = (lines
      .map(line => line.total)
      .reduce((a, b) => a + b, 0));

    const totalHours = (lines
      .map(line => line.time)
      .reduce((a, b) => a + b, 0));

    return PRELUDE + Handlebars.compile(text)({
      ...data,
      lines,
      totalCharge,
      totalHours,
    });
  },
});

electron.ipcRenderer.on('setup', (e, data) => ready(data));
electron.ipcRenderer.on('refresh', (e) => refresh());

const roundToNearest15Mins = (n) => Math.round(n * 4) / 4;

const humanize = (time) => {
  const [hours, minsStr] = time.toFixed(2).split('.');
  const mins = (+minsStr).toFixed();
  return `${hours}h ${mins / 100 * 60}m`;
};

const MONEY_FORMATTER = new Intl.NumberFormat('en-EN', {
  style: 'currency',
  currency: 'USD',
});

const DOLLARS_FORMATTER = new Intl.NumberFormat('en-EN', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const money = (amount) => {
  return MONEY_FORMATTER.format(amount);
};

const dollars = (amount) => {
  return DOLLARS_FORMATTER.format(amount);
};

Handlebars.registerHelper({
  humanize,
  money,
  dollars,
});

const PRELUDE = `
<style>
/* PDF */
@media screen {
  html {
    background: #f0f0f0;
    width: 9.5in;
  }

  body {
    width: 8.5in;
    background: #fff;
    padding: 1in;
    margin: 2em;
    box-shadow: 0px 1px 3px 1px #0001;
  }
}

@page {
  margin: 1in;
}

/* Reset */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
`.trim();
