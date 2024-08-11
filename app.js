const { dialog } = require("electron");
const {
  app,
  BrowserWindow,
  ipcMain,
  Menu,
  Notification,
} = require("electron/main");
const os = require("os");
const path = require("path");
const {
  insertNote,
  getAllNotes,
  getNote,
  updateNote,
  deleteNote,
} = require("./db_config");

let mainWindow;
const preloadJS = "preload.js";

const appIcon = "appIcon.png";
function createWindow() {
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

app.whenReady().then(() => {
  createWindow();

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
    ])
  );
  const info = {
    arch: os.arch(),
    cpus: os.cpus(),
    freemem: os.freemem(),
    platform: os.platform(),
    release: os.release(),
    totalmem: os.totalmem(),
    type: os.type(),
    username: os.userInfo().username,
    uptime: os.uptime(),
    version: os.version(),
    machine: os.machine(),
  };
  ipcMain.handle("os", (e, key) => {
    if (key) return info[key];
    return info;
  });
  ipcMain.handle("show-notification", (e, { title, body, subtitle }) => {
    const notification = new Notification({
      icon: appIcon,
      title,
      body,
    });
    notification.show();
  });
});

/* // Context menu for main window
mainWindow.webContents.on("context-menu", (e, params) => {
  e.preventDefault();
  // menu.popup(mainWindow, params.x, params.y);
});
 */
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

ipcMain.handle("show-message", async (e, { message, type, title }) => {
  const result = await dialog.showMessageBox(mainWindow, {
    title,
    message,
    type,
  });
});

ipcMain.handle("show-popup-menu", async (e, id) => {
  // Creating application menu
  const contextMenuTemplate = [
    {
      label: "Copy",
      click: () => {
        console.log("Copy");
      },
    },
    {
      label: "Delete",
      click: async (e) => {
        await deleteNote(id);
        mainWindow.reload();
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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
