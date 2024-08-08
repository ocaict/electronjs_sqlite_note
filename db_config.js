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

// db.run(`
// CREATE TABLE IF NOT EXISTS users (
//   user_id INTEGER PRIMARY KEY,
//   username TEXT NOT NULL UNIQUE,
//   first_name TEXT,
//   last_name TEXT,
//   email TEXT,
//   phone TEXT,
//   password TEXT NOT NULL,
//   address TEXT,
//   imageurl TEXT,
//   dob TEXT,
//   date_registered DATETIME DEFAULT CURRENT_TIMESTAMP
// );
// `);

// db.run(`
// CREATE TABLE IF NOT EXISTS contacts (
//   id INTEGER PRIMARY KEY,
//   user_id INTEGER,
//   firstname TEXT,
//   lastname TEXT,
//   email TEXT,
//   phone TEXT,
//   address TEXT,
//   company TEXT,
//   imageurl TEXT,
//   dob TEXT,
//   note TEXT,
//   date DATETIME DEFAULT CURRENT_TIMESTAMP,
//   FOREIGN KEY (user_id) REFERENCES users(user_id)
// )
// `);

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

// Insert Contact
function insertContact(
  userId,
  firstname,
  lastname,
  email,
  phone,
  address,
  imageurl,
  company,
  dob,
  note
) {
  return new Promise((resolve, reject) => {
    let query = `
      INSERT INTO contacts (user_id, firstname, lastname, email, phone, address, company, imageurl, dob, note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      query,
      [
        userId,
        firstname,
        lastname,
        email,
        phone,
        address,
        company,
        imageurl,
        dob,
        note,
      ],
      function (err) {
        if (err) {
          return reject("Error inserting contact:" + err.message);
        }
        return resolve(`Contact ${firstname} inserted with ID ${this.lastID}`);
      }
    );
  });
}

// Get All Contacts

function getAllContacts(userId) {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM contacts WHERE user_id = ?`,
      [userId],
      (err, rows) => {
        if (err) {
          reject("Error retrieving contacts:", err.message);
          return;
        }
        resolve(rows);
      }
    );
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
  db,
  insertNote,
  getAllNotes,
  getNote,
  updateNote,
  deleteNote,
};
