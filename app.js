const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Notification,
  dialog,
} = require("electron/main");
const path = require("path");

const {
  insertNote,
  getAllNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("./db_config");
const { shell } = require("electron");

const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const logPath = app.isPackaged ? "resources" : "logs";
log.transports.file.resolvePathFn = () => path.join(logPath, "logs.log");

console.log(path.join(app.getPath("userData"), "resources"));
let mainWindow;
let aboutWindow;
const preloadJS = "preload.js";
const appIcon = "appIcon.png";
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    minWidth: 1024,
    maxWidth: 1450,
    height: 627,
    minHeight: 627,
    maxHeight: 800,
    show: false,
    icon: path.join(__dirname, appIcon),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, preloadJS),
    },
  });
  mainWindow.loadFile("ui/index.html");
  mainWindow.on("ready-to-show", () => mainWindow.show());

  if (!app.isPackaged) return mainWindow.webContents.openDevTools();
}
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    width: 300,
    height: 250,
    show: false,
    parent: mainWindow,
    modal: true,
    resizable: false,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, appIcon),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, preloadJS),
    },
  });
  aboutWindow.loadFile("ui/about.html");
  aboutWindow.on("ready-to-show", () => aboutWindow.show());
  if (!app.isPackaged) return aboutWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createMainWindow();
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            role: "reload",
          },
          { role: app.isPackaged ? "quit" : "toggleDevTools" },
        ],
      },
      {
        label: "About",
        click: () => {
          createAboutWindow();
        },
      },
    ])
  );

  ipcMain.handle("show-notification", (e, { title, body, subtitle }) => {
    const notification = new Notification({
      icon: appIcon,
      title,
      body,
    });
    notification.show();
  });
  // Appversion

  log.log(`AppVersion: ${app.getVersion()}`);
  // Autoupdate logics
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on("update-available", () => {
    log.info("Update Available");
  });

  autoUpdater.on("update-not-available", () => {
    log.info("Update Not Available");
  });
  autoUpdater.on("checking-for-update", () => {
    log.info("Checking For Update..");
  });
  autoUpdater.on("download-progress", (progress) => {
    log.info("Download Progress");
    log.info(progress);
  });
  autoUpdater.on("update-downloaded", (progress) => {
    log.info("Update Downloaded");
  });
  autoUpdater.on("error", (error) => {
    log.info("Error");
    log.info(error);
  });
});

// Save
ipcMain.handle("save-note", async (e, note) => {
  if (!note.title.trim() || !note.body.trim())
    return dialog.showErrorBox("Error", "Note Title or body cannot be blank!");

  const result = await insertNote(note);
  return result;
});

ipcMain.handle("update-note", async (e, note) => {
  if (!note.title.trim() || !note.body.trim())
    return dialog.showErrorBox("Error", "Note Title or body cannot be blank!");

  const result = await updateNote(note);
  return result;
});

ipcMain.handle("allnotes", async () => {
  const notes = await getAllNotes();
  return notes;
});
ipcMain.handle("onenote", async (e, id) => {
  const note = await getNote(id);
  return note;
});

ipcMain.handle("delete-note", async (e, id) => {
  const result = await deleteNote(id);
  return result;
});

ipcMain.handle("show-message", async (e, { message, type, title, buttons }) => {
  const result = await dialog.showMessageBox(mainWindow, {
    title,
    message,
    type,
    buttons,
  });

  return result.response === 0;
});

ipcMain.handle("show-popup-menu", async (e, id) => {
  // Creating application menu
  const contextMenuTemplate = [
    {
      label: "Copy",
      click: () => {
        mainWindow.webContents.send("copy-note", id);
      },
    },
    {
      label: "Delete",
      click: async (e) => {
        mainWindow.webContents.send("note-delete", id);
      },
    },

    {
      label: "Quit",
      click: () => app.quit(),
    },
  ];

  // Building application menu from template
  const menu = Menu.buildFromTemplate(contextMenuTemplate);
  menu.popup(mainWindow);
});

ipcMain.handle("open-url", async () => {
  shell.openExternal("https://oluegwuc.netlify.app/");
});

ipcMain.handle("app-version", async () => {
  return app.getVersion();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

if (!app.isPackaged) {
  require("electron-reload")(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`),
  });
}
