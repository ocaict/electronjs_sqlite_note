const saveBtn = document.querySelector(".save-btn");
const titleInput = document.querySelector("#title");
const bodyInput = document.querySelector("#body");
const noteListContainer = document.querySelector(".note-list");
const deleteBtn = document.querySelector(".delete-btn");
const formInputs = [bodyInput, titleInput];
let isUpdate = false;
let updateId = null;
let deleteId = null;

const clearInput = (inputs) => {
  inputs.forEach((input) => (input.value = ""));
};

const trimText = (text, len = 50) => {
  if (text.length <= len) return text;
  return text.substring(0, len) + "...";
};

saveBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const note = { title: titleInput.value, body: bodyInput.value };
  if (!note.title.trim() || !note.body.trim())
    return console.log("Note Title or Body cannoct be blank");

  if (!isUpdate) {
    const result = await api.saveNote(note);
    const notes = await api.getNotes();
    clearInput(formInputs);
    displayNotes(notes);
    saveBtn.textContent = "Save";
  } else {
    if (updateId) {
      note.id = updateId;
      const result = await api.updateNote(note);
      const notes = await api.getNotes();
      displayNotes(notes);
      clearInput(formInputs);
      updateId = null;
      isUpdate = false;
      saveBtn.textContent = "Save";
    }
  }
});

// const textEditor = document.querySelector(".text-editor");
// const openBtn = document.querySelector(".open-btn");
// const saveAsBtn = document.querySelector(".save-as-btn");
// const systemInfoBtn = document.querySelector(".system-info-btn");
// const systemInfoInput = document.querySelector("#system-info");

// let textContent = "";

// openBtn.addEventListener("click", async (e) => {
//   const result = await api.openFile();
//   if (result) {
//     textEditor.innerHTML = result;
//   }
// });

// saveBtn.addEventListener("click", async (e) => {
//   textContent = textEditor.textContent;

//   const result = await api.saveFile(textContent);
//   console.log(result);
// });

// saveAsBtn.addEventListener("click", async (e) => {
//   textContent = textEditor.textContent;
//   const result = await api.saveAsFile(textContent);
//   console.log(result);
// });

// systemInfoBtn.addEventListener("click", async (e) => {
//   const info = systemInfoInput.value;

//   const result = await api.getSysteminfo(info);
//   console.log(result);
// });

const displayNotes = (notes) => {
  if (!notes.length) {
    noteListContainer.innerHTML = `<p class="empty-message">You note will display here</p>`;

    return;
  }
  const html = notes
    .sort((a, b) => new Date(b.date_added) - new Date(a.date_added))
    .map(
      (note) => `<div class="note note-id selected" id="${note.id}">
          <h2 class="note-title">${trimText(note.title)}</h2>
          <p class="note-body">${trimText(note.body, 60)}</p>
          <small class="date">${new Date(
            note.date_added
          ).toDateString()} at ${new Date(
        note.date_added
      ).toLocaleTimeString()}</small>
        </div>`
    )
    .join("");
  noteListContainer.innerHTML = html;
};

document.addEventListener("DOMContentLoaded", async () => {
  noteListContainer.innerHTML = "";
  const notes = await api.getNotes();

  displayNotes(notes);
});

noteListContainer.addEventListener("click", async (e) => {
  let id = null;
  if (!e.target.parentElement.className.includes("note-id")) return;
  const allNoteEles = noteListContainer.querySelectorAll(".note");
  allNoteEles.forEach((noteElem) => noteElem.classList.remove("selected"));
  let selectednoteElem = e.target.parentElement;
  selectednoteElem.classList.add("selected");
  id = selectednoteElem.id;
  const result = await api.getNote(id);
  if (result.success) {
    titleInput.value = result.note.title;
    bodyInput.value = result.note.body;
    isUpdate = true;
    updateId = id;
    deleteId = id;
    saveBtn.textContent = "Update";
  }
});

deleteBtn.addEventListener("click", async (e) => {
  if (!deleteId) return console.log("Selected Note to be deleted");

  const result = await api.deleteNote(deleteId);
  const notes = await api.getNotes();
  displayNotes(notes);
  deleteId = null;
});

let sentence =
  "This is a long sentence and is what we are going to learn to night because it is a long sentenses";
console.log(sentence.substring(0, 30) + "...");
