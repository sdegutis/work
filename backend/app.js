const electron = require('electron');
const StatusItem = require('./status-item');
const store = require('./store');

const DEBUG = true;

class App {

  constructor() {
    this.statusItem = new StatusItem();

    if (DEBUG) {
      store.data = {
        running: false,
        currentTaskIndex: 0,
        tasks: [
          ['stuff', 0],
          ['Some things', 2],
          ['Whatever!', 60 * 60 * 2.25],
        ],
      };
    }

    this.rebuildMenu();
    this.updateStatusItemText();

    if (store.data.running) {
      this.resume();
    }
  }

  updateStatusItemText() {
    const [app, time] = store.data.tasks[store.data.currentTaskIndex];
    this.statusItem.setTitle(app, time);
  }

  rebuildMenu() {
    this.menu = electron.Menu.buildFromTemplate([

      store.data.running
        ? { label: 'Pause', click: this.pause.bind(this) }
        : { label: 'Resume', click: this.resume.bind(this) },

      { type: 'separator' },

      ...store.data.tasks.map(([task,], i) => {
        const current = store.data.currentTaskIndex === i;
        return /** @type {electron.MenuItemConstructorOptions} */ ({
          label: task,
          type: 'radio',
          enabled: !current,
          checked: current,
          id: task,
          click: () => this.chooseTask(i),
        });
      }),

      { type: 'separator' },

      { label: 'Generate Invoice', click: this.generateInvoice.bind(this) },
      { label: 'Reset Work', click: this.resetWork.bind(this) },

      { type: 'separator' },

      { role: 'quit' },
    ]);

    this.statusItem.tray.setContextMenu(this.menu);
  }

  generateInvoice() {

  }

  resetWork() {

  }

  /**
   * @param {number} taskIndex
   */
  chooseTask(taskIndex) {
    store.data.currentTaskIndex = taskIndex;
    this.updateStatusItemText();
    this.rebuildMenu();
  }

  pause() {
    store.data.running = false;
    this.rebuildMenu();

    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  resume() {
    store.data.running = true;
    this.rebuildMenu();

    this.timer = setInterval(this.tick.bind(this), 10);
  }

  tick() {
    const app = store.data.tasks[store.data.currentTaskIndex];
    app[1]++;
    this.updateStatusItemText();
  }

}

module.exports = App;
