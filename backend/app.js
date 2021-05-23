const electron = require('electron');
const StatusItem = require('./status-item');
const store = require('./store');

class App {

  constructor() {
    this.statusItem = new StatusItem();

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
    if (this.manageTasksWin) {
      electron.app.focus({ steal: true });
      this.manageTasksWin.focus();
    }
    else {
      const win = new electron.BrowserWindow();

      this.manageTasksWin = win;
      win.on('closed', () => delete this.manageTasksWin);

      win.loadFile('frontend/manage.html');
    }
  }

  generateInvoice() {
    if (this.invoiceWin) {
      electron.app.focus({ steal: true });
      this.invoiceWin.focus();
    }
    else {
      const win = new electron.BrowserWindow();

      this.invoiceWin = win;
      win.on('closed', () => delete this.invoiceWin);

      win.loadFile('frontend/invoice.html');
    }
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
    const task = store.data.tasks[store.data.currentTaskIndex];
    task.seconds++;
    this.updateStatusItemText();
  }

}

module.exports = App;
