const { dialog } = require("electron");
const { app, BrowserWindow, ipcMain, Menu } = require("electron/main");
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
          // {
          //   label: "Open...",
          //   click: async () => {
          //     const results = await dialog.showOpenDialog(mainWindow, {
          //       properties: ["openFile"],
          //       defaultPath: "Documents",
          //       filters: [
          //         {
          //           name: "Text",
          //           extensions: ["txt", "md", "markdown"],
          //         },
          //       ],
          //     });

          //     if (results.canceled) return;
          //     const filePath = results.filePaths[0];
          //     readFile(filePath, "utf8", (err, data) => {
          //       if (err) return console.log(err);
          //       console.log(data);
          //       ipcMain.handle("text", () => {
          //         return data;
          //       });
          //     });
          //   },
          // },
          {
            role: "reload",
          },
          { role: app.isPackaged ? "quit" : "toggleDevTools" },
        ],
      },
    ])
  );
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

ipcMain.handle("os", (e, key) => {
  const info = {
    arch: os.arch(),
    cpus: os.cpus(),
    freemem: os.freemem(),
    homedir: os.homedir(),
    hostname: os.hostname(),
    networkInterfaces: os.networkInterfaces(),
    platform: os.platform(),
    release: os.release(),
    totalmem: os.totalmem(),
    type: os.type(),
    userInfo: os.userInfo(),
    uptime: os.uptime(),
    version: os.version(),
    machine: os.machine(),
  };
  return info;
});

// ipcMain.handle("users", (e, users) => {
//   console.log(users);
// });
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

/*
 // Creating application menu
  const menuTemplate = [
    {
      label: "Copy",
      click: () => {
        mainWindow.webContents.send("copy");
      },
    },
    {
      label: "Change Version",
      submenu: [
        {
          label: "kjv",
          click: () => {
            mainWindow.webContents.send("changeUrl", "kjv");
          },
        },
        {
          label: "nkjv",
          click: () => {
            mainWindow.webContents.send("changeUrl", "nkjv");
          },
        },
        {
          label: "French",
          click: () => {
            mainWindow.webContents.send("changeUrl", "french");
          },
        },
        {
          label: "Russian",
          click: () => {
            mainWindow.webContents.send("changeUrl", "russian");
          },
        },
      ],
    },
    {
      label: "Always On Top",
      submenu: [
        {
          label: "True",
          type: "radio",
          checked: true,
          click: (e) => {
            mainWindow.webContents.send("topTrue", e.checked);
            console.log(e.checked);
            mainWindow.setAlwaysOnTop(true);
          },
        },
        {
          label: "False",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("topFalse");
            mainWindow.setAlwaysOnTop(false);
          },
        },
      ],
    },
    {
      label: "Timer",
      submenu: [
        {
          label: "5 s",
          type: "radio",
          checked: true,
          click: (e) => {
            mainWindow.webContents.send("timer", 5);
          },
        },
        {
          label: "10 s",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 10);
          },
        },
        {
          label: "30 s",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 30);
          },
        },
        {
          label: "1 min",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 60);
          },
        },
        {
          label: "5 mins",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 5 * 1000);
          },
        },
        {
          label: "10 mins",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 10 * 1000);
          },
        },
        {
          label: "20 mins",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 20 * 1000);
          },
        },
        {
          label: "30 mins",
          type: "radio",
          checked: false,
          click: (e) => {
            mainWindow.webContents.send("timer", 30 * 1000);
          },
        },
      ],
    },
    {
      label: "about",
      click: () => {
        createAboutWindow();
      },
    },

    {
      label: "Quit",
      click: () => app.quit(),
    },
  ];

  // Pushing developer tools and reload into menu template if not packaged
  if (!app.isPackaged) {
    menuTemplate.push({ role: "toggleDevTools" });
    menuTemplate.push({ role: "reload" });
  }

  // Building application menu from template
  const menu = Menu.buildFromTemplate(menuTemplate);

  // Setting application menu
  Menu.setApplicationMenu(menu);

  // Context menu for main window
  mainWindow.webContents.on("context-menu", (e, params) => {
    e.preventDefault();
    menu.popup(mainWindow, params.x, params.y);
  });
*/
