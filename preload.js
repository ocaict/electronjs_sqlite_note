const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  saveNote: (args) => ipcRenderer.invoke("save-note", args),
  updateNote: (args) => ipcRenderer.invoke("update-note", args),
  getSysteminfo: (args) => ipcRenderer.invoke("os", args),
  getNotes: () => ipcRenderer.invoke("allnotes"),
  getNote: (args) => ipcRenderer.invoke("onenote", args),
  deleteNote: (args) => ipcRenderer.invoke("delete-note", args),
  showMessage: (msg) => ipcRenderer.invoke("show-message", msg),
  showPopMenu: (args) => ipcRenderer.invoke("show-popup-menu", args),
  showNotification: (args) => ipcRenderer.invoke("show-notification", args),
});
