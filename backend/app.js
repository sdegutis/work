const electron = require('electron');
const StatusItem = require('./status-item');
const db = require('./db');
const path = require('path');
const fs = require('fs-extra');
const templates = require('./templates');
const invoices = require('./invoices');
const chokidar = require('chokidar');

class App {

  constructor() {
    if (process.platform === 'win32') electron.app.setAppUserModelId(electron.app.name);

    this.statusItem = new StatusItem();

    this.statusItem.tray.on('click', () => db.data.running ? this.pause() : this.resume());

    this.rebuildMenu();
    this.updateStatusItemText();

    electron.nativeTheme.addListener('updated', () => {
      this.updateStatusItemText();
    });

    if (db.data.running) {
      this.resume();
    }

    electron.ipcMain.handle('get-data', (e) => {
      return db.data;
    });

    this.pdfWin = new electron.BrowserWindow({
      show: false,
    });
  }

  updateStatusItemText() {
    const { name, seconds } = db.data.tasks[db.data.currentTaskIndex];

    const title = this.statusItem.setTitle(name, seconds);
    this.statusItem.setImage();

    const invoiceHours = (db.data.tasks
      .map(task => invoices.roundToNearest15Mins(task.seconds / 60 / 60))
      .reduce((a, b) => a + b, 0));

    const totalCharge = invoices.dollarize(db.data.rate * invoiceHours);

    this.statusItem.tray.setToolTip(`${title}\n\nHours: ${invoiceHours}\nCharge: ${totalCharge}`);
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
      { label: 'Reset All Hours', click: this.resetWork.bind(this) },

      { type: 'separator' },

      { role: 'quit' },
    ]);

    menu.on('menu-will-show', () => {
      this.updateStatusItemText();
    });

    menu.on('menu-will-close', () => {
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
      const win = new electron.BrowserWindow({
        width: 350,
        height: 350,
        minWidth: 350,
        minHeight: 350,
        maxWidth: 500,
        maximizable: false,
        minimizable: false,
        backgroundColor: '#222',
        webPreferences: {
          preload: path.join(__dirname, '../frontend/settings-preload.js'),
        }
      });

      this.manageTasksWin = win;
      win.on('closed', () => {
        delete this.manageTasksWin;
      });
      win.setMenu(null);

      win.loadFile('frontend/settings.html', {
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
        else if (channel === 'set-invoice-number') {
          const [invoiceNumber] = data;
          db.data.invoiceNumber = invoiceNumber;
          db.save();
          this.updateInvoice();
        }
        else if (channel === 'show-templates') {
          electron.shell.openPath(templates.templateDir);
        }
      });
    }
  }

  generateInvoice() {
    this.doInvoice(true);
  }

  updateInvoice() {
    if (this.invoiceWin) {
      this.doInvoice(false);
    }
  }

  /**
   * @param {boolean} focus
   */
  doInvoice(focus) {
    if (this.invoiceWin) {
      if (focus) {
        electron.app.focus({ steal: true });
        this.invoiceWin.focus();
      }
    }
    else {
      const win = new electron.BrowserWindow({
        width: 450,
        height: 675,
      });
      win.setMenu(null);

      const watcher = chokidar.watch(templates.currentTemplatePath, {
        ignoreInitial: true,
      }).on('all', () => {
        this.updateInvoice();
      });

      this.invoiceWin = win;
      win.on('closed', () => {
        watcher.close();
        delete this.invoiceWin;
      });
    }

    const inputTemplate = templates.getCurrentTemplate();

    invoices.transform(db.data, inputTemplate).then(html => {
      const invoicePdfPath = invoices.getInvoicePdfPath(db.data.invoiceNumber);

      const htmlPath = path.join(invoicePdfPath, '../converted.html');
      fs.writeFileSync(htmlPath, html);

      this.pdfWin.loadFile(htmlPath);
      this.pdfWin.webContents.once('did-finish-load', () => {
        this.pdfWin.webContents.printToPDF({
          printBackground: true,
          marginsType: 0,
          pageSize: 'Letter',
        }).then(buf => {
          fs.writeFileSync(invoicePdfPath, buf);
          this.invoiceWin?.loadFile(invoicePdfPath);
        });
      });
    });
  }

  resetWork() {
    electron.app.focus({ steal: true });
    setTimeout(async () => {
      const result = await electron.dialog.showMessageBox({
        message: 'Reset ALL work?',
        buttons: ['Reset', 'Cancel'],
        defaultId: 1,
      });

      if (result.response === 0) {
        for (const task of db.data.tasks) {
          task.seconds = 0;
        }
        db.data.invoiceNumber++;
        db.save();
        this.updateStatusItemText();
        this.updateInvoice();
      }
    }, 0);
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

    this.timer = setInterval(this.tick.bind(this), 10000);
  }

  tick() {
    this.adjustCurrentTaskBy(10);
  }

  /**
   * @param {number} seconds to add
   */
  adjustCurrentTaskBy(seconds) {
    const task = db.data.tasks[db.data.currentTaskIndex];
    task.seconds += seconds;
    this.updateStatusItemText();
  }

}

module.exports = App;
