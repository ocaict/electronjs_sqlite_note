const { app } = require("electron/main");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

let dbPath;
let userDataPath = app.getPath("userData");

if (app.isPackaged) {
  // In production - use resources/databases/mydatabase.db
  dbPath = path.join(process.resourcesPath, "databases", "mydatabase.db");
} else {
  // In development - use databases/mydatabase.db in the project directory
  dbPath = path.join(__dirname, "databases", "mydatabase.db");
}

// Ensure the database file exists and is writable
if (app.isPackaged) {
  // In production, we need to copy the database to a writable location
  const writableDbPath = path.join(userDataPath, "databases", "mydatabase.db");
  const dbDir = path.dirname(writableDbPath);

  // Create the databases directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  if (!fs.existsSync(writableDbPath)) {
    // If the database doesn't exist in the user data folder, copy it from resources
    fs.copyFileSync(dbPath, writableDbPath);
  }

  // Use the writable path for database operations
  dbPath = writableDbPath;
} else {
  // In development, ensure the database directory exists
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Database opening error: ", err);
  } else {
    console.log("Connected to the database");
    console.log("Database path:", dbPath);
  }
});

db.run(`
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY,
  title TEXT,
  body TEXT,
  date_added DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

function insertNote({ title, body }) {
  return new Promise((resolve, reject) => {
    let query = `
      INSERT INTO notes (title, body)
      VALUES (?, ?)
    `;
    db.run(query, [title, body], function (err) {
      if (err) {
        return reject({
          success: false,
          message: "Error inserting notes:" + err.message,
        });
      }
      return resolve({
        success: true,
        message: `Note  inserted with ID ${this.lastID}`,
      });
    });
  });
}

function getAllNotes() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM notes`, (err, rows) => {
      if (err) {
        reject("Error retrieving contacts:", err.message);
        return;
      }
      resolve(rows);
    });
  });
}

function getNote(id) {
  return new Promise((resolve, reject) => {
    db.get("SELECT * FROM notes WHERE id = ?", [id], (err, row) => {
      if (err)
        return reject({
          success: false,
          message: "Error retrieving contact: " + err.message,
        });

      return resolve({ success: true, note: row });
    });
  });
}

// Update Note
function updateNote({ id, title, body }) {
  return new Promise((resolve, reject) => {
    let query = `
      UPDATE notes
      SET title = ?, body = ? WHERE id = ?
    `;
    db.run(query, [title, body, id], function (err) {
      if (err)
        return reject({
          success: false,
          message: "Error updating contact: " + err.message,
        });

      return resolve({ success: true, message: `Note with ID ${id} updated` });
    });
  });
}

function deleteNote(id) {
  return new Promise((resolve, reject) => {
    db.run("DELETE FROM notes WHERE id = ?", [id], function (err) {
      if (err)
        return reject({
          success: false,
          message: "Error deleting contact: " + err.message,
        });

      return resolve({ success: true, message: `Note with ID ${id} deleted` });
    });
  });
}

module.exports = {
  insertNote,
  getAllNotes,
  getNote,
  updateNote,
  deleteNote,
};
