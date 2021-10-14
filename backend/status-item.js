const electron = require('electron');
const db = require('./db');
const path = require('path');

const COLORS = {
  light: {
    red: '\033[0;31m',
    hours: '\033[34m',
    yellow: '\033[1;33m',
    blue: '\033[34m',
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
    this.iconOff = electron.nativeImage.createFromPath(path.join(__dirname, '../tray.png'));
    this.iconOn = electron.nativeImage.createFromPath(path.join(__dirname, '../tray-on.png'));
    this.tray = new electron.Tray(this.iconOff);
    this.lastSet = '';
  }

  setImage() {
    const running = db.data.running;
    this.tray.setImage(running ? this.iconOn : this.iconOff);
  }

  /**
   * @param {string} taskName
   * @param {number} timeSec
   */
  setTitle(taskName, timeSec) {
    const totalMin = Math.floor(timeSec / 60);

    const relSec = timeSec % 60;
    const relMin = totalMin % 60;
    const relHour = Math.floor(totalMin / 60);

    // const strSec = relSec.toFixed().padStart(2, '0');
    const strMin = relMin.toFixed().padStart(2, '0');
    const strHour = relHour.toFixed().padStart(2, '0');
    const timeStr = `${strHour}:${strMin}`;

    const darkMode = electron.nativeTheme.shouldUseDarkColors;
    const { red, yellow, blue, hours } = darkMode ? COLORS.dark : COLORS.light;

    const title = `(${taskName})\n[${timeStr}]`;
    return title;
  }

}

module.exports = StatusItem;
