const electron = require('electron');
const StatusItem = require('./status-item');
const db = require('./db');
const path = require('path');

class App {

  constructor() {
    this.statusItem = new StatusItem();

    this.rebuildMenu();
    this.updateStatusItemText();

    if (db.data.running) {
      this.resume();
    }

    electron.ipcMain.handle('get-data', (e) => {
      return db.data;
    });
  }

  updateStatusItemText() {
    const { name, seconds } = db.data.tasks[db.data.currentTaskIndex];
    this.statusItem.setTitle(name, seconds);
  }

  rebuildMenu() {
    const menu = electron.Menu.buildFromTemplate([

      db.data.running
        ? { label: 'Pause', click: this.pause.bind(this) }
        : { label: 'Resume', click: this.resume.bind(this) },

      { type: 'separator' },

      ...db.data.tasks.map(({ name: task }, i) => {
        const current = db.data.currentTaskIndex === i;
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

      { label: 'Settings', click: this.manageTasks.bind(this) },
      { label: 'Generate Invoice', click: this.generateInvoice.bind(this) },
      { label: 'Reset Work', click: this.resetWork.bind(this) },

      { type: 'separator' },

      { role: 'quit' },
    ]);

    menu.on('menu-will-show', () => {
      this.statusItem.shouldShowColor = false;
      this.updateStatusItemText();
    });

    menu.on('menu-will-close', () => {
      this.statusItem.shouldShowColor = true;
      this.updateStatusItemText();
    });

    this.statusItem.tray.setContextMenu(menu);
  }

  manageTasks() {
    if (this.manageTasksWin) {
      electron.app.focus({ steal: true });
      this.manageTasksWin.focus();
    }
    else {
      electron.app.dock.show();

      const win = new electron.BrowserWindow({
        width: 260,
        height: 400,
        backgroundColor: '#222',
        webPreferences: {
          preload: path.join(__dirname, '../frontend/manage/manage-preload.js'),
        }
      });

      this.manageTasksWin = win;
      win.on('closed', () => {
        delete this.manageTasksWin;
        if (!this.manageTasksWin && !this.invoiceWin) {
          electron.app.dock.hide();
        }
      });

      win.loadFile('frontend/manage/manage.html', {
        query: { data: JSON.stringify(db.data) },
      });

      win.webContents.on('ipc-message', (event, channel, ...data) => {
        if (channel === 'rename') {
          const [i, name] = data;
          db.data.tasks[i].name = name;
          db.save();
          this.rebuildMenu();
          this.updateStatusItemText();
          this.updateInvoice();
        }
        else if (channel === 'create') {
          const [name] = data;
          db.data.tasks.push({ name, seconds: 0 });
          db.save();
          this.rebuildMenu();
          this.updateStatusItemText();
          this.updateInvoice();
        }
        else if (channel === 'delete') {
          const [i] = data;
          db.data.tasks.splice(i, 1);
          db.save();
          this.rebuildMenu();
          this.updateStatusItemText();
          this.updateInvoice();
        }
        else if (channel === 'set-rate') {
          const [rate] = data;
          db.data.rate = rate;
          db.save();
          this.updateInvoice();
        }
        else if (channel === 'show-templates') {
          const datadir = electron.app.getPath('userData');
          const dir = path.join(datadir, 'templates');
          electron.shell.openPath(dir);
        }
      });
    }
  }

  generateInvoice() {
    if (this.invoiceWin) {
      electron.app.focus({ steal: true });
      this.invoiceWin.focus();
    }
    else {
      electron.app.dock.show();

      const win = new electron.BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: '#222',
        webPreferences: {
          preload: path.join(__dirname, '../frontend/invoice/invoice-preload.js'),
        }
      });

      this.invoiceWin = win;
      win.on('closed', () => {
        delete this.invoiceWin;
        if (!this.manageTasksWin && !this.invoiceWin) {
          electron.app.dock.hide();
        }
      });

      win.loadFile('frontend/invoice/invoice.html');

      win.on('ready-to-show', () => {
        win.webContents.send('setup', db.data);
      });

      win.webContents.on('ipc-message', (event, channel, ...data) => {
        if (channel === 'set') {
          const [key, val] = data;

          if (key === 'rate') {
            db.data[/** @type {'rate'} */(key)] = val;
          }
          else if (key === 'template') {
            db.data[/** @type {'template'} */(key)] = val;
          }
          db.save();
        }
      });
    }
  }

  updateInvoice() {
    if (this.invoiceWin) {
      this.invoiceWin.webContents.send('refresh');
    }
  }

  resetWork() {

  }

  /**
   * @param {number} taskIndex
   */
  chooseTask(taskIndex) {
    db.data.currentTaskIndex = taskIndex;
    this.updateStatusItemText();
    this.rebuildMenu();
    db.save();
  }

  pause() {
    db.data.running = false;
    this.rebuildMenu();
    this.updateStatusItemText();

    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  resume() {
    db.data.running = true;
    this.rebuildMenu();
    this.updateStatusItemText();

    this.timer = setInterval(this.tick.bind(this), 1000);
  }

  tick() {
    const task = db.data.tasks[db.data.currentTaskIndex];
    task.seconds++;
    this.updateStatusItemText();
  }

}

module.exports = App;
