const electron = require('electron');
const db = require('./db');
const { humanize, roundToNearest15Mins } = require('./invoices');

const RED = '\033[31m';
const HOURS = '\033[34m';
const YELLOW = '\033[33m';
const BLUE = '\033[36m';

class StatusItem {

  constructor() {
    this.tray = new electron.Tray(electron.nativeImage.createEmpty());
    this.lastSet = '';
    this.shouldShowColor = true;
  }

  /**
   * @param {string} taskName
   * @param {number} timeSec
   * @param {number} invoiceSec
   */
  setTitle(taskName, timeSec, invoiceSec) {
    const shortTaskName = taskName.split(/\s+/).map(([c]) => c).join('');

    const totalMin = Math.floor(timeSec / 60);

    const relSec = timeSec % 60;
    const relMin = totalMin % 60;
    const relHour = Math.floor(totalMin / 60);

    const strSec = relSec.toFixed().padStart(2, '0');
    const strMin = relMin.toFixed().padStart(2, '0');
    const strHour = relHour.toFixed().padStart(2, '0');
    const timeStr = `${strHour}:${strMin}:${strSec}`;

    const invoiceHours = roundToNearest15Mins(invoiceSec / 60 / 60);
    const hoursStr = (invoiceHours).toString();

    const timeColor = !this.shouldShowColor ? '' : db.data.running ? RED : YELLOW;
    const taskColor = !this.shouldShowColor ? '' : BLUE;
    const hourColor = !this.shouldShowColor ? '' : HOURS;
    const title = `${taskColor}(${shortTaskName}) ${timeColor}[${timeStr}] ${hourColor}{${hoursStr}}`;

    if (this.lastSet !== title) {
      this.lastSet = title;
      this.tray.setTitle(title);
    }
  }

}

module.exports = StatusItem;
