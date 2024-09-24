const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("api", {
  saveNote: (args) => ipcRenderer.invoke("save-note", args),
  updateNote: (args) => ipcRenderer.invoke("update-note", args),
  getNotes: () => ipcRenderer.invoke("allnotes"),
  getNote: (args) => ipcRenderer.invoke("onenote", args),
  deleteNote: (args) => ipcRenderer.invoke("delete-note", args),
  showMessage: (msg) => ipcRenderer.invoke("show-message", msg),
  showPopMenu: (args) => ipcRenderer.invoke("show-popup-menu", args),
  showNotification: (args) => ipcRenderer.invoke("show-notification", args),
  onNoteDelete: (callback) => ipcRenderer.on("note-delete", callback),
  onNoteCopy: (callback) => ipcRenderer.on("copy-note", callback),
  getAppVersion: () => ipcRenderer.invoke("app-version"),
  openUrl: () => ipcRenderer.invoke("open-url"),
  getPath: () => ipcRenderer.invoke("get-path"),
});
