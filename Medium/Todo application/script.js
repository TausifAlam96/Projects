// State management
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let editingId = null;

// DOM Elements
const form = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const todoList = document.getElementById("todo-list");

// Format readable timestamp: "DD/MM/YYYY, HH:MM"
function formatDateTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Save current state to localStorage
function saveToLocalStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

// Render tasks
function renderTodos() {
  todoList.innerHTML = "";

  if (todos.length === 0) {
    todoList.innerHTML = `<li class="empty-state">No tasks available. Add one above!</li>`;
    return;
  }

  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.className = "todo-item";

    // Determine badge class
    const priorityClass = `priority-${todo.priority.toLowerCase()}`;

    // Prepare timestamps
    const createdText = `Added: ${formatDateTime(todo.createdAt)}`;
    const updatedText = todo.updatedAt
      ? ` • Updated: ${formatDateTime(todo.updatedAt)}`
      : "";

    li.innerHTML = `
          <div class="todo-main">
            <input 
              type="checkbox" 
              ${todo.completed ? "checked" : ""} 
              data-id="${todo.id}"
              class="complete-checkbox"
            />
            <div class="todo-details">
              <span class="todo-text ${todo.completed ? "completed" : ""}">
                ${escapeHTML(todo.text)}
              </span>
              <div class="meta-row">
                <span class="badge ${priorityClass}">${todo.priority}</span>
                <span>${createdText}${updatedText}</span>
              </div>
            </div>
          </div>
          <div class="actions">
            <button class="action-btn btn-edit" data-id="${todo.id}">Edit</button>
            <button class="action-btn btn-delete" data-id="${todo.id}">Delete</button>
          </div>
        `;

    todoList.appendChild(li);
  });
}

// Sanitize string to prevent XSS
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Reset Form UI state
function resetForm() {
  editingId = null;
  taskInput.value = "";
  prioritySelect.value = "Medium";
  submitBtn.textContent = "Add Task";
  cancelBtn.style.display = "none";
}

// Add or Update Handler (Create & Update)
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;
  const now = new Date().toISOString();

  if (!text) return;

  if (editingId !== null) {
    // UPDATE Existing Task
    todos = todos.map((todo) => {
      if (todo.id === editingId) {
        return {
          ...todo,
          text,
          priority,
          updatedAt: now,
        };
      }
      return todo;
    });
  } else {
    // CREATE New Task
    const newTodo = {
      id: Date.now(),
      text,
      priority,
      completed: false,
      createdAt: now,
      updatedAt: null,
    };
    todos.unshift(newTodo);
  }

  saveToLocalStorage();
  renderTodos();
  resetForm();
});

// Event Delegation: Toggle Done, Delete, and Edit
todoList.addEventListener("click", (e) => {
  const id = Number(e.target.getAttribute("data-id"));

  // TOGGLE COMPLETE (Strike-through)
  if (e.target.classList.contains("complete-checkbox")) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: e.target.checked } : todo,
    );
    saveToLocalStorage();
    renderTodos();
    return;
  }

  // DELETE
  if (e.target.classList.contains("btn-delete")) {
    todos = todos.filter((todo) => todo.id !== id);
    if (editingId === id) resetForm();
    saveToLocalStorage();
    renderTodos();
    return;
  }

  // START EDITING
  if (e.target.classList.contains("btn-edit")) {
    const taskToEdit = todos.find((todo) => todo.id === id);
    if (taskToEdit) {
      editingId = taskToEdit.id;
      taskInput.value = taskToEdit.text;
      prioritySelect.value = taskToEdit.priority;
      submitBtn.textContent = "Update Task";
      cancelBtn.style.display = "inline-block";
      taskInput.focus();
    }
  }
});

// Cancel editing mode
cancelBtn.addEventListener("click", resetForm);

// Initial load
renderTodos();
