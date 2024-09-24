const path = require("path");
const log = require("electron-log");
const { app } = require("electron");

const logPath = app.isPackaged
  ? path.join(process.resourcesPath, "logs", "main.log")
  : path.join(__dirname, "logs", "logs.log");
log.transports.file.resolvePathFn = () => logPath;

// Log uncaught exceptions
process.on("uncaughtException", (error) => {
  log.error("Uncaught exception:", error);
});

log.info("Application started");

// Export the configured logger
module.exports = log;
