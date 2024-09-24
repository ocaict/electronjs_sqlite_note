const saveBtn = document.querySelector(".save-btn");
const titleInput = document.querySelector("#title");
const bodyInput = document.querySelector("#body");
const noteListContainer = document.querySelector(".note-list");
const deleteBtn = document.querySelector(".delete-btn");
const addBtn = document.querySelector(".add-btn");
const footerStatus = document.querySelector(".footer-status");

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
    return await api.showMessage({
      message: "Note title or body cannot be blank",
      type: "error",
      title: "Error",
      buttons: [],
    });

  if (!isUpdate) {
    const result = await api.saveNote(note);
    console.log(result);
    const notes = await api.getNotes();
    displayNotes(notes);
    resetForm();
  } else {
    if (updateId) {
      note.id = updateId;
      const result = await api.updateNote(note);
      console.log(result);
      const notes = await api.getNotes();
      displayNotes(notes);
      resetForm();
    }
  }
});

const displayNotes = (notes) => {
  if (!notes.length) {
    noteListContainer.innerHTML = `<p class="empty-message">Your note will display here</p>`;

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

  const path = await api.getPath();
  console.log(path);
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

noteListContainer.addEventListener("contextmenu", async (e) => {
  let id = null;
  if (!e.target.parentElement.className.includes("note-id")) return;
  let selectednoteElem = e.target.parentElement;
  id = selectednoteElem.id;
  await api.showPopMenu(id);
});

const deleteNote = async (id) => {
  if (!id)
    return await api.showMessage({
      message: "Select Note to be deleted!",
      type: "error",
      title: "Error",
      buttons: [],
    });
  const result = await api.showMessage({
    title: "Confirm",
    type: "info",
    message: "Are you sure you want to delete the selected note?",
    buttons: ["Yes", "Cancel"],
  });

  if (!result) return;
  await api.deleteNote(id);
  const notes = await api.getNotes();
  displayNotes(notes);
  resetForm();
};

deleteBtn.addEventListener("click", async (e) => {
  await deleteNote(deleteId);
  deleteId = null;
});

addBtn.addEventListener("click", (e) => {
  resetForm();
});

const resetForm = () => {
  clearInput(formInputs);
  titleInput.focus();
  saveBtn.textContent = "Save";
  updateId = null;
  isUpdate = false;
  deleteId = null;
};

window.api.onNoteDelete(async (event, id) => {
  await deleteNote(id);
});

window.api.onNoteCopy(async (event, id) => {
  const {
    note: { title, body },
  } = await api.getNote(id);
  const noteString = `${title} \n ${body}`;
  await navigator.clipboard.writeText(noteString);
});
