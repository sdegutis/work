const electron = require('electron');
const db = require('./db');

const COLORS = {
  light: {
    red: '\033[0;31m',
    hours: '\033[34m',
    yellow: '\033[30;43m',
    blue: '\033[30;46m',
  },
  dark: {
    red: '\033[31m',
    hours: '\033[34m',
    yellow: '\033[33m',
    blue: '\033[36m',
  },
};


class StatusItem {

  constructor() {
    this.tray = new electron.Tray(electron.nativeImage.createEmpty());
    this.lastSet = '';
    this.shouldShowColor = true;
  }

  /**
   * @param {string} taskName
   * @param {number} timeSec
   */
  setTitle(taskName, timeSec) {
    const shortTaskName = taskName.split(/\s+/).map(([c]) => c).join('');

    const totalMin = Math.floor(timeSec / 60);

    const relSec = timeSec % 60;
    const relMin = totalMin % 60;
    const relHour = Math.floor(totalMin / 60);

    const strSec = relSec.toFixed().padStart(2, '0');
    const strMin = relMin.toFixed().padStart(2, '0');
    const strHour = relHour.toFixed().padStart(2, '0');
    const timeStr = `${strHour}:${strMin}:${strSec}`;

    const darkMode = electron.nativeTheme.shouldUseDarkColors;
    const { red, yellow, blue, hours } = darkMode ? COLORS.dark : COLORS.light;

    const timeColor = !this.shouldShowColor ? '' : db.data.running ? red : yellow;
    const taskColor = !this.shouldShowColor ? '' : blue;
    const hourColor = !this.shouldShowColor ? '' : hours;
    const title = `${taskColor}(${shortTaskName}) ${timeColor}[${timeStr}]`;

    if (this.lastSet !== title) {
      this.lastSet = title;
      this.tray.setTitle(title);
    }
  }

}

module.exports = StatusItem;
