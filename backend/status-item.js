const electron = require('electron');

const RED = '\033[31;1m';
const YELLOW = '\033[33;1m';
const BLUE = '\033[34;1m';
const RESET = '\033[0m';

class StatusItem {

  constructor() {
    this.tray = new electron.Tray(electron.nativeImage.createEmpty());
    this.running = false;
  }

  /**
   * @param {string} appName
   * @param {number} timeMs
   */
  setTitle(appName, timeMs) {
    const totalSec = Math.floor(timeMs / 1000);
    const totalMin = Math.floor(totalSec / 60);

    const relMin = totalMin % 60;
    const relHour = Math.floor(totalMin / 60);

    console.log({ relMin, relHour })

    const strMin = relMin.toFixed().padStart(2, '0');
    const strHour = relHour.toFixed().padStart(2, '0');
    const timeStr = `${strHour}:${strMin}`;

    const color = this.running ? RED : YELLOW;
    this.tray.setTitle(`${color}(${appName}) [${timeStr}]${RESET}`, {
      fontType: 'monospacedDigit',
    });
  }

}

module.exports = StatusItem;
