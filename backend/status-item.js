const electron = require('electron');

const RED = '\033[31;1m';
const YELLOW = '\033[33;1m';
const BLUE = '\033[34;1m';
const RESET = '\033[0m';

class StatusItem {

  constructor() {
    this.tray = new electron.Tray(electron.nativeImage.createEmpty());
    this.running = false;
    this.lastSet = '';
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

    const strSec = relSec.toFixed().padStart(2, '0');
    const strMin = relMin.toFixed().padStart(2, '0');
    const strHour = relHour.toFixed().padStart(2, '0');
    const timeStr = `${strHour}:${strMin}:${strSec}`;

    const color = this.running ? RED : YELLOW;
    const title = `${color}(${taskName}) [${timeStr}]${RESET}`;

    if (this.lastSet !== title) {
      this.lastSet = title;
      this.tray.setTitle(title, { fontType: 'monospacedDigit' });
    }
  }

}

module.exports = StatusItem;
