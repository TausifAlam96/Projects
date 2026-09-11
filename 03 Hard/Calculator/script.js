// Storage Keys
const STORAGE_KEY_INPUT = "calc_current_input";
const STORAGE_KEY_HISTORY = "calc_history_list";

// State
let expression = "";
let lastResult = "";
let history = [];

// DOM Elements
const currentDisplay = document.getElementById("display-current");
const historyDisplay = document.getElementById("display-history");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");

// Initialize from LocalStorage
function loadFromStorage() {
  const savedInput = localStorage.getItem(STORAGE_KEY_INPUT);
  if (savedInput !== null && savedInput !== "") {
    expression = savedInput;
    updateDisplay();
  }

  const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
  if (savedHistory) {
    try {
      history = JSON.parse(savedHistory);
    } catch (e) {
      history = [];
    }
    renderHistory();
  }
}

// Persist current expression to localStorage
function persistInput() {
  localStorage.setItem(STORAGE_KEY_INPUT, expression);
}

// Persist history list to localStorage
function persistHistory() {
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
}

// Render display values
function updateDisplay() {
  currentDisplay.textContent = expression || "0";
  historyDisplay.textContent = lastResult;
}

// Append character with input normalization
function appendValue(val) {
  const operators = ["+", "-", "*", "/", "%"];

  // Prevent two consecutive operators
  if (operators.includes(val)) {
    if (expression === "" && val !== "-") return; // Allow negative starting numbers only
    const lastChar = expression.slice(-1);
    if (operators.includes(lastChar)) {
      expression = expression.slice(0, -1) + val;
      updateDisplay();
      persistInput();
      return;
    }
  }

  // Prevent multiple decimals in the same number segment
  if (val === ".") {
    const parts = expression.split(/[+\-*/%]/);
    const currentNumber = parts[parts.length - 1];
    if (currentNumber.includes(".")) return;
    if (currentNumber === "") val = "0.";
  }

  // Replace zero if typed at start
  if (expression === "0" && val !== ".") {
    expression = val;
  } else {
    expression += val;
  }

  updateDisplay();
  persistInput();
}

// Delete single character
function deleteLast() {
  expression = expression.slice(0, -1);
  updateDisplay();
  persistInput();
}

// Reset calculator
function clearAll() {
  expression = "";
  lastResult = "";
  updateDisplay();
  persistInput();
}

// Safe evaluation
function calculate() {
  if (!expression) return;

  // Remove trailing operator if user pressed '=' right after an operator
  let sanitized = expression;
  const lastChar = sanitized.slice(-1);
  if (["+", "-", "*", "/", "%"].includes(lastChar)) {
    sanitized = sanitized.slice(0, -1);
  }

  // Validate tokens using strict regular expression
  if (!/^[0-9+\-*/.%() ]+$/.test(sanitized)) {
    currentDisplay.textContent = "Error";
    return;
  }

  try {
    // Evaluate expression safely
    const evalFunc = new Function(`return (${sanitized})`);
    const result = evalFunc();

    if (!isFinite(result)) {
      currentDisplay.textContent = "Cannot divide by 0";
      expression = "";
      persistInput();
      return;
    }

    // Format decimal precision to prevent float artifacts
    const formattedResult = Number(result.toFixed(8)).toString();

    // Add to history
    history.unshift({
      expression: sanitized,
      result: formattedResult,
    });
    if (history.length > 20) history.pop();

    persistHistory();
    renderHistory();

    lastResult = `${sanitized} =`;
    expression = formattedResult;
    updateDisplay();
    persistInput();
  } catch (err) {
    currentDisplay.textContent = "Syntax Error";
  }
}

// Render calculation log
function renderHistory() {
  historyList.innerHTML = "";
  if (history.length === 0) {
    historyList.innerHTML = `<li class="empty-msg">No history yet</li>`;
    return;
  }

  history.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
        <div class="history-expr">${item.expression} =</div>
        <div class="history-res">${item.result}</div>
      `;
    // Clicking a past calculation loads its result back into the calculator
    li.addEventListener("click", () => {
      expression = item.result;
      lastResult = `From history: ${item.expression}`;
      updateDisplay();
      persistInput();
    });
    historyList.appendChild(li);
  });
}

// Keypad clicks
document.querySelector(".keypad").addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  if (btn.dataset.num !== undefined) {
    appendValue(btn.dataset.num);
  } else if (btn.dataset.action) {
    const action = btn.dataset.action;
    switch (action) {
      case "clear":
        clearAll();
        break;
      case "delete":
        deleteLast();
        break;
      case "calculate":
        calculate();
        break;
      default:
        appendValue(action);
    }
  }
});

// Physical Keyboard listener
window.addEventListener("keydown", (e) => {
  if ((e.key >= "0" && e.key <= "9") || e.key === ".") {
    appendValue(e.key);
  } else if (["+", "-", "*", "/", "%"].includes(e.key)) {
    appendValue(e.key);
  } else if (e.key === "Enter" || e.key === "=") {
    e.preventDefault();
    calculate();
  } else if (e.key === "Backspace") {
    deleteLast();
  } else if (e.key === "Escape") {
    clearAll();
  }
});

// Clear history action
clearHistoryBtn.addEventListener("click", () => {
  history = [];
  localStorage.removeItem(STORAGE_KEY_HISTORY);
  renderHistory();
});

// Load state on start
loadFromStorage();
