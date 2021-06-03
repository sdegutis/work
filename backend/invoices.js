const electron = require('electron');
const path = require('path');
const Handlebars = require("handlebars");

/**
 * @param {import('./db').Data} data
 * @param {string} text
 */
async function transform(data, text) {
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

  const { invoiceNumber } = data;

  const date = new Date().toLocaleDateString();

  return Handlebars.compile(text)({
    ...data,
    lines,
    totalCharge,
    totalHours,
    invoiceNumber,
    date,
  });
}

const roundToNearest15Mins = (/** @type {number} */n) =>
  Math.floor(n * 4) / 4;

const humanize = (/** @type {number} */ time) => {
  const [hours, minsStr] = time.toFixed(2).split('.');
  const mins = +(+minsStr).toFixed();
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

const money = (/** @type {number} */ amount) => {
  return MONEY_FORMATTER.format(amount);
};

const dollars = (/** @type {number} */ amount) => {
  return DOLLARS_FORMATTER.format(amount);
};

Handlebars.registerHelper({
  humanize,
  money,
  dollars,
});

const datadir = electron.app.getPath('userData');

/**
 * @param {number} invoiceNum
 */
function getInvoicePdfPath(invoiceNum) {
  const invoiceNumStr = invoiceNum.toFixed().padStart(3, '0');
  return path.join(datadir, `invoice-${invoiceNumStr}.pdf`);
}

module.exports = {
  transform,
  getInvoicePdfPath,
  humanize,
  roundToNearest15Mins,
  dollarize: money,
};
