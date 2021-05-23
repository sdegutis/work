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
          { name: 'stuff', seconds: 0 },
          { name: 'Some things', seconds: 2 },
          { name: 'Whatever!', seconds: 60 * 60 * 2.25 },
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
    const { name, seconds } = store.data.tasks[store.data.currentTaskIndex];
    this.statusItem.setTitle(name, seconds);
  }

  rebuildMenu() {
    this.menu = electron.Menu.buildFromTemplate([

      store.data.running
        ? { label: 'Pause', click: this.pause.bind(this) }
        : { label: 'Resume', click: this.resume.bind(this) },

      { type: 'separator' },

      ...store.data.tasks.map(({ name: task }, i) => {
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

      { label: 'Manage Tasks', click: this.manageTasks.bind(this) },
      { label: 'Generate Invoice', click: this.generateInvoice.bind(this) },
      { label: 'Reset Work', click: this.resetWork.bind(this) },

      { type: 'separator' },

      { role: 'quit' },
    ]);

    this.statusItem.tray.setContextMenu(this.menu);
  }

  manageTasks() {
    const win = new electron.BrowserWindow();
    win.loadFile('frontend/manage.html');
  }

  generateInvoice() {
    const win = new electron.BrowserWindow();
    win.loadFile('frontend/invoice.html');
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
    app.seconds++;
    this.updateStatusItemText();
  }

}

module.exports = App;
