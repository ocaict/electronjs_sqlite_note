const { app } = require("electron/main");
const sqlite3 = require("sqlite3");

const dbPath = app.isPackaged ? "resources" : "databases";
const db = new sqlite3.Database(dbPath + "/mydatabase.db");

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
