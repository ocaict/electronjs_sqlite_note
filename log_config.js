const path = require("path");
const { app } = require("electron");
const log = require("electron-log");
const fs = require("fs");

let logPath;
const userDataPath = app.getPath("userData");

// Set the log path depending on the environment (packaged or development)
if (app.isPackaged) {
  // In production, logs are stored in userData/logs directory
  logPath = path.join(userDataPath, "logs", "logs.log");
} else {
  // In development, logs are stored in the project folder
  logPath = path.join(__dirname, "logs", "logs.log");
}

// Ensure the logs directory exists
const logDir = path.dirname(logPath);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Configure electron-log to use the custom log path
log.transports.file.resolvePathFn = () => logPath;

// Log uncaught exceptions
process.on("uncaughtException", (error) => {
  log.error("Uncaught exception:", error);
});
log.info("Application started");

// Export the configured logger
module.exports = { log, logPath };
